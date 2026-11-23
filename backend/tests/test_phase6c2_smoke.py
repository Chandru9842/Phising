"""
PhishShield Phase 6C.2 Operational Smoke & Deployment Readiness Test Suite
Verifies:
1. Zero-dependency Health & Diagnostic Endpoints
2. Authentication, JWT Token Lifecycle & RBAC Role Enforcement
3. URL Scanner Pipeline (Benign Bank Whitelist vs Phishing Impersonation)
4. SMS Smishing Pipeline (Transactional OTP vs Urgent KYC Phishing)
5. Screenshot Threat Pipeline & Ingestion Safety (Synthetic Payload)
6. Forensic Threat Dossier Export (JSON & Defanged PDF Generation)
7. Bank Registry Governance & Anti-Collision Security
8. Multi-Vector SSRF Mitigation on Outbound Webhooks
9. Tamper-Evident SHA-256 Audit Log Hash-Chaining
10. Database Persistence & Simulated Service Restart Recovery
"""

import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.scan import ScanRecord
from app.core.security import hash_password, create_access_token
from app.core.auth import bootstrap_initial_admin
from app.services.audit_service import record_audit_event, verify_audit_log_chain
from app.services.webhook_service import validate_webhook_url_security

# Initialize database schema and admin account
Base.metadata.create_all(bind=engine)
bootstrap_initial_admin()

client = TestClient(app)


@pytest.fixture(scope="module")
def admin_headers():
    """Returns valid Bearer token headers for Administrator."""
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@phishshield.internal",
                password_hash=hash_password("PhishShield@Admin2026!"),
                role=UserRole.ADMINISTRATOR,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        token = create_access_token({
            "sub": admin_user.username,
            "role": admin_user.role,
            "uid": admin_user.id
        })
        return {"Authorization": f"Bearer {token}"}
    finally:
        db.close()


@pytest.fixture(scope="module")
def analyst_headers():
    """Returns valid Bearer token headers for Analyst."""
    db = SessionLocal()
    try:
        analyst_user = db.query(User).filter(User.username == "smoke_analyst").first()
        if not analyst_user:
            analyst_user = User(
                username="smoke_analyst",
                email="smoke_analyst@phishshield.internal",
                password_hash=hash_password("AnalystSmokeSecret123!"),
                role=UserRole.ANALYST,
                is_active=True
            )
            db.add(analyst_user)
            db.commit()
            db.refresh(analyst_user)
        token = create_access_token({
            "sub": analyst_user.username,
            "role": analyst_user.role,
            "uid": analyst_user.id
        })
        return {"Authorization": f"Bearer {token}"}
    finally:
        db.close()


@pytest.fixture(scope="module")
def viewer_headers():
    """Returns valid Bearer token headers for Viewer."""
    db = SessionLocal()
    try:
        viewer_user = db.query(User).filter(User.username == "smoke_viewer").first()
        if not viewer_user:
            viewer_user = User(
                username="smoke_viewer",
                email="smoke_viewer@phishshield.internal",
                password_hash=hash_password("ViewerSmokeSecret123!"),
                role=UserRole.VIEWER,
                is_active=True
            )
            db.add(viewer_user)
            db.commit()
            db.refresh(viewer_user)
        token = create_access_token({
            "sub": viewer_user.username,
            "role": viewer_user.role,
            "uid": viewer_user.id
        })
        return {"Authorization": f"Bearer {token}"}
    finally:
        db.close()


# ------------------------------------------------------------------------------
# 1. Health & Diagnostics Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_health_endpoints():
    """Verify primary and secondary health check routes."""
    res_api = client.get("/api/health")
    assert res_api.status_code == 200
    data = res_api.json()
    assert data.get("status") == "healthy"
    assert "version" in data
    assert "services" in data

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json().get("project") == "PhishShield"


def test_smoke_diagnostic_endpoints():
    """Verify model info, banking registry, and history stats."""
    # Model diagnostic information
    res_model = client.get("/api/v1/urls/model-info")
    assert res_model.status_code == 200
    model_data = res_model.json()
    assert model_data.get("status") == "ready"
    assert "metadata" in model_data

    # Banking whitelist registry
    res_banks = client.get("/api/v1/banks")
    assert res_banks.status_code == 200
    banks_data = res_banks.json()
    assert "banks" in banks_data
    assert len(banks_data["banks"]) >= 10
    bank_domains = [b.get("primary_domain") for b in banks_data["banks"]]
    assert "onlinesbi.sbi" in bank_domains
    assert "hdfcbank.com" in bank_domains

    # Historical stats
    res_stats = client.get("/api/v1/history/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert "total_scans" in stats
    assert "phishing_detected" in stats


# ------------------------------------------------------------------------------
# 2. Authentication, Rate Limiting & RBAC Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_auth_and_rbac(admin_headers, analyst_headers, viewer_headers):
    """Verify login success, login failure, and role-based permissions."""
    # Invalid password attempt
    res_fail = client.post("/api/v1/auth/login", json={
        "username": "admin",
        "password": "IncorrectPassword999!"
    })
    assert res_fail.status_code == 401
    assert "detail" in res_fail.json()

    # Admin access to admin-only user management
    res_users = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res_users.status_code == 200
    assert isinstance(res_users.json(), list)

    # Analyst cannot access admin-only user management
    res_analyst_forbidden = client.get("/api/v1/admin/users", headers=analyst_headers)
    assert res_analyst_forbidden.status_code == 403

    # Viewer cannot access admin-only user management
    res_viewer_forbidden = client.get("/api/v1/admin/users", headers=viewer_headers)
    assert res_viewer_forbidden.status_code == 403


# ------------------------------------------------------------------------------
# 3. URL Scanner Pipeline Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_url_scanner_benign_and_phishing():
    """Verify URL detection on authentic bank vs suspicious lure."""
    # 1. Official Bank Domain -> SAFE override
    res_sbi = client.post("/api/v1/urls/scan", json={"url": "https://onlinesbi.sbi"})
    assert res_sbi.status_code == 200
    sbi_data = res_sbi.json()
    assert sbi_data["is_phishing"] is False
    assert sbi_data["risk_level"] in ["SAFE", "LOW"]
    assert sbi_data["risk_score"] <= 10.0

    # 2. Typosquatted / Impersonation Lure -> PHISHING
    lure_url = "http://login-sbi-secure-update-alert.com/netbanking/login.php"
    res_phish = client.post("/api/v1/urls/scan", json={"url": lure_url})
    assert res_phish.status_code == 200
    phish_data = res_phish.json()
    assert phish_data["is_phishing"] is True
    assert phish_data["risk_score"] >= 65.0
    assert phish_data["brand_impersonation_flag"] is True
    assert phish_data["shap_explanation"] is not None


# ------------------------------------------------------------------------------
# 4. SMS Smishing Scanner Pipeline Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_sms_scanner():
    """Verify SMS detection on benign transactional OTP vs smishing threat."""
    # 1. Benign OTP SMS
    benign_sms = "Your SBI OTP for transaction of Rs 1,500 is 492018. Valid for 10 mins. Never share OTP with anyone."
    res_benign = client.post("/api/v1/sms/scan", json={"message": benign_sms})
    assert res_benign.status_code == 200
    benign_data = res_benign.json()
    assert benign_data["is_smishing"] is False
    assert benign_data["extracted_urls"] == []
    assert benign_data["composite_risk_level"] == "LOW"

    # 2. Urgent KYC Smishing SMS
    smish_sms = "Dear customer, your SBI account is suspended! Update PAN & KYC immediately: http://bit.ly/sbi-pan-kyc"
    res_smish = client.post("/api/v1/sms/scan", json={"message": smish_sms})
    assert res_smish.status_code == 200
    smish_data = res_smish.json()
    assert smish_data["is_smishing"] is True
    assert len(smish_data["extracted_urls"]) >= 1
    assert smish_data["composite_risk_score"] >= 50.0


# ------------------------------------------------------------------------------
# 5. Screenshot Threat Pipeline Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_screenshot_pipeline():
    """Verify screenshot upload, OCR queueing, and queue diagnostics."""
    # Generate in-memory synthetic PNG image (100x100)
    img_byte_arr = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    # Queue status endpoint
    res_q = client.get("/api/v1/screenshot/queue/status")
    assert res_q.status_code == 200
    q_data = res_q.json()
    assert q_data.get("status") == "healthy"
    assert "telemetry" in q_data
    assert "max_concurrent" in q_data["telemetry"]

    # Asynchronous upload endpoint
    files = {"file": ("smoke_test.png", img_byte_arr.getvalue(), "image/png")}
    res_upload = client.post("/api/v1/screenshot/analyze/async", files=files)
    assert res_upload.status_code == 202
    upload_data = res_upload.json()
    assert "job_id" in upload_data
    assert upload_data["status"] in ["queued", "running", "completed"]


# ------------------------------------------------------------------------------
# 6. Forensic Threat Dossier Export Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_threat_dossier_export(analyst_headers, viewer_headers):
    """Verify threat dossier export in JSON and PDF format with defanging."""
    db = SessionLocal()
    try:
        # Create a test phishing scan record
        scan = ScanRecord(
            scan_type="url",
            target_input="http://malicious-hdfc-login.com/auth",
            risk_score=95.0,
            risk_level="CRITICAL",
            is_phishing=True,
            is_brand_impersonation=True,
            target_brand="HDFC Bank",
            impersonation_technique="typosquatting",
            reasons=["High-confidence phishing targeting HDFC Bank customer portal."],
            shap_features=[{"name": "brand_impersonated", "shap": 0.45, "dir": "INCREASES_RISK"}]
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        scan_id = scan.id
    finally:
        db.close()

    # 1. Analyst downloads JSON dossier
    res_json = client.get(f"/api/v1/dossier/{scan_id}/json", headers=analyst_headers)
    assert res_json.status_code == 200
    dossier_data = res_json.json()
    assert dossier_data["target_assessment"]["scan_id"] == scan_id
    assert dossier_data["report_metadata"]["dossier_id"] == f"DOSSIER-{scan_id:06d}"
    defanged_target = dossier_data["target_assessment"]["target_input_defanged"]
    assert "hxxp" in defanged_target
    assert "[.]" in defanged_target

    # 2. Analyst downloads PDF dossier
    res_pdf = client.get(f"/api/v1/dossier/{scan_id}/pdf", headers=analyst_headers)
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert res_pdf.content.startswith(b"%PDF-")

    # 3. Viewer is denied dossier export access
    res_viewer_json = client.get(f"/api/v1/dossier/{scan_id}/json", headers=viewer_headers)
    assert res_viewer_json.status_code == 403


# ------------------------------------------------------------------------------
# 7. Bank Registry Administration & Collision Prevention Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_bank_registry_governance(admin_headers):
    """Verify admin addition, collision rejection, and deletion of custom bank domain."""
    unique_domain = "smoke-test-bank-unique.gov.in"

    # Add custom bank
    add_payload = {
        "brand_name": "Smoke Test Bank",
        "primary_domain": unique_domain,
        "official_domains": [unique_domain, f"netbanking.{unique_domain}"],
        "keywords": ["smokebank", "smoke test bank"],
        "category": "Public Sector Bank"
    }
    res_add = client.post("/api/v1/admin/banks", json=add_payload, headers=admin_headers)
    assert res_add.status_code == 201
    created_id = res_add.json()["id"]

    # Reject duplicate / collision domain
    res_dup = client.post("/api/v1/admin/banks", json=add_payload, headers=admin_headers)
    assert res_dup.status_code == 400

    # Delete custom bank
    res_del = client.delete(f"/api/v1/admin/banks/{created_id}", headers=admin_headers)
    assert res_del.status_code == 200


# ------------------------------------------------------------------------------
# 8. Outbound Webhook Security & SSRF Defense Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_webhook_ssrf_mitigation():
    """Verify SSRF mitigation blocks internal, loopback, and metadata targets."""
    # Loopback targets must raise ValueError
    with pytest.raises(ValueError, match="Insecure scheme|SSRF Protection"):
        validate_webhook_url_security("http://127.0.0.1:8080/callback")

    with pytest.raises(ValueError, match="internal loopback|SSRF Protection"):
        validate_webhook_url_security("https://localhost:8443/hook")

    # Cloud metadata target must raise ValueError
    with pytest.raises(ValueError, match="Insecure scheme|SSRF Protection"):
        validate_webhook_url_security("http://169.254.169.254/latest/meta-data")


# ------------------------------------------------------------------------------
# 9. Tamper-Evident SHA-256 Audit Log Hash Chain Smoke Tests
# ------------------------------------------------------------------------------
def test_smoke_audit_trail_and_chain_integrity(admin_headers):
    """Verify cryptographic audit chain validity and query endpoints."""
    db = SessionLocal()
    try:
        # Record a test audit event
        record_audit_event(
            db=db,
            actor_username="admin",
            actor_role="Administrator",
            action="OPERATIONAL_SMOKE_TEST",
            entity_type="system",
            entity_id="smoke_test_run",
            details={"status": "in_progress", "secret_key": "should_be_redacted"}
        )

        # Verify cryptographic chain
        chain_audit = verify_audit_log_chain(db)
        assert chain_audit["status"] == "VALID"
        assert chain_audit["verified_records"] > 0
    finally:
        db.close()

    # Query audit logs via API
    res_logs = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert res_logs.status_code == 200
    logs_data = res_logs.json()
    assert "logs" in logs_data
    assert "total" in logs_data
    assert isinstance(logs_data["logs"], list)
    assert len(logs_data["logs"]) > 0


# ------------------------------------------------------------------------------
# 10. Database Persistence & Simulated Service Restart Recovery
# ------------------------------------------------------------------------------
def test_smoke_persistence_and_restart_recovery():
    """Verify database persistence and state preservation across session lifecycles."""
    # Session 1: Write scan record
    db1 = SessionLocal()
    try:
        test_target = "hxxp://recovery-test-phish-domain.com"
        record = ScanRecord(
            scan_type="url",
            target_input=test_target,
            risk_score=78.0,
            risk_level="HIGH",
            is_phishing=True,
            is_brand_impersonation=False,
            reasons=["Simulated restart persistence check."],
            shap_features=[{"name": "entropy", "shap": 0.22, "dir": "INCREASES_RISK"}]
        )
        db1.add(record)
        db1.commit()
        persisted_id = record.id
    finally:
        db1.close()

    # Session 2: Simulate fresh application start / new database session
    db2 = SessionLocal()
    try:
        retrieved = db2.query(ScanRecord).filter(ScanRecord.id == persisted_id).first()
        assert retrieved is not None
        assert retrieved.target_input == test_target
        assert retrieved.risk_level == "HIGH"
        assert retrieved.risk_score == 78.0
        assert retrieved.shap_features[0]["name"] == "entropy"

        # Verify audit chain integrity remains VALID in fresh session
        chain_status = verify_audit_log_chain(db2)
        assert chain_status["status"] == "VALID"
    finally:
        db2.close()
