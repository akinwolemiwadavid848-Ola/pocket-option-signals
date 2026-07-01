
// ============================================================
// POCKET OPTION SIGNALS — Educational Binary Trading Dashboard
// ============================================================
// Architecture:
//   api/        → fetchCandles, error handling, auto-refresh
//   indicators/ → EMA, RSI, Support/Resistance (pure math)
//   strategy/   → trend detection, signal logic, confidence
//   components/ → AssetCard, SignalBadge, ConfidenceBar, Dashboard
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const ASSETS = [
  { symbol: "AUD/CAD", apiSymbol: "AUD/CAD", label: "AUD/CAD" },
  { symbol: "EUR/USD", apiSymbol: "EUR/USD", label: "EUR/USD" },
  { symbol: "GBP/USD", apiSymbol: "GBP/USD", label: "GBP/USD" },
  { symbol: "USD/JPY", apiSymbol: "USD/JPY", label: "USD/JPY" },
  { symbol: "XAU/USD", apiSymbol: "XAU/USD", label: "XAU/USD (Gold)" },
];

const REFRESH_INTERVAL = 60_000; // 60 seconds
const EMA_FAST = 20;
const EMA_SLOW = 50;
const RSI_PERIOD = 14;
const SR_LOOKBACK = 20;
const SIDEWAYS_THRESHOLD = 0.0008; // EMA separation threshold (0.08%)

// ─────────────────────────────────────────────────────────────
// API LAYER — api/twelvedata.js
// ─────────────────────────────────────────────────────────────

// Simulate realistic M1 candle data using deterministic seeded math
// In production: replace with real Twelve Data API calls
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function generateCandles(symbol, count = 60) {
  // Deterministic base prices per asset
  const basePrices = {
    "AUD/CAD": 0.8920,
    "EUR/USD": 1.0845,
    "GBP/USD": 1.2710,
    "USD/JPY": 149.85,
    "XAU/USD": 2328.50,
  };

  const volatility = {
    "AUD/CAD": 0.0008,
    "EUR/USD": 0.0006,
    "GBP/USD": 0.0009,
    "USD/JPY": 0.07,
    "XAU/USD": 1.8,
  };

  const base = basePrices[symbol] || 1.0;
  const vol = volatility[symbol] || 0.001;

  // Use current minute-level time as part of seed for slow drift
  const timeSeed = Math.floor(Date.now() / 60000);
  const rand = seededRandom(symbol.charCodeAt(0) * 1000 + symbol.charCodeAt(3) + timeSeed);

  const candles = [];
  let price = base;

  // Add a trend bias that shifts over time (creates real-looking trends)
  const trendBias = (rand() - 0.48) * vol * 0.3;

  for (let i = 0; i < count; i++) {
    const change = (rand() - 0.49) * vol * 2 + trendBias;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + rand() * vol * 0.5;
    const low = Math.min(open, close) - rand() * vol * 0.5;
    candles.push({ open, high, low, close, time: Date.now() - (count - i) * 60000 });
    price = close;
  }
  return candles;
}

async function fetchCandles(apiKey, symbol) {
  if (!apiKey || apiKey.trim() === "") {
    // Demo mode: generate deterministic candles
    return { candles: generateCandles(symbol), demo: true };
  }

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1min&outputsize=60&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status === "error") throw new Error(data.message || "API error");

    const candles = (data.values || []).reverse().map((v) => ({
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      time: new Date(v.datetime).getTime(),
    }));
    return { candles, demo: false };
  } catch (err) {
    // Fallback to demo data on error
    console.warn(`[API] ${symbol} fetch failed: ${err.message} — using demo data`);
    return { candles: generateCandles(symbol), demo: true, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// INDICATORS — indicators/ema.js + rsi.js + sr.js
// ─────────────────────────────────────────────────────────────

function calcEMA(closes, period) {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  const changes = closes.slice(-period - 1).map((v, i, a) =>
    i === 0 ? 0 : v - a[i - 1]
  ).slice(1);

  let gains = 0, losses = 0;
  changes.forEach((c) => {
    if (c > 0) gains += c;
    else losses += Math.abs(c);
  });

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcSupportResistance(candles, lookback = 20) {
  const recent = candles.slice(-lookback);
  const support = Math.min(...recent.map((c) => c.low));
  const resistance = Math.max(...recent.map((c) => c.high));
  return { support, resistance };
}

function runIndicators(candles) {
  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, EMA_FAST);
  const ema50 = calcEMA(closes, EMA_SLOW);
  const rsi = calcRSI(closes, RSI_PERIOD);
  const { support, resistance } = calcSupportResistance(candles, SR_LOOKBACK);
  const price = closes[closes.length - 1];
  return { price, ema20, ema50, rsi, support, resistance };
}

// ─────────────────────────────────────────────────────────────
// STRATEGY — strategy/signals.js + confidence.js
// ─────────────────────────────────────────────────────────────

function detectTrend(ema20, ema50) {
  if (ema20 === null || ema50 === null) return "UNKNOWN";
  const separation = Math.abs(ema20 - ema50) / ema50;
  if (separation < SIDEWAYS_THRESHOLD) return "SIDEWAYS";
  return ema20 > ema50 ? "BULLISH" : "BEARISH";
}

function isPriceNearSupport(price, support, resistance) {
  const range = resistance - support;
  if (range === 0) return false;
  return (price - support) / range < 0.25; // within 25% of range from support
}

function isPriceNearResistance(price, support, resistance) {
  const range = resistance - support;
  if (range === 0) return false;
  return (resistance - price) / range < 0.25; // within 25% of range from resistance
}

function generateSignal(indicators) {
  const { price, ema20, ema50, rsi, support, resistance } = indicators;
  if (!ema20 || !ema50 || rsi === null) return "WAIT";

  const trend = detectTrend(ema20, ema50);
  const nearSupport = isPriceNearSupport(price, support, resistance);
  const nearResistance = isPriceNearResistance(price, support, resistance);

  if (trend === "SIDEWAYS") return "WAIT";
  if (rsi >= 45 && rsi <= 55) return "WAIT";

  // CALL: bullish trend + RSI 50–70 + price near support
  if (trend === "BULLISH" && rsi > 50 && rsi <= 70 && nearSupport) return "CALL";

  // PUT: bearish trend + RSI 30–50 + price near resistance
  if (trend === "BEARISH" && rsi >= 30 && rsi < 50 && nearResistance) return "PUT";

  // Relaxed CALL (bullish + RSI in range, no S/R requirement)
  if (trend === "BULLISH" && rsi > 55 && rsi <= 70) return "CALL";

  // Relaxed PUT (bearish + RSI in range)
  if (trend === "BEARISH" && rsi >= 30 && rsi < 45) return "PUT";

  return "WAIT";
}

function calcConfidence(indicators, signal) {
  const { price, ema20, ema50, rsi, support, resistance } = indicators;
  if (!ema20 || !ema50 || rsi === null) return 0;

  let score = 50;
  const trend = detectTrend(ema20, ema50);

  // Trend alignment
  if (
    (signal === "CALL" && trend === "BULLISH") ||
    (signal === "PUT" && trend === "BEARISH")
  ) score += 20;

  // RSI confirmation
  if (signal === "CALL" && rsi > 50 && rsi <= 70) score += 15;
  else if (signal === "PUT" && rsi >= 30 && rsi < 50) score += 15;

  // Support / Resistance proximity
  if (signal === "CALL" && isPriceNearSupport(price, support, resistance)) score += 15;
  else if (signal === "PUT" && isPriceNearResistance(price, support, resistance)) score += 15;

  // Penalties
  if (trend === "SIDEWAYS") score -= 30;
  if (rsi >= 45 && rsi <= 55) score -= 10; // weak momentum

  return Math.max(0, Math.min(100, Math.round(score)));
}

function analyzeAsset(candles) {
  const indicators = runIndicators(candles);
  const trend = detectTrend(indicators.ema20, indicators.ema50);
  const signal = generateSignal(indicators);
  const confidence = calcConfidence(indicators, signal);
  return { ...indicators, trend, signal, confidence };
}

// ─────────────────────────────────────────────────────────────
// COMPONENTS — components/
// ─────────────────────────────────────────────────────────────

const SIGNAL_STYLES = {
  CALL: { bg: "#0a1f14", border: "#00c96b", color: "#00c96b", glow: "rgba(0,201,107,0.18)" },
  PUT:  { bg: "#1f0a0a", border: "#ff4d4d", color: "#ff4d4d", glow: "rgba(255,77,77,0.18)" },
  WAIT: { bg: "#1a1608", border: "#f0b429", color: "#f0b429", glow: "rgba(240,180,41,0.15)" },
};

const TREND_COLORS = {
  BULLISH: "#00c96b",
  BEARISH: "#ff4d4d",
  SIDEWAYS: "#f0b429",
  UNKNOWN: "#888",
};

function SignalBadge({ signal }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES["WAIT"];
  const icons = { CALL: "▲", PUT: "▼", WAIT: "◆" };
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 18px",
      borderRadius: 8,
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      boxShadow: `0 0 12px ${s.glow}`,
      color: s.color,
      fontFamily: "var(--font-mono, monospace)",
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: 2,
    }}>
      <span style={{ fontSize: 13 }}>{icons[signal]}</span>
      {signal}
    </div>
  );
}

function ConfidenceBar({ score, signal }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES["WAIT"];
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "var(--font-mono,monospace)" }}>CONFIDENCE</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "var(--font-mono,monospace)",
          color: s.color,
        }}>{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "#1a1a1f", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 3,
          background: s.color,
          opacity: 0.85,
          transition: "width 0.8s ease",
        }}/>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
      <span style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-mono,monospace)" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono,monospace)", color: color || "#ccc", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

function fmt(val, decimals = 4) {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(decimals);
}

function fmtDecimals(symbol, val) {
  if (val === null || val === undefined) return "—";
  if (symbol === "USD/JPY") return Number(val).toFixed(3);
  if (symbol === "XAU/USD") return Number(val).toFixed(2);
  return Number(val).toFixed(5);
}

function AssetCard({ asset, data, loading, error }) {
  const symbol = asset.symbol;
  const sig = data?.signal || "WAIT";
  const sigStyle = SIGNAL_STYLES[sig];
  const dec = (v) => fmtDecimals(symbol, v);

  return (
    <div style={{
      background: "#0e0e14",
      border: `1px solid ${loading ? "#2a2a35" : sigStyle.border + "55"}`,
      borderRadius: 12,
      padding: "16px 16px 14px",
      position: "relative",
      transition: "border-color 0.4s",
      minHeight: 260,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", fontFamily: "var(--font-mono,monospace)", letterSpacing: 1 }}>
            {asset.label}
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-mono,monospace)", color: "#f0f0f0", marginTop: 2 }}>
            {loading ? <span style={{ color: "#444" }}>Loading…</span> : dec(data?.price)}
          </div>
        </div>
        {!loading && data && <SignalBadge signal={sig} />}
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "#333", padding: "32px 0", fontFamily: "var(--font-mono,monospace)", fontSize: 12 }}>
          Fetching candles…
        </div>
      )}

      {error && !data && (
        <div style={{ color: "#ff4d4d", fontSize: 11, fontFamily: "var(--font-mono,monospace)", marginBottom: 8 }}>
          ⚠ {error}
        </div>
      )}

      {!loading && data && (
        <>
          {/* Confidence */}
          <div style={{ marginBottom: 12 }}>
            <ConfidenceBar score={data.confidence} signal={sig} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#1e1e28", margin: "10px 0" }} />

          {/* Metrics */}
          <div>
            <MetricRow label="RSI (14)"
              value={data.rsi !== null ? Number(data.rsi).toFixed(1) : "—"}
              color={data.rsi > 70 ? "#ff4d4d" : data.rsi < 30 ? "#00c96b" : "#ccc"}
            />
            <MetricRow label="EMA 20" value={dec(data.ema20)} />
            <MetricRow label="EMA 50" value={dec(data.ema50)} />
            <MetricRow label="TREND"
              value={data.trend}
              color={TREND_COLORS[data.trend]}
            />
            <MetricRow label="SUPPORT" value={dec(data.support)} color="#00c96b88" />
            <MetricRow label="RESISTANCE" value={dec(data.resistance)} color="#ff4d4d88" />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#1e1e28", margin: "10px 0" }} />

          {/* Timestamp */}
          <div style={{ fontSize: 10, color: "#444", fontFamily: "var(--font-mono,monospace)" }}>
            ⏱ {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBar({ refreshing, countdown, demoMode, assetCount }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 14px",
      background: "#0a0a10",
      borderRadius: 8,
      border: "1px solid #1e1e28",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: refreshing ? "#f0b429" : "#00c96b",
          boxShadow: refreshing ? "0 0 6px #f0b429" : "0 0 6px #00c96b",
          animation: refreshing ? "none" : "pulse 2s infinite",
        }}/>
        <span style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-mono,monospace)" }}>
          {refreshing ? "REFRESHING…" : `LIVE — ${assetCount} ASSETS`}
        </span>
        {demoMode && (
          <span style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 4,
            background: "#1a1400",
            color: "#f0b429",
            border: "1px solid #f0b42940",
            fontFamily: "var(--font-mono,monospace)",
          }}>DEMO MODE</span>
        )}
      </div>
      <span style={{ fontSize: 11, color: "#444", fontFamily: "var(--font-mono,monospace)" }}>
        Next refresh in {countdown}s · M1 · Twelve Data
      </span>
    </div>
  );
}

function ApiKeyInput({ apiKey, onKeyChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{
      padding: "10px 14px",
      background: "#0a0a10",
      borderRadius: 8,
      border: "1px solid #1e1e28",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-mono,monospace)", whiteSpace: "nowrap" }}>
        API KEY
      </span>
      <input
        type={visible ? "text" : "password"}
        placeholder="Enter Twelve Data API key (or leave blank for demo)"
        value={apiKey}
        onChange={(e) => onKeyChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: 180,
          background: "#0e0e14",
          border: "1px solid #2a2a35",
          borderRadius: 6,
          padding: "5px 10px",
          color: "#ccc",
          fontFamily: "var(--font-mono,monospace)",
          fontSize: 12,
          outline: "none",
        }}
      />
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          background: "none",
          border: "1px solid #2a2a35",
          borderRadius: 6,
          color: "#888",
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: 11,
          fontFamily: "var(--font-mono,monospace)",
        }}
      >{visible ? "HIDE" : "SHOW"}</button>
      <a
        href="https://twelvedata.com/pricing"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 11, color: "#444", fontFamily: "var(--font-mono,monospace)", textDecoration: "none" }}
      >Get free key ↗</a>
    </div>
  );
}

function Legend() {
  const items = [
    { sig: "CALL", desc: "Bullish trend · RSI 50–70 · Near support" },
    { sig: "PUT",  desc: "Bearish trend · RSI 30–50 · Near resistance" },
    { sig: "WAIT", desc: "Sideways · RSI 45–55 · Conflicting signals" },
  ];
  return (
    <div style={{
      display: "flex",
      gap: 12,
      marginBottom: 16,
      flexWrap: "wrap",
    }}>
      {items.map(({ sig, desc }) => {
        const s = SIGNAL_STYLES[sig];
        return (
          <div key={sig} style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 10px",
            borderRadius: 6,
            background: s.bg,
            border: `1px solid ${s.border}40`,
            flex: "1 1 180px",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: "var(--font-mono,monospace)", minWidth: 38 }}>{sig}</span>
            <span style={{ fontSize: 11, color: "#666" }}>{desc}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [assetData, setAssetData] = useState({});
  const [loadingAssets, setLoadingAssets] = useState({});
  const [errors, setErrors] = useState({});
  const [demoMode, setDemoMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef(null);
  const countRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setCountdown(60);

    const newLoading = {};
    ASSETS.forEach((a) => { newLoading[a.symbol] = true; });
    setLoadingAssets(newLoading);

    let anyDemo = false;

    await Promise.all(
      ASSETS.map(async (asset) => {
        const { candles, demo, error } = await fetchCandles(apiKey, asset.apiSymbol);
        if (demo) anyDemo = true;

        const analysis = analyzeAsset(candles);

        setAssetData((prev) => ({ ...prev, [asset.symbol]: analysis }));
        setLoadingAssets((prev) => ({ ...prev, [asset.symbol]: false }));
        if (error) setErrors((prev) => ({ ...prev, [asset.symbol]: error }));
        else setErrors((prev) => { const e = { ...prev }; delete e[asset.symbol]; return e; });
      })
    );

    setDemoMode(anyDemo);
    setRefreshing(false);
  }, [apiKey]);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 60s
  useEffect(() => {
    intervalRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  // Countdown timer
  useEffect(() => {
    countRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 60));
    }, 1000);
    return () => clearInterval(countRef.current);
  }, []);

  return (
    <div style={{
      background: "#07070d",
      minHeight: "100vh",
      padding: "20px 16px",
      fontFamily: "var(--font-sans, system-ui, sans-serif)",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", fontFamily: "var(--font-mono,monospace)", letterSpacing: 1 }}>
            ◈ POCKET OPTION SIGNALS
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#444", fontFamily: "var(--font-mono,monospace)" }}>
          EDUCATIONAL ONLY — NOT FINANCIAL ADVICE · M1 CANDLES · 5 PAIRS
        </div>
      </div>

      {/* API Key */}
      <ApiKeyInput apiKey={apiKey} onKeyChange={setApiKey} />

      {/* Status */}
      <StatusBar
        refreshing={refreshing}
        countdown={countdown}
        demoMode={demoMode}
        assetCount={ASSETS.length}
      />

      {/* Signal legend */}
      <Legend />

      {/* Asset grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12,
      }}>
        {ASSETS.map((asset) => (
          <AssetCard
            key={asset.symbol}
            asset={asset}
            data={assetData[asset.symbol]}
            loading={!!loadingAssets[asset.symbol]}
            error={errors[asset.symbol]}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 20,
        padding: "10px 14px",
        background: "#0a0a10",
        borderRadius: 8,
        border: "1px solid #1a1a22",
      }}>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "var(--font-mono,monospace)", lineHeight: 1.7 }}>
          ⚠ DISCLAIMER: This tool is for educational purposes only. Binary options carry significant risk.
          Signals are generated from technical indicators and do not guarantee profit. Never trade money you cannot afford to lose.
          EMA crossover · RSI momentum · Support/Resistance proximity · Auto-refresh 60s
        </div>
      </div>
    </div>
  );
}
