/**
 * components/StatisticsPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Aggregated session statistics: signal counts, average
 * confidence, and confidence distribution breakdown.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo }   from "react";
import { useTheme }  from "../context/ThemeContext.jsx";
import { Divider }   from "./ui/index.js";
import { ConfidenceDistribution } from "./charts/index.js";

export default function StatisticsPanel({ history }) {
  const { t } = useTheme();

  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;
    const calls    = history.filter((h) => h.signal === "CALL").length;
    const puts     = history.filter((h) => h.signal === "PUT").length;
    const waits    = history.filter((h) => h.signal === "WAIT").length;
    const avgConf  = Math.round(history.reduce((a, h) => a + h.confidence, 0) / history.length);
    const highConf = history.filter((h) => h.confidence >= 70).length;
    return { calls, puts, waits, avgConf, highConf, total: history.length };
  }, [history]);

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0", color: t.textMuted, fontSize: 12, fontFamily: "var(--font-mono)" }}>
        Statistics will appear after first signals are generated.
      </div>
    );
  }

  const items = [
    { label: "TOTAL SIGNALS",    value: stats.total,           color: t.accent },
    { label: "CALL",             value: stats.calls,           color: t.call },
    { label: "PUT",              value: stats.puts,            color: t.put },
    { label: "WAIT",             value: stats.waits,           color: t.wait },
    { label: "AVG CONFIDENCE",   value: stats.avgConf + "%",   color: t.text },
    { label: "HIGH CONFIDENCE",  value: stats.highConf,        color: t.accent },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {items.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              padding: "12px 10px",
              background: t.surfaceHigh,
              borderRadius: 10,
              border: `1px solid ${t.border}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 1, fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>{value}</div>
          </div>
        ))}
      </div>

      <Divider margin="14px 0" />

      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginBottom: 10, fontFamily: "var(--font-mono)" }}>
        CONFIDENCE DISTRIBUTION
      </div>
      <ConfidenceDistribution history={history} />
    </div>
  );
}
