import React, { useState } from "react";
import PageHeader from "@/components/trading/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Lock, Plug, Bell, Shield, ServerCog, RefreshCw, Eye } from "lucide-react";

function Toggle({ label, desc, initial = false }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between gap-6 py-5 border-b border-border last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium leading-5">{label}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} className="shrink-0 data-[state=unchecked]:bg-muted-foreground/30" />
    </div>
  );
}

export default function Settings() {
  const [backendUrl, setBackendUrl] = useState("https://trade-api.hastenload.com");
  const [mt5Server, setMt5Server] = useState("MetaQuotes-Demo");
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [mt5InvestorPassword, setMt5InvestorPassword] = useState("");
  const [mt5Status, setMt5Status] = useState("not_connected");
  const [mt5Message, setMt5Message] = useState("Waiting for credentials and backend connection.");
  const [mt5Account, setMt5Account] = useState(null);

  const testMt5Connection = async () => {
    if (!backendUrl || !mt5Server || !mt5Login || (!mt5InvestorPassword && !mt5Password)) {
      setMt5Status("error");
      setMt5Message("Enter the backend URL, MT5 server, account login, and a password before testing.");
      return;
    }

    setMt5Status("connecting");
    setMt5Message("Connecting to the MT5 bridge…");

    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/mt5/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server: mt5Server,
          login: mt5Login,
          password: mt5InvestorPassword || mt5Password,
          access_mode: "read_only",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.message || `Connection failed (${response.status})`);

      setMt5Account(data);
      setMt5Status("connected");
      setMt5Message(data?.message || "MetaTrader 5 connected successfully in read-only mode.");
    } catch (error) {
      setMt5Account(null);
      setMt5Status("error");
      setMt5Message(error?.message || "Unable to reach the MT5 bridge.");
    }
  };

  const disconnectMt5 = async () => {
    try {
      await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/mt5/disconnect`, { method: "POST" });
    } catch (_) {
      // Local UI still clears even if the bridge is already unreachable.
    }
    setMt5Account(null);
    setMt5Status("not_connected");
    setMt5Message("Disconnected.");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Backend connection, notifications & trading mode" />

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4"><Plug className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Linux Backend Connection</h3></div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Backend API Base URL (HTTPS)</label>
            <input value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">WebSocket Endpoint</label>
            <input defaultValue="wss://your-dell-vm.example.com/ws" className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono" />
          </div>
          <div className="flex items-center gap-2 text-xs text-bull">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse" /> Connection: connected (mock placeholder)
          </div>
          <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground leading-relaxed">
            <Lock className="w-3.5 h-3.5 inline mr-1" />
            API keys and broker credentials are stored only on the Linux VM backend and never exposed in the browser. This page stores only the public endpoint addresses.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ServerCog className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">MetaTrader 5 Connection</h3>
          <span className="ml-auto px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">READ-ONLY</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">MT5 Server</label>
              <input
                value={mt5Server}
                onChange={(e) => setMt5Server(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Account Login</label>
              <input
                value={mt5Login}
                onChange={(e) => setMt5Login(e.target.value)}
                placeholder="Enter MT5 account number"
                inputMode="numeric"
                autoComplete="off"
                className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Investor Password (recommended)</label>
              <input
                type="password"
                value={mt5InvestorPassword}
                onChange={(e) => setMt5InvestorPassword(e.target.value)}
                placeholder="Read-only password"
                autoComplete="new-password"
                className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Trading Password (test only, optional)</label>
              <input
                type="password"
                value={mt5Password}
                onChange={(e) => setMt5Password(e.target.value)}
                placeholder="Optional — investor password is preferred"
                autoComplete="new-password"
                className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Access Mode</label>
              <div className="mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Investor / read-only
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-secondary/40 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Connection</div><div className="font-medium capitalize">{mt5Status.replaceAll("_", " ")}</div></div>
              <div><div className="text-xs text-muted-foreground">Environment</div><div className="font-medium">{mt5Account?.environment || "Demo"}</div></div>
              <div><div className="text-xs text-muted-foreground">Balance</div><div className="font-medium tabular-nums">{mt5Account?.balance ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Equity</div><div className="font-medium tabular-nums">{mt5Account?.equity ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Free Margin</div><div className="font-medium tabular-nums">{mt5Account?.free_margin ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Open Positions</div><div className="font-medium tabular-nums">{mt5Account?.open_positions ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Currency</div><div className="font-medium tabular-nums">{mt5Account?.currency ?? "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Last Sync</div><div className="font-medium tabular-nums">{mt5Account?.last_sync ? new Date(mt5Account.last_sync).toLocaleString() : "Never"}</div></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={testMt5Connection}
            disabled={mt5Status === "connecting"}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${mt5Status === "connecting" ? "animate-spin" : ""}`} /> {mt5Status === "connecting" ? "Connecting…" : "Test Connection"}
          </button>
          <button
            onClick={disconnectMt5}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-medium hover:bg-secondary/80"
          >
            Disconnect
          </button>
          <span className={`text-xs ${mt5Status === "connected" ? "text-bull" : mt5Status === "error" ? "text-bear" : "text-muted-foreground"}`}>
            {mt5Message}
          </span>
        </div>

        <div className="mt-4 rounded-md bg-secondary p-3 text-xs text-muted-foreground leading-relaxed">
          <Lock className="w-3.5 h-3.5 inline mr-1" />
          For this test, credentials are entered here and sent only to your configured MT5 backend endpoint when you press Test Connection. They are not hard-coded into the frontend source. Investor/read-only access is preferred and live order execution remains disabled.
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Trading Mode</h3></div>
        <div className="-mx-1 px-1">
          <Toggle label="Advisory Mode" desc="Generate signals & analysis without execution (always on in v1)" initial={true} />
          <Toggle label="Paper Trading" desc="Simulate trades against real prices (coming soon)" initial={false} />
          <Toggle label="Live Trading" desc="Automated real-money execution (disabled in v1)" initial={false} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Notifications</h3></div>
        <div className="-mx-1 px-1">
          <Toggle label="High-confidence signal alerts" desc="Notify when a signal scores above 80" initial={true} />
          <Toggle label="Geopolitical risk warnings" desc="Alert on elevated or higher risk changes" initial={true} />
          <Toggle label="High-impact economic events" desc="Notify 1 hour before HIGH-impact releases" initial={false} />
        </div>
      </div>

      <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
        ⚠ No automated real-money trading is enabled. The system must first prove signal performance through historical backtesting and paper trading.
      </div>
    </div>
  );
}