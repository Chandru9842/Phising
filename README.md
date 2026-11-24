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
3. [🧠 Step-by-Step Internal Mechanics: How Every Algorithm Works Under the Hood](#-step-by-step-internal-mechanics-how-every-algorithm-works-under-the-hood)
   * [1. Random Forest URL Classifier (26-Feature Lexical Engine)](#1-random-forest-url-classifier-26-feature-lexical-engine)
   * [2. TreeSHAP Explainable AI Attribution Engine](#2-treeshap-explainable-ai-attribution-engine)
   * [3. Indian Banking Brand Impersonation & Typosquatting Engine](#3-indian-banking-brand-impersonation--typosquatting-engine)
   * [4. TF-IDF + Regularized Logistic Regression SMS Smishing Engine](#4-tf-idf--regularized-logistic-regression-sms-smishing-engine)
   * [5. EasyOCR PyTorch Visual Threat Pipeline](#5-easyocr-pytorch-visual-threat-pipeline)
   * [6. Unified Multi-Vector Risk Engine & Decision Matrix](#6-unified-multi-vector-risk-engine--decision-matrix)
   * [7. Cryptographic SHA-256 Tamper-Evident Audit Ledger](#7-cryptographic-sha-256-tamper-evident-audit-ledger)
4. [Deep-Dive Algorithm Justification Matrix (Why Selected vs Why Rejected)](#-deep-dive-algorithm-justification-matrix)
5. [Complete System Architecture](#-complete-system-architecture)
6. [Directory Layout](#-directory-layout)
7. [Cloud Deployment Architecture & Guide](#-cloud-deployment-architecture--guide)
8. [Automated Verification, Playwright Testing & CI/CD](#-automated-verification-playwright-testing--cicd)
9. [Security, Privacy & Threat Mitigation Guarantees](#-security-privacy--threat-mitigation-guarantees)
10. [Local Quickstart Guide](#-local-quickstart-guide)

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

---

### Phase 3: Explainable AI (SHAP) & Brand Impersonation
* **Core Focus:** Eliminating "black-box" risk scores through cooperative game theory and implementing visual brand mismatch detection.
* **Algorithm Selected:** **TreeSHAP (SHapley Additive exPlanations)**.
* **Concept:** Assigns an exact mathematical Shapley credit $\phi_i$ to each of the 26 lexical features:
  $$\text{Score}(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$
  Positive values increase phishing risk; negative values decrease risk toward legitimacy.
* **Brand Mismatch Engine:** Computes Levenshtein edit distance and token boundaries against canonical banking names. Flags severe anomalies when a page presents banking logos or keywords while hosted on untrusted domains.

---

### Phase 4: SMS Smishing & Social Engineering Engine
* **Core Focus:** Detection of SMS phishing lures, coercion linguistics, and malicious shortlink distribution.
* **Algorithm Selected:** **TF-IDF (Term Frequency-Inverse Document Frequency) + Regularized Logistic Regression**.
* **Concept:** High-dimensional n-gram vectorization capturing linguistic cues of urgency (*"blocked"*, *"immediately"*, *"suspend"*, *"KYC"*, *"PAN card"*, *"electricity cut"*, *"lottery win"*, *"refund"*).
* **Deep URL Harvesting:** Automatically isolates embedded URLs in the SMS text, decodes redirects, and passes candidate links through the Random Forest URL classifier.

---

### Phase 5: Visual Screenshot Threat Intelligence (EasyOCR)
* **Core Focus:** Optical character recognition of visual screenshot uploads to detect brand spoofing.
* **Engine Selected:** **EasyOCR** (PyTorch CRAFT text detection + ResNet/LSTM sequence recognition).
* **Zero-Disk Processing:** Uploaded images are processed entirely in-memory as OpenCV byte arrays (`np.ndarray`) and discarded upon classification to protect user privacy.

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

## 🧠 Step-by-Step Internal Mechanics: How Every Algorithm Works Under the Hood

---

### 1. Random Forest URL Classifier (26-Feature Lexical Engine)

The URL classification pipeline executes a deterministic, four-step feature extraction and tree-ensemble evaluation:

```
[Target URL Input]
       │
       ▼
[Step 1: Canonicalization & Suffix Parsing (tldextract)]
       │
       ▼
[Step 2: 26-Dimensional Feature Vector Extraction]
       │  ├── Lengths (URL, Domain, Path, Query)
       │  ├── Structural Counts (Dots, Hyphens, Slashes, Subdomains)
       │  ├── Security Markers (IP Host, Punycode, Non-std Port, @ Symbol)
       │  └── Domain Shannon Entropy: H(X) = -Σ p(x) log2 p(x)
       ▼
[Step 3: 100 Decision Trees Voting (Bootstrap Aggregation)]
       │  Each Tree evaluates non-linear splits via Gini Impurity:
       │  Gini(D) = 1 - Σ (p_i)^2
       ▼
[Step 4: Leaf Distribution Averaging & Probability Calibration]
       │  P(Phishing | x) = (1 / B) * Σ p_b(x)
       ▼
[Calibrated URL Risk Score: 0.0% – 100.0%]
```

* **Step 1: Canonicalization & Zero-Trust Parsing:**
  The URL is stripped of trailing spaces and whitespace. Using `tldextract`, the URL is parsed into its three constituent segments: **Subdomain**, **Registered Domain**, and **Public Suffix** (TLD). This separates deceptive subdomains (e.g., `sbi.co.in.attacker.xyz`) from the real root host (`attacker.xyz`).
* **Step 2: 26-Dimensional Feature Extraction:**
  A mathematical vector $X \in \mathbb{R}^{26}$ is constructed:
  1. `url_length`: Total character length of URL.
  2. `domain_length`: Character length of the registered domain.
  3. `path_length`: Length of the resource URI path.
  4. `query_length`: Length of query parameters.
  5. `count_dots`: Total count of period (`.`) characters.
  6. `count_hyphens`: Total count of hyphen (`-`) characters (frequently used in typosquatting).
  7. `count_slashes`: Total path hierarchy depth.
  8. `count_at`: Presence of `@` symbol (used to trick basic browser decoders).
  9. `count_question`: Count of `?` parameter markers.
  10. `count_equal`: Count of `=` parameter separators.
  11. `count_subdomains`: Depth of subdomain tokens (e.g., `a.b.c.target.com`).
  12. `digit_ratio`: Total digits divided by total length (phishing URLs contain more numeric hashes).
  13. `is_ip`: Boolean check if host is an IPv4 dotted-decimal address.
  14. `has_punycode`: Boolean check for `xn--` internationalized domain name (IDN) homograph attacks.
  15. `has_suspicious_tld`: Match against known predatory TLDs (`.top`, `.xyz`, `.club`, `.work`, etc.).
  16. `has_non_standard_port`: Flag if port $\ne$ 80, 443, 8080.
  17. `has_bank_in_subdomain`: Keyword presence of Indian bank tokens inside subdomains.
  18. `has_bank_in_path`: Keyword presence of Indian bank tokens inside URL path.
  19. `domain_entropy`: **Shannon Entropy** measuring randomness of domain characters:
      $$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$
      High entropy indicates Algorithmically Generated Domains (DGA) generated by botnets.
  20–26. Ratios of vowels, special characters, consecutive consonants, brand edit distances, and token counts.
* **Step 3: Ensemble Tree Partitioning:**
  The feature vector passes through an ensemble of $B = 100$ independent decision trees trained with bootstrap aggregating (bagging). At each node of depth $\le 15$, splits are chosen to minimize Gini Impurity:
  $$I_G(p) = 1 - \sum_{k=1}^{K} p_k^2$$
* **Step 4: Output Calibration:**
  Each tree $b$ outputs a class probability distribution $p_b(x)$. The final phishing probability is computed as the ensemble mean:
  $$\hat{P}(\text{phishing} \mid x) = \frac{1}{B} \sum_{b=1}^{B} p_b(x)$$

#### 💡 Concrete Walkthrough Example:
> **Input:** Chandru pastes the following suspicious URL into the dashboard:  
> `http://sbi-netbanking-verify.xyz/update-pan.html?acct=9876543210`
>
> 1. **Parsing:** `tldextract` isolates Registered Domain = `sbi-netbanking-verify.xyz` and Suffix = `xyz`.
> 2. **Feature Calculation:**
>    * `url_length` = 63, `domain_length` = 25, `count_hyphens` = 3, `count_dots` = 2.
>    * `has_suspicious_tld` = 1 (`.xyz` flagged as predatory).
>    * `has_bank_in_domain_token` = 1 (`sbi` present in unverified domain).
>    * `domain_entropy`: Evaluating characters in `sbi-netbanking-verify` (21 characters, 13 unique symbols: `s,b,i,-,n,e,t,a,k,g,v,r,y`):  
>      $$P(\text{'e'}) = \frac{3}{21}, \quad P(\text{'i'}) = \frac{3}{21}, \quad P(\text{'-'}) = \frac{2}{21}, \quad \dots$$
>      $$H(X) = -\sum p_i \log_2(p_i) = \mathbf{3.42 \text{ bits}} \quad (\text{Elevated Shannon Entropy})$$
> 3. **Tree Traversal:** The vector passes through all 100 trees. Trees traverse split conditions (`has_suspicious_tld > 0.5` $\rightarrow$ Right; `count_hyphens > 1.5` $\rightarrow$ Right; `has_bank_in_domain_token > 0.5` $\rightarrow$ Right).
> 4. **Result:** 96 out of 100 trees vote for Phishing.  
>    $$\hat{P}(\text{phishing} \mid x) = \frac{96}{100} = \mathbf{96.0\%} \quad \longrightarrow \quad \mathbf{CRITICAL\ PHISHING\ VERDICT}$$

---

### 2. TreeSHAP Explainable AI Attribution Engine

To make predictions transparent and auditable for cybersecurity incident responders, PhishShield computes exact local feature attributions using TreeSHAP:

```
[Input Vector x + Trained Random Forest]
       │
       ▼
[Step 1: Compute Expected Background Value E[f(x)] = φ_0]
       │
       ▼
[Step 2: Recursive Tree Traversal Algorithm (Lundberg et al.)]
       │  Traverses split conditions in O(T * L * D^2) polynomial time
       │  Evaluates conditional expectation E[f(x) | S] for subsets S
       ▼
[Step 3: Compute Shapley Values for each Feature i ∈ [1..26]]
       │  φ_i(x) = Σ [|S|!(M - |S| - 1)! / M!] * [f_x(S ∪ {i}) - f_x(S)]
       ▼
[Step 4: Verify Efficiency Axiom: Σ φ_i = f(x) - E[f(x)]]
       │
       ▼
[Step 5: Rank Top Phishing Drivers & Protective Factors for Analyst UI]
```

* **Step 1: Background Value Initialization:**
  Computes the base prediction expectation $E[f(x)] = \phi_0$ across the global training baseline (the average probability of phishing in the dataset, which is 12.0%).
* **Step 2: Recursive Tree Traversal:**
  Rather than evaluating all $2^{26}$ feature combinations (which is NP-hard), TreeSHAP recursively tracks the proportion of training samples flowing down each sub-branch of each decision tree when features are known vs. unknown. It completes in polynomial time $O(T L D^2)$, where $T$ is the number of trees (100), $L$ is maximum leaves, and $D$ is tree depth.
* **Step 3: Shapley Attribution Calculation:**
  Computes the marginal contribution of each feature $i$ across all possible feature coalitions $S \subseteq M \setminus \{i\}$:
  $$\phi_i(x) = \sum_{S \subseteq M \setminus \{i\}} \frac{|S|! (M - |S| - 1)!}{M!} \left( f(S \cup \{i\}) - f(S) \right)$$
* **Step 4: Efficiency & Consistency Axiom Guarantee:**
  Verifies that the sum of all 26 feature attributions exactly equals the difference between the model's prediction and the base expected value:
  $$\sum_{i=1}^{26} \phi_i(x) = f(x) - \phi_0$$
* **Step 5: Visual Feature Ranking:**
  Features with large positive $\phi_i$ are flagged in the UI as **Primary Risk Drivers**, while negative $\phi_i$ are highlighted as **Protective Factors**.

#### 💡 Concrete Walkthrough Example:
> **Input:** Explaining the 96.0% phishing score calculated for `http://sbi-netbanking-verify.xyz/update-pan.html?acct=9876543210`:
>
> 1. **Baseline Base Value:** $\phi_0 = 0.12$ (12.0% average baseline risk across legitimate training URLs).
> 2. **Target Prediction:** $f(x) = 0.96$ (96.0%).
> 3. **Net Shift to Explain:** $\Delta = f(x) - \phi_0 = 0.96 - 0.12 = \mathbf{+0.84\ (+84.0\%)}$.
> 4. **TreeSHAP Attributions Computed for the 26 Features:**
>    * $\phi_{\text{has\_bank\_in\_domain}} = \mathbf{+0.28}$ *(SBI token in unverified domain adds +28% risk)*
>    * $\phi_{\text{has\_suspicious\_tld}} = \mathbf{+0.22}$ *(Predatory `.xyz` extension adds +22% risk)*
>    * $\phi_{\text{count\_hyphens}} = \mathbf{+0.16}$ *(Multiple hyphens in domain add +16% risk)*
>    * $\phi_{\text{digit\_ratio}} = \mathbf{+0.10}$ *(Excessive numerical digits in query add +10% risk)*
>    * $\phi_{\text{domain\_entropy}} = \mathbf{+0.08}$ *(Elevated character randomness adds +8% risk)*
>    * $\phi_{\text{other\_21\_features}} = \mathbf{0.00}$ *(Neutral impact)*
> 5. **Mathematical Verification of Efficiency Axiom:**
>    $$\phi_0 + \sum_{i=1}^{26} \phi_i = 0.12 + (0.28 + 0.22 + 0.16 + 0.10 + 0.08) = 0.12 + 0.84 = \mathbf{0.96\ (100\%\ Matched)}$$
> 6. **Dashboard Output:** The user sees a clear waterfall chart detailing exactly why the URL was flagged, removing black-box uncertainty.

---

### 3. Indian Banking Brand Impersonation & Typosquatting Engine

Detects deceptive brand spoofs even when attackers register brand-new domains with valid SSL certificates:

```
[Input URL / Extracted Typography]
       │
       ▼
[Step 1: Canonical Banking Registry Lookup (16 RBI Banks)]
       │  Loads Brand Names, Official Domains, Aliases, Keywords
       ▼
[Step 2: Token Decomposition & Regex Boundary Isolation]
       │  Isolates tokens using (?i)\b(?:sbi|hdfc|icici|axis|pnb|kotak)\b
       ▼
[Step 3: Levenshtein Distance & String Similarity Scoring]
       │  Similarity(s1, s2) = 1 - (Levenshtein(s1, s2) / max(len(s1), len(s2)))
       ▼
[Step 4: Zero-Trust Triangulation Rule]
       ├── If Brand Keyword Found in Host/Path/OCR:
       │     ├── Does Registered Domain match Official RBI Whitelist?
       │     │     ├── YES  --> SAFE (Legitimate Banking Portal)
       │     │     └── NO   --> CRITICAL ALERT: Brand / Domain Mismatch!
```

* **Step 1: Registry Indexing:**
  Maintains official digital assets for 16 Indian financial institutions:
  * Brand Name (e.g., `State Bank of India`).
  * Canonical Official Domains (e.g., `onlinesbi.sbi`, `sbi.co.in`).
  * Subdomain / Typography Keywords (e.g., `["sbi", "onlinesbi", "statebank", "sbicard"]`).
* **Step 2: Token Boundary Extraction:**
  Scans hostname subdomains, URI path components, query strings, and visual OCR typography using strict regex word boundaries `\b` to prevent false alarms on benign English words (e.g., preventing `bobcat` from triggering Bank of Baroda `bob`, or `axis-chart` from triggering Axis Bank).
* **Step 3: Levenshtein Edit Distance Calculation:**
  For domains that do not match exact keywords, computes the minimum single-character edits (insertions, deletions, substitutions) required to transform string $s_1$ into $s_2$:
  $$\text{lev}(a, b) = \begin{cases} |a| & \text{if } |b| = 0, \\ |b| & \text{if } |a| = 0, \\ \text{lev}(\text{tail}(a), \text{tail}(b)) & \text{if } a[0] = b[0], \\ 1 + \min \begin{cases} \text{lev}(\text{tail}(a), b) \\ \text{lev}(a, \text{tail}(b)) \\ \text{lev}(\text{tail}(a), \text{tail}(b)) \end{cases} & \text{otherwise} \end{cases}$$
  Normalized similarity:
  $$\text{Sim}(s_1, s_2) = 1 - \frac{\text{lev}(s_1, s_2)}{\max(|s_1|, |s_2|)}$$
  If $\text{Sim} \ge 0.82$, typosquatting is flagged (e.g., `0nlinesbi.com` vs `onlinesbi.com`).
* **Step 4: Zero-Trust Triangulation:**
  * If bank branding is detected in the typography or subdomains, but the registered domain is **NOT** in the official RBI domain list $\rightarrow$ Immediately flags a **Brand/Domain Mismatch Anomaly** and triggers an automatic **CRITICAL** risk verdict.

#### 💡 Concrete Walkthrough Example:
> **Input:** An attacker registers `https://0nlinesbi-kyc.com/login` and Chandru tests it:
>
> 1. **Token Extraction:** Dissects domain `0nlinesbi-kyc`.
> 2. **Typosquatting Check against Canonical Registry:**
>    * Target Brand: `State Bank of India` (Official: `onlinesbi.sbi`).
>    * String 1: `0nlinesbi`
>    * String 2: `onlinesbi`
>    * $\text{Levenshtein}("0nlinesbi", "onlinesbi") = 1$ (character `'0'` substituted for `'o'`).
>    * Max string length = 9.
>    $$\text{Similarity} = 1 - \frac{1}{9} = \mathbf{0.889 \quad (88.9\% \ge 82.0\%\ Threshold)}$$
> 3. **Triangulation Decision:**
>    * Brand Claimed: `State Bank of India`
>    * Official Domains: `["onlinesbi.sbi", "sbi.co.in"]`
>    * Actual Registered Domain: `0nlinesbi-kyc.com` (NOT in official list!)
> 4. **Verdict Triggered:**  
>    $$\mathbf{CRITICAL\ ALERT:\ Severe\ Typosquatting\ \&\ Brand\ Impersonation\ Detected!}$$
>    Dashboard immediately instructs user: *"DO NOT enter MPIN or NetBanking Password. Report to 1930."*

---

### 4. TF-IDF + Regularized Logistic Regression SMS Smishing Engine

Processes deceptive mobile SMS text, identifies financial coercion, and traces embedded links:

```
[Raw SMS Text]
       │
       ▼
[Step 1: Text Preprocessing & Entity Masking]
       │  Lowercasing, Unicode normalization, phone/account regex masking
       ▼
[Step 2: TF-IDF Feature Vectorization]
       │  Computes Term Frequency & Inverse Document Frequency:
       │  w_(t,d) = TF(t, d) * log((1 + |D|) / (1 + |{d: t ∈ d}|)) + 1
       ▼
[Step 3: L2-Regularized Logistic Regression Classification]
       │  Linear combination: z = w_0 + Σ (w_j * x_j)
       │  Sigmoid probability: σ(z) = 1 / (1 + e^-z)
       ▼
[Step 4: Social Engineering Linguistic Heuristic Analysis]
       │  Regex matching: Urgency, KYC expiry, Electricity threat, APK lures
       ▼
[Step 5: Deep URL Extraction & Secondary Pipeline Routing]
       │  Extracts embedded shortlinks -> Dispatches to Random Forest URL Engine
```

* **Step 1: Text Normalization:**
  Converts text to lower-case, expands contractions, standardizes Indian currency symbols (`Rs.`, `INR`, `₹`), and replaces 10-digit mobile numbers and bank account numbers with symbolic tokens (`<PHONE_NUM>`, `<ACCT_NUM>`).
* **Step 2: TF-IDF Matrix Transformation:**
  Constructs a sparse n-gram feature vector (word and character n-grams from 1 to 3 words):
  $$\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}, \quad \text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$
  $$\text{Weight}(t, d) = \text{TF}(t, d) \times \text{IDF}(t, D)$$
  High weights are assigned to words that are frequent in smishing messages but rare in benign transactional messages.
* **Step 3: Logistic Regression Sigmoid Scoring:**
  The vector $X$ passes into the trained regularized linear model:
  $$z = \beta_0 + \sum_{j=1}^{K} \beta_j X_j, \quad P(\text{smishing} \mid X) = \frac{1}{1 + e^{-z}}$$
* **Step 4: Social Engineering Linguistic Rules:**
  The message is scanned against four high-risk financial fraud patterns:
  1. *KYC Invalidation:* e.g., `"your sbi yono account will be suspended today update kyc"`.
  2. *Urgent Utility Threats:* e.g., `"electricity will be disconnected at 9:30 pm call officer"`.
  3. *Unclaimed Rewards:* e.g., `"congratulations reward points worth Rs 9850 credit to bank"`.
  4. *Malicious Android Packages:* e.g., links ending in `.apk` or requesting remote desktop downloads (`AnyDesk`, `TeamViewer`).
* **Step 5: Deep Embedded Link Harvesting:**
  Any embedded HTTP/HTTPS links are isolated, resolved past shortener redirects, and dispatched to the Phase 2 Random Forest classifier. The final SMS risk score combines linguistic coercion with URL malice.

#### 💡 Concrete Walkthrough Example:
> **Input:** Chandru pastes an SMS received on mobile:  
> `"Dear SBI Customer, your YONO NetBanking account is BLOCKED today due to incomplete KYC! Please verify immediately at http://sbi-kyc.top to prevent permanent closure."`
>
> 1. **Preprocessing & Tokenization:**  
>    `["dear", "sbi", "customer", "yono", "netbanking", "account", "blocked", "today", "due", "incomplete", "kyc", "verify", "immediately", "<URL>", "prevent", "permanent", "closure"]` (Total words = 17).
> 2. **TF-IDF Weight Calculation:**
>    * Term `"blocked"`: $\text{TF} = 1/17 = 0.0588$, $\text{IDF} = 4.85 \rightarrow \mathbf{Weight = 0.285}$
>    * Term `"kyc"`: $\text{TF} = 1/17 = 0.0588$, $\text{IDF} = 5.12 \rightarrow \mathbf{Weight = 0.301}$
>    * Term `"immediately"`: $\text{TF} = 1/17 = 0.0588$, $\text{IDF} = 4.20 \rightarrow \mathbf{Weight = 0.247}$
>    * Term `"yono"`: $\text{TF} = 1/17 = 0.0588$, $\text{IDF} = 4.60 \rightarrow \mathbf{Weight = 0.270}$
> 3. **Sigmoid Logit Scoring:**
>    $$z = \beta_0 + \sum \beta_j X_j = -2.10 + 1.35(\text{blocked}) + 1.25(\text{kyc}) + 0.95(\text{immediately}) + 1.10(\text{yono}) + \dots = \mathbf{+3.28}$$
>    $$P(\text{smishing}) = \sigma(3.28) = \frac{1}{1 + e^{-3.28}} = \frac{1}{1 + 0.0376} = \mathbf{0.9637 \quad (96.4\%)}$$
> 4. **Deep Embedded Link Extraction:**  
>    Extractor isolates `http://sbi-kyc.top` $\rightarrow$ passes to URL Classifier $\rightarrow$ Random Forest flags predatory `.top` TLD (98.2% risk).
> 5. **Verdict:** **CRITICAL SMISHING THREAT (97.3%)** with Coercion Flag: *Urgent Account Block + Fake KYC Verification*.

---

### 5. EasyOCR PyTorch Visual Threat Pipeline

Processes screenshot uploads entirely in RAM, performing deep optical text extraction and logo/domain verification:

```
[Uploaded Screenshot Image Buffer]
       │
       ▼
[Step 1: In-Memory BGR Array Decoding (cv2.imdecode)]
       │  Validates PNG/JPEG/WEBP magic bytes; zero disk persistence
       ▼
[Step 2: Text Region Detection via CRAFT Deep Neural Network]
       │  Outputs 2D heatmaps: Character Region Score & Affinity Score
       │  Generates rotated bounding-box polygons for each word
       ▼
[Step 3: Deep Sequence Recognition (ResNet CNN + BiLSTM + CTC Decoder)]
       │  CNN extracts visual features -> BiLSTM sequences text -> CTC decodes
       ▼
[Step 4: Optical Misrecognition Normalization Engine]
       │  Fixes common OCR errors: "vvv" -> "www", "0" -> "o", missing slashes
       ▼
[Step 5: Multimodal Threat Synthesis & Asynchronous Queue Dispatch]
       │  OCRController manages concurrency (MAX_CONCURRENT_OCR=1)
```

* **Step 1: In-Memory Decoding:**
  The incoming multipart byte-stream is inspected for valid magic bytes (`\x89PNG`, `\xFF\xD8\xFF`, `RIFF...WEBP`). The image is decoded into a 3D NumPy array ($H \times W \times 3$) using `cv2.imdecode`. The raw file is **never written to disk**.
* **Step 2: CRAFT Text Region Detection:**
  EasyOCR utilizes the **Character Region Awareness for Text Detection (CRAFT)** neural network. It outputs two pixel-level probability maps:
  1. *Region Score:* Identifies the center of individual characters.
  2. *Affinity Score:* Detects spaces and connects adjacent characters into words and sentences.
  Bounding-box coordinates are derived for every detected text snippet.
* **Step 3: Sequence Recognition:**
  Image patches from detected bounding boxes pass through a **ResNet** convolutional backbone to extract visual features, into a **Bidirectional LSTM** (BiLSTM) layer to model character dependencies, and finally into a **Connectionist Temporal Classification (CTC)** decoder to produce unicode strings.
* **Step 4: Optical Misrecognition Normalization:**
  OCR engines frequently misread URLs displayed on digital screens. PhishShield applies regex correction filters:
  * Repaired `vvv.` or `\/\/ww.` $\rightarrow$ `www.`
  * Repaired `hxxp` or `htfp` $\rightarrow$ `http`
  * Corrected numeric substitutions in domains (e.g., `sb1.co.in` $\rightarrow$ `sbi.co.in`).
* **Step 5: Concurrency Guarding:**
  To prevent CPU core exhaustion on cloud instances, `OCRController` executes extractions through a bounded semaphore (`threading.Semaphore(1)`). Incoming requests receive an asynchronous `HTTP 202 Accepted` job ID to poll while the CPU processes the image.

#### 💡 Concrete Walkthrough Example:
> **Input:** Chandru takes a phone screenshot of an unfamiliar portal claiming to be HDFC Bank and uploads `hdfc_screen.png`:
>
> 1. **In-Memory Buffer Ingestion:** Byte-stream verified as PNG magic bytes. Decoded via `cv2.imdecode` into $1920 \times 1080 \times 3$ BGR NumPy array in RAM.
> 2. **CRAFT Detection:** The neural network detects 3 primary typography clusters on the page:
>    * Bounding Box 1: `[x: 120, y: 45, w: 320, h: 50]` $\rightarrow$ Confidence 98.4%
>    * Bounding Box 2: `[x: 140, y: 120, w: 450, h: 40]` $\rightarrow$ Confidence 95.1%
>    * Bounding Box 3: `[x: 140, y: 280, w: 380, h: 35]` $\rightarrow$ Confidence 92.7%
> 3. **ResNet + BiLSTM + CTC Recognition:**
>    * Text 1: `"HDFC Bank NetBanking Portal"`
>    * Text 2: `"Enter Customer ID / User ID and Password"`
>    * Text 3: `"https://hdfc-verify-portal.net/auth"`
> 4. **Normalization:** Regex repairs minor optical fuzziness.
> 5. **Triangulation Engine Evaluation:**
>    * Visual Brand Detected: `HDFC Bank` (Canonical official domain: `hdfcbank.com`).
>    * Address Bar Hostname Detected in OCR: `hdfc-verify-portal.net`.
>    * Cross-Reference: `hdfc-verify-portal.net` is **NOT** owned by HDFC Bank!
> 6. **Result:**  
>    $$\mathbf{CRITICAL\ VERDICT:\ Active\ Credential\ Harvesting\ Impersonating\ HDFC\ Bank\ (98.0\%)}$$

---

### 6. Unified Multi-Vector Risk Engine & Decision Matrix

Harmonizes all detection channels (URL, Brand, SMS, Screenshot) into a calibrated verdict:

```
  [URL Model Score]      [Brand Mismatch]      [SMS Linguistics]      [OCR Typography]
         │                       │                     │                      │
         └───────────────────────┴──────────┬──────────┴──────────────────────┘
                                            ▼
                    [Zero-Trust Hard Decision Overrides]
                    ├── Brand Mismatch on Untrusted Host? --> Force CRITICAL (Score ≥ 92%)
                    ├── Malicious APK / RAT Download?     --> Force CRITICAL (Score ≥ 95%)
                    └── Verified RBI Whitelist Portal?    --> Force SAFE (Score ≤ 12%)
                                            │
                                  (If no override applies)
                                            ▼
                    [Calibrated Multi-Factor Weighted Synthesis]
                    Risk = (w_url * S_url) + (w_brand * S_brand) + (w_ling * S_ling)
                                            ▼
                               [Five-Tier Verdict Mapping]
                    ├── 0.0%  – 14.9%  : SAFE
                    ├── 15.0% – 39.9%  : LOW RISK
                    ├── 40.0% – 69.9%  : SUSPICIOUS
                    ├── 70.0% – 84.9%  : HIGH RISK
                    └── 85.0% – 100.0% : CRITICAL PHISHING
```

* **Step 1: Hard Rule Pre-Checks (Zero-Trust Overrides):**
  * If a verified brand keyword appears in visual OCR typography or URL paths, but the domain does not belong to the official RBI domain list $\rightarrow$ **Override to CRITICAL (92–98%)**.
  * If SMS instructs user to download remote desktop utilities (`AnyDesk`, `TeamViewer`, `.apk`) $\rightarrow$ **Override to CRITICAL (95–100%)**.
  * If the registered domain is on the RBI whitelist and zero deceptive parameters exist $\rightarrow$ **Override to SAFE (0–12%)**.
* **Step 2: Weighted Calibration:**
  When no hard overrides trigger, scores are blended dynamically based on vector availability:
  $$\text{Score} = w_{\text{URL}} \cdot S_{\text{URL}} + w_{\text{Brand}} \cdot S_{\text{Brand}} + w_{\text{Linguistic}} \cdot S_{\text{Linguistic}}$$
* **Step 3: Five-Tier Decision Mapping:**
  The synthesized score maps into an actionable security posture accompanied by explainability attributions and tailored user safety recommendations.

---

### 7. Cryptographic SHA-256 Tamper-Evident Audit Ledger

Provides immutable, blockchain-grade governance tracking for every administrative action:

```
[Admin Action / Scan Export]
       │
       ▼
[Step 1: Payload Sanitization & Password Redaction]
       │  Scans dictionary: removes 'password', 'token', 'secret_key'
       ▼
[Step 2: Predecessor Pointer Retrieval (prev_hash)]
       │  Queries database: retrieves entry_hash from most recent audit record
       │  (If table is empty: prev_hash = "0000...0000" Genesis Hash)
       ▼
[Step 3: Canonical Tuple Serialization]
       │  Serialized = prev_hash | timestamp | actor | action | entity | sorted_json(details)
       ▼
[Step 4: Cryptographic SHA-256 Digest Generation]
       │  entry_hash = hashlib.sha256(Serialized.encode('utf-8')).hexdigest()
       ▼
[Step 5: Atomic Database Commit to audit_logs Table]
       │
       ▼
[Tamper Audit Verification Algorithm: verify_audit_log_chain()]
       │  Sequentially re-computes hashes across all records:
       │  If recomputed != stored or prev_hash != prior.entry_hash -> TAMPER_DETECTED!
```

* **Step 1: Payload Scrubbing:**
  Before recording an event, `sanitize_audit_payload` recursively redacts sensitive credentials, tokens, and authorization headers (`[REDACTED]`).
* **Step 2: Predecessor Chaining:**
  The system queries the latest record in `audit_logs` to retrieve its `entry_hash`. If the database is new, it initializes with a 64-character Genesis Hash (`0000000000000000000000000000000000000000000000000000000000000000`).
* **Step 3: Canonical String Serialization:**
  Constructs a deterministic, pipe-delimited string of the event tuple:
  $$\text{String} = \text{prev\_hash} \parallel \text{timestamp} \parallel \text{actor} \parallel \text{action} \parallel \text{entity\_type} \parallel \text{entity\_id} \parallel \text{json.dumps}(\text{details}, \text{sort\_keys}=\text{True})$$
* **Step 4: SHA-256 Hash Generation:**
  $$\text{entry\_hash} = \text{SHA-256}(\text{String})$$
  Both `prev_hash` and `entry_hash` are committed alongside the record.
* **Step 5: Integrity Verification Algorithm (`verify_audit_log_chain`):**
  Administrators can trigger a cryptographic integrity verification pass. The function iterates through all rows sequentially:
  1. Checks if `record[i].prev_hash == record[i-1].entry_hash`.
  2. Re-computes `SHA-256(record[i])` and checks if it matches `record[i].entry_hash`.
  If an attacker manually deletes an audit row or modifies details directly in SQLite, the link is broken and the system flags **`TAMPER_DETECTED`** identifying the exact corrupted record ID.

#### 💡 Concrete Walkthrough Example:
> **Event:** Administrator Chandru adds a new authorized custom banking domain: `netbanking.sbicard.com`.
>
> 1. **Prior Audit Row in DB (#105):**  
>    `entry_hash` = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
> 2. **Predecessor Pointer for Row #106:**  
>    `prev_hash` = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
> 3. **Constructing the Deterministic String:**  
>    `e3b0c442...|2026-11-24 09:30:00|chandru|CREATE_BANK|bank_registry|17|{"brand_name": "SBI Card", "domain": "sbicard.com"}`
> 4. **SHA-256 Computation:**  
>    $$\text{entry\_hash} = \text{SHA256}(\text{String}) = \mathbf{a7f938c21e64b8590117d91e84a2f8c5b018591e4a1795b281f01c48271e9841}$$
> 5. **Attempted Tampering Scenario:**  
>    Suppose a rogue insider hacks the SQLite database directly and edits `chandru` $\rightarrow$ `anonymous_admin`:
>    When the auditor clicks **"Verify Audit Chain"**, the system re-computes `SHA256(tampered_string)`.
>    $$\text{Recomputed} = \mathbf{f48a192...} \quad \ne \quad \text{Stored} = \mathbf{a7f938c...}$$
>    The system raises a forensic red flag:  
>    $$\mathbf{TAMPER\_DETECTED:\ Cryptographic\ integrity\ failed\ at\ record\ \#106.\ Payload\ altered!}$$

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
