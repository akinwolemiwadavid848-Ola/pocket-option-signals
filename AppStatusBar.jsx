/**
 * components/AppStatusBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Status bar shown above the active signal card — live indicator,
 * which pair is being analyzed, countdown, and manual refresh.
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme } from "../context/ThemeContext.jsx";
import { LiveDot }  from "./ui/index.js";

export default function AppStatusBar({ refreshing, onRefresh, selectedPair, countdown }) {
  const { t } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        background: t.surfaceHigh,
        borderRadius: 10,
        border: `1px solid ${t.border}`,
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LiveDot active={!refreshing} />
        <span style={{ fontSize: 11, color: t.textSec, fontFamily: "var(--font-mono)" }}>
          {refreshing ? "FETCHING DATA…" : selectedPair ? `ANALYZING ${selectedPair}` : "SELECT A PAIR"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "var(--font-mono)" }}>
          {countdown > 0 ? `Refresh in ${countdown}s` : "Refreshing…"}
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            padding: "4px 12px",
            background: t.accent + "18",
            border: `1px solid ${t.accent}40`,
            borderRadius: 6,
            color: t.accent,
            cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
          }}
        >
          {refreshing ? "…" : "⟳ REFRESH"}
        </button>
      </div>
    </div>
  );
}
