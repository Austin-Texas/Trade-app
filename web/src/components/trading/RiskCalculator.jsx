import React, { useMemo, useState } from "react";
import { instruments, fmtPrice } from "@/lib/mockData";
import { Calculator, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";

// Risk management calculator: determines position size from account balance,
// risk-per-trade %, entry price, and stop-loss distance (% of entry).
export default function RiskCalculator() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [balance, setBalance] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPct, setStopPct] = useState(2);
  const [direction, setDirection] = useState("long");
  const [entry, setEntry] = useState(() => instruments.find((i) => i.symbol === "XAUUSD")?.price || 100);

  const inst = useMemo(() => instruments.find((i) => i.symbol === symbol) || instruments[0], [symbol]);

  const onSymbolChange = (sym) => {
    setSymbol(sym);
    const next = instruments.find((i) => i.symbol === sym);
    if (next) setEntry(next.price);
  };

  const calc = useMemo(() => {
    const bal = Math.max(0, Number(balance) || 0);
    const risk = Math.max(0, Number(riskPct) || 0) / 100;
    const stop = Math.max(0.01, Number(stopPct) || 0) / 100;
    const px = Math.max(0.0001, Number(entry) || 0);

    const riskAmount = bal * risk;
    const stopDistance = px * stop; // price distance per unit
    const size = stopDistance > 0 ? riskAmount / stopDistance : 0; // units
    const notional = size * px;
    const stopPrice = direction === "long" ? px - stopDistance : px + stopDistance;

    const tp1 = direction === "long" ? px + stopDistance : px - stopDistance; // 1R
    const tp2 = direction === "long" ? px + stopDistance * 2 : px - stopDistance * 2; // 2R
    const tp3 = direction === "long" ? px + stopDistance * 3 : px - stopDistance * 3; // 3R

    return {
      riskAmount,
      stopDistance,
      stopPrice,
      size,
      notional,
      tp1, tp2, tp3,
      rr1: bal > 0 ? (riskAmount / bal) * 100 : 0,
    };
  }, [balance, riskPct, stopPct, entry, direction]);

  const num = (v, d = 2) => (Number.isFinite(v) ? v : 0).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
  const money = (v) => (Number.isFinite(v) ? v : 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const inputCls = "w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Risk & Position Size Calculator</h2>
        <span className="text-[11px] text-muted-foreground">Advisory only</span>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">Instrument</label>
            <select value={symbol} onChange={(e) => onSymbolChange(e.target.value)} className={inputCls}>
              {instruments.map((i) => <option key={i.symbol} value={i.symbol}>{i.symbol} · {i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Account Balance ($)</label>
            <input type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Risk per Trade (%)</label>
            <input type="number" min="0" max="100" step="0.1" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Entry Price</label>
            <input type="number" min="0" step="0.0001" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Stop-Loss (%)</label>
            <input type="number" min="0.01" max="100" step="0.1" value={stopPct} onChange={(e) => setStopPct(e.target.value)} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">Direction</label>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setDirection("long")} className={`flex-1 h-9 rounded-md border text-sm font-medium inline-flex items-center justify-center gap-1.5 ${direction === "long" ? "bg-bull/15 border-bull/40 text-bull" : "bg-secondary border-border text-muted-foreground"}`}>
                <TrendingUp className="w-4 h-4" /> Long
              </button>
              <button onClick={() => setDirection("short")} className={`flex-1 h-9 rounded-md border text-sm font-medium inline-flex items-center justify-center gap-1.5 ${direction === "short" ? "bg-bear/15 border-bear/40 text-bear" : "bg-secondary border-border text-muted-foreground"}`}>
                <TrendingDown className="w-4 h-4" /> Short
              </button>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-md bg-secondary p-3">
              <div className="text-[11px] text-muted-foreground">Amount at Risk</div>
              <div className="text-lg font-semibold tabular-nums mt-0.5 text-bear">{money(calc.riskAmount)}</div>
              <div className="text-[10px] text-muted-foreground">{num(calc.rr1, 2)}% of balance</div>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="text-[11px] text-muted-foreground">Position Size (units)</div>
              <div className="text-lg font-semibold tabular-nums mt-0.5">{num(calc.size, 4)}</div>
              <div className="text-[10px] text-muted-foreground">Notional {money(calc.notional)}</div>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="text-[11px] text-muted-foreground">Stop-Loss Price</div>
              <div className="text-lg font-semibold tabular-nums mt-0.5 text-bear">{fmtPrice(calc.stopPrice)}</div>
              <div className="text-[10px] text-muted-foreground">{num(calc.stopDistance, 4)} / unit</div>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="text-[11px] text-muted-foreground">Entry Price</div>
              <div className="text-lg font-semibold tabular-nums mt-0.5">{fmtPrice(Number(entry) || 0)}</div>
              <div className="text-[10px] text-muted-foreground">{inst?.symbol} ref {fmtPrice(inst?.price || 0)}</div>
            </div>
          </div>

          <div className="rounded-md border border-border p-3">
            <div className="text-[11px] text-muted-foreground mb-2">Take-Profit Targets (R multiples)</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-muted-foreground">1R</div><div className="font-semibold text-bull tabular-nums">{fmtPrice(calc.tp1)}</div></div>
              <div><div className="text-muted-foreground">2R</div><div className="font-semibold text-bull tabular-nums">{fmtPrice(calc.tp2)}</div></div>
              <div><div className="text-muted-foreground">3R</div><div className="font-semibold text-bull tabular-nums">{fmtPrice(calc.tp3)}</div></div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-warn/30 bg-warn/5 p-2.5 text-[11px] text-warn">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Position sizing caps your loss at the amount at risk if the stop is hit. Slippage, gaps, and fees can exceed this estimate. Advisory only — not a guarantee.</span>
          </div>
        </div>
      </div>
    </div>
  );
}