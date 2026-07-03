/**
 * indicators/bollinger.js
 * ─────────────────────────────────────────────────────────────
 * Bollinger Bands — SMA ± (stdDev × multiplier).
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} BollingerResult
 * @property {number} upper     - Upper band
 * @property {number} middle    - Middle band (SMA)
 * @property {number} lower     - Lower band
 * @property {number} bandwidth - Band width relative to middle ((upper-lower)/middle)
 * @property {number} pctB      - %B: where price sits within bands (0=lower, 1=upper)
 * @property {number} std       - Standard deviation value
 */

/**
 * Calculate Bollinger Bands.
 *
 * @param {number[]} closes
 * @param {number}   period    - SMA period (default: 20)
 * @param {number}   multiplier - StdDev multiplier (default: 2)
 * @returns {BollingerResult|null}
 */
export function calcBollingerBands(closes, period = 20, multiplier = 2) {
  if (!closes || closes.length < period) return null;

  const recent    = closes.slice(-period);
  const sma       = recent.reduce((a, b) => a + b, 0) / period;
  const variance  = recent.reduce((acc, v) => acc + Math.pow(v - sma, 2), 0) / period;
  const std       = Math.sqrt(variance);
  const upper     = sma + multiplier * std;
  const lower     = sma - multiplier * std;
  const price     = closes[closes.length - 1];
  const bandwidth = upper !== lower ? (upper - lower) / sma : 0;
  const pctB      = upper !== lower ? (price - lower) / (upper - lower) : 0.5;

  return { upper, middle: sma, lower, bandwidth, pctB, std };
}
