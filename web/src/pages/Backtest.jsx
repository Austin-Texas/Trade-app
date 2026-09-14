import React from "react";
import { backtestStats } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import StatCard from "@/components/trading/StatCard";
import StrategyLiveComparison from "@/components/trading/StrategyLiveComparison";
import StrategyPerformanceChart from "@/components/trading/StrategyPerformanceChart";
import { BarChart3, Trophy, TrendingDown, Scale } from "lucide-react";

function PerfTable({ title, rows, keys }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">{title}</h3></div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground border-b border-border">
            {keys.map((k) => <th key={k.label} className={`px-4 py-2 font-medium ${k.right ? "text-right" : ""}`}>{k.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-secondary transition-colors">
              {keys.map((k) => (
                <td key={k.label} className={`px-4 py-2.5 ${k.right ? "text-right tabular-nums" : ""} ${k.tone ? (r[k.field] >= 60 ? "text-bull" : r[k.field] >= 50 ? "text-warn" : "text-bear") : ""}`}>
                  {k.fmt ? k.fmt(r[k.field]) : r[k.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Backtest() {
  const b = backtestStats;
  return (
    <div className="space-y-4">
      <PageHeader title="Backtesting" subtitle="Historical performance of the signal engine across assets, timeframes & conditions" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Win Rate" value={`${b.winRate}%`} sub={`${b.wins}W / ${b.losses}L`} tone={b.winRate >= 60 ? "bull" : "warn"} icon={Trophy} />
        <StatCard label="Profit Factor" value={b.profitFactor.toFixed(2)} sub={`Avg R/R ${b.avgRR.toFixed(2)}`} tone="bull" icon={Scale} />
        <StatCard label="Avg Gain / Loss" value={`+${b.avgGain}% / ${b.avgLoss}%`} sub="per trade" tone="neutral" icon={BarChart3} />
        <StatCard label="Max Drawdown" value={`-${b.maxDrawdown}%`} sub={`Sharpe ${b.sharpe}`} tone="bear" icon={TrendingDown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PerfTable title="Performance by Asset" rows={b.byAsset} keys={[
          { label: "Asset", field: "asset" },
          { label: "Signals", field: "signals", right: true },
          { label: "Win Rate", field: "winRate", right: true, tone: true, fmt: (v) => `${v}%` },
          { label: "PF", field: "profitFactor", right: true, fmt: (v) => v.toFixed(2) },
        ]} />
        <PerfTable title="By Timeframe" rows={b.byTimeframe} keys={[
          { label: "Timeframe", field: "timeframe" },
          { label: "Signals", field: "signals", right: true },
          { label: "Win Rate", field: "winRate", right: true, tone: true, fmt: (v) => `${v}%` },
        ]} />
        <PerfTable title="By Market Condition" rows={b.byCondition} keys={[
          { label: "Condition", field: "condition" },
          { label: "Signals", field: "signals", right: true },
          { label: "Win Rate", field: "winRate", right: true, tone: true, fmt: (v) => `${v}%` },
        ]} />
      </div>

      <StrategyPerformanceChart />

      <StrategyLiveComparison />

      <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
        ⚠ High confidence percentages are meaningless without measured historical performance. Every strategy above is tracked against realized outcomes before being trusted.
      </div>
    </div>
  );
}