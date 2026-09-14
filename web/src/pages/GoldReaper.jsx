import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/trading/PageHeader";
import GoldReaperConfigForm from "@/components/goldreaper/GoldReaperConfigForm";
import GoldReaperBacktest from "@/components/goldreaper/GoldReaperBacktest";
import { Loader2, Coins, ShieldCheck, BookOpen } from "lucide-react";

const DEFAULTS = {
  symbol: "XAUUSD",
  timeframe: "H1",
  min_account_balance: 600,
  show_info_panel: true,
  infopanel_size: 1,
  update_infopanel_during_testing: false,
  trade_frequency: "auto",
  maximum_allowed_spread: 30,
  friday_stop_hour: 25,
  set_sl_tp_after_entry: false,
  use_virtual_expiration: false,
  randomization: 50,
  base_magic_number: 20240001,
  trade_comment: "GoldReaper",
  lotsize_calc_method: "max_drawdown",
  start_lots: 0.01,
  max_allowed_drawdown: 20,
  max_daily_drawdown: 5,
  use_equity_instead_of_balance: false,
  only_up: false,
  enable_nfp_filter: true,
  auto_gmt: true,
  gmt_offset_winter: 0,
  gmt_offset_summer: 0,
  nfp_close_open_trades: true,
  nfp_close_pending_orders: true,
  nfp_minutes_before: 30,
  nfp_minutes_after: 60,
};

const FEATURES = [
  "Breakouts of key support/resistance levels — proven methodology for volatile Gold",
  "Multi-timeframe confirmation with multiple internal strategies to spread risk",
  "Every trade has SL + TP plus trailing SL and trailing TP",
  "No grid · No Martingale · No risky risk management",
  "Auto-adapts trade frequency & lotsize to account size and max allowed drawdown",
  "Prop-firm ready: daily drawdown cap, NFP filter, randomization, Friday stop",
  "Minimum account balance: $600 · Run on XAUUSD · Chart timeframe irrelevant (use H1)",
];

export default function GoldReaper() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.GoldReaperConfig.list();
        if (res.length > 0) {
          setConfig(res[0]);
        } else {
          const created = await base44.entities.GoldReaperConfig.create(DEFAULTS);
          setConfig(created);
        }
      } catch (e) {
        setConfig({ ...DEFAULTS });
        toast({ title: "Could not load saved config", description: "Showing defaults", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      const { id, created_date, updated_date, created_by_id, ...fields } = config;
      if (id) {
        const updated = await base44.entities.GoldReaperConfig.update(id, fields);
        setConfig(updated);
      } else {
        const created = await base44.entities.GoldReaperConfig.create(fields);
        setConfig(created);
      }
      toast({ title: "Configuration saved" });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading Gold Reaper…</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gold Reaper EA"
        subtitle="Breakout strategy for XAUUSD · multi-timeframe confirmation · prop-firm ready"
        actions={<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warn/15 text-warn text-xs font-medium"><Coins className="w-3.5 h-3.5" /> Gold Strategy</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-primary" /> Key Features & Setup</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-bull mt-0.5">•</span><span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Install on an XAUUSD chart, set your preferred max allowed drawdown, and the EA determines trade frequency & lotsize automatically. For AutoGMT, add <code className="text-foreground">https://www.worldtimeserver.com/</code> to MT4/MT5 allowed URLs (Tools → Options → Expert Advisors).
          </p>
        </div>
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 flex items-start gap-2">
          <ShieldCheck className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="text-xs text-warn">
            <strong>Advisory only.</strong> This module models the described Gold Reaper methodology for analysis and configuration — it does not execute real trades. Past performance (modeled or live) does not guarantee future results.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GoldReaperConfigForm config={config} onChange={onChange} onSave={onSave} saving={saving} />
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Modeled Backtest</h3>
            <GoldReaperBacktest config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}