/**
 * hooks/useHistory.js
 * ─────────────────────────────────────────────────────────────
 * Manages signal history in memory (last 100 signals).
 * Provides addEntry and clearHistory utilities.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { MAX_HISTORY }           from "../constants/config.js";

/**
 * @typedef {{ symbol: string, signal: string, confidence: number, trend: string, timestamp: number }} HistoryEntry
 */

/**
 * @returns {{
 *   history: HistoryEntry[],
 *   addEntry: (result: import("../strategy/engine").SignalResult) => void,
 *   clearHistory: () => void,
 * }}
 */
export function useHistory() {
  const [history, setHistory] = useState([]);

  const addEntry = useCallback((result) => {
    if (!result) return;
    setHistory((prev) => [
      {
        symbol:     result.symbol,
        signal:     result.signal,
        confidence: result.confidence,
        trend:      result.trend,
        timestamp:  result.timestamp,
      },
      ...prev.slice(0, MAX_HISTORY - 1),
    ]);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addEntry, clearHistory };
}
