/**
 * components/SignalHistory.jsx
 * ─────────────────────────────────────────────────────────────
 * Displays the most recent signal history entries (up to 15
 * visible at a time, scrollable to all 100 stored).
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme }   from "../context/ThemeContext.jsx";
import { formatTime } from "../utils/format.js";

export default function SignalHistory({ history }) {
  const { t } = useTheme();

  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0", color: t.textMuted, fontSize: 12, fontFamily: "var(--font-mono)" }}>
        No signal history yet. Select a currency pair to start.
      </div>
    );
  }

  const signalColors = { CALL: t.call, PUT: t.put, WAIT: t.wait };

  return (
    <div>
      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginBottom: 10, fontFamily: "var(--font-mono)" }}>
        RECENT SIGNALS — {history.length} total
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {history.slice(0, 15).map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: t.surfaceHigh,
              borderRadius: 8,
              border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: signalColors[h.signal],
                  boxShadow: `0 0 5px ${signalColors[h.signal]}`,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: t.textSec }}>
                {h.symbol}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: signalColors[h.signal] }}>
                {h.signal}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "var(--font-mono)" }}>{h.confidence}%</span>
              <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "var(--font-mono)" }}>{formatTime(h.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
