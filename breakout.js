/**
 * patterns/breakout.js
 * ─────────────────────────────────────────────────────────────
 * Breakout and false-breakout detection.
 * Compares recent range against prior range and uses volume
 * confirmation where available.
 *
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {{
 *   type: "bullish_breakout"|"bearish_breakout"|
 *         "false_bullish_breakout"|"false_bearish_breakout",
 *   strength: number
 * }|null} BreakoutResult
 */

/**
 * Detect price breakouts and false breakouts.
 *
 * Method:
 *   • "prior range" = the 5 candles ending 5 bars ago
 *   • "recent range" = the last 5 candles
 *   • A breakout occurs when the last close is outside the prior range
 *   • Volume spike (>1.3× average) confirms real breakout
 *   • A false breakout is when a candle wick poked outside the prior
 *     range but the close is back inside
 *
 * @param {Array<{high:number,low:number,close:number,volume:number}>} candles
 * @returns {BreakoutResult}
 */
export function detectBreakout(candles) {
  if (!candles || candles.length < 15) return null;

  const recent    = candles.slice(-5);
  const prior     = candles.slice(-10, -5);
  const priorHigh = Math.max(...prior.map((c) => c.high));
  const priorLow  = Math.min(...prior.map((c) => c.low));
  const lastClose = recent[recent.length - 1].close;
  const lastVol   = recent[recent.length - 1].volume;
  const avgVol    = recent.slice(0, 4).reduce((a, c) => a + c.volume, 0) / 4;
  const volConfirm = avgVol > 0 ? lastVol / avgVol > 1.3 : true;

  // True bullish breakout
  if (lastClose > priorHigh) {
    return {
      type:     "bullish_breakout",
      strength: volConfirm ? 0.85 : 0.55,
    };
  }

  // True bearish breakout
  if (lastClose < priorLow) {
    return {
      type:     "bearish_breakout",
      strength: volConfirm ? 0.85 : 0.55,
    };
  }

  // False bullish breakout — wick above prior high but close back inside
  if (recent.some((c) => c.high > priorHigh) && lastClose <= priorHigh) {
    return { type: "false_bullish_breakout", strength: 0.60 };
  }

  // False bearish breakout — wick below prior low but close back inside
  if (recent.some((c) => c.low < priorLow) && lastClose >= priorLow) {
    return { type: "false_bearish_breakout", strength: 0.60 };
  }

  return null;
}
