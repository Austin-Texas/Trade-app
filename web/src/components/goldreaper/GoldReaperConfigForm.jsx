import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Save, Download, Loader2 } from "lucide-react";

const FREQ_OPTIONS = [
  { value: "auto", label: "Auto (by drawdown)" },
  { value: "very_conservative", label: "Very Conservative" },
  { value: "conservative", label: "Conservative" },
  { value: "normal", label: "Normal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "extreme", label: "Extreme" },
  { value: "startlots", label: "StartLots (manual)" },
];
const LOT_OPTIONS = [
  { value: "max_drawdown", label: "Max Allowed Drawdown (auto lotsize)" },
  { value: "fixed_startlots", label: "Fixed lotsize (StartLots)" },
];

const SECTIONS = [
  {
    title: "General / Info Panel",
    fields: [
      { key: "symbol", label: "Symbol", type: "text" },
      { key: "timeframe", label: "Timeframe", type: "text" },
      { key: "min_account_balance", label: "Min account balance ($)", type: "number" },
      { key: "show_info_panel", label: "Show info panel", type: "switch" },
      { key: "infopanel_size", label: "Infopanel size (2 for 4K)", type: "number" },
      { key: "update_infopanel_during_testing", label: "Update infopanel during testing", type: "switch" },
    ],
  },
  {
    title: "Trade Frequency & Execution",
    fields: [
      { key: "trade_frequency", label: "Trade frequency", type: "select", options: FREQ_OPTIONS },
      { key: "maximum_allowed_spread", label: "Max allowed spread (points)", type: "number" },
      { key: "friday_stop_hour", label: "Friday stop hour (0–23, 25=disabled)", type: "number" },
      { key: "set_sl_tp_after_entry", label: "Set SL/TP after entry", type: "switch" },
      { key: "use_virtual_expiration", label: "Use virtual expiration", type: "switch" },
      { key: "randomization", label: "Randomization (0–100, 50 recommended)", type: "number" },
      { key: "base_magic_number", label: "Base magic number", type: "number" },
      { key: "trade_comment", label: "Trade comment", type: "text" },
    ],
  },
  {
    title: "Risk & Lotsize",
    fields: [
      { key: "lotsize_calc_method", label: "Lotsize calculation method", type: "select", options: LOT_OPTIONS },
      { key: "start_lots", label: "Start lots", type: "number" },
      { key: "max_allowed_drawdown", label: "Max allowed drawdown (%)", type: "number" },
      { key: "max_daily_drawdown", label: "Max daily drawdown (%)", type: "number" },
      { key: "use_equity_instead_of_balance", label: "Use equity instead of balance", type: "switch" },
      { key: "only_up", label: "OnlyUp (no lotsize decrease after losses)", type: "switch" },
    ],
  },
  {
    title: "NFP Filter",
    fields: [
      { key: "enable_nfp_filter", label: "Enable NFP filter", type: "switch" },
      { key: "auto_gmt", label: "AutoGMT", type: "switch" },
      { key: "gmt_offset_winter", label: "GMT offset (winter)", type: "number" },
      { key: "gmt_offset_summer", label: "GMT offset (summer)", type: "number" },
      { key: "nfp_close_open_trades", label: "Close open trades before NFP", type: "switch" },
      { key: "nfp_close_pending_orders", label: "Delete pending orders before NFP", type: "switch" },
      { key: "nfp_minutes_before", label: "NFP minutes before", type: "number" },
      { key: "nfp_minutes_after", label: "NFP minutes after", type: "number" },
    ],
  },
];

function Field({ field, value, onChange }) {
  const set = (v) => onChange(field.key, v);
  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-3 py-1.5">
        <Label className="text-xs text-muted-foreground font-normal">{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={set} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        <Select value={String(value)} onValueChange={set}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{field.label}</Label>
      <Input
        type={field.type}
        value={value ?? ""}
        onChange={(e) => set(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="h-9 text-sm tabular-nums"
      />
    </div>
  );
}

export default function GoldReaperConfigForm({ config, onChange, onSave, saving }) {
  if (!config) return null;

  const handleSetfile = () => {
    const lines = SECTIONS.flatMap((s) => s.fields).map((f) => {
      const v = config[f.key];
      return `${f.key}=${v === undefined || v === null ? "" : v}`;
    });
    const text = `; Gold Reaper EA configuration\n; Generated by Global AI Trading Center\n; Advisory only — not investment advice\n\n${lines.join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GoldReaper_${config.symbol}_${config.timeframe}.set`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-lg border border-border bg-card">
          <div className="px-4 py-2.5 border-b border-border">
            <h3 className="text-sm font-semibold">{section.title}</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {section.fields.map((f) => (
              <Field key={f.key} field={f} value={config[f.key]} onChange={onChange} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Button onClick={onSave} disabled={saving} className="h-9">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {saving ? "Saving…" : "Save configuration"}
        </Button>
        <Button onClick={handleSetfile} variant="outline" className="h-9">
          <Download className="w-4 h-4 mr-1" /> Download .set file
        </Button>
      </div>
    </div>
  );
}