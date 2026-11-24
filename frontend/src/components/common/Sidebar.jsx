import React from 'react';
import {
  LayoutDashboard,
  Globe,
  MessageSquare,
  History,
  Building2,
  Cpu,
  Activity,
  ShieldCheck,
  Camera,
  Shield,
  Lock
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onCloseMobile
}) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'dashboard',
      label: t('nav.overview', {}, 'Overview'),
      icon: LayoutDashboard,
    },
    {
      id: 'url_scan',
      label: t('nav.urlScanner', {}, 'URL Scanner'),
      icon: Globe,
    },
    {
      id: 'sms_scan',
      label: t('nav.smsScanner', {}, 'SMS Scanner'),
      icon: MessageSquare,
    },
    {
      id: 'screenshot',
      label: t('nav.screenshotScanner', {}, 'Screenshot Threat Scanner'),
      icon: Camera,
    },
    {
      id: 'history',
      label: t('nav.scanHistory', {}, 'Scan History'),
      icon: History,
    },
    {
      id: 'brand_registry',
      label: t('nav.bankIntel', {}, 'Bank Threat Intel'),
      icon: Building2,
    },
    {
      id: 'model_insights',
      label: t('nav.modelInsights', {}, 'Model Insights & SHAP'),
      icon: Cpu,
    },
    {
      id: 'diagnostics',
      label: t('nav.systemDiagnostics', {}, 'System Diagnostics'),
      icon: Activity,
    },
    {
      id: 'governance',
      label: t('nav.governance', {}, 'Governance & RBAC'),
      icon: Shield,
    },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Chrome - Stripe & Cloudflare Style */}
      <aside
        className={`fixed md:sticky top-0 h-screen inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between py-5 px-3 shrink-0 overflow-y-auto transition-transform duration-150 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="space-y-4">
          {/* Section Header */}
          <div className="px-3">
            <p className="text-xs font-mono font-semibold tracking-wider uppercase text-[#64748B]">
              {t('common.filter', {}, 'Navigation')}
            </p>
          </div>

          {/* Clean Enterprise Navigation Links */}
          <nav className="space-y-0.5" aria-label="Primary Console Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'model_insights' && activeTab === 'architecture') ||
                (item.id === 'dashboard' && !activeTab);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors duration-100 group text-left ${isActive
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold border-l-2 border-[#1D4ED8] rounded-l-none'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#1D4ED8]' : 'text-[#64748B] group-hover:text-[#0F172A]'
                        }`}
                    />
                    <span className="truncate">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Callout: Zero-Trust Defense Notice */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#065F46]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0F172A]">
                {t('nav.zeroTrustActive', {}, 'Zero-Trust Active')}
              </span>
            </div>
            <Lock className="w-3.5 h-3.5 text-[#065F46]" />
          </div>
          <p className="text-xs text-[#475569] leading-snug">
            {t('nav.zeroTrustDesc', {}, 'Strict domain validation against 16 official Indian banking registries.')}
          </p>
        </div>
      </aside>
    </>
  );
}
