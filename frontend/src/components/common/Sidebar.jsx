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
  Shield
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onCloseMobile
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'url_scan',
      label: 'URL Scanner',
      icon: Globe,
    },
    {
      id: 'sms_scan',
      label: 'SMS Scanner',
      icon: MessageSquare,
    },
    {
      id: 'screenshot',
      label: 'Screenshot Threat Scanner',
      icon: Camera,
    },
    {
      id: 'history',
      label: 'Scan History',
      icon: History,
    },
    {
      id: 'brand_registry',
      label: 'Bank Threat Intel',
      icon: Building2,
    },
    {
      id: 'model_insights',
      label: 'Model Insights & SHAP',
      icon: Cpu,
    },
    {
      id: 'diagnostics',
      label: 'System Diagnostics',
      icon: Activity,
    },
    {
      id: 'governance',
      label: 'Governance & RBAC',
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
        className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between py-5 px-3 shrink-0 overflow-y-auto transition-transform duration-150 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="space-y-4">
          {/* Section Header */}
          <div className="px-3">
            <p className="text-xs font-mono font-semibold tracking-wider uppercase text-[#64748B]">
              Navigation
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

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] shrink-0" />
                  )}
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
                Zero-Trust Active
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
          </div>
          <p className="text-xs text-[#475569] leading-snug">
            Strict domain validation against 16 official Indian banking registries.
          </p>
        </div>
      </aside>
    </>
  );
}
