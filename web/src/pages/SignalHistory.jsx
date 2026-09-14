import React, { useState, useMemo } from "react";
import { signalHistory, historyOutcomes, fmtPrice } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import SignalBadge from "@/components/trading/SignalBadge";

function outcomeClass(o) {
  return {
    WIN: "bg-bull/15 text-bull", LOSS: "bg-bear/15 text-bear", EXPIRED: "bg-secondary text-muted-foreground",
    INVALIDATED: "bg-warn/15 text-warn", PENDING: "bg-primary/15 text-primary",
  }[o] || "bg-secondary";
}

export default function SignalHistory() {
  const [outcome, setOutcome] = useState("All");
  const filtered = useMemo(() => {
    return signalHistory.filter((s) => outcome === "All" || s.outcome === outcome)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [outcome]);

  const wins = signalHistory.filter((s) => s.outcome === "WIN").length;
  const losses = signalHistory.filter((s) => s.outcome === "LOSS").length;
  const realized = signalHistory.filter((s) => s.outcome === "WIN" || s.outcome === "LOSS").length;
  const winRate = realized ? ((wins / realized) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <PageHeader title="Signal History" subtitle="Every prediction saved and tracked against realized outcomes" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs text-muted-foreground uppercase">Total Saved</div><div className="text-2xl font-bold tabular-nums mt-1">{signalHistory.length}</div></div>
        <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs text-muted-foreground uppercase">Wins</div><div className="text-2xl font-bold tabular-nums text-bull mt-1">{wins}</div></div>
        <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs text-muted-foreground uppercase">Losses</div><div className="text-2xl font-bold tabular-nums text-bear mt-1">{losses}</div></div>
        <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs text-muted-foreground uppercase">Realized Win Rate</div><div className="text-2xl font-bold tabular-nums mt-1">{winRate}%</div></div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {["All", ...historyOutcomes].map((o) => (
          <button key={o} onClick={() => setOutcome(o)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              outcome === o ? "bg-primary/15 text-accent-foreground border-primary/40" : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}>{o}</button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2 font-medium">Symbol</th>
                <th className="px-4 py-2 font-medium">Signal</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Conf.</th>
                <th className="px-4 py-2 font-medium text-right">Entry</th>
                <th className="px-4 py-2 font-medium text-right">Stop</th>
                <th className="px-4 py-2 font-medium text-right">Target</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-2 font-medium">Outcome</th>
                <th className="px-4 py-2 font-medium text-right">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => (
                <tr key={i} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-2.5 font-medium">{s.symbol}</td>
                  <td className="px-4 py-2.5"><SignalBadge signal={s.signal} size="sm" /></td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-muted-foreground tabular-nums">{s.confidence}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtPrice(s.entry)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-bear">{fmtPrice(s.stop)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-bull">{fmtPrice(s.target)}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground tabular-nums whitespace-nowrap">{new Date(s.date).toLocaleDateString("en-CA")}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${outcomeClass(s.outcome)}`}>{s.outcome}</span></td>
                  <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${s.pnl === null ? "text-muted-foreground" : s.pnl > 0 ? "text-bull" : s.pnl < 0 ? "text-bear" : "text-muted-foreground"}`}>
                    {s.pnl === null ? "—" : `${s.pnl > 0 ? "+" : ""}${s.pnl}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}