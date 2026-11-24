/**
 * PhishShield Localization Dictionary - English (Default)
 */
export default {
  // Navigation & Chrome
  nav: {
    console: 'Console',
    overview: 'Overview',
    urlScanner: 'URL Scanner',
    smsScanner: 'SMS Scanner',
    screenshotScanner: 'Screenshot Threat Scanner',
    scanHistory: 'Scan History',
    bankIntel: 'Bank Threat Intel',
    modelInsights: 'Model Insights & SHAP',
    systemDiagnostics: 'System Diagnostics',
    governance: 'Governance & RBAC',
    architecture: 'System Architecture',
    engineOnline: 'Engine: Online',
    engineChecking: 'Engine: Checking',
    engineDegraded: 'Engine: Degraded',
    sandboxNotice: 'Safe Sandbox: URLs are never connected, fetched, or executed over HTTP.',
    zeroTrustActive: 'ZERO-TRUST ACTIVE',
    zeroTrustDesc: 'Strict domain validation against 16 RBI scheduled banks',
    language: 'Language',
    selectLanguage: 'Select Language'
  },

  // Common UI Actions & Badges
  common: {
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    scanSecurity: 'Analyze Security',
    scanning: 'Executing Inference...',
    reset: 'Reset Console',
    copy: 'Copy',
    copied: 'Copied',
    view: 'View',
    download: 'Download',
    downloadPdf: 'Download PDF Dossier',
    downloadJson: 'Download JSON Dossier',
    close: 'Close',
    refresh: 'Refresh',
    ping: 'Ping',
    retry: 'Retry Connection',
    checking: 'Checking...',
    online: 'Online',
    offline: 'Offline',
    details: 'Details',
    status: 'Status',
    timestamp: 'Timestamp',
    target: 'Target',
    type: 'Type',
    actions: 'Actions',
    search: 'Search',
    filter: 'Filter',
    all: 'ALL',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading cybersecurity module...',
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Information',
    learnMore: 'Learn More'
  },

  // Risk Verdicts & Levels
  verdicts: {
    safe: 'Safe',
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
    suspicious: 'Suspicious',
    phishing: 'Phishing',
    legitimate: 'Legitimate',
    official: 'Verified Official',
    impersonation: 'Brand Impersonation',
    unknown: 'Unknown'
  },

  // Directives
  directives: {
    blockAndReport: 'DIRECTIVE: BLOCK AND REPORT',
    doNotEnterCredentials: 'DIRECTIVE: DO NOT ENTER CREDENTIALS',
    proceedWithCaution: 'DIRECTIVE: PROCEED WITH CAUTION',
    safeToProceed: 'DIRECTIVE: SAFE TO PROCEED'
  },

  // Safety Guidance & Recommendations
  safety: {
    noOtp: 'Do not enter your OTP (One-Time Password) on this page or share it with anyone.',
    noUpiPin: 'Do not enter or share your UPI PIN. UPI PIN is only needed to send money, never to receive it.',
    verifyOfficial: 'Always verify the bank’s official website URL before providing banking credentials.',
    impersonationAlert: 'This URL appears to impersonate a legitimate banking institution.',
    noApk: 'Do not download or install unknown APK or application files from unverified links.',
    contactBankOfficial: 'Contact your bank directly through official phone numbers listed on your debit/credit card.',
    cybercrimeHelpline: 'Report cyber financial fraud immediately to helpline 1930 or visit cybercrime.gov.in.',
    noPasswordShare: 'Legitimate banks never request passwords, ATM PINs, CVV, or OTP over SMS or email.',
    forwardSpam1909: 'Forward suspicious fraud SMS to 1909 (TRAI Spam Reporting).',
    verifyDomain: 'Always inspect the top-level domain carefully. Attackers often use lookalike domains.'
  },

  // Dashboard / Overview
  dashboard: {
    totalScans: 'Total Scans',
    totalScansSub: 'Persistent SQLite audit logs',
    phishingDetected: 'Phishing Detected',
    detectionRate: 'detection rate',
    brandImpersonations: 'Brand Impersonations',
    targetingBanks: 'Targeting Indian banks',
    safeVerified: 'Safe Verified',
    safeVerifiedSub: 'Canonical banking whitelist',
    quickScanTitle: 'Analyze URL & Banking Brand Legitimacy',
    quickScanSubtitle: 'Extracts 26 structural features, verifies registered apex domains, executes Damerau-Levenshtein distance checks against canonical Indian banks, and calculates inference probabilities.',
    quickScanPlaceholder: 'Paste suspicious banking URL (e.g. http://onlinesbi.co-verify.in)...',
    quickScanButton: 'Analyze URL',
    testVectors: 'TEST VECTORS:',
    fakeSbiTitle: 'Fake SBI KYC Update',
    fakeHdfcTitle: 'Fake HDFC Points Claim',
    officialIciciTitle: 'Official ICICI NetBanking',
    systemDiagnostics: 'System Diagnostics',
    inferenceEngine: 'Inference Engine',
    sqliteStorage: 'SQLite Storage',
    registry: 'Registry',
    rbiBanks: '16 RBI Banks',
    attackVectorDist: 'Attack Vector Distribution',
    telemetryStore: 'Telemetry Store',
    noHistoryYet: 'No historical threat distribution recorded yet',
    recentScans: 'Recent Security Scans',
    viewAllHistory: 'View Complete Audit Trail',
    protectedRegistry: 'Protected Indian Banking Registry',
    protectedRegistryDesc: 'canonical institutions actively guarded against typosquatting & impersonation.',
    exploreAllBanks: 'Explore All Banks'
  },

  // URL Scanner
  urlScan: {
    title: 'URL Phishing Scanner',
    subtitle: 'Zero-Trust Indian Banking Brand Protection & Random Forest Inference',
    inputPlaceholder: 'Enter or paste suspicious URL (e.g. http://onlinesbi-pan-kyc-verification.com/login.php)...',
    evaluatedTarget: 'Evaluated Target',
    calibratedScore: 'Calibrated Threat Score',
    zeroTrustMetric: 'Zero-Trust Metric',
    modelProb: 'Model Output Prob',
    priorBase: 'Prior Base Value',
    brandImpersonation: 'Brand Impersonation',
    brandAnalysis: 'Brand Analysis',
    targetBrand: 'Target Brand',
    technique: 'Technique',
    officialDomain: 'Official Domain',
    zeroTrustStatus: 'Zero-Trust Match',
    shapTitle: 'TreeSHAP Feature Attributions',
    shapSubtitle: 'Mathematically explainable feature attribution towards phishing probability.',
    featuresTitle: 'Extracted Structural & Lexical Features (26)',
    presetTargets: 'Preset Targets & Banking Test Vectors:',
    clickToPopulate: 'Click to instantly populate and run scan',
    exportPdf: 'Export Forensic PDF Dossier',
    exportJson: 'Export JSON',
    safeNotice: 'No malicious brand spoofing or anomalous structural features detected.',
    criticalWarning: 'CRITICAL WARNING: This page appears to be a fraudulent clone impersonating a bank. Do not enter netbanking credentials, OTP, or card details.'
  },

  // SMS Scanner
  smsScan: {
    title: 'SMS Smishing Scanner',
    subtitle: 'TF-IDF NLP Keyword Analysis & Embedded Multi-URL Deep Extraction',
    inputPlaceholder: 'Paste suspicious SMS message text (e.g. Dear SBI user, your account is suspended due to pending KYC...)...',
    analyzeButton: 'Analyze SMS Message',
    evaluating: 'Evaluating Message...',
    compositeScore: 'Composite Smishing Score',
    textThreatScore: 'Text NLP Threat Score',
    extractedUrls: 'Embedded URLs Detected',
    detectedKeywords: 'High-Risk Keywords',
    scanExtractedUrls: 'Scan All Extracted URLs',
    noUrlsInSms: 'No URLs detected in SMS text. Clean message body without link-based redirection.',
    sampleMessages: 'Preset SMS Attack Vectors & Financial Lures:',
    warningTitle: 'Smishing Indicator Detected',
    emptyError: 'Please provide an SMS message to evaluate.'
  },

  // Screenshot / OCR Scanner
  screenshotScan: {
    title: 'Screenshot Threat Scanner',
    subtitle: 'Computer Vision, EasyOCR Text Extraction & Visual Impersonation Defense',
    dragDrop: 'Drag and drop banking screenshot here, or click to browse',
    formatsAllowed: 'Supports PNG, JPEG, JPG, WEBP (Max 5.0 MB)',
    processing: 'Processing image...',
    extractingOcr: 'Extracting visual text via OCR...',
    analyzingThreats: 'Analyzing cybersecurity indicators...',
    ocrNotice: 'OCR Engine: EasyOCR runs on English text models. The selected language applies to interface verdicts, threat analysis, and safety directives.',
    ocrSummary: 'OCR Text Summary',
    noTextDetected: 'No legible text detected in uploaded screenshot.',
    extractedUrls: 'Extracted URLs from Screenshot',
    visualBrands: 'Visual Bank Brand Evidence',
    socialIndicators: 'Social Engineering & Urgent Lures',
    emptyUploadError: 'Please select an image file to upload.',
    fileTooLarge: 'File exceeds maximum upload limit of 5.0 MB.',
    invalidFormat: 'Unsupported file extension. Only PNG, JPEG, and WEBP images are accepted.'
  },

  // Scan History & Governance
  history: {
    title: 'Scan History & Forensic Audit Logs',
    subtitle: 'Cryptographically hashed SQLite audit trail for incident analysis & compliance',
    searchPlaceholder: 'Search by URL, SMS text, bank brand, or verdict...',
    filterType: 'Filter Type:',
    filterRisk: 'Filter Risk:',
    allTypes: 'All Types',
    allRisks: 'All Risk Levels',
    totalRecords: 'Total Records',
    noRecords: 'No audit records match your query.',
    downloadReport: 'Download Forensic Dossier'
  },

  // Network & System Alerts
  network: {
    offlineTitle: 'Security Gateway Connection Offline',
    offlineMessage: 'An error occurred while establishing a connection with the PhishShield detection engine. Please check your internet connection and verify that the backend server is running.',
    connectionDiagnostics: 'Connection Diagnostics:',
    retryButton: 'Check Internet & Retry Connection',
    retrying: 'Checking Network Connection...'
  }
};
