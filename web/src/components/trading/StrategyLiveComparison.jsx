import React, { useState, useEffect, useMemo } from "react";
import { strategyLiveComparison } from "@/lib/mockData";
import { GitCompareArrows, Activity, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Tracker comparing each defined (backtested) strategy against the current live
// market movement of its underlying symbol. The live column ticks periodically to
// simulate the real-time market feed from the backend.
const WINDOWS = [
  { label: "7D", factor: 0.25 },
  { label: "30D", factor: 1 },
  { label: "90D", factor: 2.6 },
];

function pct(v) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function DeltaPill({ delta }) {
  const verdict = delta > 0.5 ? "OUTPERFORM" : delta < -0.5 ? "UNDERPERFORM" : "IN-LINE";
  const Icon = delta > 0.5 ? TrendingUp : delta < -0.5 ? TrendingDown : Minus;
  const tone = delta > 0.5 ? "text-bull" : delta < -0.5 ? "text-bear" : "text-warn";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon className="w-3.5 h-3.5" />
      {verdict}
    </span>
  );
}

export default function StrategyLiveComparison() {
  const [windowIdx, setWindowIdx] = useState(1);
  const [liveOverrides, setLiveOverrides] = useState({});
  const [lastTick, setLastTick] = useState(new Date());

  const factor = WINDOWS[windowIdx].factor;

  // Periodically nudge the live market return per symbol to simulate the live feed.
  useEffect(() => {
    const id = setInterval(() => {
      setLiveOverrides((prev) => {
        const next = {};
        strategyLiveComparison.forEach((s) => {
          const base = prev[s.symbol] ?? s.liveMarketReturnPct;
          // small random walk bounded to +/- 12% band around the backtest baseline
          const nudge = (Math.random() - 0.5) * 0.4;
          next[s.symbol] = Math.max(-15, Math.min(15, base + nudge));
        });
        return next;
      });
      setLastTick(new Date());
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    return strategyLiveComparison.map((s) => {
      const stratReturn = s.backtestReturnPct * factor;
      const liveReturn = (liveOverrides[s.symbol] ?? s.liveMarketReturnPct) * factor;
      const delta = stratReturn - liveReturn;
      return { ...s, stratReturn, liveReturn, delta };
    });
  }, [factor, liveOverrides]);

  const beating = rows.filter((r) => r.delta > 0.5).length;
  const avgAlpha = rows.reduce((sum, r) => sum + r.delta, 0) / rows.length;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Strategy vs Live Market Tracker</h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-bull">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse" /> LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {WINDOWS.map((w, i) => (
              <button
                key={w.label}
                onClick={() => setWindowIdx(i)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  windowIdx === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const next = {};
              strategyLiveComparison.forEach((s) => {
                next[s.symbol] = Math.max(-15, Math.min(15, (liveOverrides[s.symbol] ?? s.liveMarketReturnPct) + (Math.random() - 0.5) * 2));
              });
              setLiveOverrides(next);
              setLastTick(new Date());
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground"
            title="Refresh live market readings"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 py-3 bg-secondary/30 border-b border-border text-xs">
        <div>
          <div className="text-muted-foreground">Strategies beating live market</div>
          <div className="font-semibold text-bull mt-0.5">{beating}/{rows.length}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Average alpha (strategy − live)</div>
          <div className={`font-semibold mt-0.5 ${avgAlpha >= 0 ? "text-bull" : "text-bear"}`}>{pct(avgAlpha)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last live tick</div>
          <div className="font-semibold tabular-nums mt-0.5 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-bull" />{lastTick.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-4 py-2 font-medium">Strategy</th>
              <th className="px-4 py-2 font-medium">Symbol</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Direction</th>
              <th className="px-4 py-2 font-medium text-right">Strategy Return</th>
              <th className="px-4 py-2 font-medium text-right">Live Market</th>
              <th className="px-4 py-2 font-medium text-right">Alpha</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell text-right">Max DD</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell text-right">Trades</th>
              <th className="px-4 py-2 font-medium hidden lg:table-cell text-right">Win Rate</th>
              <th className="px-4 py-2 font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-secondary transition-colors">
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5">{r.symbol}</td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <span className={`text-xs font-medium ${r.direction === "BUY" ? "text-bull" : "text-bear"}`}>{r.direction}</span>
                </td>
                <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${r.stratReturn >= 0 ? "text-bull" : "text-bear"}`}>{pct(r.stratReturn)}</td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${r.liveReturn >= 0 ? "text-bull" : "text-bear"}`}>{pct(r.liveReturn)}</td>
                <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${r.delta >= 0 ? "text-bull" : "text-bear"}`}>{pct(r.delta)}</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-right tabular-nums text-bear">-{(r.maxDrawdownPct * factor).toFixed(1)}%</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-right tabular-nums text-muted-foreground">{r.trades}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-right tabular-nums text-muted-foreground">{r.winRate}%</td>
                <td className="px-4 py-2.5"><DeltaPill delta={r.delta} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
        Strategy return = backtested rule performance over the selected window. Live market = passive buy-and-hold of the same symbol, ticking from the live feed. Alpha = strategy − live. Past backtested performance does not guarantee future results.
      </div>
    </div>
  );
}