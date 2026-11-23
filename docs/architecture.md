# PhishShield Architecture Specification

## 1. System Overview
**PhishShield** is an AI-powered cybersecurity defense platform designed to protect Indian banking customers from sophisticated phishing attacks, smishing fraud, lookalike banking portals, and malicious brand impersonation.

Traditional phishing detectors frequently fail on Indian banking targets due to:
1. Deceptive subdomains on cheap or free TLDs (e.g. `onlinesbi.co.in.attacker-host.com`).
2. Fake urgency lures specific to Indian regulatory mandates (e.g. "PAN Card deactivation", "Electricity bill disconnection", "SBI Reward Points expiry").
3. False confidence induced by SSL/HTTPS certificates on adversary-controlled domains.

PhishShield enforces **Zero-Trust URL and Brand Analysis**, combining authentic Machine Learning classifiers with a curated Indian Banking Canonical Registry and SHAP explainability.

---

## 2. Component Architecture

```
                          +-------------------------------------+
                          |        React + Vite Frontend        |
                          |  Tailwind CSS + Recharts + Lucide   |
                          +------------------+------------------+
                                             |  REST / Axios
                                             v
                          +-------------------------------------+
                          |        FastAPI Backend Engine       |
                          +------------------+------------------+
                                             |
             +-------------------------------+-------------------------------+
             |                               |                               |
             v                               v                               v
+------------------------+      +------------------------+      +------------------------+
|   Module 1: URL & ML   |      |  Module 2: Brand Engine|      |  Module 3: SMS Engine  |
| - 30+ Lexical Features |      | - Indian Bank Registry |      | - TF-IDF Vectorizer    |
| - Scikit-learn RF      |      | - tldextract Domain    |      | - Logistic Regression  |
| - SHAP Feature Weights |      | - Typosquatting Check  |      | - Hindi/English Urgency|
+------------------------+      +------------------------+      +------------------------+
             |                               |                               |
             +-------------------------------+-------------------------------+
                                             |
                                             v
                          +-------------------------------------+
                          |    Unified Risk Assessment Engine   |
                          |  - Zero-Trust Multi-Vector Scoring  |
                          |  - Human-Readable Explainability    |
                          +------------------+------------------+
                                             |
                                             v
                          +-------------------------------------+
                          |     SQLite / SQLAlchemy Audit Log    |
                          +-------------------------------------+
```

---

## 3. Technology Stack & Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Fast rendering, modern component architecture, rapid state updates |
| **Data Viz** | Recharts, Lucide Icons | Responsive interactive visualization of SHAP feature importance & metrics |
| **Backend** | Python 3.12, FastAPI, Uvicorn | Async performance, strict Pydantic schemas, native ML compatibility |
| **Persistence** | SQLite, SQLAlchemy 2.0 | Zero-configuration local database for scan audit trails and history |
| **ML: URL** | Scikit-learn Random Forest | Non-linear feature boundaries, high resilience to noise, low latency |
| **ML: SMS** | Scikit-learn TF-IDF + Logistic Reg | High interpretability, strong performance on short text smishing corpus |
| **Explainability** | TreeSHAP (`shap`) | Mathematically sound feature attributions showing *why* a URL is classified suspicious |
| **Domain Engine** | `tldextract`, `python-Levenshtein` | Accurately extracts registered domain (SLD + TLD) irrespective of subdomains |

---

## 4. Indian Banking Canonical Registry

PhishShield maintains a curated dictionary of verified financial institutions in India:
- **Public Sector Banks**: State Bank of India (`onlinesbi.sbi`), Punjab National Bank (`pnbindia.in`), Bank of Baroda (`bankofbaroda.in`), Canara Bank (`canarabank.com`), Union Bank of India (`unionbankofindia.co.in`).
- **Private Sector Banks**: HDFC Bank (`hdfcbank.com`), ICICI Bank (`icicibank.com`), Axis Bank (`axisbank.com`), Kotak Mahindra Bank (`kotak.com`), IndusInd Bank (`indusind.com`), Yes Bank (`yesbank.in`), IDBI Bank (`idbibank.in`).
- **Regulatory & Infrastructure**: Reserve Bank of India (`rbi.org.in`), NPCI (`npci.org.in`, `bhimupi.org.in`).
- **Payments Banks**: Paytm Payments Bank (`paytmbank.com`), Airtel Payments Bank (`airtel.in`).

### Brand Impersonation Rules:
1. **Official Domain Rule**: If the registered domain is canonical, brand impersonation risk = 0.
2. **Subdomain Spoofing Rule**: If a bank's name appears anywhere in subdomains, path, or parameters while registered domain != official domain, flag as **Critical Impersonation**.
3. **Typosquatting Rule**: Levenshtein edit distance $\le 2$ or Damerau-Levenshtein distance to an official banking brand without matching the canonical TLD.
4. **Zero-Trust Rule**: The presence of an SSL/TLS certificate (HTTPS) is explicitly excluded as evidence of authenticity.

---

## 5. Development Priorities & Execution Roadmap

* **Priority 1**: URL Detection + Random Forest Classifier (Data loading, feature extraction pipeline, model training, persistence, and REST inference API).
* **Priority 2**: Indian Banking Brand Impersonation + SHAP Explainability Engine.
* **Priority 3**: SMS Smishing Detection + NLP Pipeline (TF-IDF + Logistic Regression).
* **Priority 4**: Screenshot Upload + OCR Detection (OpenCV + EasyOCR visual template matching).
* **Priority 5**: Risk Assessment Engine Integration, End-to-End Testing, and Verification.

