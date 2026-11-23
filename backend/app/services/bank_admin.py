"""
Managed Indian Bank Registry Administration Service
Provides strict domain validation, canonical baseline protection, and dynamic registry merging.
"""

import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.bank_registry import ManagedBankRecord
from app.core.brand_registry import INDIAN_BANKING_REGISTRY

# Strict Fully Qualified Domain Name (FQDN) validation regex
# Rejects wildcards (*), protocol schemes, slashes, ports, IP addresses, and invalid TLDs
FQDN_REGEX = re.compile(
    r"^(?!\-)(?:[a-zA-Z0-9\-]{1,63}\.)+[a-zA-Z]{2,24}$"
)


def validate_domain_format(domain: str) -> bool:
    """
    Validates that a string is a clean, syntactically valid Fully Qualified Domain Name.
    Disallows wildcards, protocol schemes, paths, queries, ports, and IP addresses.
    Supports IDN/Punycode and normalizes trailing root dots.
    """
    if not domain or not isinstance(domain, str):
        return False
    domain = domain.strip().lower().rstrip(".")

    # Reject protocol prefixes and paths
    if "://" in domain or "/" in domain or ":" in domain:
        return False

    # Reject wildcards and dangerous matching symbols
    if any(char in domain for char in ["*", "?", "%", "$", "^", " ", "<", ">", "\"", "\\"]):
        return False

    # Normalize IDN / non-ASCII domains to Punycode
    try:
        domain = domain.encode("idna").decode("ascii")
    except Exception:
        return False

    # Check FQDN pattern
    if not FQDN_REGEX.match(domain):
        return False

    # Disallow bare numeric IP addresses
    parts = domain.split(".")
    if all(p.isdigit() for p in parts):
        return False

    return True


def get_active_banking_registry(db: Session) -> List[Dict[str, Any]]:
    """
    Returns the unified active banking registry:
    Base 16 canonical banks + approved active custom banks from database.
    """
    # Start with base canonical banks
    unified = list(INDIAN_BANKING_REGISTRY)

    # Fetch active custom records from database
    try:
        custom_banks = db.query(ManagedBankRecord).filter(
            ManagedBankRecord.is_active == True
        ).all()

        for cb in custom_banks:
            # Check if brand already exists in canonical
            exists = any(b["brand_name"].lower() == cb.brand_name.lower() for b in unified)
            if not exists:
                unified.append({
                    "brand_name": cb.brand_name,
                    "primary_domain": cb.primary_domain,
                    "official_domains": cb.official_domains if isinstance(cb.official_domains, list) else [cb.primary_domain],
                    "keywords": cb.keywords if isinstance(cb.keywords, list) else [cb.brand_name.lower()],
                    "category": cb.category or "Commercial Bank",
                    "is_custom": True,
                    "id": cb.id
                })
    except Exception:
        # Fallback to canonical baseline if table not initialized
        pass

    return unified


def add_managed_bank(
    db: Session,
    brand_name: str,
    primary_domain: str,
    official_domains: List[str],
    keywords: List[str],
    category: str = "Commercial Bank",
    created_by: str = "admin"
) -> ManagedBankRecord:
    """
    Validates and persists a new banking institution to the managed registry.
    """
    if not brand_name or len(brand_name.strip()) < 2:
        raise ValueError("Brand name must be at least 2 characters.")

    brand_name = brand_name.strip()
    primary_domain = primary_domain.strip().lower()

    if not validate_domain_format(primary_domain):
        raise ValueError(f"Primary domain '{primary_domain}' is not a valid Fully Qualified Domain Name.")

    # Validate official domains
    clean_official = []
    if not official_domains:
        clean_official = [primary_domain]
    else:
        for d in official_domains:
            d_clean = d.strip().lower()
            if not validate_domain_format(d_clean):
                raise ValueError(f"Official domain entry '{d_clean}' is not a valid domain.")
            clean_official.append(d_clean)

    if primary_domain not in clean_official:
        clean_official.append(primary_domain)

    # Clean keywords
    clean_keywords = [k.strip().lower() for k in keywords if len(k.strip()) >= 2]
    if not clean_keywords:
        clean_keywords = [brand_name.lower()]

    # Check for duplicate
    existing = db.query(ManagedBankRecord).filter(ManagedBankRecord.brand_name == brand_name).first()
    if existing:
        raise ValueError(f"Bank with brand name '{brand_name}' already exists in managed registry.")

    # Check against canonical baseline
    if any(b["brand_name"].lower() == brand_name.lower() for b in INDIAN_BANKING_REGISTRY):
        raise ValueError(f"'{brand_name}' is a protected canonical banking entity and cannot be re-added as custom.")

    # Guard against canonical official domain hijacking
    canonical_official_domains = set()
    for b in INDIAN_BANKING_REGISTRY:
        for d in b.get("official_domains", []):
            canonical_official_domains.add(d.strip().lower().rstrip("."))
        if b.get("primary_domain"):
            canonical_official_domains.add(b["primary_domain"].strip().lower().rstrip("."))

    for d in clean_official:
        clean_d = d.rstrip(".")
        if clean_d in canonical_official_domains:
            raise ValueError(
                f"Domain '{d}' belongs to a protected canonical Indian banking institution and cannot be registered under a custom entry."
            )

    bank_record = ManagedBankRecord(
        brand_name=brand_name,
        primary_domain=primary_domain,
        official_domains=clean_official,
        keywords=clean_keywords,
        category=category,
        is_custom=True,
        is_active=True,
        created_by=created_by
    )
    db.add(bank_record)
    db.commit()
    db.refresh(bank_record)
    return bank_record
