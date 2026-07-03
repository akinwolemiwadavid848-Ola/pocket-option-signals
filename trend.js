/**
 * strategy/trend.js
 * ─────────────────────────────────────────────────────────────
 * Trend detection using fast and slow EMA alignment.
 * Respects per-pair sideways threshold from the pair's profile.
 *
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {"STRONG_BULLISH"|"BULLISH"|"SIDEWAYS"|"BEARISH"|"STRONG_BEARISH"|"UNKNOWN"} Trend
 */

/**
 * Detect market trend from EMA alignment.
 *
 * Rules:
 *   • |emaFast - emaSlow| / emaSlow < sidewaysThreshold → SIDEWAYS
 *   • All three EMAs aligned upward → STRONG_BULLISH
 *   • All three EMAs aligned downward → STRONG_BEARISH
 *   • Two-EMA cross → BULLISH / BEARISH
 *
 * @param {number|null} emaFast
 * @param {number|null} emaSlow
 * @param {number|null} ema200
 * @param {number}      sidewaysThreshold - from pair profile
 * @returns {Trend}
 */
export function detectTrend(emaFast, emaSlow, ema200, sidewaysThreshold = 0.0005) {
  if (!emaFast || !emaSlow) return "UNKNOWN";

  const sep = Math.abs(emaFast - emaSlow) / emaSlow;
  if (sep < sidewaysThreshold) return "SIDEWAYS";

  if (ema200) {
    if (emaFast > emaSlow && emaSlow > ema200) return "STRONG_BULLISH";
    if (emaFast < emaSlow && emaSlow < ema200) return "STRONG_BEARISH";
  }

  return emaFast > emaSlow ? "BULLISH" : "BEARISH";
}

/**
 * Returns true if the given trend is in any bullish direction.
 * @param {Trend} trend
 * @returns {boolean}
 */
export function isBullish(trend) {
  return trend === "BULLISH" || trend === "STRONG_BULLISH";
}

/**
 * Returns true if the given trend is in any bearish direction.
 * @param {Trend} trend
 * @returns {boolean}
 */
export function isBearish(trend) {
  return trend === "BEARISH" || trend === "STRONG_BEARISH";
}
