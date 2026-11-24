import React from 'react';
import {
  Shield,
  Activity,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

const TAB_KEY_MAP = {
  dashboard: 'nav.overview',
  url_scan: 'nav.urlScanner',
  sms_scan: 'nav.smsScanner',
  history: 'nav.scanHistory',
  brand_registry: 'nav.bankIntel',
  model_insights: 'nav.modelInsights',
  diagnostics: 'nav.systemDiagnostics',
  screenshot: 'nav.screenshotScanner',
  governance: 'nav.governance',
  architecture: 'nav.architecture',
};

export default function Navbar({
  health,
  isChecking,
  activeTab = 'dashboard',
  isSidebarOpen,
  onToggleSidebar
}) {
  const { t } = useTranslation();
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
            <div className="w-7 h-7 rounded-md bg-[#1D4ED8] flex items-center justify-center text-white shrink-0">
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
            <span className="text-[#64748B] font-mono">{t('nav.console', {}, 'Console')}</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-medium truncate max-w-[240px]">
              {t(TAB_KEY_MAP[activeTab] || 'nav.overview', {}, 'Overview')}
            </span>
          </div>
        </div>

        {/* Right Section: Language Selector + Real-time API Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Global User-Selectable Multilingual Switcher */}
          <LanguageSelector />

          {/* Backend Engine Status Pill */}
          {isChecking ? (
            <div className="flex items-center space-x-1.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-mono text-xs px-2.5 py-1 rounded-md">
              <RefreshCw className="w-3.5 h-3.5 text-[#D97706] animate-spin" />
              <span>{t('nav.engineChecking', {}, 'Engine: Checking')}</span>
            </div>
          ) : isHealthy ? (
            <div className="flex items-center space-x-1.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-xs px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>{t('nav.engineOnline', {}, 'Engine: Online')}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-mono text-xs px-2.5 py-1 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>{t('nav.engineDegraded', {}, 'Engine: Degraded')}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
