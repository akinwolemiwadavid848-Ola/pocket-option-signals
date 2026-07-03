/**
 * components/CurrencySelector.jsx
 * ─────────────────────────────────────────────────────────────
 * Renders the 7 supported OTC pairs as tappable cards.
 * Selecting a pair immediately activates analysis for it only.
 * ─────────────────────────────────────────────────────────────
 */

import { useTheme } from "../context/ThemeContext.jsx";
import { CURRENCY_PAIRS } from "../constants/pairs.js";

export default function CurrencySelector({ selected, onSelect, favorites, filter }) {
  const { t } = useTheme();

  const filtered = CURRENCY_PAIRS.filter(
    (p) => !filter || p.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: t.textMuted,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 8,
          fontFamily: "var(--font-mono)",
        }}
      >
        OTC Pairs — M1 Signals
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {filtered.map((pair) => {
          const isSelected = selected === pair.symbol;
          const isFav      = favorites.includes(pair.symbol);

          return (
            <button
              key={pair.symbol}
              onClick={() => onSelect(pair.symbol)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 10,
                border: isSelected ? `1.5px solid ${t.accent}` : `1px solid ${t.border}`,
                background: isSelected ? t.accent + "18" : t.surface,
                color: isSelected ? t.accent : t.textSec,
                fontSize: 12,
                fontWeight: isSelected ? 700 : 500,
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                transition: "all 0.18s",
                boxShadow: isSelected ? `0 0 10px ${t.accent}20` : "none",
              }}
            >
              <span style={{ fontSize: 14 }}>{pair.flag}</span>
              {pair.symbol}
              {isFav && <span style={{ fontSize: 9, color: "#f59e0b", marginLeft: 1 }}>★</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            color: t.textMuted,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          No pairs match "{filter}"
        </div>
      )}
    </div>
  );
}
