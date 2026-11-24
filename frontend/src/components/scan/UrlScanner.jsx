import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../services/api';
import NetworkErrorCard from '../common/NetworkErrorCard';
import { SkeletonScanDossier } from '../common/SkeletonLoader';
import {
  Globe,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Landmark,
  BarChart3,
  AlertOctagon,
  FileText,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  SlidersHorizontal,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';

// Feature categorization map for the 26 static features
const FEATURE_CATEGORIES = {
  // Domain & Host (8)
  hostname_length: { cat: 'Domain & Host', desc: 'Length of the target host component' },
  domain_length: { cat: 'Domain & Host', desc: 'Length of the registered domain without subdomains' },
  num_dots: { cat: 'Domain & Host', desc: 'Total number of dots in the entire URL' },
  num_dots_hostname: { cat: 'Domain & Host', desc: 'Total number of dots in the hostname' },
  num_subdomains: { cat: 'Domain & Host', desc: 'Count of subdomain segments preceding the SLD' },
  subdomain_length: { cat: 'Domain & Host', desc: 'Total character length of the subdomain string' },
  has_suspicious_tld: { cat: 'Domain & Host', desc: 'Flag indicating a high-risk TLD (.xyz, .top, .buzz, etc.)' },
  has_port: { cat: 'Domain & Host', desc: 'Non-standard explicit network port specified in URL' },

  // Lexical & Path (8)
  url_length: { cat: 'Lexical & Path', desc: 'Total character length of the complete URL string' },
  path_length: { cat: 'Lexical & Path', desc: 'Length of the URL resource path string' },
  query_length: { cat: 'Lexical & Path', desc: 'Length of the query parameter string' },
  num_query_params: { cat: 'Lexical & Path', desc: 'Total number of parsed key-value query parameters' },
  shannon_entropy: { cat: 'Lexical & Path', desc: 'Shannon entropy score measuring character randomness' },
  num_hyphens: { cat: 'Lexical & Path', desc: 'Total hyphen characters in the complete URL' },
  num_hyphens_domain: { cat: 'Lexical & Path', desc: 'Hyphens located strictly within the domain name' },
  num_underscores: { cat: 'Lexical & Path', desc: 'Count of underscore characters in the URL' },

  // Obfuscation (7)
  num_digits: { cat: 'Obfuscation', desc: 'Count of numeric digits present throughout the URL' },
  digit_ratio: { cat: 'Obfuscation', desc: 'Ratio of numeric characters to total URL length' },
  num_special_chars: { cat: 'Obfuscation', desc: 'Count of punctuation & special delimiter symbols' },
  has_ip: { cat: 'Obfuscation', desc: 'Presence of an IPv4 address directly in the hostname' },
  has_at_symbol: { cat: 'Obfuscation', desc: '@ symbol used to deceive browsers into masking target host' },
  has_double_slash_path: { cat: 'Obfuscation', desc: 'Double forward slashes embedded in the path for redirection' },
  is_shortened: { cat: 'Obfuscation', desc: 'Known URL shortener service (bit.ly, tinyurl, t.co, etc.)' },

  // Brand & Security (3)
  is_https: { cat: 'Brand & Security', desc: 'SSL/TLS encryption scheme used in target protocol' },
  suspicious_keyword_count: { cat: 'Brand & Security', desc: 'Count of high-threat credential/KYC phishing keywords' },
  brand_impersonation_keyword: { cat: 'Brand & Security', desc: 'Presence of registered Indian banking brands in path/subdomain' },
};

export default function UrlScanner({ initialUrl, onScanComplete }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Feature filters state
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [featureSearch, setFeatureSearch] = useState('');
  const [showAllFeatures, setShowAllFeatures] = useState(true);

  // Sync initialUrl prop
  useEffect(() => {
    if (initialUrl && initialUrl !== url) {
      setUrl(initialUrl);
      executeScan(initialUrl);
    }
  }, [initialUrl]);

  const sampleTargets = [
    {
      label: 'Fake SBI KYC Scam',
      badge: 'Critical Phishing',
      badgeColor: 'border-rose-500/30 text-[#991B1B] bg-rose-500/10',
      url: 'http://onlinesbi-pan-kyc-verification.com/login.php',
      desc: 'Lookalike domain spoofing State Bank of India with urgent KYC lure & HTTP.',
    },
    {
      label: 'Typosquatted SBI Domain',
      badge: 'Typosquatting',
      badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
      url: 'http://onlinesb1.sbi/login',
      desc: 'Damerau-Levenshtein 1-char substitution attack ("onlinesb1" vs "onlinesbi").',
    },
    {
      label: 'Official SBI Retail Portal',
      badge: 'Verified Official',
      badgeColor: 'border-emerald-500/30 text-[#065F46] bg-emerald-500/10',
      url: 'https://retail.onlinesbi.sbi/retail/login.htm',
      desc: 'Canonical State Bank of India portal under the official .sbi apex domain.',
    },
    {
      label: 'Official ICICI NetBanking',
      badge: 'Verified Official',
      badgeColor: 'border-emerald-500/30 text-[#065F46] bg-emerald-500/10',
      url: 'https://infinity.icicibank.com/corp/AuthenticationController',
      desc: 'Official ICICI corporate banking gateway with authenticated controller.',
    },
    {
      label: 'HDFC Points Expiry Scam',
      badge: 'Reward Phishing',
      badgeColor: 'border-rose-500/30 text-[#991B1B] bg-rose-500/10',
      url: 'http://hdfcbank-rewardpoint-redeem.in/claim',
      desc: 'Monetary reward lure exploiting HDFC Bank brand keyword in .in domain.',
    },
    {
      label: 'Direct IP Evasion Attack',
      badge: 'IP Obfuscation',
      badgeColor: 'border-amber-500/30 text-[#92400E] bg-amber-500/10',
      url: 'http://192.168.1.105:8080/secure-update/login',
      desc: 'Raw IPv4 address host with non-standard port bypassing hostname filtering.',
    },
  ];

  const executeScan = async (targetUrl) => {
    const inputToScan = (targetUrl || url).trim();
    if (!inputToScan) {
      setError('Please provide a valid URL string to evaluate.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const data = await apiService.scanUrl(inputToScan);
      setScanResult(data);
      if (onScanComplete) onScanComplete(data);
    } catch (err) {
      console.error('Scan request error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Failed to connect to PhishShield URL detection engine.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleClear = () => {
    setUrl('');
    setScanResult(null);
    setError(null);
  };

  // Determine protocol prefix
  const getProtocolDetails = (rawUrl) => {
    if (!rawUrl) return null;
    const lower = rawUrl.toLowerCase();
    if (lower.startsWith('https://')) {
      return { protocol: 'https', secure: true, label: 'HTTPS (SSL/TLS)' };
    }
    if (lower.startsWith('http://')) {
      return { protocol: 'http', secure: false, label: 'HTTP (Insecure)' };
    }
    return { protocol: 'none', secure: false, label: 'No Protocol Specified' };
  };

  const protocolDetails = getProtocolDetails(url);

  // Verdict Badge Helper
  const getRiskBadge = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'SAFE' || l === 'LOW') {
      return (
        <span className="cyber-badge cyber-badge-safe">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ZERO-TRUST SAFE</span>
        </span>
      );
    }
    if (l === 'SUSPICIOUS' || l === 'MEDIUM') {
      return (
        <span className="cyber-badge cyber-badge-warn">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SUSPICIOUS RISK</span>
        </span>
      );
    }
    if (l === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>HIGH THREAT</span>
        </span>
      );
    }
    return (
      <span className="cyber-badge cyber-badge-danger animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>CRITICAL PHISHING</span>
      </span>
    );
  };

  const brandData = scanResult?.brand_analysis;
  const shapData = scanResult?.shap_explanation;
  const riskAssessment = scanResult?.risk_assessment;

  // Prepare chart data from SHAP feature attributions
  const chartData = useMemo(() => {
    if (!shapData) return [];
    const positive = (shapData.top_positive_contributors || []).slice(0, 4);
    const negative = (shapData.top_negative_contributors || []).slice(0, 3);
    const combined = [...positive, ...negative];

    return combined.map((item) => ({
      name: item.feature_name.replace(/_/g, ' '),
      shap: item.shap_value,
      value: item.feature_value,
      direction: item.direction,
      desc: item.description,
    }));
  }, [shapData]);

  // Filtered 26 features list
  const filteredFeatures = useMemo(() => {
    if (!scanResult?.features) return [];
    return Object.entries(scanResult.features).filter(([name, val]) => {
      const meta = FEATURE_CATEGORIES[name] || { cat: 'Other', desc: '' };
      // Category filter
      if (activeCategory !== 'ALL' && meta.cat !== activeCategory) {
        return false;
      }
      // Search filter
      if (featureSearch.trim()) {
        const query = featureSearch.toLowerCase();
        const matchesName = name.toLowerCase().includes(query);
        const matchesVal = String(val).toLowerCase().includes(query);
        const matchesDesc = (meta.desc || '').toLowerCase().includes(query);
        if (!matchesName && !matchesVal && !matchesDesc) return false;
      }
      return true;
    });
  }, [scanResult, activeCategory, featureSearch]);

  return (
    <div className="space-y-6">
      {/* 1. SCANNER INPUT CONSOLE */}
      <div className="cyber-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0F172A] mb-1">
              <Cpu className="w-4 h-4 text-[#1D4ED8]" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-[#0F172A]">
                URL Threat Intelligence Console
              </h2>
            </div>
            <p className="text-xs text-[#475569]">
              Evaluates URLs via 26-feature Random Forest, Indian Banking Trademark verification, and TreeSHAP explainability.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
              Static Analysis (Zero Fetch)
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-[#475569]">
                <Globe className="w-4 h-4 text-[#1D4ED8]" />
                {protocolDetails && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${protocolDetails.secure
                      ? 'bg-emerald-500/10 text-[#065F46] border-emerald-500/20'
                      : protocolDetails.protocol === 'http'
                        ? 'bg-rose-500/10 text-[#991B1B] border-rose-500/20'
                        : 'bg-slate-800 text-[#475569] border-slate-700'
                      }`}
                  >
                    {protocolDetails.protocol.toUpperCase()}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Enter or paste suspicious URL (e.g. http://onlinesbi-pan-kyc-verification.com/login.php)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeScan()}
                className="w-full pl-28 pr-10 py-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
              />

              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155] p-1"
                  title="Clear input"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => executeScan()}
                disabled={isScanning || !url.trim()}
                className="cyber-btn-primary px-5 py-3 w-full sm:w-auto text-xs"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#07090e]" />
                    <span>Executing Inference...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Security</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {(url || scanResult) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="cyber-btn-secondary px-3 py-3 text-xs"
                  title="Reset console"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-[#065F46]" />
              <span>Safe Sandbox: URLs are never connected, fetched, or executed over HTTP.</span>
            </span>
          </div>
        </div>

        {error && (
          error.toLowerCase().includes('network') || error.toLowerCase().includes('connect') || error.toLowerCase().includes('server') || error.toLowerCase().includes('offline') || error.toLowerCase().includes('failed') ? (
            <NetworkErrorCard
              title="Scanner Gateway Connection Offline"
              message="Unable to communicate with the PhishShield security engine. Please verify your internet connection and ensure the backend server is running at http://127.0.0.1:8000."
              details={error}
              onRetry={handleScan}
              isRetrying={isScanning}
            />
          ) : (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#7F1D1D] flex items-start space-x-3 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-semibold block font-mono text-[11px] uppercase text-[#991B1B]">Security Engine Error:</span>
                <span className="opacity-95 leading-relaxed">{error}</span>
              </div>
            </div>
          )
        )}

        {/* Preset Sample Targets */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-semibold flex items-center gap-1.5">
              <span>Preset Targets & Banking Test Vectors:</span>
            </p>
            <span className="text-[10px] text-[#64748B]">Click to instantly populate and run scan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sampleTargets.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  executeScan(item.url);
                }}
                className="text-left p-3 rounded-lg bg-[#F8FAFC]/70 border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0F172A] truncate">
                    {item.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-[10px] text-[#475569] line-clamp-1 mb-1.5 leading-normal">
                  {item.desc}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] group-hover:text-[#0F172A]/80">
                  <span className="truncate max-w-[200px]">{item.url}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isScanning && <SkeletonScanDossier />}

      {/* 2. SCAN RESULT DOSSIER */}
      {scanResult && !isScanning && (
        <div className="space-y-6">
          {/* Hero Assessment Card */}
          <div className="cyber-card p-5 sm:p-6 space-y-5 border-[#E2E8F0]">
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-[#0F172A] uppercase tracking-wider font-semibold">
                    Evaluated Target
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                    Model v{scanResult.model_version}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {scanResult.analyzed_at}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-sm font-mono font-bold text-[#0F172A] break-all">
                    {scanResult.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(scanResult.url)}
                    className="p-1.5 rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0] shrink-0"
                    title="Copy URL string"
                  >
                    {copiedUrl ? (
                      <Check className="w-3.5 h-3.5 text-[#065F46]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-3">
                {getRiskBadge(scanResult.risk_level)}
              </div>
            </div>

            {/* Actionable Recommendation Directive */}
            {riskAssessment && (
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3.5 shadow-sm ${
                  riskAssessment.risk_level === 'CRITICAL' || riskAssessment.risk_level === 'HIGH'
                    ? 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
                    : riskAssessment.risk_level === 'MEDIUM' || riskAssessment.risk_level === 'SUSPICIOUS'
                    ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]'
                    : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B]'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {riskAssessment.risk_level === 'CRITICAL' || riskAssessment.risk_level === 'HIGH' ? (
                    <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
                  ) : riskAssessment.risk_level === 'MEDIUM' || riskAssessment.risk_level === 'SUSPICIOUS' ? (
                    <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-[#059669]" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`font-mono font-bold tracking-wider uppercase text-[11px] ${
                        riskAssessment.risk_level === 'CRITICAL' || riskAssessment.risk_level === 'HIGH'
                          ? 'text-[#991B1B]'
                          : riskAssessment.risk_level === 'MEDIUM' || riskAssessment.risk_level === 'SUSPICIOUS'
                          ? 'text-[#92400E]'
                          : 'text-[#065F46]'
                      }`}
                    >
                      DIRECTIVE: {riskAssessment.recommendation.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="leading-relaxed opacity-95">{riskAssessment.recommendation_text}</p>
                </div>
              </div>
            )}

            {/* Core Telemetry 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Telemetry 1: Calibrated Threat Score */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold">
                    Calibrated Threat Score
                  </span>
                  <span className="text-[10px] font-mono text-[#0F172A]">Zero-Trust Metric</span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span
                    className={`text-3xl font-black font-mono ${scanResult.risk_score >= 80
                      ? 'text-[#991B1B]'
                      : scanResult.risk_score >= 60
                        ? 'text-orange-400'
                        : scanResult.risk_score >= 30
                          ? 'text-[#92400E]'
                          : 'text-[#065F46]'
                      }`}
                  >
                    {scanResult.risk_score}%
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    (ML: {(scanResult.probabilities?.phishing * 100).toFixed(1)}%)
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scanResult.risk_score >= 80
                        ? 'bg-rose-500'
                        : scanResult.risk_score >= 60
                          ? 'bg-orange-500'
                          : scanResult.risk_score >= 30
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.max(4, scanResult.risk_score)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono font-medium text-[#475569]">
                    <span>Safe (0-30%)</span>
                    <span>Suspicious (30-60%)</span>
                    <span>Phishing (60%+)</span>
                  </div>
                </div>
              </div>

              {/* Telemetry 2: Brand Impersonation Authentication */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#0F172A]" />
                    <span>Brand Authentication</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">16 Bank Registry</span>
                </div>

                <div>
                  {brandData?.is_official_domain ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-[#065F46] border border-emerald-500/30 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
                        <span>{brandData.detected_brand}</span>
                      </span>
                      <p className="text-[11px] text-[#065F46] font-mono mt-1 truncate">
                        Official: {brandData.official_domain}
                      </p>
                    </div>
                  ) : brandData?.impersonation_suspected ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-[#991B1B] border border-rose-500/30 text-xs font-bold font-mono">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#991B1B]" />
                        <span>Spoofing: {brandData.detected_brand}</span>
                      </span>
                      <p className="text-[11px] text-[#991B1B] font-mono mt-1 truncate">
                        {brandData.match_type.replace(/_/g, ' ')}
                        {brandData.edit_distance >= 0 && ` (Dist: ${brandData.edit_distance})`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[#334155] border border-slate-700 text-xs font-medium font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#475569]" />
                        <span>No Bank Impersonated</span>
                      </span>
                      <p className="text-[11px] text-[#64748B] font-mono mt-1">
                        Domain has no Indian bank trademark
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#64748B] font-mono">
                  Technique: {brandData?.match_type ? brandData.match_type.replace(/_/g, ' ') : 'N/A'}
                </div>
              </div>

              {/* Telemetry 3: AI Model & Explainability */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Explainable AI Model</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">TreeSHAP v1.0</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Prior Base Value:</span>
                    <span className="font-mono text-[#334155] font-semibold">
                      {shapData ? (shapData.base_value * 100).toFixed(1) : '50.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Model Output Prob:</span>
                    <span className="font-mono text-[#0F172A] font-bold">
                      {shapData ? `${(shapData.model_output * 100).toFixed(1)}%` : `${scanResult.risk_score}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Total Decision Trees:</span>
                    <span className="font-mono text-[#334155]">150 Trees</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#64748B] font-mono">
                  Additive feature attribution across 26 metrics
                </div>
              </div>
            </div>
          </div>

          {/* 3. BRAND IMPERSONATION DEEP ANALYSIS CARD */}
          {brandData && (
            <div className="cyber-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-[#0F172A]" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0F172A]">
                    Indian Banking Brand Impersonation Audit
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#475569]">
                  Damerau-Levenshtein & Canonical Registry Verification
                </span>
              </div>

              {/* Impersonation vs Legit Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-[10px] font-mono text-[#475569] uppercase">
                    Submitted Domain Analyzed
                  </div>
                  <div className="font-mono text-xs font-bold text-[#0F172A] break-all flex items-center gap-2">
                    <span>{brandData.submitted_domain}</span>
                    {brandData.is_official_domain ? (
                      <span className="cyber-badge cyber-badge-safe text-[9px]">OFFICIAL</span>
                    ) : brandData.impersonation_suspected ? (
                      <span className="cyber-badge cyber-badge-danger text-[9px]">SPOOFED</span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#475569]">
                        NON-BANK
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569]">
                    Extracted registered domain via multi-part TLD parsing (`tldextract`).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-[10px] font-mono text-[#475569] uppercase">
                    Canonical Institution Registry Reference
                  </div>
                  <div className="font-mono text-xs font-bold text-[#065F46] break-all flex items-center gap-2">
                    <span>{brandData.official_domain || 'No Direct Trademark Match'}</span>
                    {brandData.official_domain && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#065F46] border border-emerald-500/30">
                        {brandData.detected_brand}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569]">
                    Similarity Score: <span className="font-mono text-[#0F172A] font-bold">{(brandData.similarity_score * 100).toFixed(1)}%</span>
                    {brandData.edit_distance >= 0 && (
                      <span className="ml-2 font-mono text-[#334155]">
                        | Edit Distance: {brandData.edit_distance}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Reasons if any */}
              {brandData.reasons && brandData.reasons.length > 0 && (
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#475569] font-semibold block">
                    Brand Analysis Findings:
                  </span>
                  <ul className="space-y-1">
                    {brandData.reasons.map((r, i) => (
                      <li key={i} className="text-xs text-[#334155] flex items-start space-x-2">
                        <span className="text-[#0F172A] font-mono font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 4. SHAP EXPLAINABILITY VISUALIZER */}
          {shapData && chartData.length > 0 && (
            <div className="cyber-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#0F172A]" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0F172A]">
                    TreeSHAP Feature Attributions (Phishing Class Impact)
                  </h3>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <span className="flex items-center space-x-1.5 text-[#991B1B]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                    <span>+ Pushes toward Phishing</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-[#065F46]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    <span>- Pushes toward Safe</span>
                  </span>
                </div>
              </div>

              {/* Natural Language AI Summary */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] flex items-start space-x-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-mono uppercase text-[10px] text-[#1D4ED8] font-bold block">
                    SHAP Decision Path Summary
                  </span>
                  <p className="leading-relaxed italic text-[#0F172A]">
                    "{shapData.summary}"
                  </p>
                </div>
              </div>

              {/* Divergent Horizontal Bar Chart */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 140, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      domain={['auto', 'auto']}
                      tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(2)}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#334155', fontSize: 11, fontFamily: 'monospace' }}
                      width={130}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-white border border-[#CBD5E1] rounded-lg shadow-sm text-xs space-y-1.5 max-w-sm">
                              <p className="font-mono font-bold text-[#0F172A] uppercase text-[11px] border-b border-[#E2E8F0] pb-1">
                                {data.name}
                              </p>
                              <div className="flex justify-between text-[#334155] font-mono text-[11px]">
                                <span>Feature Value:</span>
                                <span className="font-bold text-[#0F172A]">{String(data.value)}</span>
                              </div>
                              <div className="flex justify-between font-mono text-[11px]">
                                <span>SHAP Attribution:</span>
                                <span
                                  className={`font-bold ${data.shap > 0 ? 'text-[#991B1B]' : 'text-[#065F46]'
                                    }`}
                                >
                                  {data.shap > 0 ? '+' : ''}
                                  {data.shap.toFixed(4)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#475569] pt-1 border-t border-[#E2E8F0]/50 leading-relaxed">
                                {data.desc}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={0} stroke="#334155" strokeDasharray="3 3" />
                    <Bar dataKey="shap" radius={[3, 3, 3, 3]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.shap >= 0 ? '#ef4444' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#475569] flex items-center justify-between">
                <span>
                  SHAP values calculate exact Shapley additive attributions for the 150-tree Random Forest classifier.
                </span>
                <span className="font-mono text-[#0F172A] text-[10px]">TreeExplainer v1.0</span>
              </div>
            </div>
          )}

          {/* 5. 26 EXTRACTED URL FEATURES BREAKDOWN */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#0F172A]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#0F172A]">
                  Extracted Feature Vector ({Object.keys(scanResult.features || {}).length} Features)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                className="cyber-btn-secondary text-xs px-2.5 py-1"
              >
                <span>{showAllFeatures ? 'Collapse Features' : 'Expand Features'}</span>
              </button>
            </div>

            {showAllFeatures && (
              <div className="space-y-3">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap gap-1">
                    {['ALL', 'Domain & Host', 'Lexical & Path', 'Obfuscation', 'Brand & Security'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${activeCategory === cat
                          ? 'bg-cyan-500/15 text-[#0F172A] border border-[#CBD5E1]'
                          : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A]'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter features..."
                      value={featureSearch}
                      onChange={(e) => setFeatureSearch(e.target.value)}
                      className="pl-8 pr-3 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15 w-full sm:w-44"
                    />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {filteredFeatures.map(([key, val]) => {
                    const meta = FEATURE_CATEGORIES[key] || { cat: 'General', desc: '' };
                    const isFlagged =
                      (key === 'has_ip' && val === 1) ||
                      (key === 'is_shortened' && val === 1) ||
                      (key === 'has_at_symbol' && val === 1) ||
                      (key === 'has_double_slash_path' && val === 1) ||
                      (key === 'has_suspicious_tld' && val === 1) ||
                      (key === 'is_https' && val === 0) ||
                      (key === 'suspicious_keyword_count' && val > 0) ||
                      (key === 'brand_impersonation_keyword' && val === 1);

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-lg bg-[#F8FAFC] border transition-all ${isFlagged
                          ? 'border-rose-500/40 bg-[#FEF2F2]'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                          }`}
                        title={meta.desc}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] mb-1">
                          <span className="truncate" title={key}>
                            {key}
                          </span>
                          {isFlagged && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          )}
                        </div>
                        <div
                          className={`text-xs font-mono font-bold truncate ${isFlagged ? 'text-[#991B1B]' : 'text-[#0F172A]'
                            }`}
                        >
                          {typeof val === 'number'
                            ? Number.isInteger(val)
                              ? val
                              : val.toFixed(3)
                            : String(val)}
                        </div>
                        <span className="text-[9px] text-[#64748B] block truncate mt-1">
                          {meta.cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. KEY THREAT AUDIT FINDINGS */}
          {riskAssessment && riskAssessment.reasons && riskAssessment.reasons.length > 0 && (
            <div className="cyber-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#334155] border-b border-[#E2E8F0] pb-2.5">
                <FileText className="w-4 h-4 text-[#0F172A]" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Threat Intelligence & Audit Findings
                </h4>
              </div>
              <ul className="space-y-1.5 pl-1">
                {riskAssessment.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[#334155] flex items-start space-x-2">
                    <span className="text-[#0F172A] font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
