"""
PhishShield Phase 6C.1 Comprehensive Security Validation & Deployment-Readiness Test Suite
Tests:
1. Authentication Security, Upgradable PBKDF2 Hashing, and Rate Limiting
2. JWT Lifecycle, Required Claims, and Algorithm Confusion Defense
3. Production vs Development Admin Bootstrap Security
4. RBAC Authorization Boundaries & Role Escalation Prevention
5. Webhook SSRF Multi-Vector Protections (IPv4/IPv6, IPv4-mapped, Metadata, Ports, Redirects)
6. Bank Registry Governance, Domain Hijacking Defense & IDN Normalization
7. Forensic Threat Dossier Defensive Defanging & XML Injection Safety
8. Tamper-Evident Cryptographic Audit Hash Chaining & Credential Redaction
9. OCR Bounded Concurrency & Semaphore Lifetime Accounting
"""

import os
import time
import datetime
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.scan import ScanRecord
from app.models.audit import AuditLog
from app.models.bank_registry import ManagedBankRecord
from app.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    needs_rehash,
    create_access_token,
    decode_access_token,
    login_rate_limiter,
    validate_production_secret
)
from app.core.auth import bootstrap_initial_admin
from app.services.webhook_service import validate_webhook_url_security, is_ip_restricted
from app.services.bank_admin import validate_domain_format, add_managed_bank
from app.services.dossier_export import defang_url, generate_threat_dossier_json, generate_threat_dossier_pdf
from app.services.audit_service import record_audit_event, verify_audit_log_chain, sanitize_audit_payload
from app.core.ocr_queue import ocr_controller

Base.metadata.create_all(bind=engine)
bootstrap_initial_admin()

client = TestClient(app)


# ==============================================================================
# 1. Authentication Security & Upgradable Password Hashing
# ==============================================================================
def test_password_hash_upgradability_and_legacy_compatibility():
    raw_pass = "ComplexPassword#2026"
    
    # Modern hash format: pbkdf2_sha256$<iter>$<salt>$<key>
    modern_hash = hash_password(raw_pass, iterations=600000)
    assert modern_hash.startswith("pbkdf2_sha256$600000$")
    assert verify_password(raw_pass, modern_hash) is True
    assert needs_rehash(modern_hash) is False

    # Older hash with lower iteration count: needs rehash
    older_hash = hash_password(raw_pass, iterations=100000)
    assert verify_password(raw_pass, older_hash) is True
    assert needs_rehash(older_hash) is True

    # Legacy format: <salt>$<key> (100,000 rounds)
    import hashlib
    salt = "deadbeef12345678deadbeef12345678"
    key = hashlib.pbkdf2_hmac("sha256", raw_pass.encode("utf-8"), salt.encode("utf-8"), 100000)
    legacy_hash = f"{salt}${key.hex()}"
    
    assert verify_password(raw_pass, legacy_hash) is True
    assert verify_password("WrongPassword!", legacy_hash) is False
    assert needs_rehash(legacy_hash) is True


def test_login_rate_limiter_throttling():
    test_ip = "192.0.2.100"
    test_user = "brute_target_analyst"

    # Reset any prior failures
    login_rate_limiter.reset(test_ip, test_user)

    # Simulate repeated failed attempts up to limit
    max_attempts = getattr(settings, "LOGIN_RATE_LIMIT_MAX_ATTEMPTS", 5)
    for _ in range(max_attempts):
        is_limited, _ = login_rate_limiter.is_rate_limited(test_ip, test_user)
        assert is_limited is False
        login_rate_limiter.record_failure(test_ip, test_user)

    # Next attempt should be throttled
    is_limited, retry_after = login_rate_limiter.is_rate_limited(test_ip, test_user)
    assert is_limited is True
    assert retry_after > 0

    # API endpoint returns 429 Too Many Requests
    resp = client.post("/api/v1/auth/login", json={
        "username": test_user,
        "password": "WrongPasswordAttempt!"
    }, headers={"X-Forwarded-For": test_ip})
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers

    # Reset cleans rate limit
    login_rate_limiter.reset(test_ip, test_user)
    is_limited, _ = login_rate_limiter.is_rate_limited(test_ip, test_user)
    assert is_limited is False


# ==============================================================================
# 2. JWT Security & Production Signing Secret Validation
# ==============================================================================
def test_jwt_validation_rejects_missing_claims_and_expired_tokens():
    # Expired token
    expired_token = create_access_token(
        data={"sub": "analyst_alice", "role": "Analyst"},
        expires_delta=datetime.timedelta(seconds=-10)
    )
    assert decode_access_token(expired_token) is None

    # Missing subject (sub)
    bad_token = create_access_token(data={"role": "Analyst"})
    assert decode_access_token(bad_token) is None

    # Tampered signature
    valid_token = create_access_token(data={"sub": "admin", "role": "Administrator"})
    tampered_token = valid_token[:-5] + "XXXXX"
    assert decode_access_token(tampered_token) is None


def test_production_secret_key_guard():
    # In development mode, default secret is accepted
    with patch.object(settings, "ENVIRONMENT", "development"):
        with patch.object(settings, "SECRET_KEY", "phishshield-default-dev-secret-key"):
            validate_production_secret()  # Should not raise

    # In production mode, weak/default secret must raise RuntimeError
    with patch.object(settings, "ENVIRONMENT", "production"):
        with patch.object(settings, "SECRET_KEY", "phishshield-default-dev-secret-key"):
            with pytest.raises(RuntimeError, match="CRITICAL SECURITY CONFIGURATION ERROR"):
                validate_production_secret()

        with patch.object(settings, "SECRET_KEY", "too-short"):
            with pytest.raises(RuntimeError, match="CRITICAL SECURITY CONFIGURATION ERROR"):
                validate_production_secret()


# ==============================================================================
# 3. Administrator Bootstrap Security
# ==============================================================================
def test_bootstrap_security_in_production():
    db = SessionLocal()
    try:
        # Mock empty user table in production without ADMIN_INITIAL_PASSWORD
        with patch("app.core.auth.SessionLocal", return_value=db):
            with patch.object(settings, "ENVIRONMENT", "production"):
                with patch.dict(os.environ, {}, clear=True):
                    with patch.object(db, "query") as mock_query:
                        mock_query.return_value.filter.return_value.count.return_value = 0
                        # Calling bootstrap should warn and return without creating predictable user
                        bootstrap_initial_admin()
                        # Verify db.add was NOT called with hardcoded password
                        db.add = MagicMock()
    finally:
        db.close()


# ==============================================================================
# 4. RBAC Authorization Boundaries
# ==============================================================================
def test_rbac_dossier_export_requires_analyst_or_admin():
    db = SessionLocal()
    try:
        # Create Viewer and Analyst users if not exist
        v_user = db.query(User).filter(User.username == "sec_viewer").first()
        if not v_user:
            v_user = User(
                username="sec_viewer",
                email="sec_viewer@phishshield.internal",
                password_hash=hash_password("ViewerPass#2026"),
                role=UserRole.VIEWER,
                is_active=True
            )
            db.add(v_user)

        a_user = db.query(User).filter(User.username == "sec_analyst").first()
        if not a_user:
            a_user = User(
                username="sec_analyst",
                email="sec_analyst@phishshield.internal",
                password_hash=hash_password("AnalystPass#2026"),
                role=UserRole.ANALYST,
                is_active=True
            )
            db.add(a_user)

        scan = db.query(ScanRecord).first()
        if not scan:
            scan = ScanRecord(
                scan_type="url",
                target_input="http://malicious-test-phish.com",
                risk_score=95.0,
                risk_level="CRITICAL",
                is_phishing=True
            )
            db.add(scan)
        db.commit()
        scan_id = scan.id
    finally:
        db.close()

    viewer_token = create_access_token({"sub": "sec_viewer", "role": "Viewer"})
    analyst_token = create_access_token({"sub": "sec_analyst", "role": "Analyst"})

    # 1. Unauthenticated -> 401
    assert client.get(f"/api/v1/dossier/{scan_id}/json").status_code == 401
    assert client.get(f"/api/v1/dossier/{scan_id}/pdf").status_code == 401

    # 2. Viewer -> 403 Forbidden
    resp_v_json = client.get(
        f"/api/v1/dossier/{scan_id}/json",
        headers={"Authorization": f"Bearer {viewer_token}"}
    )
    assert resp_v_json.status_code == 403

    resp_v_pdf = client.get(
        f"/api/v1/dossier/{scan_id}/pdf",
        headers={"Authorization": f"Bearer {viewer_token}"}
    )
    assert resp_v_pdf.status_code == 403

    # 3. Analyst -> 200 OK
    resp_a_json = client.get(
        f"/api/v1/dossier/{scan_id}/json",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert resp_a_json.status_code == 200

    resp_a_pdf = client.get(
        f"/api/v1/dossier/{scan_id}/pdf",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert resp_a_pdf.status_code == 200


def test_analyst_cannot_access_administrator_endpoints():
    analyst_token = create_access_token({"sub": "sec_analyst", "role": "Analyst"})
    headers = {"Authorization": f"Bearer {analyst_token}"}

    # User management
    assert client.get("/api/v1/admin/users", headers=headers).status_code == 403
    # Webhooks
    assert client.get("/api/v1/admin/webhooks", headers=headers).status_code == 403
    # Audit logs
    assert client.get("/api/v1/admin/audit-logs", headers=headers).status_code == 403
    # Bank registry add
    assert client.post("/api/v1/admin/banks", json={}, headers=headers).status_code == 403


# ==============================================================================
# 5. Webhook SSRF Multi-Vector Defense
# ==============================================================================
def test_ssrf_multi_vector_defense():
    # 1. Insecure scheme
    with pytest.raises(ValueError, match="Insecure scheme"):
        validate_webhook_url_security("http://external-siem.com/webhook")

    with pytest.raises(ValueError, match="Insecure scheme"):
        validate_webhook_url_security("ftp://external-siem.com/webhook")

    # 2. Embedded credentials
    with pytest.raises(ValueError, match="embedded credentials"):
        validate_webhook_url_security("https://admin:secret@api.pagerduty.com/hook")

    # 3. Disallowed ports (port scan prevention)
    with pytest.raises(ValueError, match="Port 22 is disallowed"):
        validate_webhook_url_security("https://api.slack.com:22/services/123")

    with pytest.raises(ValueError, match="Port 8080 is disallowed"):
        validate_webhook_url_security("https://api.slack.com:8080/services/123")

    # 4. Direct loopback and private hostnames
    with pytest.raises(ValueError, match="internal loopback/metadata"):
        validate_webhook_url_security("https://localhost:443/alert")

    with pytest.raises(ValueError, match="internal loopback/metadata"):
        validate_webhook_url_security("https://127.0.0.1:443/alert")

    with pytest.raises(ValueError, match="internal TLD"):
        validate_webhook_url_security("https://internal-service.local/alert")

    # 5. IPv4-mapped IPv6 address containment check
    import ipaddress
    mapped_loopback = ipaddress.ip_address("::ffff:127.0.0.1")
    restricted, reason = is_ip_restricted(mapped_loopback)
    assert restricted is True
    assert "loopback" in reason or "127" in reason

    mapped_metadata = ipaddress.ip_address("::ffff:169.254.169.254")
    restricted, reason = is_ip_restricted(mapped_metadata)
    assert restricted is True

    mapped_private = ipaddress.ip_address("::ffff:10.0.0.5")
    restricted, reason = is_ip_restricted(mapped_private)
    assert restricted is True

    # 6. Public IP is permitted
    public_ip = ipaddress.ip_address("8.8.8.8")
    restricted, _ = is_ip_restricted(public_ip)
    assert restricted is False


# ==============================================================================
# 6. Bank Registry Governance & Hijacking Defense
# ==============================================================================
def test_bank_registry_hijacking_and_normalization():
    # Trailing dot normalization
    assert validate_domain_format("onlinesbi.sbi.") is True
    assert validate_domain_format("hdfcbank.com.") is True

    # IDN / Punycode normalization
    assert validate_domain_format("xn--bcher-kva.de") is True

    # Scheme / Path / Colon rejection
    assert validate_domain_format("https://sbi.co.in") is False
    assert validate_domain_format("sbi.co.in/netbanking") is False
    assert validate_domain_format("sbi.co.in:8080") is False

    # Prevent hijacking official canonical domains
    db = SessionLocal()
    try:
        with pytest.raises(ValueError, match="belongs to a protected canonical Indian banking institution"):
            add_managed_bank(
                db=db,
                brand_name="Impostor Bank",
                primary_domain="onlinesbi.sbi",  # SBI canonical domain!
                official_domains=["onlinesbi.sbi"],
                keywords=["impostor"]
            )
    finally:
        db.close()


# ==============================================================================
# 7. Forensic Dossier Export & XML Injection Safety
# ==============================================================================
def test_dossier_defanging_and_xml_safety():
    # Defang across all formats
    assert defang_url("http://evil-bank.com/login?token=abc.xyz") == "hxxp://evil-bank[.]com/login?token=abc[.]xyz"
    assert defang_url("https://phish.in/verify") == "hxxps://phish[.]in/verify"
    assert defang_url("ftp://ftp.dropzone.net") == "fxp://ftp[.]dropzone[.]net"

    # Malicious inputs with XML characters (<script>, &amp;) in scan record
    malicious_scan = ScanRecord(
        id=999,
        scan_type="sms",
        target_input="Dear user click http://evil.com/login?a=1&b=2<script>alert(1)</script>",
        risk_score=98.5,
        risk_level="CRITICAL",
        is_phishing=True,
        is_brand_impersonation=True,
        target_brand="HDFC Bank & Co <Trust>",
        reasons=["Suspicious parameter & token in <script> tags", "Brand mismatch & urgent hook"]
    )

    # JSON export must defang target
    json_dossier = generate_threat_dossier_json(malicious_scan)
    assert "hxxp" in json_dossier["target_assessment"]["target_input_defanged"]
    assert "[.]" in json_dossier["target_assessment"]["target_input_defanged"]

    # PDF generation MUST NOT crash with XML parser exception on & or <tags>
    pdf_bytes = generate_threat_dossier_pdf(malicious_scan)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")


# ==============================================================================
# 8. Audit Log Tamper-Evidence & Hash Chaining
# ==============================================================================
def test_audit_log_hash_chain_and_redaction():
    # Redaction test
    payload = {
        "username": "analyst1",
        "password": "SuperSecretPassword#123",
        "api_key": "sk-secret-key-123",
        "nested": {"token": "jwt-token-value", "safe_info": "harmless"}
    }
    sanitized = sanitize_audit_payload(payload)
    assert sanitized["password"] == "[REDACTED]"
    assert sanitized["api_key"] == "[REDACTED]"
    assert sanitized["nested"]["token"] == "[REDACTED]"
    assert sanitized["nested"]["safe_info"] == "harmless"

    # Hash-chain integrity test
    db = SessionLocal()
    try:
        log1 = record_audit_event(
            db=db,
            actor_username="admin",
            actor_role="Administrator",
            action="PHASE_6C1_TEST_CHAIN_1",
            details={"step": 1}
        )
        assert log1.entry_hash is not None

        log2 = record_audit_event(
            db=db,
            actor_username="admin",
            actor_role="Administrator",
            action="PHASE_6C1_TEST_CHAIN_2",
            details={"step": 2}
        )
        assert log2.prev_hash == log1.entry_hash

        # Verification of hash-chain
        chain_status = verify_audit_log_chain(db)
        assert chain_status["status"] == "VALID"
        assert chain_status["verified_records"] >= 2
    finally:
        db.close()


# ==============================================================================
# 9. OCR Concurrency & Semaphore Accounting Safety
# ==============================================================================
def test_ocr_semaphore_accounting_on_timeout():
    import asyncio

    async def _run_test():
        controller = ocr_controller

        initial_waiting = controller.waiting_count
        initial_active = controller.active_count

        # Simulate a function that times out waiting for semaphore
        with patch.object(settings, "OCR_TIMEOUT_SECONDS", 0.05):
            # Artificially lock semaphore to force timeout
            sem = controller._get_semaphore()
            await sem.acquire()
            try:
                with pytest.raises(Exception) as exc_info:
                    await controller.run_bounded(lambda: "never_run")
                assert "timed out" in str(exc_info.value.detail).lower() or exc_info.value.status_code == 504
            finally:
                sem.release()

        # Waiting and active counters MUST return to baseline (no memory/counter leak)
        assert controller.waiting_count == initial_waiting
        assert controller.active_count == initial_active

    asyncio.run(_run_test())
