import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'cyan',
  trend
}) {
  const colorStyles = {
    cyan: {
      border: 'border-[#1e293b] hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      value: 'text-white',
      accentGlow: 'from-cyan-500/20',
    },
    emerald: {
      border: 'border-[#1e293b] hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      value: 'text-emerald-400',
      accentGlow: 'from-emerald-500/20',
    },
    rose: {
      border: 'border-[#1e293b] hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      value: 'text-rose-400',
      accentGlow: 'from-rose-500/20',
    },
    amber: {
      border: 'border-[#1e293b] hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      value: 'text-amber-400',
      accentGlow: 'from-amber-500/20',
    },
    indigo: {
      border: 'border-[#1e293b] hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      value: 'text-indigo-300',
      accentGlow: 'from-indigo-500/20',
    },
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div
      className={`p-4 rounded-xl bg-[#0d111a] border ${style.border} transition-all duration-200 shadow-sm relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1 truncate">
            {title}
          </p>
          <p className={`text-2xl font-bold font-mono tracking-tight ${style.value}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
              {trend && (
                <span className="font-mono text-[11px] font-semibold text-emerald-400 shrink-0">
                  {trend}
                </span>
              )}
              <span className="truncate">{subtext}</span>
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 1px subtle top hairline highlight */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${style.accentGlow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}
