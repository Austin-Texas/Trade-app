import React from "react";

export default function StatCard({ label, value, sub, tone, icon: Icon }) {
  const toneClass = {
    bull: "text-bull", bear: "text-bear", warn: "text-warn", neutral: "text-muted-foreground",
  }[tone] || "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}