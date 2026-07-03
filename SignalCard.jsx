/**
 * components/SignalCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Primary signal display — shows CALL/PUT/WAIT, confidence,
 * trend, risk, indicators, patterns, and breakout alerts for
 * the currently selected pair.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { useTheme }            from "../context/ThemeContext.jsx";
import { getSignalColors }     from "../constants/theme.js";
import { getDecimals, getFlag } from "../constants/pairs.js";
import { formatTime, formatDuration } from "../utils/format.js";
import {
  Badge, Divider, LiveDot, SignalIcon, ConfidenceRing, IndicatorRow, SkeletonCard,
} from "./ui/index.js";
import { MiniCandleChart } from "./charts/index.js";

export default function SignalCard({ result, candles, demoMode, isLoading, countdown }) {
  const { t } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Reset expanded state when the symbol changes
  useEffect(() => {
    setExpanded(false);
  }, [result?.symbol]);

  if (isLoading) return <SkeletonCard />;
  if (!result) return null;

  const sc   = getSignalColors(result.signal, t);
  const flag = getFlag(result.symbol);
  const dec  = getDecimals(result.symbol);
  const ind  = result.indicators;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${sc.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 0 30px ${sc.color}18, 0 2px 8px rgba(0,0,0,0.3)`,
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: sc.color, opacity: 0.8 }} />

      {/* Header */}
      <div style={{ padding: "16px 18px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
                {flag} {result.symbol}
              </span>
              {demoMode && <Badge color={t.wait}>DEMO</Badge>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: t.text }}>
              {Number(result.price).toFixed(dec)}
            </div>
          </div>

          <ConfidenceRing value={result.confidence} signal={result.signal} size={68} />
        </div>

        {/* Mini chart */}
        <div style={{ margin: "10px 0", borderRadius: 8, overflow: "hidden", background: t.surfaceHigh, padding: "6px 4px" }}>
          <MiniCandleChart candles={candles} height={60} />
        </div>

        {/* Signal badge + countdown */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 10,
              background: sc.bg,
              border: `1.5px solid ${sc.border}`,
              boxShadow: `0 0 14px ${sc.color}25`,
            }}
          >
            <SignalIcon signal={result.signal} size={14} />
            <span style={{ fontSize: 16, fontWeight: 800, color: sc.color, fontFamily: "var(--font-mono)", letterSpacing: 2 }}>
              {result.signal}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "var(--font-mono)", marginBottom: 2 }}>NEXT UPDATE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.textSec, fontFamily: "var(--font-mono)" }}>
              {formatDuration(countdown)}
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Key metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, padding: "0 18px 14px" }}>
        {[
          { label: "STRENGTH",   value: result.strength, color: sc.color },
          { label: "TREND",      value: result.trend.replace("_", " "), color: result.trend.includes("BULL") ? t.call : result.trend.includes("BEAR") ? t.put : t.wait },
          { label: "RISK",       value: result.risk.label, color: result.risk.color },
          { label: "VOLATILITY", value: result.volatility, color: t.textSec },
          { label: "BULL SCORE", value: result.bullScore + "%", color: t.call },
          { label: "BEAR SCORE", value: result.bearScore + "%", color: t.put },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "8px 4px" }}>
            <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 1, fontFamily: "var(--font-mono)" }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)", marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Candlestick patterns */}
      {result.patterns && result.patterns.length > 0 && (
        <>
          <Divider />
          <div style={{ padding: "0 18px 12px" }}>
            <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 1, marginBottom: 6, fontFamily: "var(--font-mono)" }}>
              PATTERNS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {result.patterns.map((p, i) => (
                <Badge key={i} color={p.type === "bullish" ? t.call : p.type === "bearish" ? t.put : t.wait}>
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Breakout alert */}
      {result.breakout && (
        <>
          <Divider />
          <div style={{ padding: "0 18px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span
              style={{
                fontSize: 11,
                color: result.breakout.type.includes("bullish") ? t.call : t.put,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            >
              {result.breakout.type.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%",
          background: t.surfaceHigh,
          border: "none",
          borderTop: `1px solid ${t.border}`,
          color: t.textMuted,
          padding: "8px",
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          cursor: "pointer",
          letterSpacing: 1,
        }}
      >
        {expanded ? "▲ HIDE INDICATORS" : "▼ SHOW ALL INDICATORS"}
      </button>

      {expanded && (
        <div style={{ padding: "12px 18px 14px", background: t.surfaceHigh }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div>
              <IndicatorRow label="EMA Fast" value={ind.ema20} decimals={dec} bullish={ind.ema20 > ind.ema50} />
              <IndicatorRow label="EMA Slow" value={ind.ema50} decimals={dec} />
              <IndicatorRow label="SMA 20"   value={ind.sma20} decimals={dec} />
              <IndicatorRow label="RSI"      value={ind.rsi} decimals={1} bullish={ind.rsi > 50 && ind.rsi < 70} />
              <IndicatorRow label="Momentum" value={ind.momentum} decimals={3} bullish={ind.momentum > 0} />
            </div>
            <div>
              {ind.macd && (
                <>
                  <IndicatorRow label="MACD"      value={ind.macd.value}     decimals={6} bullish={ind.macd.bullish} />
                  <IndicatorRow label="MACD Sig"  value={ind.macd.signal}    decimals={6} />
                  <IndicatorRow label="Histogram" value={ind.macd.histogram} decimals={6} bullish={ind.macd.histogram > 0} />
                </>
              )}
              {ind.stochRsi && (
                <IndicatorRow label="StochRSI K" value={ind.stochRsi.k} decimals={1} bullish={ind.stochRsi.k < 80 && ind.stochRsi.k > 20} />
              )}
              {ind.adx && <IndicatorRow label="ADX" value={ind.adx.value} decimals={1} />}
            </div>
          </div>

          <Divider />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div>
              {ind.bb && (
                <>
                  <IndicatorRow label="BB Upper" value={ind.bb.upper} decimals={dec} />
                  <IndicatorRow label="BB Mid"   value={ind.bb.middle} decimals={dec} />
                  <IndicatorRow label="BB Lower" value={ind.bb.lower} decimals={dec} />
                  <IndicatorRow label="BB %B"    value={ind.bb.pctB * 100} decimals={1} />
                </>
              )}
            </div>
            <div>
              <IndicatorRow label="Support"    value={ind.support}    decimals={dec} bullish={true} />
              <IndicatorRow label="Resistance" value={ind.resistance} decimals={dec} bullish={false} />
              <IndicatorRow label="ATR"        value={ind.atr}        decimals={dec} />
            </div>
          </div>

          <div style={{ fontSize: 9, color: t.textMuted, marginTop: 10, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            <span style={{ color: t.accent + "99" }}>⬡ PROFILE: {result.profileLabel}</span>
            {"  "}· Weights optimized per pair
          </div>
          <div style={{ fontSize: 9, color: t.textMuted, marginTop: 6, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            ⚠ Indicators reflect statistical convergence. Past patterns do not guarantee future results.
            Use alongside proper risk management. Never risk more than you can afford to lose.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "6px 18px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <LiveDot active={true} />
        <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "var(--font-mono)" }}>
          Updated {formatTime(result.timestamp)} · M1 OTC · Optimized Profile
        </span>
      </div>
    </div>
  );
}
