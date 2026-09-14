import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, LineChart, CandlestickChart, Radar, Crosshair, Newspaper,
  Globe2, CalendarDays, History, BarChart3, Cpu, Activity, Settings,
  Search, Menu, X, TrendingUp, Bot, Coins, WalletCards, CreditCard,
} from "lucide-react";
import SignalNotificationBell from "@/components/SignalNotificationBell";
import WatchlistWidget from "@/components/trading/WatchlistWidget";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/markets", label: "Markets", icon: LineChart },
  { to: "/charts", label: "Charts", icon: CandlestickChart },
  { to: "/signals", label: "AI Signals", icon: Crosshair },
  { to: "/mt5-trader", label: "MT5 Trader", icon: Bot },
  { to: "/my-bots", label: "My Bots", icon: Bot },
  { to: "/brokers", label: "Broker Accounts", icon: WalletCards },
  { to: "/gold-reaper", label: "Gold Reaper", icon: Coins },
  { to: "/opportunities", label: "AI Opportunities", icon: Radar },
  { to: "/news", label: "News & Events", icon: Newspaper },
  { to: "/risk", label: "World Risk", icon: Globe2 },
  { to: "/calendar", label: "Economic Calendar", icon: CalendarDays },
  { to: "/backtest", label: "Backtest", icon: BarChart3 },
  { to: "/history", label: "Signal History", icon: History },
  { to: "/models", label: "Model Intelligence", icon: Cpu },
  { to: "/system", label: "System", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Plans & Billing", icon: CreditCard },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-primary/15 text-accent-foreground border-l-2 border-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground border-l-2 border-transparent"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (to) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-60 shrink-0 bg-card border-r border-border flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Global AI Trading</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Center</div>
          </div>
          <button className="ml-auto lg:hidden text-muted-foreground" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
            {nav.map((item) => (
              <NavItem key={item.to} item={item} active={isActive(item.to)} onClick={() => setOpen(false)} />
            ))}
          </nav>
          <div className="shrink-0 max-h-[40%] overflow-hidden flex flex-col">
            <WatchlistWidget />
          </div>
        </div>
        <div className="p-3 border-t border-border text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            Backend: <span className="text-bull">Online</span>
          </div>
          <div>Advisory Mode · No Live Trading</div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 sticky top-0 z-20 flex items-center gap-3 px-4 bg-card/80 backdrop-blur border-b border-border">
          <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbol, market, news…"
              className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded bg-secondary">UTC</span>
            <span className="px-2 py-1 rounded bg-secondary tabular-nums">{new Date().toLocaleDateString("en-CA")}</span>
          </div>
          <SignalNotificationBell />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}