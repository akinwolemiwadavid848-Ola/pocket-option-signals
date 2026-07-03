/**
 * indicators/stochrsi.js
 * ─────────────────────────────────────────────────────────────
 * Stochastic RSI — applies the Stochastic formula to the RSI line.
 * Oscillates between 0 and 100.
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

import { calcRSI } from "./rsi.js";

/**
 * @typedef {Object} StochRSIResult
 * @property {number}  k          - %K line (smoothed)
 * @property {number}  d          - %D line (= K in this simplified implementation)
 * @property {boolean} overbought - K > 80
 * @property {boolean} oversold   - K < 20
 * @property {boolean} bullish    - K is rising and not overbought
 * @property {boolean} bearish    - K is falling and not oversold
 */

/**
 * Calculate Stochastic RSI.
 *
 * @param {number[]} closes
 * @param {number}   rsiPeriod   - RSI period (default: 14)
 * @param {number}   stochPeriod - Stochastic lookback on RSI series (default: 14)
 * @param {number}   kPeriod     - %K smoothing period (default: 3)
 * @returns {StochRSIResult|null}
 */
export function calcStochRSI(closes, rsiPeriod = 14, stochPeriod = 14, kPeriod = 3) {
  const minLength = rsiPeriod + stochPeriod + kPeriod + 3;
  if (!closes || closes.length < minLength) return null;

  // Build RSI series
  const rsiSeries = [];
  for (let i = rsiPeriod; i <= closes.length; i++) {
    const r = calcRSI(closes.slice(0, i), rsiPeriod);
    if (r !== null) rsiSeries.push(r);
  }

  if (rsiSeries.length < stochPeriod) return null;

  // Apply Stochastic formula to RSI values
  const rawK = [];
  for (let i = stochPeriod - 1; i < rsiSeries.length; i++) {
    const window = rsiSeries.slice(i - stochPeriod + 1, i + 1);
    const low    = Math.min(...window);
    const high   = Math.max(...window);
    rawK.push(
      high === low ? 50 : ((rsiSeries[i] - low) / (high - low)) * 100
    );
  }

  if (rawK.length < kPeriod) return null;

  // Smooth %K
  const kLine = rawK.slice(-kPeriod).reduce((a, b) => a + b, 0) / kPeriod;
  const prevK  = rawK.length >= kPeriod + 1
    ? rawK.slice(-(kPeriod + 1), -1).reduce((a, b) => a + b, 0) / kPeriod
    : kLine;

  return {
    k:          kLine,
    d:          kLine,           // simplified: D = K
    overbought: kLine > 80,
    oversold:   kLine < 20,
    bullish:    kLine > prevK && kLine < 80,
    bearish:    kLine < prevK && kLine > 20,
  };
}
