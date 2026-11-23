"""Indian Banking Official Domain and Brand Impersonation Registry"""

from typing import List, Dict, Optional, Any

# Canonical Registry of Indian Banking Entities
INDIAN_BANKING_REGISTRY: List[Dict[str, Any]] = [
    {
        "brand_name": "State Bank of India",
        "primary_domain": "onlinesbi.sbi",
        "official_domains": ["onlinesbi.sbi", "sbi.co.in", "sbi.bank.in", "sbicard.com"],
        "keywords": ["sbi", "onlinesbi", "statebankofindia", "sbicard", "yono"],
        "category": "Public Sector Bank"
    },
    {
        "brand_name": "HDFC Bank",
        "primary_domain": "hdfcbank.com",
        "official_domains": ["hdfcbank.com", "hdfc.com", "netbanking.hdfcbank.com"],
        "keywords": ["hdfc", "hdfcbank", "netbanking-hdfc"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "ICICI Bank",
        "primary_domain": "icicibank.com",
        "official_domains": ["icicibank.com", "infinity.icicibank.com", "icicidirect.com"],
        "keywords": ["icici", "icicibank", "imobile", "icicidirect"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "Axis Bank",
        "primary_domain": "axisbank.com",
        "official_domains": ["axisbank.com", "axisbiconnect.axisbank.co.in"],
        "keywords": ["axis", "axisbank", "axisconnect"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "Kotak Mahindra Bank",
        "primary_domain": "kotak.com",
        "official_domains": ["kotak.com", "netbanking.kotak.com", "kotak811.com"],
        "keywords": ["kotak", "kotak811", "kotakbank", "kotakmahindra"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "Punjab National Bank",
        "primary_domain": "pnbindia.in",
        "official_domains": ["pnbindia.in", "netpnb.com", "pnb.bank.in"],
        "keywords": ["pnb", "pnbindia", "punjabnationalbank", "netpnb"],
        "category": "Public Sector Bank"
    },
    {
        "brand_name": "Bank of Baroda",
        "primary_domain": "bankofbaroda.in",
        "official_domains": ["bankofbaroda.in", "bobibanking.com", "bankofbaroda.com"],
        "keywords": ["bob", "bankofbaroda", "bobibanking", "bobworld"],
        "category": "Public Sector Bank"
    },
    {
        "brand_name": "Canara Bank",
        "primary_domain": "canarabank.com",
        "official_domains": ["canarabank.com", "canarabank.in"],
        "keywords": ["canara", "canarabank"],
        "category": "Public Sector Bank"
    },
    {
        "brand_name": "Union Bank of India",
        "primary_domain": "unionbankofindia.co.in",
        "official_domains": ["unionbankofindia.co.in", "unionbankonline.co.in"],
        "keywords": ["unionbank", "unionbankofindia", "uboi"],
        "category": "Public Sector Bank"
    },
    {
        "brand_name": "IndusInd Bank",
        "primary_domain": "indusind.com",
        "official_domains": ["indusind.com", "indusnet.indusind.com"],
        "keywords": ["indusind", "indusindbank", "indusnet"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "Yes Bank",
        "primary_domain": "yesbank.in",
        "official_domains": ["yesbank.in", "yesonline.yesbank.co.in"],
        "keywords": ["yesbank", "yesonline"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "IDBI Bank",
        "primary_domain": "idbibank.in",
        "official_domains": ["idbibank.in", "inet.idbibank.co.in"],
        "keywords": ["idbi", "idbibank"],
        "category": "Private Sector Bank"
    },
    {
        "brand_name": "Reserve Bank of India (RBI)",
        "primary_domain": "rbi.org.in",
        "official_domains": ["rbi.org.in"],
        "keywords": ["rbi", "reservebank", "reservebankofindia"],
        "category": "Regulatory Authority"
    },
    {
        "brand_name": "National Payments Corporation of India (NPCI)",
        "primary_domain": "npci.org.in",
        "official_domains": ["npci.org.in", "bhimupi.org.in"],
        "keywords": ["npci", "bhim", "bhimupi", "upigateway"],
        "category": "Payment Network"
    },
    {
        "brand_name": "Paytm Payments Bank",
        "primary_domain": "paytmbank.com",
        "official_domains": ["paytmbank.com", "paytm.com"],
        "keywords": ["paytm", "paytmbank", "paytmpaymentsbank"],
        "category": "Payments Bank"
    },
    {
        "brand_name": "Airtel Payments Bank",
        "primary_domain": "airtel.in",
        "official_domains": ["airtel.in", "airtelbank.com"],
        "keywords": ["airtelbank", "airtelpaymentsbank"],
        "category": "Payments Bank"
    }
]

def get_bank_by_name(name: str) -> Optional[Dict[str, Any]]:
    for bank in INDIAN_BANKING_REGISTRY:
        if bank["brand_name"].lower() == name.lower():
            return bank
    return None

def is_official_domain(domain: str) -> bool:
    """Check whether a registered domain or hostname is in the official list."""
    domain = domain.lower().strip()
    for bank in INDIAN_BANKING_REGISTRY:
        for official in bank["official_domains"]:
            if domain == official or domain.endswith("." + official):
                return True
    return False

def get_all_official_domains() -> List[str]:
    all_domains = []
    for bank in INDIAN_BANKING_REGISTRY:
        all_domains.extend(bank["official_domains"])
    return sorted(list(set(all_domains)))

