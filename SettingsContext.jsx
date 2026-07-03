/**
 * context/SettingsContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global application settings context.
 * Persists to localStorage. Provides typed settings and updater.
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback } from "react";
import { ENV_API_KEY, DEFAULT_FAVORITES } from "../constants/config.js";

/** @typedef {{ apiKey: string, autoRefresh: boolean, sound: boolean, showPatterns: boolean, favorites: string[] }} Settings */

const STORAGE_KEY = "pos_settings";

/** @type {Settings} */
const DEFAULT_SETTINGS = {
  apiKey:       ENV_API_KEY,
  autoRefresh:  true,
  sound:        false,
  showPatterns: true,
  favorites:    DEFAULT_FAVORITES,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(loadSettings);

  const updateSettings = useCallback((partial) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  const toggleFavorite = useCallback((symbol) => {
    setSettingsState((prev) => {
      const favs = prev.favorites.includes(symbol)
        ? prev.favorites.filter((f) => f !== symbol)
        : [...prev.favorites, symbol];
      const next = { ...prev, favorites: favs };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, toggleFavorite }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook — access global settings and updaters.
 * @returns {{ settings: Settings, updateSettings: (partial: Partial<Settings>)=>void, resetSettings: ()=>void, toggleFavorite: (symbol:string)=>void }}
 */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
