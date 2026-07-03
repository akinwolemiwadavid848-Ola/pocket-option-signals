/**
 * hooks/useCountdown.js
 * ─────────────────────────────────────────────────────────────
 * Simple countdown timer that ticks every second.
 * Resets when the seed value changes.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";

/**
 * @param {number} initial - initial seconds
 * @returns {number} - current remaining seconds
 */
export function useCountdown(initial) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    setSeconds(initial);
    const iv = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1_000);
    return () => clearInterval(iv);
  }, [initial]);

  return seconds;
}
