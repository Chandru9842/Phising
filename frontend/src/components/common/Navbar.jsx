import React from 'react';
import {
  Shield,
  Activity,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Database
} from 'lucide-react';

const TAB_TITLES = {
  dashboard: 'Overview',
  url_scan: 'URL Phishing Scanner',
  sms_scan: 'SMS Smishing Scanner',
  history: 'Scan History & Audit Logs',
  brand_registry: 'Threat Intelligence & Banking Registry',
  model_insights: 'Model Insights & Explainability',
  diagnostics: 'System & Engine Diagnostics',
  screenshot: 'Screenshot Threat Scanner',
  architecture: 'System Architecture',
};

export default function Navbar({
  health,
  isChecking,
  activeTab = 'dashboard',
  isSidebarOpen,
  onToggleSidebar
}) {
  const isHealthy = health?.status === 'healthy';
  const dbConnected = health?.services?.database === 'connected';

  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/95 backdrop-blur-md border-b border-[#1e293b] px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle + Brand + Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131926] border border-[#1e293b] transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Tricolor Indicator */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
                <Shield className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              {/* Subtle Indian Tricolor Dot Indicator */}
              <div
                title="Indian Banking Cybersecurity Guard"
                className="absolute -bottom-1 -right-1 flex space-x-0.5 bg-[#07090e] px-1 py-0.5 rounded-full border border-[#1e293b] shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f8fafc]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Phish<span className="text-cyan-400">Shield</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                v0.2.0
              </span>
            </div>
          </div>

          {/* Breadcrumb Context (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-[#1e293b] text-xs">
            <span className="text-slate-500 font-mono">Console</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300 font-medium truncate max-w-[240px]">
              {TAB_TITLES[activeTab] || 'Overview'}
            </span>
          </div>
        </div>

        {/* Right Section: Real-time API Status + Docs Link */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Real Backend API Status Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#0d111a] border border-[#1e293b] text-xs">
            <Activity className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline-block">API:</span>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isChecking
                    ? 'bg-amber-400 animate-pulse'
                    : isHealthy
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                      : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                  }`}
              ></span>
              <span
                className={`text-[11px] font-semibold font-mono ${isChecking
                    ? 'text-amber-400'
                    : isHealthy
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
              >
                {isChecking
                  ? 'Connecting...'
                  : isHealthy
                    ? 'Operational'
                    : 'Offline'}
              </span>
            </div>
            {isHealthy && dbConnected && (
              <span className="hidden md:inline-flex items-center text-[10px] text-slate-500 pl-1.5 border-l border-[#1e293b]">
                <Database className="w-2.5 h-2.5 mr-1 text-cyan-400/80" /> SQLite
              </span>
            )}
          </div>

          {/* Official Swagger API Docs Link */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors px-2.5 py-1.5 rounded-lg bg-[#0d111a] hover:bg-[#131926] border border-[#1e293b] hover:border-slate-700"
            title="FastAPI Interactive Documentation"
          >
            <span className="font-mono text-[11px]">Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
