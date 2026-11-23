"""
PhishShield SMS Model Training Pipeline

Trains TF-IDF + Logistic Regression on authentic labeled SMS dataset.
Evaluates using held-out stratified test set with Accuracy, Precision, Recall,
F1-score, Confusion Matrix, and ROC-AUC.
Saves model artifact to app/ml/sms/saved_models/sms_tfidf_lr_model.joblib.
"""

import os
import sys
import datetime
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

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.ml.sms.sms_dataset_loader import load_sms_dataset, split_sms_dataset
from app.ml.sms.sms_classifier import SMSPhishingClassifier

DEFAULT_MODEL_SAVE_PATH = os.path.join(
    os.path.dirname(__file__), "saved_models", "sms_tfidf_lr_model.joblib"
)


def train_and_evaluate_sms_model(
    model_save_path: str = DEFAULT_MODEL_SAVE_PATH,
    test_size: float = 0.20,
    random_state: int = 42
) -> SMSPhishingClassifier:
    """
    Executes full training and validation lifecycle:
    1. Loads authentic SMS dataset.
    2. Performs stratified train/test split.
    3. Fits TF-IDF vectorizer + Logistic Regression on training set.
    4. Evaluates on unseen held-out test set.
    5. Saves serialized pipeline.
    """
    print("=" * 70)
    print("PhishShield SMS Smishing Model Training Pipeline")
    print("=" * 70)

    # 1. Load dataset
    df = load_sms_dataset()
    total_records = len(df)
    spam_count = int(df["label"].sum())
    ham_count = total_records - spam_count

    print(f"Dataset Loaded: {total_records} records ({ham_count} Legitimate, {spam_count} Phishing/Spam)")

    # 2. Stratified train/test split
    train_df, test_df = split_sms_dataset(df, test_size=test_size, random_state=random_state)
    print(f"Training split: {len(train_df)} samples | Held-out test split: {len(test_df)} samples")

    X_train, y_train = train_df["cleaned_text"], train_df["label"]
    X_test, y_test = test_df["cleaned_text"], test_df["label"]

    # 3. Initialize & Train Classifier
    classifier = SMSPhishingClassifier(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        C=2.0,
        class_weight="balanced",
        random_state=random_state,
    )

    print("Fitting TF-IDF Vectorizer and training Logistic Regression...")
    classifier.train(X_train, y_train)

    # 4. Evaluate on unseen held-out test set
    y_pred = classifier.predict(X_test)
    y_prob = classifier.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    tn, fp, fn, tp = cm[0][0], cm[0][1], cm[1][0], cm[1][1]

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
        },
        "test_samples": len(test_df),
        "train_samples": len(train_df),
        "evaluation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    # Attach metrics to model metadata
    classifier.metadata["evaluation_metrics"] = metrics

    # 5. Save model
    saved_path = classifier.save(model_save_path)
    print(f"Model artifact successfully saved to: {saved_path}")

    # 6. Display evaluation benchmarks
    print("\n" + "=" * 70)
    print("HELD-OUT TEST SET EVALUATION BENCHMARKS")
    print("=" * 70)
    print(f"Accuracy:         {acc * 100:.2f}%")
    print(f"Precision:        {prec * 100:.2f}% (Phishing)")
    print(f"Recall:           {rec * 100:.2f}% (Phishing detection rate)")
    print(f"F1-Score:         {f1:.4f}")
    print(f"ROC-AUC:          {auc:.4f}")
    print("\nConfusion Matrix:")
    print(f"  True Negatives (Legitimate correctly identified):  {tn}")
    print(f"  False Positives (Legitimate flagged as Phishing):  {fp}")
    print(f"  False Negatives (Phishing missed by model):       {fn}")
    print(f"  True Positives (Phishing correctly identified):   {tp}")

    print("\nTop 10 Smishing Indicator Tokens (Highest Positive Weights):")
    for tok in classifier.metadata.get("top_smishing_tokens", [])[:10]:
        print(f"  + {tok['token']:<22} (coef: +{tok['coefficient']:.4f})")

    print("\nTop 10 Legitimate Indicator Tokens (Highest Negative Weights):")
    for tok in classifier.metadata.get("top_legitimate_tokens", [])[:10]:
        print(f"  - {tok['token']:<22} (coef: {tok['coefficient']:.4f})")
    print("=" * 70)

    return classifier


if __name__ == "__main__":
    train_and_evaluate_sms_model()
