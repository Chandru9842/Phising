---
title: PhishShield Backend API
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# 🛡️ PhishShield: Brand-Aware, Explainable Phishing Protection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.15.0_CPU-EE4C2C?style=flat-square&logo=pytorch)](https://pytorch.org)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E?style=flat-square&logo=scikitlearn)](https://scikit-learn.org)
[![EasyOCR](https://img.shields.io/badge/EasyOCR-1.7.2-brightgreen?style=flat-square)](https://github.com/JaidedAI/EasyOCR)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**PhishShield** is an AI-powered cybersecurity defense and threat intelligence platform specifically engineered to protect Indian banking customers and financial institutions from phishing URLs, malicious SMS/smishing campaigns, and brand-impersonating fake banking portals.

---

## 🌟 Key Capabilities & Detection Vectors

### 1. 🖼️ Visual Brand Impersonation & EasyOCR Intelligence
- **Thread-Safe Optical Character Recognition:** Modular EasyOCR engine powered by PyTorch CPU and OpenCV extracts typographic candidates from user screenshots.
- **Asynchronous Queue Controller:** Bounded concurrency semaphore (`MAX_CONCURRENT_OCR=1`) and job polling prevent CPU starvation during concurrent screenshot uploads.
- **Brand Mismatch Engine:** Cross-references extracted logos and typography against the **Reserve Bank of India (RBI)** canonical bank registry to detect unauthorized domain spoofing.
- **Zero-Disk Storage Policy:** Uploaded screenshots are processed strictly in RAM as OpenCV byte arrays and instantly discarded.

### 2. 🔗 Zero-Trust URL Inspection with SHAP Explainability
- **Lexical & Structural Analysis:** Extracts 26 lexical, topological, and domain entropy indicators.
- **Random Forest Classifier:** Pre-trained machine learning model outputs calibrated risk scores and threat classifications.
- **Explainable AI (SHAP):** Deploys TreeSHAP feature attributions so analysts and end-users understand the precise indicators (e.g., suspicious TLD, excessive subdomains, brand token typosquatting) driving each verdict.
- **Zero Live Contact Guarantee:** URLs and extracted links are evaluated statically; PhishShield **never resolves, pings, or contacts** external malicious servers.

### 3. 📱 SMS Smishing & Social Engineering Analysis
- **NLP Vectorization & Classifier:** High-precision TF-IDF and Logistic Regression pipeline evaluates deceptive SMS messages.
- **Urgency & Coercion Detection:** Analyzes coercive linguistic patterns (e.g., *"account blocked"*, *"KYC expired"*, *"pan card verification"*, *"lottery reward"*).
- **Embedded Link Extraction:** Automatically isolates shortlinks and passes candidates through the URL classification pipeline.

### 4. 🏛️ Enterprise Administration & Governance
- **Role-Based Access Control (RBAC):** Tiered roles (**Administrator**, **Analyst**, **Viewer**) with secure JWT authentication and password hashing.
- **Indian Banking Whitelist Administration:** Controlled management of authenticated Indian bank domains (SBI, HDFC, ICICI, Axis, PNB, Kotak, Canara, BoB, NPCI, RBI, etc.).
- **Forensic Threat Dossier Export:** One-click forensic exports in structured JSON and executive PDF formats featuring **automatic URL defanging** (e.g., `hxxps[://]`).
- **Outbound Webhook Alerts with SSRF Defenses:** Automated alerting to SIEM/Slack endpoints with strict private RFC1918 and loopback address blocking.
- **Tamper-Evident Audit Trails:** Cryptographic **SHA-256 hash-chaining** across all administrative events to guarantee forensic integrity.

---

## 🏗️ System Architecture

```
                                 ┌────────────────────────────────────────┐
                                 │       React + Vite Frontend (SPA)      │
                                 │   Dashboard / Threat Map / Scanner     │
                                 └───────────────────┬────────────────────┘
                                                     │ Reverse Proxy / API
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Engine                          │
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

## 📂 Project Structure

```
PhishShield/
├── backend/
│   ├── app/
│   │   ├── api/                     # REST API Routers (Auth, Scans, Admin, Dossier, Webhooks)
│   │   ├── core/                    # OCR Queue, Security, Brand Registry, Risk Engine
│   │   ├── ml/                      # URL Random Forest, SHAP Explainer, SMS Classifier
│   │   │   ├── saved_models/        # Pre-trained url_rf_model.joblib
│   │   │   └── sms/saved_models/    # Pre-trained sms_tfidf_lr_model.joblib
│   │   ├── models/                  # SQLAlchemy models (User, Scan, Bank, Audit, Webhook)
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── services/                # Dossier export, Webhook alerts, Audit service
│   │   ├── config.py                # Environment configurations
│   │   ├── database.py              # SQLite session factory
│   │   └── main.py                  # FastAPI application entry & CORS
│   ├── tests/                       # 118 unit & regression tests
│   ├── scripts/                     # Test-data cleanup & secret scanner utilities
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
│   │   ├── services/                # API client with Axios
│   │   ├── App.jsx                  # Main dashboard controller
│   │   └── main.jsx                 # React root
│   ├── Dockerfile                   # Multi-stage Node builder + Nginx runner
│   ├── nginx.conf                   # Production Nginx reverse-proxy & security headers
│   └── package.json                 # Frontend manifests & lockfile
│
├── .github/workflows/ci.yml         # GitHub Actions automated regression pipeline
├── docker-compose.yml               # Multi-container orchestration specification
├── DEPLOYMENT_READINESS_PHASE_6E.md # Production deployment assessment
├── RELEASE_ENGINEERING_PHASE_6D.md  # Reproducibility & model specs
└── README.md                        # Project documentation
```

---

## 🚀 Quickstart: Local Development

### Prerequisites
- **Python 3.10+** (Tested on Python `3.12.2`)
- **Node.js 18+** (Tested on Node.js `v24.15.0` / npm `12.2.0`)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Chandru9842/Phising.git
cd Phising
```

### 2. Backend Setup
```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python run.py
```
* Backend API will be live at: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies deterministically
npm ci

# Start development server
npm run dev
```
* Dashboard will be live at: **http://localhost:5173**

---

## ☁️ 100% Free Cloud Deployment (Zero Rupees / No Credit Card)

PhishShield can be deployed completely for free with zero charges using **Hugging Face Spaces** (Backend) and **Vercel** (Frontend).

### Part 1: Deploy Backend to Hugging Face Spaces (16 GB Free RAM)
1. Sign up for a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space** → Name it `phishshield-api`.
3. Select **Docker** as the SDK.
4. Clone your Space repository locally or push your `backend` repository:
   * The repository's `README.md` already contains the required Hugging Face metadata:
     ```yaml
     ---
     title: PhishShield Backend API
     emoji: 🛡️
     sdk: docker
     app_port: 7860
     ---
     ```
5. Hugging Face automatically detects the `backend/Dockerfile`, builds the container on a **2 vCPU / 16 GB RAM** machine, and exposes your backend at:  
   `https://<your-username>-phishshield-api.hf.space`

### Part 2: Deploy Frontend to Vercel
1. Sign up for a free account at [vercel.com](https://vercel.com).
2. Click **Add New Project** → Import your GitHub repository (`Chandru9842/Phising`).
3. Set the Root Directory to `frontend`.
4. Add the Environment Variable:
   ```env
   VITE_API_BASE_URL=https://<your-username>-phishshield-api.hf.space/api
   ```
5. Click **Deploy**. Vercel compiles the production bundle in ~30 seconds and assigns a free `.vercel.app` domain with automatic SSL.

---

## 🐳 Production Deployment with Docker Compose

For deploying on an Ubuntu VPS (DigitalOcean, Hetzner, AWS EC2):

```bash
# Clone repository
git clone https://github.com/Chandru9842/Phising.git
cd Phising

# Launch backend, frontend, and reverse proxy
docker compose up -d --build
```
* The Nginx reverse proxy handles SPA routing and proxies `/api/*` to FastAPI on port 80.
* Persistent named volumes retain the SQLite database (`phishshield_backend_data`) and EasyOCR models (`phishshield_model_cache`).

---

## 🧪 Automated Testing Suite

PhishShield includes 118 automated tests covering model predictions, explainability, async OCR queues, and enterprise governance:

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

---

## 🛡️ Security & Privacy Guarantees

1. **Zero External Resolution:** Target domains and extracted OCR links are inspected purely via static heuristics and offline ML models.
2. **Zero Disk Screenshot Retention:** Screenshot images are processed as in-memory arrays and never written to disk.
3. **SSRF Outbound Defenses:** Outbound alert webhooks restrict destinations to public endpoints, blocking private RFC1918 subnets and cloud metadata services (`169.254.169.254`).
4. **Tamper-Evident Auditing:** Every administrative operation is appended to a cryptographic SHA-256 hash-chain to ensure verifiable governance.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
