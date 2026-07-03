/**
 * utils/format.js
 * ─────────────────────────────────────────────────────────────
 * Pure formatting utility functions.
 * No side-effects. No imports from the rest of the app.
 * ─────────────────────────────────────────────────────────────
 */

import { getDecimals } from "../constants/pairs.js";

/**
 * Format a price value with the correct number of decimal places
 * for the given trading pair symbol.
 * @param {string} symbol
 * @param {number|null|undefined} val
 * @returns {string}
 */
export function formatPrice(symbol, val) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return Number(val).toFixed(getDecimals(symbol));
}

/**
 * Format a number to a fixed number of decimal places.
 * Returns "—" for null/undefined/NaN.
 * @param {number|null|undefined} val
 * @param {number} decimals
 * @returns {string}
 */
export function formatNum(val, decimals = 4) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return Number(val).toFixed(decimals);
}

/**
 * Format a Unix timestamp (ms) into HH:MM:SS locale string.
 * @param {number} ms
 * @returns {string}
 */
export function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a duration in seconds as MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Format a percentage number (0–100) to one decimal place.
 * @param {number} val
 * @returns {string}
 */
export function formatPct(val) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return `${Number(val).toFixed(1)}%`;
}
