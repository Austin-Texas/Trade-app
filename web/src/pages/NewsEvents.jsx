import React, { useState, useMemo } from "react";
import { newsEvents, newsTypes } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";

function severityClass(s) {
  return { HIGH: "bg-bear/15 text-bear", MEDIUM: "bg-warn/15 text-warn", LOW: "bg-bull/15 text-bull" }[s] || "bg-secondary";
}
function impactClass(i) {
  return { Bullish: "text-bull", Bearish: "text-bear", Mixed: "text-warn", Neutral: "text-muted-foreground" }[i] || "text-muted-foreground";
}

export default function NewsEvents() {
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");

  const filtered = useMemo(() => {
    return newsEvents.filter((n) => {
      if (type !== "All" && n.type !== type) return false;
      if (sev !== "All" && n.severity !== sev) return false;
      return true;
    }).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [type, sev]);

  return (
    <div className="space-y-4">
      <PageHeader title="Global News Intelligence" subtitle="AI-classified world events with market-impact mapping" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Event Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 h-9 px-2 rounded-md bg-secondary border border-border text-sm">
                  <option value="All">All types</option>
                  {newsTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Severity</label>
                <div className="flex gap-1.5 mt-1">
                  {["All", "HIGH", "MEDIUM", "LOW"].map((s) => (
                    <button key={s} onClick={() => setSev(s)}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                        sev === s ? "bg-primary/15 text-accent-foreground border-primary/40" : "bg-secondary text-muted-foreground border-border"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">How events are scored</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• Classified by type, region, actors</li>
              <li>• Severity + source reliability weighting</li>
              <li>• Surprise & confirmation level</li>
              <li>• Bullish/bearish market implications</li>
              <li>• Expected duration of impact</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {n.source} · {new Date(n.time).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityClass(n.severity)}`}>{n.severity}</span>
              </div>

              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{n.summary}</p>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{n.type}</span></div>
                <div><span className="text-muted-foreground">Region:</span> <span className="font-medium">{n.region} ({n.country})</span></div>
                <div><span className="text-muted-foreground">Reliability:</span> <span className="font-medium">{n.reliability}</span></div>
                <div><span className="text-muted-foreground">Surprise:</span> <span className="font-medium">{n.surprise}</span></div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Markets:</span>
                {n.markets.map((m) => (
                  <span key={m} className="px-1.5 py-0.5 rounded bg-secondary text-xs">{m}</span>
                ))}
                <span className="ml-auto text-sm font-medium">
                  Impact: <span className={impactClass(n.impact)}>{n.impact}</span>
                </span>
                <span className="text-xs text-muted-foreground">· {n.duration}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No events match the filters.</div>}
        </div>
      </div>
    </div>
  );
}