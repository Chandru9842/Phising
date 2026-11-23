"""
PhishShield Social Engineering & Banking Indicator Analysis Engine

Performs rule-based linguistic and structural indicator matching on OCR text.
Detects credential harvesting, OTP interception demands, urgency coercion,
fake KYC alerts, and remote access instructions.

CRITICAL DISCRIMINATION RULE:
Differentiates between legitimate bank security advisories (e.g. "Never share OTP with anyone")
and active phishing coercion attacks (e.g. "Enter your OTP immediately to avoid account blocking").
"""

import re
from typing import Dict, Any, List, Optional, Set, Tuple


# Rule catalog with category, severity, regex patterns, and risk explanations
INDICATOR_RULES = [
    # 1. Benign Safety Advisories (Evaluated first to suppress false alarms)
    {
        "category": "safety_advisory",
        "label": "Legitimate Bank Safety Advisory",
        "severity": "BENIGN_ADVISORY",
        "pattern": re.compile(
            r"(?i)\b(?:never\s+share\s+(?:your\s+)?(?:otp|password|pin|mpin|cvv|credentials)|"
            r"do\s+not\s+(?:share|disclose|reveal)\s+(?:your\s+)?(?:otp|password|pin|mpin|cvv)|"
            r"bank\s+(?:never|will\s+never)\s+ask\s+(?:for\s+)?(?:otp|pin|password|cvv)|"
            r"beware\s+of\s+(?:fraud|phishing|fake\s+(?:sms|calls?|sites?|portals?)|smishing)|"
            r"safe\s+banking\s+guidelines|rbi\s+cautionary\s+notice|"
            r"cyber\s+security\s+advisory|security\s+notice|government\s+advisory|cert-in\s+advisory|"
            r"report\s+(?:cyber\s*crimes?|fraud|phishing)\s+(?:at|to|on))\b",
            re.IGNORECASE
        ),
        "explanation": "Authentic cybersecurity advisory alerting customers to safeguard their confidential credentials."
    },

    # 2. Credential Harvesting Coercion
    {
        "category": "credential_harvesting",
        "label": "Confidential Authentication Credential Request",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r"(?i)\b(?:enter\s+(?:your\s+)?(?:netbanking\s+|login\s+|account\s+)?(?:user\s*id|customer\s*id|username|password|mpin|atm\s+pin|transaction\s+pin|pin)|"
            r"submit\s+(?:your\s+)?(?:password|login\s+credentials|pin|user\s*id)|"
            r"user\s*id|customer\s*id|login\s+password|netbanking\s+password|transaction\s+password|"
            r"enter\s+(?:16[\s-]?digit\s+)?(?:card\s+number|debit\s+card|credit\s+card)|"
            r"card\s+number|cvv2?|card\s+expiry|valid\s+thru|expiry\s+date|"
            r"mother'?s\s+maiden\s+name|grid\s+card\s+values)\b",
            re.IGNORECASE
        ),
        "explanation": "High-risk request demanding direct entry or disclosure of banking credentials, passwords, or card security codes."
    },

    # 3. OTP Interception Demands
    {
        "category": "otp_interception",
        "label": "One-Time Password (OTP) Interception Demands",
        "severity": "HIGH",
        "pattern": re.compile(
            r"(?i)\b(?:enter\s+(?:the\s+|your\s+)?(?:otp|one[\s-]?time\s+password|verification\s+code)|"
            r"submit\s+(?:your\s+)?otp|share\s+(?:the\s+)?otp|provide\s+(?:the\s+)?otp|"
            r"otp\s+(?:sent|received|required|code|sms|verification)|verify\s+(?:with\s+)?otp|resend\s+otp|"
            r"(?:and\s+)?otp|one[\s-]?time\s+password)\b",
            re.IGNORECASE
        ),
        "explanation": "Solicits immediate entry or submission of an authentication OTP, commonly used by threat actors to authorize fraudulent transactions."
    },

    # 4. Urgency & Coercive Threats
    {
        "category": "urgency_coercion",
        "label": "Urgency & Account Suspension Coercion",
        "severity": "HIGH",
        "pattern": re.compile(
            r"(?i)\b(?:account\s+(?:is|will\s+be)\s+(?:blocked|suspended|deactivated|frozen|restricted|locked)|"
            r"immediate\s+action\s+required|within\s+(?:24|12|48|2)\s*hours|"
            r"action\s+required\s+within\s+\d+|to\s+avoid\s+(?:suspension|deactivation|penalty|legal\s+action)|"
            r"unblock\s+(?:your\s+)?account|reactivate\s+(?:your\s+)?services|"
            r"urgent\s+verification\s+notice)\b",
            re.IGNORECASE
        ),
        "explanation": "Psychological manipulation inducing panic via threats of imminent account suspension or banking penalties."
    },

    # 5. KYC Non-Compliance Fraud
    {
        "category": "kyc_fraud",
        "label": "Fraudulent KYC / PAN / Aadhaar Compliance Warning",
        "severity": "HIGH",
        "pattern": re.compile(
            r"(?i)\b(?:kyc\s+(?:is\s+)?(?:expired|suspended|incomplete|pending|required|rejected)|"
            r"update\s+(?:your\s+)?kyc|complete\s+(?:your\s+)?kyc|re[\s-]?kyc\s+mandatory|"
            r"link\s+(?:your\s+)?(?:pan|aadhaar|aadhar)\s+(?:immediately|to\s+avoid)|"
            r"pan\s+(?:card\s+)?blocked|aadhaar\s+verification\s+pending)\b",
            re.IGNORECASE
        ),
        "explanation": "Exploits regulatory KYC mandates to deceive users into disclosing identity documents and financial credentials on rogue forms."
    },

    # 6. Remote Access Trojan / Malicious App Coercion
    {
        "category": "remote_access_trojan",
        "label": "Remote Screen-Sharing / Unofficial APK Coercion",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r"(?i)\b(?:install\s+(?:anydesk|teamviewer|rustdesk|quicksupport|zoho\s+assist|airdroid)|"
            r"download\s+(?:the\s+)?(?:apk|support\s+app|banking\s+utility|security\s+patch)|"
            r"grant\s+accessibility\s+permission|allow\s+screen\s+sharing)\b",
            re.IGNORECASE
        ),
        "explanation": "Instructs customer to install remote screen-sharing tools or rogue APKs, granting attackers complete device and SMS access."
    },

    # 7. Financial Lures & Fake Rewards
    {
        "category": "financial_lure",
        "label": "Fraudulent Reward / Cashback / Refund Lure",
        "severity": "MEDIUM",
        "pattern": re.compile(
            r"(?i)\b(?:congratulations\s+you\s+won|cashback\s+(?:credited|pending|approved)|"
            r"reward\s+points?\s+(?:expired|credited|worth)|redeem\s+(?:your\s+)?(?:points|cashback|bonus)|"
            r"refund\s+(?:of\s+rs\.?\s*\d+|pending\s+credit)|claim\s+(?:your\s+)?(?:reward|prize|cashback)|"
            r"pre[\s-]?approved\s+instant\s+loan)\b",
            re.IGNORECASE
        ),
        "explanation": "Promises financial gain or rewards to entice the victim into clicking links and entering payment authentication details."
    }
]


def analyze_social_engineering_indicators(
    ocr_text: str,
    text_blocks: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Scans OCR text for psychological and banking coercion indicators.
    Identifies matched text, indicator category, severity, and actionable context.

    Returns:
        List of dictionaries matching SocialEngineeringIndicator schema.
    """
    if not ocr_text or not ocr_text.strip():
        return []

    matched_indicators: List[Dict[str, Any]] = []
    seen_matches: Set[Tuple[str, str]] = set()

    # Pre-check for strong security advisories
    advisory_matches = []
    for rule in INDICATOR_RULES:
        if rule["category"] == "safety_advisory":
            for m in rule["pattern"].finditer(ocr_text):
                matched_snippet = m.group(0).strip()
                advisory_matches.append(matched_snippet)

    for rule in INDICATOR_RULES:
        category = rule["category"]
        severity = rule["severity"]
        label = rule["label"]
        explanation = rule["explanation"]

        for match in rule["pattern"].finditer(ocr_text):
            matched_snippet = match.group(0).strip()

            # If this is an OTP demand or credential request, verify it's not simply part of a negative safety advisory
            # e.g., "Never share your OTP with anyone" should NOT trigger an attack OTP interception indicator!
            if category in ["otp_interception", "credential_harvesting"] and advisory_matches:
                # Check if the match is physically part of an advisory snippet
                if any(matched_snippet.lower() in adv.lower() or adv.lower() in matched_snippet.lower() for adv in advisory_matches):
                    continue

            dedup_key = (category, matched_snippet.lower())
            if dedup_key not in seen_matches:
                seen_matches.add(dedup_key)
                matched_indicators.append({
                    "category": category,
                    "label": label,
                    "matched_text": matched_snippet,
                    "severity": severity,
                    "explanation": explanation
                })

    return matched_indicators
