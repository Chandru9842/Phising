import React from 'react';
import { SkeletonTableRows } from '../common/SkeletonLoader';
import { useTranslation } from '../../i18n/LanguageContext';
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
  const { t, localizeVerdict } = useTranslation();
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
          <XCircle className="w-3.5 h-3.5 text-[#991B1B]" /> {localizeVerdict('CRITICAL')}
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertOctagon className="w-3.5 h-3.5 text-[#92400E]" /> {localizeVerdict('HIGH')}
        </span>
      );
    }
    if (level === 'SUSPICIOUS' || level === 'MEDIUM') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertTriangle className="w-3.5 h-3.5 text-[#92400E]" /> {localizeVerdict('SUSPICIOUS')}
        </span>
      );
    }
    if (level === 'INSUFFICIENT_EVIDENCE') {
      return (
        <span className="cyber-badge cyber-badge-neutral">
          <HelpCircle className="w-3.5 h-3.5 text-[#475569]" /> {localizeVerdict('UNKNOWN')}
        </span>
      );
    }
    return (
      <span className="cyber-badge cyber-badge-safe">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" /> {localizeVerdict('SAFE')}
      </span>
    );
  };

  const renderRiskScore = (item) => {
    const level = (item.risk_level || '').toUpperCase();
    if (item.risk_score === null || item.risk_score === undefined || level === 'INSUFFICIENT_EVIDENCE') {
      return <span className="text-[#64748B] font-mono text-xs">N/A</span>;
    }
    const val = typeof item.risk_score === 'number' ? item.risk_score.toFixed(1) : item.risk_score;
    return (
      <span
        className={
          item.risk_score >= 70
            ? 'text-[#991B1B] font-bold'
            : item.risk_score >= 30
              ? 'text-[#92400E] font-semibold'
              : 'text-[#065F46] font-semibold'
        }
      >
        {val}%
      </span>
    );
  };

  return (
    <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <History className="w-4 h-4 text-[#0F172A]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Audit Stream
            </span>
          </div>
          <h3 className="text-base font-heading font-bold text-[#0F172A] tracking-tight">
            {t('dashboard.recentScans', {}, 'Recent Scans & Security Verdicts')}
          </h3>
          <p className="text-[13.5px] text-[#475569]">
            Real-time feed of recently submitted URLs, SMS lures, and screenshots evaluated by PhishShield engines.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={onViewAllHistory}
            className="cyber-btn-secondary text-xs self-start sm:self-auto"
          >
            <span>{t('dashboard.viewAllHistory', {}, 'View All Logs')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="overflow-x-auto rounded-md border border-[#E2E8F0] p-2 bg-white">
          <SkeletonTableRows rows={4} />
        </div>
      ) : displayScans.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
          <table className="w-full text-left text-[13.5px] border-collapse">
            <thead className="bg-[#F8FAFC] text-[#475569] font-mono uppercase text-xs border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-3.5 font-medium">{t('common.timestamp', {}, 'Time')}</th>
                <th className="py-3 px-3.5 font-medium">{t('common.type', {}, 'Type')}</th>
                <th className="py-3 px-3.5 font-medium">{t('common.target', {}, 'Target Input')}</th>
                <th className="py-3 px-3.5 font-medium">{t('urlScan.targetBrand', {}, 'Identified Brand')}</th>
                <th className="py-3 px-3.5 font-medium">{t('urlScan.calibratedScore', {}, 'Risk Score')}</th>
                <th className="py-3 px-3.5 text-right font-medium">{t('common.status', {}, 'Verdict')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#475569]">
              {displayScans.map((item) => {
                const scanType = (item.scan_type || 'url').toLowerCase();

                return (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3.5 font-mono text-xs text-[#64748B] whitespace-nowrap">
                      {formatTimestamp(item.created_at)}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]">
                        {scanType === 'sms' ? (
                          <>
                            <MessageSquare className="w-3 h-3 text-[#475569]" />
                            <span>SMS</span>
                          </>
                        ) : scanType === 'screenshot' ? (
                          <>
                            <ImageIcon className="w-3 h-3 text-[#475569]" />
                            <span>IMAGE</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 text-[#475569]" />
                            <span>URL</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[13px] text-[#0F172A] font-medium max-w-[280px] truncate" title={item.target_input}>
                      {item.target_input}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {item.target_brand ? (
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                          {item.target_brand}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[13px]">
                      {renderRiskScore(item)}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {renderVerdictBadge(item)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-6 px-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-sm font-mono text-[#475569]">No scan activity recorded yet.</p>
          <p className="text-xs text-[#64748B]">Submit a URL, SMS lure, or screenshot to populate live audit history.</p>
        </div>
      )}
    </div>
  );
}
