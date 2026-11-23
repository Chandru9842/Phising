"""
PhishShield Alert Webhook Service with Defensive SSRF Mitigation
Dispatches alerts for high-risk phishing events with sanitized payloads and strict egress validation.
"""

import socket
import ipaddress
import urllib.parse
import logging
import datetime
from typing import Dict, Any, Optional, Union, Tuple
import httpx
from sqlalchemy.orm import Session

from app.models.webhook import WebhookConfig
from app.services.dossier_export import defang_url

logger = logging.getLogger("phishshield.webhook")

# Private and restricted IPv4/IPv6 networks disallowed for webhook destinations
RESTRICTED_NETWORKS = [
    # IPv4 Private / Loopback / Special
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private RFC1918
    ipaddress.ip_network("172.16.0.0/12"),    # Private RFC1918
    ipaddress.ip_network("192.168.0.0/16"),   # Private RFC1918
    ipaddress.ip_network("169.254.0.0/16"),   # Link-Local / Cloud Metadata (AWS/GCP/Azure)
    ipaddress.ip_network("0.0.0.0/8"),        # Current network
    ipaddress.ip_network("100.64.0.0/10"),    # Carrier-grade NAT (RFC 6598)
    ipaddress.ip_network("192.0.0.0/24"),     # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),     # TEST-NET-1 (Documentation)
    ipaddress.ip_network("198.51.100.0/24"),  # TEST-NET-2 (Documentation)
    ipaddress.ip_network("203.0.113.0/24"),   # TEST-NET-3 (Documentation)
    ipaddress.ip_network("198.18.0.0/15"),    # Network Benchmark Tests
    ipaddress.ip_network("224.0.0.0/4"),      # Multicast
    ipaddress.ip_network("240.0.0.0/4"),      # Reserved
    # IPv6 Loopback / Local / Special
    ipaddress.ip_network("::1/128"),          # IPv6 Loopback
    ipaddress.ip_network("::/128"),           # IPv6 Unspecified
    ipaddress.ip_network("::ffff:0:0/96"),    # IPv4-mapped IPv6
    ipaddress.ip_network("64:ff9b::/96"),     # IPv4/IPv6 translation
    ipaddress.ip_network("2001:db8::/32"),    # Documentation
    ipaddress.ip_network("fc00::/7"),         # IPv6 Unique Local Address (ULA)
    ipaddress.ip_network("fe80::/10"),        # IPv6 Link-Local
    ipaddress.ip_network("ff00::/8"),         # IPv6 Multicast
]

ALLOWED_WEBHOOK_PORTS = (443, 8443)


def is_ip_restricted(ip_obj: Union[ipaddress.IPv4Address, ipaddress.IPv6Address]) -> Tuple[bool, str]:
    """
    Evaluates whether an IP address belongs to restricted, private, loopback, or metadata ranges.
    Handles IPv4-mapped IPv6 addresses transparently.
    """
    # If IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:169.254.169.254), inspect underlying IPv4
    if isinstance(ip_obj, ipaddress.IPv6Address) and ip_obj.ipv4_mapped:
        return is_ip_restricted(ip_obj.ipv4_mapped)

    # Built-in attribute checks
    if ip_obj.is_loopback:
        return True, "loopback address"
    if ip_obj.is_private:
        return True, "private RFC address space"
    if ip_obj.is_link_local:
        return True, "link-local address"
    if ip_obj.is_multicast:
        return True, "multicast address"
    if ip_obj.is_reserved:
        return True, "reserved address space"
    if ip_obj.is_unspecified:
        return True, "unspecified address"

    # Explicit subnet containment checks
    for net in RESTRICTED_NETWORKS:
        if ip_obj.version == net.version and ip_obj in net:
            return True, f"restricted CIDR {net}"

    return False, ""


def validate_webhook_url_security(url: str) -> None:
    """
    Performs comprehensive Server-Side Request Forgery (SSRF) validation on a webhook URL.
    Enforces HTTPS, port restrictions, credential stripping, DNS resolution, and IP checks.
    """
    if not url or not isinstance(url, str):
        raise ValueError("Webhook destination URL cannot be empty.")

    parsed = urllib.parse.urlparse(url)

    # 1. Enforce HTTPS scheme
    if parsed.scheme.lower() != "https":
        raise ValueError(f"Insecure scheme '{parsed.scheme}'. Webhook destinations must use strictly HTTPS.")

    # 2. Reject embedded credentials in URL
    if parsed.username or parsed.password:
        raise ValueError("SSRF Protection: Webhook destination URL cannot contain embedded credentials.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid URL: Hostname could not be parsed.")

    # 3. Port restrictions
    port = parsed.port or 443
    if port not in ALLOWED_WEBHOOK_PORTS:
        raise ValueError(
            f"SSRF Protection: Port {port} is disallowed. Webhooks must target standard HTTPS ports {ALLOWED_WEBHOOK_PORTS}."
        )

    # 4. Reject known internal/loopback hostnames directly
    lower_host = hostname.lower()
    if lower_host in ["localhost", "127.0.0.1", "::1", "metadata.google.internal"]:
        raise ValueError(f"SSRF Protection: Webhook destination '{hostname}' points to internal loopback/metadata.")

    if lower_host.endswith(".local") or lower_host.endswith(".internal"):
        raise ValueError(f"SSRF Protection: Webhook destination '{hostname}' resolves to an internal TLD.")

    # 5. DNS resolution and IP address range verification
    try:
        addr_info = socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except Exception as dns_err:
        raise ValueError(f"DNS Resolution failed for '{hostname}': {dns_err}")

    if not addr_info:
        raise ValueError(f"DNS Resolution yielded no address records for '{hostname}'.")

    # Verify ALL returned IP addresses
    for family, _, _, _, sockaddr in addr_info:
        ip_str = sockaddr[0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            restricted, reason = is_ip_restricted(ip_obj)
            if restricted:
                raise ValueError(
                    f"SSRF Protection: Destination '{hostname}' resolves to {reason} ({ip_str})."
                )
        except ValueError:
            raise


def build_alert_payload(scan_id: int, scan_type: str, raw_input: str, risk_level: str, risk_score: Optional[float], brand: Optional[str]) -> Dict[str, Any]:
    """
    Constructs a sanitized webhook alert payload.
    Crucially defangs any malicious URLs to prevent recipient clients from auto-linking.
    """
    defanged_input = defang_url(raw_input)

    return {
        "event": "CRITICAL_THREAT_DETECTED",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": "PhishShield Threat Intelligence Platform",
        "alert_details": {
            "scan_id": scan_id,
            "scan_type": scan_type,
            "verdict": risk_level,
            "risk_score": f"{risk_score:.1f}%" if risk_score is not None else "N/A",
            "target_input_defanged": defanged_input,
            "targeted_brand": brand or "Unknown/Generic",
            "threat_classification": "Brand Impersonation / Credential Harvester",
            "action_required": "Initiate domain blocking and notify CSIRT operations."
        }
    }


async def dispatch_threat_alert_webhooks(
    db: Session,
    scan_id: int,
    scan_type: str,
    target_input: str,
    risk_level: str,
    risk_score: Optional[float],
    target_brand: Optional[str]
):
    """
    Dispatches outbound alerts to all active webhooks for CRITICAL / HIGH threats.
    Executes with timeout guards, redirect protection (follow_redirects=False), and logs delivery outcomes.
    """
    if risk_level not in ["CRITICAL", "HIGH", "DANGEROUS"]:
        return

    try:
        webhooks = db.query(WebhookConfig).filter(WebhookConfig.is_active == True).all()
        if not webhooks:
            return

        payload = build_alert_payload(
            scan_id=scan_id,
            scan_type=scan_type,
            raw_input=target_input,
            risk_level=risk_level,
            risk_score=risk_score,
            brand=target_brand
        )

        # Enforce follow_redirects=False to prevent open-redirect SSRF bypasses
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False) as client:
            for hook in webhooks:
                try:
                    # Validate SSRF defense prior to egress
                    validate_webhook_url_security(hook.url)

                    headers = {"Content-Type": "application/json"}
                    if hook.secret_token:
                        headers["X-PhishShield-Token"] = hook.secret_token

                    resp = await client.post(hook.url, json=payload, headers=headers)
                    hook.last_delivery_status = f"SUCCESS (HTTP {resp.status_code})"
                    hook.last_delivery_at = datetime.datetime.now(datetime.timezone.utc)
                    hook.last_error = None
                    db.commit()
                except Exception as egress_err:
                    logger.error(f"Webhook dispatch failed for '{hook.name}': {egress_err}")
                    hook.last_delivery_status = "FAILED"
                    hook.last_delivery_at = datetime.datetime.now(datetime.timezone.utc)
                    hook.last_error = str(egress_err)
                    db.commit()
    except Exception as exc:
        logger.error(f"Error querying webhooks for alert dispatch: {exc}")
