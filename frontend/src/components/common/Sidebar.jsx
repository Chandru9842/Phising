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
  ChevronRight,
  ExternalLink,
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
      num: '01',
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      num: '02',
      id: 'url_scan',
      label: 'URL Scanner',
      icon: Globe,
      badge: 'RF Model',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      num: '03',
      id: 'sms_scan',
      label: 'SMS Scanner',
      icon: MessageSquare,
      badge: 'NLP + URL',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      num: '04',
      id: 'history',
      label: 'Scan History',
      icon: History,
      badge: 'Audit',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700'
    },
    {
      num: '05',
      id: 'brand_registry',
      label: 'Bank Threat Intel',
      icon: Building2,
      badge: '16 Banks',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      num: '06',
      id: 'model_insights',
      label: 'Model Insights',
      icon: Cpu,
      badge: 'SHAP',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      num: '07',
      id: 'diagnostics',
      label: 'System Diagnostics',
      icon: Activity,
      badge: null
    },
    {
      num: '08',
      id: 'screenshot',
      label: 'Screenshot Scanner',
      icon: Camera,
      badge: 'Threat Intel',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      num: '09',
      id: 'governance',
      label: 'Governance & RBAC',
      icon: Shield,
      badge: 'Admin',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0d111a] border-r border-[#1e293b] flex flex-col justify-between py-5 px-3.5 shrink-0 min-h-[calc(100vh-57px)] transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div>
          {/* Section Header */}
          <div className="px-2.5 mb-3">
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
              Navigation Index
            </p>
          </div>

          {/* Navigation Links (Inspo NavMarginal Pattern) */}
          <nav className="space-y-1" aria-label="Primary Console Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id ||
                (item.id === 'model_insights' && activeTab === 'architecture') ||
                (item.id === 'dashboard' && !activeTab);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group text-left ${isActive
                    ? 'bg-[#131926] text-white border-l-2 border-l-cyan-400 border-y border-r border-[#1e293b] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]/60 border border-transparent'
                    }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="font-mono text-[11px] text-slate-600 group-hover:text-slate-400 shrink-0">
                      {item.num}
                    </span>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                    />
                    <span className="truncate transition-transform duration-150 group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Callout: Zero-Trust Defense Card */}
        <div className="mt-6 p-3.5 rounded-lg bg-[#07090e] border border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Zero-Trust Active
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Strict domain validation against 16 official Indian banking registries. HTTPS alone is never trusted.
          </p>
        </div>
      </aside>
    </>
  );
}
