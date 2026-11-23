"""
PhishShield URL Feature Extraction Module

Extracts lexical, structural, host-based, and brand-aware cybersecurity features
from URLs for machine learning classification.

IMPORTANT SECURITY RULE: Never visits, resolves, or executes target URLs.
All processing is purely static string and syntactic analysis.
"""

import re
import math
import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from typing import Dict, List, Union, Optional
from urllib.parse import urlparse, parse_qs
import tldextract

from app.core.brand_registry import INDIAN_BANKING_REGISTRY, is_official_domain

# High-frequency phishing lure keywords
SUSPICIOUS_KEYWORDS = [
    "verify", "verification", "login", "signin", "sign-in", "log-in",
    "update", "banking", "netbanking", "secure", "security", "account",
    "kyc", "pan", "aadhar", "aadhaar", "otp", "passcode", "password",
    "service", "support", "confirm", "confirmation", "auth", "authorize",
    "alert", "billing", "card", "creditcard", "debitcard", "wallet",
    "refund", "claim", "reward", "bonus", "gift", "cashback", "bill",
    "electricity", "suspend", "suspended", "deactivate", "blocked", "ebanking"
]

# Common URL shortener services
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly",
    "ow.ly", "tiny.cc", "rb.gy", "rebrand.ly", "cutt.ly", "shorturl.at",
    "v.gd", "qr.ae", "s.id", "t.ly", "clck.ru", "bl.ink"
}

# TLDs disproportionately used in malicious phishing campaigns
HIGH_RISK_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "buzz", "club",
    "work", "icu", "vip", "fit", "online", "click", "link", "rest",
    "cam", "surf", "monster", "cfd", "sbs", "quest", "beauty"
}

# Ordered list of all features extracted for ML training and inference
FEATURE_NAMES: List[str] = [
    "url_length",
    "hostname_length",
    "domain_length",
    "path_length",
    "query_length",
    "num_dots",
    "num_dots_hostname",
    "num_subdomains",
    "subdomain_length",
    "num_hyphens",
    "num_hyphens_domain",
    "num_underscores",
    "num_digits",
    "digit_ratio",
    "num_special_chars",
    "is_https",
    "has_ip",
    "has_at_symbol",
    "has_double_slash_path",
    "num_query_params",
    "is_shortened",
    "suspicious_keyword_count",
    "brand_impersonation_keyword",
    "shannon_entropy",
    "has_port",
    "has_suspicious_tld",
]

# IPv4 regex
IPV4_REGEX = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
)

# Initialize tldextract with cache offline without outbound suffix list downloads
_tld_extractor = tldextract.TLDExtract(cache_dir=None, suffix_list_urls=None)


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def has_ip_address(hostname: str) -> int:
    """Detect if hostname is an IPv4 or IPv6 address or hex representation."""
    if not hostname:
        return 0
    # Strip port if present
    host = hostname.split(":")[0]
    if IPV4_REGEX.match(host):
        return 1
    # Check for IPv6
    if ":" in host and any(c.isalnum() for c in host):
        return 1
    # Check for hex-encoded IP (e.g., 0x7f.0x0.0x0.0x1)
    if host.startswith("0x") or ".0x" in host:
        return 1
    return 0


def detect_brand_impersonation_feature(subdomain: str, path: str, registered_domain: str) -> int:
    """
    Checks if an Indian banking keyword appears in subdomains or path
    when the registered domain is NOT that bank's official domain.
    """
    if not registered_domain:
        return 0
    
    # If the registered domain is already officially verified, it's not impersonating
    if is_official_domain(registered_domain):
        return 0

    combined_untrusted_text = f"{subdomain}.{path}".lower()
    
    for bank in INDIAN_BANKING_REGISTRY:
        for keyword in bank["keywords"]:
            # Check for keyword surrounded by delimiters or direct word boundary
            if keyword in combined_untrusted_text:
                return 1
    return 0


def sanitize_and_parse_url(raw_url: str):
    """
    Safely sanitizes and parses a URL without executing network calls.
    Raises ValueError for non-string or unparseable URLs.
    """
    if not isinstance(raw_url, str):
        raise ValueError("URL must be a string")
    
    url = raw_url.strip()
    if not url:
        raise ValueError("URL cannot be empty")
    
    # Normalize scheme for parsing
    if not url.startswith("http://") and not url.startswith("https://"):
        parsed_target = "http://" + url
    else:
        parsed_target = url

    try:
        parsed = urlparse(parsed_target)
    except Exception as e:
        raise ValueError(f"Failed to parse URL: {e}")

    hostname = (parsed.hostname or "").lower()
    if not hostname and parsed.netloc:
        hostname = parsed.netloc.split(":")[0].lower()

    # Extract domain using tldextract safely without deprecation warnings
    ext = _tld_extractor(url)
    if hasattr(ext, "top_domain_under_public_suffix") and ext.top_domain_under_public_suffix:
        registered_domain = ext.top_domain_under_public_suffix.lower()
    else:
        registered_domain = (getattr(ext, "registered_domain", "") or "").lower()
    subdomain = ext.subdomain.lower() if ext.subdomain else ""
    tld = ext.suffix.lower() if ext.suffix else ""

    return {
        "raw_url": url,
        "parsed": parsed,
        "hostname": hostname,
        "subdomain": subdomain,
        "registered_domain": registered_domain,
        "tld": tld,
    }


def extract_features_dict(raw_url: str) -> Dict[str, Union[int, float]]:
    """
    Extracts numerical features from a URL into a dictionary.
    Safe against malformed inputs.
    """
    parsed_info = sanitize_and_parse_url(raw_url)
    url = parsed_info["raw_url"]
    parsed = parsed_info["parsed"]
    hostname = parsed_info["hostname"]
    subdomain = parsed_info["subdomain"]
    registered_domain = parsed_info["registered_domain"]
    tld = parsed_info["tld"]

    url_lower = url.lower()
    path = parsed.path or ""
    query = parsed.query or ""

    # Subdomain count
    subdomain_parts = [s for s in subdomain.split(".") if s]
    num_subdomains = len(subdomain_parts)

    # Counts
    num_dots = url.count(".")
    num_dots_hostname = hostname.count(".")
    num_hyphens = url.count("-")
    num_hyphens_domain = registered_domain.count("-")
    num_underscores = url.count("_")
    
    # Digits
    digits = sum(c.isdigit() for c in url)
    digit_ratio = round(digits / len(url), 4) if len(url) > 0 else 0.0

    # Special characters
    special_chars = set("@?=&%+~!$*,;")
    num_special_chars = sum(1 for c in url if c in special_chars)

    # HTTPS check
    is_https = 1 if url_lower.startswith("https://") else 0

    # IP address
    has_ip = has_ip_address(hostname)

    # @ symbol
    has_at_symbol = 1 if "@" in url else 0

    # Double slash in path
    has_double_slash_path = 1 if "//" in path else 0

    # Query params
    try:
        parsed_qs = parse_qs(query)
        num_query_params = len(parsed_qs)
    except Exception:
        num_query_params = query.count("&") + (1 if query else 0)

    # URL shortener detection
    is_shortened = 1 if registered_domain in URL_SHORTENERS or hostname in URL_SHORTENERS else 0

    # Suspicious keywords count in URL
    suspicious_keyword_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    # Brand impersonation detection in subdomains or path
    brand_impersonation_keyword = detect_brand_impersonation_feature(subdomain, path, registered_domain)

    # Shannon entropy of URL
    shannon_entropy = calculate_entropy(url)

    # Port in netloc
    has_port = 1 if ":" in parsed.netloc and not parsed.netloc.endswith(":80") and not parsed.netloc.endswith(":443") else 0

    # Suspicious TLD
    has_suspicious_tld = 1 if tld in HIGH_RISK_TLDS else 0

    return {
        "url_length": len(url),
        "hostname_length": len(hostname),
        "domain_length": len(registered_domain),
        "path_length": len(path),
        "query_length": len(query),
        "num_dots": num_dots,
        "num_dots_hostname": num_dots_hostname,
        "num_subdomains": num_subdomains,
        "subdomain_length": len(subdomain),
        "num_hyphens": num_hyphens,
        "num_hyphens_domain": num_hyphens_domain,
        "num_underscores": num_underscores,
        "num_digits": digits,
        "digit_ratio": digit_ratio,
        "num_special_chars": num_special_chars,
        "is_https": is_https,
        "has_ip": has_ip,
        "has_at_symbol": has_at_symbol,
        "has_double_slash_path": has_double_slash_path,
        "num_query_params": num_query_params,
        "is_shortened": is_shortened,
        "suspicious_keyword_count": suspicious_keyword_count,
        "brand_impersonation_keyword": brand_impersonation_keyword,
        "shannon_entropy": shannon_entropy,
        "has_port": has_port,
        "has_suspicious_tld": has_suspicious_tld,
    }


def extract_features_vector(raw_url: str) -> List[Union[int, float]]:
    """
    Extracts features as a flat numerical vector in the exact order
    defined by FEATURE_NAMES.
    """
    f_dict = extract_features_dict(raw_url)
    return [f_dict[name] for name in FEATURE_NAMES]
