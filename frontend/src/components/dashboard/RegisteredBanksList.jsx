import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  X
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

  return (
    <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Registry Ground Truth Explanation Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center space-x-2 text-[#0F172A]">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Zero-Trust Ground Truth Registry
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-[#0F172A] tracking-tight">
            Indian Banking Canonical Domain Registry
          </h2>
          <p className="text-[13.5px] text-[#475569] leading-relaxed">
            PhishShield compares submitted URLs and SMS messages against this authoritative registry using registered domain extraction (`tldextract`) and Damerau-Levenshtein distance. Any domain targeting these brand identities outside the verified whitelist triggers brand impersonation alarms.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-start lg:self-auto">
          <div className="px-3 py-1.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
            <span className="text-[#64748B]">Protected Entities: </span>
            <span className="text-[#0F172A] font-bold">{banks.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-mono text-[#065F46] font-medium flex items-center space-x-1.5">
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
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bank name, official domain (e.g. sbi, hdfcbank.com)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-md bg-white border border-[#CBD5E1] text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 font-mono transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-[#64748B] self-center sm:self-auto">
            Showing <span className="text-[#0F172A] font-bold">{filteredBanks.length}</span> of {banks.length} institutions
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
                className={`text-xs font-mono px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${isSelected
                    ? 'bg-[#0F172A] text-white font-semibold shadow-sm'
                    : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
              >
                <span>{catName === 'ALL' ? 'All Institutions' : catName}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-[#1E293B] text-slate-200' : 'bg-white text-[#64748B]'
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
              className="p-5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Header: Category Badge + Whitelist Check */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded border bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]">
                    {bank.category}
                  </span>
                  <div
                    className="flex items-center space-x-1 text-[#065F46] text-xs font-mono bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0] shrink-0 font-medium"
                    title="Verified Banking Whitelist"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Bank Name */}
                <h4 className="text-[15px] font-heading font-bold text-[#0F172A] mt-3 group-hover:text-[#0F172A] transition-colors">
                  {bank.brand_name}
                </h4>

                {/* Primary Canonical Domain */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#E2E8F0]">
                  <span className="font-mono text-xs text-[#64748B]">Primary Domain:</span>
                  <a
                    href={`https://${bank.primary_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F172A] font-semibold hover:underline font-mono text-xs flex items-center space-x-1"
                    title={`Open official ${bank.primary_domain}`}
                  >
                    <span>{bank.primary_domain}</span>
                    <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </div>

                {/* Verified Alternative Domains / Sub-portals */}
                {bank.official_domains?.length > 1 && (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                      Official Aliases:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {bank.official_domains.map((dom, dIdx) => (
                        <span
                          key={dIdx}
                          className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]"
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
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-mono text-[#64748B] block mb-1">
                    Monitored Brand Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {bank.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]"
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
        <div className="py-12 px-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center mx-auto text-[#64748B]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A]">No Banking Entities Found</h3>
          <p className="text-xs text-[#475569] max-w-md mx-auto">
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
