"""
PhishShield SMS Classifier Module

Encapsulates Scikit-learn Pipeline combining TfidfVectorizer and LogisticRegression
for SMS smishing and phishing detection.
Guarantees TF-IDF vectorizer is fit strictly on training data.
"""

import os
import sys
import datetime
from typing import Dict, Any, List, Union, Optional, Tuple
import numpy as np
import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)


class SMSPhishingClassifier:
    """
    Scikit-learn Pipeline wrapper for SMS smishing classification.
    Features:
    - N-gram (1, 2) TF-IDF text representation with sublinear scaling.
    - Regularized Logistic Regression with balanced class weights.
    - Model serialization, metadata tracking, and top coefficient inspection.
    """

    def __init__(
        self,
        ngram_range: Tuple[int, int] = (1, 2),
        max_features: int = 5000,
        sublinear_tf: bool = True,
        C: float = 2.0,
        class_weight: str = "balanced",
        random_state: int = 42,
    ):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=ngram_range,
                max_features=max_features,
                sublinear_tf=sublinear_tf,
                min_df=2,
                lowercase=True,
                token_pattern=r"(?u)\b\w+\b|<URL>",
            )),
            ("clf", LogisticRegression(
                C=C,
                class_weight=class_weight,
                max_iter=1000,
                random_state=random_state,
                solver="lbfgs",
            )),
        ])

        self.metadata: Dict[str, Any] = {
            "model_type": "TfidfVectorizer + LogisticRegression Pipeline",
            "version": "1.0.0",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "vocabulary_size": 0,
        }
        self.is_trained: bool = False

    def train(
        self,
        X_train: Union[pd.Series, List[str]],
        y_train: Union[pd.Series, np.ndarray, List[int]],
        metadata_update: Optional[Dict[str, Any]] = None,
    ) -> "SMSPhishingClassifier":
        """
        Trains the TF-IDF + Logistic Regression pipeline strictly on training data.
        """
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True

        # Extract vocabulary info
        tfidf_step = self.pipeline.named_steps["tfidf"]
        clf_step = self.pipeline.named_steps["clf"]
        vocab = tfidf_step.get_feature_names_out()

        self.metadata["vocabulary_size"] = len(vocab)
        self.metadata["training_samples"] = len(X_train)
        self.metadata["trained_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Compute top smishing (positive) and legitimate (negative) coefficients
        coefficients = clf_step.coef_[0]
        top_smish_indices = np.argsort(coefficients)[::-1][:25]
        top_legit_indices = np.argsort(coefficients)[:25]

        self.metadata["top_smishing_tokens"] = [
            {"token": vocab[idx], "coefficient": round(float(coefficients[idx]), 4)}
            for idx in top_smish_indices
        ]
        self.metadata["top_legitimate_tokens"] = [
            {"token": vocab[idx], "coefficient": round(float(coefficients[idx]), 4)}
            for idx in top_legit_indices
        ]

        if metadata_update:
            self.metadata.update(metadata_update)

        return self

    def predict(self, X: Union[pd.Series, List[str], str]) -> np.ndarray:
        """Returns binary predictions: 0 = Legitimate, 1 = Phishing."""
        if not self.is_trained:
            raise ValueError("Model is not trained. Call train() or load() first.")

        if isinstance(X, str):
            X = [X]

        return self.pipeline.predict(X)

    def predict_proba(self, X: Union[pd.Series, List[str], str]) -> np.ndarray:
        """Returns prediction probabilities: [P(legitimate), P(phishing)]."""
        if not self.is_trained:
            raise ValueError("Model is not trained. Call train() or load() first.")

        if isinstance(X, str):
            X = [X]

        return self.pipeline.predict_proba(X)

    def save(self, filepath: str) -> str:
        """Saves model pipeline and metadata using joblib."""
        if not self.is_trained:
            raise ValueError("Cannot save an untrained model.")

        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        payload = {
            "pipeline": self.pipeline,
            "metadata": self.metadata,
            "is_trained": self.is_trained,
        }
        joblib.dump(payload, filepath, compress=3)
        return filepath

    @classmethod
    def load(cls, filepath: str) -> "SMSPhishingClassifier":
        """Loads a saved pipeline from file."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"SMS model file does not exist at: {filepath}")

        payload = joblib.load(filepath)
        if not isinstance(payload, dict) or "pipeline" not in payload:
            raise ValueError(f"Corrupted or invalid model file: {filepath}")

        instance = cls()
        instance.pipeline = payload["pipeline"]
        instance.metadata = payload.get("metadata", {})
        instance.is_trained = payload.get("is_trained", True)

        return instance
