/**
 * components/SettingsPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Settings UI — theme toggle, sound, auto-refresh, pattern
 * display, API key configuration, and reset.
 * ─────────────────────────────────────────────────────────────
 */

import { useState }     from "react";
import { useTheme }     from "../context/ThemeContext.jsx";
import { ToggleSwitch } from "./ui/index.js";

function SettingRow({ label, desc, checked, onChange }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
      <div>
        <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPanel({ settings, onUpdate, onReset }) {
  const { theme, toggleTheme, t } = useTheme();
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginBottom: 14, fontFamily: "var(--font-mono)" }}>
        PREFERENCES
      </div>

      <SettingRow
        label="Dark Mode"
        desc="Switch between dark and light theme"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <SettingRow
        label="Sound Alerts"
        desc="Play a tone when a new signal is generated"
        checked={settings.sound}
        onChange={() => onUpdate({ sound: !settings.sound })}
      />
      <SettingRow
        label="Auto-refresh"
        desc="Automatically refresh signals every 60 seconds"
        checked={settings.autoRefresh}
        onChange={() => onUpdate({ autoRefresh: !settings.autoRefresh })}
      />
      <SettingRow
        label="Show Patterns"
        desc="Display candlestick patterns in signal cards"
        checked={settings.showPatterns}
        onChange={() => onUpdate({ showPatterns: !settings.showPatterns })}
      />

      {/* API Key */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginBottom: 10, fontFamily: "var(--font-mono)" }}>
          LIVE DATA — TWELVE DATA API
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type={showKey ? "text" : "password"}
            placeholder="Enter API key for live data (leave blank for demo)"
            value={settings.apiKey}
            onChange={(e) => onUpdate({ apiKey: e.target.value })}
            style={{
              flex: 1,
              padding: "9px 12px",
              background: t.surfaceHigh,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              color: t.text,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              outline: "none",
            }}
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            style={{
              padding: "8px 12px",
              background: t.surfaceTop,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              color: t.textSec,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
            }}
          >
            {showKey ? "HIDE" : "SHOW"}
          </button>
        </div>
        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 6, fontFamily: "var(--font-mono)" }}>
          Free tier: 800 requests/day · Get your key at twelvedata.com
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          marginTop: 20,
          padding: "8px 16px",
          background: "transparent",
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          color: t.textMuted,
          cursor: "pointer",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}
      >
        RESET TO DEFAULTS
      </button>
    </div>
  );
}
