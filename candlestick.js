/**
 * patterns/candlestick.js
 * ─────────────────────────────────────────────────────────────
 * Candlestick pattern detection.
 * Detects: Doji, Hammer, Shooting Star, Engulfing, Morning/Evening
 * Star, Marubozu.
 *
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {{ name: string, type: "bullish"|"bearish"|"neutral", strength: number }} Pattern
 */

/**
 * Detect candlestick patterns from the last 3 candles.
 *
 * @param {Array<{open:number,high:number,low:number,close:number}>} candles
 * @returns {Pattern[]}
 */
export function detectCandlestickPatterns(candles) {
  if (!candles || candles.length < 3) return [];

  const patterns = [];
  const [c1, c2, c3] = candles.slice(-3);

  const body1  = Math.abs(c1.close - c1.open);
  const body2  = Math.abs(c2.close - c2.open);
  const body3  = Math.abs(c3.close - c3.open);
  const range2 = c2.high - c2.low;
  const range3 = c3.high - c3.low;

  const lowerWick2 = Math.min(c2.open, c2.close) - c2.low;
  const upperWick2 = c2.high - Math.max(c2.open, c2.close);

  // ── Doji ───────────────────────────────────────────────────
  // Body is less than 10% of the full range
  if (range2 > 0 && body2 / range2 < 0.10) {
    patterns.push({ name: "Doji", type: "neutral", strength: 0.40 });
  }

  // ── Hammer ─────────────────────────────────────────────────
  // Long lower wick (≥ 2× body), tiny upper wick — bullish reversal
  if (body2 > 0 && lowerWick2 >= body2 * 2 && upperWick2 <= body2 * 0.5) {
    patterns.push({ name: "Hammer", type: "bullish", strength: 0.60 });
  }

  // ── Shooting Star ──────────────────────────────────────────
  // Long upper wick (≥ 2× body), tiny lower wick — bearish reversal
  if (body2 > 0 && upperWick2 >= body2 * 2 && lowerWick2 <= body2 * 0.5) {
    patterns.push({ name: "Shooting Star", type: "bearish", strength: 0.60 });
  }

  // ── Bearish Engulfing ──────────────────────────────────────
  // Prior candle is bullish; current candle fully engulfs it bearishly
  if (
    c1.close > c1.open &&          // c1 is bullish
    c2.close < c2.open &&          // c2 is bearish
    c2.open  >= c1.close &&
    c2.close <= c1.open
  ) {
    patterns.push({ name: "Bearish Engulfing", type: "bearish", strength: 0.75 });
  }

  // ── Bullish Engulfing ──────────────────────────────────────
  // Prior candle is bearish; current candle fully engulfs it bullishly
  if (
    c1.close < c1.open &&          // c1 is bearish
    c2.close > c2.open &&          // c2 is bullish
    c2.open  <= c1.close &&
    c2.close >= c1.open
  ) {
    patterns.push({ name: "Bullish Engulfing", type: "bullish", strength: 0.75 });
  }

  // ── Morning Star (3-candle bullish reversal) ───────────────
  if (
    c1.close < c1.open &&           // c1 bearish
    body2 < body1 * 0.30 &&         // c2 small body (indecision)
    c3.close > c3.open &&           // c3 bullish
    c3.close > (c1.open + c1.close) / 2
  ) {
    patterns.push({ name: "Morning Star", type: "bullish", strength: 0.85 });
  }

  // ── Evening Star (3-candle bearish reversal) ───────────────
  if (
    c1.close > c1.open &&           // c1 bullish
    body2 < body1 * 0.30 &&         // c2 small body (indecision)
    c3.close < c3.open &&           // c3 bearish
    c3.close < (c1.open + c1.close) / 2
  ) {
    patterns.push({ name: "Evening Star", type: "bearish", strength: 0.85 });
  }

  // ── Marubozu ───────────────────────────────────────────────
  // Very large body relative to range — strong momentum candle
  if (range3 > 0 && body3 / range3 > 0.90) {
    patterns.push({
      name:     "Marubozu",
      type:     c3.close > c3.open ? "bullish" : "bearish",
      strength: 0.70,
    });
  }

  return patterns;
}
