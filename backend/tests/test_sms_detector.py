"""
Pytest Test Suite for PhishShield Priority 3:
- SMS Preprocessing & URL Extraction
- TF-IDF + Logistic Regression Model Pipeline & Benchmarks
- Multi-URL Integration with Existing Backend Engine
- API Endpoints & Error Handling
"""

import os
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.ml.sms.sms_preprocessing import (
    extract_urls_from_text,
    clean_sms_text,
    detect_smishing_keywords,
)
from app.ml.sms.sms_dataset_loader import (
    load_sms_dataset,
    split_sms_dataset,
)
from app.ml.sms.sms_classifier import SMSPhishingClassifier
from app.ml.sms.predict_sms import (
    predict_sms_text,
    scan_sms_comprehensive,
    clear_sms_classifier_cache,
    DEFAULT_SMS_MODEL_PATH,
)

client = TestClient(app)


# =====================================================================
# 1. URL Extraction from SMS Text Tests
# =====================================================================

def test_extract_single_url():
    sms = "Dear customer, your account is suspended. Verify at http://sbi-verify.com/login now."
    urls = extract_urls_from_text(sms)
    assert len(urls) == 1
    assert urls[0] == "http://sbi-verify.com/login"


def test_extract_multiple_urls():
    sms = (
        "Urgent: Check your statement at https://retail.onlinesbi.sbi/login "
        "or alternate mirror http://sbi-kyc.in/pan immediately!"
    )
    urls = extract_urls_from_text(sms)
    assert len(urls) == 2
    assert "https://retail.onlinesbi.sbi/login" in urls
    assert "http://sbi-kyc.in/pan" in urls


def test_extract_shortener_urls():
    sms = "You won Rs 50000. Claim here: bit.ly/sbi-bonus or tinyurl.com/bank-claim."
    urls = extract_urls_from_text(sms)
    assert len(urls) >= 2
    assert any("bit.ly/sbi-bonus" in u for u in urls)
    assert any("tinyurl.com/bank-claim" in u for u in urls)


def test_extract_url_strips_trailing_punctuation():
    sms = "Visit http://mybank.com/portal."
    urls = extract_urls_from_text(sms)
    assert len(urls) == 1
    assert urls[0] == "http://mybank.com/portal"

    sms2 = "Check (https://bank.in/auth)!"
    urls2 = extract_urls_from_text(sms2)
    assert len(urls2) == 1
    assert urls2[0] == "https://bank.in/auth"


def test_extract_urls_empty_when_no_urls():
    sms = "349812 is your OTP for NetBanking login. Valid for 10 minutes. Do not share with anyone."
    urls = extract_urls_from_text(sms)
    assert urls == []
    assert len(urls) == 0


def test_extract_urls_invalid_inputs():
    assert extract_urls_from_text("") == []
    assert extract_urls_from_text("   ") == []
    assert extract_urls_from_text(None) == []


# =====================================================================
# 2. SMS Preprocessing & Keyword Preservation Tests
# =====================================================================

def test_clean_sms_text_preserves_critical_indicators():
    raw = "URGENT: Your SBI bank account is BLOCKED! Verify KYC and PAN immediately at http://evil.com/login."
    cleaned = clean_sms_text(raw, replace_urls=True)

    # Must preserve keywords
    cleaned_lower = cleaned.lower()
    for kw in ["urgent", "sbi", "bank", "account", "blocked", "verify", "kyc", "pan"]:
        assert kw in cleaned_lower, f"Keyword '{kw}' was dropped from cleaned text!"

    # Must replace URL with <URL> token
    assert "<URL>" in cleaned
    assert "http://evil.com/login" not in cleaned


def test_detect_smishing_keywords():
    text = "Dear customer, your YONO account is blocked today due to pending KYC and PAN verification."
    keywords = detect_smishing_keywords(text)

    expected = {"account", "blocked", "kyc", "pan", "today", "verification", "yono"}
    assert expected.issubset(set(keywords))


def test_clean_sms_text_raises_on_invalid():
    with pytest.raises(ValueError):
        clean_sms_text("")

    with pytest.raises(ValueError):
        clean_sms_text("    ")

    with pytest.raises(ValueError):
        clean_sms_text(None)


# =====================================================================
# 3. Dataset Loader & Stratified Split Tests
# =====================================================================

def test_sms_dataset_loader_missing_columns(tmp_path):
    bad_csv = tmp_path / "bad_sms.csv"
    pd.DataFrame({"unrelated": [1, 2]}).to_csv(bad_csv, index=False)

    with pytest.raises(ValueError, match="must contain 'message' and 'label'"):
        load_sms_dataset(str(bad_csv))


def test_sms_dataset_loader_missing_file():
    with pytest.raises(FileNotFoundError):
        load_sms_dataset("non_existent_sms_file.csv")


def test_sms_dataset_stratified_split(tmp_path):
    mock_csv = tmp_path / "mock_sms.csv"
    data = [
        {"message": f"Legit message {i}", "label": "ham"} for i in range(80)
    ] + [
        {"message": f"Spam message {j}", "label": "spam"} for j in range(20)
    ]
    pd.DataFrame(data).to_csv(mock_csv, index=False)

    df = load_sms_dataset(str(mock_csv))
    assert len(df) == 100
    assert set(df["label"].unique()) == {0, 1}

    train_df, test_df = split_sms_dataset(df, test_size=0.20, random_state=42)
    assert len(train_df) == 80
    assert len(test_df) == 20

    # Class distribution ratio preserved
    assert abs(train_df["label"].mean() - 0.20) < 0.05
    assert abs(test_df["label"].mean() - 0.20) < 0.05


# =====================================================================
# 4. Model Training, Persistence & Loading Lifecycle
# =====================================================================

def test_sms_model_training_and_serialization(tmp_path):
    # Controlled mock training data
    train_texts = [
        "Your account is blocked, update KYC at <URL> immediately",
        "Urgent: You won cash prize, call now to claim",
        "PAN verification required to prevent bank account suspension",
        "Dear customer your credit card is blocked call support",
        "Hello are we still meeting for lunch today?",
        "Can you send me the project report by evening",
        "Thanks for your help with the homework yesterday",
        "Your package has been delivered to your front door",
    ]
    train_labels = [1, 1, 1, 1, 0, 0, 0, 0]

    clf = SMSPhishingClassifier(max_features=100, random_state=42)
    assert not clf.is_trained

    clf.train(train_texts, train_labels)
    assert clf.is_trained
    assert clf.metadata["vocabulary_size"] > 0

    # Predictions
    preds = clf.predict(["urgent account blocked update KYC"])
    assert preds[0] == 1
    probs = clf.predict_proba(["lunch today"])
    assert np.allclose(probs.sum(), 1.0)

    # Save & Load
    save_file = str(tmp_path / "test_sms_model.joblib")
    clf.save(save_file)
    assert os.path.exists(save_file)

    loaded = SMSPhishingClassifier.load(save_file)
    assert loaded.is_trained
    loaded_preds = loaded.predict(["urgent account blocked update KYC"])
    assert loaded_preds[0] == 1


def test_predict_sms_raises_on_missing_model():
    clear_sms_classifier_cache()
    with pytest.raises(FileNotFoundError, match="Trained SMS model artifact not found"):
        predict_sms_text("Hello world", model_path="non_existent_sms_model.joblib")


# =====================================================================
# 5. Multi-URL Integration with Existing Backend Engine Tests
# =====================================================================

def test_scan_sms_with_phishing_url_escalation():
    # Smishing message with fake SBI KYC link
    sms = (
        "Dear SBI User, your YONO account is blocked today due to pending KYC. "
        "Click http://onlinesbi-pan-kyc-verification.com/login.php to update immediately."
    )
    result = scan_sms_comprehensive(sms)

    assert result["is_smishing"] is True
    assert result["composite_risk_level"] == "CRITICAL"
    assert result["composite_risk_score"] >= 90.0
    assert result["recommendation"] == "BLOCK_AND_REPORT"
    assert result["target_brand"] == "State Bank of India"
    assert result["url_count"] == 1

    # Check that the extracted URL was scanned by the existing URL engine
    url_scan = result["url_scan_results"][0]
    assert url_scan["url"] == "http://onlinesbi-pan-kyc-verification.com/login.php"
    assert url_scan["is_phishing"] is True
    assert url_scan["brand_analysis"]["impersonation_suspected"] is True
    assert "shap_explanation" in url_scan


def test_scan_sms_with_official_banking_url():
    # Authentic transactional SMS with official SBI link
    sms = (
        "Dear SBI Customer, your A/C ending 4589 is credited with Rs 45,000.00 on 15-Nov-26 by NEFT. "
        "Available Bal: Rs 68,450.00. Official portal: https://retail.onlinesbi.sbi/retail/login.htm -State Bank of India"
    )
    result = scan_sms_comprehensive(sms)

    assert result["is_smishing"] is False
    assert result["composite_risk_level"] == "LOW"
    assert result["composite_risk_score"] <= 15.0
    assert result["recommendation"] == "SAFE_TO_PROCEED"
    assert result["url_count"] == 1
    assert result["url_scan_results"][0]["brand_analysis"]["is_official_domain"] is True


def test_scan_sms_legitimate_otp_without_url():
    sms = "349812 is your OTP for login to SBI NetBanking. Do not share this OTP with anyone, including bank staff. Valid for 10 minutes. -State Bank of India"
    result = scan_sms_comprehensive(sms)

    assert result["is_smishing"] is False
    assert result["composite_risk_level"] == "LOW"
    assert result["url_count"] == 0
    assert result["extracted_urls"] == []
    assert result["url_scan_results"] == []


def test_scan_sms_multiple_urls():
    sms = (
        "Verify your HDFC account at http://hdfcbank-rewardpoint-redeem.in/claim "
        "or portal http://onlinesbi-pan-kyc-verification.com/login.php now!"
    )
    result = scan_sms_comprehensive(sms)

    assert result["is_smishing"] is True
    assert result["url_count"] == 2
    assert len(result["url_scan_results"]) == 2
    assert result["composite_risk_level"] == "CRITICAL"


# =====================================================================
# 6. API Endpoints Integration Tests
# =====================================================================

def test_api_sms_scan_endpoint_smishing():
    payload = {
        "message": "Electricity Power Cut Alert: Your power will be disconnected at 9:30 PM due to unpaid bill. Pay at http://ebill-update.xyz immediately."
    }
    res = client.post("/api/v1/sms/scan", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "message" in data
    assert "is_smishing" in data
    assert "composite_risk_score" in data
    assert "composite_risk_level" in data
    assert "recommendation" in data
    assert "sms_text_analysis" in data
    assert "extracted_urls" in data
    assert "url_scan_results" in data
    assert len(data["extracted_urls"]) == 1
    assert data["composite_risk_level"] in ["HIGH", "CRITICAL"]


def test_api_sms_scan_endpoint_empty():
    res = client.post("/api/v1/sms/scan", json={"message": ""})
    assert res.status_code == 400

    res2 = client.post("/api/v1/sms/scan", json={"message": "   "})
    assert res2.status_code == 400


def test_api_sms_model_diagnostics():
    res = client.get("/api/v1/sms/model-info")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert "metadata" in data
    assert "evaluation_metrics" in data["metadata"]
    assert data["metadata"]["evaluation_metrics"]["accuracy"] >= 0.95
