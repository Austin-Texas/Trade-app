import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/trading/PageHeader";
import { CheckCircle2, CreditCard, Crown } from "lucide-react";

const plans=[
 {name:"Starter",key:"starter",price:"TBD",features:["1 bot","1 broker account","Signals","Paper trading","Basic risk controls"]},
 {name:"Pro",key:"pro",price:"TBD",features:["Up to 5 bots","Up to 3 broker accounts","Demo/live eligibility","Premium strategies","Full backtesting"]},
 {name:"Elite",key:"elite",price:"TBD",features:["Up to 20 bots","Up to 10 broker accounts","Advanced strategies","Optimization","API access"]},
];
export default function PlansBilling(){
 const [sub,setSub]=useState(null); const [msg,setMsg]=useState("");
 useEffect(()=>{base44.entities.Subscription.list().then(r=>setSub(r?.[0]||null)).catch(e=>setMsg(e?.message||"Unable to load subscription."));},[]);
 return <div className="space-y-4">
  <PageHeader title="Plans & Billing" subtitle="Subscription controls which trading features your account may use" />
  <div className="rounded-lg border border-border bg-card p-4 flex flex-wrap items-center gap-3"><CreditCard className="w-5 h-5 text-primary"/><div><div className="text-sm font-semibold">Current plan: <span className="capitalize">{sub?.plan||"not assigned"}</span></div><div className="text-xs text-muted-foreground">Status: {sub?.status||"billing provider not connected"}</div></div>{sub?.plan&&<span className="ml-auto px-2 py-1 rounded bg-primary/10 text-primary text-xs">{sub.plan.toUpperCase()}</span>}</div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{plans.map(p=><div key={p.key} className={`rounded-lg border bg-card p-5 ${sub?.plan===p.key?"border-primary":"border-border"}`}><div className="flex items-center gap-2"><Crown className="w-4 h-4 text-primary"/><h3 className="font-semibold">{p.name}</h3></div><div className="text-2xl font-bold mt-3">{p.price}</div><div className="mt-4 space-y-2">{p.features.map(f=><div key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-bull"/>{f}</div>)}</div><button disabled className="mt-5 w-full h-9 rounded-md bg-secondary border border-border text-sm text-muted-foreground">Checkout connection coming next</button></div>)}</div>
  <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 text-xs text-warn">Plan prices and payment processing are intentionally not activated yet. A billing provider must be connected before customer upgrades can charge money.</div>
  {msg&&<div className="text-xs text-warn">{msg}</div>}
 </div>
}