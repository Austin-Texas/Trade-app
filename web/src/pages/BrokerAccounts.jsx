import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/trading/PageHeader";
import { Plug, LockKeyhole, ServerCog } from "lucide-react";

export default function BrokerAccounts(){
 const [accounts,setAccounts]=useState([]); const [msg,setMsg]=useState("");
 useEffect(()=>{base44.entities.BrokerAccount.list().then(setAccounts).catch(e=>setMsg(e?.message||"Unable to load broker accounts."));},[]);
 return <div className="space-y-4">
  <PageHeader title="Broker Accounts" subtitle="Your isolated broker connections and execution environments" />
  <div className="rounded-lg border border-border bg-card p-5">
   <div className="flex items-start gap-3"><LockKeyhole className="w-5 h-5 text-primary mt-0.5"/><div><div className="font-semibold">Credentials stay on the Trading VM</div><div className="text-xs text-muted-foreground mt-1">The browser stores only connection metadata. Broker passwords, API secrets and trading keys must be encrypted and managed by the backend.</div></div></div>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
   {accounts.map(a=><div key={a.id} className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-2"><Plug className="w-4 h-4 text-primary"/><div className="font-semibold">{a.account_label||a.broker_name||a.broker_type}</div><span className="ml-auto text-xs px-2 py-1 rounded bg-secondary">{a.status}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="text-muted-foreground">Broker<div className="text-foreground">{a.broker_name||a.broker_type}</div></div><div className="text-muted-foreground">Environment<div className="text-foreground capitalize">{a.environment}</div></div><div className="text-muted-foreground">Account<div className="text-foreground">{a.account_masked||"—"}</div></div><div className="text-muted-foreground">Equity<div className="text-foreground">{a.equity ?? "—"}</div></div></div></div>)}
   {!accounts.length&&<div className="rounded-lg border border-dashed border-border p-8 text-center"><ServerCog className="w-6 h-6 mx-auto text-muted-foreground"/><div className="mt-2 font-medium">No broker connected</div><div className="text-xs text-muted-foreground mt-1">Broker onboarding will activate after the Trading VM secure connection API is installed.</div></div>}
  </div>{msg&&<div className="text-xs text-warn">{msg}</div>}
 </div>
}