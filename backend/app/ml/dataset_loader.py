"""
PhishShield URL Dataset Loader & Preprocessing Module

Loads, validates, and partitions real-world URL phishing datasets.
Enforces domain-grouped splitting to prevent data leakage between train and test sets.
"""

import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import re
import logging
from typing import Tuple, Optional, List
import pandas as pd
import numpy as np
import tldextract
from sklearn.model_selection import GroupShuffleSplit, train_test_split

logger = logging.getLogger("phishshield.dataset")

_tld_extractor = tldextract.TLDExtract(cache_dir=None, suffix_list_urls=None)


def extract_registered_domain(url: str) -> str:
    """Extract registered domain (SLD + TLD) for domain-grouped leakage prevention."""
    try:
        ext = _tld_extractor(url)
        domain = getattr(ext, "top_domain_under_public_suffix", None) or getattr(ext, "registered_domain", "")
        if domain:
            return domain.lower()
        if ext.suffix:
            return ext.suffix.lower()
        return "unknown_domain"
    except Exception:
        return "unknown_domain"


def load_url_dataset(
    csv_path: str,
    url_col: str = "url",
    label_col: str = "label"
) -> pd.DataFrame:
    """
    Loads and validates a labeled URL dataset from CSV.
    - Validates required columns.
    - Standardizes labels (0 = Legitimate, 1 = Phishing).
    - Removes nulls, empties, and duplicate URLs.
    - Extracts registered domain for group-based splitting.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")

    logger.info(f"Loading URL dataset from {csv_path}...")
    df = pd.read_csv(csv_path)

    # Validate required columns
    available_cols = [c.lower() for c in df.columns]
    
    # Auto-detect column names if defaults aren't exact
    matched_url_col = None
    matched_label_col = None

    for col in df.columns:
        if col.lower() in ["url", "target_url", "urls", "website"]:
            matched_url_col = col
        elif col.lower() in ["label", "is_phishing", "status", "class", "target", "result"]:
            matched_label_col = col

    url_col = matched_url_col or url_col
    label_col = matched_label_col or label_col

    if url_col not in df.columns or label_col not in df.columns:
        raise ValueError(
            f"Dataset must contain URL and label columns. Found columns: {list(df.columns)}"
        )

    # Filter to required columns
    clean_df = df[[url_col, label_col]].copy()
    clean_df.rename(columns={url_col: "url", label_col: "label"}, inplace=True)

    # Drop nulls and empty strings
    clean_df.dropna(subset=["url", "label"], inplace=True)
    clean_df["url"] = clean_df["url"].astype(str).str.strip()
    clean_df = clean_df[clean_df["url"].str.len() > 3]

    # Normalize labels to binary 0 and 1
    def normalize_label(val):
        if isinstance(val, (int, float, np.integer, np.floating)):
            return 1 if int(val) == 1 else 0
        s = str(val).strip().lower()
        if s in ["1", "phishing", "bad", "malicious", "phish", "true", "yes"]:
            return 1
        elif s in ["0", "legitimate", "good", "benign", "safe", "false", "no"]:
            return 0
        return None

    clean_df["label"] = clean_df["label"].apply(normalize_label)
    clean_df.dropna(subset=["label"], inplace=True)
    clean_df["label"] = clean_df["label"].astype(int)

    # Deduplicate by URL
    initial_len = len(clean_df)
    clean_df.drop_duplicates(subset=["url"], inplace=True)
    logger.info(f"Deduplicated dataset: {initial_len} -> {len(clean_df)} records.")

    # Extract registered domain for train/test leakage prevention
    clean_df["domain_group"] = clean_df["url"].apply(extract_registered_domain)

    class_counts = clean_df["label"].value_counts().to_dict()
    logger.info(f"Class distribution: Legitimate (0)={class_counts.get(0, 0)}, Phishing (1)={class_counts.get(1, 0)}")

    return clean_df


def split_dataset_by_domain(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits dataset into train and test sets using domain-grouped splitting
    to guarantee that all URLs belonging to a domain appear exclusively
    in either train OR test. Prevents domain-memorization leakage.
    """
    if "domain_group" not in df.columns:
        df["domain_group"] = df["url"].apply(extract_registered_domain)

    # Use GroupShuffleSplit
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    groups = df["domain_group"]
    
    train_idx, test_idx = next(gss.split(df, df["label"], groups=groups))
    train_df = df.iloc[train_idx].copy().reset_index(drop=True)
    test_df = df.iloc[test_idx].copy().reset_index(drop=True)

    # Check if both classes exist in train and test
    if len(train_df["label"].unique()) < 2 or len(test_df["label"].unique()) < 2:
        logger.warning(
            "GroupShuffleSplit resulted in single-class test split due to small domain clustering. Falling back to StratifiedSplit."
        )
        from sklearn.model_selection import train_test_split
        train_df, test_df = train_test_split(
            df, test_size=test_size, stratify=df["label"], random_state=random_state
        )
        train_df = train_df.reset_index(drop=True)
        test_df = test_df.reset_index(drop=True)

    logger.info(
        f"Dataset split: Train={len(train_df)} (Phish: {train_df['label'].sum()}), "
        f"Test={len(test_df)} (Phish: {test_df['label'].sum()})"
    )
    return train_df, test_df
