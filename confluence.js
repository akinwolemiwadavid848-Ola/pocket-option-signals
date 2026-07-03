/**
 * strategy/confluence.js
 * ─────────────────────────────────────────────────────────────
 * Multi-indicator confluence scoring engine.
 *
 * Each active indicator casts a weighted directional vote
 * (bull or bear). The net score drives signal generation.
 *
 * Design:
 *   • All weights come from the pair's PairProfile — never hardcoded
 *   • Pattern and breakout signals are bonus contributions (capped)
 *   • The result is a normalised net score in [-1, +1]
 *
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} ConfluenceResult
 * @property {number} bullScore   - Raw weighted bull score
 * @property {number} bearScore   - Raw weighted bear score
 * @property {number} net         - Normalised net: (bull-bear)/totalWeight ∈ [-1,1]
 * @property {number} totalWeight - Sum of active indicator weights
 */

/**
 * Calculate the multi-indicator confluence score.
 *
 * @param {Object} indicators - Computed indicator values
 * @param {import("../constants/profiles").PairProfile} profile - Pair profile
 * @returns {ConfluenceResult}
 */
export function calcConfluenceScore(indicators, profile) {
  const {
    emaFast, emaSlow, rsi, macd, bb, stochRsi,
    adx, sr, patterns, breakout,
  } = indicators;
  const w = profile.weights;

  let bullScore   = 0;
  let bearScore   = 0;
  let totalWeight = 0;

  // ── EMA Cross ────────────────────────────────────────────────
  if (emaFast && emaSlow) {
    const weight = w.ema_cross;
    totalWeight += weight;
    const sep = Math.abs(emaFast - emaSlow) / emaSlow;
    if (sep >= profile.sidewaysThreshold) {
      if (emaFast > emaSlow) bullScore += weight;
      else                   bearScore += weight;
    }
    // Contribution scales with EMA separation strength (bonus up to 20%)
    const bonus = Math.min(sep / profile.sidewaysThreshold - 1, 1) * weight * 0.2;
    if (emaFast > emaSlow && bonus > 0) bullScore += bonus;
    else if (bonus > 0)                 bearScore += bonus;
  }

  // ── RSI ──────────────────────────────────────────────────────
  if (rsi !== null) {
    const weight = w.rsi;
    totalWeight += weight;
    if      (rsi > 50 && rsi < 70) bullScore += weight * ((rsi - 50) / 20);
    else if (rsi < 50 && rsi > 30) bearScore += weight * ((50 - rsi) / 20);
    else if (rsi <= 30)             bullScore += weight * 0.85; // deep oversold
    else if (rsi >= 70)             bearScore += weight * 0.85; // deep overbought
  }

  // ── MACD ─────────────────────────────────────────────────────
  if (macd) {
    const weight = w.macd;
    totalWeight += weight;
    if (macd.bullish) bullScore += weight * (macd.crossover  ? 1.0 : 0.65);
    else              bearScore += weight * (macd.crossunder ? 1.0 : 0.65);
  }

  // ── Bollinger Bands ──────────────────────────────────────────
  if (bb) {
    const weight = w.bollinger;
    totalWeight += weight;
    if      (bb.pctB < 0.20) bullScore += weight * 0.75;
    else if (bb.pctB > 0.80) bearScore += weight * 0.75;
    else if (bb.pctB > 0.50) bullScore += weight * 0.30;
    else                      bearScore += weight * 0.30;
  }

  // ── Stochastic RSI ───────────────────────────────────────────
  if (stochRsi) {
    const weight = w.stoch_rsi;
    totalWeight += weight;
    if (stochRsi.bullish || stochRsi.oversold)        bullScore += weight;
    else if (stochRsi.bearish || stochRsi.overbought) bearScore += weight;
  }

  // ── ADX ──────────────────────────────────────────────────────
  // Only contributes when ADX meets the pair's threshold
  if (adx && adx.adx >= profile.adxThreshold) {
    const weight = w.adx;
    totalWeight += weight;
    if (adx.diPlus > adx.diMinus) bullScore += weight;
    else                           bearScore += weight;
  }

  // ── Support / Resistance ─────────────────────────────────────
  if (sr) {
    const weight = w.support_resistance;
    totalWeight += weight;
    if      (sr.nearSupport)     bullScore += weight;
    else if (sr.nearResistance)  bearScore += weight;
  }

  // ── Candlestick Pattern Bonus ─────────────────────────────────
  // Capped bonus contribution — patterns reinforce but don't override
  if (Array.isArray(patterns)) {
    patterns.forEach((p) => {
      if      (p.type === "bullish") bullScore += p.strength * 0.04;
      else if (p.type === "bearish") bearScore += p.strength * 0.04;
    });
  }

  // ── Breakout Bonus ────────────────────────────────────────────
  if (breakout) {
    if      (breakout.type === "bullish_breakout")       bullScore += breakout.strength * 0.05;
    else if (breakout.type === "bearish_breakout")       bearScore += breakout.strength * 0.05;
    else if (breakout.type === "false_bullish_breakout") bearScore += 0.04;
    else if (breakout.type === "false_bearish_breakout") bullScore += 0.04;
  }

  const net = totalWeight > 0 ? (bullScore - bearScore) / totalWeight : 0;
  return { bullScore, bearScore, net, totalWeight };
}
