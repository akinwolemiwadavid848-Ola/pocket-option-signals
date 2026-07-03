/**
 * indicators/adx.js
 * ─────────────────────────────────────────────────────────────
 * ADX — Average Directional Index with +DI and -DI.
 * Measures trend strength (not direction).
 * Pure function. No side-effects.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} ADXResult
 * @property {number}  adx      - ADX value (0–100, higher = stronger trend)
 * @property {number}  diPlus   - +DI (bullish directional indicator)
 * @property {number}  diMinus  - -DI (bearish directional indicator)
 * @property {boolean} trending - true when ADX >= adxThreshold passed by caller
 */

/**
 * Calculate ADX, +DI, and -DI.
 *
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @param {number} period - lookback period (default: 14)
 * @returns {ADXResult|null}
 */
export function calcADX(candles, period = 14) {
  if (!candles || candles.length < period * 2) return null;

  const dms = [];
  for (let i = 1; i < candles.length; i++) {
    const upMove   = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;
    const dmPlus   = upMove > downMove && upMove > 0 ? upMove : 0;
    const dmMinus  = downMove > upMove && downMove > 0 ? downMove : 0;
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low  - candles[i - 1].close)
    );
    dms.push({ dmPlus, dmMinus, tr });
  }

  const recent = dms.slice(-period);
  const atr    = recent.reduce((a, b) => a + b.tr, 0) / period;
  if (atr === 0) return null;

  const diPlus  = (recent.reduce((a, b) => a + b.dmPlus,  0) / period / atr) * 100;
  const diMinus = (recent.reduce((a, b) => a + b.dmMinus, 0) / period / atr) * 100;
  const dxDenom = diPlus + diMinus;
  const dx      = dxDenom > 0 ? (Math.abs(diPlus - diMinus) / dxDenom) * 100 : 0;

  return { adx: dx, diPlus, diMinus };
}
