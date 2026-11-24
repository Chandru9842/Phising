import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  color = 'charcoal',
  trend
}) {
  const colorStyles = {
    charcoal: {
      value: 'text-[#0F172A]',
    },
    blue: {
      value: 'text-[#0F172A]',
    },
    cyan: {
      value: 'text-[#0F172A]',
    },
    emerald: {
      value: 'text-[#065F46]',
    },
    rose: {
      value: 'text-[#991B1B]',
    },
    amber: {
      value: 'text-[#92400E]',
    },
    indigo: {
      value: 'text-[#0F172A]',
    },
  };

  const style = colorStyles[color] || colorStyles.charcoal;

  return (
    <div className="p-5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] transition-all duration-150">
      <div className="min-w-0">
        <p className="text-xs font-mono font-medium uppercase tracking-wider text-[#64748B] mb-1.5 truncate">
          {title}
        </p>
        <p className={`text-3xl font-bold font-mono tracking-tight ${style.value}`}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1.5 truncate">
            {trend && (
              <span className="font-mono text-xs font-semibold text-[#065F46] shrink-0">
                {trend}
              </span>
            )}
            <span className="truncate">{subtext}</span>
          </p>
        )}
      </div>
    </div>
  );
}
