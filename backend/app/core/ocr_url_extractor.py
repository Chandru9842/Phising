"""
PhishShield OCR URL Extraction & Scheme Normalization Engine

Extracts URL candidates from raw OCR text and individual text blocks.
Handles common OCR optical misrecognitions (such as 'https:II' instead of 'https://',
spaced dots, and scheme variations) while preserving original evidence.

SECURITY RULE: Never makes outbound network requests, resolves DNS, or fetches URLs.
Processing is strictly local lexical pattern matching and normalization.
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple, Set


# Common OCR misrecognized schemes
CORRUPTED_SCHEME_PATTERN = re.compile(
    r"(?i)\b(https?|hxxps?)[ :;]*(?:[\\/I|!1l]{1,3}|\s+[/\\I|!1l]{1,3})\s*",
    re.IGNORECASE
)

# Standard URL regex pattern
STANDARD_URL_PATTERN = re.compile(
    r"(?i)\bhttps?://[^\s<>'\"{}|\\^`]+",
    re.IGNORECASE
)

# Common Top-Level Domains (TLDs) for domain-like token detection
RECOGNIZED_TLDS = (
    "sbi", "bank", "co.in", "net.in", "org.in", "ac.in", "gov.in", "in",
    "com", "org", "net", "xyz", "top", "live", "site", "online", "club",
    "app", "cc", "co", "info", "biz", "icu", "shop", "vip", "me", "pro",
    "io", "dev", "tech", "cloud", "security", "support", "help", "link"
)

# Sort TLDs longest first so that multi-part TLDs (co.in, gov.in) match before single-part (in)
SORTED_TLDS = sorted(RECOGNIZED_TLDS, key=len, reverse=True)
TLD_CHOICES = "|".join(re.escape(t) for t in SORTED_TLDS)

# Pattern for bare domains (supports optional subdomains and path: e.g. retail.onlinesbi.sbi/login)
TLD_REGEX_STR = (
    r"(?:\bwww\.[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+(?:/[^\s<>'\"{}|\\^`]*)?|"
    r"\b(?:[a-zA-Z0-9-]{1,63}\.)+(?:" + TLD_CHOICES + r")\b(?::\d+)?(?:/[^\s<>'\"{}|\\^`]*)?)"
)
BARE_DOMAIN_PATTERN = re.compile(TLD_REGEX_STR, re.IGNORECASE)

# Characters to strip from candidate boundaries
TRAILING_PUNCTUATION = ".,;:!?)>]}\"'`*~"
LEADING_PUNCTUATION = "(<[{'\"`"


def preprocess_ocr_text_for_urls(text: str) -> str:
    """Preprocesses common OCR token breaks such as split dots and scheme glitches."""
    if not text:
        return ""
    # 1. Normalize spaces around dots: 'onlinesbi . sbi' -> 'onlinesbi.sbi'
    s = re.sub(r"([a-zA-Z0-9])\s+\.\s+([a-zA-Z0-9])", r"\1.\2", text)
    # 2. Repair scheme space / letter glitched: 'https ll' or 'http:II' or 'https:Il' -> 'https://'
    s = re.sub(r"(?i)\b(https?|hxxps?)[ :;]*(?:[\\/I|!1l]{1,3}|\s+[/\\I|!1l]{1,3})\s*", r"\1://", s)
    # 3. Repair domain tokens separated by spaces before path /:
    def fix_domain(match):
        prefix = match.group(1)
        domain_part = match.group(2)
        rest = match.group(3)
        joined_domain = re.sub(r"\s+", ".", domain_part.strip())
        return f"{prefix}{joined_domain}/{rest}"
    s = re.sub(r"(?i)(https?://)([a-zA-Z0-9-][a-zA-Z0-9\s-]{1,60}[a-zA-Z0-9])/([^\s]+(?:\s+(?:htm|html|php|asp|aspx|jsp))?)", fix_domain, s)
    # 4. Repair path extension: /login htm -> /login.htm
    s = re.sub(r"(?i)/([^\s]+)\s+(htm|html|php|asp|aspx|jsp)\b", r"/\1.\2", s)
    return s


def clean_boundary_punctuation(text: str) -> str:
    """Strips leading and trailing bracket or punctuation characters."""
    cleaned = text.strip()
    while cleaned and cleaned[0] in LEADING_PUNCTUATION:
        cleaned = cleaned[1:].strip()
    while cleaned and cleaned[-1] in TRAILING_PUNCTUATION:
        cleaned = cleaned[:-1].strip()
    return cleaned


def normalize_ocr_scheme(candidate: str) -> Tuple[str, bool]:
    """
    Repairs common OCR scheme corruption like https:II or http:/I.
    Returns (normalized_candidate, was_repaired).
    """
    candidate_clean = candidate.strip()

    # Check for corrupted scheme like https:II, https:/I, hxxps://
    match = CORRUPTED_SCHEME_PATTERN.match(candidate_clean)
    if match:
        orig_scheme_prefix = match.group(0)
        scheme_type = "https" if "https" in orig_scheme_prefix.lower() or "hxxps" in orig_scheme_prefix.lower() else "http"
        rest = candidate_clean[len(orig_scheme_prefix):].strip()
        repaired = f"{scheme_type}://{rest}"
        return repaired, True

    # Standard check for https: // with space
    if candidate_clean.lower().startswith("https: //") or candidate_clean.lower().startswith("https:// "):
        repaired = "https://" + re.sub(r"^https:\s*//\s*", "", candidate_clean, flags=re.IGNORECASE)
        return repaired, True

    if candidate_clean.lower().startswith("http: //") or candidate_clean.lower().startswith("http:// "):
        repaired = "http://" + re.sub(r"^http:\s*//\s*", "", candidate_clean, flags=re.IGNORECASE)
        return repaired, True

    return candidate_clean, False


def find_block_confidence(candidate_snippet: str, text_blocks: List[Dict[str, Any]]) -> float:
    """Finds highest confidence score among text blocks containing the snippet."""
    if not text_blocks:
        return 0.90

    best_conf = 0.0
    found = False
    clean_snip = candidate_snippet.lower().replace("https://", "").replace("http://", "").strip()
    
    # Check each block
    for block in text_blocks:
        b_text = str(block.get("text", "")).lower()
        b_conf = float(block.get("confidence", 0.0))
        if clean_snip in b_text or any(token in b_text for token in clean_snip.split("/") if len(token) > 3):
            best_conf = max(best_conf, b_conf)
            found = True

    return round(best_conf, 4) if found else 0.85


def extract_urls_from_ocr(
    full_text: str,
    text_blocks: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Extracts, repairs, and deduplicates URL candidates from OCR text and text blocks.

    Args:
        full_text: Combined string of all detected OCR text.
        text_blocks: List of individual text block objects with confidence and bounding boxes.

    Returns:
        List of dictionaries matching ExtractedURLCandidate schema.
    """
    if not full_text or not full_text.strip():
        return []

    text_blocks = text_blocks or []
    extracted_candidates: List[Dict[str, Any]] = []
    seen_normalized: Set[str] = set()

    # Sources of candidate text to evaluate:
    # 1. Full text
    # 2. Individual text blocks (preserves locality for address bars)
    text_sources = [full_text] + [str(b.get("text", "")) for b in text_blocks if b.get("text")]

    for source in text_sources:
        if not source:
            continue

        # A. Find candidates with corrupted or standard schemes
        # Normalize potential internal space around dots, split schemes, etc.
        source_clean = preprocess_ocr_text_for_urls(source)

        # 1. Find standard URLs
        for m in STANDARD_URL_PATTERN.finditer(source_clean):
            raw_match = clean_boundary_punctuation(m.group(0))
            if len(raw_match) > 6:
                norm_url, repaired = normalize_ocr_scheme(raw_match)
                status = "normalized_scheme" if repaired else "original"
                canon_key = norm_url.lower().rstrip("/")
                if canon_key not in seen_normalized:
                    seen_normalized.add(canon_key)
                    conf = find_block_confidence(raw_match, text_blocks)
                    extracted_candidates.append({
                        "original_text": raw_match,
                        "normalized_url": norm_url,
                        "reconstruction_status": status,
                        "ocr_confidence": conf,
                        "scan_status": "pending",
                        "url_scan_result": None,
                        "brand_analysis": None,
                        "scan_error": None
                    })

        # 2. Find corrupted schemes (e.g. https:II, http:II)
        for m in CORRUPTED_SCHEME_PATTERN.finditer(source_clean):
            start_pos = m.start()
            # Extract until next whitespace or end
            end_match = re.search(r"[\s<>'\"{}|\\^`]", source_clean[start_pos:])
            end_pos = start_pos + end_match.start() if end_match else len(source_clean)
            raw_match = clean_boundary_punctuation(source_clean[start_pos:end_pos])
            if len(raw_match) > 7:
                norm_url, repaired = normalize_ocr_scheme(raw_match)
                canon_key = norm_url.lower().rstrip("/")
                if canon_key not in seen_normalized:
                    seen_normalized.add(canon_key)
                    conf = find_block_confidence(raw_match, text_blocks)
                    extracted_candidates.append({
                        "original_text": raw_match,
                        "normalized_url": norm_url,
                        "reconstruction_status": "normalized_scheme",
                        "ocr_confidence": conf,
                        "scan_status": "pending",
                        "url_scan_result": None,
                        "brand_analysis": None,
                        "scan_error": None
                    })

        # 3. Find bare domains or www domains with recognized TLDs
        for m in BARE_DOMAIN_PATTERN.finditer(source_clean):
            raw_match = clean_boundary_punctuation(m.group(0))
            # Ignore if already preceded by scheme, corrupted scheme, email @, or path separator
            start_idx = m.start()
            if start_idx > 0 and source_clean[start_idx - 1] in ".-_/@:":
                continue

            prefix = source_clean[max(0, start_idx - 25):start_idx].lower()
            if (
                "http://" in prefix or "https://" in prefix or
                re.search(r"(?i)(?:https?|hxxps?)[:;][/\\I|!1\s]*$", prefix) or
                raw_match.startswith("II") or raw_match.startswith("//")
            ):
                continue

            # Basic validation: must have at least one dot and valid characters
            if "." in raw_match and len(raw_match) >= 4 and not raw_match.startswith("."):
                # Prepend https:// for normalized URL
                normalized = f"https://{raw_match}" if not raw_match.lower().startswith("http") else raw_match
                canon_key = normalized.lower().rstrip("/")
                if canon_key not in seen_normalized:
                    seen_normalized.add(canon_key)
                    conf = find_block_confidence(raw_match, text_blocks)
                    extracted_candidates.append({
                        "original_text": raw_match,
                        "normalized_url": normalized,
                        "reconstruction_status": "reconstructed_domain",
                        "ocr_confidence": conf,
                        "scan_status": "pending",
                        "url_scan_result": None,
                        "brand_analysis": None,
                        "scan_error": None
                    })

    return extracted_candidates
