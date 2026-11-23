"""
PhishShield Phase 6C Comprehensive Test Suite:
Enterprise Administration, Incident Response & Multi-User Governance
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.scan import ScanRecord
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.auth import bootstrap_initial_admin
from app.services.bank_admin import validate_domain_format
from app.services.webhook_service import validate_webhook_url_security
from app.services.audit_service import record_audit_event

# Ensure tables and bootstrap admin are initialized for tests
Base.metadata.create_all(bind=engine)
bootstrap_initial_admin()

client = TestClient(app)


# ------------------------------------------------------------------------------
# 1. Cryptography & Password Hashing Unit Tests
# ------------------------------------------------------------------------------
def test_password_hashing_and_verification():
    raw_pass = "SecureSecretPassword#2026"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert "$" in hashed
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False
    assert verify_password("", hashed) is False


def test_jwt_token_lifecycle():
    claims = {"sub": "analyst_bob", "role": "Analyst", "uid": 42}
    token = create_access_token(claims)

    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "analyst_bob"
    assert decoded["role"] == "Analyst"
    assert decoded["uid"] == 42
    assert "exp" in decoded


# ------------------------------------------------------------------------------
# 2. Authentication & Admin Login Endpoints
# ------------------------------------------------------------------------------
def test_admin_login_success_and_failure():
    # Login with default bootstrapped admin
    success_resp = client.post("/api/v1/auth/login", json={
        "username": "admin",
        "password": "PhishShieldAdmin#2026"
    })
    assert success_resp.status_code == 200
    data = success_resp.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "Administrator"

    # Login with bad password
    fail_resp = client.post("/api/v1/auth/login", json={
        "username": "admin",
        "password": "WrongAdminPassword!"
    })
    assert fail_resp.status_code == 401


# ------------------------------------------------------------------------------
# 3. RBAC Enforcement & Route Guards
# ------------------------------------------------------------------------------
def test_rbac_role_enforcement():
    # Generate tokens for each role
    admin_token = create_access_token({"sub": "admin", "role": "Administrator"})
    viewer_token = create_access_token({"sub": "viewer_user", "role": "Viewer"})

    # Ensure viewer user exists in DB for active check
    db = SessionLocal()
    try:
        v_user = db.query(User).filter(User.username == "viewer_user").first()
        if not v_user:
            v_user = User(
                username="viewer_user",
                email="viewer@phishshield.internal",
                password_hash=hash_password("ViewerPass#123"),
                role=UserRole.VIEWER,
                is_active=True
            )
            db.add(v_user)
            db.commit()
    finally:
        db.close()

    # 1. Unauthenticated request to /admin/users -> 401
    resp_unauth = client.get("/api/v1/admin/users")
    assert resp_unauth.status_code == 401

    # 2. Viewer accessing Administrator endpoint -> 403 Forbidden
    resp_viewer = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {viewer_token}"}
    )
    assert resp_viewer.status_code == 403
    assert "forbidden" in resp_viewer.json()["detail"].lower()

    # 3. Administrator accessing Administrator endpoint -> 200 OK
    resp_admin = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin.status_code == 200
    assert isinstance(resp_admin.json(), list)


# ------------------------------------------------------------------------------
# 4. Threat Dossier Export (JSON & PDF)
# ------------------------------------------------------------------------------
def test_threat_dossier_exports():
    # Insert or query a scan record
    db = SessionLocal()
    scan_id = 1
    try:
        scan = db.query(ScanRecord).first()
        if not scan:
            scan = ScanRecord(
                scan_type="url",
                target_input="http://secure-login-bank-verification.com/login.php",
                risk_score=92.0,
                risk_level="CRITICAL",
                is_phishing=True,
                is_brand_impersonation=True,
                target_brand="State Bank of India",
                reasons=["Suspicious login keywords", "Brand mismatch"],
                shap_features=[{"name": "has_ip", "shap": 0.42, "dir": "INCREASES_RISK"}]
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
        scan_id = scan.id
    finally:
        db.close()

    # 1. JSON Export (Requires Analyst or Administrator)
    admin_token = create_access_token({"sub": "admin", "role": "Administrator"})
    auth_headers = {"Authorization": f"Bearer {admin_token}"}
    json_resp = client.get(f"/api/v1/dossier/{scan_id}/json", headers=auth_headers)
    assert json_resp.status_code == 200
    dossier = json_resp.json()
    assert "report_metadata" in dossier
    assert "target_assessment" in dossier
    assert "forensic_disclaimers" in dossier
    # Verify malicious URL was defanged
    assert "hxxp" in dossier["target_assessment"]["target_input_defanged"]
    assert "[.]" in dossier["target_assessment"]["target_input_defanged"]

    # 2. PDF Export
    pdf_resp = client.get(f"/api/v1/dossier/{scan_id}/pdf", headers=auth_headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF")  # Valid PDF header


# ------------------------------------------------------------------------------
# 5. Bank Registry Governance & FQDN Validation
# ------------------------------------------------------------------------------
def test_bank_registry_domain_validation():
    # Valid FQDNs
    assert validate_domain_format("onlinesbi.sbi") is True
    assert validate_domain_format("retail.hdfcbank.com") is True
    assert validate_domain_format("bankofbaroda.co.in") is True

    # Invalid domains
    assert validate_domain_format("http://sbi.com") is False
    assert validate_domain_format("sbi.com/login") is False
    assert validate_domain_format("*.bank.com") is False
    assert validate_domain_format("192.168.1.1") is False
    assert validate_domain_format("bad domain.com") is False
    assert validate_domain_format("") is False


def test_bank_registry_admin_endpoints():
    admin_token = create_access_token({"sub": "admin", "role": "Administrator"})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Add valid custom bank
    add_resp = client.post("/api/v1/admin/banks", json={
        "brand_name": "Test Cooperative Bank",
        "primary_domain": "testcoopbank.in",
        "official_domains": ["testcoopbank.in"],
        "keywords": ["testcoop"],
        "category": "Cooperative Bank"
    }, headers=headers)
    assert add_resp.status_code in [201, 400]  # 400 if already exists

    # 2. Reject adding protected canonical bank
    reject_resp = client.post("/api/v1/admin/banks", json={
        "brand_name": "State Bank of India",
        "primary_domain": "sbi-fake.com",
        "official_domains": ["sbi-fake.com"],
        "keywords": ["sbi"],
        "category": "Public Sector"
    }, headers=headers)
    assert reject_resp.status_code == 400
    assert "protected canonical" in reject_resp.json()["detail"].lower()


# ------------------------------------------------------------------------------
# 6. Webhook Alerts & SSRF Defense
# ------------------------------------------------------------------------------
def test_webhook_ssrf_rejection():
    # Non-HTTPS
    with pytest.raises(ValueError, match="Insecure scheme"):
        validate_webhook_url_security("http://hooks.slack.com/services/123")

    # Localhost / Loopback
    with pytest.raises(ValueError, match="SSRF Protection"):
        validate_webhook_url_security("https://localhost:8443/alert")

    with pytest.raises(ValueError, match="SSRF Protection"):
        validate_webhook_url_security("https://127.0.0.1:443/alert")

    # Cloud metadata endpoint
    with pytest.raises(ValueError, match="SSRF Protection"):
        validate_webhook_url_security("https://169.254.169.254/latest/meta-data")


# ------------------------------------------------------------------------------
# 7. Audit Trail Logging & Retrieval
# ------------------------------------------------------------------------------
def test_audit_log_recording_and_retrieval():
    admin_token = create_access_token({"sub": "admin", "role": "Administrator"})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Record synthetic audit event
    db = SessionLocal()
    try:
        record_audit_event(
            db=db,
            actor_username="admin",
            actor_role="Administrator",
            action="PHASE_6C_TEST_EVENT",
            entity_type="test",
            details={"test_metric": 100}
        )
    finally:
        db.close()

    # Query audit logs
    resp = client.get("/api/v1/admin/audit-logs?limit=10", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "logs" in data
    assert len(data["logs"]) > 0
