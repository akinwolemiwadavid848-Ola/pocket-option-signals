/**
 * components/AppFooter.jsx
 * ─────────────────────────────────────────────────────────────
 * Bottom footer — version, supported pairs, and indicator list.
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme }    from "../context/ThemeContext.jsx";
import { APP_VERSION } from "../constants/config.js";

export default function AppFooter() {
  const { t } = useTheme();

  return (
    <div style={{ marginTop: 24, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: t.textMuted, fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
        POCKET OPTION SIGNALS v{APP_VERSION} · Educational Use Only · OTC Pairs<br />
        AUD/CAD · AUD/USD · EUR/USD · GBP/JPY · USD/CAD · USD/JPY · GOLD<br />
        EMA · RSI · MACD · Bollinger Bands · Stochastic RSI · ADX · ATR · S/R<br />
        Per-Pair Optimized Profiles · Candlestick Patterns · Breakout Detection
      </div>
    </div>
  );
}
