import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'blue',
  trend
}) {
  const colorStyles = {
    blue: {
      value: 'text-[#F3F4F6]',
      icon: 'text-[#2563EB]',
    },
    cyan: {
      value: 'text-[#F3F4F6]',
      icon: 'text-[#2563EB]',
    },
    emerald: {
      value: 'text-[#34D399]',
      icon: 'text-[#34D399]',
    },
    rose: {
      value: 'text-[#F87171]',
      icon: 'text-[#F87171]',
    },
    amber: {
      value: 'text-[#FBBF24]',
      icon: 'text-[#FBBF24]',
    },
    indigo: {
      value: 'text-[#F3F4F6]',
      icon: 'text-[#2563EB]',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className="p-4 rounded-md bg-[#12161F] border border-[#1E2430] hover:border-[#2B3445] transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] mb-1 truncate">
            {title}
          </p>
          <p className={`text-2xl font-semibold font-mono tracking-tight ${style.value}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1.5 truncate">
              {trend && (
                <span className="font-mono text-[11px] font-semibold text-[#34D399] shrink-0">
                  {trend}
                </span>
              )}
              <span className="truncate">{subtext}</span>
            </p>
          )}
        </div>

        {Icon && (
          <div className="p-2 rounded-md bg-[#0E121A] border border-[#1E2430] shrink-0">
            <Icon className={`w-4 h-4 ${style.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}
