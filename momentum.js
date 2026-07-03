/**
 * indicators/momentum.js
 * ─────────────────────────────────────────────────────────────
 * Price Momentum and Support/Resistance calculations.
 * Pure functions. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {{ value: number, pct: number }} MomentumResult
 * @typedef {{
 *   support: number, resistance: number, range: number,
 *   posInRange: number, nearSupport: boolean,
 *   nearResistance: boolean, midZone: boolean
 * }} SRResult
 */

/**
 * Calculate price momentum as absolute and percentage change
 * over the given period.
 *
 * @param {number[]} closes
 * @param {number}   period - lookback (default: 10)
 * @returns {MomentumResult|null}
 */
export function calcMomentum(closes, period = 10) {
  if (!closes || closes.length < period + 1) return null;
  const current = closes[closes.length - 1];
  const prev    = closes[closes.length - 1 - period];
  return {
    value: current - prev,
    pct:   prev !== 0 ? ((current - prev) / prev) * 100 : 0,
  };
}

/**
 * Calculate Support and Resistance levels from the most recent candles.
 * Also classifies the current price position within the S/R range.
 *
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @param {number} lookback - number of recent candles to analyse (default: 20)
 * @returns {SRResult}
 */
export function calcSupportResistance(candles, lookback = 20) {
  const recent     = candles.slice(-lookback);
  const support    = Math.min(...recent.map((c) => c.low));
  const resistance = Math.max(...recent.map((c) => c.high));
  const range      = resistance - support;
  const price      = candles[candles.length - 1].close;
  const posInRange = range > 0 ? (price - support) / range : 0.5;

  return {
    support,
    resistance,
    range,
    posInRange,
    nearSupport:    posInRange < 0.25,
    nearResistance: posInRange > 0.75,
    midZone:        posInRange >= 0.25 && posInRange <= 0.75,
  };
}
