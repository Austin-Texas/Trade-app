import React from "react";
import { signalColor } from "@/lib/mockData";

export default function SignalBadge({ signal, size = "md" }) {
  const color = signalColor(signal);
  const map = {
    bull: "bg-bull/15 text-bull border-bull/30",
    bear: "bg-bear/15 text-bear border-bear/30",
    warn: "bg-warn/15 text-warn border-warn/30",
    neutral: "bg-secondary text-muted-foreground border-border",
  };
  const sizes = { sm: "text-[10px] px-1.5 py-0.5", md: "text-xs px-2 py-1", lg: "text-sm px-3 py-1.5" };
  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wide rounded border ${map[color]} ${sizes[size]}`}>
      {signal}
    </span>
  );
}