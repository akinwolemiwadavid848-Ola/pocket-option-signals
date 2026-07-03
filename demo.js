/**
 * api/demo.js
 * ─────────────────────────────────────────────────────────────
 * Deterministic demo candle generator.
 *
 * Produces realistic OHLCV M1 candle series without any network
 * requests. Data is seeded so it remains consistent within a
 * 30-second window, then rotates to simulate live updates.
 *
 * Used when:
 *   • No API key is configured
 *   • The live API call fails
 *   • VITE_FORCE_DEMO=true
 * ─────────────────────────────────────────────────────────────
 */

import { BASE_PRICES, VOLATILITY } from "../constants/pairs.js";
import { seededRand } from "../utils/math.js";

/** @typedef {{ open: number, high: number, low: number, close: number, volume: number, time: number }} Candle */

/**
 * Converts a symbol string to a deterministic numeric seed.
 * @param {string} symbol
 * @returns {number}
 */
function symbolSeed(symbol) {
  return symbol.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 0);
}

/**
 * Generate a series of deterministic M1 demo candles for a symbol.
 *
 * The series uses:
 *   • A slowly drifting trend bias (changes every 15 candles)
 *   • Gaussian-ish noise built from two uniform draws (CLT approximation)
 *   • Realistic wicks and tails
 *   • Volume scaled to be plausible for the pair
 *
 * The seed rotates every 30 seconds so the dashboard appears to
 * update with slightly different data on each refresh.
 *
 * @param {string} symbol   - OTC symbol
 * @param {number} [count]  - Number of candles to generate (default: 100)
 * @returns {Candle[]}
 */
export function generateDemoCandles(symbol, count = 100) {
  const base   = BASE_PRICES[symbol] ?? 1.0;
  const vol    = VOLATILITY[symbol]  ?? 0.001;
  const timeSeed = Math.floor(Date.now() / 30_000); // rotates every 30 s
  const rand   = seededRand(symbolSeed(symbol) + timeSeed);

  const candles = [];
  let price = base;
  let trendBias = (rand() - 0.49) * vol * 0.5;

  for (let i = 0; i < count; i++) {
    // Slowly evolve the trend direction
    if (i % 15 === 0) {
      trendBias = (rand() - 0.49) * vol * 0.5;
    }

    // Two-uniform CLT approximation for Gaussian noise
    const noise = ((rand() + rand()) / 2 - 0.5) * vol * 2.2;
    const change = trendBias + noise;

    const open  = price;
    const close = price + change;
    const wick  = rand() * vol * 0.65;
    const tail  = rand() * vol * 0.55;
    const high  = Math.max(open, close) + wick;
    const low   = Math.min(open, close) - tail;

    candles.push({
      open:   +open.toFixed(8),
      high:   +high.toFixed(8),
      low:    +low.toFixed(8),
      close:  +close.toFixed(8),
      volume: Math.floor(rand() * 5000 + 300),
      time:   Date.now() - (count - i) * 60_000,
    });

    price = close;
  }

  return candles;
}
