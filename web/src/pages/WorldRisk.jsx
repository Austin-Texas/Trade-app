import React from "react";
import { riskRegions, riskLevels } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import { Globe2 } from "lucide-react";

function levelClass(level) {
  return {
    LOW: "bg-bull/15 text-bull border-bull/30",
    MODERATE: "bg-primary/15 text-primary border-primary/30",
    ELEVATED: "bg-warn/15 text-warn border-warn/30",
    HIGH: "bg-bear/15 text-bear border-bear/30",
    CRITICAL: "bg-bear/25 text-bear border-bear/50",
  }[level] || "bg-secondary";
}

function LevelBar({ score }) {
  const color = score >= 70 ? "bg-bear" : score >= 50 ? "bg-warn" : score >= 30 ? "bg-primary" : "bg-bull";
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function WorldRisk() {
  const counts = riskLevels.map((l) => ({ level: l, count: riskRegions.filter((r) => r.level === l).length }));
  const overall = Math.round(riskRegions.reduce((a, r) => a + r.score, 0) / riskRegions.length);

  return (
    <div className="space-y-4">
      <PageHeader title="World Risk Engine" subtitle="Geopolitical early-warning scores — probabilities, not certainties" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center justify-center">
          <Globe2 className="w-8 h-8 text-warn mb-2" />
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Global Risk Index</div>
          <div className="text-4xl font-bold tabular-nums mt-1">{overall}</div>
          <div className={`mt-1 px-3 py-1 rounded text-sm font-medium border ${levelClass("ELEVATED")}`}>ELEVATED</div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Weighted average across monitored regions. Does not predict specific conflict.</p>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Risk Distribution</h3>
          <div className="grid grid-cols-5 gap-2">
            {counts.map((c) => (
              <div key={c.level} className="text-center">
                <div className={`rounded-md border p-3 ${levelClass(c.level)}`}>
                  <div className="text-2xl font-bold tabular-nums">{c.count}</div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{c.level}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Risk levels aggregate conflict escalation, political instability, sanctions, trade disputes, energy & shipping disruptions, and elections.
            Probabilities reflect early-warning signals — never certainty that an event will occur.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Regional Risk Monitor</h3></div>
        <div className="divide-y divide-border">
          {riskRegions.map((r) => (
            <div key={r.region} className="p-4 hover:bg-secondary transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{r.region}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.drivers.join(" · ")}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${levelClass(r.level)}`}>{r.level}</span>
                  <div className="text-xs text-muted-foreground mt-1">Probability: {r.probability}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <LevelBar score={r.score} />
                <span className="text-xs font-medium tabular-nums shrink-0">{r.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}