import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://trade-api.hastenload.com";

export default function BackendHeartbeatCard({ apiVersion = "v1", provider = "Trade API" }) {
  const [online, setOnline] = useState(false);
  const [latency, setLatency] = useState(null);
  const [lastBeat, setLastBeat] = useState(null);
  const [beatId, setBeatId] = useState(0);

  useEffect(() => {
    let active = true;

    async function heartbeat() {
      const started = performance.now();
      try {
        const url = API_BASE.replace(/\/$/, "") + "/health?ts=" + Date.now();
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        await response.json().catch(() => null);
        if (!active) return;
        setOnline(true);
        setLatency(Math.max(1, Math.round(performance.now() - started)));
        setLastBeat(new Date());
        setBeatId((value) => value + 1);
      } catch {
        if (!active) return;
        setOnline(false);
        setLatency(null);
      }
    }

    heartbeat();
    const timer = window.setInterval(heartbeat, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const statusClass = "text-2xl font-semibold mt-2 " + (online ? "text-bull" : "text-bear");
  const dotClass = "w-2.5 h-2.5 rounded-full " + (online ? "bg-bull heartbeat-dot-live" : "bg-bear");
  const detail = online ? apiVersion + " · " + provider + " · " + (latency || "—") + " ms" : "Heartbeat lost";

  return (
    <div className="rounded-lg border border-border bg-card p-4 min-h-[132px] relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Backend</div>
          <div className={statusClass}>{online ? "Online" : "Offline"}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{detail}</div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span key={beatId} className={dotClass} />
        </div>
      </div>

      <div className="mt-3 h-11 overflow-hidden rounded-md bg-background/30 border border-border/60">
        <svg key={online ? beatId : "offline"} viewBox="0 0 320 60" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0 32 L35 32 L50 32 L58 27 L65 39 L73 10 L82 51 L92 32 L130 32 L145 32 L153 27 L160 39 L168 10 L177 51 L187 32 L225 32 L240 32 L248 27 L255 39 L263 10 L272 51 L282 32 L320 32"
            fill="none"
            stroke={online ? "#22c55e" : "#ef4444"}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={online ? "backend-ecg-live" : "backend-ecg-offline"}
          />
        </svg>
      </div>

      <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center justify-between">
        <span>{online ? "Live API heartbeat" : "No API heartbeat"}</span>
        <span>{lastBeat ? "beat " + lastBeat.toLocaleTimeString() : "waiting..."}</span>
      </div>

      <style>{`
        .backend-ecg-live {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: ecgBeat .9s ease-out 1;
          filter: drop-shadow(0 0 5px rgba(34, 197, 94, .7));
        }
        .backend-ecg-offline { opacity: .65; }
        .heartbeat-dot-live {
          animation: beatDot .55s ease-out 1;
          box-shadow: 0 0 10px rgba(34, 197, 94, .85);
        }
        @keyframes ecgBeat {
          0% { stroke-dashoffset: 520; opacity: .25; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes beatDot {
          0% { transform: scale(.7); opacity: .45; }
          35% { transform: scale(1.8); opacity: 1; }
          100% { transform: scale(1); opacity: .85; }
        }
      `}</style>
    </div>
  );
}
