/**
 * api/twelvedata.js
 * ─────────────────────────────────────────────────────────────
 * Twelve Data API integration layer.
 *
 * Responsibilities:
 *   • Fetch M1 OHLCV candles for a given symbol
 *   • Handle authentication, timeouts, and error recovery
 *   • Transform API response to the internal Candle format
 *
 * Never import UI or React code here — this is pure data layer.
 * ─────────────────────────────────────────────────────────────
 */

/** @typedef {{ open: number, high: number, low: number, close: number, volume: number, time: number }} Candle */

const API_BASE    = "https://api.twelvedata.com";
const TIMEOUT_MS  = 10_000;
const CANDLE_COUNT = 100;

/**
 * Maps internal OTC symbol names to the format Twelve Data accepts.
 * OTC symbols strip the " OTC" suffix and map GOLD to XAU/USD.
 * @param {string} symbol
 * @returns {string}
 */
function toApiSymbol(symbol) {
  if (symbol === "GOLD OTC") return "XAU/USD";
  return symbol.replace(" OTC", "");
}

/**
 * Fetch M1 candles from Twelve Data for the given symbol.
 *
 * @param {string} apiKey   - Twelve Data API key
 * @param {string} symbol   - Internal OTC symbol (e.g. "EUR/USD OTC")
 * @returns {Promise<{ candles: Candle[], demo: boolean, error?: string }>}
 */
export async function fetchCandles(apiKey, symbol) {
  if (!apiKey || !apiKey.trim()) {
    // No key — caller should use demo mode
    return { candles: [], demo: true };
  }

  const apiSymbol = toApiSymbol(symbol);
  const url = new URL(`${API_BASE}/time_series`);
  url.searchParams.set("symbol",     apiSymbol);
  url.searchParams.set("interval",   "1min");
  url.searchParams.set("outputsize", String(CANDLE_COUNT));
  url.searchParams.set("apikey",     apiKey.trim());

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (data.status === "error" || data.code) {
      throw new Error(data.message || `API error code ${data.code}`);
    }

    if (!Array.isArray(data.values) || data.values.length < 20) {
      throw new Error("Insufficient candle data returned");
    }

    /** @type {Candle[]} */
    const candles = data.values
      .slice()
      .reverse()
      .map((v) => ({
        open:   parseFloat(v.open),
        high:   parseFloat(v.high),
        low:    parseFloat(v.low),
        close:  parseFloat(v.close),
        volume: parseInt(v.volume ?? "0", 10),
        time:   new Date(v.datetime).getTime(),
      }));

    return { candles, demo: false };

  } catch (err) {
    clearTimeout(timer);
    const message = err.name === "AbortError"
      ? "Request timed out after 10 s"
      : err.message;

    console.warn(`[API] ${symbol} (${apiSymbol}): ${message}`);
    return { candles: [], demo: true, error: message };
  }
}
