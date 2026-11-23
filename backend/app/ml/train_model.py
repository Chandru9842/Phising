"""
PhishShield URL Classifier Model Training Pipeline

Loads authentic labeled URL dataset, extracts lexical and structural features,
enforces domain-grouped train/test splitting, trains a RandomForestClassifier,
computes classification evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC),
and serializes the trained artifact using joblib.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import logging
import datetime
from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

from app.ml.feature_extraction import FEATURE_NAMES, extract_features_vector
from app.ml.dataset_loader import load_url_dataset, split_dataset_by_domain
from app.ml.url_classifier import URLPhishingClassifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("phishshield.trainer")

MODEL_SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
DEFAULT_MODEL_PATH = os.path.join(MODEL_SAVE_DIR, "url_rf_model.joblib")


def extract_feature_matrix(urls: List[str]) -> np.ndarray:
    """Extracts ordered feature vectors for a list of URLs."""
    features = []
    total = len(urls)
    logger.info(f"Extracting features for {total} URLs...")
    for i, url in enumerate(urls):
        features.append(extract_features_vector(url))
        if (i + 1) % 500 == 0 or (i + 1) == total:
            logger.info(f"Feature extraction progress: {i + 1}/{total} ({(i + 1)/total*100:.1f}%)")
    return np.array(features, dtype=float)


def train_and_evaluate_model(
    dataset_path: str,
    output_model_path: str = DEFAULT_MODEL_PATH,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[URLPhishingClassifier, Dict[str, Any]]:
    """
    End-to-end training and evaluation workflow.
    """
    start_time = datetime.datetime.now(datetime.timezone.utc)

    # 1. Load and clean dataset
    df = load_url_dataset(dataset_path)

    # 2. Domain-grouped train/test split
    train_df, test_df = split_dataset_by_domain(df, test_size=test_size, random_state=random_state)

    # 3. Extract features for training and test sets
    logger.info("Computing training set feature matrix...")
    X_train = extract_feature_matrix(train_df["url"].tolist())
    y_train = train_df["label"].values

    logger.info("Computing test set feature matrix...")
    X_test = extract_feature_matrix(test_df["url"].tolist())
    y_test = test_df["label"].values

    # 4. Initialize and train classifier
    classifier = URLPhishingClassifier(
        n_estimators=150,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state
    )

    metadata = {
        "dataset_path": dataset_path,
        "dataset_size_total": len(df),
        "train_size": len(train_df),
        "test_size": len(test_df),
        "trained_at": start_time.isoformat(),
        "random_state": random_state,
        "class_distribution_train": {
            "legitimate": int((y_train == 0).sum()),
            "phishing": int((y_train == 1).sum()),
        },
        "class_distribution_test": {
            "legitimate": int((y_test == 0).sum()),
            "phishing": int((y_test == 1).sum()),
        },
    }

    classifier.train(X_train, y_train, metadata_update=metadata)

    # 5. Model Evaluation on Held-Out Test Set
    logger.info("Evaluating classifier on unseen test set...")
    y_pred = classifier.predict(X_test)
    y_prob = classifier.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y_test, y_prob))
    except Exception:
        roc_auc = 0.0

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    eval_results = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
        },
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
    }

    classifier.metadata["evaluation_metrics"] = eval_results

    logger.info(f"=== Model Evaluation Results ===")
    logger.info(f"Accuracy:  {eval_results['accuracy']:.4f}")
    logger.info(f"Precision: {eval_results['precision']:.4f}")
    logger.info(f"Recall:    {eval_results['recall']:.4f}")
    logger.info(f"F1-Score:  {eval_results['f1_score']:.4f}")
    logger.info(f"ROC-AUC:   {eval_results['roc_auc']:.4f}")
    logger.info(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # 6. Save Model
    saved_path = classifier.save(output_model_path)
    logger.info(f"Trained model saved to: {saved_path}")

    return classifier, eval_results


if __name__ == "__main__":
    default_dataset = os.path.join(os.path.dirname(__file__), "..", "data", "urls_dataset.csv")
    dataset_file = sys.argv[1] if len(sys.argv) > 1 else default_dataset
    train_and_evaluate_model(dataset_file)
