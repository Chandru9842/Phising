import React from 'react';
import {
  Shield,
  Activity,
  Menu,
  X,
  ChevronRight,
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
  governance: 'Governance & RBAC',
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

  return (
    <header className="sticky top-0 z-50 bg-[#0E121A] border-b border-[#1E2430] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle + Brand + Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-1.5 rounded-md text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171C28] border border-[#1E2430] transition-colors"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Clean Institutional Brand Mark */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-[#F3F4F6]">
                PhishShield
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#12161F] text-[#9CA3AF] border border-[#1E2430]">
                Enterprise
              </span>
            </div>
          </div>

          {/* Breadcrumb Context (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-[#1E2430] text-xs">
            <span className="text-[#6B7280] font-mono">Console</span>
            <ChevronRight className="w-3 h-3 text-[#6B7280]" />
            <span className="text-[#9CA3AF] font-medium truncate max-w-[240px]">
              {TAB_TITLES[activeTab] || 'Overview'}
            </span>
          </div>
        </div>

        {/* Right Section: Real-time API Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Backend Engine Status Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#12161F] border border-[#1E2430] text-xs">
            <Activity className="w-3.5 h-3.5 text-[#6B7280] hidden sm:inline-block" />
            <span className="text-[#6B7280] font-mono text-[11px] hidden sm:inline-block">Engine:</span>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isChecking
                    ? 'bg-[#FBBF24] animate-pulse'
                    : isHealthy
                    ? 'bg-[#34D399]'
                    : 'bg-[#F87171]'
                }`}
              />
              <span className="font-mono text-[11px] text-[#9CA3AF]">
                {isChecking ? 'Checking' : isHealthy ? 'Online' : 'Degraded'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
