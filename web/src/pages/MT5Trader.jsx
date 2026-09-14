import React, { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/trading/PageHeader";
import CandlestickChart from "@/components/trading/CandlestickChart";
import SignalBadge from "@/components/trading/SignalBadge";
import ScoreBar from "@/components/trading/ScoreBar";
import { instruments, signals, newsEvents, riskRegions, economicEvents, fmtPrice } from "@/lib/mockData";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Clock3, Crosshair, Play,
  Radar, RefreshCw, ShieldCheck, Square, TrendingDown, TrendingUp, WalletCards,
} from "lucide-react";

const allSymbols = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "BTCUSD", "ETHUSD", "SOLUSD", "USOIL", "NVDA", "TSLA", "SPY"];
const signalSymbols = new Set(signals.map((s) => s.symbol));

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function signalSide(sig) {
  if (!sig) return "WAIT";
  if (sig.signal.includes("BUY")) return "BUY";
  if (sig.signal.includes("SELL")) return "SELL";
  return "WAIT";
}

function canUseDirection(mode, side) {
  if (side === "WAIT") return true;
  if (mode === "Buy Only" && side !== "BUY") return false;
  if (mode === "Sell Only" && side !== "SELL") return false;
  return true;
}

function componentPercent(sig, key) {
  const c = sig?.components?.[key];
  if (!c?.max) return 50;
  return Math.round((c.score / c.max) * 100);
}

function relevantNewsForSymbol(symbol) {
  const tags = {
    XAUUSD: ["Gold", "USD"], USOIL: ["Oil", "Energy"], EURUSD: ["EUR", "USD"],
    GBPUSD: ["USD", "Equities"], USDJPY: ["USD"], NVDA: ["NVDA", "AI Sector", "Semiconductors"],
    TSLA: ["Auto Stocks", "EV Sector", "Equities"], SPY: ["Equities"], BTCUSD: ["Equities"], ETHUSD: ["Equities"], SOLUSD: ["Equities"],
  }[symbol] || [];
  return newsEvents.filter((n) => n.markets?.some((m) => tags.includes(m))).slice(0, 4);
}

function buildIntelligence(sig) {
  if (!sig) return null;
  const technical = componentPercent(sig, "technical_trend");
  const momentum = componentPercent(sig, "momentum");
  const volume = componentPercent(sig, "volume");
  const structure = componentPercent(sig, "support_resistance");
  const multiTf = componentPercent(sig, "multi_tf");
  const news = componentPercent(sig, "news_sentiment");
  const macro = componentPercent(sig, "macro");
  const geopolitical = componentPercent(sig, "geopolitical");

  const relevantNews = relevantNewsForSymbol(sig.symbol);
  const highSeverityNews = relevantNews.filter((n) => n.severity === "HIGH").length;
  const bullishNews = relevantNews.filter((n) => n.impact === "Bullish").length;
  const bearishNews = relevantNews.filter((n) => n.impact === "Bearish").length;
  const newsTilt = bullishNews === bearishNews ? "NEUTRAL" : bullishNews > bearishNews ? "BULLISH" : "BEARISH";

  const globalRisk = Math.round(riskRegions.reduce((sum, r) => sum + r.score, 0) / Math.max(1, riskRegions.length));
  const now = Date.now();
  const upcomingHighImpact = economicEvents.filter((e) => e.impact === "HIGH" && new Date(e.time).getTime() > now && new Date(e.time).getTime() - now <= 60 * 60 * 1000);
  const eventBlock = upcomingHighImpact.length > 0 && ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "SPY", "NVDA", "TSLA"].includes(sig.symbol);

  const composite = Math.round(
    technical * 0.18 + momentum * 0.12 + volume * 0.08 + structure * 0.12 + multiTf * 0.15 +
    news * 0.12 + macro * 0.13 + geopolitical * 0.10
  );

  const baseSide = signalSide(sig);
  let decision = baseSide;
  const reasons = [];
  if (composite < 60) { decision = "WAIT"; reasons.push("Composite intelligence below execution threshold"); }
  if (baseSide === "BUY" && newsTilt === "BEARISH" && highSeverityNews > 0) { decision = "WAIT"; reasons.push("High-severity news conflicts with BUY direction"); }
  if (baseSide === "SELL" && newsTilt === "BULLISH" && highSeverityNews > 0) { decision = "WAIT"; reasons.push("High-severity news conflicts with SELL direction"); }
  if (eventBlock) { decision = "WAIT"; reasons.push(`High-impact event within 60 minutes: ${upcomingHighImpact[0]?.event}`); }
  if (globalRisk >= 75 && sig.setup?.expectedVolatility === "High") { decision = "WAIT"; reasons.push("Global risk and volatility are both elevated"); }
  if (!reasons.length) reasons.push("Technical, momentum, market structure, news, macro, and geopolitical inputs are sufficiently aligned");

  return {
    decision,
    composite,
    technical, momentum, volume, structure, multiTf, news, macro, geopolitical,
    globalRisk, newsTilt, highSeverityNews, eventBlock,
    upcomingEvent: upcomingHighImpact[0]?.event || null,
    reasons,
  };
}

export default function MT5Trader() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [lotSize, setLotSize] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("5.0");
  const [autoMode, setAutoMode] = useState("Both");
  const [botRunning, setBotRunning] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scanInterval, setScanInterval] = useState(5);
  const [minScore, setMinScore] = useState(65);
  const [maxOpenPositions, setMaxOpenPositions] = useState(3);
  const [maxDailyTrades, setMaxDailyTrades] = useState(10);
  const [riskPerTrade, setRiskPerTrade] = useState(1);
  const [dailyLossLimit, setDailyLossLimit] = useState(3);
  const [activeSignal, setActiveSignal] = useState(signals.find((s) => s.symbol === "XAUUSD") || signals[0]);
  const [status, setStatus] = useState("SCANNER READY");
  const [scanCount, setScanCount] = useState(0);
  const [lastScan, setLastScan] = useState(null);
  const [feed, setFeed] = useState([]);
  const [paperTrades, setPaperTrades] = useState([]);
  const [backendUrl, setBackendUrl] = useState("https://trade-api.hastenload.com");
  const [mt5Busy, setMt5Busy] = useState(false);
  const [mt5Message, setMt5Message] = useState("Demo execution ready when the MT5 bridge is reachable.");
  const [mt5Positions, setMt5Positions] = useState([]);
  const [autoMt5Execution, setAutoMt5Execution] = useState(false);
  const [autoCooldown, setAutoCooldown] = useState(120);
  const [profitGuardEnabled, setProfitGuardEnabled] = useState(true);
  const [profitTargetUsd, setProfitTargetUsd] = useState(100);
  const [profitTargetReached, setProfitTargetReached] = useState(false);
  const [scalpingMode, setScalpingMode] = useState(true);
  const [sessionFilter, setSessionFilter] = useState(true);
  const [newsFilter, setNewsFilter] = useState(true);
  const [newsBlockMinutes, setNewsBlockMinutes] = useState(90);
  const [holidayFilter, setHolidayFilter] = useState(true);
  const [spreadProtection, setSpreadProtection] = useState(true);
  const [maxSpreadPoints, setMaxSpreadPoints] = useState(35);
  const [candleProtection, setCandleProtection] = useState(true);
  const [tickFlowProtection, setTickFlowProtection] = useState(true);
  const [volatilityProtection, setVolatilityProtection] = useState(true);
  const [trailingStop, setTrailingStop] = useState(true);
  const [trailingDistance, setTrailingDistance] = useState(150);
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState(5);
  const scanIndex = useRef(0);
  const lastAutoTradeRef = useRef({ symbol: null, side: null, time: 0 });

  const instrument = useMemo(() => instruments.find((i) => i.symbol === symbol) || instruments[0], [symbol]);
  const accountBalance = 1000000;
  const openPL = paperTrades.reduce((sum, t) => sum + (t.pl || 0), 0);
  const openPositions = paperTrades.filter((t) => t.status === "OPEN").length;
  const dailyTrades = paperTrades.length;
  const mt5OpenPL = mt5Positions.reduce((sum, p) => sum + Number(p.profit || 0), 0);
  const combinedOpenPL = openPL + mt5OpenPL;
  const profitProgress = profitTargetUsd > 0 ? Math.min(100, Math.max(0, (combinedOpenPL / profitTargetUsd) * 100)) : 0;

  const eligibleSignals = useMemo(() => {
    return signals
      .map((s) => ({ ...s, intelligence: buildIntelligence(s) }))
      .filter((s) => s.score >= minScore)
      .filter((s) => s.intelligence?.composite >= minScore)
      .filter((s) => canUseDirection(autoMode, s.intelligence?.decision || signalSide(s)))
      .sort((a, b) => (b.intelligence?.composite || b.score) - (a.intelligence?.composite || a.score));
  }, [minScore, autoMode]);

  const addFeed = (message, tone = "neutral") => {
    const row = { id: `${Date.now()}-${Math.random()}`, time: new Date(), message, tone };
    setFeed((prev) => [row, ...prev].slice(0, 12));
  };

  const executePaperTrade = (side, source = "manual", sig = activeSignal) => {
    if (autoMode === "Signals Only" && source === "auto") {
      addFeed(`Signal found for ${sig.symbol}; execution skipped because mode is Signals Only.`, "warn");
      return;
    }
    if (openPositions >= maxOpenPositions) {
      setStatus("RISK GUARD · MAX OPEN POSITIONS");
      addFeed("Trade blocked: maximum open positions reached.", "bear");
      return;
    }
    if (dailyTrades >= maxDailyTrades) {
      setStatus("RISK GUARD · DAILY TRADE LIMIT");
      addFeed("Trade blocked: daily trade limit reached.", "bear");
      return;
    }
    if (!canUseDirection(autoMode, side)) {
      setStatus(`RISK GUARD · ${side} BLOCKED BY MODE`);
      addFeed(`${side} blocked by Auto Mode (${autoMode}).`, "bear");
      return;
    }

    const ref = instruments.find((i) => i.symbol === (sig?.symbol || symbol)) || instrument;
    const price = sig?.setup?.entry || ref?.price || 0;
    const trade = {
      id: Date.now(),
      time: new Date(),
      symbol: sig?.symbol || symbol,
      side,
      score: sig?.score || 0,
      lot: Number(lotSize) || 0.01,
      price,
      stop: sig?.setup?.stop || null,
      target: sig?.setup?.t1 || null,
      source,
      status: "OPEN",
      pl: 0,
    };
    setPaperTrades((prev) => [trade, ...prev]);
    setSymbol(trade.symbol);
    setStatus(`${side} PAPER ORDER OPEN · ${trade.symbol}`);
    addFeed(`${side} paper order opened on ${trade.symbol} at ${fmtPrice(price)} (${source}).`, side === "BUY" ? "bull" : "bear");
  };

  const runScan = (automatic = false) => {
    setScanCount((n) => n + 1);
    setLastScan(new Date());

    if (!scannerEnabled) {
      setStatus("SCANNER PAUSED");
      return;
    }
    if (eligibleSignals.length === 0) {
      setStatus("NO SIGNALS ABOVE THRESHOLD");
      addFeed(`Scan complete: no setups at or above ${minScore}/100.`, "warn");
      return;
    }

    const next = eligibleSignals[scanIndex.current % eligibleSignals.length];
    scanIndex.current += 1;
    setActiveSignal(next);
    setSymbol(next.symbol);

    const intelligence = next.intelligence || buildIntelligence(next);
    const side = intelligence?.decision || signalSide(next);
    const text = `${next.symbol} · ${side} · AI ${intelligence?.composite || next.score}/100 · ${next.timeframe}`;
    setStatus(text);
    addFeed(`Intelligence decision: ${text}`, side === "BUY" ? "bull" : side === "SELL" ? "bear" : "warn");

    if (intelligence?.reasons?.length) addFeed(`Reason: ${intelligence.reasons[0]}`, side === "WAIT" ? "warn" : "neutral");

    if (automatic && botRunning && side !== "WAIT" && (intelligence?.composite || 0) >= minScore && autoMode !== "Signals Only") {
      if (autoMt5Execution) {
        const nowMs = Date.now();
        const previous = lastAutoTradeRef.current;
        const duplicate = previous.symbol === next.symbol && previous.side === side && nowMs - previous.time < autoCooldown * 1000;
        if (duplicate) {
          addFeed(`${side} ${next.symbol} skipped: ${autoCooldown}s duplicate-trade cooldown active.`, "warn");
        } else if (mt5Positions.length >= maxOpenPositions) {
          addFeed(`MT5 auto order blocked: max open positions (${maxOpenPositions}) reached.`, "bear");
        } else {
          lastAutoTradeRef.current = { symbol: next.symbol, side, time: nowMs };
          setSymbol(next.symbol);
          window.setTimeout(() => executeMt5DemoOrder(side, next), 0);
        }
      } else {
        executePaperTrade(side, "auto", next);
      }
    }
  };

  useEffect(() => {
    if (!botRunning || !scannerEnabled) return undefined;
    runScan(false);
    const id = window.setInterval(() => runScan(true), Math.max(2, scanInterval) * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botRunning, scannerEnabled, scanInterval, minScore, autoMode]);

  const startBot = () => {
    setProfitTargetReached(false);
    setBotRunning(true);
    setStatus("BOT RUNNING · AUTO SCANNER ACTIVE");
    addFeed("Bot started. Automatic market scanning enabled.", "bull");
  }; 

  const stopBot = () => {
    setBotRunning(false);
    setStatus("BOT STOPPED · SCANNER STANDBY");
    addFeed("Bot stopped. No automatic execution will occur.", "warn");
  };

  const closePaperTrade = (id) => {
    setPaperTrades((prev) => prev.map((t) => t.id === id ? { ...t, status: "CLOSED" } : t));
    addFeed("Paper position closed.", "neutral");
  };

  const closeAllPaperTrades = (reason = "manual") => {
    const openCount = paperTrades.filter((t) => t.status === "OPEN").length;
    if (!openCount) return;
    setPaperTrades((prev) => prev.map((t) => t.status === "OPEN" ? { ...t, status: "CLOSED" } : t));
    addFeed(`Closed ${openCount} paper position${openCount === 1 ? "" : "s"} (${reason}).`, "bull");
  };

  useEffect(() => {
    if (!profitGuardEnabled || profitTargetReached || profitTargetUsd <= 0) return;
    if (combinedOpenPL < profitTargetUsd) return;

    setProfitTargetReached(true);
    setBotRunning(false);
    setStatus(`PROFIT TARGET REACHED · ${money(combinedOpenPL)} · BOT STOPPED`);
    addFeed(`Profit target reached at ${money(combinedOpenPL)}. New entries stopped.`, "bull");
    closeAllPaperTrades("profit target");
    setMt5Message("Profit target reached. Bot stopped and new entries disabled. Review MT5 demo positions and close them with the existing position controls if desired.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedOpenPL, profitGuardEnabled, profitTargetUsd, profitTargetReached]);

  const refreshMt5Positions = async () => {
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/mt5/positions`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || `MT5 positions failed (${response.status})`);
      setMt5Positions(data.positions || []);
      setMt5Message(`MT5 demo positions refreshed: ${data.count ?? 0} open.`);
    } catch (error) {
      setMt5Message(error?.message || "Unable to read MT5 demo positions.");
    }
  };

  const executeMt5DemoOrder = async (side, signalOverride = null) => {
    if (mt5Busy) return;
    setMt5Busy(true);
    setMt5Message(`Sending ${side} order to MT5 demo…`);
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/mt5/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: signalOverride?.symbol || symbol,
          side: side.toLowerCase(),
          volume: Number(lotSize) || 0.01,
          stop_loss: signalOverride?.setup?.stop ?? (activeSignal?.symbol === symbol ? activeSignal?.setup?.stop || null : null),
          take_profit: signalOverride?.setup?.t1 ?? (activeSignal?.symbol === symbol ? activeSignal?.setup?.t1 || null : null),
          comment: signalOverride ? "GlobalAITradingCenter AI auto demo" : "GlobalAITradingCenter manual demo",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.message || `MT5 order failed (${response.status})`);
      setMt5Message(`${side} DEMO order accepted · ${data.symbol} · ${data.volume} lots · ticket ${data.order || data.deal || "—"}`);
      addFeed(`${side} MT5 demo order accepted on ${data.symbol} at ${fmtPrice(data.price || 0)}.`, side === "BUY" ? "bull" : "bear");
      await refreshMt5Positions();
    } catch (error) {
      setMt5Message(error?.message || "MT5 demo order failed.");
      addFeed(`MT5 demo ${side} failed: ${error?.message || "unknown error"}`, "bear");
    } finally {
      setMt5Busy(false);
    }
  };

  const closeMt5DemoPosition = async (ticket) => {
    setMt5Busy(true);
    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/mt5/positions/${ticket}/close`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || `Close failed (${response.status})`);
      setMt5Message(`Position ${ticket} closed on MT5 demo.`);
      addFeed(`MT5 demo position ${ticket} closed.`, "neutral");
      await refreshMt5Positions();
    } catch (error) {
      setMt5Message(error?.message || "Unable to close MT5 demo position.");
    } finally {
      setMt5Busy(false);
    }
  };

  const intelligence = useMemo(() => buildIntelligence(activeSignal), [activeSignal]);
  const side = intelligence?.decision || signalSide(activeSignal);
  const scalpingCompatible = !scalpingMode || (symbol === "XAUUSD" && (activeSignal?.timeframe === "1M" || activeSignal?.timeframe === "M1"));
  const signalTone = side === "BUY" ? "text-bull" : side === "SELL" ? "text-bear" : "text-warn";

  return (
    <div className="space-y-4">
      <PageHeader title="MT5 Algorithmic Trader" subtitle="Automatic market scanner, active signals, risk controls, paper execution, and MT5-ready monitoring" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Radar className="w-4 h-4" /> Scanner</div>
          <div className={`text-lg font-semibold mt-1 ${scannerEnabled ? "text-bull" : "text-muted-foreground"}`}>{scannerEnabled ? "ACTIVE" : "PAUSED"}</div>
          <div className="text-[11px] text-muted-foreground">{scanCount} scans completed</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Bot className="w-4 h-4" /> Bot</div>
          <div className={`text-lg font-semibold mt-1 ${botRunning ? "text-bull" : "text-warn"}`}>{botRunning ? "RUNNING" : "STOPPED"}</div>
          <div className="text-[11px] text-muted-foreground">Mode: {autoMode}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><WalletCards className="w-4 h-4" /> Balance</div>
          <div className="text-lg font-semibold mt-1 tabular-nums">{money(accountBalance)}</div>
          <div className="text-[11px] text-muted-foreground">Demo reference</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Open P/L</div>
          <div className={`text-lg font-semibold mt-1 tabular-nums ${openPL >= 0 ? "text-bull" : "text-bear"}`}>{money(openPL)}</div>
          <div className="text-[11px] text-muted-foreground">{openPositions} open positions</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 col-span-2 lg:col-span-1">
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock3 className="w-4 h-4" /> Last Scan</div>
          <div className="text-lg font-semibold mt-1">{lastScan ? lastScan.toLocaleTimeString() : "Never"}</div>
          <div className="text-[11px] text-muted-foreground">Every {scanInterval}s while running</div>
        </div>
      </div>

      {profitTargetReached && (
        <div className="rounded-lg border border-bull/40 bg-bull/10 p-4 flex flex-col md:flex-row md:items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-bull shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-bull">PROFIT TARGET REACHED</div>
            <div className="text-xs text-muted-foreground mt-1">New entries are stopped and all open paper positions were closed automatically. Current combined open P/L: {money(combinedOpenPL)}.</div>
          </div>
          <button onClick={() => setProfitTargetReached(false)} className="h-8 px-3 rounded-md border border-border bg-secondary text-xs">Reset Guard</button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Account, Scanner, Risk & Execution Controls</h3>
          </div>
          <span className="px-2 py-1 rounded text-[11px] font-medium bg-warn/10 text-warn border border-warn/20">DEMO / PAPER EXECUTION</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
          <div><label className="text-xs text-muted-foreground">Server</label><input value="MetaQuotes-Demo" readOnly className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Selected Symbol</label><select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full mt-1 h-9 px-2 rounded-md bg-secondary border border-border text-sm">{allSymbols.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="text-xs text-muted-foreground">Lot Size</label><input value={lotSize} onChange={(e) => setLotSize(e.target.value)} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Stop Loss ($)</label><input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Auto Mode</label><select value={autoMode} onChange={(e) => setAutoMode(e.target.value)} className="w-full mt-1 h-9 px-2 rounded-md bg-secondary border border-border text-sm"><option>Both</option><option>Buy Only</option><option>Sell Only</option><option>Signals Only</option></select></div>
          <div><label className="text-xs text-muted-foreground">Scan Interval</label><select value={scanInterval} onChange={(e) => setScanInterval(Number(e.target.value))} className="w-full mt-1 h-9 px-2 rounded-md bg-secondary border border-border text-sm"><option value={2}>2 sec</option><option value={5}>5 sec</option><option value={10}>10 sec</option><option value={30}>30 sec</option><option value={60}>60 sec</option></select></div>
          <div><label className="text-xs text-muted-foreground">Min Signal Score</label><input type="number" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div><label className="text-xs text-muted-foreground">Risk / Trade %</label><input type="number" step="0.25" min="0.25" max="5" value={riskPerTrade} onChange={(e) => setRiskPerTrade(Number(e.target.value))} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Daily Loss Limit %</label><input type="number" step="0.5" min="0.5" max="20" value={dailyLossLimit} onChange={(e) => setDailyLossLimit(Number(e.target.value))} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Max Open Positions</label><input type="number" min="1" max="20" value={maxOpenPositions} onChange={(e) => setMaxOpenPositions(Number(e.target.value))} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
          <div><label className="text-xs text-muted-foreground">Max Daily Trades</label><input type="number" min="1" max="100" value={maxDailyTrades} onChange={(e) => setMaxDailyTrades(Number(e.target.value))} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm" /></div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <button onClick={() => setProfitGuardEnabled((v) => !v)} className={`h-9 px-4 rounded-md border text-sm font-medium ${profitGuardEnabled ? "bg-bull/10 border-bull/40 text-bull" : "bg-secondary border-border text-muted-foreground"}`}>{profitGuardEnabled ? "Auto Profit Guard ON" : "Auto Profit Guard OFF"}</button>
            <div>
              <label className="text-xs text-muted-foreground">Close-All Profit Target ($)</label>
              <input type="number" min="1" step="10" value={profitTargetUsd} onChange={(e) => setProfitTargetUsd(Number(e.target.value))} className="block mt-1 h-9 w-44 px-3 rounded-md bg-background border border-border text-sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Profit progress</span><span className="font-medium">{money(combinedOpenPL)} / {money(profitTargetUsd)}</span></div>
              <div className="h-2 rounded-full bg-background overflow-hidden"><div className="h-full bg-bull transition-all" style={{ width: `${profitProgress}%` }} /></div>
              <div className="mt-1 text-[11px] text-muted-foreground">MT5 open P/L {money(mt5OpenPL)} · Paper open P/L {money(openPL)}</div>
            </div>
            <button onClick={() => closeAllPaperTrades("manual close all")} className="h-9 px-4 rounded-md bg-secondary border border-border text-sm font-medium">Close All Paper</button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2"><Crosshair className="w-4 h-4 text-primary" /><div><div className="text-sm font-semibold">XAUUSD M1 Smart Scalping Protection</div><div className="text-[11px] text-muted-foreground">Inspired by professional scalping controls; implemented as our own configurable risk/filter layer.</div></div></div>
            <button onClick={() => setScalpingMode(v => !v)} className={`ml-auto h-8 px-3 rounded-md border text-xs font-medium ${scalpingMode ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"}`}>{scalpingMode ? "SCALPING MODE ON" : "SCALPING MODE OFF"}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
            {[["Session Filter", sessionFilter, setSessionFilter], ["News Protection", newsFilter, setNewsFilter], ["Holiday Protection", holidayFilter, setHolidayFilter], ["Spread Protection", spreadProtection, setSpreadProtection], ["Candle Spike Protection", candleProtection, setCandleProtection], ["Tick Flow Protection", tickFlowProtection, setTickFlowProtection], ["Volatility Protection", volatilityProtection, setVolatilityProtection], ["Trailing Stop", trailingStop, setTrailingStop]].map(([label, value, setter]) => <button key={label} onClick={() => setter(!value)} className={`rounded-md border p-3 text-left ${value ? "border-bull/30 bg-bull/5" : "border-border bg-secondary"}`}><div className="font-medium">{label}</div><div className={value ? "text-bull mt-1" : "text-muted-foreground mt-1"}>{value ? "ACTIVE" : "OFF"}</div></button>)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div><label className="text-[11px] text-muted-foreground">News block ± minutes</label><input type="number" min="0" max="240" value={newsBlockMinutes} onChange={e => setNewsBlockMinutes(Number(e.target.value))} className="w-full mt-1 h-8 px-2 rounded bg-background border border-border text-xs" /></div>
            <div><label className="text-[11px] text-muted-foreground">Max spread points</label><input type="number" min="1" value={maxSpreadPoints} onChange={e => setMaxSpreadPoints(Number(e.target.value))} className="w-full mt-1 h-8 px-2 rounded bg-background border border-border text-xs" /></div>
            <div><label className="text-[11px] text-muted-foreground">Trailing distance points</label><input type="number" min="1" value={trailingDistance} onChange={e => setTrailingDistance(Number(e.target.value))} className="w-full mt-1 h-8 px-2 rounded bg-background border border-border text-xs" /></div>
            <div><label className="text-[11px] text-muted-foreground">Max drawdown %</label><input type="number" min="0.5" max="50" step="0.5" value={maxDrawdownPercent} onChange={e => setMaxDrawdownPercent(Number(e.target.value))} className="w-full mt-1 h-8 px-2 rounded bg-background border border-border text-xs" /></div>
          </div>
          {scalpingMode && !scalpingCompatible && <div className="mt-3 rounded-md border border-warn/30 bg-warn/5 p-2 text-xs text-warn">Scalping mode is optimized for XAUUSD M1. Other symbols/timeframes should use the general intelligence engine.</div>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <button onClick={() => setScannerEnabled((v) => !v)} className={`h-9 px-4 rounded-md border text-sm font-medium inline-flex items-center gap-2 ${scannerEnabled ? "border-bull/40 bg-bull/10 text-bull" : "border-border bg-secondary"}`}><Radar className="w-4 h-4" /> {scannerEnabled ? "Scanner Active" : "Scanner Paused"}</button>
          <button onClick={() => runScan(false)} className="h-9 px-4 rounded-md bg-secondary border border-border text-sm font-medium inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Scan Now</button>
          <button onClick={startBot} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2"><Play className="w-4 h-4" /> Start Bot</button>
          <button onClick={stopBot} className="h-9 px-4 rounded-md bg-secondary border border-border text-sm font-medium inline-flex items-center gap-2"><Square className="w-4 h-4" /> Stop Bot</button>
          <button onClick={() => setAutoMt5Execution((v) => !v)} className={`h-9 px-4 rounded-md border text-sm font-medium ${autoMt5Execution ? "bg-bear/10 border-bear/40 text-bear" : "bg-secondary border-border text-muted-foreground"}`}>{autoMt5Execution ? "AUTO MT5 DEMO ON" : "AUTO MT5 DEMO OFF"}</button>
          <div className="ml-auto flex gap-2">
            <button disabled={mt5Busy} onClick={() => executeMt5DemoOrder("BUY")} className="h-9 px-4 rounded-md bg-bull text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"><TrendingUp className="w-4 h-4" /> BUY DEMO</button>
            <button disabled={mt5Busy} onClick={() => executeMt5DemoOrder("SELL")} className="h-9 px-4 rounded-md bg-bear text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"><TrendingDown className="w-4 h-4" /> SELL DEMO</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs text-muted-foreground">Active Market Signal</div>
              <div className={`text-2xl font-bold mt-1 ${signalTone}`}>{activeSignal?.symbol} · {activeSignal?.signal}</div>
              <div className="text-xs text-muted-foreground mt-1">{activeSignal?.timeframe} · {activeSignal?.trend} · Confidence {activeSignal?.confidence}</div>
            </div>
            <div className="text-right">
              <SignalBadge signal={activeSignal?.signal || "WATCH"} size="lg" />
              <div className="text-2xl font-bold tabular-nums mt-2">{activeSignal?.score || 0}<span className="text-sm text-muted-foreground">/100</span></div>
            </div>
          </div>

          <ScoreBar score={intelligence?.composite || activeSignal?.score || 0} />

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 mt-4 text-xs">
            {[
              ["Technical", intelligence?.technical], ["Momentum", intelligence?.momentum], ["Volume", intelligence?.volume],
              ["Structure", intelligence?.structure], ["Multi-TF", intelligence?.multiTf], ["News", intelligence?.news],
              ["Macro", intelligence?.macro], ["Geopolitical", intelligence?.geopolitical],
            ].map(([label, value]) => <div key={label} className="rounded-md bg-secondary p-2"><div className="text-muted-foreground">{label}</div><div className="font-semibold mt-1">{value ?? "—"}/100</div></div>)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Entry</div><div className="font-semibold mt-1">{activeSignal?.setup?.entry ? fmtPrice(activeSignal.setup.entry) : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Stop Loss</div><div className="font-semibold mt-1 text-bear">{activeSignal?.setup?.stop ? fmtPrice(activeSignal.setup.stop) : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Target 1</div><div className="font-semibold mt-1 text-bull">{activeSignal?.setup?.t1 ? fmtPrice(activeSignal.setup.t1) : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">R/R</div><div className="font-semibold mt-1">{activeSignal?.setup?.rr ? `${activeSignal.setup.rr.toFixed(2)} : 1` : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Support</div><div className="font-semibold mt-1">{activeSignal?.setup?.support ? fmtPrice(activeSignal.setup.support) : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Resistance</div><div className="font-semibold mt-1">{activeSignal?.setup?.resistance ? fmtPrice(activeSignal.setup.resistance) : "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Volatility</div><div className="font-semibold mt-1">{activeSignal?.setup?.expectedVolatility || "—"}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">Scanner Status</div><div className="font-semibold mt-1">{status}</div></div>
          </div>

          <div className="mt-4 rounded-md border border-border bg-secondary/30 p-3">
            <div className="text-xs font-medium mb-2">Why this signal?</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeSignal?.explanation || "Waiting for scanner output."}</p>
            <div className="mt-2 text-xs"><span className="text-muted-foreground">AI execution decision:</span> <span className={`font-semibold ${signalTone}`}>{side}</span> · Composite {intelligence?.composite ?? "—"}/100 · News {intelligence?.newsTilt || "NEUTRAL"} · Global risk {intelligence?.globalRisk ?? "—"}/100</div>
            {intelligence?.eventBlock && <div className="mt-1 text-xs text-warn">Execution veto: {intelligence.upcomingEvent}</div>}
            {intelligence?.reasons?.map((r, i) => <div key={i} className="mt-1 text-xs text-muted-foreground">• {r}</div>)}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3"><Crosshair className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Scanner Feed</h3></div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {feed.length === 0 ? <div className="text-xs text-muted-foreground">Start the bot or click Scan Now to populate the feed.</div> : feed.map((f) => (
              <div key={f.id} className="rounded-md bg-secondary p-2.5 text-xs">
                <div className="text-[10px] text-muted-foreground">{f.time.toLocaleTimeString()}</div>
                <div className={`mt-1 ${f.tone === "bull" ? "text-bull" : f.tone === "bear" ? "text-bear" : f.tone === "warn" ? "text-warn" : "text-foreground"}`}>{f.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Live Market & Signal Canvas</h3>
            <p className="text-xs text-muted-foreground">{symbol} · scanner-selected chart · reference {instrument?.price ?? "—"}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="w-4 h-4 text-primary" /> Demo guard active · no live MT5 order submitted</div>
        </div>
        <CandlestickChart symbol={symbol} height={360} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">MT5 Bridge API URL</label>
            <input value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} className="w-full mt-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm font-mono" />
          </div>
          <button onClick={refreshMt5Positions} disabled={mt5Busy} className="h-9 px-4 rounded-md bg-secondary border border-border text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${mt5Busy ? "animate-spin" : ""}`} /> Refresh MT5</button>
          <div className="text-xs text-muted-foreground lg:max-w-xl">{mt5Message}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active MT5 Demo Positions</h3>
          <span className="text-xs text-muted-foreground">Manual demo execution only</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-muted-foreground border-b border-border"><th className="px-3 py-2">Ticket</th><th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Side</th><th className="px-3 py-2">Volume</th><th className="px-3 py-2">Open</th><th className="px-3 py-2">Current</th><th className="px-3 py-2">P/L</th><th className="px-3 py-2"></th></tr></thead>
            <tbody className="divide-y divide-border">
              {mt5Positions.map((p) => <tr key={p.ticket}><td className="px-3 py-2">{p.ticket}</td><td className="px-3 py-2 font-medium">{p.symbol}</td><td className={`px-3 py-2 ${p.type === "buy" ? "text-bull" : "text-bear"}`}>{p.type.toUpperCase()}</td><td className="px-3 py-2">{p.volume}</td><td className="px-3 py-2">{fmtPrice(p.price_open)}</td><td className="px-3 py-2">{fmtPrice(p.price_current)}</td><td className={`px-3 py-2 ${p.profit >= 0 ? "text-bull" : "text-bear"}`}>{money(p.profit)}</td><td className="px-3 py-2 text-right"><button disabled={mt5Busy} onClick={() => closeMt5DemoPosition(p.ticket)} className="text-primary hover:underline disabled:opacity-50">Close</button></td></tr>)}
            </tbody>
          </table>
          {mt5Positions.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">No MT5 demo positions loaded yet. Click Refresh MT5.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between"><h3 className="text-sm font-semibold">Paper Positions</h3><span className="text-xs text-muted-foreground">{openPositions}/{maxOpenPositions} open</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-muted-foreground border-b border-border"><th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Side</th><th className="px-3 py-2">Entry</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {paperTrades.map((t) => <tr key={t.id}><td className="px-3 py-2 font-medium">{t.symbol}</td><td className={`px-3 py-2 ${t.side === "BUY" ? "text-bull" : "text-bear"}`}>{t.side}</td><td className="px-3 py-2">{fmtPrice(t.price)}</td><td className="px-3 py-2">{t.score}</td><td className="px-3 py-2 capitalize">{t.source}</td><td className="px-3 py-2">{t.status}</td><td className="px-3 py-2 text-right">{t.status === "OPEN" && <button onClick={() => closePaperTrade(t.id)} className="text-primary hover:underline">Close</button>}</td></tr>)}
              </tbody>
            </table>
            {paperTrades.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">No paper trades yet.</div>}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Execution Guards</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-bull mt-0.5" /><div><div className="font-medium">Signal threshold</div><div className="text-muted-foreground">Auto actions require ≥ {minScore}/100</div></div></div>
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-bull mt-0.5" /><div><div className="font-medium">Position cap</div><div className="text-muted-foreground">Maximum {maxOpenPositions} simultaneous positions</div></div></div>
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-bull mt-0.5" /><div><div className="font-medium">Trade cap</div><div className="text-muted-foreground">Maximum {maxDailyTrades} trades per day</div></div></div>
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-warn mt-0.5" /><div><div className="font-medium">Loss protection</div><div className="text-muted-foreground">Risk {riskPerTrade}% / trade · stop day at {dailyLossLimit}%</div></div></div>
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-bull mt-0.5" /><div><div className="font-medium">Profit guard</div><div className="text-muted-foreground">{profitGuardEnabled ? `Stops new entries at ${money(profitTargetUsd)} combined open profit` : "Disabled"}</div></div></div>
            <div className="rounded-md bg-secondary p-3 flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5" /><div><div className="font-medium">Scalping protection</div><div className="text-muted-foreground">{scalpingMode ? `XAUUSD M1 filters active · news ±${newsBlockMinutes}m · spread ≤ ${maxSpreadPoints} pts · DD ${maxDrawdownPercent}%` : "Disabled"}</div></div></div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-secondary p-3"><div className="font-medium">Auto MT5 demo execution</div><div className="text-muted-foreground mt-1">{autoMt5Execution ? "ON — Start Bot can send qualifying BUY/SELL orders to the connected MT5 demo account." : "OFF — automatic qualifying signals remain paper trades."}</div></div>
            <div className="rounded-md bg-secondary p-3"><div className="font-medium">Duplicate trade cooldown</div><div className="text-muted-foreground mt-1 flex items-center gap-2"><input type="number" min="30" max="3600" value={autoCooldown} onChange={(e) => setAutoCooldown(Number(e.target.value))} className="w-24 h-8 px-2 rounded bg-background border border-border" /> seconds per symbol/direction</div></div>
          </div>
          <div className="mt-3 rounded-md border border-warn/30 bg-warn/5 p-3 text-xs text-warn">
            Automatic MT5 execution is restricted to the demo-account bridge. The intelligence gate combines chart/technical factors, momentum, volume, market structure, multi-timeframe alignment, news, macro conditions, geopolitical risk, event vetoes, position limits, and a duplicate-trade cooldown. These inputs are probabilistic and do not guarantee profitable trades.
          </div>
        </div>
      </div>
    </div>
  );
}