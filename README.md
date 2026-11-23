# PhishShield: Brand-Aware, Explainable Phishing Protection for Indian Banking Customers

PhishShield is an AI-powered cybersecurity defense platform specifically engineered to safeguard Indian banking customers from phishing URLs, malicious SMS/smishing messages, and brand-impersonating fake banking portals.

---

## Key Features

- **Brand-Aware Detection**: Curated Indian Banking Canonical Registry (SBI, HDFC, ICICI, Axis, PNB, Kotak, Canara, BoB, NPCI, RBI, etc.) to catch typosquatting and subdomain spoofing.
- **Explainable AI (SHAP)**  : Provides clear explanations of feature weights driving machine learning classifications instead of black-box risk scores.
- **Zero-Trust URL Analysis**: Strictly refuses to trust HTTPS as proof of legitimacy; inspects registered domains using `tldextract` against canonical bank registries.
- **Multi-Vector Protection**: Architecture engineered for URL inspection, SMS smishing detection, and visual screenshot OCR verification.

---

## Project Structure

```
PhishShield/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry & CORS
│   │   ├── config.py                # Environment & settings configuration
│   │   ├── database.py              # SQLite + SQLAlchemy session engine
│   │   ├── models/                  # Database models
│   │   │   ├── __init__.py
│   │   │   └── scan.py              # ScanRecord model for audit logging
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   │   ├── __init__.py
│   │   │   └── health.py            # Health check schemas
│   │   ├── api/                     # REST API routers
│   │   │   ├── __init__.py
│   │   │   ├── health.py            # Health diagnostic endpoints
│   │   │   ├── banks.py             # Indian banking registry endpoints
│   │   │   └── history.py           # Scan logs & metric endpoints
│   │   └── core/                    # Security & domain analysis
│   │       ├── __init__.py
│   │       └── brand_registry.py    # Official Indian Banking Canonical Registry
│   ├── tests/                       # Automated test suite
│   │   ├── __init__.py
│   │   └── test_health.py
│   ├── requirements.txt             # Python dependencies
│   ├── run.py                       # Backend server launcher
│   └── .env                         # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Sidebar, MetricCard
│   │   │   └── dashboard/           # SystemStatus, QuickScan, BankRegistry, ThreatMap
│   │   ├── services/
│   │   │   └── api.js               # Axios backend integration
│   │   ├── App.jsx                  # Main dashboard orchestrator
│   │   ├── main.jsx                 # React root
│   │   └── index.css                # Tailwind CSS layers & themes
│   ├── index.html                   # HTML entry point
│   ├── tailwind.config.js           # Custom cybersecurity dark theme
│   ├── vite.config.js               # Vite config with backend proxy
│   └── package.json                 # Frontend dependencies
│
├── docs/
│   └── architecture.md              # Detailed architecture specifications
└── README.md
```

---

## Setup & Running Instructions

### Prerequisites
- Python 3.10+ (Verified on Python 3.12.2)
- Node.js 18+ (Verified on Node.js v24.15.0 / npm 12.2.0)

---

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python run.py
   ```
   The backend will be live at: **http://127.0.0.1:8000**
   Interactive Swagger documentation: **http://127.0.0.1:8000/docs**

---

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application dashboard will be accessible at: **http://localhost:5173**

---

## API Endpoints (Foundation Stage)

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Service index & version info |
| `/api/health` | `GET` | System diagnostic & DB connectivity health check |
| `/api/v1/health` | `GET` | API v1 health status |
| `/api/v1/banks` | `GET` | Curated Indian Banking Canonical Registry |
| `/api/v1/history` | `GET` | Audit log of previous scans |
| `/api/v1/history/stats` | `GET` | High-level summary metrics |
| `/docs` | `GET` | Interactive OpenAPI / Swagger UI |

---

## Development Priorities

- **Priority 1**: URL Detection + Random Forest Classifier (Next)
- **Priority 2**: Banking Brand Impersonation + SHAP Explainability
- **Priority 3**: SMS Phishing Detection + NLP
- **Priority 4**: Screenshot Upload + OCR
- **Priority 5**: Unified Risk Engine, Testing & Deployment

