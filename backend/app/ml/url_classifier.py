"""
PhishShield URL Classifier Model Wrapper

Encapsulates Scikit-learn RandomForestClassifier for URL phishing detection.
Saves and loads trained models with feature metadata and evaluation benchmarks.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import logging
from typing import Dict, Any, List, Union, Optional
import numpy as np
import pandas as pd
import joblib

from app.ml.feature_extraction import FEATURE_NAMES

logger = logging.getLogger("phishshield.classifier")


class URLPhishingClassifier:
    """
    Random Forest-based URL Phishing Classifier.
    Guarantees feature ordering consistency between training and inference.
    """

    def __init__(
        self,
        n_estimators: int = 150,
        max_depth: Optional[int] = 16,
        min_samples_split: int = 4,
        min_samples_leaf: int = 2,
        class_weight: str = "balanced",
        random_state: int = 42,
    ):
        from sklearn.ensemble import RandomForestClassifier

        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            class_weight=class_weight,
            random_state=random_state,
            n_jobs=-1,
        )
        self.feature_names: List[str] = list(FEATURE_NAMES)
        self.metadata: Dict[str, Any] = {
            "model_type": "RandomForestClassifier",
            "version": "1.0.0",
            "feature_count": len(FEATURE_NAMES),
            "features": list(FEATURE_NAMES),
        }
        self.is_trained: bool = False

    def train(
        self,
        X_train: Union[np.ndarray, pd.DataFrame],
        y_train: Union[np.ndarray, pd.Series],
        metadata_update: Optional[Dict[str, Any]] = None,
    ) -> "URLPhishingClassifier":
        """Trains the Random Forest model on extracted feature matrix."""
        if isinstance(X_train, pd.DataFrame):
            # Ensure column order matches self.feature_names
            X_train = X_train[self.feature_names].values

        logger.info(f"Training RandomForestClassifier on {len(X_train)} samples ({len(self.feature_names)} features)...")
        self.model.fit(X_train, y_train)
        self.is_trained = True

        if metadata_update:
            self.metadata.update(metadata_update)

        # Compute feature importances
        importances = dict(zip(self.feature_names, [round(float(v), 5) for v in self.model.feature_importances_]))
        # Sort by importance descending
        self.metadata["feature_importances"] = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

        return self

    def predict(self, X: Union[np.ndarray, pd.DataFrame, List[List[Union[int, float]]]]) -> np.ndarray:
        """Returns binary predictions: 0 = Legitimate, 1 = Phishing."""
        if not self.is_trained:
            raise ValueError("Model is not trained. Call train() or load() before predict().")

        if isinstance(X, pd.DataFrame):
            X = X[self.feature_names].values
        elif isinstance(X, list):
            X = np.array(X)

        if len(X.shape) == 1:
            X = X.reshape(1, -1)

        return self.model.predict(X)

    def predict_proba(self, X: Union[np.ndarray, pd.DataFrame, List[List[Union[int, float]]]]) -> np.ndarray:
        """Returns prediction probabilities: [P(legitimate), P(phishing)]."""
        if not self.is_trained:
            raise ValueError("Model is not trained. Call train() or load() before predict_proba().")

        if isinstance(X, pd.DataFrame):
            X = X[self.feature_names].values
        elif isinstance(X, list):
            X = np.array(X)

        if len(X.shape) == 1:
            X = X.reshape(1, -1)

        return self.model.predict_proba(X)

    def save(self, filepath: str) -> str:
        """Saves model and metadata using joblib."""
        if not self.is_trained:
            raise ValueError("Cannot save an untrained model.")

        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        payload = {
            "model": self.model,
            "feature_names": self.feature_names,
            "metadata": self.metadata,
            "is_trained": self.is_trained,
        }
        joblib.dump(payload, filepath, compress=3)
        logger.info(f"Model successfully saved to: {filepath}")
        return filepath

    @classmethod
    def load(cls, filepath: str) -> "URLPhishingClassifier":
        """Loads a saved model from file."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file does not exist at: {filepath}")

        payload = joblib.load(filepath)
        if not isinstance(payload, dict) or "model" not in payload:
            raise ValueError(f"Corrupted or invalid model file: {filepath}")

        instance = cls()
        instance.model = payload["model"]
        instance.feature_names = payload.get("feature_names", list(FEATURE_NAMES))
        instance.metadata = payload.get("metadata", {})
        instance.is_trained = payload.get("is_trained", True)

        logger.info(f"Loaded URL classifier version {instance.metadata.get('version')} from {filepath}")
        return instance
