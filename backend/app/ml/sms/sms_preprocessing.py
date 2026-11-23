"""
PhishShield SMS Preprocessing & URL Extraction Module

Extracts all embedded URLs from SMS text, normalizes text representations,
and preserves critical banking and smishing indicators.

SECURITY RULE: Never visits, resolves, or executes extracted URLs.
All processing is purely static string and syntactic analysis.
"""

import re
from typing import List, Set, Dict, Any

# Robust, fast URL regex without catastrophic backtracking
URL_REGEX = re.compile(
    r"""(?i)\b((?:https?://|www\.)[^\s<>"'{}|\\^`]+|(?:[a-z0-9\-]+\.)+(?:com|org|net|in|co|info|biz|top|xyz|club|live|online|site|app|bank|gov|edu)(?:/[^\s<>"'{}|\\^`]*)?)""",
    re.VERBOSE
)

# Additional simple regex for bare shorteners or domains (e.g. bit.ly/xyz, t.co/xyz, cutt.ly/xyz, etc.)
SHORTENER_REGEX = re.compile(
    r"\b((?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|ow\.ly|tiny\.cc|rb\.gy|cutt\.ly|shorturl\.at|s\.id|qr\.ae)/[a-zA-Z0-9_\-]+)\b",
    re.IGNORECASE
)

# High-frequency smishing / banking indicator keywords that must be preserved
HIGH_SIGNAL_SMISHING_KEYWORDS = [
    "otp", "kyc", "pan", "aadhaar", "aadhar", "bank", "account",
    "blocked", "block", "verify", "verification", "urgent", "update",
    "suspended", "suspend", "deactivated", "deactivate", "expired",
    "expire", "reward", "rewards", "rewardpoint", "points", "bonus",
    "cashback", "refund", "lottery", "winner", "prize", "electricity",
    "power", "cut", "bill", "pin", "cvv", "password", "netbanking",
    "ebanking", "yono", "imobile", "sbi", "hdfc", "icici", "axis",
    "pnb", "kotak", "bob", "upi", "unauthorized", "immediately", "today"
]


def extract_urls_from_text(raw_text: str) -> List[str]:
    """
    Extracts all URLs embedded in an SMS message text.
    
    Features:
    - Extracts multiple URLs in a single message.
    - Captures both full scheme (http/https) and bare domain/shortener paths.
    - Strips trailing punctuation (.,;!?)"' without modifying the target.
    - Normalizes bare URLs with 'http://' prefix if scheme is omitted.
    - Preserves extraction order and eliminates duplicate matches.
    - Safely returns empty list for messages without URLs.
    """
    if not raw_text or not isinstance(raw_text, str):
        return []

    text = raw_text.strip()
    if not text:
        return []

    found_urls: List[str] = []
    seen: Set[str] = set()

    # 1. Primary comprehensive URL regex search
    for match in URL_REGEX.finditer(text):
        url_candidate = match.group(0).strip()
        # Clean trailing punctuation
        url_clean = re.sub(r"[.,;!?:\'\")\]}]+$", "", url_candidate)
        if url_clean and url_clean not in seen:
            seen.add(url_clean)
            found_urls.append(url_clean)

    # 2. Secondary shortener pass
    for match in SHORTENER_REGEX.finditer(text):
        shortener_candidate = match.group(0).strip()
        shortener_clean = re.sub(r"[.,;!?:\'\")\]}]+$", "", shortener_candidate)
        if shortener_clean and shortener_clean not in seen:
            seen.add(shortener_clean)
            found_urls.append(shortener_clean)

    # Normalize extracted URLs for downstream engine (ensure scheme exists)
    normalized_urls = []
    for u in found_urls:
        if not u.startswith("http://") and not u.startswith("https://"):
            normalized_urls.append("http://" + u)
        else:
            normalized_urls.append(u)

    return normalized_urls


def clean_sms_text(raw_text: str, replace_urls: bool = True) -> str:
    """
    Normalizes SMS message text for TF-IDF feature extraction while strictly
    preserving critical smishing and banking vocabulary.
    
    If replace_urls=True, replaces embedded links with '<URL>' token so the TF-IDF
    vectorizer can learn that link presence is a strong smishing signal.
    """
    if not isinstance(raw_text, str):
        raise ValueError("SMS text must be a valid string.")

    text = raw_text.strip()
    if not text:
        raise ValueError("SMS text cannot be empty.")

    # Replace embedded URLs with special token
    if replace_urls:
        # Replace URLs identified by regex with <URL> token
        text = URL_REGEX.sub(" <URL> ", text)
        text = SHORTENER_REGEX.sub(" <URL> ", text)

    # Convert non-standard unicode whitespace to standard space
    text = re.sub(r"\s+", " ", text)

    # Remove non-alphanumeric characters except basic punctuation and URL token
    # Keep < and > for <URL> token
    text = re.sub(r"[^\w\s<>₹$.!?-]", " ", text)

    # Re-normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def detect_smishing_keywords(raw_text: str) -> List[str]:
    """
    Identifies high-signal smishing lure keywords present in the SMS text.
    Enforces word boundary matching to avoid substring false positives.
    """
    if not raw_text or not isinstance(raw_text, str):
        return []

    text_lower = raw_text.lower()
    matched = []

    for kw in HIGH_SIGNAL_SMISHING_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"\b"
        if re.search(pattern, text_lower):
            matched.append(kw)

    return sorted(list(set(matched)))


if __name__ == "__main__":
    test_sms = (
        "Dear SBI User, your YONO A/C is blocked today due to pending KYC. "
        "Verify PAN at http://onlinesbi-pan-kyc-verification.com/login.php "
        "or alternate mirror www.sbi-kyc.in/pan immediately!"
    )
    print("Original SMS:")
    print(test_sms)
    print("\nExtracted URLs:")
    urls = extract_urls_from_text(test_sms)
    for u in urls:
        print(f"  * {u}")
    print("\nCleaned SMS Text:")
    print(clean_sms_text(test_sms))
    print("\nDetected Smishing Keywords:")
    print(detect_smishing_keywords(test_sms))
