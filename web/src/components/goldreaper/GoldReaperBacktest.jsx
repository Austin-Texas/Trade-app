import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, Activity, Trophy, Scale, TrendingDown, Gauge } from "lucide-react";

function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function hashCfg(cfg) {
  const key = `${cfg.trade_frequency}|${cfg.max_allowed_drawdown}|${cfg.max_daily_drawdown}|${cfg.start_lots}|${cfg.lotsize_calc_method}|${cfg.enable_nfp_filter}|${cfg.only_up}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

const FREQ = {
  very_conservative: { trades: 120, winRate: 0.68 },
  conservative: { trades: 250, winRate: 0.64 },
  normal: { trades: 500, winRate: 0.6 },
  aggressive: { trades: 900, winRate: 0.56 },
  extreme: { trades: 1500, winRate: 0.52 },
  startlots: { trades: 600, winRate: 0.58 },
};

function simulate(cfg) {
  let { trades, winRate } = FREQ[cfg.trade_frequency] || FREQ.normal;
  if (cfg.trade_frequency === "auto") {
    const dd = Number(cfg.max_allowed_drawdown) || 20;
    trades = Math.round(200 + dd * 30);
    winRate = 0.66 - Math.min(0.12, dd * 0.004);
  }
  if (cfg.enable_nfp_filter) { trades = Math.round(trades * 0.92); winRate = Math.min(0.72, winRate + 0.02); }

  const rnd = seeded(hashCfg(cfg) + 13);
  const months = 24;
  const tradesPerMonth = trades / months;
  let equity = 1000;
  const curve = [{ i: 0, equity: 1000, label: "M0" }];
  let wins = 0, losses = 0, grossWin = 0, grossLoss = 0, maxDD = 0, maxDDpct = 0;

  for (let m = 1; m <= months; m++) {
    const monthStart = equity;
    let peak = equity;
    let dailyLoss = 0;
    const n = Math.max(1, Math.round(tradesPerMonth * (0.8 + rnd() * 0.4)));
    for (let t = 0; t < n; t++) {
      let lot = Number(cfg.start_lots) || 0.01;
      if (cfg.lotsize_calc_method === "max_drawdown") {
        lot = Math.max(Number(cfg.start_lots) || 0.01, (equity / 1000) * (Number(cfg.start_lots) || 0.01) * (Number(cfg.max_allowed_drawdown) || 20) / 20);
      }
      const isWin = rnd() < winRate;
      const r = (isWin ? 1.6 : -1.0) * (0.8 + rnd() * 0.5);
      const pnl = r * lot * 100;
      equity += pnl;
      peak = Math.max(peak, equity);
      if (isWin) { wins++; grossWin += Math.abs(pnl); dailyLoss = 0; }
      else { losses++; grossLoss += Math.abs(pnl); dailyLoss += Math.abs(pnl); }
      const dd = peak - equity;
      if (dd > maxDD) { maxDD = dd; maxDDpct = (dd / peak) * 100; }
      if (Number(cfg.max_daily_drawdown) > 0 && dailyLoss > monthStart * (Number(cfg.max_daily_drawdown) / 100)) break;
    }
    curve.push({ i: m, equity: Math.round(equity), label: `M${m}` });
  }

  const totalTrades = wins + losses;
  return {
    curve,
    stats: {
      totalTrades,
      winRatePct: totalTrades ? (wins / totalTrades) * 100 : 0,
      profitFactor: grossLoss ? grossWin / grossLoss : grossWin > 0 ? 99 : 0,
      totalReturnPct: (equity - 1000) / 10,
      maxDDpct,
      recoveryFactor: maxDD > 0 ? (equity - 1000) / maxDD : 0,
      finalEquity: Math.round(equity),
    },
  };
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = { bull: "text-bull", bear: "text-bear", warn: "text-warn", neutral: "text-foreground" };
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className={`text-lg font-semibold tabular-nums mt-1 ${tones[tone]}`}>{value}</div>
    </div>
  );
}

export default function GoldReaperBacktest({ config }) {
  const result = useMemo(() => simulate(config), [config]);
  const s = result.stats;
  const fmt = (v) => (v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toFixed(2));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat icon={TrendingUp} label="Total Return" value={`${s.totalReturnPct >= 0 ? "+" : ""}${s.totalReturnPct.toFixed(1)}%`} tone="bull" />
        <Stat icon={Trophy} label="Win Rate" value={`${s.winRatePct.toFixed(1)}%`} tone={s.winRatePct >= 60 ? "bull" : "warn"} />
        <Stat icon={Scale} label="Profit Factor" value={s.profitFactor.toFixed(2)} tone={s.profitFactor >= 1.3 ? "bull" : "warn"} />
        <Stat icon={Activity} label="Total Trades" value={s.totalTrades.toLocaleString()} tone="neutral" />
        <Stat icon={TrendingDown} label="Max Drawdown" value={`-${s.maxDDpct.toFixed(1)}%`} tone="bear" />
        <Stat icon={Gauge} label="Recovery Factor" value={s.recoveryFactor.toFixed(2)} tone="bull" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Equity Curve · 24 months · {config.symbol} {config.timeframe}</h3>
          <span className="text-xs text-muted-foreground">Mode: {config.trade_frequency} · Max DD {config.max_allowed_drawdown}%</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.curve} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={48} tickFormatter={(v) => fmt(v)} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(v) => [`$${fmt(v)}`, "Equity"]}
            />
            <ReferenceLine y={1000} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="equity" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}