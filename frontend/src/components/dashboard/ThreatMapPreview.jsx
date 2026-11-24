import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ShieldAlert, Database } from 'lucide-react';

export default function ThreatMapPreview({ history = [], stats = null }) {
  // Compute genuine threat vector distribution from actual database records
  const threatData = React.useMemo(() => {
    if (!history || history.length === 0) {
      if (stats && stats.total_scans > 0) {
        const fallback = [];
        if (stats.phishing_detected > 0) {
          fallback.push({ name: 'Phishing Threats', count: stats.phishing_detected, fill: '#F87171' });
        }
        if (stats.brand_impersonations > 0) {
          fallback.push({ name: 'Brand Spoofing', count: stats.brand_impersonations, fill: '#EF4444' });
        }
        if (stats.safe_scans > 0) {
          fallback.push({ name: 'Safe Verified', count: stats.safe_scans, fill: '#34D399' });
        }
        return fallback;
      }
      return [];
    }

    let impersonationCount = 0;
    let smishingCount = 0;
    let urlPhishingCount = 0;
    let screenshotPhishCount = 0;
    let suspiciousCount = 0;
    let unconfirmedCount = 0;
    let safeCount = 0;

    history.forEach((item) => {
      const type = (item.scan_type || 'url').toLowerCase();
      const level = (item.risk_level || '').toUpperCase();

      if (item.is_brand_impersonation) {
        impersonationCount++;
      } else if (type === 'sms' && item.is_phishing) {
        smishingCount++;
      } else if (type === 'screenshot' && (level === 'CRITICAL' || level === 'HIGH' || item.is_phishing)) {
        screenshotPhishCount++;
      } else if (level === 'CRITICAL' || level === 'HIGH' || item.is_phishing) {
        urlPhishingCount++;
      } else if (level === 'SUSPICIOUS' || level === 'MEDIUM') {
        suspiciousCount++;
      } else if (level === 'INSUFFICIENT_EVIDENCE') {
        unconfirmedCount++;
      } else {
        safeCount++;
      }
    });

    const breakdown = [];
    if (impersonationCount > 0) {
      breakdown.push({ name: 'Brand Spoofing', count: impersonationCount, fill: '#EF4444' });
    }
    if (screenshotPhishCount > 0) {
      breakdown.push({ name: 'Screenshot Threats', count: screenshotPhishCount, fill: '#F97316' });
    }
    if (smishingCount > 0) {
      breakdown.push({ name: 'SMS Smishing Lures', count: smishingCount, fill: '#8B5CF6' });
    }
    if (urlPhishingCount > 0) {
      breakdown.push({ name: 'Phishing URLs', count: urlPhishingCount, fill: '#F87171' });
    }
    if (suspiciousCount > 0) {
      breakdown.push({ name: 'Suspicious Anomalies', count: suspiciousCount, fill: '#FBBF24' });
    }
    if (unconfirmedCount > 0) {
      breakdown.push({ name: 'Unconfirmed', count: unconfirmedCount, fill: '#6B7280' });
    }
    if (safeCount > 0) {
      breakdown.push({ name: 'Safe Verified', count: safeCount, fill: '#34D399' });
    }

    return breakdown;
  }, [history, stats]);

  const totalCalculated = threatData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-4 rounded-md bg-[#12161F] border border-[#1E2430] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#F87171]" />
            <h3 className="text-xs font-mono font-semibold text-[#F3F4F6] uppercase tracking-wider">
              Attack Vector Distribution
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E121A] text-[#9CA3AF] border border-[#1E2430]">
            {totalCalculated > 0 ? `${totalCalculated} Analyzed` : 'Telemetry Store'}
          </span>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-3">
          Empirical distribution of verified threat vectors from persistent SQLite scan logs.
        </p>

        {/* Dynamic Threat Chart or Empty State */}
        {threatData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={threatData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 5, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9CA3AF"
                  fontSize={11}
                  width={125}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = totalCalculated > 0 ? ((data.count / totalCalculated) * 100).toFixed(1) : 0;
                      return (
                        <div className="p-2.5 rounded-md bg-[#0D1017] border border-[#1E2430] text-xs font-mono space-y-1">
                          <p className="text-[#F3F4F6] font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
                            <span>{data.name}</span>
                          </p>
                          <p className="text-[#9CA3AF]">
                            Count: <span className="text-[#F3F4F6] font-semibold">{data.count}</span> ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center rounded-md bg-[#0E121A] border border-[#1E2430] p-4 text-center space-y-1.5">
            <Database className="w-5 h-5 text-[#6B7280]" />
            <p className="text-xs text-[#9CA3AF] font-mono">No historical threat distribution recorded yet.</p>
            <p className="text-[11px] text-[#6B7280]">Submit a scan to populate live forensic telemetry.</p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#1E2430] text-[11px] text-[#6B7280] font-mono flex items-center justify-between">
        <span>Source: SQLite Database</span>
        <span className="text-[#9CA3AF]">Zero Fabricated Data</span>
      </div>
    </div>
  );
}
