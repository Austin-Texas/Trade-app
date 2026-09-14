import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { strategyLiveComparison } from "@/lib/mockData";
import { LineChart as LineChartIcon, GitCompareArrows } from "lucide-react";

const WINDOWS = [
  { label: "7D", days: 7, factor: 0.25 },
  { label: "30D", days: 30, factor: 1 },
  { label: "90D", days: 90, factor: 2.6 },
];

// Deterministic PRNG so curves are stable across renders.
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Build a daily cumulative-return series ending at `endReturnPct`, with optional
// drawdown dip for the strategy curve. Anchor: start at 0, end at endReturn.
function buildSeries(days, endReturnPct, drawdownPct, seed, isStrategy) {
  const rnd = seeded(seed);
  const pts = [];
  for (let i = 0; i <= days; i++) {
    const progress = i / days;
    // Base trajectory: smooth curve toward the endpoint with some noise.
    const base = endReturnPct * (progress + (Math.sin(progress * 6) * 0.04));
    const noise = (rnd() - 0.5) * Math.abs(endReturnPct) * 0.06;
    let value = base + noise;

    if (isStrategy && drawdownPct > 0) {
      // One drawdown trough around 55-70% through the window, then partial recovery.
      const dipCenter = 0.62;
      const dipWidth = 0.18;
      const dipShape = Math.exp(-Math.pow((progress - dipCenter) / dipWidth, 2));
      value -= drawdownPct * dipShape;
    }
    pts.push({ day: i, value: Number(value.toFixed(2)) });
  }
  return pts;
}

function fmtPct(v) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export default function StrategyPerformanceChart() {
  const [strategyIdx, setStrategyIdx] = useState(0);
  const [windowIdx, setWindowIdx] = useState(1);

  const strategy = strategyLiveComparison[strategyIdx];
  const win = WINDOWS[windowIdx];

  const data = useMemo(() => {
    const strat = buildSeries(win.days, strategy.backtestReturnPct * win.factor, strategy.maxDrawdownPct * win.factor, strategyIdx * 31 + win.days, true);
    const mkt = buildSeries(win.days, strategy.liveMarketReturnPct * win.factor, 0, strategyIdx * 31 + win.days + 7, false);
    return strat.map((p, i) => ({
      day: p.day,
      strategy: p.value,
      market: mkt[i].value,
    }));
  }, [strategyIdx, win, strategy]);

  const finalStrategy = strategy.backtestReturnPct * win.factor;
  const finalMarket = strategy.liveMarketReturnPct * win.factor;
  const alpha = finalStrategy - finalMarket;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <LineChartIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Strategy vs Market Performance Plot</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={strategyIdx}
            onChange={(e) => setStrategyIdx(Number(e.target.value))}
            className="h-8 px-2 rounded-md bg-secondary border border-border text-xs"
          >
            {strategyLiveComparison.map((s, i) => (
              <option key={s.name} value={i}>{s.name} · {s.symbol}</option>
            ))}
          </select>
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
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-3 bg-secondary/30 border-b border-border text-xs">
        <div>
          <div className="text-muted-foreground">Strategy final</div>
          <div className={`font-semibold mt-0.5 ${finalStrategy >= 0 ? "text-bull" : "text-bear"}`}>{fmtPct(finalStrategy)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Market final</div>
          <div className={`font-semibold mt-0.5 ${finalMarket >= 0 ? "text-bull" : "text-bear"}`}>{fmtPct(finalMarket)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Alpha</div>
          <div className={`font-semibold mt-0.5 ${alpha >= 0 ? "text-bull" : "text-bear"}`}>{fmtPct(alpha)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Max drawdown</div>
          <div className="font-semibold mt-0.5 text-bear">-{(strategy.maxDrawdownPct * win.factor).toFixed(2)}%</div>
        </div>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 12% 17%)" />
            <XAxis
              dataKey="day"
              stroke="hsl(215 16% 58%)"
              tick={{ fontSize: 11 }}
              tickFormatter={(d) => `D${d}`}
              label={{ value: "Day", position: "insideBottom", offset: -2, fill: "hsl(215 16% 58%)", fontSize: 11 }}
            />
            <YAxis
              stroke="hsl(215 16% 58%)"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
              width={52}
            />
            <ReferenceLine y={0} stroke="hsl(215 16% 40%)" strokeDasharray="2 2" />
            <Tooltip
              contentStyle={{ background: "hsl(222 15% 9%)", border: "1px solid hsl(222 12% 17%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 20% 94%)" }}
              labelFormatter={(d) => `Day ${d}`}
              formatter={(v, name) => [fmtPct(v), name === "strategy" ? "Strategy" : "Market"]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
              formatter={(v) => (v === "strategy" ? "Strategy (backtest)" : "Market (buy & hold)")}
            />
            <Line type="monotone" dataKey="strategy" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={false} name="strategy" />
            <Line type="monotone" dataKey="market" stroke="hsl(38 92% 50%)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="market" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
        Solid line = your strategy's backtested equity curve (includes a modeled drawdown). Dashed line = passive buy-and-hold of the same symbol over the identical window. Curves are simulated from backtest summary data pending the live backend feed. Past performance does not guarantee future results.
      </div>
    </div>
  );
}