import React, { useState, useRef, useCallback, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Info,
  Lock,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  RotateCcw,
  FileText,
  Binary,
  Code2,
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertOctagon,
  HelpCircle,
  CheckCircle,
  Radio,
  FileSearch,
  KeyRound,
  PhoneCall,
  LifeBuoy,
  X
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Defensive URL defanging helper:
 * Replaces 'http://' with 'hxxp://', 'https://' with 'hxxps://', and '.' with '[.]'
 * Prevents accidental clicking or unwanted auto-linking in chat / email / incident tickets.
 */
function defangUrlString(url) {
  if (!url) return '';
  return url
    .replace(/^https:\/\//i, 'hxxps://')
    .replace(/^http:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]');
}

/**
 * Robust clipboard copy helper with fallback for iframe or insecure context
 */
async function copyTextToClipboard(text) {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', e);
    }
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy completely failed:', err);
    return false;
  }
}

export default function ScreenshotUploader({ onScanComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [isAnalyzingThreats, setIsAnalyzingThreats] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Results
  const [resultMetadata, setResultMetadata] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [threatReport, setThreatReport] = useState(null);

  // Errors & Feedback
  const [error, setError] = useState(null);
  const [ocrError, setOcrError] = useState(null);
  const [threatError, setThreatError] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedOcrText, setCopiedOcrText] = useState(false);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // UI Views & Toggles
  const [activeTab, setActiveTab] = useState('threats'); // 'threats' | 'urls' | 'brands' | 'indicators' | 'ocr'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [defangUrls, setDefangUrls] = useState(true);

  const fileInputRef = useRef(null);
  const tabsListRef = useRef(null);

  // Timer for honest processing elapsed time
  useEffect(() => {
    let timer = null;
    if (isAnalyzingThreats || isExtractingOcr || isProcessing) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isAnalyzingThreats, isExtractingOcr, isProcessing]);

  // Toast auto-dismissal
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Keyboard escape for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Client-side file validation
  const validateFile = (file) => {
    if (!file) return 'No file selected.';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format '${ext}'. Allowed formats: PNG, JPG, JPEG, and WEBP.`;
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return `Invalid MIME type '${file.type}'. Allowed MIME types: image/png, image/jpeg, image/webp.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5.0 MB maximum limit.`;
    }

    if (file.size === 0) {
      return 'The selected file is empty (0 bytes).';
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError(null);
    setOcrError(null);
    setThreatError(null);
    setResultMetadata(null);
    setOcrResult(null);
    setThreatReport(null);
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read natural dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setResultMetadata(null);
    setOcrResult(null);
    setThreatReport(null);
    setError(null);
    setOcrError(null);
    setThreatError(null);
    setUploadProgress(0);
    setProcessingStatusText('');
    setElapsedTime(0);
    setIsLightboxOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Phase 5A: Safe Ingestion & Normalization Only
  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      setError('Please select an image file to process.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadProgress(15);
    setProcessingStatusText('Validating image signature and normalizing dimensions in memory...');

    try {
      const data = await apiService.uploadScreenshot(selectedFile, (percent) => {
        setUploadProgress(percent);
      });
      setResultMetadata(data);
      setToastMessage('Image ingestion & security validation completed.');
    } catch (err) {
      console.error('Screenshot upload error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Failed to process screenshot on backend server.');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatusText('');
    }
  };

  // Phase 5B: EasyOCR Text Extraction Only
  const handleExtractOcr = async () => {
    if (!selectedFile) {
      setError('Please select an image file to extract text from.');
      return;
    }

    setIsExtractingOcr(true);
    setOcrError(null);
    setUploadProgress(20);
    setProcessingStatusText('Executing EasyOCR neural character recognition on CPU...');

    try {
      const ocrData = await apiService.extractScreenshotText(selectedFile, (percent) => {
        setUploadProgress(percent);
      });
      setOcrResult(ocrData);
      setToastMessage(`OCR complete: ${ocrData.text_block_count || 0} typography blocks detected.`);
    } catch (err) {
      console.error('OCR extraction error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setOcrError(err.response.data.detail);
      } else {
        setOcrError(err.message || 'OCR text extraction failed. Please check backend logs.');
      }
    } finally {
      setIsExtractingOcr(false);
      setProcessingStatusText('');
    }
  };

  // Phase 5C & 5E: Full Multimodal Threat Intelligence Analysis
  const handleAnalyzeThreats = async () => {
    if (!selectedFile) {
      setThreatError('Please select a screenshot image to analyze.');
      return;
    }

    setIsAnalyzingThreats(true);
    setThreatError(null);
    setUploadProgress(15);
    setProcessingStatusText('Executing Multimodal Threat Intelligence Pipeline...');

    try {
      const report = await apiService.analyzeScreenshotThreats(selectedFile, (percent) => {
        setUploadProgress(percent);
      });
      setThreatReport(report);
      setActiveTab('threats');
      if (report.ocr_summary) {
        setOcrResult({
          ...report.ocr_summary,
          text_blocks: [],
          processing_time_ms: report.processing_time_ms
        });
      }
      setToastMessage(`Analysis finished in ${(report.processing_time_ms / 1000).toFixed(2)}s.`);
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (err) {
      console.error('Screenshot threat analysis error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        setThreatError(typeof detail === 'object' ? (detail.message || JSON.stringify(detail)) : detail);
      } else {
        setThreatError(err.message || 'Screenshot threat analysis failed. Verify backend services are active.');
      }
    } finally {
      setIsAnalyzingThreats(false);
      setProcessingStatusText('');
    }
  };

  // Robust Report Exporter with Full Context
  const handleCopyReport = async () => {
    if (!threatReport) return;
    const assessment = threatReport.screenshot_assessment || {};
    const riskScoreText =
      assessment.risk_score !== null && assessment.risk_score !== undefined
        ? `${assessment.risk_score}%`
        : 'N/A (Insufficient Typography / No Evidence)';

    const reportText = `================================================================================
PHISHSHIELD — SCREENSHOT THREAT INTELLIGENCE DOSSIER (PHASE 5E)
================================================================================
Target Image File : ${threatReport.filename}
Session ID        : ${threatReport.upload_id}
Analysis Timestamp: ${threatReport.analyzed_at}
Pipeline Runtime  : ${threatReport.processing_time_ms} ms

--------------------------------------------------------------------------------
1. EXECUTIVE THREAT ASSESSMENT
--------------------------------------------------------------------------------
Verdict           : ${assessment.risk_level || 'UNKNOWN'}
Calibrated Score  : ${riskScoreText}
Engine Confidence : ${assessment.confidence || 'unspecified'}
Assessment Summary:
${assessment.summary || 'No summary available.'}

Key Threat Factors:
${assessment.key_threat_factors && assessment.key_threat_factors.length > 0
        ? assessment.key_threat_factors.map((f) => `  * ${f}`).join('\n')
        : '  * No critical threat factors identified.'
      }

--------------------------------------------------------------------------------
2. EXTRACTED URL CANDIDATES (${threatReport.extracted_urls?.length || 0} DETECTED)
--------------------------------------------------------------------------------
${threatReport.extracted_urls && threatReport.extracted_urls.length > 0
        ? threatReport.extracted_urls
          .map((u, i) => {
            const scan = u.url_scan_result;
            return `[URL Candidate #${i + 1}]
  Normalized URL : ${defangUrlString(u.normalized_url)} (Defanged)
  Raw URL Value  : ${u.normalized_url}
  Raw OCR Text   : "${u.original_text}"
  Reconstruction : ${u.reconstruction_status}
  OCR Confidence : ${Math.round((u.ocr_confidence || 0) * 100)}%
  Model Verdict  : ${scan?.risk_level || 'UNSCANNED'} (${scan?.risk_score !== undefined ? scan.risk_score + '%' : 'N/A'})
  Phishing State : ${scan?.is_phishing ? 'PHISHING CONFIRMED' : 'LEGITIMATE / UNCONFIRMED'}`;
          })
          .join('\n\n')
        : '  * No URL candidates were extracted from image typography.'
      }

--------------------------------------------------------------------------------
3. INDIAN BANKING REGISTRY CROSS-REFERENCING (${threatReport.bank_brand_evidence?.length || 0} MATCHES)
--------------------------------------------------------------------------------
${threatReport.bank_brand_evidence && threatReport.bank_brand_evidence.length > 0
        ? threatReport.bank_brand_evidence
          .map((b) => {
            return `[Brand: ${b.brand_name}]
  Source Detection  : ${b.detection_source}
  Official Domain   : ${b.is_official_match ? 'MATCHED OFFICIAL DOMAIN' : 'NOT OFFICIAL DOMAIN'}
  Domain Mismatch   : ${b.domain_mismatch_detected ? 'CRITICAL MISMATCH DETECTED' : 'None detected'}
  Mismatch Details  : ${b.mismatch_details || 'N/A'}
  Registered Domains: ${(b.official_domains || []).join(', ')}`;
          })
          .join('\n\n')
        : '  * No registered Indian banking brand keywords were identified.'
      }

--------------------------------------------------------------------------------
4. SOCIAL ENGINEERING & COERCION PATTERNS (${threatReport.social_engineering_indicators?.length || 0} SIGNALS)
--------------------------------------------------------------------------------
${threatReport.social_engineering_indicators && threatReport.social_engineering_indicators.length > 0
        ? threatReport.social_engineering_indicators
          .map((ind) => `  * [${ind.severity}] ${ind.label} (${ind.category}): "${ind.matched_text}" -> ${ind.explanation}`)
          .join('\n')
        : '  * No psychological coercion, urgency, or credential harvesting patterns detected.'
      }

--------------------------------------------------------------------------------
5. DEFENSIVE RECOMMENDATIONS & INCIDENT RESPONSE
--------------------------------------------------------------------------------
${threatReport.recommendations && threatReport.recommendations.length > 0
        ? threatReport.recommendations.map((r) => `  * ${r}`).join('\n')
        : '  * Standard caution advised: verify links before sharing information.'
      }
${assessment.risk_level === 'CRITICAL' || assessment.risk_level === 'HIGH'
        ? `
INCIDENT RESPONSE PROTOCOL:
  * National Cybercrime Helpline: Call 1930 immediately
  * National Cybercrime Reporting Portal: https://cybercrime.gov.in
  * If credentials were submitted: Freeze debit/credit cards and netbanking via official banking helpline
  * Reset netbanking and UPI passwords from a clean, trusted device`
        : ''
      }

--------------------------------------------------------------------------------
IMPORTANT STATIC LIMITATIONS:
- Offline static analysis only: Does not establish outbound network sockets or execute remote JavaScript.
- Analysis is strictly heuristic and machine-learning based on visible typography.
================================================================================
`;

    const success = await copyTextToClipboard(reportText);
    if (success) {
      setCopiedReport(true);
      setToastMessage('Full Markdown Threat Dossier copied to clipboard.');
      setTimeout(() => setCopiedReport(false), 2000);
    } else {
      setError('Could not write to clipboard. Please check browser permissions.');
    }
  };

  const handleCopyOcrText = async () => {
    const textToCopy =
      threatReport?.ocr_summary?.extracted_text || ocrResult?.extracted_text;
    if (!textToCopy) return;
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedOcrText(true);
      setToastMessage('Raw OCR typography stream copied to clipboard.');
      setTimeout(() => setCopiedOcrText(false), 2000);
    }
  };

  const handleCopySingleUrl = async (url, idx) => {
    const textToCopy = defangUrls ? defangUrlString(url) : url;
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedUrlIndex(idx);
      setToastMessage(`URL ${defangUrls ? '(defanged)' : '(raw)'} copied to clipboard.`);
      setTimeout(() => setCopiedUrlIndex(null), 1500);
    }
  };

  // In-Browser Synthetic Threat Generator for Instant Demonstrations
  const handleGenerateSyntheticTest = (scenarioType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (scenarioType === 'SBI_PHISHING_CLONE') {
      // Top browser bar with OCR-corrupted phishing scheme
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, 45);
      ctx.fillStyle = '#f87171';
      ctx.font = '14px monospace';
      ctx.fillText('https:IIonlinesbi-kyc-verification.top/login.htm', 40, 28);

      // Top brand header
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 45, canvas.width, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('STATE BANK OF INDIA - CUSTOMER NETBANKING PORTAL', 40, 92);

      // Urgent phishing banner
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(80, 150, 1040, 70);
      ctx.fillStyle = '#fecaca';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('URGENT: Your SBI Account will be blocked within 24 hours due to pending KYC verification!', 110, 192);

      // Mock Form Card
      ctx.fillStyle = '#131926';
      if (ctx.roundRect) {
        ctx.roundRect(350, 250, 500, 420, 10);
        ctx.fill();
      } else {
        ctx.fillRect(350, 250, 500, 420);
      }

      // Form inputs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(390, 330, 420, 42);
      ctx.fillRect(390, 420, 420, 42);
      ctx.fillRect(390, 510, 420, 42);

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('User ID / NetBanking Username:', 390, 315);
      ctx.fillText('Login Password / MPIN:', 390, 405);
      ctx.fillText('Enter OTP sent to your registered mobile:', 390, 495);

      // Phishing Submit Button
      ctx.fillStyle = '#0284c7';
      if (ctx.roundRect) {
        ctx.roundRect(390, 580, 420, 48, 8);
        ctx.fill();
      } else {
        ctx.fillRect(390, 580, 420, 48);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Verify KYC & Unblock Account Immediately', 440, 610);

      // Watermark
      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.fillText('PhishShield Phase 5E Synthetic Phishing Clone Simulation', 40, 720);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'sbi_phishing_clone_simulation.png', { type: 'image/png' });
        handleFileSelect(file);
      }, 'image/png');

    } else if (scenarioType === 'GENUINE_SBI_PORTAL') {
      // Top browser bar with authenticated official domain
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, 45);
      ctx.fillStyle = '#4ade80';
      ctx.font = '14px monospace';
      ctx.fillText('https://retail.onlinesbi.sbi/personal/login.htm', 40, 28);

      // Official brand header
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 45, canvas.width, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('State Bank of India - Official NetBanking Portal', 40, 92);

      // Legitimate safety advisory box
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(80, 150, 1040, 60);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '15px sans-serif';
      ctx.fillText('Security Tips: Never share your OTP, password or PIN with anyone. Bank officials never ask for confidential credentials.', 110, 186);

      // Standard Login Form
      ctx.fillStyle = '#131926';
      if (ctx.roundRect) {
        ctx.roundRect(350, 240, 500, 420, 10);
        ctx.fill();
      } else {
        ctx.fillRect(350, 240, 500, 420);
      }

      // Form inputs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(390, 340, 420, 42);
      ctx.fillRect(390, 430, 420, 42);

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('Customer Username:', 390, 325);
      ctx.fillText('Password:', 390, 415);

      // Login Button
      ctx.fillStyle = '#0284c7';
      if (ctx.roundRect) {
        ctx.roundRect(390, 520, 420, 48, 8);
        ctx.fill();
      } else {
        ctx.fillRect(390, 520, 420, 48);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Login to Personal NetBanking', 480, 550);

      // RBI notice
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Authorized and regulated by the Reserve Bank of India.', 460, 620);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'genuine_sbi_portal_simulation.png', { type: 'image/png' });
        handleFileSelect(file);
      }, 'image/png');

    } else {
      // Blank Canvas (No identifiable typography)
      ctx.fillStyle = '#1e293b';
      ctx.font = '16px monospace';
      ctx.fillText('Blank Screenshot Canvas (No Readable Typography)', 400, 375);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'blank_canvas_simulation.png', { type: 'image/png' });
        handleFileSelect(file);
      }, 'image/png');
    }
  };

  // Keyboard navigation for tab list
  const handleTabKeyDown = (e, currentTab) => {
    const tabs = ['threats', 'urls', 'brands', 'indicators', 'ocr'];
    const currentIndex = tabs.indexOf(currentTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      setActiveTab(nextTab);
      const nextBtn = document.getElementById(`tab-${nextTab}`);
      if (nextBtn) nextBtn.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      setActiveTab(prevTab);
      const prevBtn = document.getElementById(`tab-${prevTab}`);
      if (prevBtn) prevBtn.focus();
    }
  };

  // Accessible Risk Badge Component (Dual indicator: Icon + Text)
  const renderRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#FEF2F2] text-rose-200 border border-rose-600 flex items-center gap-1.5 shadow-sm shadow-rose-900/50"
            role="status"
            aria-label="Critical Phishing Threat"
          >
            <AlertOctagon className="w-4 h-4 text-[#991B1B] shrink-0" aria-hidden="true" />
            <span>CRITICAL PHISHING THREAT</span>
          </span>
        );
      case 'HIGH':
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#FFFBEB] text-amber-200 border border-amber-600 flex items-center gap-1.5 shadow-sm shadow-amber-900/50"
            role="status"
            aria-label="High Risk Phishing"
          >
            <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" aria-hidden="true" />
            <span>HIGH RISK PHISHING</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-yellow-950/70 text-yellow-200 border border-yellow-600 flex items-center gap-1.5"
            role="status"
            aria-label="Medium Risk Caution"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
            <span>MEDIUM RISK (CAUTION)</span>
          </span>
        );
      case 'LOW':
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-slate-900 text-[#0F172A] border border-slate-700 flex items-center gap-1.5"
            role="status"
            aria-label="Low Risk Informational"
          >
            <ShieldCheck className="w-4 h-4 text-[#475569] shrink-0" aria-hidden="true" />
            <span>LOW RISK / INFORMATIONAL</span>
          </span>
        );
      case 'SAFE':
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#ECFDF5] text-emerald-200 border border-emerald-600 flex items-center gap-1.5 shadow-sm shadow-emerald-900/50"
            role="status"
            aria-label="Authentic Verified Portal"
          >
            <ShieldCheck className="w-4 h-4 text-[#065F46] shrink-0" aria-hidden="true" />
            <span>AUTHENTIC VERIFIED PORTAL</span>
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return (
          <span
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-[#334155] border border-slate-700 flex items-center gap-1.5"
            role="status"
            aria-label="Insufficient Typography / Unconfirmed"
          >
            <HelpCircle className="w-4 h-4 text-[#0F172A] shrink-0" aria-hidden="true" />
            <span>INSUFFICIENT EVIDENCE</span>
          </span>
        );
    }
  };

  // Safe formatting for risk score: strictly prevents rendering null as 0%
  const formatRiskScore = (score) => {
    if (score === null || score === undefined) {
      return 'N/A (Insufficient Typography)';
    }
    return `${score}%`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Announcement Notification (Screen reader accessible) */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 pointer-events-none"
      >
        {toastMessage && (
          <div className="bg-[#F8FAFC] border border-cyan-500/60 shadow-xl shadow-cyan-950/40 text-[#0F172A] text-xs font-mono px-4 py-3 rounded-lg flex items-center gap-2 pointer-events-auto animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#065F46] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot Full Resolution Preview"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-xs font-mono text-[#334155]">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0F172A]" />
              <span>Full Resolution Inspection ({selectedFile?.name})</span>
              {imageDimensions && (
                <span className="text-[#64748B]">
                  [{imageDimensions.width} × {imageDimensions.height} px]
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-800 text-[#475569] hover:text-white border border-[#E2E8F0]"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-5xl max-h-[85vh] overflow-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="High resolution screenshot target"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded"
            />
          </div>
          <p className="text-[11px] font-mono text-[#64748B] pt-3">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[#334155] border border-slate-700">ESC</kbd> or click Close to return.
          </p>
        </div>
      )}

      {/* 1. Header & Architecture Notice */}
      <div className="cyber-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0F172A] mb-1">
              <ShieldAlert className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                Screenshot Phishing Threat Intelligence Console (Phase 5E)
              </h2>
            </div>
            <p className="text-xs text-[#475569]">
              Multimodal static security pipeline: Combines EasyOCR typography detection, candidate URL lexical repair, Random Forest phishing classification, TreeSHAP feature explanations, and 25+ Indian banking brand cross-verifications.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-[#065F46] border border-emerald-500/30 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#065F46]" />
              <span>Zero-Socket Static Analysis</span>
            </span>
          </div>
        </div>

        {/* Security Sandbox Callout */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start space-x-3 text-xs text-[#334155]">
          <ShieldCheck className="w-4 h-4 text-[#0F172A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-[#0F172A] font-bold uppercase text-[11px] block">
              Safe In-Memory Threat Evaluation Guarantee
            </span>
            <p className="text-[#475569] leading-relaxed text-[11px]">
              PhishShield evaluates all screenshots within isolated, in-memory buffers. Discovered URLs and embedded links are never opened, resolved, or connected to external networks. Extracted text is treated as untrusted input and analyzed entirely through local offline machine learning models.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Upload Zone or Preview Panel */}
      <div className="cyber-card p-5 sm:p-6 space-y-5">
        {!previewUrl ? (
          <div>
            {/* Upload Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload banking screenshot or phishing image"
              className={`p-8 sm:p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 ${isDragging
                  ? 'border-[#0F172A] bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]/50 bg-white'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white font-mono">
                  Drag and drop screenshot of suspicious portal, SMS, or app lure
                </h3>
                <p className="text-xs text-[#475569]">
                  or <span className="text-[#0F172A] font-semibold underline">browse local files</span> from your system
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-[#64748B]">
                <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  Formats: PNG, JPG, JPEG, WEBP
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  Max Size: 5.0 MB
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  Max Dim: 4096×4096 px
                </span>
              </div>
            </div>

            {/* In-Browser Synthetic Threat Simulations */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-semibold">
                  Or Test with In-Browser Synthetic Threat Simulations:
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">Zero-download live generators</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSyntheticTest('SBI_PHISHING_CLONE')}
                  className="p-3 rounded-lg bg-[#F8FAFC] border border-rose-900/40 hover:border-rose-500/60 hover:bg-[#F1F5F9] text-left transition-all group focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <span className="text-xs font-semibold text-[#991B1B] group-hover:text-rose-200 block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                    <span>SBI Fake KYC Phishing Clone</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#475569] mt-1 block">
                    Corrupted Scheme ('https:II') + OTP demand + Untrusted Domain (.top)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateSyntheticTest('GENUINE_SBI_PORTAL')}
                  className="p-3 rounded-lg bg-[#F8FAFC] border border-emerald-900/40 hover:border-emerald-500/60 hover:bg-[#F1F5F9] text-left transition-all group focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <span className="text-xs font-semibold text-[#065F46] group-hover:text-emerald-200 block flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                    <span>Genuine SBI NetBanking Portal</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#475569] mt-1 block">
                    Zero-Trust Verified Domain (.sbi) + Legitimate Safety Advisory
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateSyntheticTest('BLANK')}
                  className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] text-left transition-all group focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <span className="text-xs font-semibold text-[#334155] group-hover:text-[#0F172A] block flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#475569] shrink-0" />
                    <span>Blank / Ambiguous Canvas</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#475569] mt-1 block">
                    Validates INSUFFICIENT_EVIDENCE handling gracefully
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview & Interactive Analysis Controls */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-[#0F172A] shrink-0" />
                <span className="text-xs font-bold font-mono text-white uppercase tracking-wider shrink-0">
                  Target Image Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] truncate" title={selectedFile?.name}>
                  {selectedFile?.name}
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="cyber-btn-secondary text-xs px-2.5 py-1 text-[#334155] hover:text-[#0F172A] flex items-center gap-1.5"
                  title="Expand to full resolution"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Full Size</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isProcessing || isExtractingOcr || isAnalyzingThreats}
                  className="cyber-btn-secondary text-xs px-2.5 py-1 text-[#475569] hover:text-[#991B1B] flex items-center gap-1.5"
                  title="Remove image and select another"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>
              </div>
            </div>

            {/* Preview Box & Analysis Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div
                className="lg:col-span-2 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] relative group flex items-center justify-center p-2 min-h-[260px] max-h-[380px] cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view full resolution"
              >
                <img
                  src={previewUrl}
                  alt="Target screenshot for threat analysis"
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-lg bg-[#F8FAFC]/90 border border-[#CBD5E1] text-[#0F172A] text-xs font-mono flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Click to Zoom</span>
                  </span>
                </div>
              </div>

              {/* Action & Metadata Box */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-[#475569] font-bold block border-b border-[#E2E8F0] pb-2">
                    Security Validation Parameters
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-[#475569]">
                      <span>Target File:</span>
                      <span className="text-white font-bold truncate max-w-[150px]" title={selectedFile?.name}>
                        {selectedFile?.name}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#475569]">
                      <span>File Size:</span>
                      <span className="text-[#0F172A] font-bold">
                        {(selectedFile?.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {imageDimensions && (
                      <div className="flex justify-between text-[#475569]">
                        <span>Dimensions:</span>
                        <span className="text-[#0F172A] font-bold">
                          {imageDimensions.width} × {imageDimensions.height} px
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#475569]">
                      <span>Format Check:</span>
                      <span className="text-[#065F46] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid Magic Signature</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeThreats}
                    disabled={isProcessing || isExtractingOcr || isAnalyzingThreats}
                    className="cyber-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    {isAnalyzingThreats ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#07090e]" />
                        <span className="font-bold">Analyzing Multimodal Threats...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span className="font-bold">Analyze Screenshot Threats (Phase 5C/5E)</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExtractOcr}
                      disabled={isProcessing || isExtractingOcr || isAnalyzingThreats}
                      className="cyber-btn-secondary py-2 text-[11px] flex items-center justify-center gap-1.5 text-[#334155] hover:text-white"
                      title="Run EasyOCR typography extraction only"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>OCR Only (5B)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadAndProcess}
                      disabled={isProcessing || isExtractingOcr || isAnalyzingThreats}
                      className="cyber-btn-secondary py-2 text-[11px] flex items-center justify-center gap-1.5 text-[#334155] hover:text-white"
                      title="Run safe OpenCV pixel normalization only"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Ingest Only (5A)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Polished Multi-Stage Honest Processing State (Task 2) */}
        {(isProcessing || isExtractingOcr || isAnalyzingThreats) && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e17] border border-[#CBD5E1] space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#0F172A] animate-spin" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Static Security Pipeline Active
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#475569]">
                  Elapsed: <span className="text-[#0F172A] font-bold">{elapsedTime}s</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F8FAFC] text-[#92400E] border border-amber-600/30">
                  Synchronous Local Execution (6–15s typical)
                </span>
              </div>
            </div>

            {/* Indeterminate Animated Scanning Radar Bar */}
            <div className="space-y-1">
              <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden border border-[#E2E8F0] relative">
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 rounded-full animate-pulse opacity-85" />
              </div>
              <p className="text-[11px] font-mono text-[#475569] pt-1">
                {processingStatusText || 'Executing multi-layer threat assessment...'}
              </p>
            </div>

            {/* Informational Pipeline Architecture Stages (Honest client presentation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">1. Ingestion & Sandbox</span>
                <span className="text-[#475569] text-[10px]">Magic headers & OpenCV matrix</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">2. Neural EasyOCR</span>
                <span className="text-[#475569] text-[10px]">CRAFT box & CRNN typography</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">3. Lexical URL Repair</span>
                <span className="text-[#475569] text-[10px]">Fix 'https:II', parse TLDs</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">4. Random Forest & SHAP</span>
                <span className="text-[#475569] text-[10px]">26 structural & lexical features</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">5. Banking Registry</span>
                <span className="text-[#475569] text-[10px]">25+ Indian banks domain checks</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#0F172A] font-bold block">6. Social Engineering NLP</span>
                <span className="text-[#475569] text-[10px]">Urgency, OTP & KYC threat signals</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5 sm:col-span-2">
                <span className="text-[#0F172A] font-bold block">7. Evidence Synthesis</span>
                <span className="text-[#475569] text-[10px]">Multi-factor risk aggregation & defensible guidance</span>
              </div>
            </div>
          </div>
        )}

        {/* Actionable Error Banners with Dismiss Actions */}
        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start justify-between space-x-2.5">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#991B1B] mt-0.5" />
              <div>
                <span className="font-semibold block font-mono text-[11px] uppercase">
                  Image Ingestion Error:
                </span>
                <span className="opacity-95">{error}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-[#991B1B] hover:text-rose-200 text-xs font-mono shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {ocrError && (
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start justify-between space-x-2.5">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#991B1B] mt-0.5" />
              <div>
                <span className="font-semibold block font-mono text-[11px] uppercase">
                  OCR Engine Exception:
                </span>
                <span className="opacity-95">{ocrError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOcrError(null)}
              className="text-[#991B1B] hover:text-rose-200 text-xs font-mono shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {threatError && (
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start justify-between space-x-2.5">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#991B1B] mt-0.5" />
              <div>
                <span className="font-semibold block font-mono text-[11px] uppercase">
                  Threat Pipeline Analysis Error:
                </span>
                <span className="opacity-95">{threatError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setThreatError(null)}
              className="text-[#991B1B] hover:text-rose-200 text-xs font-mono shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 3. Comprehensive Screenshot Threat Dossier (Phase 5C / 5E) */}
      {threatReport && (
        <div className="cyber-card p-5 sm:p-6 border-[#CBD5E1] space-y-6 bg-white animate-fadeIn">
          {/* Top Dossier Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-[#0F172A]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Screenshot Phishing Threat Assessment Dossier
                </h3>
              </div>
              <span className="text-[11px] text-[#475569] font-mono block">
                Session ID: {threatReport.upload_id} • Analyzed: {threatReport.analyzed_at}
              </span>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-2">
              {renderRiskBadge(threatReport.screenshot_assessment?.risk_level)}
              <button
                type="button"
                onClick={handleCopyReport}
                className="cyber-btn-secondary text-[11px] px-2.5 py-1 text-[#334155] hover:text-[#0F172A] flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Copy entire markdown threat intelligence report"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#065F46]" />
                    <span className="text-[#065F46]">Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Report</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(threatReport, null, 2)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `phishshield-threat-report-${threatReport.upload_id || 'scan'}.json`;
                  a.click();
                }}
                className="cyber-btn-secondary text-[11px] px-2.5 py-1 text-[#334155] hover:text-[#0F172A] flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Download full JSON threat intelligence dossier"
              >
                <Download className="w-3.5 h-3.5 text-[#0F172A]" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Core Threat Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Calibrated Risk Score</span>
              <span className="text-sm font-bold mt-0.5 block text-white">
                {formatRiskScore(threatReport.screenshot_assessment?.risk_score)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Extracted URLs</span>
              <span className="text-[#0F172A] font-bold text-sm mt-0.5 block">
                {threatReport.extracted_urls?.length || 0} Candidates
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Brand Matches</span>
              <span className="text-[#92400E] font-bold text-sm mt-0.5 block">
                {threatReport.bank_brand_evidence?.length || 0} Detected
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Social Eng. Signals</span>
              <span className="text-[#991B1B] font-bold text-sm mt-0.5 block">
                {threatReport.social_engineering_indicators?.length || 0} Patterns
              </span>
            </div>
          </div>

          {/* Executive Summary Banner (Task 3) */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${threatReport.screenshot_assessment?.risk_level === 'CRITICAL'
                ? 'bg-[#FEF2F2] border-rose-600/80 text-rose-100'
                : threatReport.screenshot_assessment?.risk_level === 'HIGH'
                  ? 'bg-[#FFFBEB] border-amber-600/80 text-amber-100'
                  : threatReport.screenshot_assessment?.risk_level === 'MEDIUM'
                    ? 'bg-yellow-950/30 border-yellow-600/60 text-yellow-100'
                    : threatReport.screenshot_assessment?.risk_level === 'INSUFFICIENT_EVIDENCE'
                      ? 'bg-slate-900/70 border-cyan-500/50 text-[#0F172A]'
                      : threatReport.screenshot_assessment?.risk_level === 'LOW'
                        ? 'bg-slate-900/60 border-slate-700 text-[#0F172A]'
                        : 'bg-[#ECFDF5] border-emerald-600/80 text-emerald-100'
              }`}
          >
            {threatReport.screenshot_assessment?.risk_level === 'CRITICAL' ? (
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-[#991B1B]" />
            ) : threatReport.screenshot_assessment?.risk_level === 'HIGH' ||
              threatReport.screenshot_assessment?.risk_level === 'MEDIUM' ? (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#92400E]" />
            ) : threatReport.screenshot_assessment?.risk_level === 'INSUFFICIENT_EVIDENCE' ? (
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#0F172A]" />
            ) : (
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#065F46]" />
            )}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs uppercase tracking-wide block text-white">
                  Executive Threat Assessment Summary
                </span>
                <span className="text-[10px] font-mono opacity-80">
                  Confidence: <span className="font-bold uppercase">{threatReport.screenshot_assessment?.confidence || 'normal'}</span>
                </span>
              </div>
              <p className="leading-relaxed opacity-95">
                {threatReport.screenshot_assessment?.summary}
              </p>

              {/* Key Threat Factors tags */}
              {threatReport.screenshot_assessment?.key_threat_factors?.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {threatReport.screenshot_assessment.key_threat_factors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Incident Response Protocol Callout (Task 6) */}
          {(threatReport.screenshot_assessment?.risk_level === 'CRITICAL' ||
            threatReport.screenshot_assessment?.risk_level === 'HIGH' ||
            threatReport.social_engineering_indicators?.some(
              (i) => i.category === 'credential_harvesting' || i.category === 'otp_interception'
            )) && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-mono space-y-3">
                <div className="flex items-center space-x-2 text-[#991B1B]">
                  <LifeBuoy className="w-4 h-4 text-[#991B1B]" />
                  <span className="font-bold uppercase tracking-wider text-xs">
                    Urgent Indian Cybercrime Incident Response Protocol
                  </span>
                </div>
                <p className="text-[#334155] text-[11px] leading-relaxed">
                  If credentials, passwords, or OTPs were entered into this portal, take immediate defensive measures:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-rose-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#991B1B] font-bold">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial 1930 Helpline</span>
                    </div>
                    <p className="text-[#475569] text-[10px]">
                      National Cyber Financial Fraud Hotline (operated by I4C / MHA).
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-rose-900/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>cybercrime.gov.in</span>
                    </div>
                    <p className="text-[#475569] text-[10px]">
                      Register incident report on the official Government portal.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-rose-900/50 space-y-1">
                    <span className="text-[#92400E] font-bold block">Freeze Banking Channels</span>
                    <p className="text-[#475569] text-[10px]">
                      Call bank emergency number to lock netbanking, UPI, and debit cards immediately.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-rose-900/50 space-y-1">
                    <span className="text-[#065F46] font-bold block">Reset Credentials</span>
                    <p className="text-[#475569] text-[10px]">
                      Update netbanking and UPI passwords from a separate, clean device.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Navigation Tabs for Deep Dive Evidence (Task 4 & 8) */}
          <div
            ref={tabsListRef}
            role="tablist"
            aria-label="Threat Evidence Dossier Sections"
            className="flex border-b border-[#E2E8F0] space-x-1 sm:space-x-2 text-xs font-mono overflow-x-auto pb-1"
          >
            <button
              id="tab-threats"
              role="tab"
              aria-selected={activeTab === 'threats'}
              aria-controls="panel-threats"
              tabIndex={activeTab === 'threats' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'threats')}
              type="button"
              onClick={() => setActiveTab('threats')}
              className={`pb-2 px-3 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-t ${activeTab === 'threats'
                  ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              Threat Signals ({threatReport.evidence?.length || 0})
            </button>

            <button
              id="tab-urls"
              role="tab"
              aria-selected={activeTab === 'urls'}
              aria-controls="panel-urls"
              tabIndex={activeTab === 'urls' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'urls')}
              type="button"
              onClick={() => setActiveTab('urls')}
              className={`pb-2 px-3 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-t ${activeTab === 'urls'
                  ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              Extracted URLs ({threatReport.extracted_urls?.length || 0})
            </button>

            <button
              id="tab-brands"
              role="tab"
              aria-selected={activeTab === 'brands'}
              aria-controls="panel-brands"
              tabIndex={activeTab === 'brands' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'brands')}
              type="button"
              onClick={() => setActiveTab('brands')}
              className={`pb-2 px-3 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-t ${activeTab === 'brands'
                  ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              Bank Brands ({threatReport.bank_brand_evidence?.length || 0})
            </button>

            <button
              id="tab-indicators"
              role="tab"
              aria-selected={activeTab === 'indicators'}
              aria-controls="panel-indicators"
              tabIndex={activeTab === 'indicators' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'indicators')}
              type="button"
              onClick={() => setActiveTab('indicators')}
              className={`pb-2 px-3 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-t ${activeTab === 'indicators'
                  ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              Social Engineering ({threatReport.social_engineering_indicators?.length || 0})
            </button>

            <button
              id="tab-ocr"
              role="tab"
              aria-selected={activeTab === 'ocr'}
              aria-controls="panel-ocr"
              tabIndex={activeTab === 'ocr' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'ocr')}
              type="button"
              onClick={() => setActiveTab('ocr')}
              className={`pb-2 px-3 transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-t ${activeTab === 'ocr'
                  ? 'border-b-2 border-[#0F172A] text-[#0F172A] font-bold'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              Raw Typography ({threatReport.ocr_summary?.text_block_count || 0})
            </button>
          </div>

          {/* TAB 1: Evidence List & Recommendations */}
          {activeTab === 'threats' && (
            <div
              id="panel-threats"
              role="tabpanel"
              aria-labelledby="tab-threats"
              className="space-y-4"
            >
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono uppercase text-[#475569] font-bold block">
                  Identified Threat Signals & Evidence Log
                </span>

                {threatReport.evidence && threatReport.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {threatReport.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border text-xs font-mono flex items-start space-x-3 ${ev.severity === 'CRITICAL'
                            ? 'bg-[#FEF2F2] border-[#FECACA] text-rose-200'
                            : ev.severity === 'HIGH'
                              ? 'bg-[#FFFBEB] border-[#FDE68A] text-amber-200'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                          }`}
                      >
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 bg-[#F8FAFC] border border-[#E2E8F0]">
                          {ev.severity}
                        </span>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="text-white font-bold block">{ev.title}</span>
                          <p className="text-[11px] opacity-90 leading-relaxed">
                            {ev.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] font-mono">
                    Zero high-severity coercive threat markers were identified in this screenshot.
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0F172A] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0F172A]" />
                  <span>Actionable Defensive Recommendations</span>
                </span>

                <ul className="space-y-2 text-xs font-mono text-[#334155] list-disc list-inside">
                  {(threatReport.recommendations || []).map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Extracted URLs & Defensive UX (Task 5) */}
          {activeTab === 'urls' && (
            <div
              id="panel-urls"
              role="tabpanel"
              aria-labelledby="tab-urls"
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-[#475569] font-bold block">
                  Extracted URL Candidates & Offline Model Predictions ({threatReport.extracted_urls?.length || 0})
                </span>

                {/* Defanged View Toggle & Security Guarantee Notice */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setDefangUrls(!defangUrls)}
                    className="cyber-btn-secondary text-[11px] px-2.5 py-1 flex items-center gap-1.5 text-[#0F172A] hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    title="Toggle safe defanged display (hxxps://, [.])"
                  >
                    {defangUrls ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-[#0F172A]" />
                        <span>Defanged View Active (hxxps://)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#475569]" />
                        <span>Raw URL View</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security Warning: Links are never clickable */}
              <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-amber-600/30 text-[11px] font-mono text-[#92400E]/90 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-[#92400E]" />
                <span>
                  Defensive Policy: Detected URLs are rendered as safe code blocks and are NEVER clickable.
                </span>
              </div>

              {threatReport.extracted_urls && threatReport.extracted_urls.length > 0 ? (
                <div className="space-y-3">
                  {threatReport.extracted_urls.map((cand, idx) => {
                    const uRes = cand.url_scan_result;
                    const bRes = cand.brand_analysis;
                    const shapExp = uRes?.shap_explanation;
                    const displayUrl = defangUrls ? defangUrlString(cand.normalized_url) : cand.normalized_url;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-cyan-500/30 transition-all space-y-3 text-xs font-mono"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#64748B] uppercase">
                                Candidate #{idx + 1} Normalized Destination:
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">
                                {cand.reconstruction_status}
                              </span>
                            </div>

                            {/* Safe Non-Clickable Code Block */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-[#0F172A] font-bold text-xs sm:text-sm break-all bg-[#F8FAFC] px-2.5 py-1 rounded border border-[#E2E8F0] select-all">
                                {displayUrl}
                              </code>

                              <button
                                type="button"
                                onClick={() => handleCopySingleUrl(cand.normalized_url, idx)}
                                className="cyber-btn-secondary text-[10px] px-2 py-1 text-[#334155] hover:text-white shrink-0"
                                title="Copy candidate URL"
                              >
                                {copiedUrlIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#065F46]" />
                                    <span className="text-[#065F46]">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {cand.original_text !== cand.normalized_url && (
                              <span className="text-[10px] text-[#64748B] block truncate">
                                Raw OCR Text Extracted: "{cand.original_text}"
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                            {uRes && (
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-bold ${uRes.is_phishing
                                    ? 'bg-rose-950 text-[#991B1B] border border-rose-800'
                                    : 'bg-emerald-950 text-[#065F46] border border-emerald-800'
                                  }`}
                              >
                                {uRes.risk_level} ({uRes.risk_score}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ML Model Findings */}
                        {uRes && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                            <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                              <span className="text-[#64748B] block text-[10px]">Model Prediction</span>
                              <span className="text-white font-bold">
                                {uRes.is_phishing ? 'Phishing Classified' : 'Legitimate Classified'}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                              <span className="text-[#64748B] block text-[10px]">Brand Spoofing Check</span>
                              <span className="text-white font-bold">
                                {bRes?.match_type || 'NONE'}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                              <span className="text-[#64748B] block text-[10px]">OCR Confidence</span>
                              <span className="text-[#0F172A] font-bold">
                                {Math.round(cand.ocr_confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* SHAP Explainability Highlights */}
                        {shapExp?.top_positive_contributors?.length > 0 && (
                          <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                            <span className="text-[10px] text-[#475569] block font-bold">
                              Key Random Forest TreeSHAP Phishing Risk Contributors:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {shapExp.top_positive_contributors.slice(0, 4).map((feat, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="px-2 py-0.5 rounded text-[10px] bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                                >
                                  {feat.feature_name} (SHAP: +{feat.shap_value?.toFixed(3)})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#64748B] font-mono">
                  No URL candidates were detected in the typography of this screenshot.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Banking Brand Evidence & Domain Mismatch */}
          {activeTab === 'brands' && (
            <div
              id="panel-brands"
              role="tabpanel"
              aria-labelledby="tab-brands"
              className="space-y-3"
            >
              <span className="text-[10px] font-mono uppercase text-[#475569] font-bold block">
                Indian Banking Registry Cross-Referencing ({threatReport.bank_brand_evidence?.length || 0})
              </span>

              {threatReport.bank_brand_evidence && threatReport.bank_brand_evidence.length > 0 ? (
                <div className="space-y-3">
                  {threatReport.bank_brand_evidence.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border space-y-3 text-xs font-mono ${b.domain_mismatch_detected
                          ? 'bg-[#FEF2F2] border-[#FECACA]'
                          : b.is_official_match
                            ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                        <span className="text-white font-bold text-sm">{b.brand_name}</span>
                        <div className="flex items-center space-x-2">
                          {b.domain_mismatch_detected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-[#991B1B] border border-rose-800">
                              DOMAIN MISMATCH DETECTED
                            </span>
                          ) : b.is_official_match ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-[#065F46] border border-emerald-800">
                              OFFICIAL DOMAIN VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]">
                              TEXT BRAND REFERENCE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mismatch Warning */}
                      {b.domain_mismatch_detected && (
                        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-rose-200 text-[11px] flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{b.mismatch_details}</p>
                        </div>
                      )}

                      {/* Official Domains Registry info */}
                      <div className="text-[11px] space-y-1">
                        <span className="text-[#64748B] block text-[10px]">
                          Official Registered Domains:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(b.official_domains || []).map((dom, dIdx) => (
                            <span
                              key={dIdx}
                              className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] text-[10px]"
                            >
                              {dom}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#64748B] font-mono">
                  No Indian banking brand names or registered institutional keywords detected.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Social Engineering Indicators */}
          {activeTab === 'indicators' && (
            <div
              id="panel-indicators"
              role="tabpanel"
              aria-labelledby="tab-indicators"
              className="space-y-3"
            >
              <span className="text-[10px] font-mono uppercase text-[#475569] font-bold block">
                Social Engineering & Psychological Coercion Patterns ({threatReport.social_engineering_indicators?.length || 0})
              </span>

              {threatReport.social_engineering_indicators && threatReport.social_engineering_indicators.length > 0 ? (
                <div className="space-y-2.5">
                  {threatReport.social_engineering_indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold">{ind.label}</span>
                          <span className="text-[10px] text-[#64748B]">[{ind.category}]</span>
                        </div>
                        <p className="text-[11px] text-[#334155]">
                          Matched evidence: <span className="text-[#0F172A] font-bold">"{ind.matched_text}"</span>
                        </p>
                        <p className="text-[10px] text-[#64748B] leading-relaxed">
                          {ind.explanation}
                        </p>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${ind.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-[#991B1B] border border-rose-800'
                              : ind.severity === 'HIGH'
                                ? 'bg-amber-950 text-[#92400E] border border-amber-800'
                                : ind.severity === 'BENIGN_ADVISORY'
                                  ? 'bg-emerald-950 text-[#065F46] border border-emerald-800'
                                  : 'bg-slate-800 text-[#334155] border border-slate-700'
                            }`}
                        >
                          {ind.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#64748B] font-mono">
                  No social engineering, urgency, or credential theft patterns were detected.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Raw OCR Typography */}
          {activeTab === 'ocr' && (
            <div
              id="panel-ocr"
              role="tabpanel"
              aria-labelledby="tab-ocr"
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#475569] font-bold">
                  Extracted Raw OCR Text Stream ({threatReport.ocr_summary?.text_block_count || 0} Blocks)
                </span>
                <button
                  type="button"
                  onClick={handleCopyOcrText}
                  className="cyber-btn-secondary text-[11px] px-2.5 py-1 text-[#334155] hover:text-[#0F172A] flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {copiedOcrText ? <Check className="w-3.5 h-3.5 text-[#065F46]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOcrText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs text-[#0F172A] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
                {threatReport.ocr_summary?.extracted_text || 'No text extracted from this screenshot.'}
              </div>
            </div>
          )}

          {/* Footer Reset & New Scan */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#475569] font-mono">
            <span>Threat Intelligence Analysis completed in {threatReport.processing_time_ms} ms</span>
            <button
              type="button"
              onClick={handleReset}
              className="cyber-btn-secondary text-xs px-2.5 py-1 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Another Screenshot</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. OCR Only Results Section (Phase 5B fallback when user clicks OCR only) */}
      {!threatReport && ocrResult && (
        <div className="cyber-card p-5 sm:p-6 border-cyan-500/30 space-y-5 bg-white animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F172A]" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                OCR Typography Extraction Dossier (Phase 5B)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAnalyzeThreats}
                className="cyber-btn-primary text-xs px-3 py-1 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Run Full Threat Intelligence Analysis (5C/5E)</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs text-[#0F172A] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {ocrResult.extracted_text || 'No readable text detected.'}
          </div>
        </div>
      )}
    </div>
  );
}
