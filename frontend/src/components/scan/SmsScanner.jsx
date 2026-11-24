import React, { useState } from 'react';
import { apiService } from '../../services/api';
import {
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Landmark,
  Sparkles,
  AlertOctagon,
  FileText,
  Link as LinkIcon,
  RotateCcw,
  Shield,
  PhoneCall,
  Lock,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export default function SmsScanner({ initialMessage, onScanComplete }) {
  const [message, setMessage] = useState(initialMessage || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [expandedUrlFeatures, setExpandedUrlFeatures] = useState({});

  React.useEffect(() => {
    if (initialMessage && initialMessage !== message) {
      setMessage(initialMessage);
      handleScan(initialMessage);
    }
  }, [initialMessage]);

  const sampleMessages = [
    {
      label: 'Fake SBI YONO KYC Block',
      category: 'Banking Smishing',
      badgeColor: 'border-rose-500/30 text-[#991B1B] bg-rose-500/10',
      text: 'Dear SBI User, your YONO account is blocked today due to pending KYC. Click http://onlinesbi-pan-kyc-verification.com/login.php to update immediately.',
      desc: 'SBI brand impersonation with urgent KYC suspension lure and phishing link.',
    },
    {
      label: 'Electricity Power Cut Threat',
      category: 'Utility Smishing',
      badgeColor: 'border-amber-500/30 text-[#92400E] bg-amber-500/10',
      text: 'Electricity Power Cut Alert: Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Pay immediately at http://ebill-update.xyz to avoid cutoff.',
      desc: 'Urgency & extortion lure impersonating state electricity board with untrusted link.',
    },
    {
      label: 'Fake HDFC Points Redemption',
      category: 'Reward Smishing',
      badgeColor: 'border-rose-500/30 text-[#991B1B] bg-rose-500/10',
      text: 'Dear HDFC customer, your reward points worth Rs 7,500 will expire tonight. Redeem cash in your account at http://hdfcbank-rewardpoint-redeem.in/claim now.',
      desc: 'Cash reward lure with lookalike HDFC subdomain typosquatting link.',
    },
    {
      label: 'Official SBI NEFT Credit Alert',
      category: 'Official Transaction',
      badgeColor: 'border-emerald-500/30 text-[#065F46] bg-emerald-500/10',
      text: 'Dear SBI Customer, your A/C ending 4589 is credited with Rs 45,000.00 on 15-Nov-26 by NEFT. Available Bal: Rs 68,450.00. Official portal: https://retail.onlinesbi.sbi -State Bank of India',
      desc: 'Authentic banking transaction alert containing verified official SBI portal.',
    },
    {
      label: 'Legitimate Bank OTP (No Link)',
      category: 'Official OTP',
      badgeColor: 'border-emerald-500/30 text-[#065F46] bg-emerald-500/10',
      text: '349812 is your OTP for login to SBI NetBanking. Do not share this OTP with anyone, including bank staff. Valid for 10 minutes. -State Bank of India',
      desc: 'Authentic 2FA OTP message containing security advisory and no external links.',
    },
    {
      label: 'Axis Bank Security Alert',
      category: 'Banking Smishing',
      badgeColor: 'border-rose-500/30 text-[#991B1B] bg-rose-500/10',
      text: 'Urgent: Your Axis Bank NetBanking access has been suspended due to unusual activity. Verify your pan card now at http://axisbank-security-portal.com to restore access.',
      desc: 'Security panic lure targeting Axis Bank customers with credential harvester.',
    },
  ];

  const handleScan = async (targetText) => {
    const inputToScan = (targetText || message).trim();
    if (!inputToScan) {
      setError('Please provide an SMS message to evaluate.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const data = await apiService.scanSms(inputToScan);
      setScanResult(data);
      if (onScanComplete) onScanComplete(data);
    } catch (err) {
      console.error('SMS scan request error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'SMS scan failed to connect to backend engine.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setScanResult(null);
    setError(null);
    setExpandedUrlFeatures({});
  };

  const handleCopyUrl = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const toggleUrlFeatures = (idx) => {
    setExpandedUrlFeatures((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getRiskBadge = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'SAFE' || l === 'LOW') {
      return (
        <span className="cyber-badge cyber-badge-safe">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LEGITIMATE / SAFE</span>
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
        <span>CRITICAL SMISHING</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SMS INPUT CONSOLE */}
      <div className="cyber-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                SMS Phishing (Smishing) & Multi-URL Defense Console
              </h2>
            </div>
            <p className="text-xs text-[#475569]">
              Dual-stage analysis: TF-IDF + Logistic Regression for NLP language urgency, with automatic deep-scanning of every embedded link.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-purple-400 border border-[#E2E8F0]">
              NLP + RF Multi-URL Engine
            </span>
          </div>
        </div>

        {/* Text Area Form */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Paste suspicious SMS message text here (e.g. 'Dear SBI user, your YONO account is blocked today due to pending KYC. Click http://...')..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 resize-y transition-all"
            />
            <div className="absolute right-3 bottom-3 text-[10px] font-mono text-[#64748B] bg-white/80 px-2 py-0.5 rounded border border-[#E2E8F0]">
              {message.length} characters
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-[#64748B] flex items-center space-x-1">
              <Lock className="w-3 h-3 text-[#065F46]" />
              <span>In-Memory Evaluation: URLs are extracted syntactically and analyzed without HTTP execution.</span>
            </span>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              {(message || scanResult) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="cyber-btn-secondary px-3 py-2.5 text-xs"
                  title="Reset console"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleScan()}
                disabled={isScanning || !message.trim()}
                className="cyber-btn-primary px-5 py-2.5 text-xs"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing SMS & URLs...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze SMS Security</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#991B1B] mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Scan Error:</span>
              <span className="opacity-90">{error}</span>
            </div>
          </div>
        )}

        {/* Preset Sample Targets */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-semibold flex items-center gap-1.5">
              <span>Preset Indian Smishing Attacks & Official Alerts:</span>
            </p>
            <span className="text-[10px] text-[#64748B]">Click to test instant detection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sampleMessages.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(item.text);
                  handleScan(item.text);
                }}
                className="text-left p-3 rounded-lg bg-[#F8FAFC]/70 border border-[#E2E8F0] hover:border-purple-500/40 hover:bg-[#F1F5F9] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-[#0F172A] group-hover:text-purple-300 truncate">
                    {item.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-[10px] text-[#475569] line-clamp-2 mb-1.5 leading-normal font-mono">
                  "{item.text}"
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] group-hover:text-purple-400/80">
                  <span className="truncate max-w-[200px]">{item.desc}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SCAN RESULTS VIEW */}
      {scanResult && (
        <div className="space-y-6">
          {/* Hero Assessment Card */}
          <div className="cyber-card p-5 sm:p-6 space-y-5 border-purple-500/20">
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                    Composite Smishing Assessment
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                    Model v{scanResult.sms_text_analysis?.model_version || '1.0.0'}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {scanResult.analyzed_at}
                  </span>
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <p className="text-xs font-mono text-[#0F172A] leading-relaxed max-w-3xl line-clamp-2">
                    "{scanResult.message}"
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(scanResult.message)}
                    className="p-1.5 rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] hover:text-white border border-[#E2E8F0] shrink-0 mt-0.5"
                    title="Copy message text"
                  >
                    {copiedMessage ? (
                      <Check className="w-3.5 h-3.5 text-[#065F46]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-3">
                {getRiskBadge(scanResult.composite_risk_level)}
              </div>
            </div>

            {/* Actionable Safety Recommendation Directive */}
            <div
              className={`p-4 rounded-xl border flex items-start space-x-3.5 ${scanResult.composite_risk_level === 'CRITICAL'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-rose-200'
                  : scanResult.composite_risk_level === 'HIGH'
                    ? 'bg-orange-950/30 border-orange-800/70 text-orange-200'
                    : scanResult.composite_risk_level === 'MEDIUM' || scanResult.composite_risk_level === 'SUSPICIOUS'
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-amber-200'
                      : 'bg-[#ECFDF5] border-[#A7F3D0] text-emerald-200'
                }`}
            >
              <div className="shrink-0 mt-0.5">
                {scanResult.composite_risk_level === 'CRITICAL' ? (
                  <ShieldAlert className="w-5 h-5 text-[#991B1B] animate-pulse" />
                ) : scanResult.composite_risk_level === 'HIGH' ? (
                  <AlertOctagon className="w-5 h-5 text-orange-400" />
                ) : scanResult.composite_risk_level === 'MEDIUM' || scanResult.composite_risk_level === 'SUSPICIOUS' ? (
                  <AlertTriangle className="w-5 h-5 text-[#92400E]" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-[#065F46]" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono font-bold tracking-wider uppercase text-[11px]">
                    ACTION DIRECTIVE: {scanResult.recommendation.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="leading-relaxed opacity-95">{scanResult.recommendation_text}</p>
              </div>
            </div>

            {/* 3 Telemetry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Telemetry 1: Composite Threat Score */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold">
                    Composite Risk Score
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">NLP + URL Threat</span>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span
                    className={`text-3xl font-black font-mono ${scanResult.composite_risk_score >= 80
                        ? 'text-[#991B1B]'
                        : scanResult.composite_risk_score >= 60
                          ? 'text-orange-400'
                          : scanResult.composite_risk_score >= 30
                            ? 'text-[#92400E]'
                            : 'text-[#065F46]'
                      }`}
                  >
                    {scanResult.composite_risk_score}%
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    (Text NLP: {scanResult.sms_text_analysis?.sms_risk_score}%)
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scanResult.composite_risk_score >= 80
                          ? 'bg-rose-500'
                          : scanResult.composite_risk_score >= 60
                            ? 'bg-orange-500'
                            : scanResult.composite_risk_score >= 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.max(4, scanResult.composite_risk_score)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#64748B]">
                    <span>Safe (0-30%)</span>
                    <span>Suspicious (30-60%)</span>
                    <span>Phishing (80%+)</span>
                  </div>
                </div>
              </div>

              {/* Telemetry 2: SMS NLP Classifier Probability */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Language Model</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">TF-IDF + LR</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Legitimate Confidence:</span>
                    <span className="font-mono text-[#065F46] font-bold">
                      {((scanResult.sms_text_analysis?.probabilities?.legitimate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Phishing/Smish Prob:</span>
                    <span className="font-mono text-[#991B1B] font-bold">
                      {((scanResult.sms_text_analysis?.probabilities?.phishing || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Smishing Classification:</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${scanResult.is_smishing ? 'text-[#991B1B]' : 'text-[#065F46]'
                        }`}
                    >
                      {scanResult.is_smishing ? 'CONFIRMED SMISHING' : 'AUTHENTIC / SAFE'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-[#64748B] font-mono">
                  Word & character n-grams trained on Indian scams
                </div>
              </div>

              {/* Telemetry 3: Target Brand & Embedded Links */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#0F172A]" />
                    <span>Targeted Institution</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#0F172A]">
                    {scanResult.url_count} Link{scanResult.url_count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  {scanResult.target_brand ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-[#991B1B] border border-rose-500/30 text-xs font-bold font-mono">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#991B1B]" />
                        <span>Spoofing: {scanResult.target_brand}</span>
                      </span>
                      <p className="text-[11px] text-[#991B1B] font-mono mt-1">
                        Brand impersonation detected in message links
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[#334155] border border-slate-700 text-xs font-medium font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#475569]" />
                        <span>General / Unbranded</span>
                      </span>
                      <p className="text-[11px] text-[#64748B] font-mono mt-1">
                        No specific Indian bank trademark identified
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#64748B] font-mono">
                  Extracted Links: {scanResult.url_count} evaluated
                </div>
              </div>
            </div>
          </div>

          {/* 3. IDENTIFIED SMISHING & FINANCIAL LURE TOKENS */}
          {scanResult.sms_text_analysis?.keywords_detected?.length > 0 && (
            <div className="cyber-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Identified Urgency & Financial Coercion Tokens
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#475569]">
                  {scanResult.sms_text_analysis.keywords_detected.length} High-Threat Keywords
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {scanResult.sms_text_analysis.keywords_detected.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold"
                  >
                    <span className="text-purple-400">#</span>
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Attackers exploit artificial urgency tokens ("blocked", "kyc", "immediately", "expire") to induce panic and force victims into entering credentials or clicking unverified links.
              </p>
            </div>
          )}

          {/* 4. EXTRACTED URLS AUTOMATIC DEEP SCAN */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-[#0F172A]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Extracted URLs Deep Analysis ({scanResult.url_count} Link{scanResult.url_count !== 1 ? 's' : ''})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#475569]">
                26-Feature RF + Indian Banking Registry + TreeSHAP
              </span>
            </div>

            {scanResult.url_scan_results && scanResult.url_scan_results.length > 0 ? (
              <div className="space-y-3">
                {scanResult.url_scan_results.map((urlRes, idx) => {
                  const bData = urlRes.brand_analysis;
                  const sData = urlRes.shap_explanation;
                  const rData = urlRes.risk_assessment;
                  const isFeaturesOpen = expandedUrlFeatures[idx];

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 hover:border-[#CBD5E1] transition-all"
                    >
                      {/* URL Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#0F172A] border border-[#E2E8F0] shrink-0 font-bold">
                            LINK #{idx + 1}
                          </span>
                          <span className="text-xs font-mono text-[#0F172A] truncate font-bold">
                            {urlRes.url}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(urlRes.url, idx)}
                            className="p-1.5 rounded bg-white text-[#475569] hover:text-white border border-[#E2E8F0] transition-colors"
                            title="Copy extracted URL (Warning: Do not open in browser)"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-[#065F46]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {getRiskBadge(urlRes.risk_level)}
                        </div>
                      </div>

                      {/* URL Diagnostics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                          <span className="text-[10px] font-mono text-[#475569] block uppercase">
                            Calibrated Threat Score
                          </span>
                          <span className="font-mono font-bold text-[#0F172A] mt-1 block">
                            {urlRes.risk_score}%
                            <span className="text-[#64748B] text-[11px] font-normal ml-1.5">
                              (ML: {(urlRes.probabilities?.phishing * 100).toFixed(1)}%)
                            </span>
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                          <span className="text-[10px] font-mono text-[#475569] block uppercase">
                            Brand Impersonation Status
                          </span>
                          <span className="font-mono font-bold mt-1 block truncate">
                            {bData?.is_official_domain ? (
                              <span className="text-[#065F46] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified {bData.detected_brand}</span>
                              </span>
                            ) : bData?.impersonation_suspected ? (
                              <span className="text-[#991B1B] flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Spoofing {bData.detected_brand}</span>
                              </span>
                            ) : (
                              <span className="text-[#475569]">None (Unbranded)</span>
                            )}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                          <span className="text-[10px] font-mono text-[#475569] block uppercase">
                            Match Vector & Distance
                          </span>
                          <span className="font-mono text-[#334155] mt-1 block truncate">
                            {bData?.match_type ? bData.match_type.replace(/_/g, ' ') : 'N/A'}
                            {bData?.edit_distance >= 0 && ` (Dist: ${bData.edit_distance})`}
                          </span>
                        </div>
                      </div>

                      {/* SHAP Summary */}
                      {sData && sData.summary && (
                        <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#334155] flex items-start space-x-2">
                          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                              TreeSHAP AI Explanation:
                            </span>
                            <p className="italic text-[#334155] leading-relaxed text-[11px]">
                              "{sData.summary}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recommendation text */}
                      {rData && rData.recommendation_text && (
                        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#334155] flex items-start space-x-2">
                          <Info className="w-3.5 h-3.5 text-[#0F172A] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{rData.recommendation_text}</span>
                        </div>
                      )}

                      {/* Expandable 26-features accordion for embedded URL */}
                      {urlRes.features && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleUrlFeatures(idx)}
                            className="flex items-center space-x-1.5 text-[10px] font-mono text-[#475569] hover:text-[#0F172A] pt-1 transition-colors"
                          >
                            <Layers className="w-3 h-3" />
                            <span>
                              {isFeaturesOpen ? 'Hide URL Features' : 'Inspect 26 Extracted URL Features'}
                            </span>
                            {isFeaturesOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isFeaturesOpen && (
                            <div className="mt-2 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px] font-mono">
                              {Object.entries(urlRes.features).map(([fKey, fVal]) => (
                                <div
                                  key={fKey}
                                  className="p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] truncate"
                                >
                                  <span className="text-[#64748B] block truncate" title={fKey}>
                                    {fKey}
                                  </span>
                                  <span className="text-[#0F172A] font-bold block mt-0.5">
                                    {typeof fVal === 'number'
                                      ? Number.isInteger(fVal)
                                        ? fVal
                                        : fVal.toFixed(2)
                                      : String(fVal)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#065F46] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-[#0F172A] block">
                    Zero Embedded Hyperlinks Detected:
                  </span>
                  <p className="leading-relaxed">
                    This SMS does not contain URLs or shortlinks. The threat level is calculated purely from NLP lexical analysis, urgency triggers, coercive pressure, and financial scam keywords.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. INDIAN BANKING CUSTOMER CYBER-DEFENSE ADVISORY */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center space-x-2 text-[#0F172A] border-b border-[#E2E8F0] pb-2.5">
              <Shield className="w-4 h-4" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Indian Citizen Cyber Defense Advisory
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-mono text-[#0F172A] font-bold block text-[11px]">
                  1. Zero-Trust OTP Rule
                </span>
                <p className="text-[#475569] leading-relaxed text-[11px]">
                  Under RBI guidelines, no bank executive or official will ever ask for OTPs, UPI PINs, or NetBanking passwords. Never share OTPs over SMS or calls.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-mono text-[#0F172A] font-bold block text-[11px]">
                  2. Official Header Verification
                </span>
                <p className="text-[#475569] leading-relaxed text-[11px]">
                  Legitimate Indian bank alerts originate from certified 6-character Alpha sender headers (e.g. <span className="font-mono text-[#0F172A]">VM-SBIINB</span>, <span className="font-mono text-[#0F172A]">AD-HDFCBK</span>), never from 10-digit mobile numbers.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-mono text-[#0F172A] font-bold block text-[11px]">
                  3. Verify Domain Apex (.sbi / .com)
                </span>
                <p className="text-[#475569] leading-relaxed text-[11px]">
                  Always verify official apex domains. For instance, State Bank of India operates exclusively under canonical <span className="font-mono text-[#065F46]">.sbi</span> or official registry domains.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-mono text-[#0F172A] font-bold block text-[11px]">
                  4. Report to Cybercrime (1930)
                </span>
                <p className="text-[#475569] leading-relaxed text-[11px]">
                  Report smishing or fraudulent financial debit immediately to the National Cyber Crime Helpline <span className="font-mono text-[#92400E] font-bold">1930</span> or register an incident at <span className="font-mono text-[#0F172A]">cybercrime.gov.in</span>.
                </p>
              </div>
            </div>
          </div>

          {/* 6. THREAT AUDIT LOG FINDINGS */}
          {scanResult.reasons && scanResult.reasons.length > 0 && (
            <div className="cyber-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-[#334155] border-b border-[#E2E8F0] pb-2.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Threat Intelligence & Audit Log
                </h4>
              </div>
              <ul className="space-y-1.5 pl-1">
                {scanResult.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[#334155] flex items-start space-x-2">
                    <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
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
