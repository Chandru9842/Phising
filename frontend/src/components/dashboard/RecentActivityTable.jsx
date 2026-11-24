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
  AlertOctagon
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
          <XCircle className="w-3 h-3 text-[#F87171]" /> Phishing
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-[#FBBF24] border border-amber-500/20 uppercase">
          <AlertOctagon className="w-2.5 h-2.5" /> High Risk
        </span>
      );
    }
    if (level === 'SUSPICIOUS' || level === 'MEDIUM') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertTriangle className="w-3 h-3 text-[#FBBF24]" /> Suspicious
        </span>
      );
    }
    if (level === 'INSUFFICIENT_EVIDENCE') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#0E121A] text-[#9CA3AF] border border-[#1E2430] uppercase">
          <HelpCircle className="w-2.5 h-2.5 text-[#2563EB]" /> Unconfirmed
        </span>
      );
    }
    return (
      <span className="cyber-badge cyber-badge-safe">
        <CheckCircle2 className="w-3 h-3 text-[#34D399]" /> Safe
      </span>
    );
  };

  const renderRiskScore = (item) => {
    const level = (item.risk_level || '').toUpperCase();
    if (item.risk_score === null || item.risk_score === undefined || level === 'INSUFFICIENT_EVIDENCE') {
      return <span className="text-[#6B7280] font-mono text-[11px]">N/A</span>;
    }
    const val = typeof item.risk_score === 'number' ? item.risk_score.toFixed(1) : item.risk_score;
    return (
      <span
        className={
          item.risk_score >= 70
            ? 'text-[#F87171] font-semibold'
            : item.risk_score >= 30
            ? 'text-[#FBBF24] font-medium'
            : 'text-[#34D399]'
        }
      >
        {val}%
      </span>
    );
  };

  return (
    <div className="p-5 rounded-md bg-[#12161F] border border-[#1E2430] space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[#9CA3AF] mb-1">
            <History className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#9CA3AF]">
              Audit Stream
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#F3F4F6] tracking-tight">
            Recent Scans & Security Verdicts
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Real-time feed of recently submitted URLs, SMS lures, and screenshots evaluated by PhishShield engines.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={onViewAllHistory}
            className="cyber-btn-secondary text-xs self-start sm:self-auto"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs font-mono text-[#6B7280]">
          Loading telemetry from audit store...
        </div>
      ) : displayScans.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-[#1E2430]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0E121A] text-[#9CA3AF] font-mono uppercase text-[10px] border-b border-[#1E2430]">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Target Input</th>
                <th className="py-2.5 px-3">Identified Brand</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2430] text-[#9CA3AF]">
              {displayScans.map((item) => {
                const scanType = (item.scan_type || 'url').toLowerCase();

                return (
                  <tr key={item.id} className="hover:bg-[#171C28] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                      {formatTimestamp(item.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0E121A] border border-[#1E2430] text-[#9CA3AF]">
                        {scanType === 'sms' ? (
                          <>
                            <MessageSquare className="w-2.5 h-2.5 text-[#9CA3AF]" />
                            <span>SMS</span>
                          </>
                        ) : scanType === 'screenshot' ? (
                          <>
                            <ImageIcon className="w-2.5 h-2.5 text-[#9CA3AF]" />
                            <span>IMAGE</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-2.5 h-2.5 text-[#9CA3AF]" />
                            <span>URL</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#F3F4F6] max-w-[280px] truncate" title={item.target_input}>
                      {item.target_input}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.target_brand ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#0E121A] text-[#9CA3AF] border border-[#1E2430]">
                          {item.target_brand}
                        </span>
                      ) : (
                        <span className="text-[#6B7280] font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {renderRiskScore(item)}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {renderVerdictBadge(item)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-6 px-4 rounded-md bg-[#0E121A] border border-[#1E2430] text-center space-y-1">
          <p className="text-xs font-mono text-[#9CA3AF]">No scan activity recorded yet.</p>
          <p className="text-[11px] text-[#6B7280]">Submit a URL, SMS lure, or screenshot to populate live audit history.</p>
        </div>
      )}
    </div>
  );
}
