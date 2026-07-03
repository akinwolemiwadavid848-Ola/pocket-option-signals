/**
 * constants/config.js
 * ─────────────────────────────────────────────────────────────
 * Application-level configuration.
 * Values prefixed VITE_ are read from environment variables.
 * ─────────────────────────────────────────────────────────────
 */

export const APP_VERSION    = "2.1.0";
export const APP_NAME       = "Pocket Option Signals";
export const APP_TIMEFRAME  = "M1";

/** Auto-refresh interval in milliseconds (default: 60 s) */
export const REFRESH_INTERVAL = Number(
  import.meta.env.VITE_REFRESH_INTERVAL ?? 60_000
);

/** Force demo mode regardless of API key presence */
export const FORCE_DEMO = import.meta.env.VITE_FORCE_DEMO === "true";

/** API key from environment — undefined triggers demo mode */
export const ENV_API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY || "";

/** Maximum history entries kept in memory */
export const MAX_HISTORY = 100;

/** Default favourite pairs shown on first load */
export const DEFAULT_FAVORITES = ["EUR/USD OTC", "USD/JPY OTC", "GOLD OTC"];

/** Risk level definitions */
export const RISK_LEVELS = {
  low:    { label: "LOW",    min: 70, color: "#10b981" },
  medium: { label: "MEDIUM", min: 50, color: "#f59e0b" },
  high:   { label: "HIGH",   min:  0, color: "#ef4444" },
};

/**
 * Returns the risk level object for a given confidence score.
 * @param {number} confidence 0–100
 */
export function getRiskLevel(confidence) {
  if (confidence >= RISK_LEVELS.low.min)    return RISK_LEVELS.low;
  if (confidence >= RISK_LEVELS.medium.min) return RISK_LEVELS.medium;
  return RISK_LEVELS.high;
}
