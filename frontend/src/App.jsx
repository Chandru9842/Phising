import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import MetricCard from './components/common/MetricCard';
import SystemStatus from './components/dashboard/SystemStatus';
import QuickScanCard from './components/dashboard/QuickScanCard';
import ThreatMapPreview from './components/dashboard/ThreatMapPreview';
import RecentActivityTable from './components/dashboard/RecentActivityTable';
import ArchitectureOverview from './components/dashboard/ArchitectureOverview';

// Lazy-loaded views for optimal code-splitting and bundle performance
const UrlScanner = React.lazy(() => import('./components/scan/UrlScanner'));
const SmsScanner = React.lazy(() => import('./components/scan/SmsScanner'));
const ScanHistoryView = React.lazy(() => import('./components/history/ScanHistoryView'));
const RegisteredBanksList = React.lazy(() => import('./components/dashboard/RegisteredBanksList'));
const ModelInsightsView = React.lazy(() => import('./components/insights/ModelInsightsView'));
const SystemDiagnosticsView = React.lazy(() => import('./components/diagnostics/SystemDiagnosticsView'));
const ScreenshotUploader = React.lazy(() => import('./components/screenshot/ScreenshotUploader'));
const AdminGovernanceView = React.lazy(() => import('./components/admin/AdminGovernanceView'));

function TabLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 bg-[#0d111a]/40 rounded-xl border border-[#1e293b]/60 p-8">
      <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-mono tracking-wider">
        Loading cybersecurity module...
      </span>
    </div>
  );
}

import { apiService } from './services/api';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Activity,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Cpu,
  History as HistoryIcon,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Database,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [banksData, setBanksData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    total_scans: 0,
    phishing_detected: 0,
    brand_impersonations: 0,
    safe_scans: 0,
    protection_status: 'Active',
  });
  const [selectedScanUrl, setSelectedScanUrl] = useState(null);
  const [selectedScanSms, setSelectedScanSms] = useState(null);

  const fetchHealthAndData = async () => {
    setIsCheckingHealth(true);
    try {
      const [healthRes, banksRes, statsRes] = await Promise.all([
        apiService.getHealth(),
        apiService.getRegisteredBanks(),
        apiService.getStats(),
      ]);
      setHealth(healthRes);
      if (banksRes && banksRes.banks) {
        setBanksData(banksRes.banks);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const records = await apiService.getHistory(100);
      setHistoryData(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHealthAndData();
    fetchHistory();
    const interval = setInterval(fetchHealthAndData, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleQuickScan = (url) => {
    setSelectedScanUrl(url);
    setActiveTab('url_scan');
  };

  const handleQuickScanSms = (smsText) => {
    setSelectedScanSms(smsText);
    setActiveTab('sms_scan');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Application Bar */}
      <Navbar
        health={health}
        isChecking={isCheckingHealth}
        activeTab={activeTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Primary Workspace Scroll Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Top Banner: Indian Banking Cyber Defense Context */}
          <div className="p-4 rounded-xl bg-[#0d111a] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-3 min-w-0">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white flex flex-wrap items-center gap-2">
                  <span>PhishShield Protection Engine</span>
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    Indian Banking Zero-Trust
                  </span>
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  Real-time detection of fraudulent URLs, smishing lures & lookalike domains spoofing SBI, HDFC, ICICI, Axis & Indian payment portals.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
              <span className="text-xs text-slate-500 font-mono">
                API: <span className="text-cyan-400">http://localhost:8000</span>
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Telemetry Metric Cards (Real Database Numbers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Scans"
                  value={stats?.total_scans !== undefined ? stats.total_scans : '—'}
                  subtext="Persistent SQLite audit logs"
                  icon={Activity}
                  color="cyan"
                />
                <MetricCard
                  title="Phishing Detected"
                  value={stats?.phishing_detected !== undefined ? stats.phishing_detected : '—'}
                  subtext={
                    stats?.total_scans > 0
                      ? `${((stats.phishing_detected / stats.total_scans) * 100).toFixed(1)}% detection rate`
                      : 'ML + Zero-Trust flagged'
                  }
                  icon={ShieldAlert}
                  color="rose"
                />
                <MetricCard
                  title="Brand Impersonations"
                  value={stats?.brand_impersonations !== undefined ? stats.brand_impersonations : '—'}
                  subtext="Targeting Indian banks"
                  icon={AlertTriangle}
                  color="amber"
                />
                <MetricCard
                  title="Safe Verified"
                  value={stats?.safe_scans !== undefined ? stats.safe_scans : '—'}
                  subtext="Canonical banking whitelist"
                  icon={ShieldCheck}
                  color="emerald"
                />
              </div>

              {/* Quick Scan Input Terminal */}
              <QuickScanCard onNavigateToScanner={handleQuickScan} />

              {/* System Diagnostics & Real Threat Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemStatus
                  health={health}
                  isChecking={isCheckingHealth}
                  onRefresh={fetchHealthAndData}
                />
                <ThreatMapPreview history={historyData} stats={stats} />
              </div>

              {/* Live Recent Activity Table */}
              <RecentActivityTable
                scans={historyData}
                isLoading={isLoadingHistory}
                onViewAllHistory={() => setActiveTab('history')}
                onSelectUrlForScan={handleQuickScan}
              />

              {/* Compact Protected Banks Summary Banner */}
              <div className="p-4 rounded-xl bg-[#0d111a] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Protected Indian Banking Registry
                    </h4>
                    <p className="text-xs text-slate-400">
                      {banksData.length > 0
                        ? `${banksData.length} canonical institutions actively guarded against typosquatting & impersonation.`
                        : 'Loading canonical whitelist...'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('brand_registry')}
                  className="cyber-btn-secondary text-xs self-start sm:self-auto shrink-0"
                >
                  <span>Explore All {banksData.length || 25} Banks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Lazy-Loaded Tab Views */}
          <React.Suspense fallback={<TabLoadingFallback />}>
            {/* TAB 2: URL PHISHING SCANNER */}
            {activeTab === 'url_scan' && (
              <UrlScanner
                initialUrl={selectedScanUrl}
                onScanComplete={() => {
                  fetchHealthAndData();
                  fetchHistory();
                }}
              />
            )}

            {/* TAB 3: SMS SMISHING SCANNER */}
            {activeTab === 'sms_scan' && (
              <SmsScanner
                initialMessage={selectedScanSms}
                onScanComplete={() => {
                  fetchHealthAndData();
                  fetchHistory();
                }}
              />
            )}

            {/* TAB 4: SCAN AUDIT & HISTORY LOGS */}
            {activeTab === 'history' && (
              <ScanHistoryView
                history={historyData}
                isLoading={isLoadingHistory}
                onRefresh={fetchHistory}
                onSelectUrlForScan={handleQuickScan}
                onSelectSmsForScan={handleQuickScanSms}
                onSelectScreenshotForScan={() => setActiveTab('screenshot')}
              />
            )}

            {/* TAB 5: BANK THREAT INTEL / REGISTRY */}
            {activeTab === 'brand_registry' && (
              <RegisteredBanksList banks={banksData} />
            )}

            {/* TAB 6: MODEL INSIGHTS & EXPLAINABILITY */}
            {(activeTab === 'model_insights' || activeTab === 'architecture') && (
              <ModelInsightsView />
            )}

            {/* TAB 7: SYSTEM DIAGNOSTICS */}
            {activeTab === 'diagnostics' && (
              <SystemDiagnosticsView
                health={health}
                isChecking={isCheckingHealth}
                onRefresh={fetchHealthAndData}
                stats={stats}
              />
            )}

            {/* TAB 8: SCREENSHOT THREAT SCANNER (PHASE 5E / 6A) */}
            {activeTab === 'screenshot' && (
              <ScreenshotUploader
                onScanComplete={() => {
                  fetchHealthAndData();
                  fetchHistory();
                }}
              />
            )}

            {/* TAB 9: ENTERPRISE GOVERNANCE & ADMIN (PHASE 6C) */}
            {activeTab === 'governance' && (
              <AdminGovernanceView />
            )}
          </React.Suspense>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#07090e] border-t border-[#1e293b] px-6 py-4 text-center text-xs text-slate-500">
        <p className="font-mono text-[11px]">
          PhishShield — Brand-Aware, Explainable Phishing Protection for Indian Banking Customers.
        </p>
      </footer>
    </div>
  );
}
