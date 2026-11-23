from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "PhishShield"
    assert data["status"] == "online"

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["app_name"] == "PhishShield"
    assert "services" in data
    assert data["services"]["database"] == "connected"

def test_banking_registry():
    response = client.get("/api/v1/banks")
    assert response.status_code == 200
    data = response.json()
    assert data["total_banks"] > 0
    assert any(b["brand_name"] == "State Bank of India" for b in data["banks"])

def test_model_info_endpoint():
    response = client.get("/api/v1/urls/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ready", "not_trained"]
    if data["status"] == "ready":
        assert "evaluation_metrics" in data["metadata"]
        assert "feature_importances" in data["metadata"]

def test_url_scan_endpoint():
    # Scan a legitimate Indian bank URL
    payload = {"url": "https://retail.onlinesbi.sbi/retail/login.htm"}
    response = client.post("/api/v1/urls/scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == payload["url"]
    assert "is_phishing" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert "probabilities" in data
    assert "features" in data
    assert data["risk_score"] < 50.0  # Legitimate official SBI portal
