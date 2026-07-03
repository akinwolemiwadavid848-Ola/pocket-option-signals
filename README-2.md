# Pocket Option Signals

Premium binary options signal platform for **educational purposes**. Generates M1 (1-minute) CALL / PUT / WAIT signals across 7 OTC trading pairs using a multi-indicator confluence engine with per-pair optimized configurations.

> ⚠️ **Educational tool only.** Binary options trading carries significant financial risk. Signals reflect technical indicator agreement, not guaranteed outcomes. Never trade money you cannot afford to lose.

---

## Features

- **7 OTC trading pairs** — AUD/CAD, AUD/USD, EUR/USD, GBP/JPY, USD/CAD, USD/JPY, GOLD
- **Per-pair optimized indicator profiles** — each pair has its own EMA periods, RSI period, MACD settings, Bollinger Band window, and indicator weighting tuned to its volatility characteristics
- **Multi-indicator confluence engine** — EMA cross, RSI, MACD, Bollinger Bands, Stochastic RSI, ADX, Support/Resistance, candlestick patterns, and breakout detection combine into a single weighted confidence score
- **Demo mode** — works immediately with zero configuration using deterministic simulated data
- **Live mode** — connects to the Twelve Data API when a key is provided, with automatic fallback to demo mode on any error
- **Dark / light themes** — full design token system, persisted to `localStorage`
- **Signal history** — last 100 signals tracked in-session
- **Statistics dashboard** — call/put/wait breakdown, average confidence, confidence distribution
- **Settings panel** — theme, sound, auto-refresh, pattern display, API key, reset

---

## Tech Stack

- **React 18** with hooks (no external state management library)
- **Vite** for build tooling and dev server
- **Zero UI dependencies** — all components are hand-built with inline styles for full control
- **Zero charting library** — the mini candlestick chart is hand-drawn SVG

---

## Project Structure

```
pocket-option-signals/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                  # Data layer
│   │   ├── twelvedata.js     # Live API integration
│   │   ├── demo.js           # Deterministic demo candle generator
│   │   └── index.js          # Unified fetch with auto fallback
│   │
│   ├── indicators/           # Pure technical indicator math
│   │   ├── ema.js            # EMA + SMA
│   │   ├── rsi.js            # RSI (Wilder smoothing)
│   │   ├── macd.js           # MACD
│   │   ├── bollinger.js      # Bollinger Bands
│   │   ├── atr.js            # Average True Range
│   │   ├── adx.js            # ADX / +DI / -DI
│   │   ├── stochrsi.js       # Stochastic RSI
│   │   └── momentum.js       # Momentum + Support/Resistance
│   │
│   ├── patterns/              # Pattern recognition
│   │   ├── candlestick.js    # Doji, Hammer, Engulfing, Stars, Marubozu
│   │   └── breakout.js       # Breakout + false breakout detection
│   │
│   ├── strategy/              # Signal generation logic
│   │   ├── trend.js          # EMA-based trend detection
│   │   ├── confluence.js     # Weighted multi-indicator scoring
│   │   └── engine.js         # Orchestrates indicators → signal
│   │
│   ├── constants/             # Single source of truth for config
│   │   ├── pairs.js          # The 7 OTC pairs + prices/volatility
│   │   ├── profiles.js       # Per-pair indicator profiles
│   │   ├── theme.js          # Dark/light design tokens
│   │   └── config.js         # App-level config (version, refresh interval…)
│   │
│   ├── hooks/                 # React hooks
│   │   ├── useSignal.js      # Fetch + analyze + auto-refresh for a pair
│   │   ├── useHistory.js     # Signal history management
│   │   └── useCountdown.js   # Generic countdown timer
│   │
│   ├── context/                # React context providers
│   │   ├── ThemeContext.jsx
│   │   └── SettingsContext.jsx
│   │
│   ├── components/             # Presentational UI components
│   │   ├── ui/                # Primitive components (Badge, Spinner, etc.)
│   │   ├── charts/             # MiniCandleChart, ConfidenceDistribution
│   │   ├── CurrencySelector.jsx
│   │   ├── SignalCard.jsx
│   │   ├── SignalHistory.jsx
│   │   ├── StatisticsPanel.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── NavBar.jsx
│   │   ├── AppStatusBar.jsx
│   │   ├── Disclaimer.jsx
│   │   ├── AppHeader.jsx
│   │   └── AppFooter.jsx
│   │
│   ├── pages/
│   │   └── Dashboard.jsx       # Main page — wires hooks to components
│   │
│   ├── utils/
│   │   ├── format.js           # Display formatting helpers
│   │   └── math.js             # Pure math helpers (clamp, seededRand…)
│   │
│   ├── App.jsx                  # Root component (providers + Dashboard)
│   ├── main.jsx                 # React DOM entry point
│   └── index.css                # Global styles, animations, design tokens
│
├── .env.example                 # Environment variable template
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in demo mode (no setup required)

```bash
npm run dev
```

Open `http://localhost:3000`. The app works immediately with simulated M1 candle data — no API key needed.

### 3. (Optional) Enable live data

1. Get a free API key at [twelvedata.com](https://twelvedata.com) (800 requests/day on the free tier)
2. Copy `.env.example` to `.env`
3. Set `VITE_TWELVEDATA_API_KEY=your_key_here`
4. Restart the dev server

Alternatively, paste your API key directly into the **Settings** tab inside the app — it's stored only in `localStorage` on your device and never sent anywhere except Twelve Data's API.

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## How Signals Are Generated

1. **Select a pair** — only that pair is analyzed; any previous pair's polling stops immediately.
2. **Fetch candles** — live from Twelve Data, or deterministic demo data if no key / on error.
3. **Load the pair's profile** (`src/constants/profiles.js`) — each pair has its own EMA periods, RSI period, MACD settings, Bollinger window, and indicator weights.
4. **Compute indicators** — EMA, RSI, MACD, Bollinger Bands, ATR, ADX, Stochastic RSI, Momentum, Support/Resistance, candlestick patterns, breakout detection.
5. **Confluence scoring** (`src/strategy/confluence.js`) — each indicator casts a weighted directional vote; the weighted sum determines a net score in `[-1, +1]`.
6. **Signal decision** — if the market is sideways or the net score is weak, the signal is `WAIT`. Otherwise `CALL` (positive net) or `PUT` (negative net).
7. **Confidence score** — based on how strongly indicators agree, not a prediction of profit. Capped at 95% to avoid implying certainty.

### Tuning a pair's profile

Open `src/constants/profiles.js` and edit the relevant pair's object. No other file needs to change — the strategy engine and UI both read profiles dynamically.

```js
"EUR/USD OTC": {
  sidewaysThreshold: 0.0004,
  emaPeriods:  [10, 21],
  rsiPeriod:   14,
  macdParams:  [12, 26, 9],
  bbPeriod:    20,
  srLookback:  20,
  adxThreshold: 25,
  weights: {
    ema_cross: 0.22, rsi: 0.14, macd: 0.22,
    bollinger: 0.13, stoch_rsi: 0.11, adx: 0.07,
    support_resistance: 0.11,
  },
},
```

Weights for a given pair must sum to `1.0`.

---

## Scripts

| Command           | Description                          |
|--------------------|--------------------------------------|
| `npm run dev`       | Start Vite dev server (port 3000)   |
| `npm run build`     | Production build to `dist/`         |
| `npm run preview`   | Preview the production build        |
| `npm run lint`      | Run ESLint                          |
| `npm run lint:fix`  | Run ESLint with auto-fix            |
| `npm run format`    | Run Prettier on all source files    |

---

## Security Notes

- API keys are never hardcoded and never committed (`.env` is gitignored)
- All API requests use a 10-second timeout via `AbortController`
- All API errors are caught and silently fall back to demo mode — the app never crashes from network issues
- No external analytics, tracking, or ad scripts

---

## License

This project is provided for educational purposes only. Not financial advice. Use at your own risk.
