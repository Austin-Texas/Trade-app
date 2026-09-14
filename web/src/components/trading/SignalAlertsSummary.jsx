import React from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";
import { useSignalNotifications } from "@/lib/SignalNotifications";
import SignalBadge from "@/components/trading/SignalBadge";

// Dashboard summary of high-confidence signal alerts pushed by the AI signal engine.
export default function SignalAlertsSummary() {
  const { notifications, threshold } = useSignalNotifications();
  const recent = notifications.slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          High-Confidence Signal Alerts
        </h2>
        <span className="text-[11px] text-muted-foreground">Score ≥ {threshold}</span>
      </div>

      {recent.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No high-confidence alerts right now. New signals will appear here automatically as the AI engine detects them.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((n) => (
            <Link
              key={n.id}
              to={`/signals?symbol=${n.symbol}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
            >
              <div className="w-24 shrink-0">
                <div className="text-sm font-medium">{n.symbol}</div>
                <div className="text-[11px] text-muted-foreground truncate">{n.category}</div>
              </div>
              <SignalBadge signal={n.signal} size="sm" />
              <div className="hidden sm:block text-xs text-muted-foreground">{n.timeframe}</div>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{n.score}/100</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}