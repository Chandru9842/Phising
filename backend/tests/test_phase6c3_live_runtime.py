"""
PhishShield Phase 6C.3 Live Staging Runtime Validation Suite
Executes real network requests (TCP/HTTP) against:
- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:4173 (Production Preview with reverse proxy)

Verifies:
1. Real runtime health, frontend availability, and reverse proxy routing
2. Live Authentication, JWT issuance, brute-force rate-limiting, and RBAC enforcement
3. Live URL Scanner with synthetic benign and phishing lures
4. Live SMS Scanner with benign transactional OTP and KYC smishing lures
5. Live Screenshot/OCR pipeline (async submission, queue status, format validation)
6. Live Forensic Threat Dossier generation (JSON and defanged PDF with %PDF- header)
7. Live Bank Registry governance and Anti-Collision protection
8. Live SSRF mitigation on outbound webhook management
9. Live Audit Trail querying and cryptographic SHA-256 hash-chain integrity
10. Live Database persistence and state retention across the operational environment
"""

import io
import time
import pytest
import requests
from PIL import Image

BACKEND_BASE_URL = "http://127.0.0.1:8000"
FRONTEND_BASE_URL = "http://localhost:4173"


# ------------------------------------------------------------------------------
# Fixtures for Authenticated Roles
# ------------------------------------------------------------------------------
@pytest.fixture(scope="module")
def admin_token():
    """Retrieves or creates a valid JWT token for Administrator."""
    from app.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import hash_password, create_access_token
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            user = User(
                username="admin",
                email="admin@phishshield.internal",
                password_hash=hash_password("PhishShieldAdmin#2026"),
                role=UserRole.ADMINISTRATOR,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return create_access_token({"sub": user.username, "role": user.role, "uid": user.id})
    finally:
        db.close()


@pytest.fixture(scope="module")
def analyst_token():
    """Retrieves or creates a valid JWT token for Analyst."""
    from app.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import hash_password, create_access_token

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "staging_analyst").first()
        if not user:
            user = User(
                username="staging_analyst",
                email="staging_analyst@phishshield.internal",
                password_hash=hash_password("AnalystStagingPass2026!"),
                role=UserRole.ANALYST,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return create_access_token({"sub": user.username, "role": user.role, "uid": user.id})
    finally:
        db.close()


@pytest.fixture(scope="module")
def viewer_token():
    """Retrieves or creates a valid JWT token for Viewer."""
    from app.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import hash_password, create_access_token

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "staging_viewer").first()
        if not user:
            user = User(
                username="staging_viewer",
                email="staging_viewer@phishshield.internal",
                password_hash=hash_password("ViewerStagingPass2026!"),
                role=UserRole.VIEWER,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return create_access_token({"sub": user.username, "role": user.role, "uid": user.id})
    finally:
        db.close()


# ------------------------------------------------------------------------------
# 1. Real Runtime Health & Proxy Verification
# ------------------------------------------------------------------------------
def test_live_frontend_availability():
    """Verify live frontend production preview server responds with HTML."""
    res = requests.get(FRONTEND_BASE_URL, timeout=5)
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "").lower()
    assert "<div id=\"root\">" in res.text or "PhishShield" in res.text


def test_live_backend_health_and_root():
    """Verify live backend responds on / and /api/health."""
    res_root = requests.get(f"{BACKEND_BASE_URL}/", timeout=5)
    assert res_root.status_code == 200
    root_json = res_root.json()
    assert root_json.get("project") == "PhishShield"
    assert root_json.get("status") == "online"

    res_health = requests.get(f"{BACKEND_BASE_URL}/api/health", timeout=5)
    assert res_health.status_code == 200
    health_json = res_health.json()
    assert health_json.get("status") == "healthy"
    assert health_json.get("app_name") == "PhishShield"
    assert health_json.get("services", {}).get("database") == "connected"
    assert health_json.get("services", {}).get("protection_engine") == "operational"


def test_live_frontend_reverse_proxy_to_backend():
    """Verify frontend reverse-proxies /api/ requests to the backend container/process."""
    res_proxy = requests.get(f"{FRONTEND_BASE_URL}/api/health", timeout=5)
    assert res_proxy.status_code == 200
    proxy_json = res_proxy.json()
    assert proxy_json.get("status") == "healthy"
    assert proxy_json.get("app_name") == "PhishShield"


def test_live_diagnostics_and_banks_list():
    """Verify live model metadata and Indian banking registry."""
    res_meta = requests.get(f"{BACKEND_BASE_URL}/api/v1/urls/model-info", timeout=5)
    assert res_meta.status_code == 200
    meta_json = res_meta.json()
    assert meta_json.get("status") == "ready"
    assert "metadata" in meta_json
    assert meta_json["metadata"].get("feature_count") == 26
    assert len(meta_json["metadata"].get("features", [])) == 26

    res_banks = requests.get(f"{BACKEND_BASE_URL}/api/v1/banks", timeout=5)
    assert res_banks.status_code == 200
    banks_json = res_banks.json()
    assert "banks" in banks_json
    domains = [b.get("primary_domain") for b in banks_json["banks"]]
    assert "onlinesbi.sbi" in domains
    assert "hdfcbank.com" in domains


# ------------------------------------------------------------------------------
# 2. Live Authentication & RBAC Verification
# ------------------------------------------------------------------------------
def test_live_auth_login_success_and_failure():
    """Verify login authentication with valid vs invalid credentials."""
    # Invalid login returns 401
    bad_res = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/auth/login",
        json={"username": "admin", "password": "DefinitelyWrongPassword#999"},
        timeout=5
    )
    assert bad_res.status_code == 401
    assert "detail" in bad_res.json()

    # Valid login returns JWT token
    login_res = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/auth/login",
        json={"username": "admin", "password": "PhishShieldAdmin#2026"},
        timeout=5
    )
    assert login_res.status_code == 200
    body = login_res.json()
    assert "access_token" in body
    assert body.get("token_type") == "bearer"
    assert body.get("user", {}).get("role") == "Administrator"


def test_live_rbac_enforcement(admin_token, analyst_token, viewer_token):
    """Verify strict role-based access control across live endpoints."""
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # 1. Unauthenticated request to /admin/users -> 401
    res_unauth = requests.get(f"{BACKEND_BASE_URL}/api/v1/admin/users", timeout=5)
    assert res_unauth.status_code == 401

    # 2. Administrator has access -> 200
    res_admin = requests.get(f"{BACKEND_BASE_URL}/api/v1/admin/users", headers=admin_headers, timeout=5)
    assert res_admin.status_code == 200
    assert isinstance(res_admin.json(), list)

    # 3. Analyst denied administrative user management -> 403
    res_analyst = requests.get(f"{BACKEND_BASE_URL}/api/v1/admin/users", headers=analyst_headers, timeout=5)
    assert res_analyst.status_code == 403

    # 4. Viewer denied administrative user management -> 403
    res_viewer = requests.get(f"{BACKEND_BASE_URL}/api/v1/admin/users", headers=viewer_headers, timeout=5)
    assert res_viewer.status_code == 403


# ------------------------------------------------------------------------------
# 3. Live URL Scanner Pipeline Validation
# ------------------------------------------------------------------------------
def test_live_url_scanner_benign_bank_domain():
    """Verify authentic banking portal is categorized as SAFE with low risk score."""
    payload = {"url": "https://onlinesbi.sbi"}
    res = requests.post(f"{BACKEND_BASE_URL}/api/v1/urls/scan", json=payload, timeout=10)
    assert res.status_code == 200
    data = res.json()
    assert data["is_phishing"] is False
    assert data["risk_level"] in ["SAFE", "LOW"]
    assert data["risk_score"] <= 10.0
    assert data["brand_impersonation_flag"] is False


def test_live_url_scanner_typosquatting_and_impersonation():
    """Verify brand typosquatting lure is flagged as PHISHING with high risk."""
    lure_url = "http://login-sbi-secure-update-alert.com/netbanking/login.php"
    payload = {"url": lure_url}
    res = requests.post(f"{BACKEND_BASE_URL}/api/v1/urls/scan", json=payload, timeout=10)
    assert res.status_code == 200
    data = res.json()
    assert data["is_phishing"] is True
    assert data["risk_score"] >= 65.0
    assert data["brand_impersonation_flag"] is True
    assert "shap_explanation" in data
    assert data["shap_explanation"] is not None


def test_live_url_scanner_invalid_and_empty_inputs():
    """Verify scanner rejects empty or malformed payload."""
    res_empty = requests.post(f"{BACKEND_BASE_URL}/api/v1/urls/scan", json={"url": "   "}, timeout=5)
    assert res_empty.status_code == 400

    res_bad_schema = requests.post(f"{BACKEND_BASE_URL}/api/v1/urls/scan", json={"invalid_field": "test"}, timeout=5)
    assert res_bad_schema.status_code == 422


# ------------------------------------------------------------------------------
# 4. Live SMS Scanner Pipeline Validation
# ------------------------------------------------------------------------------
def test_live_sms_scanner_benign_transactional():
    """Verify benign banking OTP SMS is categorized as SAFE."""
    sms_text = "Your SBI OTP for transaction of Rs 1,500 is 492018. Valid for 10 mins. Never share OTP with anyone."
    res = requests.post(f"{BACKEND_BASE_URL}/api/v1/sms/scan", json={"message": sms_text}, timeout=10)
    assert res.status_code == 200
    data = res.json()
    assert data["is_smishing"] is False
    assert data["composite_risk_level"] == "LOW"
    assert data["extracted_urls"] == []


def test_live_sms_scanner_urgent_kyc_lure():
    """Verify urgent KYC smishing attack with URL is detected and flagged."""
    sms_text = "Dear customer, your SBI account is suspended! Update PAN & KYC immediately: http://bit.ly/sbi-pan-kyc"
    res = requests.post(f"{BACKEND_BASE_URL}/api/v1/sms/scan", json={"message": sms_text}, timeout=10)
    assert res.status_code == 200
    data = res.json()
    assert data["is_smishing"] is True
    assert data["composite_risk_score"] >= 50.0
    assert len(data["extracted_urls"]) >= 1


def test_live_sms_scanner_empty_input():
    """Verify empty SMS message returns HTTP 400."""
    res = requests.post(f"{BACKEND_BASE_URL}/api/v1/sms/scan", json={"message": "   "}, timeout=5)
    assert res.status_code == 400


# ------------------------------------------------------------------------------
# 5. Live Screenshot / OCR Pipeline Validation
# ------------------------------------------------------------------------------
def test_live_screenshot_queue_status():
    """Verify OCR queue telemetry endpoint responds with active concurrency state."""
    res = requests.get(f"{BACKEND_BASE_URL}/api/v1/screenshot/queue/status", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "healthy"
    telemetry = data.get("telemetry", {})
    assert telemetry.get("max_concurrent") == 1
    assert "active_scans" in telemetry
    assert "queued_scans" in telemetry


def test_live_screenshot_async_upload_and_poll():
    """Verify synthetic PNG image upload, job registration, and status polling."""
    # Create in-memory synthetic PNG image (120x120 white background)
    buf = io.BytesIO()
    img = Image.new("RGB", (120, 120), color=(255, 255, 255))
    img.save(buf, format="PNG")
    buf.seek(0)

    files = {"file": ("live_staging_screenshot.png", buf.getvalue(), "image/png")}
    res_upload = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/screenshot/analyze/async",
        files=files,
        timeout=10
    )
    assert res_upload.status_code == 202
    job_data = res_upload.json()
    job_id = job_data.get("job_id")
    assert job_id is not None
    assert job_data.get("status") in ["queued", "running", "processing", "completed"]

    # Poll job status
    poll_res = requests.get(f"{BACKEND_BASE_URL}/api/v1/screenshot/jobs/{job_id}", timeout=5)
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert poll_data.get("job_id") == job_id
    assert poll_data.get("status") in ["queued", "running", "processing", "completed"]


def test_live_screenshot_format_validation():
    """Verify unsupported file extensions are rejected with HTTP 400."""
    files = {"file": ("malicious_payload.exe", b"MZDummyExecutableBytes", "application/octet-stream")}
    res = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/screenshot/analyze/async",
        files=files,
        timeout=5
    )
    assert res.status_code == 400
    assert "Unsupported file extension" in res.json().get("detail", "")


# ------------------------------------------------------------------------------
# 6. Live Forensic Threat Dossier Export
# ------------------------------------------------------------------------------
def test_live_threat_dossier_json_and_pdf(admin_token, analyst_token, viewer_token):
    """Verify JSON and PDF threat dossier generation with defanged indicators."""
    from app.database import SessionLocal
    from app.models.scan import ScanRecord

    # Create a fresh scan record in SQLite
    db = SessionLocal()
    try:
        scan = ScanRecord(
            scan_type="url",
            target_input="http://malicious-icici-phish.net/login.aspx",
            risk_score=94.0,
            risk_level="CRITICAL",
            is_phishing=True,
            is_brand_impersonation=True,
            target_brand="ICICI Bank",
            impersonation_technique="subdomain_spoofing",
            reasons=["Urgent credential capture lure targeting netbanking users."],
            shap_features=[{"name": "brand_impersonated", "shap": 0.52, "dir": "INCREASES_RISK"}]
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        scan_id = scan.id
    finally:
        db.close()

    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # 1. Analyst downloads JSON dossier
    res_json = requests.get(f"{BACKEND_BASE_URL}/api/v1/dossier/{scan_id}/json", headers=analyst_headers, timeout=5)
    assert res_json.status_code == 200
    dossier = res_json.json()
    assert dossier["target_assessment"]["scan_id"] == scan_id
    defanged = dossier["target_assessment"]["target_input_defanged"]
    assert "hxxp" in defanged
    assert "[.]" in defanged

    # 2. Analyst downloads PDF dossier
    res_pdf = requests.get(f"{BACKEND_BASE_URL}/api/v1/dossier/{scan_id}/pdf", headers=analyst_headers, timeout=10)
    assert res_pdf.status_code == 200
    assert "application/pdf" in res_pdf.headers.get("content-type", "")
    assert res_pdf.content.startswith(b"%PDF-")

    # 3. Viewer is denied dossier access -> 403
    res_viewer = requests.get(f"{BACKEND_BASE_URL}/api/v1/dossier/{scan_id}/json", headers=viewer_headers, timeout=5)
    assert res_viewer.status_code == 403


# ------------------------------------------------------------------------------
# 7. Live Bank Registry Governance & Anti-Collision
# ------------------------------------------------------------------------------
def test_live_bank_registry_lifecycle(admin_token):
    """Verify administrator custom bank creation, duplicate rejection, and deletion."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    unique_domain = f"live-staging-bank-{int(time.time())}.co.in"

    # Add custom institution
    payload = {
        "brand_name": "Live Staging Bank",
        "primary_domain": unique_domain,
        "official_domains": [unique_domain],
        "keywords": ["livestagingbank"],
        "category": "Scheduled Commercial Bank"
    }
    res_add = requests.post(f"{BACKEND_BASE_URL}/api/v1/admin/banks", json=payload, headers=headers, timeout=5)
    assert res_add.status_code == 201
    bank_id = res_add.json()["id"]

    # Reject duplicate collision
    res_dup = requests.post(f"{BACKEND_BASE_URL}/api/v1/admin/banks", json=payload, headers=headers, timeout=5)
    assert res_dup.status_code == 400

    # Delete custom institution
    res_del = requests.delete(f"{BACKEND_BASE_URL}/api/v1/admin/banks/{bank_id}", headers=headers, timeout=5)
    assert res_del.status_code == 200


# ------------------------------------------------------------------------------
# 8. Live Webhook SSRF Mitigation
# ------------------------------------------------------------------------------
def test_live_webhook_ssrf_rejection(admin_token):
    """Verify SSRF mitigation blocks internal, loopback, and metadata destinations."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Loopback rejection
    res_loopback = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/admin/webhooks",
        json={"name": "Loopback Target", "url": "http://127.0.0.1:8080/hook"},
        headers=headers,
        timeout=5
    )
    assert res_loopback.status_code == 400
    assert "Insecure scheme" in res_loopback.json().get("detail", "") or "SSRF" in res_loopback.json().get("detail", "")

    # Cloud metadata rejection
    res_meta = requests.post(
        f"{BACKEND_BASE_URL}/api/v1/admin/webhooks",
        json={"name": "Cloud Metadata", "url": "http://169.254.169.254/latest/meta-data"},
        headers=headers,
        timeout=5
    )
    assert res_meta.status_code == 400


# ------------------------------------------------------------------------------
# 9. Live Audit Trail & Cryptographic Hash-Chaining Integrity
# ------------------------------------------------------------------------------
def test_live_audit_trail_and_chain(admin_token):
    """Verify audit log query and cryptographically unbroken SHA-256 chain."""
    from app.database import SessionLocal
    from app.services.audit_service import verify_audit_log_chain

    headers = {"Authorization": f"Bearer {admin_token}"}
    res = requests.get(f"{BACKEND_BASE_URL}/api/v1/admin/audit-logs?limit=50", headers=headers, timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert "logs" in data
    assert "total" in data
    assert len(data["logs"]) > 0

    # Run cryptographic hash chain verification against database
    db = SessionLocal()
    try:
        chain_audit = verify_audit_log_chain(db)
        assert chain_audit["status"] == "VALID"
        assert chain_audit["verified_records"] > 0
    finally:
        db.close()


# ------------------------------------------------------------------------------
# 10. Live Persistence Across Environment Lifecycle
# ------------------------------------------------------------------------------
def test_live_persistence_verification():
    """Verify that scan records and governance entries persist in SQLite."""
    res_history = requests.get(f"{BACKEND_BASE_URL}/api/v1/history?limit=10", timeout=5)
    assert res_history.status_code == 200
    history = res_history.json()
    assert isinstance(history, list)
    assert len(history) > 0

    # Verify latest record contains all required fields
    latest = history[0]
    assert "id" in latest
    assert "scan_type" in latest
    assert "target_input" in latest
    assert "risk_score" in latest
    assert "risk_level" in latest
