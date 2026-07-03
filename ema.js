/**
 * indicators/ema.js
 * ─────────────────────────────────────────────────────────────
 * Exponential and Simple Moving Average calculations.
 * All functions are pure — no side-effects, no state.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Calculate the final EMA value for an array of closes.
 * Uses standard Wilder smoothing factor: k = 2 / (period + 1).
 *
 * @param {number[]} closes
 * @param {number}   period
 * @returns {number|null}
 */
export function calcEMA(closes, period) {
  if (!closes || closes.length < period) return null;
  const k   = 2 / (period + 1);
  let   ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

/**
 * Calculate the full EMA series (same length as closes).
 * Values before the first complete period are null.
 *
 * @param {number[]} closes
 * @param {number}   period
 * @returns {(number|null)[]}
 */
export function calcEMASeries(closes, period) {
  if (!closes || closes.length < period) return closes.map(() => null);
  const k      = 2 / (period + 1);
  const result = new Array(period - 1).fill(null);
  let   ema    = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(ema);
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

/**
 * Calculate the Simple Moving Average (final value only).
 *
 * @param {number[]} closes
 * @param {number}   period
 * @returns {number|null}
 */
export function calcSMA(closes, period) {
  if (!closes || closes.length < period) return null;
  return closes.slice(-period).reduce((a, b) => a + b, 0) / period;
}
