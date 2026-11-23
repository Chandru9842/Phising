# PhishShield — Phase 6E: Deployment & Public Demo Readiness Assessment

**Document Version:** 1.0.0  
**Target Baseline:** Git Release Tag `v0.1.0` (Commit `2150e5b`)  
**Assessment Date:** November 2026  
**Auditor:** PhishShield Release Engineering & DevSecOps  

---

## 1. Executive Summary & Release Baseline

Phase 6E provides the formal deployment, operational feasibility, and public demonstration readiness evaluation for the PhishShield cyber-defense platform.

### Baseline Status Matrix
* **Repository Root:** `C:\Phising\`
* **Active Branch:** `master`
* **Release Baseline Commit:** `2150e5b18035cfcc7cc6282a2b0cb65e2de4d05e`
* **Annotated Release Tag:** `v0.1.0`
* **Tracked Entities:** 119 files in Git repository (source, configs, Docker, pre-trained ML models, and tests).
* **Working Tree:** Clean (`nothing to commit, working tree clean`).
* **Test Suite Status:** 118/118 tests passing (100% pass rate).
* **Frontend Production Build:** 2,247 modules compiled cleanly via Vite into `frontend/dist/`.

---

## 2. OCR Architecture Reconciliation

### Findings on Past Documentation Discrepancy
Earlier Phase 6D report narratives contained a typographical reference to `pytesseract`. An exhaustive repository code and package audit was conducted to reconcile this claim:

1. **Codebase Inspection:**
   * `pytesseract` occurrences across all tracked `.py`, `.md`, and `.txt` files: **0 occurrences found**.
   * Real OCR implementation: [`backend/app/core/ocr_engine.py`](file:///C:/Phising/backend/app/core/ocr_engine.py).
   * Underlying Engine: **EasyOCR** (`easyocr==1.7.2`), backed by PyTorch (`torch==2.15.0`) and OpenCV (`opencv-python-headless==4.10.0.84`).
2. **Runtime Configuration:**
   * EasyOCR is loaded as a thread-safe singleton (`_reader_lock` mutex) in CPU mode (`gpu=False`) to guarantee deterministic execution across developer workstations and cloud containers.
   * Model storage directory is bound to `EASYOCR_MODULE_PATH` (`/app/models/easyocr` in Docker, `~/.EasyOCR/model` in local dev).
3. **Container Consistency:**
   * [`backend/Dockerfile`](file:///C:/Phising/backend/Dockerfile) installs required OS runtime libraries: `libgl1`, `libglib2.0-0`, `libgomp1`.
   * Dockerfile sets `EASYOCR_MODULE_PATH=/app/models/easyocr` and `TORCH_HOME=/app/models/torch`.
   * Neither Tesseract binaries nor `tesseract-ocr` packages are installed or required.
4. **Verification:**
   * The documentation discrepancy was purely conversational. The committed code, dependencies, Dockerfiles, and CI specifications have always utilized EasyOCR.

---

## 3. Clean Installation & Reproducibility Audit

### Host Specifications & Resource Headroom
* **Host OS:** Windows 11 Pro 64-bit
* **CPU:** 11th Gen Intel Core i3-1115G4 @ 3.00 GHz (2 physical cores, 4 threads)
* **RAM:** 7.8 GB Visible Memory (~710 MB free physical RAM during audit)
* **Storage:** 177 GB free on `C:\`

### Reproducibility Results
1. **Backend Dependency Resolution:**
   * Executed `python -m pip install --dry-run -r requirements.txt`.
   * All 21 top-level dependencies and sub-dependencies resolved deterministically with Python 3.12 compatibility.
2. **Pre-trained ML Model Deserialization:**
   * `backend/app/ml/saved_models/url_rf_model.joblib`: Verified dictionary payload containing `model` (RandomForestClassifier, 26 features), `feature_names`, `metadata`, and `is_trained=True`.
   * `backend/app/ml/sms/saved_models/sms_tfidf_lr_model.joblib`: Verified dictionary payload containing `pipeline` (TF-IDF vectorizer + LogisticRegression), `metadata`, and `is_trained=True`.
3. **Frontend Clean Build:**
   * Executed `npm ci --dry-run` against [`frontend/package-lock.json`](file:///C:/Phising/frontend/package-lock.json). Package tree verified in 2 seconds with zero drift.
   * `npm run build` generates production SPA assets with route code-splitting (`AdminGovernanceView` isolated to 20.97 kB).
4. **Staging Reverse Proxy & Health Endpoint:**
   * Backend `/api/health` responded with `200 OK` (`status: healthy`, `version: 0.1.0`, `supported_banks_count: 16`).
   * Frontend preview on `http://localhost:4173/` successfully proxies API traffic to backend `http://127.0.0.1:8000/api/health`.

---

## 4. Test Data Cleanup Utility Safety Review

Inspection of [`backend/scripts/cleanup_test_data.py`](file:///C:/Phising/backend/scripts/cleanup_test_data.py):

| Capability / Check | Implementation Status | Safety Evaluation |
| :--- | :--- | :--- |
| **Default Dry-Run Mode** | `--dry-run` default | **SAFE**: Does not execute deletions without explicit `--confirm`. |
| **Confirmation Flag** | Required `--confirm` | **SAFE**: Clear user warning before transaction execution. |
| **Pre-deletion Backup** | `create_backup()` | **SAFE**: Creates timestamped backup `phishshield_backup_YYYYMMDD_HHMMSS.db`. |
| **Admin Protection** | Admin query filter | **SAFE**: `admin@phishshield.local` cannot be selected for deletion. |
| **Synthetic Detection** | Targeted patterns | **SAFE**: Targets explicit test users, test bank domains, and test scan strings. |

### Critical Finding: Cryptographic Audit Hash-Chain Integrity
* **The Vulnerability of Pruning Audit Logs:**
  In Phase 6C, an immutable cryptographic SHA-256 hash-chain was integrated into `audit_logs`. Each row computes `entry_hash = SHA256(prev_hash | timestamp | actor | action | entity_type | entity_id | details)`.
  If individual test audit rows were purged (`DELETE FROM audit_logs WHERE action LIKE '%TEST%'`), the subsequent valid audit entry's `prev_hash` would point to the deleted record's `entry_hash`, causing `verify_audit_log_chain()` to immediately trigger `TAMPER_DETECTED`.
* **Utility Implementation Alignment:**
  [`cleanup_test_data.py`](file:///C:/Phising/backend/scripts/cleanup_test_data.py) catalogs synthetic audit logs for visibility, but **deliberately does not execute deletions on `audit_logs`**, preserving hash-chain integrity.
* **Operational Recommendation:**
  In enterprise security platforms, audit logs must remain **strictly append-only**. Rather than deleting records, test data purges must append an auditable governance record: `action="DATA_CLEANUP_EXECUTED"`, logging the count of pruned synthetic users and scans without mutating previous hash links.
* **SQLite WAL Consideration:**
  In high-concurrency production deployments using SQLite WAL mode, `shutil.copy2` may miss uncheckpointed WAL frames in `phishshield.db-wal`. The backup utility should execute `sqlite3.Connection.backup()` or `VACUUM INTO` to guarantee consistent point-in-time snapshots.

---

## 5. Secret & Credential Scanning Audit

An automated regex security audit was executed across all 119 tracked Git files, environment templates, and commit diffs.

* **Patterns Audited:** RSA/EC Private Keys, GitHub PATs, AWS Access Keys, Hardcoded JWT Secrets, Database Passwords.
* **Scan Results:** **0 leaked production credentials detected**.
* **Environment Hygiene:**
  * Root [`.env.example`](file:///C:/Phising/.env.example): Sanitized with safe documentation defaults (`SECRET_KEY=change-in-production-min32chars`).
  * Backend [`backend/.env.example`](file:///C:/Phising/backend/.env.example): Sanitized.
  * Frontend [`frontend/.env.example`](file:///C:/Phising/frontend/.env.example): Contains only `VITE_API_BASE_URL=/api`.
  * Real `.env` files and `.db` files are strictly excluded via [`.gitignore`](file:///C:/Phising/.gitignore).

---

## 6. Deployment Platform Feasibility Analysis

PhishShield requires hosting capable of running:
* FastAPI (Uvicorn ASGI)
* PyTorch CPU + EasyOCR neural weights
* Scikit-Learn Random Forest and SHAP
* SQLite persistent storage with WAL journaling
* React SPA served over Nginx or Vite preview

| Platform Tier | Example Providers | Feasibility | Strengths & Trade-offs | Cost Estimate |
| :--- | :--- | :--- | :--- | :--- |
| **Virtual Machine (VM) / VPS** *(Recommended)* | Hetzner Cloud, DigitalOcean Droplet, Linode, AWS EC2 (t3.medium / t4g.medium) | **EXCELLENT (10/10)** | Dedicated 2 vCPU, 4GB RAM, persistent SSD block storage. Zero cold-starts. Complete control over Nginx, SSL certs, and SQLite WAL backups. EasyOCR runs with zero OOM risk. | ~$10 - $24 / month |
| **Managed Container Platform** | Render, Railway, Fly.io | **VIABLE (7/10)** | Requires persistent volume mount for `/app/data` (SQLite) and `/app/models` (EasyOCR cache). **Blocker on Free Tiers**: 512MB free plans will trigger Out-Of-Memory (OOM) during PyTorch OCR model load. Requires minimum 2GB-4GB paid plan. | ~$15 - $25 / month |
| **Serverless Functions** | AWS Lambda, Vercel Functions, Cloudflare Workers | **INCOMPATIBLE (2/10)** | Ephemeral disk resets SQLite on cold start. PyTorch exceeds deployment bundle sizes without container layers. Cold start latency (15-30s) degrades scan responsiveness. | N/A |
| **Static Frontend Host** | Vercel, Cloudflare Pages, Netlify | **EXCELLENT (Frontend Only)** | High performance edge CDN for built `frontend/dist/`. Requires configuring API reverse proxy or CORS to a remote backend server. | Free |

### Recommended Deployment Blueprint:
Deploy the containerized multi-service architecture using [`docker-compose.yml`](file:///C:/Phising/docker-compose.yml) on a single **Ubuntu 24.04 LTS VPS** (2 vCPU, 4GB RAM, 40GB SSD) with Docker Compose, Let's Encrypt Certbot, and a persistent SQLite volume.

---

## 7. Deployment Configuration & Container Review

1. **Backend Dockerfile ([`backend/Dockerfile`](file:///C:/Phising/backend/Dockerfile)):**
   * Multi-stage slim image (`python:3.12-slim`).
   * Non-root user `phishshield` (UID 10001).
   * Persistent directories: `/app/data` and `/app/models`.
   * Built-in container healthcheck: `curl -f http://localhost:8000/api/health`.
   * ASGI execution: Single worker with Python threadpool (`--workers 1`), preventing CPU core oversubscription during OCR.
2. **Frontend Dockerfile & Nginx ([`frontend/Dockerfile`](file:///C:/Phising/frontend/Dockerfile), [`frontend/nginx.conf`](file:///C:/Phising/frontend/nginx.conf)):**
   * Multi-stage build (`node:20-alpine` builder, `nginx:alpine-slim` runner).
   * Client payload limit: `client_max_body_size 10M` (aligned with 5MB scan contract).
   * Reverse proxy: Proxies `/api/` to `backend:8000` with 120s timeout for OCR jobs.
   * Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, and strict CSP.
3. **Docker Compose ([`docker-compose.yml`](file:///C:/Phising/docker-compose.yml)):**
   * Services `backend` and `frontend` linked over isolated bridge network `phishshield-network`.
   * Resource constraints: Backend capped at 3000MB RAM, 2.0 CPUs.
   * Named volumes: `phishshield_backend_data` (SQLite DB) and `phishshield_model_cache` (PyTorch OCR weights).

---

## 8. CI/CD Workflow Preparation

The repository includes a GitHub Actions configuration at [`.github/workflows/ci.yml`](file:///C:/Phising/.github/workflows/ci.yml):
* **Backend Job:**
  * Runs on `ubuntu-latest` with Python 3.12.
  * Caches pip wheels.
  * Runs `pytest tests/ -v` (118 assertions).
* **Frontend Job:**
  * Runs on `ubuntu-latest` with Node 20.
  * Runs `npm ci` and `npm run build`.
* **Container Build Job:**
  * Validates Docker build syntax for backend and frontend images.
* **Status:** Fully prepared. Will activate automatically upon pushing to an authorized remote repository.

---

## 9. Public Demo Safety & Threat Model

Before conducting a public or external demonstration, the following security controls must be acknowledged and enforced:

| Threat Vector | Platform Safeguard | Operational Action Required |
| :--- | :--- | :--- |
| **Default Admin Password** | Configurable via `ADMIN_INITIAL_PASSWORD` | **MANDATORY**: Supply a strong, unique initial password via environment variable prior to first launch. |
| **Public User Registration** | `/api/auth/register` creates Viewer/Analyst accounts | By design, public viewers can test scanning. Administrative capabilities (`/api/admin/*`) are strictly role-gated by JWT verification. |
| **OCR Resource Exhaustion** | Bounded concurrency & queue depth | `MAX_CONCURRENT_OCR=1` and `MAX_OCR_QUEUE_DEPTH=10` prevent server CPU starvation. Excess requests receive HTTP 429 / queue wait. |
| **Malicious File Uploads** | Strict magic-byte header validation | Rejects non-image binaries and disguised executables. Maximum size limited to 5MB in FastAPI and 10MB in Nginx. |
| **Zero-Disk Screenshot Policy** | In-memory processing | Screenshots are never saved to disk; processed purely in RAM as OpenCV numpy arrays and garbage-collected. |
| **SSRF via Webhook Alerts** | IP whitelist & loopback blocking | Outbound webhook dispatcher forbids private IPs (10.x, 192.168.x, 127.x, 169.254.x) and cloud metadata services. |
| **Malicious URL Resolution** | Zero external HTTP requests | PhishShield never connects to, visits, or resolves scanned URLs or extracted OCR links. |

---

## 10. Public Demo Checklist

Prior to presenting PhishShield to external stakeholders:
- [ ] Set a strong `ADMIN_INITIAL_PASSWORD` and `SECRET_KEY` in production `.env`.
- [ ] Ensure `ENVIRONMENT=production` to disable debug tracebacks.
- [ ] Verify `phishshield.db` has undergone test-data cleanup (`cleanup_test_data.py --confirm`).
- [ ] Verify that sample test cases (legitimate SBI/HDFC vs. phishing lure URLs and SMS) are pre-staged for live presentation.
- [ ] Confirm outbound network access allows downloading EasyOCR English weights during initial warm-up, or verify weights are pre-cached in `/app/models/easyocr`.
- [ ] Confirm reverse-proxy SSL/TLS certificate (HTTPS) is active on the presentation domain.
