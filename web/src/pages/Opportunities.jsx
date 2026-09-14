import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { opportunities, assetClasses, signalLevels } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import SignalBadge from "@/components/trading/SignalBadge";
import ScoreBar from "@/components/trading/ScoreBar";
import { Radar } from "lucide-react";

const sessions = ["All", "Global", "US", "Europe", "Asia"];
const risks = ["All", "Low", "Medium", "High"];

export default function Opportunities() {
  const [market, setMarket] = useState("All");
  const [signal, setSignal] = useState("All");
  const [session, setSession] = useState("All");
  const [risk, setRisk] = useState("All");
  const [minScore, setMinScore] = useState(0);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (market !== "All" && o.category !== market) return false;
      if (signal !== "All" && o.signal !== signal) return false;
      if (session !== "All" && o.session !== session) return false;
      if (risk !== "All" && o.risk !== risk) return false;
      if (o.score < minScore) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [market, signal, session, risk, minScore]);

  return (
    <div className="space-y-4">
      <PageHeader title="AI Opportunities" subtitle="Continuously ranked market setups by AI confidence score" />

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select value={market} onChange={(e) => setMarket(e.target.value)} className="h-9 px-2 rounded-md bg-secondary border border-border text-sm">
            <option value="All">All Markets</option>
            {assetClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={signal} onChange={(e) => setSignal(e.target.value)} className="h-9 px-2 rounded-md bg-secondary border border-border text-sm">
            <option value="All">All Signals</option>
            {signalLevels.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={session} onChange={(e) => setSession(e.target.value)} className="h-9 px-2 rounded-md bg-secondary border border-border text-sm">
            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} className="h-9 px-2 rounded-md bg-secondary border border-border text-sm">
            {risks.map((r) => <option key={r} value={r}>{r === "All" ? "All Risk" : r}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Min score</span>
            <input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="flex-1 accent-primary" />
            <span className="text-xs tabular-nums w-8 text-right">{minScore}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Symbol</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Asset</th>
                <th className="px-4 py-2 font-medium">Signal</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Timeframe</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Session</th>
                <th className="px-4 py-2 font-medium hidden lg:table-cell">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.symbol} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{o.rank}</td>
                  <td className="px-4 py-3">
                    <Link to={`/signals?symbol=${o.symbol}`} className="font-medium hover:text-primary">{o.symbol}</Link>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">{o.name}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{o.category}</td>
                  <td className="px-4 py-3"><SignalBadge signal={o.signal} size="sm" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ScoreBar score={o.score} compact />
                      <span className="text-xs font-medium tabular-nums shrink-0">{o.score}/100</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{o.timeframe}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{o.session}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs ${o.risk === "Low" ? "text-bull" : o.risk === "Medium" ? "text-warn" : "text-bear"}`}>{o.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Radar className="w-6 h-6 opacity-50" />
            No opportunities match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}