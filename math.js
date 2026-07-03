/**
 * utils/math.js
 * ─────────────────────────────────────────────────────────────
 * Pure mathematical utility functions.
 * No side-effects. Used by indicators and strategy modules.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Clamp a value between min and max (inclusive).
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Linear interpolation between a and b at position t (0–1).
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Deterministic seeded pseudo-random number generator.
 * Returns a function that generates numbers in [0, 1).
 * Uses LCG (linear congruential generator) — fast and deterministic.
 * @param {number} seed
 * @returns {() => number}
 */
export function seededRand(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Compute the mean of an array of numbers.
 * @param {number[]} arr
 * @returns {number}
 */
export function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Compute the standard deviation (population) of an array.
 * @param {number[]} arr
 * @returns {number}
 */
export function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / arr.length);
}

/**
 * Round to a fixed number of decimal places.
 * @param {number} val
 * @param {number} decimals
 * @returns {number}
 */
export function round(val, decimals = 4) {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}
