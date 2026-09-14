// Mock data for Global AI Trading Center.
// All data models here mirror what the Linux backend will eventually serve via REST/WebSocket.
// Replace the exported functions with real API/WebSocket calls — no UI or data-shape changes needed.

const now = Date.now();
const iso = (d) => new Date(d).toISOString();

export const assetClasses = [
  "US Stocks", "International Stocks", "ETFs", "Indices", "Crypto", "Forex", "Commodities", "Futures",
];

export const instruments = [
  { symbol: "AAPL", name: "Apple Inc.", category: "US Stocks", country: "US", price: 231.42, change: 2.18, changePct: 0.95, volume: 48_120_000, market: "open" },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "US Stocks", country: "US", price: 138.07, change: 4.61, changePct: 3.45, volume: 218_400_000, market: "open" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "US Stocks", country: "US", price: 248.91, change: -5.37, changePct: -2.11, volume: 98_700_000, market: "open" },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "US Stocks", country: "US", price: 442.68, change: 1.12, changePct: 0.25, volume: 19_300_000, market: "open" },
  { symbol: "AMZN", name: "Amazon.com Inc.", category: "US Stocks", country: "US", price: 201.17, change: -0.84, changePct: -0.42, volume: 32_900_000, market: "open" },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "US Stocks", country: "US", price: 167.30, change: 2.97, changePct: 1.81, volume: 21_500_000, market: "open" },
  { symbol: "META", name: "Meta Platforms", category: "US Stocks", country: "US", price: 575.22, change: 6.11, changePct: 1.07, volume: 14_800_000, market: "open" },
  { symbol: "JPM", name: "JPMorgan Chase", category: "US Stocks", country: "US", price: 222.44, change: 0.51, changePct: 0.23, volume: 8_100_000, market: "open" },
  { symbol: "BABA", name: "Alibaba Group", category: "International Stocks", country: "CN", price: 98.33, change: -1.19, changePct: -1.20, volume: 12_400_000, market: "closed" },
  { symbol: "TSM", name: "TSMC ADR", category: "International Stocks", country: "TW", price: 188.70, change: 3.42, changePct: 1.85, volume: 9_200_000, market: "closed" },
  { symbol: "ASML", name: "ASML Holding", category: "International Stocks", country: "NL", price: 712.55, change: 5.10, changePct: 0.72, volume: 1_200_000, market: "closed" },
  { symbol: "SAP", name: "SAP SE", category: "International Stocks", country: "DE", price: 218.91, change: -0.33, changePct: -0.15, volume: 980_000, market: "closed" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "ETFs", country: "US", price: 583.11, change: 0.94, changePct: 0.16, volume: 41_200_000, market: "open" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", category: "ETFs", country: "US", price: 498.76, change: 2.71, changePct: 0.55, volume: 28_900_000, market: "open" },
  { symbol: "GLD", name: "SPDR Gold Shares", category: "ETFs", country: "US", price: 248.02, change: 1.88, changePct: 0.76, volume: 6_400_000, market: "open" },
  { symbol: "XLE", name: "Energy Select ETF", category: "ETFs", country: "US", price: 92.41, change: -0.77, changePct: -0.83, volume: 8_800_000, market: "open" },
  { symbol: "SPX", name: "S&P 500 Index", category: "Indices", country: "US", price: 5815.03, change: 8.40, changePct: 0.14, volume: 0, market: "open" },
  { symbol: "NDX", name: "Nasdaq 100 Index", category: "Indices", country: "US", price: 20518.62, change: 112.30, changePct: 0.55, volume: 0, market: "open" },
  { symbol: "DJI", name: "Dow Jones Industrial", category: "Indices", country: "US", price: 42706.10, change: -40.20, changePct: -0.09, volume: 0, market: "open" },
  { symbol: "FTSE", name: "FTSE 100", category: "Indices", country: "UK", price: 8270.50, change: 12.40, changePct: 0.15, volume: 0, market: "closed" },
  { symbol: "DAX", name: "DAX 40", category: "Indices", country: "DE", price: 19218.70, change: -33.10, changePct: -0.17, volume: 0, market: "closed" },
  { symbol: "N225", name: "Nikkei 225", category: "Indices", country: "JP", price: 36390.20, change: 510.60, changePct: 1.42, volume: 0, market: "closed" },
  { symbol: "BTCUSD", name: "Bitcoin / USD", category: "Crypto", country: "Global", price: 67412.18, change: 1820.40, changePct: 2.77, volume: 28_400_000_000, market: "open" },
  { symbol: "ETHUSD", name: "Ethereum / USD", category: "Crypto", country: "Global", price: 2618.92, change: -42.10, changePct: -1.58, volume: 12_100_000_000, market: "open" },
  { symbol: "SOLUSD", name: "Solana / USD", category: "Crypto", country: "Global", price: 148.33, change: 4.22, changePct: 2.93, volume: 3_900_000_000, market: "open" },
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "Forex", country: "EU", price: 1.0942, change: 0.0031, changePct: 0.28, volume: 0, market: "open" },
  { symbol: "GBPUSD", name: "British Pound / USD", category: "Forex", country: "UK", price: 1.3188, change: -0.0022, changePct: -0.17, volume: 0, market: "open" },
  { symbol: "USDJPY", name: "US Dollar / Yen", category: "Forex", country: "JP", price: 149.82, change: 0.62, changePct: 0.41, volume: 0, market: "open" },
  { symbol: "XAUUSD", name: "Gold Spot / USD", category: "Commodities", country: "Global", price: 2658.40, change: 18.20, changePct: 0.69, volume: 0, market: "open" },
  { symbol: "XAGUSD", name: "Silver Spot / USD", category: "Commodities", country: "Global", price: 31.42, change: 0.28, changePct: 0.90, volume: 0, market: "open" },
  { symbol: "USOIL", name: "WTI Crude Oil", category: "Commodities", country: "Global", price: 71.22, change: -1.44, changePct: -1.98, volume: 0, market: "open" },
  { symbol: "NATGAS", name: "Natural Gas", category: "Commodities", country: "US", price: 2.418, change: 0.061, changePct: 2.59, volume: 0, market: "open" },
  { symbol: "CLF25", name: "Crude Oil Futures Jan", category: "Futures", country: "Global", price: 70.88, change: -1.51, changePct: -2.08, volume: 412_000, market: "open" },
  { symbol: "GCF25", name: "Gold Futures Feb", category: "Futures", country: "Global", price: 2669.50, change: 17.80, changePct: 0.67, volume: 188_000, market: "open" },
  { symbol: "ESZ24", name: "E-mini S&P Futures", category: "Futures", country: "US", price: 5838.25, change: 9.75, changePct: 0.17, volume: 1_200_000, market: "open" },
];

export const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"];

// Deterministic pseudo-random OHLCV generator so charts look stable across renders.
function genCandles(seed, count, basePrice, volatility) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const candles = [];
  let price = basePrice;
  for (let i = 0; i < count; i++) {
    const open = price;
    const drift = (rnd() - 0.48) * volatility * basePrice;
    const close = Math.max(0.01, open + drift);
    const high = Math.max(open, close) + rnd() * volatility * basePrice * 0.5;
    const low = Math.min(open, close) - rnd() * volatility * basePrice * 0.5;
    const volume = Math.round(50000 + rnd() * 200000);
    candles.push({ open, high: Math.max(high, open, close), low: Math.max(0.01, Math.min(low, open, close)), close, volume, time: now - (count - i) * 3600000 });
    price = close;
  }
  return candles;
}

export const candleData = {};
instruments.forEach((inst, i) => { candleData[inst.symbol] = genCandles(i + 7, 120, inst.price, 0.012); });

// --- AI Signals ---
export const signals = [
  {
    symbol: "BTCUSD", name: "Bitcoin / USD", category: "Crypto", timeframe: "1D",
    signal: "STRONG BUY", score: 83, confidence: "High",
    trend: "Bullish",
    multiTimeframe: { "1D": "Bullish", "4H": "Bullish", "1H": "Bullish", "15M": "Pullback" },
    components: {
      technical_trend: { score: 20, max: 20, label: "Technical Trend" },
      momentum: { score: 12, max: 15, label: "Momentum" },
      volume: { score: 8, max: 10, label: "Volume" },
      support_resistance: { score: 12, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 13, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 8, max: 10, label: "News Sentiment" },
      macro: { score: 6, max: 10, label: "Macro Environment" },
      geopolitical: { score: 4, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 66500, invalidation: 63800, stop: 64100,
      t1: 71200, t2: 74800, t3: 78500,
      support: 63100, resistance: 69200, rr: 2.47, expectedVolatility: "Medium",
    },
    explanation: "Daily, 4H, and 1H trends are aligned bullish. 15M shows a pullback into the EMA20 — a potential continuation entry rather than a fresh breakout. Momentum and volume confirm institutional participation. News sentiment mildly bullish on ETF inflows. Entry zone sits above the daily EMA50 with a tight invalidation below the prior swing low.",
  },
  {
    symbol: "NVDA", name: "NVIDIA Corp.", category: "US Stocks", timeframe: "1D",
    signal: "BUY", score: 76, confidence: "Medium-High",
    trend: "Bullish",
    multiTimeframe: { "1D": "Bullish", "4H": "Bullish", "1H": "Neutral", "15M": "Bullish" },
    components: {
      technical_trend: { score: 16, max: 20, label: "Technical Trend" },
      momentum: { score: 11, max: 15, label: "Momentum" },
      volume: { score: 9, max: 10, label: "Volume" },
      support_resistance: { score: 11, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 11, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 7, max: 10, label: "News Sentiment" },
      macro: { score: 7, max: 10, label: "Macro Environment" },
      geopolitical: { score: 4, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 134.50, invalidation: 128.00, stop: 129.20,
      t1: 148.00, t2: 156.00, t3: null,
      support: 126.80, resistance: 145.00, rr: 2.16, expectedVolatility: "Medium-High",
    },
    explanation: "Strong daily uptrend holding above EMA50. 1H consolidation near resistance — breakout confirmation pending. Volume above average confirms accumulation. AI demand narrative supports fundamentals.",
  },
  {
    symbol: "XAUUSD", name: "Gold Spot / USD", category: "Commodities", timeframe: "1D",
    signal: "BUY", score: 81, confidence: "High",
    trend: "Bullish",
    multiTimeframe: { "1D": "Bullish", "4H": "Bullish", "1H": "Bullish", "15M": "Bullish" },
    components: {
      technical_trend: { score: 18, max: 20, label: "Technical Trend" },
      momentum: { score: 13, max: 15, label: "Momentum" },
      volume: { score: 7, max: 10, label: "Volume" },
      support_resistance: { score: 14, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 14, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 8, max: 10, label: "News Sentiment" },
      macro: { score: 5, max: 10, label: "Macro Environment" },
      geopolitical: { score: 5, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 2640, invalidation: 2590, stop: 2595,
      t1: 2720, t2: 2780, t3: 2850,
      support: 2580, resistance: 2695, rr: 2.80, expectedVolatility: "Medium",
    },
    explanation: "Full multi-timeframe bullish alignment. Safe-haven demand elevated by geopolitical tension. Breakout above 2695 opens path to 2720+. Tight invalidation below 2590 swing low.",
  },
  {
    symbol: "TSLA", name: "Tesla Inc.", category: "US Stocks", timeframe: "1D",
    signal: "SELL", score: 66, confidence: "Medium",
    trend: "Bearish",
    multiTimeframe: { "1D": "Bearish", "4H": "Bearish", "1H": "Neutral", "15M": "Bearish" },
    components: {
      technical_trend: { score: 12, max: 20, label: "Technical Trend" },
      momentum: { score: 9, max: 15, label: "Momentum" },
      volume: { score: 8, max: 10, label: "Volume" },
      support_resistance: { score: 10, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 9, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 6, max: 10, label: "News Sentiment" },
      macro: { score: 6, max: 10, label: "Macro Environment" },
      geopolitical: { score: 3, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 250.50, invalidation: 262.00, stop: 262.00,
      t1: 238.00, t2: 228.00, t3: null,
      support: 226.00, resistance: 258.00, rr: 2.04, expectedVolatility: "High",
    },
    explanation: "Daily and 4H lower-highs/lower-lows structure intact. Rejection at EMA50 on rising volume. 1H neutral — awaiting confirmation of continuation lower. Sentiment pressured by delivery concerns.",
  },
  {
    symbol: "EURUSD", name: "Euro / US Dollar", category: "Forex", timeframe: "4H",
    signal: "WATCH", score: 72, confidence: "Medium",
    trend: "Sideways",
    multiTimeframe: { "1D": "Sideways", "4H": "Bullish", "1H": "Neutral", "15M": "Sideways" },
    components: {
      technical_trend: { score: 11, max: 20, label: "Technical Trend" },
      momentum: { score: 9, max: 15, label: "Momentum" },
      volume: { score: 6, max: 10, label: "Volume" },
      support_resistance: { score: 12, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 11, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 9, max: 10, label: "News Sentiment" },
      macro: { score: 10, max: 10, label: "Macro Environment" },
      geopolitical: { score: 4, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 1.0900, invalidation: 1.0820, stop: 1.0825,
      t1: 1.1020, t2: 1.1080, t3: null,
      support: 1.0830, resistance: 1.0990, rr: 1.52, expectedVolatility: "Low",
    },
    explanation: "Range-bound near the top of a consolidation zone. Mixed timeframes — 4H mildly bullish but daily sideways. Awaiting ECB meeting catalyst. WATCH until breakout confirmation.",
  },
  {
    symbol: "USOIL", name: "WTI Crude Oil", category: "Commodities", timeframe: "1D",
    signal: "WATCH", score: 68, confidence: "Medium",
    trend: "Bearish",
    multiTimeframe: { "1D": "Bearish", "4H": "Sideways", "1H": "Bearish", "15M": "Pullback" },
    components: {
      technical_trend: { score: 13, max: 20, label: "Technical Trend" },
      momentum: { score: 10, max: 15, label: "Momentum" },
      volume: { score: 7, max: 10, label: "Volume" },
      support_resistance: { score: 11, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 10, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 6, max: 10, label: "News Sentiment" },
      macro: { score: 8, max: 10, label: "Macro Environment" },
      geopolitical: { score: 4, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: null, invalidation: null, stop: null,
      t1: null, t2: null, t3: null,
      support: 68.50, resistance: 74.20, rr: null, expectedVolatility: "High",
    },
    explanation: "Bearish daily trend but 15M pullback into a demand zone. Conflicting signals between trend and mean-reversion. OPEC+ meeting pending — WATCH for direction. No setup recommended until confirmation.",
  },
  {
    symbol: "SOLUSD", name: "Solana / USD", category: "Crypto", timeframe: "4H",
    signal: "STRONG SELL", score: 28, confidence: "Low-Medium",
    trend: "Bearish",
    multiTimeframe: { "1D": "Bearish", "4H": "Bearish", "1H": "Bearish", "15M": "Bearish" },
    components: {
      technical_trend: { score: 6, max: 20, label: "Technical Trend" },
      momentum: { score: 5, max: 15, label: "Momentum" },
      volume: { score: 4, max: 10, label: "Volume" },
      support_resistance: { score: 6, max: 15, label: "Support / Resistance" },
      multi_tf: { score: 4, max: 15, label: "Multi-Timeframe Confirmation" },
      news_sentiment: { score: 3, max: 10, label: "News Sentiment" },
      macro: { score: 4, max: 10, label: "Macro Environment" },
      geopolitical: { score: 2, max: 5, label: "Geopolitical Risk" },
    },
    setup: {
      entry: 150.00, invalidation: 162.00, stop: 162.00,
      t1: 138.00, t2: 128.00, t3: 118.00,
      support: 119.00, resistance: 159.00, rr: 2.08, expectedVolatility: "High",
    },
    explanation: "Full bearish alignment across all timeframes. Breakdown below EMA50 with declining volume. Momentum deeply negative. Lower timeframe continuation lower likely. Sentiment weak.",
  },
];

export const signalLevels = ["STRONG BUY", "BUY", "WATCH", "HOLD", "SELL", "STRONG SELL"];

export const signalColor = (signal) => ({
  "STRONG BUY": "bull", "BUY": "bull", "WATCH": "warn", "HOLD": "neutral",
  "SELL": "bear", "STRONG SELL": "bear",
}[signal] || "neutral");

// --- Opportunities (ranked) ---
export const opportunities = [
  { rank: 1, symbol: "BTCUSD", name: "Bitcoin / USD", category: "Crypto", signal: "BUY", score: 88, timeframe: "1D", session: "Global", risk: "Medium" },
  { rank: 2, symbol: "NVDA", name: "NVIDIA Corp.", category: "US Stocks", signal: "BUY", score: 84, timeframe: "1D", session: "US", risk: "Medium" },
  { rank: 3, symbol: "XAUUSD", name: "Gold Spot / USD", category: "Commodities", signal: "BUY", score: 81, timeframe: "1D", session: "Global", risk: "Low" },
  { rank: 4, symbol: "EURUSD", name: "Euro / USD", category: "Forex", signal: "WATCH", score: 72, timeframe: "4H", session: "Europe", risk: "Low" },
  { rank: 5, symbol: "USOIL", name: "WTI Crude Oil", category: "Commodities", signal: "WATCH", score: 68, timeframe: "1D", session: "Global", risk: "High" },
  { rank: 6, symbol: "TSLA", name: "Tesla Inc.", category: "US Stocks", signal: "SELL", score: 66, timeframe: "1D", session: "US", risk: "High" },
  { rank: 7, symbol: "SOLUSD", name: "Solana / USD", category: "Crypto", signal: "STRONG SELL", score: 61, timeframe: "4H", session: "Global", risk: "High" },
  { rank: 8, symbol: "ETHUSD", name: "Ethereum / USD", category: "Crypto", signal: "HOLD", score: 54, timeframe: "1D", session: "Global", risk: "Medium" },
  { rank: 9, symbol: "SPY", name: "SPDR S&P 500 ETF", category: "ETFs", signal: "BUY", score: 71, timeframe: "1D", session: "US", risk: "Low" },
  { rank: 10, symbol: "USDJPY", name: "US Dollar / Yen", category: "Forex", signal: "WATCH", score: 64, timeframe: "4H", session: "Asia", risk: "Medium" },
  { rank: 11, symbol: "N225", name: "Nikkei 225", category: "Indices", signal: "BUY", score: 73, timeframe: "1D", session: "Asia", risk: "Medium" },
  { rank: 12, symbol: "BABA", name: "Alibaba Group", category: "International Stocks", signal: "HOLD", score: 49, timeframe: "1D", session: "Asia", risk: "Medium" },
];

// --- News Intelligence ---
export const newsEvents = [
  {
    id: "n1", title: "Fed Signals Possible Pause at Next FOMC Meeting", source: "Reuters", time: iso(now - 3600000),
    type: "Central Bank", country: "US", region: "North America", actors: ["Federal Reserve"],
    severity: "HIGH", reliability: "Confirmed", confirmation: "High", surprise: "Low",
    markets: ["USD", "Equities", "Bonds"], impact: "Bullish", duration: "Short-term",
    summary: "Multiple Fed officials suggested rate-cut path may pause pending inflation data. Markets pricing reduced odds of November cut. Equity futures ticked higher on dovish-leaning tone.",
  },
  {
    id: "n2", title: "Middle East Tension Escalation Reported Near Strait of Hormuz", source: "AP", time: iso(now - 7200000),
    type: "Military Escalation", country: "IR", region: "Middle East", actors: ["Iran", "US Navy"],
    severity: "HIGH", reliability: "Partially Confirmed", confirmation: "Medium", surprise: "Medium",
    markets: ["Oil", "Gold", "Shipping", "Equities"], impact: "Bearish", duration: "Medium-term",
    summary: "Reports of naval incidents near critical shipping lane. Oil spiked on supply-disruption fears. Safe-haven flows into gold. Airlines and shipping equities sold off.",
  },
  {
    id: "n3", title: "EU Announces New Tariff Framework on EV Imports", source: "Bloomberg", time: iso(now - 14400000),
    type: "Trade Dispute", country: "EU", region: "Europe", actors: ["European Commission", "China"],
    severity: "MEDIUM", reliability: "Confirmed", confirmation: "High", surprise: "Low",
    markets: ["Auto Stocks", "EUR", "EV Sector"], impact: "Mixed", duration: "Long-term",
    summary: "Countervailing duties on Chinese EV imports formalized. Expected to support European automakers short-term while raising consumer prices.",
  },
  {
    id: "n4", title: "NVIDIA Beats Earnings, Guides Above Estimates", source: "WSJ", time: iso(now - 21600000),
    type: "Earnings", country: "US", region: "North America", actors: ["NVIDIA"],
    severity: "HIGH", reliability: "Confirmed", confirmation: "High", surprise: "High",
    markets: ["NVDA", "Semiconductors", "AI Sector"], impact: "Bullish", duration: "Short-term",
    summary: "Q3 revenue exceeded consensus by 8%. Forward guidance signals continued data-center AI demand. Stock up in after-hours on heavy volume.",
  },
  {
    id: "n5", title: "Global Cyberattack Disrupts Major Port Operations", source: "FT", time: iso(now - 28800000),
    type: "Cyberattack", country: "Global", region: "Global", actors: ["Unknown Threat Actor"],
    severity: "MEDIUM", reliability: "Partially Confirmed", confirmation: "Medium", surprise: "High",
    markets: ["Shipping", "Logistics", "Insurance"], impact: "Bearish", duration: "Short-term",
    summary: "Ransomware incident at container terminals delaying cargo. Supply-chain pressure may be short-lived but risk-off sentiment spreads.",
  },
  {
    id: "n6", title: "ECB Cuts Rates by 25bps, Cites Disinflation Progress", source: "Reuters", time: iso(now - 86400000),
    type: "Central Bank", country: "EU", region: "Europe", actors: ["ECB"],
    severity: "HIGH", reliability: "Confirmed", confirmation: "High", surprise: "Low",
    markets: ["EUR", "European Equities", "Bonds"], impact: "Bullish", duration: "Medium-term",
    summary: "Deposit rate lowered to 3.25%. Dovish tone supports risk assets. EUR weakened modestly against majors.",
  },
];

export const newsTypes = [
  "Financial News", "Central Bank", "Government", "Economic Report", "Corporate News", "Earnings",
  "Politics", "Sanctions", "Tariffs", "War", "Military Escalation", "Peace Agreement",
  "Energy Disruption", "Natural Disaster", "Cyberattack", "Supply-Chain Disruption",
];

// --- Geopolitical Risk ---
export const riskLevels = ["LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"];

export const riskRegions = [
  { region: "Middle East", level: "HIGH", score: 78, drivers: ["Conflict escalation", "Shipping disruption", "Energy supply"], probability: "Elevated" },
  { region: "Eastern Europe", level: "HIGH", score: 72, drivers: ["Active conflict", "Sanctions", "Border tension"], probability: "Elevated" },
  { region: "South China Sea", level: "ELEVATED", score: 58, drivers: ["Territorial disputes", "Military exercises", "Trade tensions"], probability: "Moderate" },
  { region: "Korean Peninsula", level: "MODERATE", score: 44, drivers: ["Nuclear rhetoric", "Diplomatic stalemate"], probability: "Low" },
  { region: "Sahel / West Africa", level: "ELEVATED", score: 55, drivers: ["Coups", "Insurgency", "Governance collapse"], probability: "Moderate" },
  { region: "Latin America", level: "MODERATE", score: 38, drivers: ["Elections", "Currency instability"], probability: "Low" },
  { region: "North America", level: "LOW", score: 22, drivers: ["Election cycle", "Trade policy uncertainty"], probability: "Low" },
  { region: "Western Europe", level: "LOW", score: 18, drivers: ["Elections", "Energy transition"], probability: "Low" },
  { region: "South Asia", level: "MODERATE", score: 41, drivers: ["Border tension", "Elections"], probability: "Low" },
];

// --- Economic Calendar ---
export const economicEvents = [
  { id: "e1", time: iso(now + 3600000), country: "US", event: "FOMC Rate Decision", impact: "HIGH", actual: null, forecast: "5.00%", previous: "5.25%", category: "Interest Rate" },
  { id: "e2", time: iso(now + 5400000), country: "US", event: "FOMC Press Conference", impact: "HIGH", actual: null, forecast: null, previous: null, category: "Speech" },
  { id: "e3", time: iso(now + 86400000), country: "US", event: "CPI m/m", impact: "HIGH", actual: null, forecast: "0.2%", previous: "0.2%", category: "Inflation" },
  { id: "e4", time: iso(now + 93600000), country: "US", event: "Core CPI m/m", impact: "HIGH", actual: null, forecast: "0.3%", previous: "0.3%", category: "Inflation" },
  { id: "e5", time: iso(now + 172800000), country: "US", event: "Unemployment Claims", impact: "MEDIUM", actual: null, forecast: "221K", previous: "225K", category: "Employment" },
  { id: "e6", time: iso(now + 190000000), country: "US", event: "Nonfarm Payrolls", impact: "HIGH", actual: null, forecast: "164K", previous: "142K", category: "Employment" },
  { id: "e7", time: iso(now + 259200000), country: "US", event: "GDP q/q (Final)", impact: "MEDIUM", actual: null, forecast: "3.0%", previous: "3.0%", category: "Growth" },
  { id: "e8", time: iso(now + 345600000), country: "EU", event: "ECB Rate Decision", impact: "HIGH", actual: "3.25%", forecast: "3.25%", previous: "3.50%", category: "Interest Rate" },
  { id: "e9", time: iso(now + 432000000), country: "UK", event: "BOE Rate Decision", impact: "HIGH", actual: null, forecast: "4.75%", previous: "5.00%", category: "Interest Rate" },
  { id: "e10", time: iso(now + 518400000), country: "JP", event: "BOJ Rate Decision", impact: "MEDIUM", actual: null, forecast: "0.25%", previous: "0.25%", category: "Interest Rate" },
  { id: "e11", time: iso(now - 86400000), country: "US", event: "PPI m/m", impact: "MEDIUM", actual: "0.0%", forecast: "0.1%", previous: "0.2%", category: "Inflation" },
  { id: "e12", time: iso(now - 172800000), country: "US", event: "Fed Chair Powell Speech", impact: "HIGH", actual: null, forecast: null, previous: null, category: "Speech" },
];

// --- Backtesting ---
export const backtestStats = {
  totalSignals: 1240, wins: 742, losses: 498, winRate: 59.8,
  avgGain: 2.41, avgLoss: -1.38, profitFactor: 2.19, avgRR: 1.74,
  maxDrawdown: 11.2, sharpe: 1.62,
  byAsset: [
    { asset: "Crypto", signals: 320, winRate: 63.1, profitFactor: 2.41 },
    { asset: "US Stocks", signals: 410, winRate: 58.0, profitFactor: 2.05 },
    { asset: "Forex", signals: 180, winRate: 57.2, profitFactor: 1.88 },
    { asset: "Commodities", signals: 150, winRate: 61.3, profitFactor: 2.28 },
    { asset: "Indices", signals: 180, winRate: 60.5, profitFactor: 2.12 },
  ],
  byTimeframe: [
    { timeframe: "1D", signals: 560, winRate: 61.8 },
    { timeframe: "4H", signals: 380, winRate: 58.9 },
    { timeframe: "1H", signals: 300, winRate: 56.7 },
  ],
  byCondition: [
    { condition: "Strong Trend", signals: 480, winRate: 66.2 },
    { condition: "Range-Bound", signals: 420, winRate: 51.4 },
    { condition: "High Volatility", signals: 340, winRate: 58.8 },
  ],
};

// --- Signal History ---
export const signalHistory = [
  { symbol: "BTCUSD", signal: "BUY", confidence: 82, entry: 62100, stop: 59800, target: 71000, date: iso(now - 86400000 * 12), outcome: "WIN", pnl: 14.3 },
  { symbol: "NVDA", signal: "BUY", confidence: 79, entry: 128.20, stop: 122.00, target: 145.00, date: iso(now - 86400000 * 8), outcome: "WIN", pnl: 13.1 },
  { symbol: "XAUUSD", signal: "BUY", confidence: 77, entry: 2510, stop: 2480, target: 2620, date: iso(now - 86400000 * 6), outcome: "WIN", pnl: 4.4 },
  { symbol: "TSLA", signal: "SELL", confidence: 71, entry: 262.00, stop: 270.00, target: 240.00, date: iso(now - 86400000 * 5), outcome: "LOSS", pnl: -3.0 },
  { symbol: "EURUSD", signal: "BUY", confidence: 68, entry: 1.0850, stop: 1.0810, target: 1.0960, date: iso(now - 86400000 * 4), outcome: "EXPIRED", pnl: 0 },
  { symbol: "SOLUSD", signal: "SELL", confidence: 74, entry: 165.00, stop: 173.00, target: 142.00, date: iso(now - 86400000 * 3), outcome: "WIN", pnl: 13.9 },
  { symbol: "USOIL", signal: "BUY", confidence: 69, entry: 68.50, stop: 67.00, target: 74.00, date: iso(now - 86400000 * 2), outcome: "INVALIDATED", pnl: -2.1 },
  { symbol: "ETHUSD", signal: "BUY", confidence: 75, entry: 2480, stop: 2390, target: 2720, date: iso(now - 86400000), outcome: "PENDING", pnl: null },
];

export const historyOutcomes = ["WIN", "LOSS", "EXPIRED", "INVALIDATED", "PENDING"];

// --- System Status ---
export const systemStatus = {
  backend: { status: "online", uptime: "14d 6h", version: "0.9.1-api" },
  database: { status: "online", latencyMs: 8, connections: 42 },
  marketData: { status: "online", lastSync: iso(now - 4000), feeds: 6, active: 6 },
  newsFeed: { status: "degraded", lastSync: iso(now - 48000), feeds: 8, active: 7 },
  aiModel: { status: "online", lastAnalysis: iso(now - 12000), modelsLoaded: 4, queueDepth: 3 },
  apiLatencyMs: 38, workerStatus: [
    { name: "market-collector", status: "running", cpu: 12, tasks: 1840 },
    { name: "news-collector", status: "running", cpu: 8, tasks: 620 },
    { name: "technical-engine", status: "running", cpu: 24, tasks: 920 },
    { name: "signal-engine", status: "running", cpu: 18, tasks: 310 },
    { name: "backtest-engine", status: "idle", cpu: 2, tasks: 0 },
  ],
  recentLogs: [
    { time: iso(now - 2000), level: "INFO", source: "signal-engine", msg: "Generated signal for BTCUSD (score=83)" },
    { time: iso(now - 8000), level: "INFO", source: "market-collector", msg: "Synced 36 instruments across 6 feeds" },
    { time: iso(now - 48000), level: "WARN", source: "news-collector", msg: "Feed 'feed_x' degraded, retrying (attempt 2/3)" },
    { time: iso(now - 120000), level: "ERROR", source: "news-collector", msg: "Connection timeout to source 'feed_x'" },
    { time: iso(now - 200000), level: "INFO", source: "technical-engine", msg: "EMA/RSI/MACD recalculated for 36 instruments" },
  ],
};

// --- Model Intelligence ---
export const modelInfo = {
  models: [
    { name: "Technical Analyzer", type: "OHLCV Pattern", status: "active", version: "v2.4", accuracy: 61.2, lastTrained: "2026-08-20" },
    { name: "News Sentiment (LLM)", type: "Text Classification", status: "active", version: "v1.8", accuracy: 68.7, lastTrained: "2026-09-01" },
    { name: "Multi-Timeframe Engine", type: "Rule Ensemble", status: "active", version: "v3.1", accuracy: 59.8, lastTrained: "2026-07-15" },
    { name: "Geopolitical Risk Model", type: "Event Scoring", status: "active", version: "v1.3", accuracy: 54.3, lastTrained: "2026-08-10" },
  ],
  description: "The signal engine combines a rule-based technical analyzer, an LLM-driven news sentiment model, a multi-timeframe confirmation ensemble, and a geopolitical event scorer. Each contributes a weighted component score (0–100). Component scores are NOT guarantees — they are explainable confidence inputs that must be validated against historical backtesting performance.",
  methodology: [
    "Technical Trend: EMA alignment + market structure (HH/HL/LH/LL) on the signal timeframe.",
    "Momentum: RSI direction & histogram, MACD cross strength.",
    "Volume: Relative volume vs 20-period average; confirmation on breakouts.",
    "Support/Resistance: Proximity to key swing levels and VWAP.",
    "Multi-Timeframe: Daily → 4H → 1H → 15M agreement. A pullback in one TF against a higher-TF trend is NOT a reversal signal.",
    "News Sentiment: LLM classification of recent event flow into bullish/bearish/neutral with reliability weighting.",
    "Macro: Rate environment, dollar strength, risk-on/off regime.",
    "Geopolitical: Early-warning probability scores — never certainty of conflict.",
  ],
};

// --- Strategy vs Live Market Comparison ---
// Each "defined strategy" is a configured rule set tracked in backtesting.
// `backtestReturnPct` = the strategy's hypothetical return over the window.
// `liveMarketReturnPct` = a passive buy-and-hold of the same symbol over the same window (live).
// Replace the static live values with a real backend feed later — the shape stays identical.
export const strategyLiveComparison = [
  { name: "BTC Trend Continuation", symbol: "BTCUSD", direction: "BUY", window: "30D", backtestReturnPct: 12.4, liveMarketReturnPct: 8.1, maxDrawdownPct: 6.2, trades: 9, winRate: 66.7 },
  { name: "Gold Safe-Haven Breakout", symbol: "XAUUSD", direction: "BUY", window: "30D", backtestReturnPct: 5.8, liveMarketReturnPct: 4.2, maxDrawdownPct: 2.1, trades: 6, winRate: 83.3 },
  { name: "NVDA Momentum Rider", symbol: "NVDA", direction: "BUY", window: "30D", backtestReturnPct: 9.1, liveMarketReturnPct: 10.4, maxDrawdownPct: 7.8, trades: 8, winRate: 62.5 },
  { name: "TSLA Breakdown Short", symbol: "TSLA", direction: "SELL", window: "30D", backtestReturnPct: 7.6, liveMarketReturnPct: -3.2, maxDrawdownPct: 4.1, trades: 5, winRate: 60.0 },
  { name: "EURUSD Range Scalper", symbol: "EURUSD", direction: "BUY", window: "30D", backtestReturnPct: 2.3, liveMarketReturnPct: 0.4, maxDrawdownPct: 1.1, trades: 14, winRate: 57.1 },
  { name: "SOL Trend-Follow Short", symbol: "SOLUSD", direction: "SELL", window: "30D", backtestReturnPct: 11.2, liveMarketReturnPct: -6.8, maxDrawdownPct: 5.4, trades: 7, winRate: 71.4 },
  { name: "USOIL Mean Reversion", symbol: "USOIL", direction: "SELL", window: "30D", backtestReturnPct: -1.8, liveMarketReturnPct: -2.0, maxDrawdownPct: 3.9, trades: 11, winRate: 45.5 },
  { name: "SPY Index Trend", symbol: "SPY", direction: "BUY", window: "30D", backtestReturnPct: 3.1, liveMarketReturnPct: 2.7, maxDrawdownPct: 1.4, trades: 4, winRate: 75.0 },
];

// --- API placeholder hooks (wire to Linux backend later) ---
// Replace the bodies with fetch() to https://<vm-host>/api/... or WebSocket subscriptions.
export const api = {
  async getInstruments() { return instruments; },
  async getSignals() { return signals; },
  async getOpportunities() { return opportunities; },
  async getNews() { return newsEvents; },
  async getRisk() { return riskRegions; },
  async getCalendar() { return economicEvents; },
  async getBacktest() { return backtestStats; },
  async getHistory() { return signalHistory; },
  async getSystem() { return systemStatus; },
  async getCandles(symbol) { return candleData[symbol] || candleData[instruments[0].symbol]; },
};

export const fmtPrice = (v) => v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : v >= 1 ? v.toFixed(2) : v.toFixed(4);
export const fmtVol = (v) => {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return String(v);
};