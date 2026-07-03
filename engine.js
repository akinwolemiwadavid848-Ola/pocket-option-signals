/**
 * strategy/engine.js
 * ─────────────────────────────────────────────────────────────
 * Main signal generation engine.
 *
 * Orchestrates:
 *   1. Load per-pair indicator profile
 *   2. Compute all indicators with profile parameters
 *   3. Run confluence scoring
 *   4. Determine CALL / PUT / WAIT
 *   5. Score confidence (0–95)
 *   6. Return fully-typed SignalResult
 *
 * Pure function. No side-effects. No React imports.
 * ─────────────────────────────────────────────────────────────
 */

import { getProfile }              from "../constants/profiles.js";
import { getRiskLevel, REFRESH_INTERVAL } from "../constants/config.js";
import {
  calcEMA, calcSMA, calcRSI, calcMACD,
  calcBollingerBands, calcATR, calcADX,
  calcStochRSI, calcMomentum, calcSupportResistance,
} from "../indicators/index.js";
import { detectCandlestickPatterns } from "../patterns/candlestick.js";
import { detectBreakout }            from "../patterns/breakout.js";
import { detectTrend }               from "./trend.js";
import { calcConfluenceScore }       from "./confluence.js";
import { clamp }                     from "../utils/math.js";

/**
 * @typedef {Object} SignalResult
 * @property {string}  symbol
 * @property {number}  price
 * @property {"CALL"|"PUT"|"WAIT"} signal
 * @property {number}  confidence     - 0–95
 * @property {string}  strength       - "VERY WEAK" … "VERY STRONG"
 * @property {string}  trend          - detectTrend() output
 * @property {Object}  risk           - { label, color }
 * @property {string}  volatility     - "LOW" | "NORMAL" | "HIGH"
 * @property {string}  profileLabel   - human-readable profile summary
 * @property {Object}  indicators     - all computed indicator values for display
 * @property {Array}   patterns       - detected candlestick patterns
 * @property {Object|null} breakout   - breakout detection result
 * @property {number}  bullScore      - raw bull score × 100 (for display)
 * @property {number}  bearScore      - raw bear score × 100 (for display)
 * @property {number}  timestamp      - Unix ms when generated
 * @property {number}  nextUpdate     - Unix ms when next refresh is due
 */

/**
 * Generate a complete signal result for a symbol from its candle data.
 *
 * @param {import("../api/index").Candle[]} candles
 * @param {string} symbol - OTC pair symbol
 * @returns {SignalResult|null} null if insufficient data
 */
export function generateSignalResult(candles, symbol) {
  if (!candles || candles.length < 30) return null;

  // ── 1. Load profile ───────────────────────────────────────────
  const profile = getProfile(symbol);
  const [emaPeriodFast, emaPeriodSlow] = profile.emaPeriods;
  const [macdFast, macdSlow, macdSig]  = profile.macdParams;

  const closes = candles.map((c) => c.close);
  const price  = closes[closes.length - 1];

  // ── 2. Compute all indicators ─────────────────────────────────
  const emaFast  = calcEMA(closes, emaPeriodFast);
  const emaSlow  = calcEMA(closes, emaPeriodSlow);
  const ema200   = calcEMA(closes, Math.min(closes.length - 1, 100));
  const rsi      = calcRSI(closes, profile.rsiPeriod);
  const macd     = calcMACD(closes, macdFast, macdSlow, macdSig);
  const bb       = calcBollingerBands(closes, profile.bbPeriod, 2);
  const atr      = calcATR(candles, 14);
  const adx      = calcADX(candles, 14);
  const stochRsi = calcStochRSI(closes, profile.rsiPeriod, 14, 3);
  const momentum = calcMomentum(closes, 10);
  const sr       = calcSupportResistance(candles, profile.srLookback);
  const patterns = detectCandlestickPatterns(candles);
  const breakout = detectBreakout(candles);
  const sma20    = calcSMA(closes, 20);
  const sma50    = calcSMA(closes, 50);

  // ── 3. Detect trend ───────────────────────────────────────────
  const trend = detectTrend(emaFast, emaSlow, ema200, profile.sidewaysThreshold);

  // ── 4. Confluence scoring ─────────────────────────────────────
  const indicatorBundle = {
    emaFast, emaSlow, rsi, macd, bb, stochRsi,
    adx, sr, patterns, breakout, price,
  };
  const { bullScore, bearScore, net } = calcConfluenceScore(indicatorBundle, profile);

  // ── 5. Signal and confidence ──────────────────────────────────
  const isSideways   = trend === "SIDEWAYS" || trend === "UNKNOWN";
  const weakMomentum = rsi !== null && rsi >= 46 && rsi <= 54;

  let signal       = "WAIT";
  let rawConfidence = 50;

  if (!isSideways && Math.abs(net) > 0.15) {
    if (net > 0) { signal = "CALL"; rawConfidence = 50 + net * 100; }
    else         { signal = "PUT";  rawConfidence = 50 + Math.abs(net) * 100; }
  }

  if (isSideways || weakMomentum) rawConfidence -= 15;

  const confidence = Math.round(clamp(rawConfidence, 10, 95));
  const risk       = getRiskLevel(confidence);

  // ── 6. Labels ─────────────────────────────────────────────────
  let strength = "VERY WEAK";
  if      (confidence >= 80) strength = "VERY STRONG";
  else if (confidence >= 70) strength = "STRONG";
  else if (confidence >= 58) strength = "MODERATE";
  else if (confidence >= 45) strength = "WEAK";

  let volatilityLabel = "NORMAL";
  if (atr) {
    const pct = (atr / price) * 100;
    if      (pct > 0.15) volatilityLabel = "HIGH";
    else if (pct < 0.05) volatilityLabel = "LOW";
  }

  return {
    symbol,
    price,
    signal,
    confidence,
    strength,
    trend,
    risk,
    volatility:   volatilityLabel,
    profileLabel: `EMA${emaPeriodFast}/${emaPeriodSlow} · RSI${profile.rsiPeriod} · BB${profile.bbPeriod}`,
    indicators: {
      ema20:    emaFast,   // display alias
      ema50:    emaSlow,   // display alias
      ema200,
      rsi,
      sma20,
      sma50,
      macd:     macd
        ? { value: macd.macd, signal: macd.signal, histogram: macd.histogram, bullish: macd.bullish }
        : null,
      bb:       bb
        ? { upper: bb.upper, middle: bb.middle, lower: bb.lower, bandwidth: bb.bandwidth, pctB: bb.pctB }
        : null,
      adx:      adx
        ? { value: adx.adx, diPlus: adx.diPlus, diMinus: adx.diMinus }
        : null,
      stochRsi: stochRsi ? { k: stochRsi.k, d: stochRsi.d } : null,
      atr,
      momentum: momentum ? momentum.pct : null,
      support:  sr?.support,
      resistance: sr?.resistance,
    },
    patterns,
    breakout,
    bullScore: Math.round(bullScore * 100),
    bearScore: Math.round(bearScore * 100),
    timestamp:  Date.now(),
    nextUpdate: Date.now() + REFRESH_INTERVAL,
  };
}
