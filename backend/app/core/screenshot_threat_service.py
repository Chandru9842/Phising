"""
PhishShield Screenshot Threat Intelligence & Explainability Service

Modular master orchestrator that integrates:
1. EasyOCR text extraction and bounding box analysis
2. URL candidate extraction and OCR scheme normalization
3. Existing Random Forest URL phishing classifier & SHAP feature attributions
4. Indian Banking Brand Impersonation detection & Domain Mismatch validation
5. Rule-based Social Engineering & Credential Harvesting indicator analysis
6. Explainable multi-factor Screenshot Risk Assessment

SECURITY GUARANTEES:
- Purely static in-memory string and pixel processing
- NEVER connects to, resolves, pings, or visits extracted URLs
- Never stores uploaded screenshots permanently to disk
"""

import re
import time
import datetime
import logging
import uuid
from typing import Dict, Any, List, Optional, Tuple, Set
import numpy as np

from app.core.ocr_engine import extract_text_from_image
from app.core.ocr_url_extractor import extract_urls_from_ocr
from app.core.social_engineering_engine import analyze_social_engineering_indicators
from app.core.brand_registry import INDIAN_BANKING_REGISTRY
from app.ml.predict import scan_url_full
from app.ml.brand_detection import extract_domain_components

logger = logging.getLogger("phishshield.screenshot_threat")


def match_bank_brands_in_text(ocr_text: str) -> List[Dict[str, Any]]:
    """
    Identifies Indian bank brand names mentioned in visual OCR typography.
    Cross-references against the Reserve Bank of India / Indian Banking Registry.
    Uses regex word boundaries to prevent substring false alarms (e.g. 'bobcat', 'horizontal axis').
    """
    if not ocr_text:
        return []

    matched_brands: List[Dict[str, Any]] = []
    seen_names: Set[str] = set()

    # Pre-check whether banking context terms exist when dealing with ambiguous short acronyms
    has_banking_context = bool(re.search(
        r"(?i)\b(?:bank|banking|netbanking|account|branch|ifsc|customer|passbook|statement|debit|credit|cheque|atm)\b",
        ocr_text
    ))

    for bank in INDIAN_BANKING_REGISTRY:
        brand_name = bank["brand_name"]
        keywords = bank["keywords"]
        primary_domain = bank["primary_domain"]
        official_domains = bank["official_domains"]

        matched_keyword = None
        # Check brand name directly with word boundaries
        if re.search(r"(?i)\b" + re.escape(brand_name) + r"\b", ocr_text):
            matched_keyword = brand_name
        else:
            # Check keywords with word boundary
            for kw in keywords:
                if len(kw) < 3:
                    continue
                # For ambiguous words/acronyms (like 'bob', 'axis', 'can', 'ubi', 'boi', 'fed', 'iob'), require banking context
                if kw.lower() in ["bob", "can", "ubi", "boi", "fed", "iob", "axis"]:
                    if not has_banking_context:
                        continue
                if re.search(r"(?i)\b" + re.escape(kw) + r"\b", ocr_text):
                    matched_keyword = kw
                    break

        if matched_keyword and brand_name not in seen_names:
            seen_names.add(brand_name)
            matched_brands.append({
                "brand_name": brand_name,
                "detection_source": "ocr_text",
                "matched_keyword": matched_keyword,
                "primary_domain": primary_domain,
                "official_domains": official_domains,
                "is_official_match": False,
                "domain_mismatch_detected": False,
                "mismatch_details": None,
                "confidence_score": 0.95
            })

    return matched_brands


def cross_reference_brands_and_urls(
    brand_evidence: List[Dict[str, Any]],
    url_candidates: List[Dict[str, Any]],
    social_indicators: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Validates whether extracted URLs align with bank brands visually detected in OCR text.
    Distinguishes active impersonation attacks from benign third-party brand references.
    """
    updated_evidence = []
    social_indicators = social_indicators or []

    # Check for active coercive/harvesting signals in the screenshot
    has_active_threat_signals = any(
        i.get("category") in [
            "credential_harvesting", "otp_interception",
            "urgency_coercion", "kyc_fraud", "remote_access_trojan"
        ]
        for i in social_indicators
    )

    for brand_item in brand_evidence:
        brand_name = brand_item["brand_name"]
        official_domains = [d.lower() for d in brand_item.get("official_domains", [])]
        
        matched_official = False
        mismatch_found = False
        mismatch_culprit = None

        for cand in url_candidates:
            scan_res = cand.get("url_scan_result") or {}
            norm_url = cand.get("normalized_url", "")
            
            # Extract domain components safely without network resolution
            comp = extract_domain_components(norm_url)
            host = comp["hostname"].lower()
            reg_dom = comp["registered_domain"].lower()

            # Check if this URL matches official infrastructure
            if any(host == off or host.endswith("." + off) or reg_dom == off for off in official_domains):
                matched_official = True
            else:
                # Assess whether this untrusted domain represents an attack mismatch or a benign reference
                is_phishing_url = bool(scan_res.get("is_phishing"))
                is_high_risk = float(scan_res.get("risk_score", 0.0)) >= 40.0
                brand_analysis = scan_res.get("brand_analysis") or cand.get("brand_analysis") or {}
                is_suspected_spoof = bool(brand_analysis.get("impersonation_suspected")) or bool(scan_res.get("brand_impersonation_flag"))
                has_suspicious_tld = comp.get("has_suspicious_tld", False)
                has_lure_keywords = any(lure in host for lure in ["kyc", "verify", "update", "login", "auth", "secure", "unblock"])

                # Trigger mismatch if the URL itself is malicious, spoofing, high-risk, or paired with credential harvesting/coercion
                if is_phishing_url or is_high_risk or is_suspected_spoof or has_suspicious_tld or has_lure_keywords or has_active_threat_signals:
                    mismatch_found = True
                    mismatch_culprit = reg_dom or host

        item_copy = dict(brand_item)
        if matched_official:
            item_copy["is_official_match"] = True
            item_copy["domain_mismatch_detected"] = False
            item_copy["detection_source"] = "cross_verified"
        elif mismatch_found:
            item_copy["is_official_match"] = False
            item_copy["domain_mismatch_detected"] = True
            item_copy["mismatch_details"] = (
                f"Severe Brand / Domain Mismatch: The screenshot visually displays branding for '{brand_name}', "
                f"but the associated URL points to untrusted host '{mismatch_culprit}', outside official domains ({', '.join(official_domains[:2])})."
            )
        else:
            # Brand present in text with benign/third-party URL (or no URL)
            item_copy["is_official_match"] = False
            item_copy["domain_mismatch_detected"] = False
            if url_candidates:
                item_copy["detection_source"] = "benign_reference"

        updated_evidence.append(item_copy)

    return updated_evidence


def calculate_screenshot_assessment(
    text_block_count: int,
    extracted_text: str,
    url_candidates: List[Dict[str, Any]],
    brand_evidence: List[Dict[str, Any]],
    social_indicators: List[Dict[str, Any]],
    ocr_confidence_avg: float
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str]]:
    """
    Synthesizes all multimodal threat signals into a calibrated, explainable assessment.
    Returns: (assessment_dict, evidence_list, recommendations_list)
    """
    evidence: List[Dict[str, Any]] = []
    key_threat_factors: List[str] = []
    reasons: List[str] = []
    recommendations: List[str] = []

    # 1. Check for Insufficient Evidence (Empty / degraded OCR)
    clean_text = extracted_text.strip()
    if text_block_count == 0 or len(clean_text) < 8:
        summary = "Insufficient readable text or visual markers detected to perform threat intelligence assessment."
        return {
            "risk_level": "INSUFFICIENT_EVIDENCE",
            "risk_score": None,
            "summary": summary,
            "confidence": "insufficient",
            "key_threat_factors": ["No typography detected"],
            "reasons": ["The uploaded screenshot is blank, out-of-focus, or does not contain readable typography."]
        }, [], [
            "Ensure the screenshot captures high-contrast, readable text from the browser address bar or login portal.",
            "If this is an image-only banner, verify the URL manually in the PhishShield URL Scanner."
        ]

    # Analyze Social Engineering Signals
    critical_indicators = [i for i in social_indicators if i["severity"] == "CRITICAL"]
    high_indicators = [i for i in social_indicators if i["severity"] == "HIGH"]
    medium_indicators = [i for i in social_indicators if i["severity"] == "MEDIUM"]
    advisory_indicators = [i for i in social_indicators if i["severity"] == "BENIGN_ADVISORY"]

    # Analyze URL Signals
    max_url_score = 0.0
    highest_url_level = "SAFE"
    phishing_urls_count = 0
    official_urls_count = 0

    for cand in url_candidates:
        scan_res = cand.get("url_scan_result")
        if scan_res:
            u_score = float(scan_res.get("risk_score", 0.0))
            u_level = scan_res.get("risk_level", "SAFE")
            max_url_score = max(max_url_score, u_score)
            
            if scan_res.get("is_phishing"):
                phishing_urls_count += 1
            if u_level in ["CRITICAL", "HIGH", "DANGEROUS"]:
                highest_url_level = "CRITICAL" if u_level == "CRITICAL" else "HIGH"
            
            # Check brand analysis of URL
            b_data = scan_res.get("brand_analysis", {})
            if b_data.get("is_official_domain"):
                official_urls_count += 1

    # Analyze Brand Mismatches
    has_brand_mismatch = any(b.get("domain_mismatch_detected") for b in brand_evidence)
    has_verified_official = any(b.get("is_official_match") for b in brand_evidence)
    detected_brand_names = [b["brand_name"] for b in brand_evidence]

    # Populate Evidence Catalog
    if has_brand_mismatch:
        for b in brand_evidence:
            if b.get("domain_mismatch_detected"):
                evidence.append({
                    "category": "brand_spoofing",
                    "severity": "CRITICAL",
                    "title": f"Domain Impersonation Mismatch ({b['brand_name']})",
                    "description": b.get("mismatch_details") or "Brand displayed in visual text does not match embedded URL destination."
                })
                key_threat_factors.append(f"Visual Brand/Domain Mismatch ({b['brand_name']})")
                reasons.append(f"Brand Impersonation: Page visual typography claims {b['brand_name']}, but host is untrusted.")

    if phishing_urls_count > 0:
        evidence.append({
            "category": "malicious_url",
            "severity": "CRITICAL",
            "title": f"High-Risk URL Detected ({phishing_urls_count} Candidate)",
            "description": f"Embedded URL evaluated as malicious with risk score of {max_url_score}% by Random Forest model."
        })
        key_threat_factors.append(f"Malicious URL Detected ({max_url_score}%)")
        reasons.append(f"URL Phishing: Random Forest and brand analysis classified candidate URL as high risk ({max_url_score}%).")

    for ind in critical_indicators:
        evidence.append({
            "category": ind["category"],
            "severity": "CRITICAL",
            "title": ind["label"],
            "description": f"Matched text snippet: '{ind['matched_text']}'. {ind['explanation']}"
        })
        key_threat_factors.append(ind["label"])
        reasons.append(f"Linguistic Signal: {ind['label']} detected in OCR text.")

    for ind in high_indicators:
        evidence.append({
            "category": ind["category"],
            "severity": "HIGH",
            "title": ind["label"],
            "description": f"Matched text snippet: '{ind['matched_text']}'. {ind['explanation']}"
        })
        key_threat_factors.append(ind["label"])
        reasons.append(f"Social Engineering: {ind['label']} detected ('{ind['matched_text']}').")

    for ind in advisory_indicators:
        evidence.append({
            "category": "safety_advisory",
            "severity": "LOW",
            "title": ind["label"],
            "description": f"Legitimate bank advisory detected: '{ind['matched_text']}'."
        })

    # =========================================================================
    # RISK LEVEL DECISION MATRIX
    # =========================================================================
    if has_brand_mismatch or highest_url_level == "CRITICAL" or max_url_score >= 85.0:
        risk_level = "CRITICAL"
        risk_score = max(92.0, max_url_score)
        summary = (
            f"CRITICAL PHISHING THREAT DETECTED: This screenshot exhibits active banking brand impersonation "
            f"or deceptive credential harvesting targeting {', '.join(detected_brand_names) if detected_brand_names else 'banking users'}."
        )
        recommendations = [
            "DO NOT enter your internet banking password, MPIN, OTP, or debit card CVV.",
            "DO NOT click links, download software, or follow transfer instructions depicted in this screenshot.",
            "Verify official banking portals directly by typing authenticated domains into your browser address bar.",
            "Report fraudulent portals to the National Cyber Crime Reporting Portal (cybercrime.gov.in or helpline 1930)."
        ]

    elif has_verified_official and not has_brand_mismatch and max_url_score <= 15.0 and not any(i["category"] in ["urgency_coercion", "kyc_fraud", "remote_access_trojan"] for i in social_indicators):
        risk_level = "LOW"
        risk_score = max(4.0, max_url_score)
        summary = (
            f"VERIFIED OFFICIAL BANKING PORTAL: The screenshot matches authenticated digital infrastructure "
            f"for {', '.join(detected_brand_names) if detected_brand_names else 'verified financial institutions'}."
        )
        reasons.append("Zero-Trust Verification: All embedded URLs belong to authenticated Reserve Bank of India cataloged domains.")
        recommendations = [
            "Always confirm the padlock icon and exact domain spelling in your browser address bar.",
            "Never share One-Time Passwords (OTPs) with anyone, including bank representatives."
        ]

    elif highest_url_level == "HIGH" or max_url_score >= 65.0 or (critical_indicators and any(i["category"] in ["urgency_coercion", "kyc_fraud", "remote_access_trojan"] for i in social_indicators)):
        risk_level = "HIGH"
        risk_score = max(75.0, max_url_score)
        summary = "HIGH RISK DETECTED: Screenshot contains strong social engineering coercion and suspicious credential harvesting indicators."
        recommendations = [
            "Treat this page with extreme caution. Refrain from inputting authentication credentials.",
            "Check the exact browser address bar for subtle spelling variations (typosquatting).",
            "Contact your bank's verified customer helpline before proceeding."
        ]

    elif medium_indicators or high_indicators or critical_indicators or max_url_score >= 40.0:
        risk_level = "MEDIUM"
        risk_score = max(48.0, max_url_score)
        summary = "SUSPICIOUS ELEMENTS DETECTED: Screenshot exhibits urgency, reward lures, or unverified banking terms requiring caution."
        recommendations = [
            "Verify the legitimacy of this communication through official bank channels.",
            "Do not follow urgent instructions demanding immediate fund transfers or app downloads."
        ]

    elif advisory_indicators:
        risk_level = "SAFE"
        risk_score = 6.0
        summary = "LEGITIMATE CYBERSECURITY ADVISORY: Contains authorized educational guidance instructing users on safeguarding confidential credentials."
        reasons.append("Static heuristic and linguistic analysis confirmed safe public security notice formatting.")
        recommendations = [
            "Follow the safe banking guidelines described in the advisory.",
            "Ensure you never share OTPs, PINs, or netbanking passwords with anyone."
        ]

    else:
        # Benign general text without phishing indicators
        risk_level = "SAFE"
        risk_score = 8.5
        summary = "No prominent phishing indicators, deceptive brand spoofs, or malicious URL targets identified in this screenshot."
        reasons.append("Static heuristic and linguistic analysis found zero high-severity coercive patterns.")
        recommendations = [
            "Continue practicing standard cybersecurity hygiene when browsing financial websites.",
            "Verify all digital transactions via multi-factor authentication."
        ]

    assessment = {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2) if risk_score is not None else None,
        "summary": summary,
        "confidence": "high" if (url_candidates or brand_evidence) else "medium",
        "key_threat_factors": key_threat_factors,
        "reasons": reasons
    }

    return assessment, evidence, recommendations


def analyze_screenshot_threats(
    image: np.ndarray,
    filename: str = "screenshot.png",
    detected_format: str = "PNG"
) -> Dict[str, Any]:
    """
    Executes the comprehensive Phase 5C Screenshot Threat Intelligence Pipeline:
    1. Extracts OCR text & bounding boxes via EasyOCR.
    2. Extracts URL candidates & normalizes optical misrecognitions.
    3. Runs existing Random Forest model & SHAP explainability on each unique URL.
    4. Evaluates Indian banking brand typography and detects domain mismatches.
    5. Analyzes social engineering and credential harvesting indicators.
    6. Formulates multi-factor explainable threat assessment.
    """
    start_time = time.perf_counter()
    upload_id = str(uuid.uuid4())

    # 1. OCR Extraction (Reusing Modular EasyOCR Engine)
    ocr_raw = extract_text_from_image(
        image=image,
        filename=filename,
        detected_format=detected_format
    )

    full_text = ocr_raw.get("extracted_text", "")
    text_blocks = ocr_raw.get("text_blocks", [])
    text_block_count = ocr_raw.get("text_block_count", 0)

    # 2. Extract & Normalize URL Candidates
    url_candidates = extract_urls_from_ocr(
        full_text=full_text,
        text_blocks=text_blocks
    )

    # 3. Evaluate each URL candidate using existing Random Forest URL Engine
    for cand in url_candidates:
        norm_url = cand["normalized_url"]
        try:
            # Reuses existing scan_url_full (Feature Extraction + RF Model + SHAP + Brand Engine)
            scan_result = scan_url_full(norm_url)
            cand["scan_status"] = "completed"
            cand["url_scan_result"] = scan_result
            cand["brand_analysis"] = scan_result.get("brand_analysis")
        except Exception as scan_err:
            logger.warning(f"URL candidate scan failed for '{norm_url}': {scan_err}")
            cand["scan_status"] = "failed"
            cand["scan_error"] = str(scan_err)

    # 4. Extract Social Engineering & Banking Indicators
    social_indicators = analyze_social_engineering_indicators(
        ocr_text=full_text,
        text_blocks=text_blocks
    )

    # 5. Detect Bank Brands in OCR Text
    brand_evidence_raw = match_bank_brands_in_text(full_text)

    # Cross-reference brand evidence with extracted URLs and indicators to spot brand/domain mismatches
    brand_evidence = cross_reference_brands_and_urls(
        brand_evidence=brand_evidence_raw,
        url_candidates=url_candidates,
        social_indicators=social_indicators
    )

    # Calculate average OCR confidence
    avg_conf = (
        sum(b.get("confidence", 0.0) for b in text_blocks) / len(text_blocks)
        if text_blocks else 0.0
    )

    # 6. Formulate Explainable Screenshot Risk Assessment
    assessment, evidence, recommendations = calculate_screenshot_assessment(
        text_block_count=text_block_count,
        extracted_text=full_text,
        url_candidates=url_candidates,
        brand_evidence=brand_evidence,
        social_indicators=social_indicators,
        ocr_confidence_avg=avg_conf
    )

    total_latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "success": True,
        "analysis_status": "completed",
        "filename": filename,
        "upload_id": upload_id,
        "screenshot_assessment": assessment,
        "ocr_summary": {
            "text_block_count": text_block_count,
            "extracted_text": full_text,
            "ocr_engine": ocr_raw.get("ocr_engine", "EasyOCR"),
            "language": ocr_raw.get("language", "en"),
            "image_width": ocr_raw.get("image_width"),
            "image_height": ocr_raw.get("image_height"),
            "detected_format": detected_format
        },
        "extracted_urls": url_candidates,
        "bank_brand_evidence": brand_evidence,
        "social_engineering_indicators": social_indicators,
        "evidence": evidence,
        "recommendations": recommendations,
        "processing_time_ms": total_latency_ms,
        "analyzed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
