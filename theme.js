/**
 * constants/theme.js
 * ─────────────────────────────────────────────────────────────
 * Complete design token system for dark and light themes.
 * Every colour, surface, and semantic token is defined here.
 * ─────────────────────────────────────────────────────────────
 */

export const THEMES = {
  dark: {
    bg:            "#060912",
    surface:       "#0d1117",
    surfaceHigh:   "#141924",
    surfaceTop:    "#1c2333",
    border:        "#1e2d45",
    borderLight:   "#243550",
    text:          "#e2e8f0",
    textSec:       "#8892a4",
    textMuted:     "#4a5568",
    accent:        "#3b82f6",
    accentGlow:    "rgba(59,130,246,0.15)",
    // Signal colours
    call:          "#10b981",
    callBg:        "rgba(16,185,129,0.08)",
    callBorder:    "rgba(16,185,129,0.25)",
    put:           "#ef4444",
    putBg:         "rgba(239,68,68,0.08)",
    putBorder:     "rgba(239,68,68,0.25)",
    wait:          "#f59e0b",
    waitBg:        "rgba(245,158,11,0.08)",
    waitBorder:    "rgba(245,158,11,0.25)",
    // Glass
    glass:         "rgba(13,17,23,0.85)",
    glassBorder:   "rgba(30,45,69,0.6)",
  },
  light: {
    bg:            "#f0f4f8",
    surface:       "#ffffff",
    surfaceHigh:   "#f8fafc",
    surfaceTop:    "#edf2f7",
    border:        "#cbd5e0",
    borderLight:   "#e2e8f0",
    text:          "#1a202c",
    textSec:       "#4a5568",
    textMuted:     "#a0aec0",
    accent:        "#2563eb",
    accentGlow:    "rgba(37,99,235,0.1)",
    call:          "#059669",
    callBg:        "rgba(5,150,105,0.06)",
    callBorder:    "rgba(5,150,105,0.2)",
    put:           "#dc2626",
    putBg:         "rgba(220,38,38,0.06)",
    putBorder:     "rgba(220,38,38,0.2)",
    wait:          "#d97706",
    waitBg:        "rgba(217,119,6,0.06)",
    waitBorder:    "rgba(217,119,6,0.2)",
    glass:         "rgba(255,255,255,0.9)",
    glassBorder:   "rgba(203,213,224,0.7)",
  },
};

/** @param {"dark"|"light"} theme @returns {typeof THEMES.dark} */
export function getTheme(theme) {
  return THEMES[theme] ?? THEMES.dark;
}

/**
 * Returns signal-specific colour tokens.
 * @param {"CALL"|"PUT"|"WAIT"} signal
 * @param {typeof THEMES.dark} t - current theme tokens
 */
export function getSignalColors(signal, t) {
  const map = {
    CALL: { color: t.call, bg: t.callBg, border: t.callBorder, glow: t.call + "30" },
    PUT:  { color: t.put,  bg: t.putBg,  border: t.putBorder,  glow: t.put  + "30" },
    WAIT: { color: t.wait, bg: t.waitBg, border: t.waitBorder,  glow: t.wait + "25" },
  };
  return map[signal] ?? map.WAIT;
}
