"""
PhishShield Unified Risk Assessment Engine

Synthesizes Machine Learning Random Forest probability, Zero-Trust Indian Banking
Registry verification, heuristic brand impersonation signals, and structural red flags.

Calibrates raw ML scores deterministically to eliminate false positives on verified
banks and escalate sophisticated brand spoofing attacks.

SECURITY RULE: Never visits, resolves, or executes target URLs.
"""

import os
import sys
from typing import Dict, Any, List, Optional

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)


# Recommendation constants
REC_SAFE = "SAFE_TO_PROCEED"
REC_CAUTION = "PROCEED_WITH_CAUTION"
REC_NO_CREDS = "DO_NOT_ENTER_CREDENTIALS"
REC_BLOCK = "BLOCK_AND_REPORT"


def evaluate_unified_risk(
    url: str,
    ml_prediction: Dict[str, Any],
    brand_analysis: Dict[str, Any],
    shap_explanation: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Synthesizes ML model prediction, brand impersonation detection, and structural
    indicators into an actionable, unified risk assessment.
    
    Returns:
    - risk_score: float (0.0 to 100.0)
    - risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    - is_phishing: bool
    - recommendation: Actionable user guidance code
    - recommendation_text: User-friendly safety instructions
    - reasons: Ordered list of primary risk / safety justifications
    - factors: Contributing metrics breakdown
    """
    raw_ml_score = float(ml_prediction.get("risk_score", 0.0))
    features = ml_prediction.get("features", {})
    
    is_official = brand_analysis.get("is_official_domain", False)
    impersonation_suspected = brand_analysis.get("impersonation_suspected", False)
    match_type = brand_analysis.get("match_type", "NONE")
    detected_brand = brand_analysis.get("detected_brand")
    official_domain = brand_analysis.get("official_domain")
    
    reasons: List[str] = []
    calibrated_score: float = raw_ml_score

    # =========================================================================
    # RULE 1: Zero-Trust Verified Official Indian Banking Infrastructure
    # =========================================================================
    if is_official:
        # Verified official bank domains (e.g. retail.onlinesbi.sbi, netbanking.hdfcbank.com)
        # must never be flagged as phishing, even if complex deep URLs trigger ML false alarms.
        calibrated_score = min(raw_ml_score, 5.0)
        risk_level = "LOW"
        is_phishing = False
        recommendation = REC_SAFE
        recommendation_text = (
            f"This website is verified as official digital infrastructure of {detected_brand}. "
            "It is safe to access and utilize for legitimate banking services."
        )
        reasons.append(
            f"Zero-Trust Verified: Matches authenticated canonical domain for {detected_brand} ({official_domain})."
        )
        reasons.append("Registered domain is cataloged in the Reserve Bank of India / Indian Banking Registry.")

    # =========================================================================
    # RULE 2: Active Brand Impersonation on Untrusted Domain
    # =========================================================================
    elif impersonation_suspected:
        is_phishing = True
        
        if match_type in ["TYPOSQUATTING", "SUBDOMAIN_SPOOFING", "SUSPICIOUS_KEYWORD_COMBO"]:
            # High-severity targeted brand impersonation
            calibrated_score = max(raw_ml_score, 92.0)
            risk_level = "CRITICAL"
            recommendation = REC_BLOCK
            recommendation_text = (
                f"CRITICAL WARNING: This page appears to be a fraudulent clone impersonating {detected_brand}. "
                "DO NOT submit login credentials, netbanking passwords, OTPs, ATM PINs, PAN, or Aadhaar numbers. "
                "Immediately close this tab and report the incident to the National Cyber Crime Portal (cybercrime.gov.in or helpline 1930)."
            )
            reasons.extend(brand_analysis.get("reasons", []))
            reasons.append(
                f"Severe Brand Impersonation: Untrusted domain spoofing {detected_brand} via {match_type}."
            )
        elif match_type == "PATH_SPOOFING":
            calibrated_score = max(raw_ml_score, 78.0)
            risk_level = "HIGH"
            recommendation = REC_NO_CREDS
            recommendation_text = (
                f"HIGH RISK: Bank brand '{detected_brand}' detected in URL path on an untrusted external server. "
                "Do not authenticate or enter financial information on this domain."
            )
            reasons.extend(brand_analysis.get("reasons", []))
        else:
            calibrated_score = max(raw_ml_score, 75.0)
            risk_level = "HIGH"
            recommendation = REC_NO_CREDS
            recommendation_text = f"Suspicious brand match targeting {detected_brand} detected."
            reasons.extend(brand_analysis.get("reasons", []))

    # =========================================================================
    # RULE 3: Structural Red Flags on Non-Brand URLs
    # =========================================================================
    elif features.get("has_ip") == 1:
        calibrated_score = max(raw_ml_score, 85.0)
        risk_level = "CRITICAL"
        is_phishing = True
        recommendation = REC_BLOCK
        recommendation_text = (
            "CRITICAL RISK: Destination utilizes a direct numerical IP address instead of a domain name. "
            "Legitimate financial institutions never conduct public retail banking from raw IP addresses."
        )
        reasons.append("Direct IP address in URL hostname: typical of fast-flux phishing hosts.")

    elif features.get("has_at_symbol") == 1:
        calibrated_score = max(raw_ml_score, 78.0)
        risk_level = "HIGH"
        is_phishing = True
        recommendation = REC_NO_CREDS
        recommendation_text = (
            "HIGH RISK: URL contains '@' character syntax used to mislead browser URL bars."
        )
        reasons.append("Authentication syntax '@' in URL used for user authority spoofing.")

    # =========================================================================
    # RULE 4: General Machine Learning Score Calibration
    # =========================================================================
    else:
        # Boost for suspicious TLD + moderate ML score
        if features.get("has_suspicious_tld") == 1 and calibrated_score >= 35.0:
            calibrated_score = min(100.0, calibrated_score + 12.0)
            reasons.append("Utilizes a high-risk TLD disproportionately associated with abuse.")

        # Determine risk tiers
        if calibrated_score < 30.0:
            risk_level = "LOW"
            is_phishing = False
            recommendation = REC_SAFE
            recommendation_text = (
                "No known phishing signatures or brand impersonation patterns detected. "
                "Standard cybersecurity precautions still apply."
            )
            reasons.append(f"Classified as low risk ({calibrated_score:.1f}%) by Random Forest classifier.")
        elif calibrated_score < 60.0:
            risk_level = "MEDIUM"
            is_phishing = False
            recommendation = REC_CAUTION
            recommendation_text = (
                "Moderate anomaly signals detected in URL structure. Exercise caution before proceeding."
            )
            reasons.append(f"Elevated lexical or structural features detected (risk score {calibrated_score:.1f}%).")
        elif calibrated_score < 80.0:
            risk_level = "HIGH"
            is_phishing = True
            recommendation = REC_NO_CREDS
            recommendation_text = (
                "High probability of malicious intent. Refrain from entering passwords or sensitive personal data."
            )
            reasons.append(f"Random Forest evaluated high phishing probability ({calibrated_score:.1f}%).")
        else:
            risk_level = "CRITICAL"
            is_phishing = True
            recommendation = REC_BLOCK
            recommendation_text = (
                "Severe phishing characteristics detected across multiple features. Block and do not visit."
            )
            reasons.append(f"Critical phishing probability ({calibrated_score:.1f}%) across structural features.")

    # Append top SHAP risk factors if available
    if shap_explanation and shap_explanation.get("top_positive_contributors"):
        top_pos = shap_explanation["top_positive_contributors"][:2]
        shap_details = [f"{c['feature_name']} (+{c['shap_value']:.2f})" for c in top_pos if c['shap_value'] > 0.02]
        if shap_details:
            reasons.append(f"Key ML risk drivers: {', '.join(shap_details)}.")

    return {
        "risk_score": round(calibrated_score, 2),
        "risk_level": risk_level,
        "is_phishing": is_phishing,
        "recommendation": recommendation,
        "recommendation_text": recommendation_text,
        "reasons": reasons,
        "factors": {
            "raw_ml_risk_score": round(raw_ml_score, 2),
            "calibrated_risk_score": round(calibrated_score, 2),
            "is_official_bank_domain": is_official,
            "brand_impersonation_suspected": impersonation_suspected,
            "detected_brand": detected_brand,
            "match_type": match_type,
            "structural_red_flags": {
                "has_ip": bool(features.get("has_ip")),
                "has_at_symbol": bool(features.get("has_at_symbol")),
                "has_suspicious_tld": bool(features.get("has_suspicious_tld")),
                "is_shortened": bool(features.get("is_shortened")),
            }
        }
    }
