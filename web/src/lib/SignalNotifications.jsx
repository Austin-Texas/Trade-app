import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { instruments, signals } from "@/lib/mockData";
import { useToast } from "@/components/ui/use-toast";

// A signal is "high-confidence" when its composite score crosses this threshold.
// Mirrors the Settings page default ("Notify when a signal scores above 80").
export const HIGH_CONFIDENCE_THRESHOLD = 80;
const SCAN_INTERVAL_MS = 45000;
const STORAGE_KEY = "gaitc_signal_notifications";
const MAX_NOTIFICATIONS = 50;

const TIMEFRAMES = ["1D", "4H", "1H"];

function confidenceFor(score) {
  if (score >= 80) return "High";
  if (score >= 65) return "Medium-High";
  if (score >= 50) return "Medium";
  return "Low";
}

// Simulates the backend signal engine producing a fresh candidate signal.
// Replace this with a real WebSocket/REST subscription later — the notification
// shape stays identical, so no UI changes will be needed.
function generateCandidateSignal() {
  const inst = instruments[Math.floor(Math.random() * instruments.length)];
  const roll = Math.random();
  let signal;
  if (roll < 0.4) signal = Math.random() < 0.5 ? "STRONG BUY" : "BUY";
  else if (roll < 0.8) signal = Math.random() < 0.5 ? "STRONG SELL" : "SELL";
  else signal = "WATCH";

  const base = signal === "STRONG BUY" || signal === "STRONG SELL" ? 72 : 56;
  const score = Math.min(99, Math.max(35, base + Math.floor(Math.random() * 28)));
  const trend = signal.includes("BUY") ? "Bullish" : signal.includes("SELL") ? "Bearish" : "Sideways";

  return {
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    symbol: inst.symbol,
    name: inst.name,
    category: inst.category,
    timeframe: TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)],
    signal,
    score,
    confidence: confidenceFor(score),
    trend,
    created_at: new Date().toISOString(),
  };
}

const SignalNotificationContext = createContext(null);

export function SignalNotificationProvider({ children }) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const readyRef = useRef(false);

  // Seed: restore persisted notifications, otherwise pre-seed from existing
  // high-confidence signals so the dashboard is populated on first load.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
        readyRef.current = true;
        return;
      }
    } catch (_) { /* ignore corrupted storage */ }

    const seed = signals
      .filter((s) => s.score >= HIGH_CONFIDENCE_THRESHOLD)
      .map((s, i) => ({
        id: `seed_${s.symbol}`,
        symbol: s.symbol,
        name: s.name,
        category: s.category,
        timeframe: s.timeframe,
        signal: s.signal,
        score: s.score,
        confidence: s.confidence,
        trend: s.trend,
        created_at: new Date(Date.now() - (i + 1) * 600000).toISOString(),
      }))
      .sort((a, b) => b.score - a.score);
    setNotifications(seed);
    setUnreadCount(seed.length);
    readyRef.current = true;
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!readyRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notifications, unreadCount }));
    } catch (_) { /* storage may be unavailable */ }
  }, [notifications, unreadCount]);

  // Simulated signal engine: every interval the AI emits a candidate signal.
  // Only high-confidence candidates (score >= threshold) raise a notification + toast.
  useEffect(() => {
    if (!readyRef.current) return;
    const interval = setInterval(() => {
      let candidate = generateCandidateSignal();
      // Retry a few times so the engine periodically produces a high-confidence hit.
      let attempts = 0;
      while (candidate.score < HIGH_CONFIDENCE_THRESHOLD && attempts < 4) {
        candidate = generateCandidateSignal();
        attempts++;
      }
      if (candidate.score < HIGH_CONFIDENCE_THRESHOLD) return;

      setNotifications((prev) => {
        // Replace any existing alert for the same symbol (latest wins), cap the list.
        const filtered = prev.filter((n) => n.symbol !== candidate.symbol);
        return [candidate, ...filtered].slice(0, MAX_NOTIFICATIONS);
      });
      setUnreadCount((prev) => prev + 1);

      toast({
        title: `High-confidence signal · ${candidate.symbol}`,
        description: `${candidate.signal} · Score ${candidate.score}/100 · ${candidate.timeframe} · ${candidate.trend}`,
        variant: candidate.signal.includes("SELL") ? "destructive" : "default",
      });
    }, SCAN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback(() => setUnreadCount(0), []);
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);
  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <SignalNotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, clearAll, dismiss, threshold: HIGH_CONFIDENCE_THRESHOLD }}
    >
      {children}
    </SignalNotificationContext.Provider>
  );
}

export function useSignalNotifications() {
  const ctx = useContext(SignalNotificationContext);
  if (!ctx) {
    // Graceful fallback: if the provider is absent (e.g. during Vite HMR where
    // a stale context reference resolves to null), return no-op defaults so the
    // UI degrades to an empty state instead of crashing the whole app.
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      clearAll: () => {},
      dismiss: () => {},
      threshold: HIGH_CONFIDENCE_THRESHOLD,
    };
  }
  return ctx;
}