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
import { ShieldAlert, BarChart3, Database } from 'lucide-react';

export default function ThreatMapPreview({ history = [], stats = null }) {
  // Compute genuine threat vector distribution from actual database records
  const threatData = React.useMemo(() => {
    if (!history || history.length === 0) {
      if (stats && stats.total_scans > 0) {
        const fallback = [];
        if (stats.phishing_detected > 0) {
          fallback.push({ name: 'Phishing Threats', count: stats.phishing_detected, fill: '#ef4444' });
        }
        if (stats.brand_impersonations > 0) {
          fallback.push({ name: 'Brand Impersonation', count: stats.brand_impersonations, fill: '#f43f5e' });
        }
        if (stats.safe_scans > 0) {
          fallback.push({ name: 'Safe Verified', count: stats.safe_scans, fill: '#10b981' });
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
      breakdown.push({ name: 'Brand Spoofing', count: impersonationCount, fill: '#f43f5e' });
    }
    if (screenshotPhishCount > 0) {
      breakdown.push({ name: 'Screenshot Threats', count: screenshotPhishCount, fill: '#f97316' });
    }
    if (smishingCount > 0) {
      breakdown.push({ name: 'SMS Smishing Lures', count: smishingCount, fill: '#a855f7' });
    }
    if (urlPhishingCount > 0) {
      breakdown.push({ name: 'Phishing URLs', count: urlPhishingCount, fill: '#ef4444' });
    }
    if (suspiciousCount > 0) {
      breakdown.push({ name: 'Suspicious Anomalies', count: suspiciousCount, fill: '#f59e0b' });
    }
    if (unconfirmedCount > 0) {
      breakdown.push({ name: 'Unconfirmed / Low Typography', count: unconfirmedCount, fill: '#64748b' });
    }
    if (safeCount > 0) {
      breakdown.push({ name: 'Safe Legit Scans', count: safeCount, fill: '#10b981' });
    }

    return breakdown;
  }, [history, stats]);

  const totalCalculated = threatData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Attack Vector Distribution
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">
            {totalCalculated > 0 ? `${totalCalculated} Analyzed` : 'Live SQLite'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Empirical distribution of verified threat vectors from persistent SQLite scan logs.
        </p>

        {/* Dynamic Threat Chart or Empty State */}
        {threatData.length > 0 ? (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={threatData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={130}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = totalCalculated > 0 ? ((data.count / totalCalculated) * 100).toFixed(1) : 0;
                      return (
                        <div className="p-2.5 rounded-lg bg-[#07090e] border border-[#1e293b] shadow-xl text-xs font-mono space-y-1">
                          <p className="text-white font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }}></span>
                            <span>{data.name}</span>
                          </p>
                          <p className="text-slate-400">
                            Count: <span className="text-white font-bold">{data.count}</span> ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-52 flex flex-col items-center justify-center rounded-lg bg-[#07090e] border border-[#1e293b] p-4 text-center space-y-2">
            <Database className="w-6 h-6 text-slate-600" />
            <p className="text-xs text-slate-400 font-mono">No historical threat distribution recorded yet.</p>
            <p className="text-[11px] text-slate-500">Run a URL or SMS scan to populate live SQLite vectors.</p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#1e293b] text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Source: SQLite Database</span>
        <span className="text-cyan-400">Zero Fabricated Data</span>
      </div>
    </div>
  );
}
