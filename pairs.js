/**
 * constants/pairs.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all supported OTC trading pairs.
 * To add or remove a pair, edit ONLY this file.
 * ─────────────────────────────────────────────────────────────
 */

/** @type {Array<{symbol: string, category: string, flag: string}>} */
export const CURRENCY_PAIRS = [
  { symbol: "AUD/CAD OTC", category: "otc", flag: "🇦🇺🇨🇦" },
  { symbol: "AUD/USD OTC", category: "otc", flag: "🇦🇺🇺🇸" },
  { symbol: "EUR/USD OTC", category: "otc", flag: "🇪🇺🇺🇸" },
  { symbol: "GBP/JPY OTC", category: "otc", flag: "🇬🇧🇯🇵" },
  { symbol: "USD/CAD OTC", category: "otc", flag: "🇺🇸🇨🇦" },
  { symbol: "USD/JPY OTC", category: "otc", flag: "🇺🇸🇯🇵" },
  { symbol: "GOLD OTC",    category: "otc", flag: "🥇"       },
];

/**
 * Realistic base prices for demo/simulation mode.
 * Updated periodically — not used in live mode.
 * @type {Record<string, number>}
 */
export const BASE_PRICES = {
  "AUD/CAD OTC": 0.8920,
  "AUD/USD OTC": 0.6548,
  "EUR/USD OTC": 1.0845,
  "GBP/JPY OTC": 189.72,
  "USD/CAD OTC": 1.3612,
  "USD/JPY OTC": 149.85,
  "GOLD OTC":    2328.50,
};

/**
 * Per-pair volatility values used to generate realistic demo candles.
 * JPY pairs and Gold use larger absolute values (different pip scale).
 * @type {Record<string, number>}
 */
export const VOLATILITY = {
  "AUD/CAD OTC": 0.0008,
  "AUD/USD OTC": 0.0007,
  "EUR/USD OTC": 0.0006,
  "GBP/JPY OTC": 0.12,
  "USD/CAD OTC": 0.0007,
  "USD/JPY OTC": 0.08,
  "GOLD OTC":    1.8,
};

/**
 * Decimal places to use when displaying prices.
 * Default (unlisted) → 5 decimal places.
 * @type {Record<string, number>}
 */
export const DECIMALS = {
  "GBP/JPY OTC": 3,
  "USD/JPY OTC": 3,
  "GOLD OTC":    2,
};

/**
 * Returns the number of decimal places for a given symbol.
 * @param {string} symbol
 * @returns {number}
 */
export function getDecimals(symbol) {
  return DECIMALS[symbol] ?? 5;
}

/**
 * Returns the display flag emoji for a given symbol.
 * @param {string} symbol
 * @returns {string}
 */
export function getFlag(symbol) {
  return CURRENCY_PAIRS.find((p) => p.symbol === symbol)?.flag ?? "💱";
}

export default CURRENCY_PAIRS;
