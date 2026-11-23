import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  Globe,
  Tag,
  Layers,
  X,
  AlertCircle
} from 'lucide-react';

export default function RegisteredBanksList({ banks = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Compute unique categories and counts directly from real backend data
  const categories = useMemo(() => {
    const cats = { ALL: banks.length };
    banks.forEach((b) => {
      const cat = b.category || 'Other';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return cats;
  }, [banks]);

  // Client-side filtering by name, domain, keywords, and category
  const filteredBanks = useMemo(() => {
    return banks.filter((b) => {
      const matchesCategory =
        selectedCategory === 'ALL' || b.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesName = b.brand_name?.toLowerCase().includes(q);
      const matchesDomain = b.primary_domain?.toLowerCase().includes(q);
      const matchesOfficial = b.official_domains?.some((d) =>
        d.toLowerCase().includes(q)
      );
      const matchesKeywords = b.keywords?.some((k) =>
        k.toLowerCase().includes(q)
      );

      return (
        matchesCategory &&
        (matchesName || matchesDomain || matchesOfficial || matchesKeywords)
      );
    });
  }, [banks, searchTerm, selectedCategory]);

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Public Sector Bank':
        return 'bg-indigo-950/70 text-indigo-300 border-indigo-800/50';
      case 'Private Sector Bank':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50';
      case 'Payments Bank':
        return 'bg-purple-950/70 text-purple-300 border-purple-800/50';
      case 'Payment Network':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50';
      case 'Regulatory Authority':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm space-y-6">
      {/* Registry Ground Truth Explanation Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1e293b]">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Building2 className="w-4 h-4" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Zero-Trust Ground Truth Registry
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Indian Banking Canonical Domain Registry
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            PhishShield compares submitted URLs and SMS messages against this authoritative registry using registered domain extraction (`tldextract`) and Damerau-Levenshtein distance. Any domain targeting these brand identities outside the verified whitelist triggers brand impersonation alarms.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-start lg:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-[#131926] border border-[#1e293b] text-xs font-mono">
            <span className="text-slate-400">Protected Entities: </span>
            <span className="text-cyan-400 font-bold">{banks.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Whitelist</span>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bank name, official domain (e.g. sbi, hdfcbank.com)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#131926] border border-[#1e293b] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400 self-center sm:self-auto">
            Showing <span className="text-white font-bold">{filteredBanks.length}</span> of {banks.length} institutions
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.entries(categories).map(([catName, count]) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1.5 ${isSelected
                    ? 'bg-cyan-500 text-[#07090e] font-bold shadow-sm'
                    : 'bg-[#131926] text-slate-400 hover:text-slate-200 border border-[#1e293b] hover:border-slate-700'
                  }`}
              >
                <span>{catName === 'ALL' ? 'All Institutions' : catName}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bank Cards Grid */}
      {filteredBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Header: Category Badge + Whitelist Check */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                      bank.category
                    )}`}
                  >
                    {bank.category}
                  </span>
                  <div
                    className="flex items-center space-x-1 text-emerald-400 text-[10px] font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0"
                    title="Verified Banking Whitelist"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Bank Name */}
                <h4 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                  {bank.brand_name}
                </h4>

                {/* Primary Canonical Domain */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#1e293b]">
                  <span className="font-mono text-[11px] text-slate-500">Primary Domain:</span>
                  <a
                    href={`https://${bank.primary_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center space-x-1 hover:underline"
                    title={`Open official ${bank.primary_domain}`}
                  >
                    <span>{bank.primary_domain}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Verified Alternative Domains / Sub-portals */}
                {bank.official_domains?.length > 1 && (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Official Aliases & CDNs:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {bank.official_domains.map((dom, dIdx) => (
                        <span
                          key={dIdx}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#07090e] border border-[#1e293b] text-slate-300"
                        >
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Monitored Keywords / Identity Markers */}
              {bank.keywords?.length > 0 && (
                <div className="pt-2 border-t border-[#1e293b]">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">
                    Monitored Brand Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {bank.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 rounded-lg bg-[#07090e] border border-[#1e293b] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Banking Entities Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No registered institutions match "{searchTerm}". Try clearing your query or switching category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="cyber-btn-secondary text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
