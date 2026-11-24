import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  SlidersHorizontal,
  Landmark,
  Clock,
  RotateCcw,
  HelpCircle,
  Cpu
} from 'lucide-react';

export default function ScanHistoryView({
  history = [],
  isLoading = false,
  onRefresh,
  onSelectUrlForScan,
  onSelectSmsForScan,
  onSelectScreenshotForScan
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL' | 'url' | 'sms' | 'screenshot'
  const [selectedVerdict, setSelectedVerdict] = useState('ALL'); // 'ALL' | 'PHISHING' | 'SUSPICIOUS' | 'SAFE' | 'INSUFFICIENT_EVIDENCE'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest_risk' | 'lowest_risk'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected record for details drawer
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [copiedTarget, setCopiedTarget] = useState(false);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return history.filter((item) => {
      // Type filter
      if (selectedType !== 'ALL') {
        const type = (item.scan_type || 'url').toLowerCase();
        if (type !== selectedType.toLowerCase()) return false;
      }

      // Verdict filter
      if (selectedVerdict !== 'ALL') {
        const level = (item.risk_level || '').toUpperCase();
        if (selectedVerdict === 'PHISHING') {
          if (level !== 'CRITICAL' && level !== 'HIGH' && level !== 'PHISHING' && !item.is_phishing) return false;
        } else if (selectedVerdict === 'SUSPICIOUS') {
          if (level !== 'SUSPICIOUS' && level !== 'MEDIUM') return false;
        } else if (selectedVerdict === 'SAFE') {
          if ((level !== 'SAFE' && level !== 'LOW') || item.is_phishing) return false;
        } else if (selectedVerdict === 'INSUFFICIENT_EVIDENCE') {
          if (level !== 'INSUFFICIENT_EVIDENCE') return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTarget = (item.target_input || '').toLowerCase().includes(query);
        const matchesBrand = (item.target_brand || '').toLowerCase().includes(query);
        const matchesType = (item.scan_type || '').toLowerCase().includes(query);
        if (!matchesTarget && !matchesBrand && !matchesType) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'highest_risk') {
        return (b.risk_score || 0) - (a.risk_score || 0);
      }
      if (sortBy === 'lowest_risk') {
        return (a.risk_score || 0) - (b.risk_score || 0);
      }
      return 0;
    });
  }, [history, searchQuery, selectedType, selectedVerdict, sortBy]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Reset to page 1 on filter change
  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleVerdictChange = (verdict) => {
    setSelectedVerdict(verdict);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedVerdict('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleCopy = (text) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Distinct risk badges ensuring INSUFFICIENT_EVIDENCE is never rendered as SAFE
  const getRiskBadge = (item) => {
    const level = (item.risk_level || '').toUpperCase();
    if (level === 'CRITICAL' || level === 'PHISHING' || item.is_phishing) {
      return (
        <span className="cyber-badge cyber-badge-danger">
          <ShieldAlert className="w-3 h-3 text-[#991B1B]" />
          <span>PHISHING</span>
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
          <AlertOctagon className="w-3 h-3 text-orange-400" />
          <span>HIGH THREAT</span>
        </span>
      );
    }
    if (level === 'SUSPICIOUS' || level === 'MEDIUM') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertTriangle className="w-3 h-3 text-[#92400E]" />
          <span>SUSPICIOUS</span>
        </span>
      );
    }
    if (level === 'INSUFFICIENT_EVIDENCE') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-[#334155] border border-slate-700 uppercase">
          <HelpCircle className="w-3 h-3 text-[#0F172A]" />
          <span>UNCONFIRMED</span>
        </span>
      );
    }
    return (
      <span className="cyber-badge cyber-badge-safe">
        <ShieldCheck className="w-3 h-3 text-[#065F46]" />
        <span>SAFE</span>
      </span>
    );
  };

  const formatRiskScore = (score, level) => {
    if (score === null || score === undefined || level === 'INSUFFICIENT_EVIDENCE') {
      return 'N/A';
    }
    return typeof score === 'number' ? `${score.toFixed(1)}%` : `${score}%`;
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== 'ALL' || selectedVerdict !== 'ALL' || sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="cyber-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0F172A] mb-1">
              <History className="w-4 h-4 text-[#1D4ED8]" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-[#0F172A]">
                Scan Audit & Detection Records (Unified Telemetry)
              </h2>
            </div>
            <p className="text-xs text-[#475569]">
              Persistent SQLite audit history of all evaluated URLs, SMS smishing lures, and visual screenshot threat dossiers.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]">
              Total Records: <span className="text-[#0F172A] font-bold">{history.length}</span>
            </span>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="cyber-btn-secondary text-xs px-3 py-1.5"
              title="Refresh audit database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0F172A]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by target URL, SMS text, screenshot file, or brand..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Selector (Unified across URL, SMS, Screenshot) */}
            <div className="flex items-center space-x-1 p-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
              <span className="text-[10px] font-mono uppercase text-[#64748B] px-2">Type:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'url', label: 'URL' },
                { id: 'sms', label: 'SMS' },
                { id: 'screenshot', label: 'Screenshot' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${selectedType === t.id
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold border border-[#BFDBFE]'
                      : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Verdict Selector */}
            <div className="flex items-center space-x-1 p-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
              <span className="text-[10px] font-mono uppercase text-[#64748B] px-2">Verdict:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PHISHING', label: 'Phishing', color: 'text-[#991B1B]' },
                { id: 'SUSPICIOUS', label: 'Suspicious', color: 'text-[#92400E]' },
                { id: 'SAFE', label: 'Safe', color: 'text-[#065F46]' },
                { id: 'INSUFFICIENT_EVIDENCE', label: 'Unconfirmed', color: 'text-[#475569]' }
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVerdictChange(v.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${selectedVerdict === v.id
                      ? 'bg-[#0F172A] text-white font-semibold'
                      : `${v.color || 'text-[#475569]'} hover:text-[#0F172A]`
                    }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_risk">Highest Risk</option>
                <option value="lowest_risk">Lowest Risk</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="cyber-btn-secondary text-xs px-2.5 py-1.5 text-[#475569] hover:text-white"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1">
            <span>
              Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} filtered records
            </span>
            {hasActiveFilters && (
              <span className="text-[#0F172A]">Filters applied</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. History Table */}
      <div className="cyber-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-[#64748B] flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0F172A]" />
            <span>Loading persistent SQLite audit records...</span>
          </div>
        ) : paginatedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#475569] font-mono uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-4">Scanned Content</th>
                  <th className="py-3 px-4">Target Brand</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
                {paginatedRecords.map((item) => {
                  const type = (item.scan_type || 'url').toLowerCase();
                  const isSms = type === 'sms';
                  const isScreenshot = type === 'screenshot';
                  const isSelected = selectedRecord?.id === item.id;
                  const formattedScore = formatRiskScore(item.risk_score, item.risk_level);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRecord(item)}
                      className={`cursor-pointer transition-colors ${isSelected
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
                          : 'hover:bg-[#F8FAFC]/60'
                        }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155]">
                          {isSms ? (
                            <>
                              <MessageSquare className="w-3 h-3 text-purple-400" />
                              <span>SMS</span>
                            </>
                          ) : isScreenshot ? (
                            <>
                              <ImageIcon className="w-3 h-3 text-[#0F172A]" />
                              <span>IMAGE</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-[#0F172A]" />
                              <span>URL</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#0F172A] max-w-xs sm:max-w-md truncate" title={item.target_input}>
                        {item.target_input}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.target_brand ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                              {item.target_brand}
                            </span>
                            {item.is_brand_impersonation && (
                              <span className="text-[9px] font-mono text-[#991B1B] font-bold" title={item.impersonation_technique}>
                                [SPOOF]
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span
                          className={`font-bold ${formattedScore === 'N/A'
                              ? 'text-[#475569]'
                              : item.risk_score >= 80
                                ? 'text-[#991B1B]'
                                : item.risk_score >= 60
                                  ? 'text-orange-400'
                                  : item.risk_score >= 30
                                    ? 'text-[#92400E]'
                                    : 'text-[#065F46]'
                            }`}
                        >
                          {formattedScore}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRiskBadge(item)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-mono text-[#334155] hover:text-[#0F172A] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center mx-auto text-[#475569]">
              <History className="w-5 h-5 text-[#475569]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A]">No Matching Audit Records</h3>
            <p className="text-xs text-[#475569] max-w-md mx-auto">
              {hasActiveFilters
                ? 'No audit records match the current search query or filter selection. Try adjusting or clearing your filters.'
                : 'No scan records found in the database. Run a URL, SMS, or screenshot scan to generate persistent audit history.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="cyber-btn-secondary text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Pagination Footer */}
        {filteredRecords.length > pageSize && (
          <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
            <span className="text-[#475569]">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded text-xs transition-all ${currentPage === page
                        ? 'bg-[#1D4ED8] text-white font-bold shadow-sm'
                        : 'bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Detail View Drawer / Modal */}
      {selectedRecord && (
        <div className="cyber-card p-5 sm:p-6 border-[#CBD5E1] space-y-5 bg-white relative animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0F172A]">
                Audit Record Dossier — ID #{selectedRecord.id}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="text-[#475569] hover:text-[#0F172A] p-1 rounded hover:bg-[#F8FAFC]"
              title="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Scan Type</span>
              <span className="text-[#0F172A] font-bold uppercase mt-0.5 block flex items-center gap-1.5">
                {selectedRecord.scan_type?.toLowerCase() === 'sms' ? (
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                ) : selectedRecord.scan_type?.toLowerCase() === 'screenshot' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[#0F172A]" />
                )}
                <span>{selectedRecord.scan_type || 'URL'}</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Risk Score</span>
              <span
                className={`font-bold text-sm mt-0.5 block ${selectedRecord.risk_score === null || selectedRecord.risk_level === 'INSUFFICIENT_EVIDENCE'
                    ? 'text-[#475569]'
                    : selectedRecord.risk_score >= 80
                      ? 'text-[#991B1B]'
                      : selectedRecord.risk_score >= 60
                        ? 'text-orange-400'
                        : selectedRecord.risk_score >= 30
                          ? 'text-[#92400E]'
                          : 'text-[#065F46]'
                  }`}
              >
                {formatRiskScore(selectedRecord.risk_score, selectedRecord.risk_level)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Verdict</span>
              <div className="mt-1">
                {getRiskBadge(selectedRecord)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Logged At</span>
              <span className="text-[#334155] text-[11px] mt-0.5 block">
                {formatDateTime(selectedRecord.created_at)}
              </span>
            </div>
          </div>

          {/* Scanned Input Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#475569]">
              <span className="uppercase">
                {selectedRecord.scan_type === 'screenshot' ? 'Screenshot Target File:' : 'Original Target Content:'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(selectedRecord.target_input)}
                className="flex items-center space-x-1 text-[#0F172A] hover:text-[#0F172A]"
              >
                {copiedTarget ? (
                  <>
                    <Check className="w-3 h-3 text-[#065F46]" />
                    <span className="text-[#065F46]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Content</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs text-[#0F172A] break-all select-all leading-relaxed max-h-40 overflow-y-auto">
              {selectedRecord.target_input}
            </div>
          </div>

          {/* Brand Impersonation Diagnostics */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-[#334155] font-mono text-[11px] uppercase font-bold">
              <Landmark className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Trademark Impersonation Assessment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-[#64748B] block text-[10px]">Identified Entity:</span>
                <span className="text-[#0F172A] font-bold">
                  {selectedRecord.target_brand || 'No Bank Brand Identified'}
                </span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[10px]">Impersonation Flag:</span>
                <span
                  className={
                    selectedRecord.is_brand_impersonation
                      ? 'text-[#991B1B] font-bold'
                      : 'text-[#065F46]'
                  }
                >
                  {selectedRecord.is_brand_impersonation ? 'IMPERSONATION DETECTED' : 'NO SPOOFING'}
                </span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[10px]">Vector Technique:</span>
                <span className="text-[#334155]">
                  {selectedRecord.impersonation_technique
                    ? selectedRecord.impersonation_technique.replace(/_/g, ' ')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recorded Justifications & Reasons */}
          {selectedRecord.reasons && selectedRecord.reasons.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs font-mono">
              <span className="text-[10px] text-[#475569] uppercase font-bold block">
                Primary Assessment Reasons:
              </span>
              <ul className="space-y-1 text-[#334155] list-disc list-inside text-[11px]">
                {selectedRecord.reasons.map((r, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recorded SHAP / Keyword Features */}
          {selectedRecord.shap_features && selectedRecord.shap_features.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs font-mono">
              <span className="text-[10px] text-[#475569] uppercase font-bold block">
                Key Recorded ML Risk Contributors / Tokens:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedRecord.shap_features.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]"
                  >
                    {feat.name || feat.token || JSON.stringify(feat)}
                    {feat.shap !== undefined && ` (+${feat.shap.toFixed(2)})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] font-mono">
              Static SQLite audit entry. Historical records are immutable.
            </span>

            <div className="flex items-center space-x-2">
              {/* Phase 6C: Threat Dossier Export Controls */}
              <button
                type="button"
                onClick={() => apiService.downloadDossierPdf(selectedRecord.id)}
                className="cyber-btn-secondary text-xs flex items-center space-x-1.5"
                title="Download human-readable PDF threat dossier"
              >
                <FileText className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>PDF Dossier</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const data = await apiService.getDossierJson(selectedRecord.id);
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `phishshield-threat-dossier-${selectedRecord.id}.json`;
                    a.click();
                  } catch (e) {
                    alert('Export failed: ' + e.message);
                  }
                }}
                className="cyber-btn-secondary text-xs flex items-center space-x-1.5"
                title="Download structured JSON threat intelligence"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0F172A]" />
                <span>JSON</span>
              </button>

              {selectedRecord.scan_type?.toLowerCase() === 'url' && onSelectUrlForScan && (
                <button
                  type="button"
                  onClick={() => onSelectUrlForScan(selectedRecord.target_input)}
                  className="cyber-btn-primary text-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Re-Evaluate URL</span>
                </button>
              )}

              {selectedRecord.scan_type?.toLowerCase() === 'sms' && onSelectSmsForScan && (
                <button
                  type="button"
                  onClick={() => onSelectSmsForScan(selectedRecord.target_input)}
                  className="cyber-btn-primary text-xs bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Re-Evaluate SMS</span>
                </button>
              )}

              {selectedRecord.scan_type?.toLowerCase() === 'screenshot' && onSelectScreenshotForScan && (
                <button
                  type="button"
                  onClick={onSelectScreenshotForScan}
                  className="cyber-btn-primary text-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Open Screenshot Scanner</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
