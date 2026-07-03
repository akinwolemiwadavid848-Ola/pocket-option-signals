/**
 * components/AppHeader.jsx
 * ─────────────────────────────────────────────────────────────
 * Sticky top header — app branding, version, demo/live badge,
 * loading spinner.
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme }    from "../context/ThemeContext.jsx";
import { APP_VERSION } from "../constants/config.js";
import { Badge, Spinner } from "./ui/index.js";

export default function AppHeader({ demoMode, loading }) {
  const { t } = useTheme();

  return (
    <div
      style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: t.accent + "20",
            border: `1px solid ${t.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}
        >
          ◈
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
            POCKET SIGNALS
          </div>
          <div style={{ fontSize: 9, color: t.textMuted, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
            OTC · M1 · MULTI-INDICATOR · v{APP_VERSION}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge color={demoMode ? t.wait : t.call} size="md">
          {demoMode ? "DEMO" : "LIVE"}
        </Badge>
        {loading && <Spinner size={16} />}
      </div>
    </div>
  );
}
