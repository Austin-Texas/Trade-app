import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, X, Trash2 } from "lucide-react";
import { useSignalNotifications } from "@/lib/SignalNotifications";
import SignalBadge from "@/components/trading/SignalBadge";

export default function SignalNotificationBell() {
  const { notifications, unreadCount, markAsRead, clearAll, dismiss, threshold } = useSignalNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAsRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-md hover:bg-secondary transition-colors"
        aria-label="Signal notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-xl z-50 flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Signal Alerts</h3>
              <span className="text-[10px] text-muted-foreground">Score ≥ {threshold}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearAll} className="p-1.5 rounded hover:bg-secondary text-muted-foreground" title="Clear all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto scrollbar-thin flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No high-confidence signal alerts yet. New alerts will appear here automatically.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-secondary transition-colors group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/signals?symbol=${n.symbol}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {n.symbol}
                          </Link>
                          <SignalBadge signal={n.signal} size="sm" />
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {n.name} · {n.timeframe} · {n.trend}
                        </div>
                        <div className="text-xs mt-1">
                          <span className="font-semibold tabular-nums">{n.score}/100</span>
                          <span className="text-muted-foreground"> · {n.confidence} confidence</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}