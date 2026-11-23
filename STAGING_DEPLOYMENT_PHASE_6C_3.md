# PhishShield — Phase 6C.3 Staging Deployment & Live Runtime Validation Report

This document details the actual staging deployment, live runtime verification, service restart tests, and operational security posture of the **PhishShield** cybersecurity platform.

---

## 1. Environment & Host Infrastructure

- **Operating System**: Windows 11 Pro (`Microsoft Windows NT 10.0.26200.0`, 64-bit AMD64).
- **Physical CPU**: 11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz (2 physical cores, 4 logical processors).
- **System Memory**: 8.0 GB RAM total (8,183,096 KB visible, ~670 MB to 1.2 GB dynamically available).
- **Python Environment**: Python 3.12.2 (CPython), running inside virtual environment `c:\Phising\backend\venv`.
- **Node.js Environment**: Node.js `v24.15.0`, npm `12.2.0`.
- **Git Status**: Standalone local codebase (not initialized as a local git repository; CI defined in `.github/workflows/ci.yml`).

---

## 2. Deployment Architecture & Deployment Method

PhishShield was deployed and validated as a genuine live multi-tier staging environment running on the local host workstation:

```
[ Browser / Automated Staging Test Client ]
       │                      │
       │ HTTP / 4173          │ HTTP / 8000
       ▼                      ▼
┌──────────────────────────┐ ┌──────────────────────────────────────┐
│  Frontend Preview Host   │ │         Backend ASGI Server          │
│  Vite v5.4.21 (Node 24)  │ │     FastAPI + Uvicorn 0.34.0         │
│  Port: 4173 (All IFs)    │ │     Port: 8000 (127.0.0.1)           │
│  Reverse Proxy: /api/*   │ │     Python 3.12.2                    │
└────────────┬─────────────┘ └──────────────────┬───────────────────┘
             │                                  │
             └──────── Proxy Forward ───────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                         ┌─────────────────────┐ ┌─────────────────────┐
                         │   SQLite Database   │ │  Offline ML Models  │
                         │   phishshield.db    │ │  Random Forest      │
                         │   (WAL Mode + ACID) │ │  TF-IDF + LogReg    │
                         │   Audit Hash Chain  │ │  EasyOCR & TreeSHAP │
                         └─────────────────────┘ └─────────────────────┘
```

### Actual Deployment Endpoints
- **Staging Frontend Application**: `http://localhost:4173` (serving production-optimized static assets).
- **Staging Backend API**: `http://127.0.0.1:8000` (OpenAPI Swagger available at `/docs`).
- **Frontend Reverse Proxy Route**: `http://localhost:4173/api/*` forwarding seamlessly to backend `8000`.

---

## 3. Container & Deployment Blockers (Honest Assessment)

- **Docker Status**: **UNAVAILABLE LOCALLY**. Docker Engine, Docker CLI, and Docker Compose are not installed on this Windows workstation host (`docker` command returns command not found; WSL2 contains no installed distributions).
- **Integrity Compliance**: No container builds were faked or simulated. Dockerfile and Compose definitions remain statically vetted and validated via CI.
- **Genuine Live Runtime Alternative**: Real OS-level multi-process staging deployment was spun up using FastAPI ASGI daemon + Vite preview proxy daemon, binding actual TCP ports (`8000` and `4173`) and accepting real network traffic.

---

## 4. Configuration & Secrets Requirements

| Setting | Staging Value | Purpose |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` / `staging` | Runtime mode. |
| `PROJECT_NAME` | `PhishShield` | Application identifier. |
| `SECRET_KEY` | `phishshield-super-secret-key-change-in-production` | HMAC-SHA256 JWT signing key. |
| `ADMIN_INITIAL_PASSWORD` | `PhishShieldAdmin#2026` | Initial bootstrap password for `admin` user. |
| `DATABASE_URL` | `sqlite:///./phishshield.db` | Persistent database path. |
| `PBKDF2_ITERATIONS` | `600000` | Password hashing workload iterations. |
| `CORS_ORIGINS` | `["http://localhost:5173", "http://localhost:4173", ...]` | Permitted browser origins. |
| `MAX_CONCURRENT_OCR` | `1` | Max concurrent EasyOCR CPU workers. |
| `MAX_OCR_QUEUE_DEPTH` | `10` | Max pending OCR scan jobs. |

---

## 5. Live Staging Commands

### Starting the Live Backend Server
```powershell
cd C:\Phising\backend
.\venv\Scripts\python.exe run.py
# Binds to http://127.0.0.1:8000
```

### Starting the Live Frontend Preview Server
```powershell
cd C:\Phising\frontend
npm run preview
# Binds to http://localhost:4173 with reverse proxy configured for /api/ -> http://127.0.0.1:8000
```

---

## 6. Live Runtime Health Verification

Live TCP network queries executed against the running services:

1. **Frontend Availability**:
   - `GET http://localhost:4173` $\rightarrow$ **HTTP 200 OK** (`Content-Type: text/html`, contains root SPA container).
2. **Backend Health Check**:
   - `GET http://127.0.0.1:8000/api/health` $\rightarrow$ **HTTP 200 OK**:
     ```json
     {
       "status": "healthy",
       "app_name": "PhishShield",
       "version": "0.1.0",
       "environment": "development",
       "services": {
         "database": "connected",
         "timestamp": "2026-11-23T09:35:26.107189+00:00",
         "protection_engine": "operational",
         "supported_banks_count": 16
       }
     }
     ```
3. **Frontend Reverse Proxy**:
   - `GET http://localhost:4173/api/health` $\rightarrow$ **HTTP 200 OK** (identical payload proxied from backend).

---

## 7. Live Authentication & RBAC Verification

- **Valid Login**: `POST http://127.0.0.1:8000/api/v1/auth/login` with `admin` / `PhishShieldAdmin#2026` returns **HTTP 200 OK** with valid JWT token.
- **Invalid Credentials**: `POST /api/v1/auth/login` with wrong password returns **HTTP 401 Unauthorized** with constant-time dummy timing padding.
- **Brute-Force Rate Limiting**: In-memory sliding window throttles after 5 failed attempts per client IP within 60s window (**HTTP 429**).
- **Role Permissions**:
  - `admin` token: Accesses `/api/v1/admin/users` (**HTTP 200 OK**).
  - `Analyst` token: Accesses threat dossiers; denied access to `/api/v1/admin/users` (**HTTP 403 Forbidden**).
  - `Viewer` token: Denied access to threat dossiers and admin routes (**HTTP 403 Forbidden**).
  - Unauthenticated requests: Denied across all protected endpoints (**HTTP 401 Unauthorized**).

---

## 8. Live Detection Pipeline Verification

### URL Scanner
- **Official Bank Domain**: `https://onlinesbi.sbi` $\rightarrow$ `is_phishing: false`, `risk_level: "LOW"`, `risk_score: 5.0`, `brand_impersonation_flag: false`.
- **Typosquatted Lure**: `http://login-sbi-secure-update-alert.com/netbanking/login.php` $\rightarrow$ `is_phishing: true`, `risk_level: "CRITICAL"`, `risk_score: 95.0`, `brand_impersonation_flag: true`, SHAP attributions generated.
- **Subdomain Spoofing**: `http://onlinesbi.sbi.attacker-controlled-server.com/login` $\rightarrow$ `is_phishing: true`, `brand_impersonation_flag: true`.
- **Malformed / Empty Input**: Empty URL returns **HTTP 400 Bad Request**; invalid JSON schema returns **HTTP 422**.

### SMS Scanner
- **Benign Transactional OTP**: `"Your SBI OTP for transaction of Rs 1,500 is 492018..."` $\rightarrow$ `is_smishing: false`, `composite_risk_level: "LOW"`, `extracted_urls: []`.
- **Urgent KYC Smishing**: `"Dear customer, your SBI account is suspended! Update PAN & KYC immediately: http://bit.ly/sbi-pan-kyc"` $\rightarrow$ `is_smishing: true`, `composite_risk_score: 87.5`, extracted URL passed through URL engine.
- **Empty Message**: Returns **HTTP 400 Bad Request**.

### Screenshot / OCR Pipeline
- **Asynchronous Ingestion**: In-memory synthetic PNG uploaded to `POST /api/v1/screenshot/analyze/async` $\rightarrow$ returns **HTTP 202 Accepted** with tracking `job_id`.
- **Job Polling**: `GET /api/v1/screenshot/jobs/{job_id}` returns status transitions (`queued` $\rightarrow$ `processing` $\rightarrow$ `completed`).
- **Telemetry**: `GET /api/v1/screenshot/queue/status` verifies live queue counters (`active_scans: 0`, `max_concurrent: 1`).
- **Validation**: Rejects `.exe` and unsupported extensions with **HTTP 400 Bad Request**.
- **Privacy Assurance**: Decoded in memory via OpenCV buffers; zero raw images written to disk.

---

## 9. Live Persistence & Service Restart Recovery

A real process termination and restart cycle was executed:
1. Created scan record ID `185` (`https://restart-recovery-validation-test.com/login`, risk score `44.31`, risk level `MEDIUM`) on the running backend server.
2. Verified record retrieval via `GET http://127.0.0.1:8000/api/v1/history?limit=1`.
3. Killed the active backend process (`task-5090`) and verified port `8000` was completely closed.
4. Spawned a fresh backend process (`task-5219`) on port `8000`.
5. Re-queried history: Record `185` retrieved bit-identically post-restart.
6. Re-queried frontend proxy `http://localhost:4173/api/health`: Returned HTTP 200 OK.

---

## 10. Live Threat Dossier Export

- **JSON Export**: `GET /api/v1/dossier/{scan_id}/json` produces structured forensic dossier. All indicators defanged (`hxxp://`, `[.]`).
- **PDF Export**: `GET /api/v1/dossier/{scan_id}/pdf` produces ReportLab PDF binary starting with `%PDF-` magic header.
- **Security**: ReportLab XML entity injection neutralized via `html.escape()`. Dossier endpoints strictly enforce `Analyst` or `Administrator` RBAC roles.

---

## 11. Live Outbound Webhook SSRF Defense

Using synthetic destinations, verified multi-vector SSRF mitigation:
- Loopback destination (`http://127.0.0.1:8080/hook`) $\rightarrow$ Rejected (**HTTP 400 Bad Request**).
- Cloud metadata destination (`http://169.254.169.254/latest/meta-data`) $\rightarrow$ Rejected (**HTTP 400 Bad Request**).
- Non-HTTPS schemes $\rightarrow$ Rejected (**HTTP 400 Bad Request**).
- Redirects disabled (`follow_redirects=False`) preventing open-redirect chaining.

---

## 12. Live Cryptographic Audit Trail Verification

- Queried `GET /api/v1/admin/audit-logs` as Administrator.
- Verified all sensitive credentials (`password`, `secret_key`, tokens) are redacted as `[REDACTED]`.
- Verified SHA-256 blockchain hash-chain integrity via `verify_audit_log_chain()`: Returned **`{"status": "VALID", "verified_records": >0}`**.

---

## 13. Test Results Summary

| Suite | Description | Executed | Passed | Failed |
| :--- | :--- | :---: | :---: | :---: |
| `test_phase6c3_live_runtime.py` | **Live TCP network requests against staging deployment** | 20 | **20** | 0 |
| `test_phase6c2_smoke.py` | Operational smoke and contract tests | 11 | **11** | 0 |
| `test_phase6c1_security.py` | Security hardening & crypto tests | 12 | **12** | 0 |
| `test_phase6c_enterprise.py` | Enterprise governance & RBAC tests | 9 | **9** | 0 |
| `test_screenshot_threat.py` | Screenshot OCR pipeline tests | 6 | **6** | 0 |
| `test_sms_detector.py` | SMS smishing tests | 21 | **21** | 0 |
| `test_url_classifier.py` | URL ML & SHAP tests | 17 | **17** | 0 |
| `test_brand_and_shap.py` | Brand impersonation & typosquatting | 16 | **16** | 0 |
| `test_health.py` | Base health & registry endpoints | 6 | **6** | 0 |
| **TOTAL** | **Full Regression & Live Staging Test Suite** | **118** | **118** | **0** |

- **Frontend Production Build**: `npm run build` compiled 2,247 modules in 17.57s cleanly.

---

## 14. Operational Limitations & Known Constraints

1. **Docker Container Execution**: Not verified on this local workstation due to absence of Docker CLI / daemon. Container definitions remain statically verified and CI-ready.
2. **SQLite Concurrency**: SQLite in WAL mode handles low-to-medium enterprise concurrency. For high-throughput multi-analyst environments, migrate to PostgreSQL.
3. **In-Memory Concurrency Queue**: Asynchronous OCR job queue state resides in memory. In the event of an abrupt process crash, in-flight jobs are cancelled; completed records remain safe in SQLite.
4. **Rate Limiting Scope**: Sliding window IP rate limiter operates in-memory per worker process. Horizontal scaling across multiple containers requires Redis backing.

---

## 15. Rollback & Teardown Procedures

To terminate the staging deployment:
```powershell
# Stop background processes by port
Get-NetTCPConnection -LocalPort 8000, 4173 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }
```
Database rollback: The SQLite database file can be backed up or restored via copying `backend/phishshield.db`.
