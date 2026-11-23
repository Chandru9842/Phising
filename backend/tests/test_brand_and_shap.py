"""
Pytest Test Suite for PhishShield Priority 2:
- Banking Brand Impersonation Detection (Module A)
- SHAP TreeExplainer Explainability (Module B)
- Unified Risk Assessment Engine (Module C)
- API Integration & Backward Compatibility (Module D)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.feature_extraction import FEATURE_NAMES
from app.ml.brand_detection import (
    detect_brand_impersonation,
    damerau_levenshtein_distance,
    keyword_matches_token,
)
from app.ml.shap_explainer import explain_url_prediction, clear_explainer_cache
from app.core.risk_engine import evaluate_unified_risk
from app.ml.predict import scan_url_full, predict_url_phishing


client = TestClient(app)


# =====================================================================
# 1. Module A: Brand Detection & Impersonation Tests
# =====================================================================

def test_damerau_levenshtein_distance():
    # Exact
    assert damerau_levenshtein_distance("onlinesbi", "onlinesbi") == 0
    # Substitution
    assert damerau_levenshtein_distance("onlinesbi", "onlinesb1") == 1
    # Adjacent Transposition
    assert damerau_levenshtein_distance("onlinesbi", "onlinsebi") == 1
    # Insertion
    assert damerau_levenshtein_distance("hdfcbank", "hdfcbankk") == 1
    # Deletion
    assert damerau_levenshtein_distance("icicibank", "icibank") == 2


def test_token_boundary_prevents_false_positives():
    # 'bob' shouldn't trigger on 'bobcat'
    assert not keyword_matches_token("bob", "bobcat")
    assert keyword_matches_token("bob", "bob")
    assert keyword_matches_token("bob", "login-bob-portal")
    assert keyword_matches_token("bob", "bob.bank.in")

    # 'sbi' shouldn't trigger on 'disability'
    assert not keyword_matches_token("sbi", "disability")
    assert keyword_matches_token("sbi", "sbi.portal.com")
    assert keyword_matches_token("sbi", "sbi-kyc")


def test_official_banking_domains_verified():
    official_urls = [
        ("https://retail.onlinesbi.sbi/retail/login.htm", "State Bank of India"),
        ("https://infinity.icicibank.com/corp/AuthenticationController", "ICICI Bank"),
        ("https://netbanking.hdfcbank.com/netbanking/", "HDFC Bank"),
        ("https://www.kotak.com/en/home.html", "Kotak Mahindra Bank"),
        ("https://pnbindia.in/personal.html", "Punjab National Bank"),
    ]

    for url, expected_brand in official_urls:
        result = detect_brand_impersonation(url)
        assert result["is_official_domain"] is True, f"Failed for official domain: {url}"
        assert result["impersonation_suspected"] is False
        assert result["match_type"] == "EXACT_OFFICIAL"
        assert result["similarity_score"] == 1.0
        assert result["edit_distance"] == 0
        assert result["detected_brand"] == expected_brand


def test_typosquatting_detection():
    typos = [
        ("http://onlinesb1.sbi/login", "State Bank of India", 1),
        ("http://hdfcbamk.com/login", "HDFC Bank", 1),
        ("http://1cicibank.com/netbanking", "ICICI Bank", 1),
    ]

    for url, expected_brand, expected_dist in typos:
        result = detect_brand_impersonation(url)
        assert result["impersonation_suspected"] is True, f"Failed typosquat detection: {url}"
        assert result["is_official_domain"] is False
        assert result["match_type"] == "TYPOSQUATTING"
        assert result["detected_brand"] == expected_brand
        assert result["edit_distance"] == expected_dist
        assert result["similarity_score"] >= 0.80


def test_subdomain_spoofing_detection():
    spoof_url = "http://sbi.kyc-verification-update.com/pan"
    result = detect_brand_impersonation(spoof_url)

    assert result["impersonation_suspected"] is True
    assert result["is_official_domain"] is False
    assert result["match_type"] == "SUBDOMAIN_SPOOFING"
    assert result["detected_brand"] == "State Bank of India"
    assert "subdomain" in result["reasons"][0].lower()


def test_suspicious_brand_lure_combo_detection():
    combo_url = "http://onlinesbi-pan-kyc-verification.com/login.php"
    result = detect_brand_impersonation(combo_url)

    assert result["impersonation_suspected"] is True
    assert result["is_official_domain"] is False
    assert result["match_type"] == "SUSPICIOUS_KEYWORD_COMBO"
    assert result["detected_brand"] == "State Bank of India"
    assert any("kyc" in r.lower() or "lure" in r.lower() for r in result["reasons"])


def test_path_spoofing_detection():
    path_url = "http://untrusted-external-server.com/onlinesbi/login.html"
    result = detect_brand_impersonation(path_url)

    assert result["impersonation_suspected"] is True
    assert result["is_official_domain"] is False
    assert result["match_type"] == "PATH_SPOOFING"
    assert result["detected_brand"] == "State Bank of India"


def test_benign_unrelated_domains_have_no_impersonation():
    benign_urls = [
        "https://en.wikipedia.org/wiki/Computer_security",
        "https://github.com/fastapi/fastapi",
        "https://www.google.com/search?q=cybersecurity",
        "https://bobcat.com/equipment",
    ]

    for url in benign_urls:
        result = detect_brand_impersonation(url)
        assert result["is_official_domain"] is False
        assert result["impersonation_suspected"] is False
        assert result["match_type"] == "NONE"
        assert result["detected_brand"] is None


# =====================================================================
# 2. Module B: SHAP TreeExplainer Tests
# =====================================================================

def test_shap_explanation_features_and_shape():
    target_url = "http://onlinesbi-pan-kyc-verification.com/login.php"
    shap_res = explain_url_prediction(target_url)

    # Base value and model output checks
    assert isinstance(shap_res["base_value"], float)
    assert 0.0 <= shap_res["base_value"] <= 1.0
    assert isinstance(shap_res["model_output"], float)
    assert 0.0 <= shap_res["model_output"] <= 1.0

    # Strict 26-feature preservation
    all_contribs = shap_res["all_feature_contributions"]
    assert len(all_contribs) == len(FEATURE_NAMES)
    feature_names_extracted = [c["feature_name"] for c in all_contribs]
    assert feature_names_extracted == FEATURE_NAMES

    # Direction categorization
    for c in all_contribs:
        assert c["direction"] in ["RISK_INCREASING", "RISK_DECREASING", "NEUTRAL"]
        assert "description" in c and len(c["description"]) > 0

    # Top contributors are non-empty and sorted
    pos = shap_res["top_positive_contributors"]
    neg = shap_res["top_negative_contributors"]
    assert len(pos) > 0
    assert len(neg) > 0
    # Positive contributors must be positive
    for p in pos:
        assert p["shap_value"] > 0
    # Negative contributors must be negative
    for n in neg:
        assert n["shap_value"] < 0

    assert "summary" in shap_res and len(shap_res["summary"]) > 0


def test_shap_explainer_missing_model_handling():
    clear_explainer_cache()
    with pytest.raises(FileNotFoundError):
        explain_url_prediction("https://example.com", model_path="missing_file.joblib")


# =====================================================================
# 3. Module C: Unified Risk Assessment Engine Tests
# =====================================================================

def test_risk_engine_official_bank_domain_override():
    # Even if ML model were to produce a false positive on a complex banking link,
    # Zero-Trust verification forces the risk down to LOW
    mock_ml = {
        "risk_score": 65.0,
        "probabilities": {"legitimate": 0.35, "phishing": 0.65},
        "is_phishing": True,
        "features": {},
    }
    mock_brand = {
        "is_official_domain": True,
        "impersonation_suspected": False,
        "match_type": "EXACT_OFFICIAL",
        "detected_brand": "State Bank of India",
        "official_domain": "onlinesbi.sbi",
        "reasons": ["Verified authentic banking portal."],
    }

    assessment = evaluate_unified_risk("https://retail.onlinesbi.sbi/login", mock_ml, mock_brand)
    assert assessment["risk_level"] == "LOW"
    assert assessment["risk_score"] <= 5.0
    assert assessment["is_phishing"] is False
    assert assessment["recommendation"] == "SAFE_TO_PROCEED"


def test_risk_engine_brand_impersonation_escalation():
    mock_ml = {
        "risk_score": 50.0,
        "probabilities": {"legitimate": 0.50, "phishing": 0.50},
        "is_phishing": False,
        "features": {},
    }
    mock_brand = {
        "is_official_domain": False,
        "impersonation_suspected": True,
        "match_type": "TYPOSQUATTING",
        "detected_brand": "State Bank of India",
        "reasons": ["Typosquatting detected."],
    }

    assessment = evaluate_unified_risk("http://onlinesb1.sbi/login", mock_ml, mock_brand)
    assert assessment["risk_level"] == "CRITICAL"
    assert assessment["risk_score"] >= 90.0
    assert assessment["is_phishing"] is True
    assert assessment["recommendation"] == "BLOCK_AND_REPORT"


# =====================================================================
# 4. Module D: API Endpoints & Regression Tests
# =====================================================================

def test_api_scan_endpoint_official_bank():
    res = client.post("/api/v1/urls/scan", json={"url": "https://retail.onlinesbi.sbi/retail/login.htm"})
    assert res.status_code == 200
    data = res.json()

    # Core backward-compatible fields
    assert "url" in data
    assert "is_phishing" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert "probabilities" in data
    assert "features" in data
    assert len(data["features"]) == 26

    # New Module A brand fields
    assert "brand_analysis" in data
    assert data["brand_analysis"]["is_official_domain"] is True
    assert data["brand_analysis"]["detected_brand"] == "State Bank of India"

    # New Module B SHAP fields
    assert "shap_explanation" in data
    assert "base_value" in data["shap_explanation"]
    assert "top_positive_contributors" in data["shap_explanation"]

    # New Module C Risk Assessment fields
    assert "risk_assessment" in data
    assert data["risk_assessment"]["recommendation"] == "SAFE_TO_PROCEED"
    assert data["risk_level"] == "LOW"


def test_api_scan_endpoint_brand_impersonation():
    res = client.post("/api/v1/urls/scan", json={"url": "http://onlinesbi-pan-kyc-verification.com/login.php"})
    assert res.status_code == 200
    data = res.json()

    assert data["is_phishing"] is True
    assert data["risk_level"] == "CRITICAL"
    assert data["risk_score"] >= 85.0
    assert data["brand_impersonation_flag"] is True
    assert data["brand_analysis"]["impersonation_suspected"] is True
    assert data["risk_assessment"]["recommendation"] == "BLOCK_AND_REPORT"


def test_api_scan_endpoint_invalid_inputs():
    # Empty string
    r1 = client.post("/api/v1/urls/scan", json={"url": ""})
    assert r1.status_code == 400

    # Whitespace only
    r2 = client.post("/api/v1/urls/scan", json={"url": "   "})
    assert r2.status_code == 400


def test_api_model_diagnostics():
    res = client.get("/api/v1/urls/model-info")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert "metadata" in data
    assert data["metadata"]["feature_count"] == 26
