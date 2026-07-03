/**
 * indicators/rsi.js
 * ─────────────────────────────────────────────────────────────
 * Relative Strength Index (RSI) — Wilder smoothing method.
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Calculate RSI using Wilder's smoothing (not simple average).
 * Returns a value in [0, 100], or null if insufficient data.
 *
 * @param {number[]} closes
 * @param {number}   period  - lookback period (default: 14)
 * @returns {number|null}
 */
export function calcRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return null;

  // Build change series
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Use last 2×period changes for Wilder smoothing warm-up
  const relevant = changes.slice(-(period * 2));

  // Seed with simple average over first period
  let avgGain = 0;
  let avgLoss = 0;
  relevant.slice(0, period).forEach((c) => {
    if (c > 0) avgGain += c;
    else       avgLoss += Math.abs(c);
  });
  avgGain /= period;
  avgLoss /= period;

  // Wilder smooth over remaining changes
  for (let i = period; i < relevant.length; i++) {
    const c = relevant[i];
    avgGain = (avgGain * (period - 1) + Math.max(c, 0))            / period;
    avgLoss = (avgLoss * (period - 1) + Math.abs(Math.min(c, 0)))  / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
