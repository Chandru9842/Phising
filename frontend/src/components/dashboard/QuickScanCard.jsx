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
    <div className="p-5 rounded-md bg-[#12161F] border border-[#1E2430]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-[#2563EB] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#9CA3AF]">
                Zero-Trust Scan
              </span>
            </div>
            <h2 className="text-base font-semibold text-[#F3F4F6] tracking-tight">
              Analyze URL & Banking Brand Legitimacy
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#0E121A] px-2 py-0.5 rounded border border-[#1E2430] self-start sm:self-auto">
            Random Forest + Trademark Engine
          </span>
        </div>

        <p className="text-xs text-[#9CA3AF] max-w-2xl leading-relaxed">
          Extracts 26 structural features, verifies registered apex domains, executes Damerau-Levenshtein distance checks against canonical Indian banks, and calculates inference probabilities.
        </p>

        {/* Input Command Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
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
                className={`w-full h-10 pl-9 pr-8 rounded-md bg-[#0D1017] text-xs text-[#F3F4F6] placeholder-[#6B7280] font-mono transition-colors focus:outline-none ${
                  validationError
                    ? 'border border-[#F87171] focus:border-[#F87171]'
                    : 'border border-[#1E2430] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                }`}
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setValidationError('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] p-0.5"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={isSubmitting}
              className="cyber-btn-primary h-10 px-4 shrink-0 text-xs font-medium"
            >
              <span>{isSubmitting ? 'Evaluating...' : 'Analyze URL'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="flex items-center space-x-1.5 text-xs text-[#F87171] font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Presets as compact low-profile pills */}
        <div className="pt-2 border-t border-[#1E2430]">
          <p className="text-[10px] font-mono text-[#6B7280] mb-2 uppercase tracking-wider">
            Test Vectors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sampleTargets.map((sample, idx) => {
              const isSelected = inputUrl === sample.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`text-left p-2 rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-[#171C28] border-[#2563EB]'
                      : 'bg-[#0E121A] border-[#1E2430] hover:border-[#2B3445] hover:bg-[#171C28]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-medium gap-2">
                    <span className="text-[#F3F4F6] truncate flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3 text-[#2563EB]" />}
                      <span>{sample.label}</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 bg-[#171C28] text-[#9CA3AF] border border-[#2B3445]">
                      {sample.brand}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#6B7280] truncate mt-0.5">
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
