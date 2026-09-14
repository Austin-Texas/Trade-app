import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { instruments, assetClasses, fmtPrice, fmtVol, candleData } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import Sparkline from "@/components/trading/Sparkline";
import { Search } from "lucide-react";

export default function Markets() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = useMemo(() => {
    return instruments.filter((i) => {
      if (category !== "All" && i.category !== category) return false;
      if (onlyOpen && i.market !== "open") return false;
      if (query && !(`${i.symbol} ${i.name}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [query, category, onlyOpen]);

  const cats = ["All", ...assetClasses];

  return (
    <div className="space-y-4">
      <PageHeader title="Global Markets" subtitle="Real-time prices across asset classes · data via Linux backend" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search symbol or name…"
            className="w-full h-9 pl-9 pr-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={category} onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 h-9 px-3 rounded-md bg-card border border-border text-sm cursor-pointer">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-primary" />
          Open only
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2 font-medium">Symbol</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Category</th>
                <th className="px-4 py-2 font-medium text-right">Price</th>
                <th className="px-4 py-2 font-medium text-right">Change</th>
                <th className="px-4 py-2 font-medium text-right hidden sm:table-cell">Volume</th>
                <th className="px-4 py-2 font-medium hidden lg:table-cell">7-pt Trend</th>
                <th className="px-4 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((i) => {
                const up = i.change >= 0;
                return (
                  <tr key={i.symbol} className="hover:bg-secondary transition-colors">
                    <td className="px-4 py-2.5">
                      <Link to={`/charts?symbol=${i.symbol}`} className="block">
                        <div className="font-medium">{i.symbol}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">{i.name}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">{i.category}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtPrice(i.price)}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${up ? "text-bull" : "text-bear"}`}>
                      {up ? "+" : ""}{i.changePct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground hidden sm:table-cell">{fmtVol(i.volume)}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell"><Sparkline data={candleData[i.symbol]} positive={up} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${i.market === "open" ? "text-bull" : "text-muted-foreground"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${i.market === "open" ? "bg-bull" : "bg-muted-foreground/40"}`} />
                        {i.market}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No instruments match your filters.</div>}
      </div>
    </div>
  );
}