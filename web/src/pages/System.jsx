import React from "react";
import { systemStatus } from "@/lib/mockData";
import PageHeader from "@/components/trading/PageHeader";
import StatCard from "@/components/trading/StatCard";
import { Server, Database, Activity, Newspaper, Cpu } from "lucide-react";

function StatusPill({ status }) {
  const map = {
    online: "bg-bull/15 text-bull", running: "bg-bull/15 text-bull",
    degraded: "bg-warn/15 text-warn", idle: "bg-secondary text-muted-foreground", offline: "bg-bear/15 text-bear",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-secondary"}`}>{status}</span>;
}

function logColor(l) { return { INFO: "text-muted-foreground", WARN: "text-warn", ERROR: "text-bear" }[l] || "text-muted-foreground"; }

export default function System() {
  const s = systemStatus;
  return (
    <div className="space-y-4">
      <PageHeader title="System Monitoring" subtitle="Linux backend health, data feeds, workers & logs" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Server className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Backend</div><div className="flex items-center gap-2"><StatusPill status={s.backend.status} /><span className="text-xs text-muted-foreground">{s.backend.version}</span></div></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Database</div><div className="flex items-center gap-2"><StatusPill status={s.database.status} /><span className="text-xs text-muted-foreground">{s.database.latencyMs}ms</span></div></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Market Data</div><div className="flex items-center gap-2"><StatusPill status={s.marketData.status} /><span className="text-xs text-muted-foreground">{s.marketData.active}/{s.marketData.feeds} feeds</span></div></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">News Feed</div><div className="flex items-center gap-2"><StatusPill status={s.newsFeed.status} /><span className="text-xs text-muted-foreground">{s.newsFeed.active}/{s.newsFeed.feeds} feeds</span></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3"><Cpu className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">AI Model</h3></div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Status</div><StatusPill status={s.aiModel.status} /></div>
            <div><div className="text-xs text-muted-foreground">Models Loaded</div><div className="font-medium tabular-nums">{s.aiModel.modelsLoaded}</div></div>
            <div><div className="text-xs text-muted-foreground">Last Analysis</div><div className="font-medium tabular-nums">{new Date(s.aiModel.lastAnalysis).toLocaleTimeString("en-GB")}</div></div>
            <div><div className="text-xs text-muted-foreground">Queue Depth</div><div className="font-medium tabular-nums">{s.aiModel.queueDepth}</div></div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3"><Server className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">API Performance</h3></div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Avg Latency</div><div className="font-medium tabular-nums">{s.apiLatencyMs}ms</div></div>
            <div><div className="text-xs text-muted-foreground">DB Connections</div><div className="font-medium tabular-nums">{s.database.connections}</div></div>
            <div><div className="text-xs text-muted-foreground">Backend Uptime</div><div className="font-medium tabular-nums">{s.backend.uptime}</div></div>
            <div><div className="text-xs text-muted-foreground">Market Sync</div><div className="font-medium tabular-nums">{new Date(s.marketData.lastSync).toLocaleTimeString("en-GB")}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Worker Status</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-4 py-2 font-medium">Worker</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium text-right">CPU</th><th className="px-4 py-2 font-medium text-right">Tasks</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {s.workerStatus.map((w) => (
                <tr key={w.name} className="hover:bg-secondary">
                  <td className="px-4 py-2.5 font-medium">{w.name}</td>
                  <td className="px-4 py-2.5"><StatusPill status={w.status} /></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{w.cpu}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{w.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold">Recent Logs</h3></div>
          <div className="p-3 font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
            {s.recentLogs.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground shrink-0">{new Date(l.time).toLocaleTimeString("en-GB")}</span>
                <span className={`shrink-0 font-medium ${logColor(l.level)}`}>{l.level}</span>
                <span className="text-muted-foreground shrink-0">[{l.source}]</span>
                <span className="truncate">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}