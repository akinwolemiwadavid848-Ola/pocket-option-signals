/**
 * context/ThemeContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global theme context.
 * Provides the current theme name and a toggle function.
 * Persists preference to localStorage.
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback } from "react";
import { THEMES } from "../constants/theme.js";

const ThemeContext = createContext(null);

const STORAGE_KEY = "pos_theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const t = THEMES[theme] ?? THEMES.dark;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook — returns { theme, toggleTheme, t } where t is the full token object.
 * @returns {{ theme: string, toggleTheme: ()=>void, t: typeof THEMES.dark }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
