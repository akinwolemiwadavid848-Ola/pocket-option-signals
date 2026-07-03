/**
 * api/index.js
 * ─────────────────────────────────────────────────────────────
 * Unified candle data access layer.
 *
 * Orchestrates between live (Twelve Data) and demo mode:
 *   1. If no API key → demo mode immediately
 *   2. If API call succeeds → live mode
 *   3. If API call fails → transparent fallback to demo
 *
 * Callers never need to know which mode is active.
 * ─────────────────────────────────────────────────────────────
 */

import { fetchCandles as fetchLive } from "./twelvedata.js";
import { generateDemoCandles }       from "./demo.js";
import { FORCE_DEMO }                from "../constants/config.js";

/**
 * @typedef {{ open: number, high: number, low: number, close: number, volume: number, time: number }} Candle
 * @typedef {{ candles: Candle[], demo: boolean, error?: string }} FetchResult
 */

/**
 * Fetch M1 candles for a symbol, with automatic demo fallback.
 *
 * @param {string} apiKey   - Twelve Data API key (empty string → demo)
 * @param {string} symbol   - OTC pair symbol (e.g. "EUR/USD OTC")
 * @returns {Promise<FetchResult>}
 */
export async function fetchCandles(apiKey, symbol) {
  // Force demo mode if configured or no key
  if (FORCE_DEMO || !apiKey || !apiKey.trim()) {
    return { candles: generateDemoCandles(symbol), demo: true };
  }

  // Attempt live data
  const result = await fetchLive(apiKey, symbol);

  // If live data is empty (error), fall back to demo
  if (!result.candles || result.candles.length < 20) {
    const fallbackCandles = generateDemoCandles(symbol);
    return { candles: fallbackCandles, demo: true, error: result.error };
  }

  return result;
}

export { generateDemoCandles } from "./demo.js";
