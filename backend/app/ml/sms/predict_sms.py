"""
PhishShield SMS Prediction & Multi-URL Integration Engine

Performs TF-IDF + Logistic Regression smishing classification on SMS text,
automatically extracts all embedded URLs, and evaluates each URL using the existing
backend URL phishing classifier, brand detection, SHAP explainer, and risk engine.

SECURITY RULE: Never visits, resolves, or executes submitted SMS messages or extracted URLs.
"""

import os
import sys
import datetime
from typing import Dict, Any, List, Optional

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.ml.sms.sms_preprocessing import (
    extract_urls_from_text,
    clean_sms_text,
    detect_smishing_keywords
)
from app.ml.sms.sms_classifier import SMSPhishingClassifier
from app.ml.predict import scan_url_full

DEFAULT_SMS_MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "saved_models", "sms_tfidf_lr_model.joblib"
)

# In-memory singleton cached classifier
_cached_sms_classifier: Optional[SMSPhishingClassifier] = None
_cached_sms_model_path: Optional[str] = None


def get_sms_classifier(model_path: str = DEFAULT_SMS_MODEL_PATH) -> SMSPhishingClassifier:
    """
    Retrieves or loads the SMS smishing classifier model.
    Raises FileNotFoundError if the trained model artifact does not exist.
    """
    global _cached_sms_classifier, _cached_sms_model_path

    if _cached_sms_classifier is not None and _cached_sms_model_path == model_path:
        return _cached_sms_classifier

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Trained SMS model artifact not found at: {model_path}. "
            "Please run 'python app/ml/sms/train_sms_model.py' to train the model first. "
            "PhishShield strictly prohibits fake/mock predictions."
        )

    _cached_sms_classifier = SMSPhishingClassifier.load(model_path)
    _cached_sms_model_path = model_path
    return _cached_sms_classifier


def clear_sms_classifier_cache():
    """Clears cached SMS model from memory (useful in tests or after re-training)."""
    global _cached_sms_classifier, _cached_sms_model_path
    _cached_sms_classifier = None
    _cached_sms_model_path = None


def predict_sms_text(
    raw_text: str,
    model_path: str = DEFAULT_SMS_MODEL_PATH
) -> Dict[str, Any]:
    """
    Inference on SMS text using the TF-IDF + Logistic Regression pipeline:
    1. Validates and cleans SMS text.
    2. Runs model inference.
    3. Returns probabilities, smishing flag, risk score, and detected keywords.
    """
    if not isinstance(raw_text, str) or not raw_text.strip():
        raise ValueError("Invalid SMS input: Message text must be a non-empty string.")

    cleaned = clean_sms_text(raw_text, replace_urls=True)
    keywords = detect_smishing_keywords(raw_text)

    classifier = get_sms_classifier(model_path)
    probs = classifier.predict_proba([cleaned])[0]
    p_legit = float(probs[0])
    p_phish = float(probs[1])

    is_smishing = bool(p_phish >= 0.5)
    risk_score = round(p_phish * 100.0, 2)

    if risk_score < 30.0:
        risk_level = "LOW"
    elif risk_score < 60.0:
        risk_level = "MEDIUM"
    elif risk_score < 80.0:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "raw_message": raw_text.strip(),
        "cleaned_text": cleaned,
        "is_smishing": is_smishing,
        "sms_risk_score": risk_score,
        "sms_risk_level": risk_level,
        "probabilities": {
            "legitimate": round(p_legit, 4),
            "phishing": round(p_phish, 4),
        },
        "keywords_detected": keywords,
        "model_version": classifier.metadata.get("version", "1.0.0"),
    }


def scan_sms_comprehensive(
    raw_text: str,
    model_path: str = DEFAULT_SMS_MODEL_PATH
) -> Dict[str, Any]:
    """
    Full Priority 3 SMS & Multi-URL Security Analysis:
    1. Extracts all embedded URLs from the SMS message.
    2. Evaluates SMS text using TF-IDF + Logistic Regression model.
    3. Automatically scans EVERY extracted URL using the existing internal URL engine:
       (Random Forest 26 features + Brand Impersonation + SHAP + Zero-Trust Risk Engine).
    4. Synthesizes a composite risk assessment combining text threat score and URL findings.
    5. Formulates actionable user recommendations and plain-language justification.
    """
    # 1. Text prediction
    text_res = predict_sms_text(raw_text, model_path=model_path)
    raw_message = text_res["raw_message"]
    sms_risk_score = text_res["sms_risk_score"]
    keywords = text_res["keywords_detected"]

    # 2. Extract URLs
    extracted_urls = extract_urls_from_text(raw_message)

    # 3. Scan each URL using the existing backend URL service layer
    url_scan_results: List[Dict[str, Any]] = []
    has_critical_url = False
    has_high_url = False
    any_url_impersonating = False
    all_urls_official = len(extracted_urls) > 0
    spoofed_brands: List[str] = []

    for target_url in extracted_urls:
        try:
            url_analysis = scan_url_full(target_url)
            url_scan_results.append(url_analysis)

            # Check URL risk status
            u_level = url_analysis.get("risk_level", "LOW")
            brand_data = url_analysis.get("brand_analysis", {})

            if u_level == "CRITICAL":
                has_critical_url = True
            elif u_level == "HIGH":
                has_high_url = True

            if brand_data.get("impersonation_suspected"):
                any_url_impersonating = True
                brand_name = brand_data.get("detected_brand")
                if brand_name and brand_name not in spoofed_brands:
                    spoofed_brands.append(brand_name)

            if not brand_data.get("is_official_domain"):
                all_urls_official = False

        except Exception as e:
            url_scan_results.append({
                "url": target_url,
                "error": f"URL scan failed: {str(e)}",
                "is_phishing": None,
                "risk_score": 0.0,
                "risk_level": "UNKNOWN",
            })
            all_urls_official = False

    # 4. Composite Risk Synthesis
    reasons: List[str] = []
    composite_risk_score = sms_risk_score
    target_brand = spoofed_brands[0] if spoofed_brands else None

    # Scenario A: URL contains confirmed brand impersonation or critical threat
    if any_url_impersonating or has_critical_url:
        composite_risk_score = max(sms_risk_score, 95.0)
        composite_risk_level = "CRITICAL"
        is_phishing = True
        recommendation = "BLOCK_AND_REPORT"
        
        brand_str = f" impersonating {target_brand}" if target_brand else ""
        recommendation_text = (
            f"CRITICAL SMISHING THREAT: Fraudulent SMS contains a verified malicious phishing link{brand_str}. "
            "DO NOT click links, call phone numbers mentioned, or disclose OTPs, PINs, or banking credentials. "
            "Immediately forward this SMS to 1909 (TRAI Spam Reporting) and report to cybercrime.gov.in (Helpline: 1930)."
        )
        reasons.append(
            f"High-Severity Smishing Attack: Message contains confirmed phishing link{brand_str}."
        )
        if any_url_impersonating:
            reasons.append(f"Brand Impersonation Target: {', '.join(spoofed_brands)}.")

    # Scenario B: URL has high risk (e.g. suspicious domain or structural anomalies)
    elif has_high_url:
        composite_risk_score = max(sms_risk_score, 82.0)
        composite_risk_level = "HIGH"
        is_phishing = True
        recommendation = "DO_NOT_ENTER_CREDENTIALS"
        recommendation_text = (
            "HIGH RISK: SMS contains a suspicious link with high phishing indicators. "
            "Do not enter passwords, OTPs, or personal identity details on the linked page."
        )
        reasons.append("Embedded URL flagged as high phishing risk by Random Forest classifier.")

    # Scenario C: URLs are present and ALL are verified official bank portals
    elif len(extracted_urls) > 0 and all_urls_official:
        composite_risk_score = min(sms_risk_score, 5.0)
        composite_risk_level = "LOW"
        is_phishing = False
        recommendation = "SAFE_TO_PROCEED"
        recommendation_text = (
            "Verified Official Banking Alert: Embedded links match authenticated official banking infrastructure."
        )
        reasons.append("All extracted links match verified official Indian banking domains.")

    # Scenario D: Authentic 2FA / OTP advisory without links (e.g. "Do not share OTP")
    elif len(extracted_urls) == 0 and any(phrase in raw_message.lower() for phrase in ["do not share", "never ask", "never share", "valid for"]):
        composite_risk_score = min(sms_risk_score, 10.0)
        composite_risk_level = "LOW"
        is_phishing = False
        recommendation = "SAFE_TO_PROCEED"
        recommendation_text = (
            "Authentic Banking Security Notification: Message includes standard bank advisory warning recipient never to disclose OTP."
        )
        reasons.append("Authentic security warning detected: advises recipient never to disclose one-time passwords.")

    # Scenario E: Standard SMS text evaluation governs
    else:
        if sms_risk_score >= 80.0:
            composite_risk_level = "CRITICAL"
            is_phishing = True
            recommendation = "BLOCK_AND_REPORT"
            recommendation_text = (
                "CRITICAL SMISHING RISK: Message text displays strong social engineering, coercion, or financial fraud indicators."
            )
        elif sms_risk_score >= 60.0:
            composite_risk_level = "HIGH"
            is_phishing = True
            recommendation = "DO_NOT_ENTER_CREDENTIALS"
            recommendation_text = (
                "HIGH RISK: SMS text exhibits typical phishing language and deceptive urgency."
            )
        elif sms_risk_score >= 30.0:
            composite_risk_level = "MEDIUM"
            is_phishing = False
            recommendation = "PROCEED_WITH_CAUTION"
            recommendation_text = (
                "MODERATE RISK: Message contains sensitive keywords or promotional lures. Verify with official bank before acting."
            )
        else:
            composite_risk_level = "LOW"
            is_phishing = False
            recommendation = "SAFE_TO_PROCEED"
            recommendation_text = (
                "No smishing patterns or malicious URLs detected. Standard cybersecurity awareness applies."
            )

    # Compile descriptive reasons
    reasons.append(
        f"SMS Text Analysis: TF-IDF + Logistic Regression evaluated {sms_risk_score:.1f}% smishing probability ({text_res['sms_risk_level']})."
    )
    if keywords:
        reasons.append(f"Suspicious Banking Lure Keywords Detected: {', '.join(keywords)}.")
    if extracted_urls:
        reasons.append(f"Extracted {len(extracted_urls)} embedded link(s) for deep structural & brand inspection.")
    else:
        reasons.append("No embedded URLs identified in message body.")

    return {
        "message": raw_message,
        "is_smishing": is_phishing,
        "composite_risk_score": round(composite_risk_score, 2),
        "composite_risk_level": composite_risk_level,
        "recommendation": recommendation,
        "recommendation_text": recommendation_text,
        "sms_text_analysis": text_res,
        "extracted_urls": extracted_urls,
        "url_count": len(extracted_urls),
        "url_scan_results": url_scan_results,
        "target_brand": target_brand,
        "reasons": reasons,
        "analyzed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    import json
    sample_smish = (
        "Dear SBI User, your YONO account is blocked today due to pending KYC. "
        "Click http://onlinesbi-pan-kyc-verification.com/login.php to update immediately."
    )
    print("Testing Comprehensive SMS Scan:")
    res = scan_sms_comprehensive(sample_smish)
    print(json.dumps(res, indent=2))
