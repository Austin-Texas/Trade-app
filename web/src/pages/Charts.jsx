import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { instruments, timeframes, signals, fmtPrice } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import CandlestickChart from "@/components/trading/CandlestickChart";
import SignalBadge from "@/components/trading/SignalBadge";
import { Link } from "react-router-dom";

const indicators = [
  { id: "ema9", label: "EMA 9", on: true }, { id: "ema20", label: "EMA 20", on: true },
  { id: "ema50", label: "EMA 50", on: true }, { id: "ema100", label: "EMA 100", on: false },
  { id: "ema200", label: "EMA 200", on: false }, { id: "rsi", label: "RSI", on: false },
  { id: "macd", label: "MACD", on: false }, { id: "vwap", label: "VWAP", on: false },
  { id: "bbands", label: "Bollinger Bands", on: false }, { id: "atr", label: "ATR", on: false },
  { id: "sr", label: "Support/Resistance", on: false }, { id: "trend", label: "Trend Lines", on: false },
];

function IndicatorValue({ label, value, tone }) {
  return (
    <div className="px-3 py-2 rounded-md bg-secondary">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-medium tabular-nums ${tone || ""}`}>{value}</div>
    </div>
  );
}

export default function Charts() {
  const [params, setParams] = useSearchParams();
  const symbol = params.get("symbol") || "BTCUSD";
  const inst = useMemo(() => instruments.find((i) => i.symbol === symbol) || instruments[0], [symbol]);
  const [tf, setTf] = useState("1H");
  const [inds, setInds] = useState(indicators);
  const sig = signals.find((s) => s.symbol === symbol);
  const up = inst.change >= 0;

  const toggle = (id) => setInds((arr) => arr.map((i) => (i.id === id ? { ...i, on: !i.on } : i)));

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${inst.symbol} · ${inst.name}`}
        subtitle={`${inst.category} · ${inst.country}`}
        actions={
          <select
            value={symbol}
            onChange={(e) => setParams({ symbol: e.target.value })}
            className="h-9 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {instruments.map((i) => <option key={i.symbol} value={i.symbol}>{i.symbol} — {i.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Chart + controls */}
        <div className="xl:col-span-3 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-semibold tabular-nums">{fmtPrice(inst.price)}</div>
              <div className={`text-sm tabular-nums ${up ? "text-bull" : "text-bear"}`}>
                {up ? "+" : ""}{inst.change.toFixed(2)} ({up ? "+" : ""}{inst.changePct.toFixed(2)}%)
              </div>
            </div>
            <div className="flex items-center gap-1">
              {timeframes.map((t) => (
                <button
                  key={t} onClick={() => setTf(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tf === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          <CandlestickChart symbol={symbol} height={420} />

          <div className="mt-4 flex flex-wrap gap-2">
            {inds.map((i) => (
              <button
                key={i.id} onClick={() => toggle(i.id)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                  i.on ? "bg-primary/15 text-accent-foreground border-primary/40" : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
              >{i.label}</button>
            ))}
          </div>
        </div>

        {/* Sidebar: signal + indicator readout */}
        <div className="space-y-4">
          {sig ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">AI Signal</h3>
                <SignalBadge signal={sig.signal} size="sm" />
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{sig.score}<span className="text-base text-muted-foreground">/100</span></div>
              <div className="text-xs text-muted-foreground">{sig.confidence} confidence · {sig.timeframe}</div>
              <Link to={`/signals?symbol=${symbol}`} className="block mt-3 text-xs text-primary hover:underline">View full analysis →</Link>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No active signal for {symbol}.</div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Indicator Readout</h3>
            <div className="grid grid-cols-2 gap-2">
              <IndicatorValue label="RSI (14)" value="62.4" tone="text-bull" />
              <IndicatorValue label="MACD" value="+1.82" tone="text-bull" />
              <IndicatorValue label="VWAP" value={fmtPrice(inst.price * 0.998)} />
              <IndicatorValue label="ATR (14)" value={fmtPrice(inst.price * 0.018)} />
              <IndicatorValue label="EMA 9" value={fmtPrice(inst.price * 0.999)} />
              <IndicatorValue label="EMA 20" value={fmtPrice(inst.price * 0.994)} />
              <IndicatorValue label="EMA 50" value={fmtPrice(inst.price * 0.982)} />
              <IndicatorValue label="EMA 200" value={fmtPrice(inst.price * 0.955)} />
              <IndicatorValue label="Bollinger Upper" value={fmtPrice(inst.price * 1.024)} />
              <IndicatorValue label="Bollinger Lower" value={fmtPrice(inst.price * 0.976)} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Structure</h3>
            <div className="text-xs space-y-1.5 text-muted-foreground">
              <div className="flex justify-between"><span>Trend</span><span className="text-bull">Uptrend (HH/HL)</span></div>
              <div className="flex justify-between"><span>Nearest Support</span><span className="tabular-nums">{fmtPrice(inst.price * 0.97)}</span></div>
              <div className="flex justify-between"><span>Nearest Resistance</span><span className="tabular-nums">{fmtPrice(inst.price * 1.03)}</span></div>
              <div className="flex justify-between"><span>Breakout Level</span><span className="tabular-nums">{fmtPrice(inst.price * 1.03)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}