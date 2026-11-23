"""
PhishShield SHAP Explainability Engine

Integrates shap.TreeExplainer with the trained Random Forest URL classifier.
Explains model predictions by computing exact Shapley values for the phishing class
across the strict 26-feature pipeline.

SECURITY RULE: Never visits, resolves, or executes target URLs.
"""

import os
import sys
from typing import Dict, Any, List, Optional, Union
import numpy as np
import shap

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.ml.feature_extraction import (
    extract_features_dict,
    extract_features_vector,
    FEATURE_NAMES
)
from app.ml.predict import get_classifier, DEFAULT_MODEL_PATH

# Human-readable contextual descriptions for the 26 features
FEATURE_DESCRIPTIONS: Dict[str, str] = {
    "url_length": "Long overall URL character length, commonly seen in credential harvesting.",
    "hostname_length": "Abnormally long hostnames used to camouflage malicious domains.",
    "domain_length": "Length of the registered domain under the public suffix.",
    "path_length": "Deep URL path structure often mimicking complex banking sub-directories.",
    "query_length": "Length of query string parameters, often holding session tracking or encoded payloads.",
    "num_dots": "Multiple dots across the URL indicating nested subdomains or domain obfuscation.",
    "num_dots_hostname": "Dot count in the hostname; excessive dots indicate deep subdomain nesting.",
    "num_subdomains": "Number of subdomain tiers disguising untrusted hosting servers.",
    "subdomain_length": "Length of the subdomain component.",
    "num_hyphens": "Excessive hyphens, a frequent tactic to simulate brand names.",
    "num_hyphens_domain": "Hyphens in the registered domain, heavily correlated with phishing typosquatting.",
    "num_underscores": "Underscore characters in URL, deviating from standard web conventions.",
    "num_digits": "Total count of numeric digits, common in auto-generated phishing URLs.",
    "digit_ratio": "Ratio of numeric digits to URL length; high ratios indicate synthetic attack kits.",
    "num_special_chars": "Special characters (@, ?, =, &, %, $) used to confuse filters and users.",
    "is_https": "TLS/HTTPS encryption presence; note that HTTPS alone does not guarantee legitimacy.",
    "has_ip": "Direct IP address used as hostname instead of a registered domain.",
    "has_at_symbol": "The '@' symbol causes browsers to ignore preceding authority credentials.",
    "has_double_slash_path": "Double slash '//' sequence in path, often used for open redirects.",
    "num_query_params": "Number of URL query arguments parsed.",
    "is_shortened": "Known URL shortener service (e.g. bit.ly, tinyurl) hiding the destination domain.",
    "suspicious_keyword_count": "Presence of sensitive lure terms (login, verify, KYC, update, password).",
    "brand_impersonation_keyword": "Indian banking brand keyword located in an untrusted subdomain or path.",
    "shannon_entropy": "Shannon entropy score; high values indicate high randomness or hex obfuscation.",
    "has_port": "Non-standard network port specified in URL netloc.",
    "has_suspicious_tld": "High-risk TLD (.xyz, .top, .buzz, etc.) disproportionately favored by threat actors.",
}

# Cached singleton explainer instance
_cached_tree_explainer: Optional[shap.TreeExplainer] = None
_cached_model_path: Optional[str] = None


def get_tree_explainer(model_path: str = DEFAULT_MODEL_PATH) -> shap.TreeExplainer:
    """
    Initializes or returns cached shap.TreeExplainer for the trained Random Forest model.
    """
    global _cached_tree_explainer, _cached_model_path

    if _cached_tree_explainer is not None and _cached_model_path == model_path:
        return _cached_tree_explainer

    classifier = get_classifier(model_path)
    if not classifier.is_trained:
        raise ValueError("Model is not trained. Cannot create SHAP TreeExplainer.")

    _cached_tree_explainer = shap.TreeExplainer(classifier.model)
    _cached_model_path = model_path
    return _cached_tree_explainer


def clear_explainer_cache():
    """Clears cached explainer from memory (useful after model re-training)."""
    global _cached_tree_explainer, _cached_model_path
    _cached_tree_explainer = None
    _cached_model_path = None


def explain_url_prediction(
    url: str,
    model_path: str = DEFAULT_MODEL_PATH,
    top_n: int = 5
) -> Dict[str, Any]:
    """
    Generates SHAP explainability analysis for a single URL:
    1. Extracts 26 features.
    2. Runs shap.TreeExplainer.
    3. Isolates SHAP contributions for the phishing class (index 1).
    4. Ranks top positive contributors (increasing risk) and top negative contributors (reducing risk).
    5. Returns structured explanation with human-readable descriptions.
    """
    # 1. Feature extraction
    features_dict = extract_features_dict(url)
    features_vector = [features_dict[name] for name in FEATURE_NAMES]
    X = np.array([features_vector])

    # 2. Get TreeExplainer and evaluate
    explainer = get_tree_explainer(model_path)
    raw_shap = explainer.shap_values(X)

    # 3. Normalize SHAP values for binary classification (phishing class = index 1)
    if isinstance(raw_shap, list):
        # Format: [array_for_class_0, array_for_class_1]
        shap_phishing = raw_shap[1][0]
    elif isinstance(raw_shap, np.ndarray) and len(raw_shap.shape) == 3:
        # Format: (1, num_features, 2)
        shap_phishing = raw_shap[0, :, 1]
    elif isinstance(raw_shap, np.ndarray) and len(raw_shap.shape) == 2:
        # Single output format: (1, num_features)
        shap_phishing = raw_shap[0]
    else:
        raise ValueError(f"Unexpected SHAP values shape: {getattr(raw_shap, 'shape', type(raw_shap))}")

    # Base value (prior expected value for phishing class)
    expected_vals = explainer.expected_value
    if isinstance(expected_vals, (list, np.ndarray)):
        base_value = float(expected_vals[1])
    else:
        base_value = float(expected_vals)

    # 4. Map contributions across all 26 features
    all_contributions: List[Dict[str, Any]] = []
    for i, name in enumerate(FEATURE_NAMES):
        val = features_vector[i]
        phi = float(shap_phishing[i])

        if phi > 0.001:
            direction = "RISK_INCREASING"
        elif phi < -0.001:
            direction = "RISK_DECREASING"
        else:
            direction = "NEUTRAL"

        all_contributions.append({
            "feature_name": name,
            "feature_value": val,
            "shap_value": round(phi, 4),
            "abs_shap_value": round(abs(phi), 4),
            "direction": direction,
            "description": FEATURE_DESCRIPTIONS.get(name, "Cybersecurity structural feature."),
        })

    # Sort positive contributors (increasing risk) descending
    positive_contribs = sorted(
        [c for c in all_contributions if c["direction"] == "RISK_INCREASING"],
        key=lambda x: x["shap_value"],
        reverse=True
    )

    # Sort negative contributors (lowering risk) ascending (most negative first)
    negative_contribs = sorted(
        [c for c in all_contributions if c["direction"] == "RISK_DECREASING"],
        key=lambda x: x["shap_value"]
    )

    # Model predicted probability via sum of base value + SHAP attributions
    sum_shap = float(np.sum(shap_phishing))
    reconstructed_prob = max(0.0, min(1.0, base_value + sum_shap))

    # Plain-language summary
    top_pos_names = [f"{c['feature_name']} (+{c['shap_value']:.3f})" for c in positive_contribs[:3]]
    top_neg_names = [f"{c['feature_name']} ({c['shap_value']:.3f})" for c in negative_contribs[:3]]

    summary_parts = []
    if top_pos_names:
        summary_parts.append(f"Top risk-increasing factors: {', '.join(top_pos_names)}.")
    if top_neg_names:
        summary_parts.append(f"Top risk-lowering factors: {', '.join(top_neg_names)}.")
    if not summary_parts:
        summary_parts.append("Features maintain neutral baseline risk.")

    summary = " ".join(summary_parts)

    return {
        "base_value": round(base_value, 4),
        "model_output": round(reconstructed_prob, 4),
        "top_positive_contributors": positive_contribs[:top_n],
        "top_negative_contributors": negative_contribs[:top_n],
        "all_feature_contributions": all_contributions,
        "summary": summary,
    }


if __name__ == "__main__":
    import json
    target = sys.argv[1] if len(sys.argv) > 1 else "http://onlinesbi-pan-kyc-verification.com/login.php"
    print(f"Explaining URL: {target}")
    result = explain_url_prediction(target)
    print(f"Base Value: {result['base_value']}")
    print(f"Model Output: {result['model_output']}")
    print(f"Summary: {result['summary']}")
    print("\nTop Positive Contributors (Increasing Risk):")
    for c in result["top_positive_contributors"]:
        print(f"  {c['feature_name']}: {c['shap_value']} (value: {c['feature_value']}) -> {c['description']}")
    print("\nTop Negative Contributors (Decreasing Risk):")
    for c in result["top_negative_contributors"]:
        print(f"  {c['feature_name']}: {c['shap_value']} (value: {c['feature_value']}) -> {c['description']}")
