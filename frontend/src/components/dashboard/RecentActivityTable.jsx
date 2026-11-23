import React from 'react';
import {
  History,
  ArrowRight,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function RecentActivityTable({
  scans = [],
  isLoading = false,
  onViewAllHistory,
  onSelectUrlForScan
}) {
  const displayScans = scans.slice(0, 6);

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const renderVerdictBadge = (item) => {
    const level = (item.risk_level || '').toUpperCase();
    if (level === 'CRITICAL' || level === 'PHISHING' || item.is_phishing) {
      return (
        <span className="cyber-badge cyber-badge-danger">
          <XCircle className="w-3 h-3 text-rose-400" /> Phishing
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
          <AlertOctagon className="w-2.5 h-2.5" /> High Risk
        </span>
      );
    }
    if (level === 'SUSPICIOUS' || level === 'MEDIUM') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> Suspicious
        </span>
      );
    }
    if (level === 'INSUFFICIENT_EVIDENCE') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
          <HelpCircle className="w-2.5 h-2.5 text-cyan-400" /> Unconfirmed
        </span>
      );
    }
    return (
      <span className="cyber-badge cyber-badge-safe">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Safe
      </span>
    );
  };

  const renderRiskScore = (item) => {
    const level = (item.risk_level || '').toUpperCase();
    if (item.risk_score === null || item.risk_score === undefined || level === 'INSUFFICIENT_EVIDENCE') {
      return <span className="text-slate-500 font-mono text-[11px]">N/A</span>;
    }
    const val = typeof item.risk_score === 'number' ? item.risk_score.toFixed(1) : item.risk_score;
    return (
      <span
        className={
          item.risk_score >= 70
            ? 'text-rose-400 font-bold'
            : item.risk_score >= 30
            ? 'text-amber-400 font-semibold'
            : 'text-emerald-400'
        }
      >
        {val}%
      </span>
    );
  };

  return (
    <div className="p-6 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Live Audit Stream
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Recent Scans & Security Verdicts
          </h3>
          <p className="text-xs text-slate-400">
            Real-time feed of recently submitted URLs, SMS lures, and screenshots evaluated by PhishShield engines.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={onViewAllHistory}
            className="cyber-btn-secondary text-xs self-start sm:self-auto group"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs font-mono text-slate-500">
          Loading live telemetry from SQLite...
        </div>
      ) : displayScans.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#1e293b]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131926] text-slate-400 font-mono uppercase text-[10px] border-b border-[#1e293b]">
              <tr>
                <th className="py-2.5 px-3.5">Time</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Target Input</th>
                <th className="py-2.5 px-3.5">Identified Brand</th>
                <th className="py-2.5 px-3.5">Risk Score</th>
                <th className="py-2.5 px-3.5 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {displayScans.map((item) => {
                const scanType = (item.scan_type || 'url').toLowerCase();

                return (
                  <tr key={item.id} className="hover:bg-[#131926]/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatTimestamp(item.created_at)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#131926] border border-[#1e293b] text-slate-400">
                        {scanType === 'sms' ? (
                          <>
                            <MessageSquare className="w-2.5 h-2.5 text-purple-400" />
                            <span>SMS</span>
                          </>
                        ) : scanType === 'screenshot' ? (
                          <>
                            <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                            <span>IMAGE</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-2.5 h-2.5 text-cyan-400" />
                            <span>URL</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-200 max-w-[280px] truncate" title={item.target_input}>
                      {item.target_input}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {item.target_brand ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                          {item.target_brand}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono">
                      {renderRiskScore(item)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      {renderVerdictBadge(item)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 px-4 rounded-lg bg-[#07090e] border border-[#1e293b] text-center space-y-2">
          <p className="text-xs font-mono text-slate-400">No scan activity recorded yet.</p>
          <p className="text-[11px] text-slate-500">Run a URL, SMS, or screenshot scan to populate live audit history.</p>
        </div>
      )}
    </div>
  );
}
