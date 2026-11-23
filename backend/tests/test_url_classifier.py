"""
Pytest Test Suite for PhishShield URL Feature Extraction, Classification & Inference

Verifies:
1. Feature extraction correctness and semantic behaviors.
2. Feature ordering consistency between dict and vector representations.
3. Robust handling of invalid/malformed URLs without network calls.
4. Dataset loading, validation, and domain-grouped leak-free partitioning.
5. Model training, serialization, deserialization lifecycle.
6. Error handling when model artifacts are missing (preventing fake predictions).
"""

import os
import pytest
import numpy as np
import pandas as pd

from app.ml.feature_extraction import (
    FEATURE_NAMES,
    extract_features_dict,
    extract_features_vector,
    has_ip_address,
    calculate_entropy,
    sanitize_and_parse_url,
    detect_brand_impersonation_feature,
)
from app.ml.url_classifier import URLPhishingClassifier
from app.ml.dataset_loader import (
    load_url_dataset,
    split_dataset_by_domain,
    extract_registered_domain,
)
from app.ml.predict import (
    predict_url_phishing,
    clear_classifier_cache,
    DEFAULT_MODEL_PATH,
)


# =====================================================================
# 1. Feature Extraction Tests
# =====================================================================

def test_feature_extraction_keys_and_types():
    url = "https://retail.onlinesbi.sbi/retail/login.htm"
    f_dict = extract_features_dict(url)

    # Must contain all expected features
    assert set(f_dict.keys()) == set(FEATURE_NAMES)
    assert len(f_dict) == len(FEATURE_NAMES)

    # Every value must be a valid numerical type
    for key, val in f_dict.items():
        assert isinstance(val, (int, float, np.integer, np.floating)), f"Feature {key} has non-numeric value: {val}"
        assert not np.isnan(val), f"Feature {key} is NaN"


def test_feature_consistency_between_dict_and_vector():
    test_urls = [
        "https://onlinesbi.sbi/",
        "http://192.168.1.1/bank/update.php?id=123",
        "https://evil-hacker.com/path//double?user@name=true",
        "https://bit.ly/secure-login",
    ]

    for url in test_urls:
        f_dict = extract_features_dict(url)
        f_vec = extract_features_vector(url)

        assert len(f_vec) == len(FEATURE_NAMES)
        expected_vec = [f_dict[name] for name in FEATURE_NAMES]
        assert f_vec == expected_vec, f"Vector mismatch for URL: {url}"


def test_feature_semantics_ip_detection():
    assert has_ip_address("192.168.1.100") == 1
    assert has_ip_address("10.0.0.1:8080") == 1
    assert has_ip_address("onlinesbi.sbi") == 0
    assert has_ip_address("google.com") == 0


def test_feature_semantics_https_and_tokens():
    https_url = "https://netbanking.hdfcbank.com/netbanking/"
    http_url = "http://hdfc-update-kyc.com/login"

    assert extract_features_dict(https_url)["is_https"] == 1
    assert extract_features_dict(http_url)["is_https"] == 0

    at_url = "http://legit.bank.com@evil-phish.net/login"
    assert extract_features_dict(at_url)["has_at_symbol"] == 1

    double_slash_url = "http://phish-site.com//auth/login"
    assert extract_features_dict(double_slash_url)["has_double_slash_path"] == 1


def test_brand_impersonation_feature():
    # Phishing lookalike: SBI keyword in subdomain, but registered domain is attacker.com
    phish_sbi = "http://onlinesbi.update-pan.attacker.com/login.php"
    f_phish = extract_features_dict(phish_sbi)
    assert f_phish["brand_impersonation_keyword"] == 1

    # Genuine official SBI: registered domain is onlinesbi.sbi
    genuine_sbi = "https://retail.onlinesbi.sbi/retail/login.htm"
    f_genuine = extract_features_dict(genuine_sbi)
    assert f_genuine["brand_impersonation_keyword"] == 0


def test_entropy_computation():
    low_entropy = calculate_entropy("aaaaaaa")
    high_entropy = calculate_entropy("a1!b2@c3#d4$e5%")
    assert low_entropy == 0.0
    assert high_entropy > 3.0


# =====================================================================
# 2. Invalid Input Handling
# =====================================================================

@pytest.mark.parametrize("invalid_input", ["", "   ", None, 12345, []])
def test_invalid_urls_raise_value_error(invalid_input):
    with pytest.raises(ValueError):
        extract_features_dict(invalid_input)

    with pytest.raises(ValueError):
        extract_features_vector(invalid_input)


# =====================================================================
# 3. Dataset Loader & Domain-Grouped Split Tests
# =====================================================================

def test_extract_registered_domain():
    assert extract_registered_domain("https://retail.onlinesbi.sbi/login") == "onlinesbi.sbi"
    assert extract_registered_domain("http://sub.sub2.example.co.uk/path") == "example.co.uk"
    assert extract_registered_domain("http://evil.com") == "evil.com"


def test_dataset_loader_and_domain_leakage_prevention(tmp_path):
    # Controlled mock CSV fixture
    csv_file = tmp_path / "mock_dataset.csv"
    data = [
        {"url": "https://bank-a.com/login", "label": "legitimate"},
        {"url": "https://bank-a.com/dashboard", "label": "0"},
        {"url": "https://bank-b.com/home", "label": "safe"},
        {"url": "http://phish-x.xyz/steal", "label": "phishing"},
        {"url": "http://phish-x.xyz/verify", "label": "1"},
        {"url": "http://phish-y.top/pan-card", "label": "malicious"},
    ]
    df_raw = pd.DataFrame(data)
    df_raw.to_csv(csv_file, index=False)

    loaded_df = load_url_dataset(str(csv_file))
    assert len(loaded_df) == 6
    assert set(loaded_df["label"].unique()) == {0, 1}
    assert "domain_group" in loaded_df.columns

    train_df, test_df = split_dataset_by_domain(loaded_df, test_size=0.33, random_state=42)

    # Domain leakage check: No domain should be present in BOTH train and test
    train_domains = set(train_df["domain_group"].unique())
    test_domains = set(test_df["domain_group"].unique())
    overlap = train_domains.intersection(test_domains)
    assert len(overlap) == 0, f"Domain leakage detected across train and test: {overlap}"


def test_dataset_loader_missing_columns(tmp_path):
    bad_csv = tmp_path / "bad.csv"
    pd.DataFrame({"wrong_col": [1, 2]}).to_csv(bad_csv, index=False)

    with pytest.raises(ValueError, match="must contain URL and label columns"):
        load_url_dataset(str(bad_csv))


def test_dataset_loader_missing_file():
    with pytest.raises(FileNotFoundError):
        load_url_dataset("non_existent_file_path.csv")


# =====================================================================
# 4. Model Training, Persistence & Loading Lifecycle
# =====================================================================

def test_model_training_and_serialization_lifecycle(tmp_path):
    # Create controlled fixture feature matrix
    np.random.seed(42)
    n_samples = 40
    n_features = len(FEATURE_NAMES)
    X = np.random.randn(n_samples, n_features)
    y = np.random.choice([0, 1], size=n_samples)

    classifier = URLPhishingClassifier(n_estimators=10, max_depth=4, random_state=42)
    assert not classifier.is_trained

    # Train
    classifier.train(X, y)
    assert classifier.is_trained
    assert "feature_importances" in classifier.metadata

    # Predict
    preds = classifier.predict(X[:5])
    probs = classifier.predict_proba(X[:5])
    assert len(preds) == 5
    assert probs.shape == (5, 2)
    assert np.allclose(probs.sum(axis=1), 1.0)

    # Save & Load
    save_path = tmp_path / "test_rf_model.joblib"
    classifier.save(str(save_path))
    assert os.path.exists(save_path)

    loaded = URLPhishingClassifier.load(str(save_path))
    assert loaded.is_trained
    assert loaded.feature_names == FEATURE_NAMES
    loaded_preds = loaded.predict(X[:5])
    assert np.array_equal(preds, loaded_preds)


# =====================================================================
# 5. Prediction Pipeline & Strict Error Handling (No Fake Predictions)
# =====================================================================

def test_prediction_pipeline_raises_on_missing_model():
    clear_classifier_cache()
    missing_path = "non_existent_model_artifact.joblib"

    with pytest.raises(FileNotFoundError, match="Trained model artifact not found"):
        predict_url_phishing("https://example.com", model_path=missing_path)


def test_prediction_pipeline_with_controlled_model(tmp_path):
    clear_classifier_cache()
    model_path = str(tmp_path / "controlled_model.joblib")

    # Train a minimal model on FEATURE_NAMES
    np.random.seed(42)
    X = np.random.randn(20, len(FEATURE_NAMES))
    y = np.array([0] * 10 + [1] * 10)
    clf = URLPhishingClassifier(n_estimators=10, max_depth=3, random_state=42)
    clf.train(X, y)
    clf.save(model_path)

    # Perform prediction
    res = predict_url_phishing("https://onlinesbi.sbi/portal", model_path=model_path)

    assert "is_phishing" in res
    assert isinstance(res["is_phishing"], bool)
    assert 0.0 <= res["risk_score"] <= 100.0
    assert res["risk_level"] in ["SAFE", "SUSPICIOUS", "DANGEROUS"]
    assert "features" in res
    assert len(res["features"]) == len(FEATURE_NAMES)
    assert "probabilities" in res
