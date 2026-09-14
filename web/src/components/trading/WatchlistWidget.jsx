import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { instruments, candleData, fmtPrice } from "@/lib/mockData";
import { Eye, Plus, X } from "lucide-react";
import Sparkline from "@/components/trading/Sparkline";

const STORAGE_KEY = "gaitc.watchlist.v1";
const DEFAULT_WATCH = ["BTCUSD", "NVDA", "XAUUSD", "EURUSD", "SPY", "USOIL"];
const TICK_MS = 3000;
const HISTORY = 32;

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}
  return DEFAULT_WATCH;
}

export default function WatchlistWidget() {
  const [symbols, setSymbols] = useState(loadWatchlist);
  const [addOpen, setAddOpen] = useState(false);
  const [addSym, setAddSym] = useState("");

  // Live price state: { [symbol]: { price, base, history: number[], changePct } }
  const [quotes, setQuotes] = useState(() => {
    const init = {};
    DEFAULT_WATCH.forEach((sym) => {
      const inst = instruments.find((i) => i.symbol === sym) || instruments[0];
      const seedHist = (candleData[sym] || candleData[instruments[0].symbol])
        .slice(-HISTORY).map((c) => c.close);
      init[sym] = { price: inst.price, base: inst.price, history: seedHist, changePct: inst.changePct };
    });
    return init;
  });

  // Persist watchlist symbols.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
  }, [symbols]);

  // Initialize quote tracking for any newly added symbol.
  useEffect(() => {
    setQuotes((prev) => {
      const next = { ...prev };
      symbols.forEach((sym) => {
        if (!next[sym]) {
          const inst = instruments.find((i) => i.symbol === sym) || instruments[0];
          const seedHist = (candleData[sym] || candleData[instruments[0].symbol])
            .slice(-HISTORY).map((c) => c.close);
          next[sym] = { price: inst.price, base: inst.price, history: seedHist, changePct: inst.changePct };
        }
      });
      return next;
    });
  }, [symbols]);

  // Simulated real-time price drift.
  const tick = useCallback(() => {
    setQuotes((prev) => {
      const next = {};
      Object.keys(prev).forEach((sym) => {
        const q = prev[sym];
        const vol = 0.0015;
        const drift = (Math.random() - 0.5) * vol * q.price;
        const newPrice = Math.max(0.0001, q.price + drift);
        const history = [...q.history, newPrice].slice(-HISTORY);
        const changePct = ((newPrice - q.base) / q.base) * 100;
        next[sym] = { ...q, price: newPrice, history, changePct };
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  const removeSymbol = (sym) => setSymbols((s) => s.filter((x) => x !== sym));
  const addSymbol = () => {
    const sym = addSym.toUpperCase().trim();
    if (!sym) return;
    if (symbols.includes(sym)) { setAddSym(""); setAddOpen(false); return; }
    if (!instruments.find((i) => i.symbol === sym)) return; // ignore unknown
    setSymbols((s) => [...s, sym]);
    setAddSym(""); setAddOpen(false);
  };

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Watchlist
        </h3>
        <button onClick={() => setAddOpen((v) => !v)} className="text-muted-foreground hover:text-primary" title="Add symbol">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {addOpen && (
        <div className="px-3 pb-2 flex gap-1.5">
          <input
            autoFocus
            value={addSym}
            onChange={(e) => setAddSym(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="Symbol"
            list="wl-symbols"
            className="flex-1 h-7 px-2 text-xs rounded bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary uppercase"
          />
          <datalist id="wl-symbols">
            {instruments.map((i) => <option key={i.symbol} value={i.symbol} />)}
          </datalist>
          <button onClick={addSymbol} className="h-7 px-2 text-xs rounded bg-primary text-primary-foreground">Add</button>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-0.5">
        {symbols.length === 0 && (
          <div className="px-2 py-3 text-[11px] text-muted-foreground text-center">No symbols. Tap + to add.</div>
        )}
        {symbols.map((sym) => {
          const q = quotes[sym];
          if (!q) return null;
          const up = q.changePct >= 0;
          const inst = instruments.find((i) => i.symbol === sym);
          return (
            <div key={sym} className="group relative flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-secondary transition-colors">
              <Sparkline data={q.history.map((v) => ({ close: v }))} width={42} height={20} positive={up} />
              <Link to={`/charts?symbol=${sym}`} className="flex-1 min-w-0">
                <div className="text-xs font-medium leading-tight truncate">{sym}</div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate">{inst?.name || ""}</div>
              </Link>
              <div className="text-right">
                <div className="text-xs font-medium tabular-nums leading-tight">{fmtPrice(q.price)}</div>
                <div className={`text-[10px] tabular-nums leading-tight ${up ? "text-bull" : "text-bear"}`}>
                  {up ? "+" : ""}{q.changePct.toFixed(2)}%
                </div>
              </div>
              <button
                onClick={() => removeSymbol(sym)}
                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-bear p-0.5"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}