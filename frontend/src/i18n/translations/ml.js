/**
 * PhishShield Localization Dictionary - Malayalam (മലയാളം)
 */
export default {
  // Navigation & Chrome
  nav: {
    console: 'കൺസോൾ',
    overview: 'അവലോകനം',
    urlScanner: 'URL സ്കാനർ',
    smsScanner: 'SMS സ്കാനർ',
    screenshotScanner: 'സ്ക്രീൻഷോട്ട് ഭീഷണി സ്കാനർ',
    scanHistory: 'സ്കാൻ ചരിത്രം',
    bankIntel: 'ബാങ്ക് സുരക്ഷാ ഇന്റലിജൻസ്',
    modelInsights: 'മോഡൽ ഉൾക്കാഴ്ചകൾ & SHAP',
    systemDiagnostics: 'സിസ്റ്റം ഡയഗ്നോസ്റ്റിക്സ്',
    governance: 'ഭരണനിർവ്വഹണം & RBAC',
    architecture: 'സിസ്റ്റം ആർക്കിടെക്ചർ',
    engineOnline: 'എഞ്ചിൻ: ഓൺലൈൻ',
    engineChecking: 'എഞ്ചിൻ: പരിശോധിക്കുന്നു',
    engineDegraded: 'എഞ്ചിൻ: വേഗത കുറഞ്ഞു',
    sandboxNotice: 'സുരക്ഷിത സാൻഡ്‌ബോക്സ്: URL-കൾ ഒരിക്കലും HTTP വഴി ബന്ധിപ്പിക്കുകയോ പ്രവർത്തിപ്പിക്കുകയോ ഇല്ല.',
    zeroTrustActive: 'സീറോ-ട്രസ്റ്റ് സജീവം',
    zeroTrustDesc: '16 RBI അംഗീകൃത ബാങ്കുകൾക്കെതിരെയുള്ള കർശനമായ ഡൊമെയ്ൻ പരിശോധന',
    language: 'ഭാഷ',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക'
  },

  // Common UI Actions & Badges
  common: {
    analyze: 'വിശകലനം ചെയ്യുക',
    analyzing: 'വിശകലനം ചെയ്യുന്നു...',
    scanSecurity: 'സുരക്ഷ വിശകലനം ചെയ്യുക',
    scanning: 'കണ്ടെത്തൽ പുരോഗമിക്കുന്നു...',
    reset: 'കൺസോൾ റീസെറ്റ് ചെയ്യുക',
    copy: 'പകർപ്പുക',
    copied: 'പകർത്തി',
    view: 'കാണുക',
    download: 'ഡൗൺലോഡ്',
    downloadPdf: 'PDF റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
    downloadJson: 'JSON ഡൗൺലോഡ് ചെയ്യുക',
    close: 'അടയ്ക്കുക',
    refresh: 'പുതുക്കുക',
    ping: 'പിംഗ്',
    retry: 'വീണ്ടും ശ്രമിക്കുക',
    checking: 'പരിശോധിക്കുന്നു...',
    online: 'ഓൺലൈൻ',
    offline: 'ഓഫ്‌ലൈൻ',
    details: 'വിശദാംശങ്ങൾ',
    status: 'നില',
    timestamp: 'സമയമുദ്ര',
    target: 'ലക്ഷ്യം',
    type: 'തരം',
    actions: 'നടപടികൾ',
    search: 'തിരയുക',
    filter: 'ഫിൽട്ടർ',
    all: 'എല്ലാം',
    yes: 'അതെ',
    no: 'അല്ല',
    loading: 'സൈബർ സുരക്ഷാ മൊഡ്യൂൾ ലോഡ് ചെയ്യുന്നു...',
    error: 'പിശക്',
    warning: 'മുന്നറിയിപ്പ്',
    success: 'വിജയം',
    info: 'വിവരം',
    learnMore: 'കൂടുതൽ അറിയുക'
  },

  // Risk Verdicts & Levels
  verdicts: {
    safe: 'സുരക്ഷിതം',
    low: 'കുറഞ്ഞ അപകടസാധ്യത',
    medium: 'മിതമായ അപകടസാധ്യത',
    high: 'ഉയർന്ന അപകടസാധ്യത',
    critical: 'ഗുരുതരമായ അപകടസാധ്യത',
    suspicious: 'സംശയാസ്പദം',
    phishing: 'ഫിഷിംഗ് തട്ടിപ്പ്',
    legitimate: 'യഥാർത്ഥം',
    official: 'സ്ഥിരീകരിച്ച ഔദ്യോഗിക സൈറ്റ്',
    impersonation: 'ബാങ്ക് വ്യാജപതിപ്പ്',
    unknown: 'അജ്ഞാതം'
  },

  // Directives
  directives: {
    blockAndReport: 'നിർദ്ദേശം: ബ്ലോക്ക് ചെയ്ത് റിപ്പോർട്ട് ചെയ്യുക',
    doNotEnterCredentials: 'നിർദ്ദേശം: ലോഗിൻ വിവരങ്ങൾ നൽകരുത്',
    proceedWithCaution: 'നിർദ്ദേശം: ജാഗ്രതയോടെ മുന്നോട്ട് പോകുക',
    safeToProceed: 'നിർദ്ദേശം: സുരക്ഷിതമായി തുടരാം'
  },

  // Safety Guidance & Recommendations
  safety: {
    noOtp: 'നിങ്ങളുടെ OTP (വൺ ടൈം പാസ്‌വേഡ്) ഈ പേജിൽ നൽകുകയോ ആരുമായും പങ്കിടുകയോ ചെയ്യരുത്.',
    noUpiPin: 'നിങ്ങളുടെ UPI പിൻ നൽകുകയോ പങ്കിടുകയോ ചെയ്യരുത്. പണം അയയ്ക്കാൻ മാത്രമേ UPI പിൻ ആവശ്യമുള്ളൂ, സ്വീകരിക്കാനല്ല.',
    verifyOfficial: 'ബാങ്കിംഗ് വിവരങ്ങൾ നൽകുന്നതിന് മുമ്പ് എപ്പോഴും ബാങ്കിന്റെ ഔദ്യോഗിക വെബ്സൈറ്റ് URL പരിശോധിക്കുക.',
    impersonationAlert: 'ഈ URL ഒരു യഥാർത്ഥ ബാങ്കിംഗ് സ്ഥാപനത്തിന്റെ വ്യാജപതിപ്പായി നിർമ്മിച്ചതാണെന്ന് തോന്നുന്നു.',
    noApk: 'സ്ഥിരീകരിക്കാത്ത ലിങ്കുകളിൽ നിന്ന് അജ്ഞാത APK അല്ലെങ്കിൽ ആപ്ലിക്കേഷൻ ഫയലുകൾ ഡൗൺലോഡ് ചെയ്യുകയോ ഇൻസ്റ്റാൾ ചെയ്യുകയോ ചെയ്യരുത്.',
    contactBankOfficial: 'ഡെബിറ്റ്/ക്രെഡിറ്റ് കാർഡിൽ കാണിച്ചിരിക്കുന്ന ഔദ്യോഗിക നമ്പറുകൾ വഴി നിങ്ങളുടെ ബാങ്കുമായി നേരിട്ട് ബന്ധപ്പെടുക.',
    cybercrimeHelpline: 'സൈബർ സാമ്പത്തിക തട്ടിപ്പുകൾ ഉടൻ തന്നെ 1930 ഹെൽപ്പ്‌ലൈനിലോ cybercrime.gov.in പോർട്ടലിലോ റിപ്പോർട്ട് ചെയ്യുക.',
    noPasswordShare: 'യഥാർത്ഥ ബാങ്കുകൾ ഒരിക്കലും പാസ്‌വേഡ്, എടിഎം പിൻ, സിവിവി അല്ലെങ്കിൽ ഒടിപി എന്നിവ SMS വഴി ആവശ്യപ്പെടില്ല.',
    forwardSpam1909: 'സംശയകരമായ വ്യാജ SMS സന്ദേശങ്ങൾ 1909 (TRAI സ്പാം റിപ്പോർട്ടിംഗ്) നമ്പറിലേക്ക് കൈമാറുക.',
    verifyDomain: 'എപ്പോഴും ഡൊമെയ്ൻ പേര് ശ്രദ്ധാപൂർവ്വം പരിശോധിക്കുക. തട്ടിപ്പുകാർ സാമ്യമുള്ള അക്ഷരങ്ങൾ ഉള്ള വ്യാജ ഡൊമെയ്നുകൾ ഉപയോഗിക്കുന്നു.'
  },

  // Dashboard / Overview
  dashboard: {
    totalScans: 'ആകെ സ്കാനുകൾ',
    totalScansSub: 'സ്ഥിരമായ SQLite ഓഡിറ്റ് രേഖകൾ',
    phishingDetected: 'കണ്ടെത്തിയ ഫിഷിംഗ്',
    detectionRate: 'കണ്ടെത്തൽ നിരക്ക്',
    brandImpersonations: 'ബാങ്ക് വ്യാജപതിപ്പുകൾ',
    targetingBanks: 'ഇന്ത്യൻ ബാങ്കുകളെ ലക്ഷ്യമിട്ടുള്ള ആക്രമണങ്ങൾ',
    safeVerified: 'സുരക്ഷിതമായി സ്ഥിരീകരിച്ചവ',
    safeVerifiedSub: 'അംഗീകൃത ബാങ്കിംഗ് വൈറ്റ്‌ലിസ്റ്റ്',
    quickScanTitle: 'URL & ബാങ്ക് സാധുത വിശകലനം ചെയ്യുക',
    quickScanSubtitle: '26 ഘടനാപരമായ സവിശേഷതകൾ വേർതിരിച്ച്, രജിസ്റ്റർ ചെയ്ത ഡൊമെയ്നുകൾ പരിശോധിച്ച്, വ്യാജ സൈറ്റുകൾ കണ്ടെത്തുന്നു.',
    quickScanPlaceholder: 'സംശയകരമായ ബാങ്കിംഗ് URL ഇവിടെ പേസ്റ്റ് ചെയ്യുക (ഉദാ. http://onlinesbi.co-verify.in)...',
    quickScanButton: 'URL വിശകലനം ചെയ്യുക',
    testVectors: 'ടെസ്റ്റ് വെക്ടറുകൾ:',
    fakeSbiTitle: 'വ്യാജ SBI KYC അപ്ഡേറ്റ്',
    fakeHdfcTitle: 'വ്യാജ HDFC റിവാർഡ് പോയിന്റുകൾ',
    officialIciciTitle: 'ഔദ്യോഗിക ICICI നെറ്റ്ബാങ്കിംഗ്',
    systemDiagnostics: 'സിസ്റ്റം ഡയഗ്നോസ്റ്റിക്സ്',
    inferenceEngine: 'വിശകലന എഞ്ചിൻ',
    sqliteStorage: 'SQLite സംഭരണം',
    registry: 'രജിസ്ട്രി',
    rbiBanks: '16 RBI ബാങ്കുകൾ',
    attackVectorDist: 'ആക്രമണ രീതികളുടെ വിതരണം',
    telemetryStore: 'ടെലിമെട്രി സംഭരണം',
    noHistoryYet: 'ഭീഷണി ചരിത്രമൊന്നും ഇതുവരെ രേഖപ്പെടുത്തിയിട്ടില്ല',
    recentScans: 'സമീപകാല സുരക്ഷാ സ്കാനുകൾ',
    viewAllHistory: 'മുഴുവൻ ഓഡിറ്റ് രേഖകളും കാണുക',
    protectedRegistry: 'സംരക്ഷിത ഇന്ത്യൻ ബാങ്കിംഗ് രജിസ്ട്രി',
    protectedRegistryDesc: 'വ്യാജ ഡൊമെയ്‌നുകളിൽ നിന്നും തട്ടിപ്പുകളിൽ നിന്നും കർശനമായി സംരക്ഷിക്കപ്പെടുന്ന ബാങ്കുകൾ.',
    exploreAllBanks: 'എല്ലാ ബാങ്കുകളും കാണുക'
  },

  // URL Scanner
  urlScan: {
    title: 'URL ഫിഷിംഗ് സ്കാനർ',
    subtitle: 'സീറോ-ട്രസ്റ്റ് ഇന്ത്യൻ ബാങ്ക് ബ്രാൻഡ് സംരക്ഷണവും റാൻഡം ഫോറസ്റ്റ് കണ്ടെത്തലും',
    inputPlaceholder: 'സംശയകരമായ URL നൽകുക (ഉദാ. http://onlinesbi-pan-kyc-verification.com/login.php)...',
    evaluatedTarget: 'വിലയിരുത്തിയ ലക്ഷ്യം',
    calibratedScore: 'കണക്കാക്കിയ ഭീഷണി സ്കോർ',
    zeroTrustMetric: 'സീറോ-ട്രസ്റ്റ് മാനദണ്ഡം',
    modelProb: 'മോഡൽ ഔട്ട്പുട്ട് സംഭാവ്യത',
    priorBase: 'പ്രാഥമിക ബേസ് മൂല്യം',
    brandImpersonation: 'ബാങ്ക് ബ്രാൻഡ് വ്യാജപതിപ്പ്',
    brandAnalysis: 'ബ്രാൻഡ് വിശകലനം',
    targetBrand: 'ലക്ഷ്യമിട്ട ബാങ്ക്',
    technique: 'ആക്രമണ രീതി',
    officialDomain: 'ഔദ്യോഗിക ഡൊമെയ്ൻ',
    zeroTrustStatus: 'സീറോ-ട്രസ്റ്റ് സാമ്യം',
    shapTitle: 'TreeSHAP സവിശേഷത വിശദീകരണങ്ങൾ',
    shapSubtitle: 'ഫിഷിംഗ് സംഭാവ്യതയിലേക്ക് ഗണിതശാസ്ത്രപരമായി വിശദീകരിക്കാവുന്ന സവിശേഷതകളുടെ സംഭാവന.',
    featuresTitle: 'വേർതിരിച്ച ഘടനാപരമായ സവിശേഷതകൾ (26)',
    presetTargets: 'തയ്യാറാക്കിയ ബാങ്കിംഗ് ടെസ്റ്റ് സാമ്പിളുകൾ:',
    clickToPopulate: 'ഉടൻ സ്കാൻ ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക',
    exportPdf: 'പൂർണ്ണമായ PDF റിപ്പോർട്ട് എക്സ്പോർട്ട് ചെയ്യുക',
    exportJson: 'JSON എക്സ്പോർട്ട് ചെയ്യുക',
    safeNotice: 'ഹാനികരമായ ബ്രാൻഡ് വ്യാജപതിപ്പുകളോ അസാധാരണ സവിശേഷതകളോ കണ്ടെത്തിയില്ല.',
    criticalWarning: 'ഗുരുതരമായ മുന്നറിയിപ്പ്: ഈ പേജ് ഒരു ബാങ്കിന്റെ വ്യാജപതിപ്പാണ്. നെറ്റ്ബാങ്കിംഗ് പാസ്‌വേഡ്, OTP അല്ലെങ്കിൽ കാർഡ് വിവരങ്ങൾ നൽകരുത്.'
  },

  // SMS Scanner
  smsScan: {
    title: 'SMS സ്മിഷിംഗ് സ്കാനർ',
    subtitle: 'TF-IDF NLP കീവേഡ് വിശകലനവും ലിങ്ക് പരിശോധനയും',
    inputPlaceholder: 'സംശയകരമായ SMS സന്ദേശം നൽകുക (ഉദാ. പ്രിയ ഉപഭോക്താവേ, KYC ബാക്കിയുള്ളതിനാൽ അക്കൗണ്ട് താൽക്കാലികമായി റദ്ദാക്കി...)...',
    analyzeButton: 'SMS സന്ദേശം വിശകലനം ചെയ്യുക',
    evaluating: 'സന്ദേശം വിലയിരുത്തുന്നു...',
    compositeScore: 'സംയോജിത സ്മിഷിംഗ് സ്കോർ',
    textThreatScore: 'ടെക്സ്റ്റ് ഭീഷണി സ്കോർ',
    extractedUrls: 'കണ്ടെത്തിയ ലിങ്കുകൾ (URLs)',
    detectedKeywords: 'ഉയർന്ന അപകടസാധ്യതയുള്ള വാക്കുകൾ',
    scanExtractedUrls: 'എല്ലാ ലിങ്കുകളും സ്കാൻ ചെയ്യുക',
    noUrlsInSms: 'SMS സന്ദേശത്തിൽ ലിങ്കുകളൊന്നും കണ്ടെത്തിയില്ല.',
    sampleMessages: 'മുൻകൂട്ടി തയ്യാറാക്കിയ SMS ആക്രമണ സാമ്പിളുകൾ:',
    warningTitle: 'സ്മിഷിംഗ് ഭീഷണി സൂചകം കണ്ടെത്തി',
    emptyError: 'വിലയിരുത്താൻ ദയവായി ഒരു SMS സന്ദേശം നൽകുക.'
  },

  // Screenshot / OCR Scanner
  screenshotScan: {
    title: 'സ്ക്രീൻഷോട്ട് ഭീഷണി സ്കാനർ',
    subtitle: 'കംപ്യൂട്ടർ വിഷൻ, EasyOCR ടെക്സ്റ്റ് എക്സ്ട്രാക്ഷൻ & വിഷ്വൽ തട്ടിപ്പ് കണ്ടെത്തൽ',
    dragDrop: 'ബാങ്കിംഗ് സ്ക്രീൻഷോട്ട് ഇവിടെ ഡ്രാഗ് ചെയ്യുക, അല്ലെങ്കിൽ ഫയൽ തിരഞ്ഞെടുക്കുക',
    formatsAllowed: 'PNG, JPEG, JPG, WEBP പിന്തുണയ്ക്കുന്നു (പരമാവധി 5.0 MB)',
    processing: 'ചിത്രം പ്രോസസ്സ് ചെയ്യുന്നു...',
    extractingOcr: 'OCR വഴി ടെക്സ്റ്റ് വേർതിരിക്കുന്നു...',
    analyzingThreats: 'സുരക്ഷാ സൂചകങ്ങൾ വിശകലനം ചെയ്യുന്നു...',
    ocrNotice: 'OCR എഞ്ചിൻ: EasyOCR ഇംഗ്ലീഷ് ടെക്സ്റ്റ് മോഡലുകൾ ഉപയോഗിക്കുന്നു. തിരഞ്ഞെടുത്ത ഭാഷ ഫലങ്ങൾക്കും സുരക്ഷാ നിർദ്ദേശങ്ങൾക്കും ബാധകമാണ്.',
    ocrSummary: 'OCR ടെക്സ്റ്റ് സംഗ്രഹം',
    noTextDetected: 'അപ്‌ലോഡ് ചെയ്ത സ്ക്രീൻഷോട്ടിൽ വ്യക്തമായ ടെക്സ്റ്റ് ഒന്നും കണ്ടെത്തിയില്ല.',
    extractedUrls: 'സ്ക്രീൻഷോട്ടിൽ നിന്ന് കണ്ടെത്തിയ URLകൾ',
    visualBrands: 'വിഷ്വൽ ബാങ്ക് ബ്രാൻഡ് തെളിവുകൾ',
    socialIndicators: 'സോഷ്യൽ എഞ്ചിനീയറിംഗ് & അടിയന്തിര പ്രലോഭനങ്ങൾ',
    emptyUploadError: 'ദയവായി അപ്‌ലോഡ് ചെയ്യാൻ ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക.',
    fileTooLarge: 'ഫയൽ പരമാവധി പരിധിയായ 5.0 MB കവിയുന്നു.',
    invalidFormat: 'പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്. PNG, JPEG, WEBP ചിത്രങ്ങൾ മാത്രമേ അനുവദിക്കൂ.'
  },

  // Scan History & Governance
  history: {
    title: 'സ്കാൻ ചരിത്രവും ഓഡിറ്റ് രേഖകളും',
    subtitle: 'സംഭവ വിശകലനത്തിനായുള്ള ക്രിപ്റ്റോഗ്രാഫിക് SQLite ഓഡിറ്റ് ട്രയൽ',
    searchPlaceholder: 'URL, SMS, ബാങ്ക് പേര് അല്ലെങ്കിൽ ഫലം ഉപയോഗിച്ച് തിരയുക...',
    filterType: 'തരം ഫിൽട്ടർ:',
    filterRisk: 'അപകട നില:',
    allTypes: 'എല്ലാ തരങ്ങളും',
    allRisks: 'എല്ലാ നിലകളും',
    totalRecords: 'ആകെ രേഖകൾ',
    noRecords: 'നിങ്ങളുടെ തിരയലിന് അനുയോജ്യമായ രേഖകളൊന്നും കണ്ടെത്തിയില്ല.',
    downloadReport: 'സുരക്ഷാ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക'
  },

  // Network & System Alerts
  network: {
    offlineTitle: 'സെക്യൂരിറ്റി ഗേറ്റ്‌വേ കണക്ഷൻ ഓഫ്‌ലൈനിലാണ്',
    offlineMessage: 'PhishShield ഡിറ്റക്ഷൻ എഞ്ചിനുമായി ബന്ധം സ്ഥാപിക്കുന്നതിൽ പിശക് സംഭവിച്ചു. നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷനും ബാക്കെൻഡ് സെർവറും പരിശോധിക്കുക.',
    connectionDiagnostics: 'കണക്ഷൻ ഡയഗ്നോസ്റ്റിക്സ്:',
    retryButton: 'ഇന്റർനെറ്റ് പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക',
    retrying: 'നെറ്റ്‌വർക്ക് കണക്ഷൻ പരിശോധിക്കുന്നു...'
  }
};
