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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] px-4 lg:px-6 py-2.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle + Brand + Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="md:hidden p-1.5 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Clean Enterprise Brand Mark */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#0F172A] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-heading font-bold tracking-tight text-[#0F172A]">
                PhishShield
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                v0.2
              </span>
            </div>
          </div>

          {/* Breadcrumb Context (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-[#E2E8F0] text-xs">
            <span className="text-[#64748B] font-mono">Console</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-medium truncate max-w-[240px]">
              {TAB_TITLES[activeTab] || 'Overview'}
            </span>
          </div>
        </div>

        {/* Right Section: Real-time API Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Backend Engine Status Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <Activity className="w-3.5 h-3.5 text-[#64748B] hidden sm:inline-block" />
            <span className="text-[#64748B] font-mono text-xs hidden sm:inline-block">Engine:</span>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isChecking
                    ? 'bg-[#D97706] animate-pulse'
                    : isHealthy
                      ? 'bg-[#059669]'
                      : 'bg-[#DC2626]'
                  }`}
              />
              <span className="font-mono text-xs font-medium text-[#475569]">
                {isChecking ? 'Checking' : isHealthy ? 'Online' : 'Degraded'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
