/**
 * indicators/macd.js
 * ─────────────────────────────────────────────────────────────
 * MACD — Moving Average Convergence Divergence.
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

import { calcEMASeries } from "./ema.js";

/**
 * @typedef {Object} MACDResult
 * @property {number}  macd      - MACD line value
 * @property {number}  signal    - Signal line value
 * @property {number}  histogram - Histogram (MACD − Signal)
 * @property {boolean} bullish   - MACD line is above signal line
 * @property {boolean} crossover - Bullish crossover on this candle
 * @property {boolean} crossunder - Bearish crossunder on this candle
 */

/**
 * Calculate MACD using configurable fast, slow, and signal periods.
 *
 * @param {number[]} closes
 * @param {number}   fast    - Fast EMA period (default: 12)
 * @param {number}   slow    - Slow EMA period (default: 26)
 * @param {number}   signal  - Signal EMA period (default: 9)
 * @returns {MACDResult|null}
 */
export function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  if (!closes || closes.length < slow + signal) return null;

  const emaFastSeries = calcEMASeries(closes, fast);
  const emaSlowSeries = calcEMASeries(closes, slow);

  // Build MACD line only where both EMAs are defined
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (emaFastSeries[i] !== null && emaSlowSeries[i] !== null) {
      macdLine.push(emaFastSeries[i] - emaSlowSeries[i]);
    }
  }

  if (macdLine.length < signal) return null;

  const signalSeries = calcEMASeries(macdLine, signal);
  const lastMacd     = macdLine[macdLine.length - 1];
  const lastSignal   = signalSeries[signalSeries.length - 1];
  const prevMacd     = macdLine[macdLine.length - 2];
  const prevSignal   = signalSeries[signalSeries.length - 2];

  if (lastSignal === null || prevSignal === null) return null;

  return {
    macd:       lastMacd,
    signal:     lastSignal,
    histogram:  lastMacd - lastSignal,
    bullish:    lastMacd > lastSignal,
    crossover:  prevMacd !== null && prevMacd < prevSignal && lastMacd > lastSignal,
    crossunder: prevMacd !== null && prevMacd > prevSignal && lastMacd < lastSignal,
  };
}
