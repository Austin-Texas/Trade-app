import React, { useState, useMemo } from "react";
import { economicEvents } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";

function impactClass(i) {
  return { HIGH: "bg-bear/15 text-bear", MEDIUM: "bg-warn/15 text-warn", LOW: "bg-bull/15 text-bull" }[i] || "bg-secondary";
}

export default function EconomicCalendar() {
  const [impact, setImpact] = useState("All");
  const [country, setCountry] = useState("All");

  const countries = useMemo(() => ["All", ...Array.from(new Set(economicEvents.map((e) => e.country)))], []);
  const filtered = useMemo(() => {
    return economicEvents.filter((e) => {
      if (impact !== "All" && e.impact !== impact) return false;
      if (country !== "All" && e.country !== country) return false;
      return true;
    }).sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [impact, country]);

  const upcoming = filtered.filter((e) => new Date(e.time) >= Date.now());
  const past = filtered.filter((e) => new Date(e.time) < Date.now());

  return (
    <div className="space-y-4">
      <PageHeader title="Economic Calendar" subtitle="Central bank decisions, inflation, employment & growth releases" />

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {["All", "HIGH", "MEDIUM", "LOW"].map((i) => (
            <button key={i} onClick={() => setImpact(i)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                impact === i ? "bg-primary/15 text-accent-foreground border-primary/40" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}>{i === "All" ? "All Impact" : i}</button>
          ))}
        </div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-9 px-3 rounded-md bg-card border border-border text-sm">
          {countries.map((c) => <option key={c} value={c}>{c === "All" ? "All Countries" : c}</option>)}
        </select>
      </div>

      {/* AI awareness banner */}
      <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm text-warn">
        ⚠ The signal engine accounts for upcoming high-impact events before generating signals. No new entries recommended within 2 hours of a HIGH-impact release.
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Country</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Impact</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-2 font-medium text-right">Forecast</th>
                <th className="px-4 py-2 font-medium text-right">Previous</th>
                <th className="px-4 py-2 font-medium text-right">Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {upcoming.map((e) => (
                <tr key={e.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">{new Date(e.time).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{e.country}</span></td>
                  <td className="px-4 py-2.5 font-medium">{e.event}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${impactClass(e.impact)}`}>{e.impact}</span></td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-muted-foreground">{e.category}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{e.forecast || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{e.previous || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{e.actual || "—"}</td>
                </tr>
              ))}
              {past.length > 0 && (
                <tr className="bg-secondary/40"><td colSpan={8} className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wide">Recent Releases</td></tr>
              )}
              {past.map((e) => (
                <tr key={e.id} className="hover:bg-secondary transition-colors opacity-75">
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">{new Date(e.time).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{e.country}</span></td>
                  <td className="px-4 py-2.5 font-medium">{e.event}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${impactClass(e.impact)}`}>{e.impact}</span></td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-muted-foreground">{e.category}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{e.forecast || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{e.previous || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{e.actual || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}