import React from "react";
import { modelInfo } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import { Cpu, CheckCircle2 } from "lucide-react";

export default function ModelIntelligence() {
  const m = modelInfo;
  return (
    <div className="space-y-4">
      <PageHeader title="Model Intelligence" subtitle="AI engine components, methodology & measured accuracy" />

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {m.models.map((model) => (
          <div key={model.name} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.type} · {model.version}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-bull"><CheckCircle2 className="w-3.5 h-3.5" />{model.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Measured Accuracy</div>
                <div className="font-medium tabular-nums">{model.accuracy}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Trained</div>
                <div className="font-medium tabular-nums">{model.lastTrained}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Scoring Methodology</h3>
        <div className="space-y-2.5">
          {m.methodology.map((line, i) => (
            <div key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="text-primary font-medium shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{line}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
        ⚠ Component accuracy reflects historical backtesting only. Past performance does not guarantee future results. Signals are advisory — never automated live execution.
      </div>
    </div>
  );
}