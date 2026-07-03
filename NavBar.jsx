/**
 * components/NavBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Tab navigation: Signal / History / Stats / Settings.
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme } from "../context/ThemeContext.jsx";
import { Badge }    from "./ui/index.js";

const TABS = [
  { id: "signal",   label: "Signal",   icon: "◈" },
  { id: "history",  label: "History",  icon: "⏱" },
  { id: "stats",    label: "Stats",    icon: "◎" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function NavBar({ activeTab, onTabChange, demoMode }) {
  const { t } = useTheme();

  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, marginBottom: 20, gap: 4 }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === tab.id ? `2px solid ${t.accent}` : "2px solid transparent",
            color: activeTab === tab.id ? t.accent : t.textMuted,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            fontWeight: activeTab === tab.id ? 700 : 500,
            letterSpacing: 0.5,
            transition: "all 0.15s",
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {demoMode && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
          <Badge color={t.wait}>DEMO MODE</Badge>
        </div>
      )}
    </div>
  );
}
