import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { signals, signalLevels, fmtPrice } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import SignalBadge from "@/components/trading/SignalBadge";
import ScoreBar from "@/components/trading/ScoreBar";

function ComponentRow({ label, score, max }) {
  return (
    <div className="space-y-1.5">
      <ScoreBar label={label} score={score} max={max} />
    </div>
  );
}

function SignalDetail({ sig }) {
  if (!sig) return <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">Select a signal to view the full AI analysis.</div>;
  const total = Object.values(sig.components).reduce((a, c) => a + c.score, 0);
  const maxTotal = Object.values(sig.components).reduce((a, c) => a + c.max, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{sig.symbol}</h2>
            <p className="text-sm text-muted-foreground">{sig.name} · {sig.category} · {sig.timeframe}</p>
          </div>
          <div className="text-right">
            <SignalBadge signal={sig.signal} size="lg" />
            <div className="mt-2 text-2xl font-bold tabular-nums">{total}<span className="text-base text-muted-foreground">/{maxTotal}</span></div>
          </div>
        </div>
      </div>

      {/* Multi-timeframe */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Multi-Timeframe Alignment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(sig.multiTimeframe).map(([tf, dir]) => (
            <div key={tf} className="rounded-md bg-secondary p-3">
              <div className="text-xs text-muted-foreground">{tf}</div>
              <div className={`text-sm font-medium ${dir === "Bullish" ? "text-bull" : dir === "Bearish" ? "text-bear" : "text-warn"}`}>{dir}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Note: A lower-timeframe pullback against a higher-timeframe trend is a potential continuation entry — not a reversal.
        </p>
      </div>

      {/* Component scores */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Explainable Component Scores</h3>
        <div className="space-y-3">
          {Object.entries(sig.components).map(([key, c]) => (
            <ComponentRow key={key} label={c.label} score={c.score} max={c.max} />
          ))}
          <div className="pt-2 border-t border-border flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{total}/{maxTotal}</span>
          </div>
        </div>
      </div>

      {/* Trade setup */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Trade Setup</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Trend</div><div className="font-medium">{sig.trend}</div></div>
          <div><div className="text-xs text-muted-foreground">Risk/Reward</div><div className="font-medium tabular-nums">{sig.setup.rr ? `${sig.setup.rr.toFixed(2)} : 1` : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Expected Volatility</div><div className="font-medium">{sig.setup.expectedVolatility}</div></div>
          <div><div className="text-xs text-muted-foreground">Current Price</div><div className="font-medium tabular-nums">{fmtPrice(sig.setup.entry || 0)}</div></div>
          <div><div className="text-xs text-muted-foreground">Suggested Entry</div><div className="font-medium tabular-nums">{sig.setup.entry ? fmtPrice(sig.setup.entry) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Invalidation</div><div className="font-medium text-bear tabular-nums">{sig.setup.invalidation ? fmtPrice(sig.setup.invalidation) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Stop Loss</div><div className="font-medium text-bear tabular-nums">{sig.setup.stop ? fmtPrice(sig.setup.stop) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Target 1</div><div className="font-medium text-bull tabular-nums">{sig.setup.t1 ? fmtPrice(sig.setup.t1) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Target 2</div><div className="font-medium text-bull tabular-nums">{sig.setup.t2 ? fmtPrice(sig.setup.t2) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Target 3</div><div className="font-medium text-bull tabular-nums">{sig.setup.t3 ? fmtPrice(sig.setup.t3) : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Support</div><div className="font-medium tabular-nums">{fmtPrice(sig.setup.support)}</div></div>
          <div><div className="text-xs text-muted-foreground">Resistance</div><div className="font-medium tabular-nums">{fmtPrice(sig.setup.resistance)}</div></div>
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-2">Why this signal?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{sig.explanation}</p>
        <p className="text-xs text-warn mt-3">⚠ AI analysis is not a guaranteed prediction. Validate against historical performance.</p>
      </div>
    </div>
  );
}

export default function AISignals() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("symbol");
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => filter === "All" ? signals : signals.filter((s) => s.signal === filter), [filter]);
  const active = signals.find((s) => s.symbol === selected);

  return (
    <div className="space-y-4">
      <PageHeader title="AI Signals" subtitle="Explainable multi-factor signals — every score justified" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["All", ...signalLevels].map((l) => (
              <button key={l} onClick={() => setFilter(l)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  filter === l ? "bg-primary/15 text-accent-foreground border-primary/40" : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}>{l}</button>
            ))}
          </div>
          {filtered.map((s) => (
            <button key={s.symbol} onClick={() => setParams({ symbol: s.symbol })}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selected === s.symbol ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{s.symbol}</div>
                  <div className="text-[11px] text-muted-foreground">{s.timeframe} · {s.trend}</div>
                </div>
                <SignalBadge signal={s.signal} size="sm" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ScoreBar score={s.score} compact />
                <span className="text-xs font-medium tabular-nums shrink-0">{s.score}/100</span>
              </div>
            </button>
          ))}
        </div>
        <div className="xl:col-span-8"><SignalDetail sig={active} /></div>
      </div>
    </div>
  );
}