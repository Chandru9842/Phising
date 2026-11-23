"""
PhishShield SMS Dataset Loader Module

Loads, validates, cleans, and partitions authentic SMS phishing datasets
with stratified train/test split.
"""

import os
import sys
from typing import Tuple
import pandas as pd
from sklearn.model_selection import train_test_split

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.ml.sms.sms_preprocessing import clean_sms_text

DEFAULT_SMS_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "sms_dataset.csv"
)


def load_sms_dataset(csv_path: str = DEFAULT_SMS_DATASET_PATH) -> pd.DataFrame:
    """
    Loads and sanitizes the labeled SMS phishing dataset:
    - Validates presence of required columns ('message' and 'label').
    - Drops nulls and removes duplicate messages.
    - Normalizes labels: 0 = Legitimate, 1 = Phishing/Smishing.
    - Preprocesses text using clean_sms_text (normalizing URLs to <URL> token).
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"SMS dataset not found at: {csv_path}. "
            "Please run 'python app/data/build_sms_dataset.py' to generate the authentic dataset first."
        )

    df = pd.read_csv(csv_path, encoding="utf-8")

    # Validate column names (case-insensitive check)
    col_map = {c.lower(): c for c in df.columns}
    msg_col = col_map.get("message") or col_map.get("text") or col_map.get("sms")
    lbl_col = col_map.get("label") or col_map.get("class") or col_map.get("target")

    if not msg_col or not lbl_col:
        raise ValueError(
            f"Dataset at {csv_path} must contain 'message' and 'label' columns. Found: {list(df.columns)}"
        )

    # Standardize column names
    df = df[[msg_col, lbl_col]].rename(columns={msg_col: "message", lbl_col: "label"})

    # Clean nulls
    df.dropna(subset=["message", "label"], inplace=True)
    df["message"] = df["message"].astype(str).str.strip()
    df = df[df["message"] != ""]

    # Normalize labels
    label_map = {
        "0": 0, 0: 0, "ham": 0, "legitimate": 0, "safe": 0,
        "1": 1, 1: 1, "spam": 1, "phishing": 1, "smishing": 1, "fraud": 1
    }
    df["label"] = df["label"].astype(str).str.lower().map(label_map)
    df.dropna(subset=["label"], inplace=True)
    df["label"] = df["label"].astype(int)

    # Deduplicate
    df.drop_duplicates(subset=["message"], inplace=True)

    # Clean and normalize text
    df["cleaned_text"] = df["message"].apply(lambda m: clean_sms_text(m, replace_urls=True))
    df = df[df["cleaned_text"].str.strip() != ""]

    return df


def split_sms_dataset(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Partitions the SMS dataset using stratified sampling to preserve
    the exact class balance across training and testing splits.
    """
    train_df, test_df = train_test_split(
        df,
        test_size=test_size,
        random_state=random_state,
        stratify=df["label"]
    )
    return train_df.reset_index(drop=True), test_df.reset_index(drop=True)


if __name__ == "__main__":
    df = load_sms_dataset()
    print(f"Loaded SMS dataset with {len(df)} records.")
    train_df, test_df = split_sms_dataset(df)
    print(f"Train set: {len(train_df)} records (Spam ratio: {train_df['label'].mean():.3f})")
    print(f"Test set:  {len(test_df)} records (Spam ratio: {test_df['label'].mean():.3f})")
