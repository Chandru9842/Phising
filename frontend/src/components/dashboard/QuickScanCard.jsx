import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, AlertCircle, X, Check } from 'lucide-react';

export default function QuickScanCard({ onNavigateToScanner }) {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleTargets = [
    {
      label: 'Fake SBI KYC Update',
      url: 'http://onlinesbi.co-verify.in/login.php',
      risk: 'Impersonation',
      brand: 'SBI',
      isOfficial: false,
    },
    {
      label: 'Fake HDFC Points Claim',
      url: 'https://hdfcbank-rewardpoint-redeem.in/claim',
      risk: 'Spoofing',
      brand: 'HDFC',
      isOfficial: false,
    },
    {
      label: 'Official ICICI NetBanking',
      url: 'https://infinity.icicibank.com/corp/AuthenticationController',
      risk: 'Canonical',
      brand: 'ICICI',
      isOfficial: true,
    },
  ];

  const handleAnalyze = (targetUrl) => {
    const urlToTest = (targetUrl || inputUrl).trim();
    if (!urlToTest) {
      setValidationError('Please enter or select a URL to analyze.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    onNavigateToScanner(urlToTest);
  };

  const handleSelectSample = (sampleUrl) => {
    setInputUrl(sampleUrl);
    setValidationError('');
  };

  return (
    <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#065F46]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                Zero-Trust Scan
              </span>
            </div>
            <h2 className="text-lg font-heading font-bold text-[#0F172A] tracking-tight">
              Analyze URL & Banking Brand Legitimacy
            </h2>
          </div>
          <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#E2E8F0] self-start sm:self-auto">
            Random Forest + Trademark Engine
          </span>
        </div>

        <p className="text-[13.5px] text-[#475569] max-w-2xl leading-relaxed">
          Extracts 26 structural features, verifies registered apex domains, executes Damerau-Levenshtein distance checks against canonical Indian banks, and calculates inference probabilities.
        </p>

        {/* Input Command Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Paste suspicious banking URL (e.g. http://onlinesbi.co-verify.in)..."
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (validationError) setValidationError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAnalyze();
                  }
                }}
                className={`w-full h-11 pl-10 pr-9 rounded-md bg-white text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] font-mono transition-colors focus:outline-none ${validationError
                    ? 'border border-[#EF4444] focus:border-[#EF4444]'
                    : 'border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15'
                  }`}
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setValidationError('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={isSubmitting}
              className="cyber-btn-primary h-11 px-5 shrink-0 text-[13.5px] font-medium"
            >
              <span>{isSubmitting ? 'Evaluating...' : 'Analyze URL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="flex items-center space-x-1.5 text-xs text-[#DC2626] font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Presets as compact low-profile pills */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <p className="text-xs font-mono font-semibold text-[#64748B] mb-2 uppercase tracking-wider">
            Test Vectors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {sampleTargets.map((sample, idx) => {
              const isSelected = inputUrl === sample.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`text-left p-2.5 rounded-md border transition-colors ${isSelected
                      ? 'bg-[#EFF6FF] border-[#1D4ED8]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                >
                  <div className="flex items-center justify-between text-[13px] font-medium gap-2">
                    <span className="text-[#0F172A] font-semibold truncate flex items-center gap-1.5">
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                      <span>{sample.label}</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono shrink-0 bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                      {sample.brand}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#64748B] truncate mt-1">
                    {sample.url}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
