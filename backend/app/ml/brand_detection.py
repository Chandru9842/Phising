"""
PhishShield Indian Banking Brand Impersonation Detection Engine

Detects typosquatting, lookalike domains, subdomain spoofing, and lure keyword
combinations targeting Indian banking customers.

SECURITY RULE: Never visits, resolves, or executes target URLs.
All processing is purely static string and syntactic domain analysis.
"""

import os
import sys
import re
from typing import Dict, Any, List, Optional, Tuple

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import tldextract
from app.core.brand_registry import INDIAN_BANKING_REGISTRY, is_official_domain
from app.ml.feature_extraction import sanitize_and_parse_url, SUSPICIOUS_KEYWORDS

# Initialize tldextract offline without outbound suffix list downloads
_tld_extractor = tldextract.TLDExtract(cache_dir=None, suffix_list_urls=None)

# High-risk banking lure terms frequently used in phishing campaigns
BANKING_LURE_TERMS = {
    "kyc", "pan", "aadhar", "aadhaar", "otp", "verify", "verification",
    "login", "signin", "update", "netbanking", "secure", "security",
    "ebanking", "reward", "rewardpoint", "points", "redeem", "bonus",
    "cashback", "blocked", "unblock", "suspend", "suspended", "deactivate",
    "portal", "auth", "confirm", "support", "service", "alert"
}

# Configurable similarity thresholds
MIN_KEYWORD_LENGTH_FOR_SUBSTRING = 4
MAX_TYPOSQUATTING_DISTANCE = 2
MIN_TYPOSQUATTING_SIMILARITY = 0.80


def damerau_levenshtein_distance(s1: str, s2: str) -> int:
    """
    Computes Damerau-Levenshtein distance (insertions, deletions,
    substitutions, and transpositions of adjacent characters).
    Uses rapidfuzz if available, falling back to pure Python implementation.
    """
    try:
        from rapidfuzz.distance import DamerauLevenshtein
        return int(DamerauLevenshtein.distance(s1, s2))
    except ImportError:
        pass

    # Pure Python fallback for Damerau-Levenshtein
    len1, len2 = len(s1), len(s2)
    d = {}
    for i in range(-1, len1 + 1):
        d[(i, -1)] = i + 1
    for j in range(-1, len2 + 1):
        d[(-1, j)] = j + 1

    for i in range(len1):
        for j in range(len2):
            cost = 0 if s1[i] == s2[j] else 1
            d[(i, j)] = min(
                d[(i - 1, j)] + 1,        # deletion
                d[(i, j - 1)] + 1,        # insertion
                d[(i - 1, j - 1)] + cost  # substitution
            )
            if i > 0 and j > 0 and s1[i] == s2[j - 1] and s1[i - 1] == s2[j]:
                d[(i, j)] = min(d[(i, j)], d[(i - 2, j - 2)] + 1)  # transposition

    return d[(len1 - 1, len2 - 1)]


def calculate_similarity_ratio(s1: str, s2: str, distance: int) -> float:
    """Calculates normalized similarity score between 0.0 and 1.0 based on distance."""
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    return max(0.0, round(1.0 - (distance / max_len), 4))


def extract_domain_components(raw_url: str) -> Dict[str, str]:
    """
    Safely extracts domain components without network resolution.
    Returns hostname, registered_domain, domain_sld, subdomain, tld, and path.
    """
    parsed_info = sanitize_and_parse_url(raw_url)
    ext = _tld_extractor(parsed_info["raw_url"])

    if hasattr(ext, "top_domain_under_public_suffix") and ext.top_domain_under_public_suffix:
        registered_domain = ext.top_domain_under_public_suffix.lower()
    else:
        registered_domain = (getattr(ext, "registered_domain", "") or "").lower()
    
    subdomain = ext.subdomain.lower() if ext.subdomain else ""
    tld = ext.suffix.lower() if ext.suffix else ""
    domain_sld = ext.domain.lower() if ext.domain else ""
    hostname = parsed_info["hostname"]
    path = parsed_info["parsed"].path.lower() if parsed_info["parsed"].path else ""

    return {
        "raw_url": parsed_info["raw_url"],
        "hostname": hostname,
        "registered_domain": registered_domain,
        "domain_sld": domain_sld,
        "subdomain": subdomain,
        "tld": tld,
        "path": path,
    }


def keyword_matches_token(keyword: str, text: str) -> bool:
    """
    Checks if keyword matches within text.
    For short keywords (< 4 chars, e.g. 'sbi', 'bob', 'pnb'), enforces token boundary
    to avoid false positives on words like 'bobcat' or 'disbility'.
    For longer keywords (>= 4 chars), allows substring match.
    """
    if not keyword or not text:
        return False

    kw = keyword.lower()
    txt = text.lower()

    if len(kw) < MIN_KEYWORD_LENGTH_FOR_SUBSTRING:
        # Require boundary matching
        pattern = r"(^|[^a-z0-9])" + re.escape(kw) + r"([^a-z0-9]|$)"
        return bool(re.search(pattern, txt))
    else:
        return kw in txt


def find_lure_keywords_in_text(text: str) -> List[str]:
    """Finds banking lure keywords present in a given string."""
    found = []
    text_lower = text.lower()
    for lure in BANKING_LURE_TERMS:
        if lure in text_lower:
            found.append(lure)
    return sorted(found)


def check_exact_official_match(hostname: str, registered_domain: str) -> Optional[Dict[str, Any]]:
    """
    Verifies if hostname or registered domain matches any official bank domain.
    Legitimate subdomains of official domains (e.g. retail.onlinesbi.sbi) are verified.
    """
    for bank in INDIAN_BANKING_REGISTRY:
        for official in bank["official_domains"]:
            official_lower = official.lower()
            if hostname == official_lower or hostname.endswith("." + official_lower):
                return {
                    "detected_brand": bank["brand_name"],
                    "official_domain": bank["primary_domain"],
                    "matched_official_domain": official_lower,
                    "submitted_domain": registered_domain or hostname,
                    "similarity_score": 1.0,
                    "edit_distance": 0,
                    "match_type": "EXACT_OFFICIAL",
                    "is_official_domain": True,
                    "impersonation_suspected": False,
                    "reasons": [
                        f"Verified authentic banking portal: Domain matches official registered infrastructure of {bank['brand_name']} ({official_lower})."
                    ],
                }
    return None


def detect_brand_impersonation(raw_url: str) -> Dict[str, Any]:
    """
    Analyzes a URL against the Indian Banking Registry for brand impersonation.
    
    Evaluates:
    1. Exact official domain match (Zero Trust verified)
    2. Subdomain spoofing (bank keyword on untrusted host)
    3. Typosquatting & lookalike domains (Damerau-Levenshtein distance <= 2)
    4. Suspicious keyword combinations in domain SLD (brand + KYC/lure)
    5. Path spoofing (bank brand in path of untrusted domain)
    """
    components = extract_domain_components(raw_url)
    hostname = components["hostname"]
    registered_domain = components["registered_domain"]
    domain_sld = components["domain_sld"]
    subdomain = components["subdomain"]
    path = components["path"]

    # 1. Check exact official domain match first
    official_match = check_exact_official_match(hostname, registered_domain)
    if official_match:
        official_match["all_matches"] = []
        return official_match

    candidates: List[Dict[str, Any]] = []

    # Evaluate against each bank in the registry
    for bank in INDIAN_BANKING_REGISTRY:
        brand_name = bank["brand_name"]
        primary_domain = bank["primary_domain"]
        keywords = bank["keywords"]
        official_domains = bank["official_domains"]

        # Extract SLDs of official domains (e.g. 'onlinesbi', 'hdfcbank', etc.)
        official_slds = set()
        for off in official_domains:
            parts = off.split(".")
            if len(parts) >= 2:
                official_slds.add(parts[0])

        # -------------------------------------------------------------
        # A. Subdomain Spoofing Check
        # e.g., sbi.attacker-domain.com or hdfc.security-portal.xyz
        # -------------------------------------------------------------
        if subdomain:
            for kw in keywords:
                if keyword_matches_token(kw, subdomain):
                    candidates.append({
                        "detected_brand": brand_name,
                        "official_domain": primary_domain,
                        "submitted_domain": registered_domain or hostname,
                        "similarity_score": 0.95,
                        "edit_distance": 0,
                        "match_type": "SUBDOMAIN_SPOOFING",
                        "is_official_domain": False,
                        "impersonation_suspected": True,
                        "reasons": [
                            f"Subdomain Spoofing: Brand identifier '{kw}' for {brand_name} appears in subdomain '{subdomain}' on untrusted domain '{registered_domain}'."
                        ],
                        "severity_rank": 10.0,
                    })
                    break

        # -------------------------------------------------------------
        # B. Typosquatting / Lookalike Detection (Damerau-Levenshtein)
        # e.g. onlinesb1.sbi, hdfcbamk.com, 1cicibank.com
        # Prioritized over generic substring lures when edit distance <= 2
        # -------------------------------------------------------------
        if domain_sld:
            for target_sld in official_slds:
                if len(target_sld) < 4:
                    continue  # Skip short SLDs (< 4 chars) to avoid false positives

                dist = damerau_levenshtein_distance(domain_sld, target_sld)
                ratio = calculate_similarity_ratio(domain_sld, target_sld, dist)

                # Qualification for typosquatting:
                # 1. Edit distance 1 or 2 with ratio >= 0.80
                # 2. Cannot be identical (identical would be official or handled)
                if dist > 0 and dist <= MAX_TYPOSQUATTING_DISTANCE and ratio >= MIN_TYPOSQUATTING_SIMILARITY:
                    candidates.append({
                        "detected_brand": brand_name,
                        "official_domain": primary_domain,
                        "submitted_domain": registered_domain,
                        "similarity_score": ratio,
                        "edit_distance": dist,
                        "match_type": "TYPOSQUATTING",
                        "is_official_domain": False,
                        "impersonation_suspected": True,
                        "reasons": [
                            f"Typosquatting Detected: Domain '{registered_domain}' ({domain_sld}) is closely mimicking official banking domain '{target_sld}' with Damerau-Levenshtein distance {dist} (similarity: {round(ratio * 100, 1)}%)."
                        ],
                        "severity_rank": 9.5,
                    })

        # -------------------------------------------------------------
        # C. Suspicious Keyword Combinations in Domain SLD
        # e.g., onlinesbi-pan-kyc-verification.com or sbi-login-portal.in
        # -------------------------------------------------------------
        if domain_sld:
            for kw in keywords:
                if keyword_matches_token(kw, domain_sld):
                    lures = find_lure_keywords_in_text(domain_sld + " " + path)
                    has_hyphen_delimiter = f"{kw}-" in domain_sld or f"-{kw}" in domain_sld
                    
                    if lures or has_hyphen_delimiter or len(domain_sld) > len(kw) + 3:
                        lure_desc = f" with sensitive lure terms ({', '.join(lures[:4])})" if lures else ""
                        candidates.append({
                            "detected_brand": brand_name,
                            "official_domain": primary_domain,
                            "submitted_domain": registered_domain,
                            "similarity_score": 0.90,
                            "edit_distance": 0,
                            "match_type": "SUSPICIOUS_KEYWORD_COMBO",
                            "is_official_domain": False,
                            "impersonation_suspected": True,
                            "reasons": [
                                f"Brand Keyword Abuse: Registered domain '{registered_domain}' incorporates bank brand '{kw}'{lure_desc}."
                            ],
                            "severity_rank": 9.0,
                        })
                        break

        # -------------------------------------------------------------
        # D. Path Spoofing
        # e.g. attacker-domain.com/onlinesbi/login.php
        # -------------------------------------------------------------
        if path and path != "/":
            for kw in keywords:
                if keyword_matches_token(kw, path):
                    lures = find_lure_keywords_in_text(path)
                    lure_desc = f" alongside authentication lures ({', '.join(lures[:3])})" if lures else ""
                    candidates.append({
                        "detected_brand": brand_name,
                        "official_domain": primary_domain,
                        "submitted_domain": registered_domain or hostname,
                        "similarity_score": 0.75,
                        "edit_distance": 0,
                        "match_type": "PATH_SPOOFING",
                        "is_official_domain": False,
                        "impersonation_suspected": True,
                        "reasons": [
                            f"Path Spoofing: Target brand identifier '{kw}' ({brand_name}) identified in URL path '{path}'{lure_desc} on untrusted host."
                        ],
                        "severity_rank": 6.0,
                    })
                    break

    # If no candidate matches were found, return benign NONE status
    if not candidates:
        return {
            "detected_brand": None,
            "official_domain": None,
            "submitted_domain": registered_domain or hostname,
            "similarity_score": 0.0,
            "edit_distance": -1,
            "match_type": "NONE",
            "is_official_domain": False,
            "impersonation_suspected": False,
            "reasons": ["No Indian banking brand impersonation detected."],
            "all_matches": [],
        }

    # Sort candidates by severity rank descending, then similarity score descending
    candidates.sort(key=lambda c: (c.get("severity_rank", 0), c["similarity_score"]), reverse=True)
    primary_match = candidates[0].copy()
    primary_match.pop("severity_rank", None)

    # Clean and attach all matches for multi-brand audit
    cleaned_all = []
    for cand in candidates:
        c_copy = cand.copy()
        c_copy.pop("severity_rank", None)
        cleaned_all.append(c_copy)
    primary_match["all_matches"] = cleaned_all

    return primary_match


if __name__ == "__main__":
    import json
    test_urls = [
        "https://retail.onlinesbi.sbi/retail/login.htm",
        "http://onlinesbi-pan-kyc-verification.com/login.php",
        "http://onlinesb1.sbi/login",
        "http://hdfcbamk.com/login",
        "http://1cicibank.com/netbanking",
        "http://sbi.kyc-update.com/pan",
        "https://infinity.icicibank.com/corp/AuthenticationController",
        "https://en.wikipedia.org/wiki/Phishing",
    ]
    for u in test_urls:
        print(f"\n--- Testing: {u} ---")
        res = detect_brand_impersonation(u)
        print(f"Brand: {res['detected_brand']}, Match Type: {res['match_type']}, Dist: {res['edit_distance']}, Ratio: {res['similarity_score']}")
