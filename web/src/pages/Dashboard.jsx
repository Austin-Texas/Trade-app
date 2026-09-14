import React from "react";
import { Link } from "react-router-dom";
import {
  instruments, signals, opportunities, riskRegions, economicEvents, systemStatus, fmtPrice, fmtVol,
} from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import SignalBadge from "@/components/trading/SignalBadge";
import Sparkline from "@/components/trading/Sparkline";
import CandlestickChart from "@/components/trading/CandlestickChart";
import StatCard from "@/components/trading/StatCard";
import SignalAlertsSummary from "@/components/trading/SignalAlertsSummary";
import RiskCalculator from "@/components/trading/RiskCalculator";
import GmailSignalReport from "@/components/trading/GmailSignalReport";
import { candleData } from "@/lib/mockData";
import { Activity, Globe2, Radar, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const watchlist = ["BTCUSD", "NVDA", "XAUUSD", "EURUSD", "SPY", "USOIL"];

function MarketRow({ inst }) {
  const up = inst.change >= 0;
  const candles = candleData[inst.symbol];
  return (
    <Link to={`/charts?symbol=${inst.symbol}`} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
      <div className="w-24 shrink-0">
        <div className="text-sm font-medium">{inst.symbol}</div>
        <div className="text-[11px] text-muted-foreground truncate">{inst.name}</div>
      </div>
      <div className="hidden sm:block"><Sparkline data={candles} positive={up} /></div>
      <div className="ml-auto text-right">
        <div className="text-sm font-medium tabular-nums">{fmtPrice(inst.price)}</div>
        <div className={`text-xs tabular-nums ${up ? "text-bull" : "text-bear"}`}>
          {up ? "+" : ""}{inst.changePct.toFixed(2)}%
        </div>
      </div>
      <span className={`ml-2 w-1.5 h-1.5 rounded-full ${inst.market === "open" ? "bg-bull" : "bg-muted-foreground/40"}`} title={inst.market} />
    </Link>
  );
}

export default function Dashboard() {
  const topSignals = [...signals].sort((a, b) => b.score - a.score).slice(0, 4);
  const highImpact = economicEvents.filter((e) => e.impact === "HIGH" && new Date(e.time) > Date.now()).slice(0, 3);
  const criticalRisk = riskRegions.filter((r) => ["HIGH", "CRITICAL"].includes(r.level));

  return (
    <div className="space-y-5">
      <PageHeader title="Command Center" subtitle="Global market intelligence, AI signals, and risk overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Instruments Tracked" value={instruments.length} sub="Across 8 asset classes" tone="neutral" icon={Activity} />
        <StatCard label="Active Signals" value={signals.length} sub={`${signals.filter((s) => s.score >= 70).length} high confidence`} tone="bull" icon={Radar} />
        <StatCard label="Elevated Risk Regions" value={criticalRisk.length} sub={`${riskRegions.length} regions monitored`} tone="warn" icon={Globe2} />
        <StatCard label="Backend" value="Online" sub={systemStatus.backend.uptime} tone="bull" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Watchlist */}
        <div className="xl:col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Watchlist</h2>
            <Link to="/markets" className="text-xs text-primary hover:underline">All markets</Link>
          </div>
          <div className="p-2 space-y-0.5">
            {instruments.filter((i) => watchlist.includes(i.symbol)).map((inst) => (
              <MarketRow key={inst.symbol} inst={inst} />
            ))}
          </div>
        </div>

        {/* Featured chart */}
        <div className="xl:col-span-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">BTCUSD · Bitcoin</h2>
              <p className="text-xs text-muted-foreground">EMA 9 / 20 / 50 · Volume · 1H</p>
            </div>
            <Link to="/charts?symbol=BTCUSD" className="text-xs text-primary hover:underline">Open chart →</Link>
          </div>
          <CandlestickChart symbol="BTCUSD" height={300} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-warn" />EMA 9</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary" />EMA 20</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5" style={{ background: "hsl(var(--chart-5))" }} />EMA 50</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Top signals */}
        <div className="xl:col-span-2 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Top AI Signals</h2>
            <Link to="/signals" className="text-xs text-primary hover:underline">All signals</Link>
          </div>
          <div className="divide-y divide-border">
            {topSignals.map((s) => (
              <Link key={s.symbol} to={`/signals?symbol=${s.symbol}`} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors">
                <div className="w-24">
                  <div className="text-sm font-medium">{s.symbol}</div>
                  <div className="text-[11px] text-muted-foreground">{s.category}</div>
                </div>
                <SignalBadge signal={s.signal} size="sm" />
                <div className="hidden md:block text-xs text-muted-foreground">{s.timeframe} · {s.trend}</div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{s.score}/100</div>
                    <div className="text-[11px] text-muted-foreground">{s.confidence}</div>
                  </div>
                  {s.signal.includes("BUY") ? <TrendingUp className="w-4 h-4 text-bull" /> : s.signal.includes("SELL") ? <TrendingDown className="w-4 h-4 text-bear" /> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Risk + calendar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warn" />Risk Watch</h2>
              <Link to="/risk" className="text-xs text-primary hover:underline">Map</Link>
            </div>
            <div className="p-2 space-y-1">
              {riskRegions.slice(0, 4).map((r) => (
                <div key={r.region} className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="truncate">{r.region}</span>
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    r.level === "HIGH" || r.level === "CRITICAL" ? "bg-bear/15 text-bear" : r.level === "ELEVATED" ? "bg-warn/15 text-warn" : "bg-bull/15 text-bull"
                  }`}>{r.level}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Upcoming High-Impact</h2>
              <Link to="/calendar" className="text-xs text-primary hover:underline">Calendar</Link>
            </div>
            <div className="p-2 space-y-1">
              {highImpact.map((e) => (
                <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 text-xs">
                  <span className="text-muted-foreground tabular-nums">{new Date(e.time).toLocaleDateString("en-CA")}</span>
                  <span className="truncate">{e.event}</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-bear/15 text-bear text-[10px]">{e.country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RiskCalculator />

      <GmailSignalReport />

      <SignalAlertsSummary />
    </div>
  );
}