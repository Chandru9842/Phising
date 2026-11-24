---
title: PhishShield Backend API
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# 🛡️ PhishShield: Brand-Aware, Explainable Phishing Protection Platform
### *An Enterprise Zero-Trust Defense Ecosystem Engineered for Indian Banking Infrastructure*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success?style=for-the-badge&logo=vercel)](https://phising-two-chi.vercel.app/)
[![API Status](https://img.shields.io/badge/API%20Status-Render%20Cloud-009688?style=for-the-badge&logo=render)](https://phishshield-api-w7aj.onrender.com/api/health)
[![Backend Tests](https://img.shields.io/badge/Automated%20Tests-118%2F118%20Passed-brightgreen?style=for-the-badge&logo=pytest)](https://github.com/Chandru9842/Phising)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.15.0_CPU-EE4C2C?style=flat-square&logo=pytorch)](https://pytorch.org)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E?style=flat-square&logo=scikitlearn)](https://scikit-learn.org)
[![SHAP](https://img.shields.io/badge/SHAP-0.45.0-blueviolet?style=flat-square)](https://github.com/shap/shap)
[![EasyOCR](https://img.shields.io/badge/EasyOCR-1.7.2-brightgreen?style=flat-square)](https://github.com/JaidedAI/EasyOCR)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![Playwright](https://img.shields.io/badge/Playwright-Verified-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev)

---

## 🌐 Live Production Deployments (100% Free / ₹0.00 Cost)

PhishShield is deployed live across global cloud infrastructure without incurring hosting expenses:

* 🖥️ **Frontend Dashboard (Vercel):** [https://phising-two-chi.vercel.app/](https://phising-two-chi.vercel.app/)
* ⚙️ **Backend API (Render Cloud):** [https://phishshield-api-w7aj.onrender.com](https://phishshield-api-w7aj.onrender.com)
* 📖 **Interactive Swagger API Docs:** [https://phishshield-api-w7aj.onrender.com/docs](https://phishshield-api-w7aj.onrender.com/docs)
* 🩺 **Diagnostic Health Endpoint:** [https://phishshield-api-w7aj.onrender.com/api/health](https://phishshield-api-w7aj.onrender.com/api/health)

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [End-to-End Development Lifecycle (Phases 1 to 6E)](#-end-to-end-development-lifecycle-phases-1-to-6e)
   * [Phase 1: Foundation & Canonical Banking Registry](#phase-1-foundation--canonical-banking-registry)
   * [Phase 2: Lexical Engineering & Random Forest Classifier](#phase-2-lexical-engineering--random-forest-classifier)
   * [Phase 3: Explainable AI (SHAP) & Brand Impersonation](#phase-3-explainable-ai-shap--brand-impersonation)
   * [Phase 4: SMS Smishing & Social Engineering Engine](#phase-4-sms-smishing--social-engineering-engine)
   * [Phase 5: Visual Screenshot Threat Intelligence (EasyOCR)](#phase-5-visual-screenshot-threat-intelligence-easyocr)
   * [Phase 6A: System Unification & End-to-End UAT](#phase-6a-system-unification--end-to-end-uat)
   * [Phase 6B: Performance Optimization & Asynchronous Queue](#phase-6b-performance-optimization--asynchronous-queue)
   * [Phase 6C: Enterprise Governance, RBAC & SHA-256 Audit Trail](#phase-6c-enterprise-governance-rbac--sha-256-audit-trail)
   * [Phase 6D: Release Engineering & Reproducibility](#phase-6d-release-engineering--reproducibility)
   * [Phase 6E: Deployment & Public Demo Readiness](#phase-6e-deployment--public-demo-readiness)
3. [Deep-Dive Algorithm Justification Matrix](#-deep-dive-algorithm-justification-matrix)
4. [Complete System Architecture](#-complete-system-architecture)
5. [Directory Layout](#-directory-layout)
6. [Cloud Deployment Architecture & Guide](#-cloud-deployment-architecture--guide)
7. [Automated Verification, Playwright Testing & CI/CD](#-automated-verification-playwright-testing--cicd)
8. [Security, Privacy & Threat Mitigation Guarantees](#-security-privacy--threat-mitigation-guarantees)
9. [Local Quickstart Guide](#-local-quickstart-guide)

---

## 🎯 Executive Summary & Problem Statement

Financial cyber fraud targeting Indian retail banking customers has surged exponentially, characterized by three prevalent attack vectors:
1. **Punycode, Subdomain Spoofing & Typosquatting:** Attackers abuse free TLS certificates (Let's Encrypt) to host fraudulent clones (e.g., `https://onlinesbi.digital-update.com/login`), tricking users into trusting the HTTPS padlock.
2. **Coercive SMS Smishing:** Messages warning that *PAN card is unlinked*, *KYC expired*, or *electricity will be disconnected tonight* contain deceptive shortened links to harvest banking OTPs.
3. **Visual Portal Impersonation:** Deceptive web applications visually mimic banking portals (SBI, HDFC, ICICI, Axis, PNB) while utilizing deceptive off-brand hostnames.

**PhishShield** addresses these threats with a **Zero-Trust, Explainable, Multi-Vector Cybersecurity Engine** designed specifically around the **Reserve Bank of India (RBI)** digital infrastructure.

---

## 🔬 End-to-End Development Lifecycle (Phases 1 to 6E)

### Phase 1: Foundation & Canonical Banking Registry
* **Core Focus:** Establishing project boundaries, database schema, and the curated Indian Banking Canonical Registry.
* **Key Concept:** **Zero-Trust Domain Isolation**. Naive cybersecurity filters trust HTTPS certificates; PhishShield strictly decomposes URLs using `tldextract` into Public Suffix, Domain, and Subdomain parts, evaluating them against Reserve Bank of India cataloged domains.
* **Banking Registry Integration:** Initialized curated records for 16 primary Indian financial institutions (State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Punjab National Bank, Kotak Mahindra Bank, Bank of Baroda, Canara Bank, NPCI UPI, etc.).

---

### Phase 2: Lexical Engineering & Random Forest Classifier
* **Core Focus:** Mathematical feature extraction from URLs and training an offline machine learning classifier.
* **Feature Engineering:** Extracted **26 lexical, topological, structural, and entropy features**:
  * Length metrics: URL length, registered domain length, path length, query length.
  * Structural counts: Subdomain depth, dot count, hyphen count, slash count, digit ratio.
  * Security anomalies: IPv4 address in hostname, punycode/IDN prefix (`xn--`), non-standard port numbers, at-symbol (`@`) redirection.
  * Domain entropy: Shannon entropy of the domain character distribution to identify algorithmically generated domains (DGA).
  * Brand heuristics: Presence of Indian bank keywords in non-authoritative URL tokens.
* **Algorithm Selected:** **Random Forest Classifier** (`n_estimators=100`, max_depth=15, `scikit-learn`).
* **Why Random Forest?**
  * Models complex non-linear feature interactions without manual polynomial expansion.
  * Invariant to monotonic feature scaling (no normalization distortion).
  * Highly resistant to overfitting via bootstrap aggregation (bagging) and feature sub-sampling.
  * Sub-millisecond CPU inference (~0.45 ms/URL), ideal for high-throughput security proxies.
* **Why NOT Other Algorithms?**
  * *Why not Deep Learning (CNN/LSTM/BERT)?* High memory footprint (>500MB), CPU inference latency 100x slower (50-200ms), requires GPU hardware, prone to adversarial perturbation attacks on character encodings.
  * *Why not Logistic Regression / Linear SVM?* Cannot capture non-linear relationships (e.g., a banking keyword is safe on `sbi.co.in` but malicious on `sbi.verify-kyc.net`).

---

### Phase 3: Explainable AI (SHAP) & Brand Impersonation
* **Core Focus:** Eliminating "black-box" risk scores through cooperative game theory and implementing visual brand mismatch detection.
* **Algorithm Selected:** **TreeSHAP (SHapley Additive exPlanations)**.
* **Concept:** Assigns an exact mathematical Shapley credit $\phi_i$ to each of the 26 lexical features:
  $$\text{Score}(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$
  Positive values increase phishing risk; negative values decrease risk toward legitimacy.
* **Why TreeSHAP?**
  * Guarantees three mathematical axioms: **Efficiency** (sum of attributions equals output delta), **Symmetry** (identical features get identical weight), and **Additivity**.
  * Computes exact Shapley values in polynomial time $O(T L D^2)$ rather than exponential permutations.
* **Why NOT LIME (Local Interpretable Model-agnostic Explanations)?**
  * LIME draws random perturbations around the data point, producing non-deterministic, varying explanations for identical inputs—unacceptable for forensic evidence and legal auditing.
* **Brand Mismatch Engine:** Computes Levenshtein edit distance and token boundaries against canonical banking names. Flags severe anomalies when a page presents banking logos or keywords while hosted on untrusted domains.

---

### Phase 4: SMS Smishing & Social Engineering Engine
* **Core Focus:** Detection of SMS phishing lures, coercion linguistics, and malicious shortlink distribution.
* **Algorithm Selected:** **TF-IDF (Term Frequency-Inverse Document Frequency) + Regularized Logistic Regression**.
* **Concept:** High-dimensional n-gram vectorization capturing linguistic cues of urgency (*"blocked"*, *"immediately"*, *"suspend"*, *"KYC"*, *"PAN card"*, *"electricity cut"*, *"lottery win"*, *"refund"*).
* **Deep URL Harvesting:** Automatically isolates embedded URLs in the SMS text, decodes redirects, and passes candidate links through the Random Forest URL classifier.
* **Why TF-IDF + Logistic Regression?**
  * Lightweight artifact size (~89.9 kB) with zero runtime dependencies.
  * Instant inference (<1.0 ms) suitable for real-time telecom SMS firewalls.
  * Interpretable positive log-odds weights directly expose malicious trigger words.
* **Why NOT Transformer Models (BERT / RoBERTa / LLMs)?**
  * Large Language Models consume 1 GB+ RAM, introduce 200–500ms latency, and require paid third-party API keys or heavy GPU compute, conflicting with our zero-cost, privacy-first offline architecture.

---

### Phase 5: Visual Screenshot Threat Intelligence (EasyOCR)
* **Core Focus:** Optical character recognition of visual screenshot uploads to detect brand spoofing.
* **Engine Selected:** **EasyOCR** (PyTorch CRAFT text detection + ResNet/LSTM sequence recognition).
* **Zero-Disk Processing:** Uploaded images are processed entirely in-memory as OpenCV byte arrays (`np.ndarray`) and discarded upon classification to protect user privacy.
* **Why EasyOCR?**
  * Superior text detection accuracy on low-contrast screenshots, mobile screen captures, and styled typography.
  * Pure Python/PyTorch CPU implementation that does not require host-level C++ binary dependencies.
* **Why NOT Tesseract (pytesseract)?**
  * Tesseract requires installing native OS packages (`apt-get install tesseract-ocr`), causing environment drift between Windows and Linux.
  * Struggles with stylized digital typography, gradients, and low-resolution mobile renders.

---

### Phase 6A: System Unification & End-to-End UAT
* **Core Focus:** Cross-module verdict reconciliation, persistent audit telemetry, zero-trust fallthrough elimination, and comprehensive acceptance testing.
* **Unified Risk Decision Matrix:** Calibrates risk signals across URL classification, brand mismatch, SMS linguistics, and visual typography into five clear security verdicts:
  `SAFE (0-14%)` | `LOW RISK (15-39%)` | `SUSPICIOUS (40-69%)` | `HIGH RISK (70-84%)` | `CRITICAL PHISHING (85-100%)`.
* **User Acceptance Testing (UAT):** Executed and passed **67/67 automated assertions** covering single-factor, multi-factor, adversarial, and edge-case inputs.

---

### Phase 6B: Performance Optimization & Asynchronous Queue
* **Core Focus:** Preventing request blocking during concurrent screenshot processing and containerizing the entire ecosystem.
* **Asynchronous OCR Queue:** Implemented `OCRController` using a bounded concurrency semaphore (`MAX_CONCURRENT_OCR=1`) and maximum queue depth (`MAX_OCR_QUEUE_DEPTH=10`).
  * Non-blocking endpoint: `POST /api/v1/screenshot/analyze/async` returns `HTTP 202 Accepted` with a tracking UUID.
  * Polling endpoint: `GET /api/v1/screenshot/jobs/{job_id}` returns processing status and telemetry.
* **Frontend Performance:** Implemented dynamic code-splitting (`React.lazy`) for governance views, reducing the initial production bundle size by over 40% (vendor bundle under 250 kB).
* **Production Dockerization:** Authored production multi-stage `Dockerfile` (Backend: Python 3.12-slim non-root UID 1000; Frontend: Node 20 builder + Nginx alpine runner).

---

### Phase 6C: Enterprise Governance, RBAC & SHA-256 Audit Trail
* **Core Focus:** Transitioning PhishShield into a multi-user enterprise cybersecurity analyst platform.
* **Role-Based Access Control (RBAC):** Tiered permissions across three user personas:
  * **Administrator:** Full governance, user provisioning, bank registry editing, webhook configuration, and audit verification.
  * **Analyst:** Scan execution, forensic investigation, threat dossier export, bank registry viewing.
  * **Viewer:** Read-only scan capability, public documentation viewing.
* **Authentication:** Stateless JSON Web Tokens (JWT) using `HS256`, PBKDF2 password hashing (600,000 iterations), and brute-force login rate limiting.
* **Forensic Threat Dossier Export:** One-click export in structured JSON and executive PDF format featuring **automatic URL defanging** (e.g., transforming `http://malicious.com` into `hxxp[://]malicious[.]com` to prevent accidental analyst execution).
* **Outbound Webhooks with SSRF Defense:** Automated notifications to SIEM/Slack endpoints with strict blocking of private subnets (RFC 1918 `10.x`, `192.168.x`, `172.16.x`), loopbacks (`127.x`), and cloud metadata IPs (`169.254.169.254`).
* **Cryptographic Tamper-Evident Audit Trail:** Every administrative operation is appended to an immutable **SHA-256 hash-chain**:
  $$\text{entry\_hash} = \text{SHA256}(\text{prev\_hash} \parallel \text{timestamp} \parallel \text{actor} \parallel \text{action} \parallel \text{entity} \parallel \text{details})$$
  Any manual alteration or deletion of audit logs breaks the chain and triggers `TAMPER_DETECTED`.

---

### Phase 6D: Release Engineering & Reproducibility
* **Core Focus:** Version control hygiene, dependency reproducibility, and automated release validation.
* **Release Baseline:** Initialized local Git repository, created comprehensive `.gitignore` preventing data leaks, and generated release documentation.
* **Secret Hygiene Audit:** Built automated scanner verifying 0 hardcoded keys across 119 files.
* **Database Cleanup Utility:** Developed [`backend/scripts/cleanup_test_data.py`](file:///C:/Phising/backend/scripts/cleanup_test_data.py) with default dry-run mode, automatic backup, and audit-chain preservation.
* **Testing:** Executed full regression suite: **118/118 backend tests passed** in 68.18s; frontend production build passed in 17.57s.

---

### Phase 6E: Deployment & Public Demo Readiness
* **Core Focus:** Verifying hosting feasibility, deploying to zero-cost cloud infrastructure, and conducting live browser validation.
* **OCR Architecture Reconciliation:** Resolved past documentation discrepancies; verified EasyOCR is the sole, consistent engine across all code and container configs.
* **Tagged Release:** Created annotated Git release tag **`v0.1.0`**.
* **Zero-Cost Production Deployment:**
  * Backend deployed to **Render Cloud** (Python 3.12, Uvicorn, SQLite WAL, EasyOCR).
  * Frontend deployed to **Vercel** (Global Edge CDN, Vite SPA).
  * Total Infrastructure Cost: **₹0.00 / month** (Zero credit card requirement).
* **Playwright Automated Browser Testing:** Executed live browser automation against the Vercel site:
  * Verified 100% UI rendering, 0 console errors, and successful live classification of State Bank of India phishing lures.

---

## ⚖️ Deep-Dive Algorithm Justification Matrix

| Component | Selected Algorithm | Primary Alternatives Evaluated | Why Selected? | Why Rejected the Alternatives? |
| :--- | :--- | :--- | :--- | :--- |
| **URL Phishing Classifier** | **Random Forest Classifier** (`scikit-learn`) | Deep Learning (LSTM / CNN), Logistic Regression, Support Vector Machines (SVM) | High non-linear accuracy on 26 lexical features; sub-millisecond CPU execution (~0.45ms); immune to feature scale distortions; native compatibility with TreeSHAP. | **Deep Learning**: 100x slower on CPU, consumes >500MB RAM, black-box opacity. **Logistic/SVM**: Cannot model complex non-linear feature interactions without manual polynomial expansion. |
| **Model Explainability** | **TreeSHAP** (Tree Shapley Additive exPlanations) | LIME (Local Interpretable Model-agnostic Explanations), Integrated Gradients, Feature Permutation | Mathematically exact attributions based on cooperative game theory; satisfies Local Accuracy and Missingness axioms; runs in polynomial time $O(TLD^2)$. | **LIME**: Uses random Monte Carlo perturbations, yielding non-deterministic, varying explanations for identical inputs—unacceptable for forensic compliance. |
| **SMS Smishing Detection** | **TF-IDF + Regularized Logistic Regression** | BERT, RoBERTa, LLM APIs (OpenAI / Gemini) | Ultra-lightweight artifact (~89.9 kB); instantaneous CPU inference (<1.0 ms); interpretable positive log-odds word coefficients; zero external API dependencies. | **BERT / LLMs**: Require >1GB RAM and GPUs, have high cold-start latency (200-500ms), and require paid third-party API keys or violate user data privacy. |
| **Visual Screenshot OCR** | **EasyOCR** (PyTorch CRAFT + ResNet) | Tesseract OCR (pytesseract), AWS Rekognition, Google Cloud Vision | Superior character detection on low-contrast digital displays and mobile typography; native Python/PyTorch integration; pure CPU execution. | **Tesseract**: Requires native OS-level C++ binaries causing cross-platform failures; struggles with styled fonts. **Cloud APIs**: Violate privacy and incur per-request costs. |
| **Audit Trail Ledger** | **Cryptographic SHA-256 Hash Chaining** | PostgreSQL Append-Only Tables, Hyperledger / Blockchain | Blockchain-grade tamper-evident immutability implemented natively in SQLite; zero operational infrastructure cost; verifiable in polynomial time $O(N)$. | **External Blockchain**: Incurs transaction gas fees, introduces multi-second consensus latency, and requires complex node infrastructure. |

---

## 🏛️ Complete System Architecture

```
                                 ┌────────────────────────────────────────┐
                                 │       React + Vite Frontend (SPA)      │
                                 │     Hosted on Vercel Global Edge CDN   │
                                 └───────────────────┬────────────────────┘
                                                     │ HTTPS (REST API)
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FastAPI Production Backend (Render)                  │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │   EasyOCR + PyTorch   │  │ Random Forest + SHAP│  │  SMS TF-IDF   │ │
│  │ (Screenshot Threat)   │  │   (URL Classifier)  │  │  (Smishing)   │ │
│  └───────────────────────┘  └────────────────────┘  └───────────────┘ │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │ Indian Bank Registry  │  │ SHA-256 Audit Trail│  │ SSRF Webhooks │ │
│  │   (Canonical RBI)     │  │   (Hash Chaining)  │  │ (Outbound)    │ │
│  └───────────────────────┘  └────────────────────┘  └───────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    SQLite Database (WAL)     │
                      │  Scans, Users, Audit Logs    │
                      └──────────────────────────────┘
```

---

## 📂 Directory Layout

```
PhishShield/
├── backend/
│   ├── app/
│   │   ├── api/                     # REST API Routers (Auth, Scans, Admin, Dossier, Webhooks)
│   │   ├── core/                    # OCR Queue, Security, Brand Registry, Risk Engine
│   │   ├── ml/                      # URL Random Forest, SHAP Explainer, SMS Classifier
│   │   │   ├── saved_models/        # Pre-trained url_rf_model.joblib (95.9 kB)
│   │   │   └── sms/saved_models/    # Pre-trained sms_tfidf_lr_model.joblib (89.9 kB)
│   │   ├── models/                  # SQLAlchemy models (User, Scan, Bank, Audit, Webhook)
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── services/                # Dossier export, Webhook alerts, Audit service
│   │   ├── config.py                # Environment configurations
│   │   ├── database.py              # SQLite session factory
│   │   └── main.py                  # FastAPI application entry & CORS
│   ├── tests/                       # 118 unit & regression tests
│   ├── scripts/                     # Test cleanup, secret scanner & Playwright tests
│   ├── Dockerfile                   # Python 3.12-slim multi-port container
│   ├── requirements.txt             # Python dependencies
│   └── run.py                       # ASGI launcher
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Governance, User Mgmt, Webhooks, Audit Logs
│   │   │   ├── common/              # Navbar, Sidebar, MetricCard
│   │   │   ├── dashboard/           # ThreatMap, RecentActivity, SystemStatus
│   │   │   ├── history/             # Scan History & Export Modal
│   │   │   ├── insights/            # Model Diagnostics & SHAP Explanations
│   │   │   ├── scan/                # URL & SMS Live Scanners
│   │   │   └── screenshot/          # Async Screenshot OCR Upload & Telemetry
│   │   ├── services/api.js          # Axios API service client
│   │   ├── App.jsx                  # Main dashboard controller
│   │   └── main.jsx                 # React root
│   ├── Dockerfile                   # Multi-stage Node builder + Nginx runner
│   ├── nginx.conf                   # Production Nginx reverse-proxy & security headers
│   └── package.json                 # Frontend manifests & lockfile
│
├── .github/workflows/ci.yml         # GitHub Actions automated regression pipeline
├── docker-compose.yml               # Multi-container orchestration specification
├── render.yaml                      # Render Infrastructure-as-Code Blueprint
├── DEPLOYMENT_READINESS_PHASE_6E.md # Production deployment assessment
├── RELEASE_ENGINEERING_PHASE_6D.md  # Reproducibility & model specs
└── README.md                        # Project documentation
```

---

## ☁️ Cloud Deployment Architecture & Guide

PhishShield is configured for zero-cost cloud deployment:

### 1. Backend on Render Cloud (Free Tier)
Configured automatically via [`render.yaml`](file:///C:/Phising/render.yaml):
* **Runtime:** Python 3.12
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables:**
  * `PYTHON_VERSION`: `3.12.2`
  * `ENVIRONMENT`: `production`
  * `CORS_ORIGINS`: `*`
* **Live Endpoint:** `https://phishshield-api-w7aj.onrender.com`

### 2. Frontend on Vercel (Free Tier)
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variable:**
  * `VITE_API_BASE_URL`: `https://phishshield-api-w7aj.onrender.com`
* **Live Site:** `https://phising-two-chi.vercel.app/`

---

## 🧪 Automated Verification, Playwright Testing & CI/CD

### 1. PyTest Backend Regression Suite
PhishShield includes 118 automated tests passing with 100% success rate:
```bash
cd backend
pytest tests/ -v
```
```text
======================= 118 passed in 68.18s =======================
- Brand Impersonation & SHAP Explainability: 10/10 passed
- System Diagnostics & Health Status:         3/3 passed
- Security, SSRF & Auth Validation:          13/13 passed
- Operational Deployment Smoke Suite:        11/11 passed
- Live Staging & Runtime Verification:       20/20 passed
- Enterprise Governance & RBAC:               9/9 passed
- Screenshot OCR Concurrency & Queue:         2/2 passed
- SMS Smishing & Linguistic Classification:  28/28 passed
- URL Lexical & Random Forest Classifier:    22/22 passed
```

### 2. Live Playwright Browser Verification
A headless browser automation test was executed directly on the live Vercel URL using Playwright:
* **Target:** `https://phising-two-chi.vercel.app/`
* **HTTP Status:** `200 OK`
* **Page Title:** `PhishShield – Indian Banking Phishing Protection`
* **Console Errors:** `0 Errors`
* **Live Interaction:** Navigated to URL Scanner, submitted `http://sbi-verify-kyc-update.com/netbanking`, queried Render API, and verified detection of **State Bank of India**.

---

## 🛡️ Security, Privacy & Threat Mitigation Guarantees

1. **Zero External Resolution:** Target domains and extracted OCR links are inspected purely via static heuristics and offline ML models. PhishShield **never contacts, pings, or fetches** malicious servers.
2. **Zero Disk Screenshot Retention:** Screenshot images are processed as in-memory arrays and never written to disk.
3. **SSRF Outbound Defenses:** Outbound alert webhooks restrict destinations to public endpoints, blocking private RFC1918 subnets and cloud metadata services (`169.254.169.254`).
4. **Tamper-Evident Auditing:** Every administrative operation is appended to a cryptographic SHA-256 hash-chain to ensure verifiable governance.
5. **Automated URL Defanging:** Threat dossiers convert live URLs into harmless strings (`hxxps[://]domain[.]com`) to prevent accidental execution.

---

## 💻 Local Quickstart Guide

### Prerequisites
* Python 3.10+ (Tested on `3.12.2`)
* Node.js 18+ (Tested on `v24.15.0`)
* Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Chandru9842/Phising.git
cd Phising
```

### Step 2: Start Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
# source venv/bin/activate    # On Linux/macOS
pip install -r requirements.txt
python run.py
```
* Backend API: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

### Step 3: Start Frontend
```bash
cd ../frontend
npm ci
npm run dev
```
* Dashboard will open at: **http://localhost:5173**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
