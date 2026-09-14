import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Link2, Unlink, Send, Loader2, LogIn, ShieldCheck } from "lucide-react";

const CONNECTOR_ID = "6aa77fdca62c98d8ff8b0345";

// App-user Gmail report: each user connects their own Gmail and triggers
// the previous-trading-day high-confidence signal summary to their inbox.
export default function GmailSignalReport() {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastReport, setLastReport] = useState(null);
  const { toast } = useToast();

  // Rule 2: reusable fetch doubles as connection check + status loader.
  const fetchStatus = async () => {
    try {
      const res = await base44.functions.invoke("gmailConnectionStatus", {});
      setConnected(res.data.connected === true);
    } catch {
      setConnected(false);
    }
  };

  // Rule 1: check auth first, then fetch connection status.
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try {
          const me = await base44.auth.me();
          setUser(me);
        } catch {}
        await fetchStatus();
      }
      setLoading(false);
    });
  }, []);

  // Rule 3: open OAuth popup, poll for close, then re-fetch status.
  const handleConnect = async () => {
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          fetchStatus();
        }
      }, 500);
    } catch {
      toast({ title: "Could not start Gmail connection", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      setLastReport(null);
      toast({ title: "Gmail disconnected" });
    } catch {
      toast({ title: "Disconnect failed", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendDailySignalReport", {});
      setLastReport(res.data);
      toast({
        title: "Report sent",
        description: `${res.data.signalCount} signals emailed to ${res.data.recipient}`,
      });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Failed to send report";
      toast({ title: "Report failed", description: msg, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking Gmail connection…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Daily Signal Email Report</h2>
          <p className="text-xs text-muted-foreground mt-1">Sign in to connect Gmail and receive your report.</p>
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          <LogIn className="w-4 h-4" /> Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Daily Signal Email Report</h2>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${connected ? "bg-bull/15 text-bull border-bull/30" : "bg-secondary text-muted-foreground border-border"}`}>
          {connected ? "Gmail connected" : "Not connected"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Generates a summary of the previous trading day's high-confidence signals (score ≥ 70) — symbol, signal, score, and suggested entry / stop / target — and emails it from your connected Gmail to {user.email}.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {!connected ? (
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              <Link2 className="w-4 h-4" /> Connect Gmail
            </button>
          ) : (
            <>
              <button
                onClick={handleSend}
                disabled={sending}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-bull/15 text-bull border border-bull/40 text-sm font-medium disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send my report now"}
              </button>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary border border-border text-muted-foreground text-sm hover:text-foreground"
              >
                <Unlink className="w-4 h-4" /> Disconnect
              </button>
            </>
          )}
        </div>

        {lastReport && (
          <div className="flex items-start gap-2 rounded-md border border-bull/30 bg-bull/5 p-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-bull mt-0.5 shrink-0" />
            <span>
              Last report for <strong>{lastReport.date}</strong> delivered to <strong>{lastReport.recipient}</strong> — {lastReport.signalCount} high-confidence signals included.
            </span>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Note: with per-user Gmail, reports are sent on demand (scheduled automation needs a shared connection). Advisory only — not investment advice.
        </p>
      </div>
    </div>
  );
}