"""
PhishShield Backend Localization Module
Provides localized phishing-risk explanations and safety recommendations in:
1. English (en - default)
2. Tamil (ta)
3. Telugu (te)
4. Kannada (kn)
5. Malayalam (ml)

STRICT CYBERSECURITY RULES:
- Never translates target URLs, domain names, IP addresses, hashes, or technical feature names.
- Backward-compatible: defaults to English if no language is specified.
- Uses offline deterministic dictionaries; no external translation API calls.
"""

from typing import Dict, Any, List, Optional

SUPPORTED_LANGUAGES = {"en", "ta", "te", "kn", "ml"}

# 1. Action Directives
DIRECTIVES: Dict[str, Dict[str, str]] = {
    "BLOCK_AND_REPORT": {
        "en": "DIRECTIVE: BLOCK AND REPORT",
        "ta": "வழிகாட்டுதல்: தடுத்து புகாரளிக்கவும்",
        "te": "ఆదేశం: నిరోధించి నివేదించండి",
        "kn": "ನಿರ್ದೇಶನ: ನಿರ್ಬಂಧಿಸಿ ಮತ್ತು ವರದಿ ಮಾಡಿ",
        "ml": "നിർദ്ദേശം: ബ്ലോക്ക് ചെയ്ത് റിപ്പോർട്ട് ചെയ്യുക",
    },
    "DO_NOT_ENTER_CREDENTIALS": {
        "en": "DIRECTIVE: DO NOT ENTER CREDENTIALS",
        "ta": "வழிகாட்டுதல்: உள்நுழைவு விவரங்களை உள்ளிடாதீர்கள்",
        "te": "ఆదేశం: లాగిన్ వివరాలను నమోదు చేయవద్దు",
        "kn": "ನಿರ್ದೇಶನ: ಲಾಗಿನ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಬೇಡಿ",
        "ml": "നിർദ്ദേശം: ലോഗിൻ വിവരങ്ങൾ നൽകരുത്",
    },
    "PROCEED_WITH_CAUTION": {
        "en": "DIRECTIVE: PROCEED WITH CAUTION",
        "ta": "வழிகாட்டுதல்: எச்சரிக்கையுடன் தொடரவும்",
        "te": "ఆదేశం: జాగ్రత్తగా కొనసాగండి",
        "kn": "ನಿರ್ದೇಶನ: ಎಚ್ಚರಿಕೆಯಿಂದ ಮುಂದುವರಿಯಿರಿ",
        "ml": "നിർദ്ദേശം: ജാഗ്രതയോടെ മുന്നോട്ട് പോകുക",
    },
    "SAFE_TO_PROCEED": {
        "en": "DIRECTIVE: SAFE TO PROCEED",
        "ta": "வழிகாட்டுதல்: தொடர பாதுகாப்பானது",
        "te": "ఆదేశం: సురಕ್ಷితంగా కొనసాగవచ్చు",
        "kn": "ನಿರ್ದೇಶನ: ಮುಂದುವರಿಯಲು ಸುರಕ್ಷಿತವಾಗಿದೆ",
        "ml": "നിർദ്ദേശം: സുരക്ഷിതമായി തുടരാം",
    },
}

# 2. Risk Level Labels
RISK_LEVEL_LABELS: Dict[str, Dict[str, str]] = {
    "CRITICAL": {
        "en": "Critical Risk",
        "ta": "மிகக் கடுமையான ஆபத்து",
        "te": "అత్యంత ప్రమాదకరం",
        "kn": "ತೀವ್ರ ಅಪಾಯ",
        "ml": "ഗുരുതരമായ അപകടസാധ്യത",
    },
    "HIGH": {
        "en": "High Risk",
        "ta": "அதிக ஆபத்து",
        "te": "అధిక ప్రమాదం",
        "kn": "ಹೆಚ್ಚು ಅಪಾಯ",
        "ml": "ഉയർന്ന അപകടസാധ്യത",
    },
    "MEDIUM": {
        "en": "Medium Risk",
        "ta": "நடுத்தர ஆபத்து",
        "te": "మధ్యస్థ ప్రమాదం",
        "kn": "ಮಧ್ಯಮ ಅಪಾಯ",
        "ml": "മിതമായ അപകടസാധ്യത",
    },
    "LOW": {
        "en": "Low Risk",
        "ta": "குறைந்த ஆபத்து",
        "te": "తక్కువ ప్రమాదం",
        "kn": "ಕಡಿಮೆ ಅಪಾಯ",
        "ml": "കുറഞ്ഞ അപകടസാധ്യത",
    },
    "SAFE": {
        "en": "Safe",
        "ta": "பாதுகாப்பானது",
        "te": "సురక్షితం",
        "kn": "ಸುರಕ್ಷಿತ",
        "ml": "സുരക്ഷിതം",
    },
}

# 3. Contextual Safety Guidance Templates
RECOMMENDATIONS: Dict[str, Dict[str, str]] = {
    "OFFICIAL_BANK": {
        "en": "This website is verified as official digital infrastructure of {brand}. It is safe to access and utilize for legitimate banking services.",
        "ta": "இந்த வலைத்தளம் {brand}-ன் அதிகாரப்பூர்வ டிஜிட்டல் தளமாக உறுதிப்படுத்தப்பட்டுள்ளது. நியாயமான வங்கி சேவைகளுக்கு இதனை பாதுகாப்பாக பயன்படுத்தலாம்.",
        "te": "ఈ వెబ్‌సైట్ {brand} యొక్క అధికారిక డిజిటల్ నెట్‌వర్క్‌గా ధృవీకరించబడింది. బ్యాంకింగ్ సేవల కోసం దీనిని సురక్షితంగా ఉపయోగించవచ్చు.",
        "kn": "ಈ ವೆಬ್‌ಸೈಟ್ {brand} ನ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಮೂಲಸೌಕರ್ಯವೆಂದು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ. ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆಗಳಿಗೆ ಇದನ್ನು ಬಳಸುವುದು ಸುರಕ್ಷಿತವಾಗಿದೆ.",
        "ml": "ഈ വെബ്സൈറ്റ് {brand}-ന്റെ ഔദ്യോഗിക ഡിജിറ്റൽ സംവിധാനമായി സ്ഥിരീകരിച്ചിരിക്കുന്നു. നിയമാനുസൃത ബാങ്കിംഗ് സേവനങ്ങൾക്കായി ഇത് സുരക്ഷിതമായി ഉപയോഗിക്കാം.",
    },
    "BRAND_IMPERSONATION": {
        "en": "CRITICAL WARNING: This page appears to be a fraudulent clone impersonating {brand}. DO NOT submit login credentials, netbanking passwords, OTPs, ATM PINs, PAN, or Aadhaar numbers. Report immediately to National Cyber Crime Portal (cybercrime.gov.in or helpline 1930).",
        "ta": "முக்கிய எச்சரிக்கை: இந்த பக்கம் {brand}-ஐ ஆள்மாறாட்டம் செய்யும் மோசடி நகலாகும். உள்நுழைவு கடவுச்சொற்கள், OTP, ஏடிஎம் பின் அல்லது பான் எண்களை உள்ளிடாதீர்கள். உடனே 1930 உதவி எண்ணில் புகாரளிக்கவும்.",
        "te": "తీవ్రమైన హెచ్చరిక: ఈ పేజీ {brand} ను అనుకరిస్తున్న నకిలీ మోసపూరిత సైట్. నెట్‌బ్యాంకింగ్ పాస్‌వర్డ్‌లు, OTP, ATM పిన్‌లు లేదా ఆధార్ వివరాలను నమోదు చేయవద్దు. 1930 హెల్ప్‌లైన్‌లో వెంటనే ఫిర్యాదు చేయండి.",
        "kn": "ತೀವ್ರ ಎಚ್ಚರಿಕೆ: ಈ ಪುಟವು {brand} ಅನ್ನು ಸೋಗು ಹಾಕಿರುವ ವಂಚನೆಯ ಕ್ಲೋನ್ ಆಗಿದೆ. ಲಾಗಿನ್ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು, OTP, ಎಟಿಎಂ ಪಿನ್ ಅಥವಾ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಬೇಡಿ. 1930 ಸಹಾಯವಾಣಿಗೆ ತಕ್ಷಣ ವರದಿ ಮಾಡಿ.",
        "ml": "ഗുരുതരമായ മുന്നറിയിപ്പ്: ഈ പേജ് {brand}-ന്റെ വ്യാജപതിപ്പാണ്. നെറ്റ്ബാങ്കിംഗ് പാസ്‌വേഡ്, OTP, എടിഎം പിൻ അല്ലെങ്കിൽ ആധാർ നമ്പറുകൾ നൽകരുത്. ഉടൻ തന്നെ 1930 ഹെൽപ്പ്‌ലൈനിൽ പരാതിപ്പെടുക.",
    },
    "GENERIC_CRITICAL": {
        "en": "Severe phishing characteristics detected across multiple features. Block and do not visit. Never share OTP or credentials.",
        "ta": "பல அம்சங்களில் கடுமையான ஃபிஷிங் அறிகுறிகள் கண்டறியப்பட்டன. இதைத் தடுத்து பார்வையிடாதீர்கள். OTP அல்லது கடவுச்சொற்களை ஒருபோதும் பகிராதீர்கள்.",
        "te": "అనేక లక్షణాలలో తీవ్రమైన ఫిషింగ్ గుర్తులు కనుగొనబడ్డాయి. నిరోధించండి మరియు సందర్శించవద్దు. OTP లేదా పాస్‌వర్డ్‌లను ఎప్పుడూ పంచుకోవద్దు.",
        "kn": "ಹಲವಾರು ಲಕ್ಷಣಗಳಲ್ಲಿ ತೀವ್ರ ಫಿಶಿಂಗ್ ಗುಣಲಕ್ಷಣಗಳು ಪತ್ತೆಯಾಗಿವೆ. ನಿರ್ಬಂಧಿಸಿ ಮತ್ತು ಭೇಟಿ ನೀಡಬೇಡಿ. OTP ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
        "ml": "നിരവധി സവിശേഷതകളിൽ ഗുരുതരമായ ഫിഷിംഗ് ലക്ഷണങ്ങൾ കണ്ടെത്തി. ബ്ലോക്ക് ചെയ്യുക, സന്ദർശിക്കരുത്. OTP അല്ലെങ്കിൽ ലോഗിൻ വിവരങ്ങൾ ഒരിക്കലും പങ്കിടരുത്.",
    },
    "GENERIC_HIGH": {
        "en": "High probability of malicious intent. Refrain from entering passwords, OTPs, or financial details.",
        "ta": "தீங்கிழைக்கும் நோக்கம் அதிகம் உள்ளது. கடவுச்சொற்கள், OTP அல்லது நிதி விவரங்களை உள்ளிடுவதைத் தவிர்க்கவும்.",
        "te": "హానికరమైన ఉద్దేశం ఉండే అవకాశం ఎక్కువగా ఉంది. పాస్‌వర్డ్‌లు, OTP లేదా ఆర్థిక వివరాలను నమోదు చేయవద్దు.",
        "kn": "ದುರುದ್ದೇಶಪೂರಿತ ಉದ್ದೇಶದ ಸಂಭವನೀಯತೆ ಹೆಚ್ಚಾಗಿದೆ. ಪಾಸ್‌ವರ್ಡ್‌ಗಳು, OTP ಅಥವಾ ಹಣಕಾಸಿನ ವಿವರಗಳನ್ನು ನಮೂದಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.",
        "ml": "ഹാനികരമായ ഉദ്ദേശ്യത്തിനുള്ള സാധ്യത കൂടുതലാണ്. പാസ്‌വേഡുകൾ, OTP അല്ലെങ്കിൽ സാമ്പത്തിക വിവരങ്ങൾ നൽകുന്നത് ഒഴിവാക്കുക.",
    },
    "GENERIC_MEDIUM": {
        "en": "Moderate anomaly signals detected in URL structure. Exercise caution before proceeding. Verify official domain.",
        "ta": "URL அமைப்பில் மிதமான முரண்பாடுகள் கண்டறியப்பட்டுள்ளன. தொடர்வதற்கு முன் எச்சரிக்கையுடன் இருக்கவும். அதிகாரப்பூர்வ டொமைனை சரிபார்க்கவும்.",
        "te": "URL నిర్మాణంలో మోస్తరు అసాధారణతలు గుర్తించబడ్డాయి. కొనసాగే ముందు జాగ్రత్త వహించండి. అధికారిక డొమైన్‌ను సరిచూసుకోండి.",
        "kn": "URL ರಚನೆಯಲ್ಲಿ ಮಧ್ಯಮ ಅಸಹಜತೆಗಳು ಕಂಡುಬಂದಿವೆ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಎಚ್ಚರಿಕೆ ವಹಿಸಿ. ಅಧಿಕೃತ ಡೊಮೇನ್ ಪರಿಶೀಲಿಸಿ.",
        "ml": "URL ഘടനയിൽ മിതമായ വ്യതിയാനങ്ങൾ കണ്ടെത്തി. മുന്നോട്ട് പോകുന്നതിന് മുമ്പ് ജാഗ്രത പാലിക്കുക. ഔദ്യോഗിക ഡൊമെയ്ൻ പരിശോധിക്കുക.",
    },
    "GENERIC_SAFE": {
        "en": "No known phishing signatures or brand impersonation patterns detected. Standard cybersecurity precautions still apply.",
        "ta": "அறியப்பட்ட ஃபிஷிங் அறிகுறிகளோ அல்லது பிராண்ட் ஆள்மாறாட்டமோ கண்டறியப்படவில்லை. வழக்கமான பாதுகாப்பு நடைமுறைகளை பின்பற்றவும்.",
        "te": "ఎటువంటి ఫిషింగ్ గుర్తులు లేదా బ్రాండ్ అనుకరణలు కనుగొనబడలేదు. ప్రామాణిక సైబర్‌సెక్యూరిటీ జాగ్రత్తలు వర్తిస్తాయి.",
        "kn": "ಯಾವುದೇ ಫಿಶಿಂಗ್ ಲಕ್ಷಣಗಳು ಅಥವಾ ಬ್ರ್ಯಾಂಡ್ ಸೋಗುಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಸಾಮಾನ್ಯ ಸೈಬರ್ ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.",
        "ml": "ഫിഷിംഗ് ലക്ഷണങ്ങളോ ബ്രാൻഡ് വ്യാജപതിപ്പുകളോ കണ്ടെത്തിയില്ല. സാധാരണ സൈബർ സുരക്ഷാ മുൻകരുതലുകൾ പാലിക്കുക.",
    },
    "SMS_CRITICAL": {
        "en": "CRITICAL SMISHING THREAT: Fraudulent SMS contains a verified malicious phishing link. DO NOT click links or disclose OTPs. Forward to 1909 and report to 1930.",
        "ta": "மிகக் கடுமையான ஸ்மிஷிங் அச்சுறுத்தல்: மோசடி SMS-ல் ஆபத்தான ஃபிஷிங் இணைப்பு உள்ளது. இணைப்புகளைக் கிளிக் செய்யாதீர்கள் அல்லது OTP-ஐ பகிராதீர்கள். 1909-க்கு அனுப்பவும் மற்றும் 1930-ல் புகாரளிக்கவும்.",
        "te": "తీవ్రమైన స్మిషింగ్ ముప్పు: మోసపూరిత SMS లో ప్రమాదకరమైన ఫిషింగ్ లింక్ ఉంది. లింక్‌లను క్లిక్ చేయవద్దు లేదా OTPలను వెల్లడించవద్దు. 1909కి ఫార్వార్డ్ చేయండి మరియు 1930లో ఫిర్యాదు చేయండి.",
        "kn": "ತೀವ್ರ ಸ್ಮಿಶಿಂಗ್ ಬೆದರಿಕೆ: ವಂಚನೆಯ SMS ನಲ್ಲಿ ಅಪಾಯಕಾರಿ ಫಿಶಿಂಗ್ ಲಿಂಕ್ ಇದೆ. ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. 1909 ಗೆ ಫಾರ್ವರ್ಡ್ ಮಾಡಿ ಮತ್ತು 1930 ಗೆ ವರದಿ ಮಾಡಿ.",
        "ml": "ഗുരുതരമായ സ്മിഷിംഗ് ഭീഷണി: വ്യാജ SMS-ൽ അപകടകരമായ ഫിഷിംഗ് ലിങ്ക് അടങ്ങിയിരിക്കുന്നു. ലിങ്കുകൾ ക്ലിക്ക് ചെയ്യരുത്, OTP പങ്കിടരുത്. 1909-ലേക്ക് കൈമാറുക, 1930-ൽ പരാതിപ്പെടുക.",
    },
    "SMS_OTP_SAFE": {
        "en": "Authentic Banking Security Notification: Message includes standard bank advisory warning recipient never to disclose OTP.",
        "ta": "உண்மையான வங்கி பாதுகாப்பு அறிவிப்பு: OTP-ஐ ஒருபோதும் யாருடனும் பகிர வேண்டாம் என்று பெறுநரை எச்சரிக்கும் நிலையான அறிவிப்பு.",
        "te": "ప్రామాణిక బ్యాంకింగ్ భద్రతా నోటిఫికేషన్: OTPని ఎవరికీ వెల్లడించవద్దని గ్రహీతను హెచ్చరించే సందేశం.",
        "kn": "ಅಧಿಕೃತ ಬ್ಯಾಂಕಿಂಗ್ ಭದ್ರತಾ ಅಧಿಸೂಚನೆ: OTP ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದಂತೆ ಎಚ್ಚರಿಸುವ ಸಂದೇಶ.",
        "ml": "യഥാർത്ഥ ബാങ്കിംഗ് സുരക്ഷാ അറിയിപ്പ്: OTP ആരുമായും പങ്കിടരുതെന്ന് ഉപഭോക്താവിനെ ഓർമ്മിപ്പിക്കുന്ന സന്ദേശം.",
    },
}


def normalize_language_code(accept_language_header: Optional[str]) -> str:
    """
    Parses Accept-Language header or raw query code.
    Defaults to 'en' if invalid or missing.
    """
    if not accept_language_header:
        return "en"

    # Handle formats like "ta-IN,ta;q=0.9,en;q=0.8" or "ta"
    parts = accept_language_header.split(",")
    for part in parts:
        code = part.split(";")[0].strip().split("-")[0].lower()
        if code in SUPPORTED_LANGUAGES:
            return code

    return "en"


def get_localized_directive(directive_code: str, lang: str = "en") -> str:
    """Returns localized directive string."""
    lang = lang if lang in SUPPORTED_LANGUAGES else "en"
    dir_dict = DIRECTIVES.get(directive_code, {})
    return dir_dict.get(lang, dir_dict.get("en", f"DIRECTIVE: {directive_code}"))


def get_localized_risk_level(risk_level: str, lang: str = "en") -> str:
    """Returns localized human-readable risk level label."""
    lang = lang if lang in SUPPORTED_LANGUAGES else "en"
    labels = RISK_LEVEL_LABELS.get(risk_level.upper(), {})
    return labels.get(lang, labels.get("en", risk_level))


def get_localized_recommendation(
    template_key: str,
    brand: Optional[str] = None,
    lang: str = "en"
) -> str:
    """Returns formatted, localized safety recommendation text."""
    lang = lang if lang in SUPPORTED_LANGUAGES else "en"
    template_dict = RECOMMENDATIONS.get(template_key, {})
    raw_template = template_dict.get(lang, template_dict.get("en", ""))
    if brand:
        return raw_template.replace("{brand}", brand)
    return raw_template


def localize_unified_risk_assessment(
    risk_assessment: Dict[str, Any],
    lang: str = "en"
) -> Dict[str, Any]:
    """
    Enriches risk_assessment with localized directives and safety recommendations
    without modifying core ML features or numerical risk scores.
    """
    if lang == "en" or lang not in SUPPORTED_LANGUAGES:
        risk_assessment["language"] = "en"
        return risk_assessment

    rec_code = risk_assessment.get("recommendation", "SAFE_TO_PROCEED")
    risk_level = risk_assessment.get("risk_level", "LOW")
    detected_brand = risk_assessment.get("factors", {}).get("detected_brand")

    # Localize directive label
    risk_assessment["localized_directive"] = get_localized_directive(rec_code, lang)
    risk_assessment["localized_risk_level"] = get_localized_risk_level(risk_level, lang)

    # Determine appropriate recommendation template
    if rec_code == "SAFE_TO_PROCEED" and detected_brand:
        risk_assessment["recommendation_text"] = get_localized_recommendation("OFFICIAL_BANK", detected_brand, lang)
    elif rec_code == "BLOCK_AND_REPORT" and detected_brand:
        risk_assessment["recommendation_text"] = get_localized_recommendation("BRAND_IMPERSONATION", detected_brand, lang)
    elif rec_code == "BLOCK_AND_REPORT":
        risk_assessment["recommendation_text"] = get_localized_recommendation("GENERIC_CRITICAL", None, lang)
    elif rec_code == "DO_NOT_ENTER_CREDENTIALS":
        risk_assessment["recommendation_text"] = get_localized_recommendation("GENERIC_HIGH", None, lang)
    elif rec_code == "PROCEED_WITH_CAUTION":
        risk_assessment["recommendation_text"] = get_localized_recommendation("GENERIC_MEDIUM", None, lang)
    else:
        risk_assessment["recommendation_text"] = get_localized_recommendation("GENERIC_SAFE", None, lang)

    risk_assessment["language"] = lang
    return risk_assessment
