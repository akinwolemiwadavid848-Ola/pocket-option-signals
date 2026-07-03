/**
 * hooks/useSignal.js
 * ─────────────────────────────────────────────────────────────
 * Core hook — manages data fetching, analysis, and auto-refresh
 * for a single selected trading pair.
 *
 * Returns the current signal result, loading state, demo flag,
 * raw candles, and imperative refresh function.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCandles }          from "../api/index.js";
import { generateSignalResult }  from "../strategy/engine.js";
import { REFRESH_INTERVAL }      from "../constants/config.js";

/**
 * @param {string|null} symbol    - currently selected OTC pair
 * @param {string}      apiKey    - Twelve Data API key (empty = demo)
 * @param {boolean}     autoRefresh - whether to auto-refresh every 60 s
 * @returns {{
 *   result: import("../strategy/engine").SignalResult|null,
 *   candles: import("../api/index").Candle[],
 *   loading: boolean,
 *   demoMode: boolean,
 *   error: string|null,
 *   refresh: ()=>Promise<void>,
 *   countdown: number,
 * }}
 */
export function useSignal(symbol, apiKey, autoRefresh = true) {
  const [result,    setResult]    = useState(null);
  const [candles,   setCandles]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [demoMode,  setDemoMode]  = useState(true);
  const [error,     setError]     = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const refreshRef  = useRef(null);
  const countRef    = useRef(null);
  const symbolRef   = useRef(symbol);
  symbolRef.current = symbol;

  const analyze = useCallback(async (sym, key) => {
    if (!sym) return;
    setLoading(true);
    setError(null);

    const { candles: newCandles, demo, error: fetchError } =
      await fetchCandles(key, sym);

    // Guard against stale symbol
    if (symbolRef.current !== sym) return;

    setCandles(newCandles);
    setDemoMode(demo);
    if (fetchError) setError(fetchError);

    const signalResult = generateSignalResult(newCandles, sym);
    setResult(signalResult);
    setLoading(false);
    setCountdown(REFRESH_INTERVAL / 1000);
  }, []);

  // Re-analyze when symbol or apiKey changes
  useEffect(() => {
    if (!symbol) {
      setResult(null);
      setCandles([]);
      return;
    }
    setResult(null);
    analyze(symbol, apiKey);

    // Clear previous intervals
    clearInterval(refreshRef.current);
    clearInterval(countRef.current);

    // Auto-refresh timer
    if (autoRefresh) {
      refreshRef.current = setInterval(() => {
        analyze(symbolRef.current, apiKey);
      }, REFRESH_INTERVAL);
    }

    // Countdown timer
    setCountdown(REFRESH_INTERVAL / 1000);
    countRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1_000);

    return () => {
      clearInterval(refreshRef.current);
      clearInterval(countRef.current);
    };
  }, [symbol, apiKey, autoRefresh, analyze]);

  const refresh = useCallback(() => {
    if (symbol) {
      setCountdown(REFRESH_INTERVAL / 1000);
      return analyze(symbol, apiKey);
    }
    return Promise.resolve();
  }, [symbol, apiKey, analyze]);

  return { result, candles, loading, demoMode, error, refresh, countdown };
}
