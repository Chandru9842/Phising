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
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Chrome */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0E121A] border-r border-[#1E2430] flex flex-col justify-between py-4 px-3 shrink-0 min-h-[calc(100vh-57px)] transition-transform duration-150 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Section Header */}
          <div className="px-2">
            <p className="text-[10px] font-mono font-medium tracking-wider uppercase text-[#6B7280]">
              Navigation
            </p>
          </div>

          {/* Clean Linear-style Navigation Links */}
          <nav className="space-y-1" aria-label="Primary Console Navigation">
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-100 group text-left ${
                    isActive
                      ? 'bg-[#171C28] text-[#F3F4F6] border border-[#2B3445]'
                      : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#12161F] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#2563EB]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
                      }`}
                    />
                    <span className="truncate">
                      {item.label}
                    </span>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Callout: Zero-Trust Defense Notice */}
        <div className="p-3 rounded-md bg-[#12161F] border border-[#1E2430] space-y-1.5">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#F3F4F6]">
                Zero-Trust Active
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          </div>
          <p className="text-[11px] text-[#6B7280] leading-snug">
            Strict domain validation against 16 official Indian banking registries.
          </p>
        </div>
      </aside>
    </>
  );
}
