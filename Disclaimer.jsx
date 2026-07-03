/**
 * components/Disclaimer.jsx
 * ─────────────────────────────────────────────────────────────
 * Dismissible educational/risk disclaimer banner.
 * Shown at the top of the dashboard until the user closes it.
 * ─────────────────────────────────────────────────────────────
 */

import { useState }  from "react";
import { useTheme }  from "../context/ThemeContext.jsx";

export default function Disclaimer() {
  const { t } = useTheme();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      style={{
        padding: "10px 14px",
        background: t.wait + "10",
        border: `1px solid ${t.wait}30`,
        borderRadius: 10,
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 10, color: t.textSec, lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>
        ⚠ <strong>EDUCATIONAL TOOL ONLY.</strong> Binary options carry extreme risk.
        This tool generates technical analysis signals — not financial advice.
        Confidence scores reflect indicator agreement, not profit probability.
        Never invest money you cannot afford to lose. Seek qualified financial advice.
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss disclaimer"
        style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
