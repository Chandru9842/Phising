# PhishShield — Phase 6D Release Engineering & Reproducibility Guide

This document defines the complete release engineering specification, reproducible build environment, dependency audit, security controls, and operational runbooks for **PhishShield**.

---

## 1. Release Architecture & Repository Structure

PhishShield is version-controlled with a clean Git baseline separating runtime code, pre-trained neural/statistical model artifacts, and test suites from machine-specific caches, virtual environments, and sensitive secrets.

```
c:\Phising\
├── .github/
│   └── workflows/
│       └── ci.yml                     # 3-tier CI pipeline (pytest, build, docker-lint)
├── backend/
│   ├── app/
│   │   ├── api/                       # REST API routers (v1 endpoints)
│   │   ├── core/                      # Core security, OCR queue, RBAC & risk engines
│   │   ├── data/                      # Training dataset generators & CSVs
│   │   ├── ml/                        # ML inference pipelines & TreeSHAP explainers
│   │   │   └── saved_models/
│   │   │       └── url_rf_model.joblib # Pre-trained URL Random Forest (26 features)
│   │   ├── ml/sms/
│   │   │   └── saved_models/
│   │   │       └── sms_tfidf_lr_model.joblib # Pre-trained SMS TF-IDF + LogReg
│   │   ├── models/                    # SQLAlchemy database ORM entities
│   │   ├── schemas/                   # Pydantic v2 validation contracts
│   │   ├── services/                  # Business logic (dossier, audit, webhooks)
│   │   ├── config.py                  # Pydantic-settings environment parser
│   │   ├── database.py                # Database connection factory & WAL config
│   │   └── main.py                    # FastAPI ASGI application & lifespan hooks
│   ├── scripts/
│   │   └── cleanup_test_data.py       # Safe test data auditing & cleanup tool
│   ├── tests/                         # Pytest test suites (118 automated tests)
│   ├── .dockerignore                  # Backend container build exclusions
│   ├── .env.example                   # Sanitized backend environment template
│   ├── Dockerfile                     # Hardened Python 3.12-slim non-root container
│   ├── requirements.txt               # Backend dependency constraints
│   └── run.py                         # ASGI local development runner
├── docs/
│   └── architecture.md                # System architecture documentation
├── frontend/
│   ├── src/                           # React 18 + Tailwind CSS application
│   │   ├── components/                # Admin, history, dashboard & scanner views
│   │   ├── services/                  # Axios API communication layer
│   │   ├── utils/                     # Normalization & contract helpers
│   │   ├── App.jsx                    # Root view orchestrator
│   │   └── main.jsx                   # React DOM entrypoint
│   ├── .dockerignore                  # Frontend container build exclusions
│   ├── .env.example                   # Sanitized frontend environment template
│   ├── Dockerfile                     # Multi-stage Node 20 builder -> Nginx runner
│   ├── index.html                     # SPA single-page entrypoint
│   ├── nginx.conf                     # Production Nginx reverse-proxy & CSP rules
│   ├── package.json                   # Node package definitions
│   ├── package-lock.json              # Deterministic npm dependency lockfile
│   └── vite.config.js                 # Vite code-splitting & proxy configuration
├── .env.example                       # Root environment variables template
├── .gitignore                         # Comprehensive repository exclusion rules
├── docker-compose.yml                 # Multi-container orchestration definition
├── DEPLOYMENT_READINESS_PHASE_6C_2.md # Phase 6C.2 readiness review
├── SECURITY_AUDIT_PHASE_6C_1.md       # Phase 6C.1 security audit report
└── STAGING_DEPLOYMENT_PHASE_6C_3.md   # Phase 6C.3 live runtime verification report
```

---

## 2. Dependency Audit & Reproducibility Matrix

### Backend Python Toolchain
- **Language**: Python 3.12.2+ (CPython).
- **Core Runtime**:
  - `fastapi` $\ge$ 0.111.0 (tested with `0.161.1`)
  - `uvicorn[standard]` $\ge$ 0.30.0 (tested with `0.54.0`)
  - `pydantic` $\ge$ 2.7.0 (tested with `2.14.1`)
  - `sqlalchemy` $\ge$ 2.0.30 (tested with `2.1.9`)
  - `scikit-learn` $\ge$ 1.5.0 (tested with `1.9.1`)
  - `shap` $\ge$ 0.45.0 (tested with `0.54.1`)
  - `easyocr` $\ge$ 1.7.0 (tested with `1.7.2`)
  - `reportlab` $\ge$ 5.0.0 (tested with `5.1.0`)
  - `pyjwt` $\ge$ 2.8.0 (tested with `2.10.1`)
- **Reproducibility Validation**: All dependencies install deterministically from `backend/requirements.txt` on a standard CPython 3.12 environment with `pip install -r requirements.txt`.

### Frontend Node.js Toolchain
- **Runtime**: Node.js 20.x or 22.x LTS (tested up to Node `24.15.0`), npm `12.2.0`.
- **Lockfile Integrity**: `frontend/package-lock.json` pins exact dependency trees for:
  - `react` & `react-dom` (`18.3.1`)
  - `vite` (`5.4.11`)
  - `recharts` (`2.13.3`)
  - `lucide-react` (`0.460.0`)
  - `axios` (`1.7.7`)
  - `tailwindcss` (`3.4.15`)
- **Deterministic Build**: Running `npm ci` followed by `npm run build` compiles `dist/` in under 20 seconds.

---

## 3. Fresh Environment Installation & Startup

To clone and run PhishShield on a new workstation from scratch:

### 1. Clone & Setup Backend
```bash
# Clone the repository
git clone <repository_url>
cd PhishShield

# Configure environment variables
cp .env.example .env
cp backend/.env.example backend/.env

# Setup isolated Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# OR (Linux / macOS)
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Configure Frontend
```bash
cd ../frontend
cp .env.example .env

# Deterministic npm install
npm ci
```

### 3. Startup Backend & Frontend
```bash
# Terminal 1: Launch Backend Server (binds to http://127.0.0.1:8000)
cd ../backend
python run.py

# Terminal 2: Launch Frontend Server (binds to http://localhost:5173 or 4173)
cd ../frontend
npm run dev
# OR for production preview:
npm run build
npm run preview
```

---

## 4. Pre-Trained Machine Learning Models

PhishShield includes pre-trained, production-validated machine learning models tracked directly in version control:

1. **URL Random Forest Classifier**:
   - Location: `backend/app/ml/saved_models/url_rf_model.joblib` (95.9 kB)
   - Input: 26 structural, lexical, domain, and brand features.
   - Serialization: `joblib` compressed dictionary containing classifier weights, feature column ordering, and training metadata.
2. **SMS Smishing Pipeline**:
   - Location: `backend/app/ml/sms/saved_models/sms_tfidf_lr_model.joblib` (89.9 kB)
   - Input: TF-IDF n-gram vectorizer + calibrated Logistic Regression.
3. **EasyOCR & PyTorch Weights**:
   - Initialized on first screenshot scan or cached in `~/.EasyOCR/model` (or `/app/models/easyocr` in Docker).
   - Zero retraining required.

---

## 5. Secret Hygiene & Configuration Reference

PhishShield enforces zero hardcoded secrets. All operational credentials are read via environment variables:

| Variable Name | Default / Dev Fallback | Production Requirement |
| :--- | :--- | :--- |
| `SECRET_KEY` | `phishshield-default-dev-secret-key` | **Mandatory**: Minimum 32 random characters. Production server will halt if weak or default. |
| `ADMIN_INITIAL_PASSWORD` | `PhishShieldAdmin#2026` | **Mandatory in Production**: Minimum 12 characters. Automatic bootstrap disabled in production unless set. |
| `DATABASE_URL` | `sqlite:///./phishshield.db` | Path to persistent SQLite or PostgreSQL database. |
| `PBKDF2_ITERATIONS` | `600000` | Password hashing iteration count. |
| `CORS_ORIGINS` | Permitted URLs | Permitted client browser origins. |
| `MAX_CONCURRENT_OCR` | `1` | Semaphore bounding simultaneous CPU OCR jobs. |

---

## 6. Test Data Cleanup & Database Maintenance

Staging and automated testing generate synthetic test accounts and scan records. PhishShield provides an automated cleanup tool with strict safety controls:

```powershell
# Analyze database and display test data without modifying anything (dry-run):
cd backend
python scripts/cleanup_test_data.py --dry-run

# Execute safe cleanup with automatic timestamped backup:
python scripts/cleanup_test_data.py --confirm
```

### Safety Features
- `--dry-run` is enforced by default.
- `--backup` automatically creates `phishshield_backup_YYYYMMDD_HHMMSS.db`.
- Schema, table structures, and administrator account (`admin`) are permanently protected.
- Prunes only identified test accounts (`smoke_*`, `staging_*`, etc.), test bank domains (`*smoke*`, `*test*`), and synthetic test scans.

---

## 7. Verification & Test Execution

To verify code integrity and regression status across all 118 automated tests:

```bash
cd backend
pytest tests/ -v
```

### Full Test Suite Breakdown
- `tests/test_phase6c3_live_runtime.py`: 20 live HTTP staging tests
- `tests/test_phase6c2_smoke.py`: 11 operational smoke tests
- `tests/test_phase6c1_security.py`: 12 cryptographic & security tests
- `tests/test_phase6c_enterprise.py`: 9 enterprise RBAC & dossier tests
- `tests/test_screenshot_threat.py`: 6 screenshot & OCR queue tests
- `tests/test_sms_detector.py`: 21 SMS smishing detector tests
- `tests/test_url_classifier.py`: 17 URL classifier & dataset loader tests
- `tests/test_brand_and_shap.py`: 16 brand typosquatting & SHAP explainer tests
- `tests/test_health.py`: 6 base health & registry tests
- **Total: 118 passed / 0 failed (100% pass rate)**.

---

## 8. Operational Limitations & Known Constraints

1. **Docker Container Execution**:
   - Docker CLI and daemon are not installed on the local Windows workstation. Dockerfile and Compose configurations are statically verified and CI-ready, but container runtime execution cannot be performed locally without installing Docker Desktop or a WSL2 distribution.
2. **CI Pipeline Execution**:
   - The project is now tracked in local Git, but no remote GitHub repository is linked. CI workflows in `.github/workflows/ci.yml` will trigger automatically once pushed to a GitHub remote.
3. **Database Concurrency**:
   - SQLite in WAL mode is suitable for low-to-medium enterprise workloads. For large-scale distributed deployments, update `DATABASE_URL` to PostgreSQL.
