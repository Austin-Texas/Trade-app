import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/trading/PageHeader";
import { Bot, Plus, ShieldCheck } from "lucide-react";

const emptyForm = { name: "", strategy_name: "AI Multi-Asset", symbols: "EURUSD,XAUUSD", mode: "paper", status: "stopped", risk_per_trade_pct: 0.5, max_open_positions: 3, max_daily_trades: 10 };

export default function MyBots() {
  const [bots, setBots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try { setBots(await base44.entities.TradingBot.list()); }
    catch (e) { setMessage(e?.message || "Unable to load bots."); }
  };
  useEffect(() => { load(); }, []);

  const createBot = async () => {
    if (!form.name.trim()) return setMessage("Enter a bot name.");
    setBusy(true); setMessage("");
    try {
      await base44.entities.TradingBot.create({ ...form, symbols: form.symbols.split(",").map(s => s.trim()).filter(Boolean) });
      setForm(emptyForm); await load(); setMessage("Bot created. Execution remains disabled until the Trading VM backend authorizes it.");
    } catch (e) { setMessage(e?.message || "Unable to create bot."); }
    finally { setBusy(false); }
  };

  return <div className="space-y-4">
    <PageHeader title="My Bots" subtitle="Create and manage trading bots assigned to your account" />
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-primary"/><h3 className="text-sm font-semibold">Create Bot</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <input className="h-9 px-3 rounded-md bg-secondary border border-border text-sm" placeholder="Bot name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <select className="h-9 px-3 rounded-md bg-secondary border border-border text-sm" value={form.strategy_name} onChange={e=>setForm({...form,strategy_name:e.target.value})}><option>AI Multi-Asset</option><option>Gold Reaper</option><option>Smart Scalping</option><option>Breakout</option></select>
        <input className="h-9 px-3 rounded-md bg-secondary border border-border text-sm" value={form.symbols} onChange={e=>setForm({...form,symbols:e.target.value})} placeholder="EURUSD,XAUUSD"/>
        <select className="h-9 px-3 rounded-md bg-secondary border border-border text-sm" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option value="signals_only">Signals only</option><option value="paper">Paper</option><option value="demo_auto">Demo auto</option><option value="live_auto">Live auto</option></select>
      </div>
      <div className="mt-3 flex items-center gap-3"><button disabled={busy} onClick={createBot} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">{busy?"Creating…":"Create Bot"}</button><span className="text-xs text-muted-foreground">{message}</span></div>
      <div className="mt-3 text-xs text-warn flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0"/>Live execution must also pass subscription, broker, and server-side risk checks on the Trading VM.</div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {bots.map(b=><div key={b.id} className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-2"><Bot className="w-4 h-4 text-primary"/><div className="font-semibold">{b.name}</div><span className="ml-auto text-xs px-2 py-1 rounded bg-secondary">{b.status}</span></div><div className="mt-3 text-xs text-muted-foreground space-y-1"><div>Strategy: <span className="text-foreground">{b.strategy_name}</span></div><div>Mode: <span className="text-foreground">{b.mode}</span></div><div>Symbols: <span className="text-foreground">{(b.symbols||[]).join(", ")||"—"}</span></div><div>Risk/trade: <span className="text-foreground">{b.risk_per_trade_pct ?? "—"}%</span></div></div></div>)}
      {!bots.length && <div className="text-sm text-muted-foreground">No bots created yet.</div>}
    </div>
  </div>;
}