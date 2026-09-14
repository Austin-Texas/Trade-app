import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Markets from "@/pages/Markets";
import Charts from "@/pages/Charts";
import AISignals from "@/pages/AISignals";
import MT5Trader from "@/pages/MT5Trader";
import GoldReaper from "@/pages/GoldReaper";
import Opportunities from "@/pages/Opportunities";
import NewsEvents from "@/pages/NewsEvents";
import WorldRisk from "@/pages/WorldRisk";
import EconomicCalendar from "@/pages/EconomicCalendar";
import Backtest from "@/pages/Backtest";
import SignalHistory from "@/pages/SignalHistory";
import ModelIntelligence from "@/pages/ModelIntelligence";
import SystemPage from "@/pages/System";
import SettingsPage from "@/pages/Settings";
import MyBots from "@/pages/MyBots";
import BrokerAccounts from "@/pages/BrokerAccounts";
import PlansBilling from "@/pages/PlansBilling";
import PageNotFound from "./lib/PageNotFound";
import { SignalNotificationProvider } from "@/lib/SignalNotifications";

function AppRoutes() {
  return <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/markets" element={<Markets />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/signals" element={<AISignals />} />
      <Route path="/mt5-trader" element={<MT5Trader />} />
      <Route path="/gold-reaper" element={<GoldReaper />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/news" element={<NewsEvents />} />
      <Route path="/risk" element={<WorldRisk />} />
      <Route path="/calendar" element={<EconomicCalendar />} />
      <Route path="/backtest" element={<Backtest />} />
      <Route path="/history" element={<SignalHistory />} />
      <Route path="/models" element={<ModelIntelligence />} />
      <Route path="/system" element={<SystemPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/my-bots" element={<MyBots />} />
      <Route path="/brokers" element={<BrokerAccounts />} />
      <Route path="/billing" element={<PlansBilling />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>;
}

export default function App() {
  return <QueryClientProvider client={queryClientInstance}>
    <SignalNotificationProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
      <Toaster />
    </SignalNotificationProvider>
  </QueryClientProvider>;
}
