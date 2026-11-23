import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, AlertCircle, X, Check } from 'lucide-react';

export default function QuickScanCard({ onNavigateToScanner }) {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleTargets = [
    {
      label: 'Fake SBI KYC Update',
      url: 'http://onlinesbi.co-verify.in/login.php',
      risk: 'Critical Impersonation',
      brand: 'State Bank of India',
    },
    {
      label: 'Fake HDFC Points Claim',
      url: 'https://hdfcbank-rewardpoint-redeem.in/claim',
      risk: 'Brand Spoofing',
      brand: 'HDFC Bank',
    },
    {
      label: 'Official ICICI NetBanking',
      url: 'https://infinity.icicibank.com/corp/AuthenticationController',
      risk: 'Official Banking Site',
      brand: 'ICICI Bank',
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
    <div className="p-6 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm relative overflow-hidden">
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
                Instant Zero-Trust Scan
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Inspect URLs & Banking Brand Legitimacy
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-[#131926] px-2.5 py-1 rounded border border-[#1e293b] self-start sm:self-auto">
            Random Forest + tldextract
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          PhishShield extracts 26 structural features, parses registered domains with tldextract, executes Damerau-Levenshtein typosquatting checks against canonical Indian banks, and evaluates probability via Random Forest.
        </p>

        {/* Input Terminal */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#131926] text-xs text-slate-100 placeholder-slate-500 font-mono transition-colors focus:outline-none ${validationError
                    ? 'border border-rose-500 focus:border-rose-400'
                    : 'border border-[#1e293b] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  }`}
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setValidationError('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
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
              className="cyber-btn-primary shrink-0"
            >
              <span>{isSubmitting ? 'Evaluating...' : 'Analyze URL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div className="pt-3 border-t border-[#1e293b]">
          <p className="text-[10px] font-mono font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            One-Click Test Attack Vectors (Indian Banking):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {sampleTargets.map((sample, idx) => {
              const isSelected = inputUrl === sample.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`text-left p-2.5 rounded-lg border transition-all ${isSelected
                      ? 'bg-[#1a2234] border-cyan-500/50 ring-1 ring-cyan-500/20'
                      : 'bg-[#131926] border-[#1e293b] hover:border-slate-700 hover:bg-[#1a2234]'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-medium gap-2">
                    <span className="text-slate-200 font-semibold truncate flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                      <span>{sample.label}</span>
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${sample.risk.includes('Official')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                    >
                      {sample.brand}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 truncate mt-1">
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
