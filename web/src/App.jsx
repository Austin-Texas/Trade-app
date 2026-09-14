import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
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
import { SignalNotificationProvider } from "@/lib/SignalNotifications";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
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
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SignalNotificationProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </SignalNotificationProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App