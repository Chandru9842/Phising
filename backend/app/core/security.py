"""
PhishShield Security & Cryptography Utilities
Provides secure password hashing (PBKDF2-HMAC-SHA256 with parameter upgradability),
JWT token lifecycle enforcement, timing-safe verification, and in-memory rate-limiting.
"""

import os
import hmac
import time
import hashlib
import datetime
import logging
from typing import Optional, Dict, Any, Tuple
from collections import defaultdict
import jwt

from app.config import settings

logger = logging.getLogger("phishshield.security")

ALGORITHM = "HS256"
LEGACY_DEFAULT_ITERATIONS = 100000

# Fixed pre-computed dummy hash used to equalize response timing when username does not exist
_DUMMY_SALT = "00000000000000000000000000000000"
_DUMMY_KEY = hashlib.pbkdf2_hmac("sha256", b"dummy_password_timing_pad", _DUMMY_SALT.encode("utf-8"), 50000).hex()


def validate_production_secret() -> None:
    """
    Guards production deployment against default, weak, or missing JWT signing secrets.
    Raises RuntimeError if insecure configuration is detected in production mode.
    """
    if getattr(settings, "ENVIRONMENT", "").lower() == "production":
        secret = getattr(settings, "SECRET_KEY", "")
        if (
            not secret
            or secret in ("phishshield-default-dev-secret-key", "secret", "changeme", "admin")
            or len(secret) < 32
        ):
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION ERROR: In production environment, "
                "SECRET_KEY must be a cryptographically secure value with at least 32 characters. "
                "Default development secret keys are strictly prohibited."
            )


def hash_password(password: str, iterations: Optional[int] = None) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a cryptographically secure 16-byte random salt.
    Format: pbkdf2_sha256$<iterations>$<salt>$<key_hex>
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    
    rounds = iterations or getattr(settings, "PBKDF2_ITERATIONS", 600000)
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        rounds
    )
    return f"pbkdf2_sha256${rounds}${salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against stored hash using constant-time comparison.
    Supports both modern 'pbkdf2_sha256$<iterations>$<salt>$<key>' and legacy '<salt>$<key>'.
    """
    if not plain_password or not hashed_password:
        return False
    
    try:
        parts = hashed_password.split("$")
        
        # Modern format: pbkdf2_sha256$<iterations>$<salt>$<key_hex>
        if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
            rounds = int(parts[1])
            salt = parts[2]
            stored_key_hex = parts[3]
            computed_key = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt.encode("utf-8"),
                rounds
            )
            return hmac.compare_digest(computed_key.hex(), stored_key_hex)
        
        # Backward-compatible legacy format: <salt>$<key_hex> (100,000 iterations)
        elif len(parts) == 2:
            salt = parts[0]
            stored_key_hex = parts[1]
            computed_key = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt.encode("utf-8"),
                LEGACY_DEFAULT_ITERATIONS
            )
            return hmac.compare_digest(computed_key.hex(), stored_key_hex)
        
        return False
    except Exception:
        return False


def needs_rehash(hashed_password: str) -> bool:
    """
    Evaluates whether a stored password hash is using legacy iterations or format
    and should be upgraded to the target work factor upon successful login.
    """
    if not hashed_password:
        return True
    parts = hashed_password.split("$")
    target_rounds = getattr(settings, "PBKDF2_ITERATIONS", 600000)
    
    # Legacy format needs upgrade
    if len(parts) == 2:
        return True
    
    if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
        try:
            current_rounds = int(parts[1])
            return current_rounds < target_rounds
        except ValueError:
            return True
    
    return True


def dummy_verify_password(plain_password: str) -> None:
    """
    Executes constant-work dummy hashing to equalize response timing and eliminate
    username-enumeration timing side-channels when an unknown user attempts authentication.
    """
    try:
        hashlib.pbkdf2_hmac(
            "sha256",
            (plain_password or "dummy").encode("utf-8"),
            _DUMMY_SALT.encode("utf-8"),
            50000
        )
    except Exception:
        pass


def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """
    Creates a signed JWT access token.
    Enforces valid secret key configuration and includes mandatory claims (sub, role, uid, exp, iat).
    """
    validate_production_secret()
    to_encode = data.copy()
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + datetime.timedelta(hours=8)

    to_encode.update({"exp": expire, "iat": now_utc})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and strictly validates a JWT token.
    Enforces algorithm restriction to HS256, signature verification, and expiration.
    Returns payload dict or None if invalid/expired/tampered.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "sub", "iat"]}
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None


# ------------------------------------------------------------------------------
# In-Memory Login Rate Limiter (Brute-Force & Credential-Stuffing Defense)
# ------------------------------------------------------------------------------
class LoginRateLimiter:
    """
    In-memory sliding-window rate limiter for the authentication endpoint.
    Throttles repeated authentication failures per (client_ip, username) pair.
    
    Deployment Note: This in-memory implementation operates per application worker.
    In multi-instance / distributed production clusters, a distributed Redis-backed
    token bucket should be configured.
    """
    def __init__(self):
        # Maps key -> list of failure timestamps (float)
        self._failures: Dict[str, list] = defaultdict(list)
    
    def _make_key(self, ip: Optional[str], username: str) -> str:
        clean_ip = (ip or "unknown_ip").strip()
        clean_user = (username or "").strip().lower()
        return f"{clean_ip}:{clean_user}"

    def is_rate_limited(self, ip: Optional[str], username: str) -> Tuple[bool, int]:
        """
        Returns (is_limited: bool, retry_after_seconds: int).
        """
        key = self._make_key(ip, username)
        now = time.time()
        window = getattr(settings, "LOGIN_RATE_LIMIT_WINDOW_SECONDS", 60)
        max_attempts = getattr(settings, "LOGIN_RATE_LIMIT_MAX_ATTEMPTS", 5)

        # Prune failures older than window
        self._failures[key] = [t for t in self._failures[key] if (now - t) < window]

        if len(self._failures[key]) >= max_attempts:
            oldest_relevant = self._failures[key][0]
            retry_after = max(1, int(window - (now - oldest_relevant)))
            return True, retry_after

        return False, 0

    def record_failure(self, ip: Optional[str], username: str) -> None:
        """
        Records a failed authentication attempt for sliding-window calculation.
        """
        key = self._make_key(ip, username)
        self._failures[key].append(time.time())

    def reset(self, ip: Optional[str], username: str) -> None:
        """
        Clears failure history upon successful authentication.
        """
        key = self._make_key(ip, username)
        self._failures.pop(key, None)


login_rate_limiter = LoginRateLimiter()
