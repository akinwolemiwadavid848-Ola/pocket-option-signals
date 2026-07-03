/**
 * pages/Dashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Main dashboard page. Orchestrates currency selection, signal
 * generation, history, statistics, and settings tabs.
 *
 * This is the only "smart" page-level component — it wires
 * hooks and context together and delegates rendering to the
 * presentational components in components/.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import { useTheme }    from "../context/ThemeContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { useSignal, useHistory } from "../hooks/index.js";
import {
  AppHeader, AppFooter, NavBar, Disclaimer,
  CurrencySelector, AppStatusBar, SignalCard,
  SignalHistory, StatisticsPanel, SettingsPanel,
} from "../components/index.js";
import { SearchBar } from "../components/ui/index.js";

export default function Dashboard() {
  const { t } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();

  const [selectedPair, setSelectedPair] = useState(null);
  const [activeTab, setActiveTab]       = useState("signal");
  const [search, setSearch]             = useState("");

  const { result, candles, loading, demoMode, refresh, countdown } =
    useSignal(selectedPair, settings.apiKey, settings.autoRefresh);

  const { history, addEntry } = useHistory();

  // Record each new unique result into history exactly once
  const lastTimestampRef = useRef(null);
  useEffect(() => {
    if (result && lastTimestampRef.current !== result.timestamp) {
      lastTimestampRef.current = result.timestamp;
      addEntry(result);
    }
  }, [result, addEntry]);

  const handleSelectPair = (symbol) => {
    setSelectedPair(symbol);
    setActiveTab("signal");
  };

  const bgGradient = result
    ? result.signal === "CALL"
      ? `radial-gradient(ellipse at top left, ${t.call}06 0%, transparent 60%)`
      : result.signal === "PUT"
      ? `radial-gradient(ellipse at top right, ${t.put}06 0%, transparent 60%)`
      : `radial-gradient(ellipse at top, ${t.wait}05 0%, transparent 60%)`
    : "none";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        backgroundImage: bgGradient,
        transition: "background-image 0.5s",
        padding: "0 0 40px",
      }}
    >
      <AppHeader demoMode={demoMode} loading={loading} />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 14px 0" }}>
        <Disclaimer />

        <NavBar activeTab={activeTab} onTabChange={setActiveTab} demoMode={demoMode} />

        {activeTab === "signal" && (
          <div style={{ animation: "slideInUp 0.2s ease" }}>
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <CurrencySelector
                selected={selectedPair}
                onSelect={handleSelectPair}
                favorites={settings.favorites}
                filter={search}
              />
            </div>

            {selectedPair && (
              <>
                <AppStatusBar
                  refreshing={loading}
                  onRefresh={refresh}
                  selectedPair={selectedPair}
                  countdown={countdown}
                />
                <div style={{ animation: "slideInUp 0.25s ease" }}>
                  <SignalCard
                    result={result}
                    candles={candles}
                    demoMode={demoMode}
                    isLoading={loading && !result}
                    countdown={countdown}
                  />
                </div>
              </>
            )}

            {!selectedPair && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: t.textMuted,
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  lineHeight: 2,
                }}
              >
                Select a currency pair above<br />to generate a signal
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ animation: "slideInUp 0.2s ease" }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px" }}>
              <SignalHistory history={history} />
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div style={{ animation: "slideInUp 0.2s ease" }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px" }}>
              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginBottom: 14, fontFamily: "var(--font-mono)" }}>
                SESSION STATISTICS
              </div>
              <StatisticsPanel history={history} />
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ animation: "slideInUp 0.2s ease" }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px" }}>
              <SettingsPanel
                settings={settings}
                onUpdate={updateSettings}
                onReset={resetSettings}
              />
            </div>
          </div>
        )}

        <AppFooter />
      </div>
    </div>
  );
}
