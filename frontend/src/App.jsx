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
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0F172A] rounded-full animate-spin" />
      <span className="text-sm text-[#475569] font-mono tracking-wider">
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
    <div className="min-h-screen bg-[#F6F8FA] text-[#0F172A] flex flex-col font-sans selection:bg-slate-200 selection:text-[#0F172A]">
      {/* Top Application Bar */}
      <Navbar
        health={health}
        isChecking={isCheckingHealth}
        activeTab={activeTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col md:flex-row md:items-start">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Primary Workspace Scroll Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
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
                  color="blue"
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
              <div className="p-4 rounded-lg bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider font-mono">
                      Protected Indian Banking Registry
                    </h4>
                    <p className="text-sm text-[#475569]">
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
      <footer className="bg-white border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B]">
        <p className="font-mono text-xs">
          PhishShield — Brand-Aware, Explainable Phishing Protection for Indian Banking Customers.
        </p>
      </footer>
    </div>
  );
}
