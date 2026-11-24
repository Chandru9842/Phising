"""
PhishShield Multilingual Localization Test Suite
Tests user-selectable language support across all 5 supported languages:
1. English ('en')
2. Tamil ('ta')
3. Telugu ('te')
4. Kannada ('kn')
5. Malayalam ('ml')

Verifies:
- Language normalization & fallback logic
- Localized directives and recommendations for URL and SMS scans
- Preservation of raw URLs, domain names, features, and scores
- Header parsing and backward compatibility
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.localization import (
    SUPPORTED_LANGUAGES,
    normalize_language_code,
    get_localized_directive,
    get_localized_risk_level,
    get_localized_recommendation,
    localize_unified_risk_assessment
)

client = TestClient(app)


def test_supported_languages_set():
    """Verify exactly the five required languages are supported."""
    expected = {"en", "ta", "te", "kn", "ml"}
    assert SUPPORTED_LANGUAGES == expected


@pytest.mark.parametrize("header_value,expected", [
    ("en", "en"),
    ("ta", "ta"),
    ("te", "te"),
    ("kn", "kn"),
    ("ml", "ml"),
    ("ta-IN,ta;q=0.9,en;q=0.8", "ta"),
    ("te-IN,te;q=0.9", "te"),
    ("kn-IN", "kn"),
    ("ml-IN", "ml"),
    ("fr-FR,fr;q=0.9", "en"),  # Unsupported defaults to English
    ("", "en"),
    (None, "en"),
])
def test_normalize_language_code(header_value, expected):
    """Verify parsing and fallback to English for invalid/missing language codes."""
    assert normalize_language_code(header_value) == expected


def test_directives_translated_across_all_languages():
    """Verify all 4 core directives have non-empty translations in all 5 languages."""
    directives = [
        "BLOCK_AND_REPORT",
        "DO_NOT_ENTER_CREDENTIALS",
        "PROCEED_WITH_CAUTION",
        "SAFE_TO_PROCEED"
    ]
    for d in directives:
        for lang in SUPPORTED_LANGUAGES:
            localized = get_localized_directive(d, lang=lang)
            assert localized is not None
            assert len(localized) > 0
            if lang != "en":
                # Must not be identical to the English directive string
                en_val = get_localized_directive(d, lang="en")
                assert localized != en_val


def test_risk_levels_translated_across_all_languages():
    """Verify all risk levels have valid localized text in all 5 languages."""
    levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"]
    for lvl in levels:
        for lang in SUPPORTED_LANGUAGES:
            lbl = get_localized_risk_level(lvl, lang=lang)
            assert lbl is not None
            assert len(lbl) > 0


def test_safety_recommendations_with_brand_interpolation():
    """Verify recommendation templates correctly interpolate brand names in regional languages."""
    for lang in SUPPORTED_LANGUAGES:
        rec = get_localized_recommendation("BRAND_IMPERSONATION", brand="State Bank of India", lang=lang)
        assert "State Bank of India" in rec
        assert len(rec) > 20


def test_url_scan_localized_via_accept_language_header():
    """Verify /api/v1/urls/scan returns localized risk assessment when Accept-Language is passed."""
    payload = {"url": "https://onlinesbi.sbi"}
    
    # 1. Test in Tamil
    res_ta = client.post(
        "/api/v1/urls/scan",
        json=payload,
        headers={"Accept-Language": "ta"}
    )
    assert res_ta.status_code == 200
    data_ta = res_ta.json()
    assert "risk_assessment" in data_ta
    assessment_ta = data_ta["risk_assessment"]
    assert assessment_ta.get("language") == "ta"
    assert "வழிகாட்டுதல்" in assessment_ta.get("localized_directive", "")
    assert data_ta["url"] == "https://onlinesbi.sbi"  # URL remains intact!

    # 2. Test in Telugu
    res_te = client.post(
        "/api/v1/urls/scan",
        json=payload,
        headers={"Accept-Language": "te"}
    )
    assert res_te.status_code == 200
    data_te = res_te.json()
    assessment_te = data_te["risk_assessment"]
    assert assessment_te.get("language") == "te"
    assert "ఆదేశం" in assessment_te.get("localized_directive", "")

    # 3. Test in Kannada
    res_kn = client.post(
        "/api/v1/urls/scan",
        json=payload,
        headers={"Accept-Language": "kn"}
    )
    assert res_kn.status_code == 200
    data_kn = res_kn.json()
    assessment_kn = data_kn["risk_assessment"]
    assert assessment_kn.get("language") == "kn"
    assert "ನಿರ್ದೇಶನ" in assessment_kn.get("localized_directive", "")

    # 4. Test in Malayalam
    res_ml = client.post(
        "/api/v1/urls/scan",
        json=payload,
        headers={"Accept-Language": "ml"}
    )
    assert res_ml.status_code == 200
    data_ml = res_ml.json()
    assessment_ml = data_ml["risk_assessment"]
    assert assessment_ml.get("language") == "ml"
    assert "നിർദ്ദേശം" in assessment_ml.get("localized_directive", "")

    # 5. Default English when header omitted
    res_en = client.post("/api/v1/urls/scan", json=payload)
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert data_en["risk_assessment"].get("language") == "en"


def test_sms_scan_localized_via_accept_language_header():
    """Verify /api/v1/sms/scan returns localized recommendations when requested."""
    sms_payload = {
        "message": "Dear customer, your SBI account is blocked! Update KYC immediately: http://onlinesbi-pan-kyc-verification.com/login.php"
    }

    # Test in Tamil
    res = client.post(
        "/api/v1/sms/scan",
        json=sms_payload,
        headers={"Accept-Language": "ta"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("language") == "ta"
    assert data.get("localized_directive") == "வழிகாட்டுதல்: தடுத்து புகாரளிக்கவும்"
    assert "1909" in data.get("recommendation_text", "")
    assert "1930" in data.get("recommendation_text", "")
    assert data["message"] == sms_payload["message"]  # Raw message preserved!
