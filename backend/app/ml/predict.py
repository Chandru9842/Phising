"""
PhishShield URL Prediction & Unified Scan Pipeline

Loads the serialized Random Forest model and performs inference on target URLs
using the identical feature extraction pipeline.
Combines Random Forest classification, Indian Banking Brand Impersonation analysis,
and SHAP TreeExplainer feature attributions into a unified security evaluation.

STRICT INTEGRITY RULE: Never returns fake or synthetic predictions.
If the model artifact is missing, an explicit error is returned.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import datetime
from typing import Dict, Any, Optional

from app.ml.feature_extraction import (
    extract_features_dict,
    extract_features_vector,
    FEATURE_NAMES
)
from app.ml.url_classifier import URLPhishingClassifier

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "saved_models", "url_rf_model.joblib"
)

# In-memory singleton for fast repeated inference
_cached_classifier: Optional[URLPhishingClassifier] = None
_cached_model_path: Optional[str] = None


def get_classifier(model_path: str = DEFAULT_MODEL_PATH) -> URLPhishingClassifier:
    """
    Retrieves or loads the URL classifier model.
    Raises FileNotFoundError if the trained model artifact does not exist.
    """
    global _cached_classifier, _cached_model_path

    if _cached_classifier is not None and _cached_model_path == model_path:
        return _cached_classifier

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Trained model artifact not found at: {model_path}. "
            "Please run 'python app/ml/train_model.py' to train the real Random Forest model first. "
            "PhishShield strictly prohibits fake/mock predictions."
        )

    _cached_classifier = URLPhishingClassifier.load(model_path)
    _cached_model_path = model_path
    return _cached_classifier


def clear_classifier_cache():
    """Clears cached model from memory (useful after re-training or in tests)."""
    global _cached_classifier, _cached_model_path
    _cached_classifier = None
    _cached_model_path = None


def predict_url_phishing(
    url: str,
    model_path: str = DEFAULT_MODEL_PATH
) -> Dict[str, Any]:
    """
    Inference workflow for a single URL using raw Random Forest classification:
    1. Validates and sanitizes input.
    2. Extracts lexical and structural features.
    3. Loads genuine trained Random Forest model.
    4. Computes class probabilities and predictions.
    5. Formats structured result with feature values and risk assessment.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("Invalid URL: Target input must be a non-empty string.")

    # 1. Feature extraction
    try:
        features_dict = extract_features_dict(url)
        features_vector = extract_features_vector(url)
    except Exception as e:
        raise ValueError(f"Feature extraction failed on URL: {e}")

    # 2. Model retrieval
    classifier = get_classifier(model_path)

    # 3. Model inference
    probs = classifier.predict_proba([features_vector])[0]
    p_legit = float(probs[0])
    p_phish = float(probs[1])

    is_phishing = bool(p_phish >= 0.5)
    risk_score = round(p_phish * 100.0, 2)

    # Categorize risk level
    if risk_score < 35.0:
        risk_level = "SAFE"
    elif risk_score < 70.0:
        risk_level = "SUSPICIOUS"
    else:
        risk_level = "DANGEROUS"

    return {
        "url": url,
        "is_phishing": is_phishing,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "probabilities": {
            "legitimate": round(p_legit, 4),
            "phishing": round(p_phish, 4),
        },
        "features": features_dict,
        "brand_impersonation_flag": bool(features_dict.get("brand_impersonation_keyword", 0)),
        "model_version": classifier.metadata.get("version", "1.0.0"),
        "analyzed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


def scan_url_full(
    url: str,
    model_path: str = DEFAULT_MODEL_PATH
) -> Dict[str, Any]:
    """
    Comprehensive URL Scan:
    1. Executes real Random Forest ML classification.
    2. Executes Indian Banking Brand Impersonation & Typosquatting detection.
    3. Executes SHAP TreeExplainer feature attributions for the phishing class.
    4. Synthesizes findings via Unified Zero-Trust Risk Assessment Engine.
    """
    from app.ml.brand_detection import detect_brand_impersonation
    from app.ml.shap_explainer import explain_url_prediction
    from app.core.risk_engine import evaluate_unified_risk

    # 1. Raw ML prediction
    ml_res = predict_url_phishing(url, model_path=model_path)

    # 2. Brand detection
    brand_res = detect_brand_impersonation(url)

    # 3. SHAP explainability
    shap_res = explain_url_prediction(url, model_path=model_path)

    # 4. Unified risk assessment
    risk_res = evaluate_unified_risk(url, ml_res, brand_res, shap_res)

    return {
        "url": url,
        "is_phishing": risk_res["is_phishing"],
        "risk_score": risk_res["risk_score"],
        "risk_level": risk_res["risk_level"],
        "probabilities": ml_res["probabilities"],
        "brand_impersonation_flag": brand_res["impersonation_suspected"],
        "features": ml_res["features"],
        "model_version": ml_res["model_version"],
        "analyzed_at": ml_res["analyzed_at"],
        "brand_analysis": brand_res,
        "shap_explanation": shap_res,
        "risk_assessment": risk_res,
    }


if __name__ == "__main__":
    import json
    target = sys.argv[1] if len(sys.argv) > 1 else "https://retail.onlinesbi.sbi/retail/login.htm"
    print(f"Full scan for target URL: {target}")
    result = scan_url_full(target)
    print(json.dumps(result, indent=2))
