import React from "react";

export default function ScoreBar({ score, max = 100, label, compact = false }) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 75 ? "bg-bull" : score >= 55 ? "bg-warn" : "bg-bear";
  return (
    <div className={compact ? "" : "space-y-1"}>
      {!compact && label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium tabular-nums">{score}/{max}</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}