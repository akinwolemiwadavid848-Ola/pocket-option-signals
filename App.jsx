/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────
 * Root application component.
 * Wires up global context providers and renders the Dashboard.
 * ─────────────────────────────────────────────────────────────
 */

import { ThemeProvider }    from "./context/ThemeContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import Dashboard            from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Dashboard />
      </SettingsProvider>
    </ThemeProvider>
  );
}
