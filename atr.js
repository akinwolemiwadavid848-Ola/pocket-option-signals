/**
 * indicators/atr.js
 * ─────────────────────────────────────────────────────────────
 * ATR — Average True Range (volatility measurement).
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Calculate the Average True Range.
 *
 * True Range = max(H-L, |H-PrevC|, |L-PrevC|)
 * ATR = simple average of last `period` true ranges.
 *
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @param {number} period - lookback period (default: 14)
 * @returns {number|null}
 */
export function calcATR(candles, period = 14) {
  if (!candles || candles.length < period + 1) return null;

  const trs = [];
  for (let i = 1; i < candles.length; i++) {
    const hl  = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low  - candles[i - 1].close);
    trs.push(Math.max(hl, hpc, lpc));
  }

  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}
