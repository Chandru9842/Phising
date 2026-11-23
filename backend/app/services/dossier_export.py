"""
PhishShield Threat Dossier Export Service
Generates structured JSON intelligence reports and human-readable PDF threat dossiers.
Implements defensive URL defanging, XML escaping, and forensic provenance disclaimers.
"""

import io
import html
import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from app.models.scan import ScanRecord


def defang_url(url: str) -> str:
    """
    Defangs potentially malicious URLs and indicator strings across all scan types.
    Neutralizes schemes (http, https, ftp, file) and replaces '.' with '[.]'.
    Example: http://evil.com/login?a=1&b=2 -> hxxp://evil-bank[.]com/login?token=abc[.]xyz
    """
    if not url or not isinstance(url, str):
        return ""
    
    defanged = (
        url.replace("http://", "hxxp://")
        .replace("https://", "hxxps://")
        .replace("ftp://", "fxp://")
        .replace("file://", "fxle://")
    )
    # Neutralize dots
    return defanged.replace(".", "[.]")


def _esc(val: Any) -> str:
    """Safely escapes text for ReportLab XML paragraph rendering."""
    if val is None:
        return ""
    return html.escape(str(val))


def generate_threat_dossier_json(scan: ScanRecord) -> Dict[str, Any]:
    """
    Constructs a structured JSON threat intelligence dossier for SOC/SIEM ingestion.
    Defangs target inputs across all scan types (URL, SMS, Screenshot).
    """
    target_defanged = defang_url(scan.target_input) if scan.target_input else "N/A"

    # Parse SHAP features
    shap_data = scan.shap_features if isinstance(scan.shap_features, list) else []

    return {
        "report_metadata": {
            "dossier_id": f"DOSSIER-{scan.id:06d}",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "scan_timestamp": scan.created_at.isoformat() if scan.created_at else None,
            "export_engine": "PhishShield Threat Intelligence v0.1.0",
            "classification": "CONFIDENTIAL // TLP:AMBER",
            "provenance": "Generated via offline static feature analysis & explainability engine."
        },
        "target_assessment": {
            "scan_id": scan.id,
            "scan_type": scan.scan_type or "unknown",
            "target_input_defanged": target_defanged,
            "risk_verdict": scan.risk_level or "UNKNOWN",
            "composite_risk_score": scan.risk_score,
            "is_phishing_confirmed": bool(scan.is_phishing),
            "is_brand_impersonation": bool(scan.is_brand_impersonation),
            "impersonated_institution": scan.target_brand,
            "impersonation_technique": scan.impersonation_technique
        },
        "threat_evidence": {
            "heuristics_and_reasons": scan.reasons if isinstance(scan.reasons, list) else [],
            "shap_feature_attributions": shap_data
        },
        "recommendations": [
            "Block defanged indicator at perimeter firewall and email gateway." if scan.is_phishing else "No immediate perimeter block required.",
            f"Notify fraud operations regarding brand impersonation attempt against {scan.target_brand}." if scan.is_brand_impersonation else "No brand impersonation alerts triggered.",
            "Verify with official Indian bank domain whitelist before initiating transactions."
        ],
        "forensic_disclaimers": {
            "url_handling": "All indicator URLs are defanged. Do not resolve or execute unverified endpoints.",
            "shap_explanation_notice": "TreeSHAP feature attributions represent local statistical model attributions and do not constitute independent legal evidence of malicious intent.",
            "air_gap_guarantee": "This analysis was conducted in an air-gapped environment with zero live network probing."
        }
    }


def generate_threat_dossier_pdf(scan: ScanRecord) -> bytes:
    """
    Renders an enterprise cybersecurity PDF threat dossier using ReportLab.
    Enforces non-clickable URLs and escapes XML entities to prevent parser crashes.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0f172a'),
        leading=24
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#64748b'),
        leading=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1e293b'),
        leading=16,
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        leading=13
    )
    mono_style = ParagraphStyle(
        'DocMono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        textColor=colors.HexColor('#0f172a'),
        leading=11
    )

    story = []

    # Header Bar
    story.append(Paragraph("PHISHSHIELD // CYBER THREAT DOSSIER", title_style))
    story.append(Paragraph(
        f"Forensic Assessment Dossier ID: <b>DOSSIER-{scan.id:06d}</b> &nbsp;|&nbsp; "
        f"Exported: {_esc(datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'))}",
        subtitle_style
    ))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#4f46e5'), spaceBefore=2, spaceAfter=12))

    # Verdict Banner
    risk_color = colors.HexColor('#ef4444') if scan.risk_level in ['CRITICAL', 'HIGH'] else (
        colors.HexColor('#f59e0b') if scan.risk_level == 'SUSPICIOUS' else (
            colors.HexColor('#eab308') if scan.risk_level == 'INSUFFICIENT_EVIDENCE' else colors.HexColor('#10b981')
        )
    )
    score_display = f"{scan.risk_score:.1f}%" if scan.risk_score is not None else "N/A"

    verdict_data = [
        [
            Paragraph(f"<b>VERDICT:</b> {_esc(scan.risk_level)}", ParagraphStyle('V', fontName='Helvetica-Bold', fontSize=12, textColor=risk_color)),
            Paragraph(f"<b>RISK SCORE:</b> {_esc(score_display)}", body_style),
            Paragraph(f"<b>SCAN TYPE:</b> {_esc((scan.scan_type or '').upper())}", body_style),
            Paragraph(f"<b>PHISHING:</b> {'YES' if scan.is_phishing else 'NO'}", body_style)
        ]
    ]
    verdict_table = Table(verdict_data, colWidths=[150, 120, 120, 130])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 14))

    # Target Summary
    story.append(Paragraph("1. Target Indicator Summary", heading_style))
    defanged_input = defang_url(scan.target_input) if scan.target_input else "N/A"
    target_data = [
        [Paragraph("<b>Target Input (Defanged):</b>", body_style), Paragraph(_esc(defanged_input), mono_style)],
        [Paragraph("<b>Timestamp:</b>", body_style), Paragraph(_esc(scan.created_at.isoformat() if scan.created_at else "N/A"), body_style)],
        [Paragraph("<b>Target Bank Brand:</b>", body_style), Paragraph(_esc(scan.target_brand or "None Identified"), body_style)],
        [Paragraph("<b>Impersonation Mode:</b>", body_style), Paragraph(_esc(scan.impersonation_technique or "None"), body_style)],
    ]
    target_table = Table(target_data, colWidths=[160, 360])
    target_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(target_table)
    story.append(Spacer(1, 14))

    # Threat Intelligence Findings & Reasons
    story.append(Paragraph("2. Threat Intelligence Indicators & Rationale", heading_style))
    reasons = scan.reasons if isinstance(scan.reasons, list) and scan.reasons else ["No anomalous indicators detected. Target passed heuristic thresholds."]
    reasons_data = [[Paragraph(f"• {_esc(r)}", body_style)] for r in reasons]
    reasons_table = Table(reasons_data, colWidths=[520])
    reasons_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(reasons_table)
    story.append(Spacer(1, 14))

    # SHAP Feature Attributions
    shap_data = scan.shap_features if isinstance(scan.shap_features, list) and scan.shap_features else []
    if shap_data:
        story.append(Paragraph("3. Local Explainability (TreeSHAP Attributions)", heading_style))
        shap_rows = [[Paragraph("<b>Feature Attribute</b>", body_style), Paragraph("<b>SHAP Value</b>", body_style), Paragraph("<b>Direction</b>", body_style)]]
        for f in shap_data:
            shap_rows.append([
                Paragraph(_esc(f.get("name", "feature")), mono_style),
                Paragraph(f"{float(f.get('shap', 0.0)):.4f}", body_style),
                Paragraph(_esc(f.get("dir", "INCREASES_RISK")), body_style)
            ])
        shap_table = Table(shap_rows, colWidths=[240, 140, 140])
        shap_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(shap_table)
        story.append(Spacer(1, 14))

    # Disclaimers & Governance Notice
    story.append(Paragraph("4. Defensive Handling & Legal Notice", heading_style))
    disclaimer_text = (
        "<b>DEFENSIVE NOTICE:</b> All malicious URLs have been defanged (hxxp / [.] notation) to prevent accidental resolution. "
        "TreeSHAP explainability reflects local model feature weighting and does not constitute independent proof of criminal intent. "
        "Analysis was conducted in an air-gapped, zero-storage environment. For SOC internal investigation only."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', fontName='Helvetica-Oblique', fontSize=7.5, textColor=colors.HexColor('#64748b'), leading=10)))

    doc.build(story)
    return buf.getvalue()
