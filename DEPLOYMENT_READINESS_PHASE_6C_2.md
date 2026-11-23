# PhishShield — Phase 6C.2 Deployment Readiness & Operational Guide

This document provides comprehensive operational guidelines, architectural references, deployment instructions, and failure mitigation procedures for deploying the **PhishShield** cyber-defense platform across local workstations, containerized environments (Docker / Docker Compose), and CI/CD pipelines.

---

## 1. System Requirements & Architecture

PhishShield is engineered as a decoupled, microservices-ready cybersecurity platform featuring a high-performance FastAPI Python backend and a React/TypeScript Vite frontend served via Nginx.

### Hardware & Resource Allocation
- **CPU**: Minimum 2 cores (Recommended: 4+ cores for concurrent ML feature extraction and CPU OCR inference).
- **RAM**: Minimum 4.0 GB (Recommended: 6.0 GB+; EasyOCR neural weights require ~1.2 GB peak RAM during inference).
- **Storage**: Minimum 5.0 GB free disk space (includes container base images, PyTorch runtime, and pre-trained model weights).

### Software & Toolchain Compatibility
- **Host OS**: Linux (Ubuntu 22.04 LTS / Debian 12), Windows 10/11 with WSL2, or macOS (Apple Silicon / Intel).
- **Python Runtime**: Python 3.12 (standard CPython).
- **Node.js Runtime**: Node.js 20.x or 22.x LTS (tested up to Node 24), npm 10.x+.
- **Container Engine**: Docker Engine 24.0+ and Docker Compose v2.20+.

---

## 2. Environment Variables & Configuration Reference

PhishShield enforces zero-trust defaults. Production instances **must** configure appropriate environment variables to override development fallbacks.

| Variable Name | Default / Example | Purpose / Security Guardrail |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Set to `production` in staging/live environments. Disables default admin bootstrap passwords. |
| `PROJECT_NAME` | `PhishShield` | Application brand name used in logs, OpenAPI documentation, and dossiers. |
| `SECRET_KEY` | *(Must be 32+ chars)* | Cryptographic HMAC-SHA256 signing key for JWT session tokens. Weak secrets trigger runtime rejection in production. |
| `ADMIN_INITIAL_PASSWORD` | *(Strong Password)* | Initial bootstrap password for `admin` user. Must be >= 12 chars in production. |
| `DATABASE_URL` | `sqlite:////app/data/phishshield.db` | SQLAlchemy connection URI. Default maps to persistent volume in `/app/data`. |
| `PBKDF2_ITERATIONS` | `600000` | Password hashing workload iterations (OWASP recommendation). Legacy 100k hashes are auto-upgraded upon login. |
| `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` | `5` | Maximum failed login attempts allowed per IP within the observation window before HTTP 429 throttling. |
| `LOGIN_RATE_LIMIT_WINDOW_SECONDS`| `300` | Sliding window duration in seconds (5 minutes) for IP-based brute-force defense. |
| `MAX_CONCURRENT_OCR` | `1` | Semaphore bounding simultaneous CPU OCR inference jobs to prevent OOM termination. |
| `MAX_OCR_QUEUE_DEPTH` | `10` | Maximum asynchronous screenshot scan jobs allowed in waiting state before rejecting new submissions. |
| `OCR_TIMEOUT_SECONDS` | `120` | Bounded execution deadline for single OCR inference jobs before graceful timeout cancellation. |
| `CORS_ORIGINS` | `http://localhost,http://localhost:80` | Comma-separated list of permitted browser origins for Cross-Origin Resource Sharing. |
| `EASYOCR_MODULE_PATH` | `/app/models/easyocr` | Directory path caching downloaded CRAFT & recognition neural model weights. |
| `TORCH_HOME` | `/app/models/torch` | PyTorch neural model hub and weight cache. |

---

## 3. Local Workstation Development Setup

For local manual testing, security auditing, and offline development without Docker:

### Backend Setup (PowerShell / Bash)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# 3. Install core dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Launch local ASGI server
python run.py
# Server binds to http://127.0.0.1:8000 (OpenAPI docs at http://127.0.0.1:8000/docs)
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install deterministic dependencies
npm ci

# 3. Start local Vite development server
npm run dev
# Frontend binds to http://localhost:5173
```

---

## 4. Production Container Deployment (Docker Compose)

PhishShield utilizes a zero-trust multi-container architecture consisting of:
1. `phishshield-backend`: Hardened Python 3.12-slim container running as non-root user `phishshield` (UID 10001).
2. `phishshield-frontend`: Multi-stage built Alpine Nginx container acting as SPA web server and secure reverse proxy.

### Container Lifecycle Commands
```bash
# 1. Create production environment file
cp .env.example .env
# Edit .env to set a unique SECRET_KEY and ADMIN_INITIAL_PASSWORD

# 2. Build container images deterministically
docker compose build --no-cache

# 3. Launch stack in detached mode
docker compose up -d

# 4. Monitor operational startup logs
docker compose logs -f

# 5. Verify service healthcheck status
docker compose ps
```

### Expected Service Status
```text
NAME                   IMAGE                  COMMAND                  SERVICE    STATUS
phishshield-backend    phishshield-backend    "uvicorn app.main:ap…"   backend    Up (healthy)
phishshield-frontend   phishshield-frontend   "nginx -g 'daemon of…"   frontend   Up (healthy)
```

---

## 5. Storage & Persistence Architecture

PhishShield separates ephemeral state from permanent forensic audit records:

### 1. SQLite Database Volume (`phishshield_backend_data`)
- **Mount Point**: `/app/data/phishshield.db`
- **Contents**: User credentials, RBAC roles, persistent scan history (`scan_records`), approved banking registry (`managed_bank_registry`), outbound webhook subscriptions (`webhook_endpoints`), and cryptographic audit logs (`audit_logs`).
- **Data Protection**: Survives container restarts, image upgrades, and deployments. The database automatically executes schema verification on startup (e.g. adding `prev_hash` and `entry_hash` columns if absent).

### 2. Neural Model Cache Volume (`phishshield_model_cache`)
- **Mount Point**: `/app/models`
- **Contents**: EasyOCR detector (`craft_mlt_25k.pth`) and recognizer weights (`latin_g2.pth`), avoiding redundant remote model downloads across container lifecycles.

### 3. Ephemeral In-Memory Buffers
- **Screenshot Ingestion**: Decoded strictly in memory via OpenCV buffers (`np.frombuffer`). **Zero raw screenshots or biometric data are ever written to disk.** Decoded bytearrays are purged immediately post-inference.
- **Asynchronous OCR Job Queue**: Managed via `ocr_controller` in memory. If a container crashes, in-flight jobs terminate gracefully; completed records remain permanently stored in SQLite.

---

## 6. Security Hardening & Zero-Trust Architecture

PhishShield includes rigorous security defenses designed to meet enterprise standards:

### 1. PBKDF2-SHA256 Password Hashing with Transparent Upgrade
- Workload: 600,000 iterations (OWASP recommended benchmark).
- Backward Compatibility: Accurately verifies legacy 100,000-iteration hashes and transparently upgrades them to 600,000 iterations upon successful login.
- Timing Pad: Non-existent usernames execute a constant-time `dummy_verify_password` calculation to neutralize timing enumeration side-channels.

### 2. Tamper-Evident SHA-256 Audit Log Hash-Chaining
- Each administrative security event records `prev_hash` and `entry_hash`:
  $$\text{entry\_hash} = \text{SHA-256}(\text{prev\_hash} \parallel \text{timestamp} \parallel \text{actor} \parallel \text{action} \parallel \text{entity\_type} \parallel \text{entity\_id} \parallel \text{payload})$$
- The entire chain can be audited at any time via `verify_audit_log_chain()`. Any database row alteration or tampering breaks the cryptographic link and flags `TAMPER_DETECTED`.

### 3. Comprehensive Server-Side Request Forgery (SSRF) Defense
- All outbound webhooks must use strictly `https://` on approved ports (`443`, `8443`).
- Hostnames are resolved through DNS and checked against multi-vector IP restrictions:
  - IPv4 Loopback (`127.0.0.0/8`)
  - IPv6 Loopback (`::1`)
  - IPv4-Mapped IPv6 (`::ffff:127.0.0.1`)
  - RFC 1918 Private Ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Carrier-Grade NAT (`100.64.0.0/10`)
  - Link-Local & Cloud Metadata (`169.254.0.0/16`, `fe80::/10`)
  - HTTP redirects are disallowed (`follow_redirects=False`) to prevent open-redirect SSRF bypasses.

### 4. Zero-Trust URL Defanging & ReportLab XML Escaping
- All malicious indicators in forensic threat dossiers (JSON & PDF) are defanged (`hxxp://`, `[.]`).
- User-supplied inputs rendered in PDF reports are filtered through `html.escape()` to prevent XML parser entity injection and denial-of-service vulnerabilities.

---

## 7. CI/CD Pipeline Verification (`.github/workflows/ci.yml`)

The repository includes an automated GitHub Actions CI pipeline running on every commit and pull request:

1. **Job 1: `backend-tests`**:
   - Environment: Ubuntu Latest, Python 3.12.
   - Installs system packages: `libgl1`, `libglib2.0-0`, `libgomp1`.
   - Caches EasyOCR neural model weights.
   - Executes full Pytest test suite (`python -m pytest tests/ -v`).
2. **Job 2: `frontend-build`**:
   - Environment: Ubuntu Latest, Node.js 20.
   - Deterministic installation (`npm ci`).
   - Runs production Vite build (`npm run build`).
   - Asserts integrity of `frontend/dist/index.html` and code-split asset chunks.
3. **Job 3: `docker-lint`**:
   - Validates `docker-compose.yml` via `docker compose config`.
   - Builds both `phishshield-frontend:ci` and `phishshield-backend:ci` container images.

---

## 8. Operational Troubleshooting & Failure Recovery

### Problem 1: Backend Container Healthcheck Failure (`unhealthy`)
- **Symptom**: `docker compose ps` shows `phishshield-backend` as `(unhealthy)`.
- **Diagnosis**: Verify if the backend binds to `0.0.0.0:8000` and responds to `http://localhost:8000/api/health`.
- **Check Logs**:
  ```bash
  docker compose logs backend --tail 100
  ```
- **Resolution**: Check SQLite permissions in `/app/data` and verify whether the container ran out of memory downloading OCR weights.

### Problem 2: Out-Of-Memory (OOM) During Screenshot OCR Inference
- **Symptom**: Container process exits with code 137 during OCR scan.
- **Root Cause**: PyTorch neural inference exceeded Docker memory limits.
- **Resolution**: Increase Docker memory limit in `docker-compose.yml` under `deploy.resources.limits.memory` from `3000M` to `4096M`. Concurrency is bounded by `MAX_CONCURRENT_OCR=1`.

### Problem 3: Administrator Locked Out by Rate Limiter
- **Symptom**: HTTP 429 Too Many Requests returned on `/api/v1/auth/login`.
- **Root Cause**: 5 failed login attempts occurred within 300 seconds.
- **Resolution**: Wait 5 minutes for the sliding window to elapse, or restart the backend container (rate limiter state is stored in-memory).

---

## 9. Operational Boundaries & Scaling Considerations

1. **Database Concurrency**: PhishShield utilizes SQLite in Write-Ahead Logging (WAL) mode. Suitable for low-to-medium enterprise workloads (up to 1,000 scans/day). For massive multi-analyst concurrency, configure `DATABASE_URL` to point to a high-availability PostgreSQL cluster.
2. **OCR Concurrency**: EasyOCR runs in CPU mode with single-worker bounded threading (`MAX_CONCURRENT_OCR=1`). In high-volume environments, offload OCR processing to a dedicated GPU worker pool (e.g. Celery + Redis).
3. **Rate Limiting Persistence**: The sliding-window rate limiter resides in-memory. For horizontal multi-container scaling behind a load balancer, migrate rate limiting to Redis.
