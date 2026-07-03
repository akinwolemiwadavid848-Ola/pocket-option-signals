/**
 * constants/profiles.js
 * ─────────────────────────────────────────────────────────────
 * Per-pair technical indicator profiles.
 *
 * Each pair has its own optimized configuration based on its
 * characteristic volatility, trending behaviour, and M1 dynamics.
 *
 * HOW TO TUNE:
 *   • Adjust weights[] to change how much each indicator contributes.
 *   • Weights across a profile must sum to exactly 1.0.
 *   • Adjust emaPeriods, rsiPeriod, macdParams, bbPeriod for the
 *     indicator calculation parameters.
 *   • sidewaysThreshold controls how close the two EMAs need to be
 *     before the pair is considered "sideways".
 *   • adxThreshold controls the minimum ADX value before the ADX
 *     indicator contributes to the confluence score.
 *
 * This file is the ONLY place that needs to change to retune a pair.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} PairProfile
 * @property {number}   sidewaysThreshold  - EMA separation ratio below which market is SIDEWAYS
 * @property {[number, number]} emaPeriods - [fastPeriod, slowPeriod]
 * @property {number}   rsiPeriod          - RSI lookback period
 * @property {[number, number, number]} macdParams - [fast, slow, signal]
 * @property {number}   bbPeriod           - Bollinger Bands period
 * @property {number}   srLookback         - Support/Resistance lookback candle count
 * @property {number}   adxThreshold       - Minimum ADX value to activate ADX weight
 * @property {Object}   weights            - Indicator weight map (must sum to 1.0)
 */

/** @type {Record<string, PairProfile>} */
export const PAIR_PROFILES = {
  // ── AUD/CAD OTC ─────────────────────────────────────────────
  // Low-volatility, range-bound pair. Bollinger Bands and Support/
  // Resistance dominate because price frequently oscillates within
  // tight channels. MACD is less reliable on tight M1 spreads.
  // ADX threshold is lower since even weak directional moves matter.
  "AUD/CAD OTC": {
    sidewaysThreshold: 0.0004,
    emaPeriods:  [10, 30],
    rsiPeriod:   14,
    macdParams:  [8, 21, 5],
    bbPeriod:    15,
    srLookback:  15,
    adxThreshold: 22,
    weights: {
      ema_cross:          0.16,
      rsi:                0.16,
      macd:               0.15,
      bollinger:          0.18,  // elevated — range-bound behaviour
      stoch_rsi:          0.14,
      adx:                0.06,
      support_resistance: 0.15,
    },
  },

  // ── AUD/USD OTC ─────────────────────────────────────────────
  // Moderate volatility trending pair. MACD crossovers are reliable
  // at M1. EMA cross is meaningful. Balanced profile.
  "AUD/USD OTC": {
    sidewaysThreshold: 0.0005,
    emaPeriods:  [12, 26],
    rsiPeriod:   14,
    macdParams:  [10, 22, 7],
    bbPeriod:    18,
    srLookback:  20,
    adxThreshold: 25,
    weights: {
      ema_cross:          0.20,
      rsi:                0.15,
      macd:               0.20,  // elevated — crossovers reliable
      bollinger:          0.12,
      stoch_rsi:          0.13,
      adx:                0.08,
      support_resistance: 0.12,
    },
  },

  // ── EUR/USD OTC ─────────────────────────────────────────────
  // Highest OTC liquidity. Cleanest trend signals. MACD and EMA
  // crossovers are most predictive. BB squeezes reliably precede
  // breakouts. Classic standard configuration.
  "EUR/USD OTC": {
    sidewaysThreshold: 0.0004,
    emaPeriods:  [10, 21],   // popular M1 combo
    rsiPeriod:   14,
    macdParams:  [12, 26, 9], // standard MACD
    bbPeriod:    20,
    srLookback:  20,
    adxThreshold: 25,
    weights: {
      ema_cross:          0.22,  // elevated — very reliable
      rsi:                0.14,
      macd:               0.22,  // elevated — highly predictive
      bollinger:          0.13,
      stoch_rsi:          0.11,
      adx:                0.07,
      support_resistance: 0.11,
    },
  },

  // ── GBP/JPY OTC ─────────────────────────────────────────────
  // Highest volatility in the set. Wide swings, strong trends, fast
  // price movements. ADX weight elevated because when GBP/JPY trends
  // it trends hard. BB weight reduced — bands expand too wide to be
  // actionable on M1. S/R less reliable as spikes blow through levels.
  "GBP/JPY OTC": {
    sidewaysThreshold: 0.0010,  // wider gap needed to confirm trend
    emaPeriods:  [8, 21],       // fast EMAs to track rapid moves
    rsiPeriod:   10,            // shorter — price moves faster
    macdParams:  [8, 17, 5],    // fast MACD
    bbPeriod:    14,
    srLookback:  12,            // shorter — old S/R gets blown past
    adxThreshold: 28,
    weights: {
      ema_cross:          0.22,
      rsi:                0.12,
      macd:               0.22,
      bollinger:          0.08,  // reduced — imprecise on spiky pair
      stoch_rsi:          0.16,  // elevated — K/D crossovers catch fast reversals
      adx:                0.13,  // elevated — trending behaviour dominant
      support_resistance: 0.07,  // reduced — spike through S/R is common
    },
  },

  // ── USD/CAD OTC ─────────────────────────────────────────────
  // Oil-correlated pair. RSI divergence is notably reliable here.
  // Range tendency outside North American session hours.
  "USD/CAD OTC": {
    sidewaysThreshold: 0.0005,
    emaPeriods:  [12, 26],
    rsiPeriod:   14,
    macdParams:  [10, 22, 7],
    bbPeriod:    18,
    srLookback:  18,
    adxThreshold: 24,
    weights: {
      ema_cross:          0.18,
      rsi:                0.18,  // elevated — RSI divergence common
      macd:               0.17,
      bollinger:          0.14,
      stoch_rsi:          0.13,
      adx:                0.07,
      support_resistance: 0.13,
    },
  },

  // ── USD/JPY OTC ─────────────────────────────────────────────
  // Clean trending pair driven by interest rate differentials.
  // EMA crossovers are very reliable. Round numbers (150.00, 149.50)
  // act as strong S/R zones. Momentum and MACD confirm direction well.
  "USD/JPY OTC": {
    sidewaysThreshold: 0.0006,
    emaPeriods:  [9, 21],    // classic JPY pair setup
    rsiPeriod:   14,
    macdParams:  [12, 26, 9],
    bbPeriod:    20,
    srLookback:  20,
    adxThreshold: 25,
    weights: {
      ema_cross:          0.24,  // highest — extremely reliable for USD/JPY
      rsi:                0.13,
      macd:               0.21,
      bollinger:          0.10,
      stoch_rsi:          0.12,
      adx:                0.10,  // elevated — trending pair
      support_resistance: 0.10,
    },
  },

  // ── GOLD OTC ────────────────────────────────────────────────
  // Momentum-driven commodity. Bollinger Band squeezes reliably
  // precede explosive gold breakouts. RSI extremes produce sharp
  // reversals. ATR is large in absolute terms (dollar moves).
  // Faster periods suit gold's rapid M1 dynamics.
  "GOLD OTC": {
    sidewaysThreshold: 0.0008,
    emaPeriods:  [10, 20],   // shorter periods for fast moves
    rsiPeriod:   12,         // shorter — gold reacts faster
    macdParams:  [8, 18, 6], // fast commodity MACD
    bbPeriod:    15,
    srLookback:  15,
    adxThreshold: 22,
    weights: {
      ema_cross:          0.16,
      rsi:                0.18,  // elevated — overbought/oversold very telling
      macd:               0.18,
      bollinger:          0.20,  // highest — squeeze precedes gold breakouts
      stoch_rsi:          0.12,
      adx:                0.07,
      support_resistance: 0.09,
    },
  },
};

/**
 * Fallback profile used for any symbol not in PAIR_PROFILES.
 * @type {PairProfile}
 */
export const DEFAULT_PROFILE = {
  sidewaysThreshold: 0.0005,
  emaPeriods:  [20, 50],
  rsiPeriod:   14,
  macdParams:  [12, 26, 9],
  bbPeriod:    20,
  srLookback:  20,
  adxThreshold: 25,
  weights: {
    ema_cross:          0.20,
    rsi:                0.15,
    macd:               0.18,
    bollinger:          0.12,
    stoch_rsi:          0.12,
    adx:                0.08,
    support_resistance: 0.15,
  },
};

/**
 * Returns the indicator profile for a given symbol.
 * Falls back to DEFAULT_PROFILE if the symbol is unlisted.
 * @param {string} symbol
 * @returns {PairProfile}
 */
export function getProfile(symbol) {
  return PAIR_PROFILES[symbol] ?? DEFAULT_PROFILE;
}
