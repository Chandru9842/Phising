/**
 * PhishShield Localization Dictionary - Telugu (తెలుగు)
 */
export default {
  // Navigation & Chrome
  nav: {
    console: 'కన్సోల్',
    overview: 'అవలోకనం',
    urlScanner: 'URL స్కానర్',
    smsScanner: 'SMS స్కానర్',
    screenshotScanner: 'స్క్రీన్‌షాట్ ముప్పు స్కానర్',
    scanHistory: 'స్కాన్ చరిత్ర',
    bankIntel: 'బ్యాంక్ ముప్పు సమాచారం',
    modelInsights: 'మోడల్ అంతర్దృష్టులు & SHAP',
    systemDiagnostics: 'సిస్టమ్ డయాగ్నస్టిక్స్',
    governance: 'గవర్నెన్స్ & RBAC',
    architecture: 'సిస్టమ్ ఆర్కిటెక్చర్',
    engineOnline: 'ఇంజిన్: ఆన్‌లైన్',
    engineChecking: 'ఇంజిన్: తనిఖీ చేస్తోంది',
    engineDegraded: 'ఇంజిన్: మందగించింది',
    sandboxNotice: 'సురక్షిత శాండ్‌బాక్స్: URLలు ఎప్పటికీ HTTP ద్వారా కనెక్ట్ చేయబడవు లేదా అమలు చేయబడవు.',
    zeroTrustActive: 'జీరో-ట్రస్ట్ క్రియాశీలకం',
    zeroTrustDesc: '16 RBI గుర్తింపు పొందిన బ్యాంకులపై కఠినమైన డొమైన్ ధృవీకరణ',
    language: 'భాష',
    selectLanguage: 'భాషను ఎంచుకోండి'
  },

  // Common UI Actions & Badges
  common: {
    analyze: 'విశ్లేషించు',
    analyzing: 'విశ్లేషిస్తోంది...',
    scanSecurity: 'భద్రతను విశ్లేషించండి',
    scanning: 'ఇన్ఫరెన్స్ అమలవుతోంది...',
    reset: 'కన్సోల్ రీసెట్ చేయండి',
    copy: 'కాపీ చేయి',
    copied: 'కాపీ చేయబడింది',
    view: 'చూడండి',
    download: 'డౌన్‌లోడ్',
    downloadPdf: 'PDF నివేదిక డౌన్‌లోడ్',
    downloadJson: 'JSON డౌన్‌లోడ్',
    close: 'మూసివేయి',
    refresh: 'రిఫ్రెష్',
    ping: 'పింగ్',
    retry: 'మళ్లీ ప్రయత్నించండి',
    checking: 'తనిఖీ చేస్తోంది...',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్',
    details: 'వివరాలు',
    status: 'స్థితి',
    timestamp: 'సమయముద్ర',
    target: 'లక్ష్యం',
    type: 'రకం',
    actions: 'చర్యలు',
    search: 'వెతకండి',
    filter: 'ఫిల్టర్',
    all: 'అన్నీ',
    yes: 'అవును',
    no: 'కాదు',
    loading: 'సైబర్‌సెక్యూరిటీ మాడ్యూల్ లోడ్ అవుతోంది...',
    error: 'లోపం',
    warning: 'హెచ్చరిక',
    success: 'విజయం',
    info: 'సమాచారం',
    learnMore: 'మరింత తెలుసుకోండి'
  },

  // Risk Verdicts & Levels
  verdicts: {
    safe: 'సురక్షితం',
    low: 'తక్కువ ప్రమాదం',
    medium: 'మధ్యస్థ ప్రమాదం',
    high: 'అధిక ప్రమాదం',
    critical: 'అత్యంత ప్రమాదకరం',
    suspicious: 'అనుమానాస్పదం',
    phishing: 'ఫిషింగ్ మోసం',
    legitimate: 'అధికారికం',
    official: 'ధృవీకరించబడిన అధికారిక సైట్',
    impersonation: 'బ్యాంక్ నకిలీ అనుకరణ',
    unknown: 'తెలియదు'
  },

  // Directives
  directives: {
    blockAndReport: 'ఆదేశం: నిరోధించి నివేదించండి',
    doNotEnterCredentials: 'ఆదేశం: లాగిన్ వివరాలను నమోదు చేయవద్దు',
    proceedWithCaution: 'ఆదేశం: జాగ్రత్తగా కొనసాగండి',
    safeToProceed: 'ఆదేశం: సురక్షితంగా కొనసాగవచ్చు'
  },

  // Safety Guidance & Recommendations
  safety: {
    noOtp: 'మీ OTP (వన్ టైమ్ పాస్‌వర్డ్) ను ఈ పేజీలో నమోదు చేయవద్దు లేదా ఎవరితోనూ పంచుకోవద్దు.',
    noUpiPin: 'మీ UPI పిన్‌ను నమోదు చేయవద్దు లేదా పంచుకోవద్దు. డబ్బు పంపడానికి మాత్రమే UPI పిన్ అవసరం, స్వీకరించడానికి కాదు.',
    verifyOfficial: 'బ్యాంకింగ్ వివరాలను అందించే ముందు ఎల్లప్పుడూ బ్యాంక్ అధికారిక వెబ్‌సైట్ URLను సరిచూసుకోండి.',
    impersonationAlert: 'ఈ URL ఒక అసలైన బ్యాంకింగ్ సంస్థను అనుకరిస్తూ మోసపూరితంగా సృష్టించబడినట్లు కనిపిస్తోంది.',
    noApk: 'ధృవీకరించని లింకుల నుండి తెలియని APK లేదా అప్లికేషన్ ఫైళ్లను డౌన్‌లోడ్ లేదా ఇన్‌స్టాల్ చేయవద్దు.',
    contactBankOfficial: 'మీ డెబిట్/క్రెడిట్ కార్డ్‌పై ఉన్న అధికారిక ఫోన్ నంబర్ల ద్వారా నేరుగా మీ బ్యాంకును సంప్రదించండి.',
    cybercrimeHelpline: 'సైబర్ ఆర్థిక మోసాలను వెంటనే 1930 హెల్ప్‌లైన్‌కు లేదా cybercrime.gov.in పోర్టల్‌లో నివేదించండి.',
    noPasswordShare: 'అసలైన బ్యాంకులు ఎప్పుడూ పాస్‌వర్డ్‌లు, ATM పిన్‌లు, CVV లేదా OTPలను SMS ద్వారా అడగవు.',
    forwardSpam1909: 'అనుమానాస్పద మోసపూరిత SMSలను 1909 (TRAI స్పామ్ రిపోర్టింగ్) నంబర్‌కు ఫార్వార్డ్ చేయండి.',
    verifyDomain: 'ఎల్లప్పుడూ డొమైన్ పేరును జాగ్రత్తగా పరిశీలించండి. దాడి చేసేవారు తరచుగా అక్షరదోషాలతో కూడిన డొమైన్లను వాడతారు.'
  },

  // Dashboard / Overview
  dashboard: {
    totalScans: 'మొత్తం స్కాన్‌లు',
    totalScansSub: 'శాశ్వత SQLite ఆడిట్ లాగ్‌లు',
    phishingDetected: 'గుర్తించబడిన ఫిషింగ్',
    detectionRate: 'గుర్తింపు రేటు',
    brandImpersonations: 'బ్యాంక్ నకిలీ అనుకరణలు',
    targetingBanks: 'భారతీయ బ్యాంకులను లక్ష్యంగా చేసుకున్న దాడులు',
    safeVerified: 'సురక్షితంగా ధృవీకరించబడినవి',
    safeVerifiedSub: 'అధికారిక బ్యాంకింగ్ వైట్‌లిస్ట్',
    quickScanTitle: 'URL & బ్యాంక్ ప్రామాణికతను విశ్లేషించండి',
    quickScanSubtitle: '26 నిర్మాణ లక్షణాలను సంగ్రహించి, రిజిస్టర్డ్ డొమైన్‌లను ధృవీకరించి, భారతీయ బ్యాంకుల నకిలీలను లెక్కిస్తుంది.',
    quickScanPlaceholder: 'అనుమానాస్పద బ్యాంకింగ్ URLను ఇక్కడ అతికించండి (ఉదా. http://onlinesbi.co-verify.in)...',
    quickScanButton: 'URLను విశ్లేషించండి',
    testVectors: 'పరీక్షా నమూనాలు:',
    fakeSbiTitle: 'నకిలీ SBI KYC అప్‌డేట్',
    fakeHdfcTitle: 'నకిలీ HDFC రివార్డ్ పాయింట్లు',
    officialIciciTitle: 'అధికారిక ICICI నెట్‌బ్యాంకింగ్',
    systemDiagnostics: 'సిస్టమ్ డయాగ్నస్టిక్స్',
    inferenceEngine: 'ఇన్ఫరెన్స్ ఇంజిన్',
    sqliteStorage: 'SQLite స్టోరేజ్',
    registry: 'రిజిస్ట్రీ',
    rbiBanks: '16 RBI బ్యాంకులు',
    attackVectorDist: 'దాడి రకాల పంపిణీ',
    telemetryStore: 'టెలిమెట్రీ స్టోర్',
    noHistoryYet: 'ఇంతవరకు ముప్పు చరిత్ర ఏదీ నమోదు కాలేదు',
    recentScans: 'ఇటీవలి భద్రతా స్కాన్‌లు',
    viewAllHistory: 'పూర్తి ఆడిట్ రికార్డులను చూడండి',
    protectedRegistry: 'రక్షిత భారతీయ బ్యాంకింగ్ రిజిస్ట్రీ',
    protectedRegistryDesc: 'నకిలీ డొమైన్‌లు మరియు మోసాల నుండి కఠినంగా రక్షించబడుతున్న బ్యాంకులు.',
    exploreAllBanks: 'అన్ని బ్యాంకులను చూడండి'
  },

  // URL Scanner
  urlScan: {
    title: 'URL ఫిషింగ్ స్కానర్',
    subtitle: 'జీరో-ట్రస్ట్ భారతీయ బ్యాంక్ బ్రాండ్ రక్షణ & రాండమ్ ఫారెస్ట్ ఇన్ఫరెన్స్',
    inputPlaceholder: 'అనుమానాస్పద URLను నమోదు చేయండి (ఉదా. http://onlinesbi-pan-kyc-verification.com/login.php)...',
    evaluatedTarget: 'మూల్యాంకనం చేయబడిన లక్ష్యం',
    calibratedScore: 'లెక్కింపు ముప్పు స్కోరు',
    zeroTrustMetric: 'జీరో-ట్రస్ట్ కొలమానం',
    modelProb: 'మోడల్ అవుట్‌పుట్ సంభావ్యత',
    priorBase: 'ప్రాథమిక బేస్ విలువ',
    brandImpersonation: 'బ్యాంక్ బ్రాండ్ అనుకరణ',
    brandAnalysis: 'బ్రాండ్ విశ్లేషణ',
    targetBrand: 'లక్ష్యిత బ్యాంక్',
    technique: 'దాడి పద్ధతి',
    officialDomain: 'అధికారిక డొమైన్',
    zeroTrustStatus: 'జీరో-ట్రస్ట్ పోలిక',
    shapTitle: 'TreeSHAP లక్షణ వివరణలు',
    shapSubtitle: 'ఫిషింగ్ సంభావ్యతకు గణితపరంగా వివరించదగిన లక్షణాల సహకారం.',
    featuresTitle: 'సంగ్రహించిన నిర్మాణ & లెక్సికల్ లక్షణాలు (26)',
    presetTargets: 'సిద్ధంగా ఉన్న బ్యాంకింగ్ టెస్ట్ వెక్టార్లు:',
    clickToPopulate: 'తక్షణమే స్కాన్ చేయడానికి క్లిక్ చేయండి',
    exportPdf: 'పూర్తి PDF నివేదికను ఎగుమతి చేయండి',
    exportJson: 'JSON ఎగుమతి చేయండి',
    safeNotice: 'ఎటువంటి హానికరమైన బ్రాండ్ అనుకరణ లేదా అనుమానాస్పద లక్షణాలు కనిపించలేదు.',
    criticalWarning: 'తీవ్రమైన హెచ్చరిక: ఈ పేజీ బ్యాంకును అనుకరిస్తున్న నకిలీ మోసపూరిత క్లోన్. నెట్‌బ్యాంకింగ్ పాస్‌వర్డ్‌లు, OTP లేదా కార్డ్ వివరాలను నమోదు చేయవద్దు.'
  },

  // SMS Scanner
  smsScan: {
    title: 'SMS స్మిషింగ్ స్కానర్',
    subtitle: 'TF-IDF NLP కీలకపద విశ్లేషణ & పొందుపరచబడిన URL సంగ్రహణ',
    inputPlaceholder: 'అనుమానాస్పద SMS సందేశాన్ని ఇక్కడ అతికించండి (ఉదా. ప్రియమైన కస్టమర్, KYC పెండింగ్ ఉన్నందున మీ ఖాతా నిలిపివేయబడింది...)...',
    analyzeButton: 'SMS సందేశాన్ని విశ్లేషించండి',
    evaluating: 'సందేశాన్ని విశ్లేషిస్తోంది...',
    compositeScore: 'సమ్మిళిత స్మిషింగ్ స్కోరు',
    textThreatScore: 'టెక్స్ట్ ముప్పు స్కోరు',
    extractedUrls: 'గుర్తించబడిన లింకులు (URLs)',
    detectedKeywords: 'అధిక ప్రమాదకర కీలకపదాలు',
    scanExtractedUrls: 'అన్ని లింకులను స్కాన్ చేయండి',
    noUrlsInSms: 'SMS సందేశంలో ఎటువంటి లింకులు కనుగొనబడలేదు.',
    sampleMessages: 'ముందుగా నిర్వచించిన SMS దాడి నమూనాలు:',
    warningTitle: 'స్మిషింగ్ ముప్పు సూచిక గుర్తించబడింది',
    emptyError: 'విశ్లేషించడానికి దయచేసి SMS సందేశాన్ని నమోదు చేయండి.'
  },

  // Screenshot / OCR Scanner
  screenshotScan: {
    title: 'స్క్రీన్‌షాట్ ముప్పు స్కానర్',
    subtitle: 'కంప్యూటర్ విజన్, EasyOCR టెక్స్ట్ సంగ్రహణ & విజువల్ ఇంపర్సనేషన్ డిఫెన్స్',
    dragDrop: 'బ్యాంకింగ్ స్క్రీన్‌షాట్‌ను ఇక్కడ డ్రాగ్ చేయండి, లేదా ఫైల్‌ను ఎంచుకోండి',
    formatsAllowed: 'PNG, JPEG, JPG, WEBP మద్దతు ఉంది (గరిష్టంగా 5.0 MB)',
    processing: 'చిత్రాన్ని ప్రాసెస్ చేస్తోంది...',
    extractingOcr: 'OCR ద్వారా టెక్స్ట్‌ను సంగ్రహిస్తోంది...',
    analyzingThreats: 'భద్రతా సూచికలను విశ్లేషిస్తోంది...',
    ocrNotice: 'OCR ఇంజిన్: EasyOCR ఆంగ్ల టెక్స్ట్ మోడల్‌లను ఉపయోగిస్తుంది. ఎంచుకున్న భాష ఫలితాలు మరియు భద్రతా ఆదేశాలకు వర్తిస్తుంది.',
    ocrSummary: 'OCR టెక్స్ట్ సారాంశం',
    noTextDetected: 'అప్‌లోడ్ చేసిన స్క్రీన్‌షాట్‌లో చదవగలిగే టెక్స్ట్ ఏదీ కనుగొనబడలేదు.',
    extractedUrls: 'స్క్రీన్‌షాట్ నుండి సంగ్రహించిన URLలు',
    visualBrands: 'విజువల్ బ్యాంక్ బ్రాండ్ ఆధారాలు',
    socialIndicators: 'సోషల్ ఇంజనీరింగ్ & అత్యవసర ఉచ్చులు',
    emptyUploadError: 'దయచేసి అప్‌లోడ్ చేయడానికి ఒక చిత్రాన్ని ఎంచుకోండి.',
    fileTooLarge: 'ఫైల్ గరిష్ట పరిమితి 5.0 MBని మించిపోయింది.',
    invalidFormat: 'మద్దతు లేని ఫైల్ ఫార్మాట్. PNG, JPEG మరియు WEBP చిత్రాలు మాత్రమే అనుమతించబడతాయి.'
  },

  // Scan History & Governance
  history: {
    title: 'స్కాన్ చరిత్ర & ఆడిట్ లాగ్‌లు',
    subtitle: 'సంఘటనల విశ్లేషణ కోసం క్రిప్టోగ్రాఫిక్ SQLite ఆడిట్ ట్రయల్',
    searchPlaceholder: 'URL, SMS, బ్యాంక్ పేరు లేదా ఫలితం ద్వారా వెతకండి...',
    filterType: 'రకం ఫిల్టర్:',
    filterRisk: 'ప్రమాద స్థాయి:',
    allTypes: 'అన్ని రకాలు',
    allRisks: 'అన్ని స్థాయిలు',
    totalRecords: 'మొత్తం రికార్డులు',
    noRecords: 'మీ శోధనకు సరిపోలిన రికార్డులు ఏవీ లేవు.',
    downloadReport: 'భద్రతా నివేదికను డౌన్‌లోడ్ చేయండి'
  },

  // Network & System Alerts
  network: {
    offlineTitle: 'సెక్యూరిటీ గేట్‌వే కనెక్షన్ ఆఫ్‌లైన్‌లో ఉంది',
    offlineMessage: 'PhishShield డిటెక్షన్ ఇంజిన్‌తో కనెక్షన్‌ను ఏర్పాటు చేయడంలో లోపం ఏర్పడింది. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను మరియు బ్యాకెండ్ సర్వర్‌ను తనిఖీ చేయండి.',
    connectionDiagnostics: 'కనెక్షన్ డయాగ్నస్టిక్స్:',
    retryButton: 'ఇంటర్నెట్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి',
    retrying: 'నెట్‌వర్క్ కనెక్షన్‌ను తనిఖీ చేస్తోంది...'
  }
};
