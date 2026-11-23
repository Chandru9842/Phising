/**
 * PhishShield Unified Threat Result Contract Adapter (Phase 6A)
 *
 * Normalizes disparate scanner output structures (URL, SMS, Screenshot) into a shared
 * presentation interface for UI consistency across dashboards, scanners, and audit logs.
 * Preserves full access to underlying engine-specific telemetry in the `raw` property.
 */

export function normalizeScanResult(scanType, rawData) {
  if (!rawData) return null;

  switch (scanType) {
    case 'url': {
      const riskAssessment = rawData.risk_assessment || {};
      const brandAnalysis = rawData.brand_analysis || {};
      const shapExplanation = rawData.shap_explanation || {};
      const riskScore = typeof rawData.risk_score === 'number' ? rawData.risk_score : null;
      const riskLevel = (rawData.risk_level || 'LOW').toUpperCase();

      return {
        scanType: 'url',
        scanStatus: 'completed',
        targetInput: rawData.url || '',
        verdict: riskLevel,
        isPhishing: Boolean(rawData.is_phishing),
        riskScore: riskScore,
        displayScore: riskScore !== null ? `${riskScore.toFixed(1)}%` : 'N/A',
        confidence: rawData.confidence || 'normal',
        assessmentSummary:
          riskAssessment.recommendation_text ||
          (rawData.is_phishing
            ? 'High probability of phishing detected via structural features and machine learning evaluation.'
            : 'No malicious indicators or brand spoofing signatures detected in URL structure.'),
        targetBrand: brandAnalysis.detected_brand || null,
        isBrandSpoofed: Boolean(brandAnalysis.impersonation_suspected),
        brandTechnique: brandAnalysis.match_type || null,
        keyReasons: riskAssessment.reasons || rawData.reasons || [],
        recommendations: riskAssessment.recommendation_text
          ? [riskAssessment.recommendation_text]
          : [],
        directiveCode: riskAssessment.recommendation || (rawData.is_phishing ? 'BLOCK_AND_REPORT' : 'SAFE_TO_PROCEED'),
        shapTopContributors: (shapExplanation.top_positive_contributors || []).slice(0, 4),
        analyzedAt: rawData.analyzed_at || new Date().toISOString(),
        raw: rawData,
      };
    }

    case 'sms': {
      const textAnalysis = rawData.sms_text_analysis || {};
      const riskScore = typeof rawData.composite_risk_score === 'number' ? rawData.composite_risk_score : null;
      const riskLevel = (rawData.composite_risk_level || 'LOW').toUpperCase();

      return {
        scanType: 'sms',
        scanStatus: 'completed',
        targetInput: rawData.message || '',
        verdict: riskLevel,
        isPhishing: Boolean(rawData.is_smishing),
        riskScore: riskScore,
        displayScore: riskScore !== null ? `${riskScore.toFixed(1)}%` : 'N/A',
        confidence: 'high',
        assessmentSummary:
          rawData.recommendation_text ||
          (rawData.is_smishing
            ? 'Smishing attack detected: Message combines psychological urgency with suspicious external links.'
            : 'Authentic or informational message. No known financial phishing lures detected.'),
        targetBrand: rawData.target_brand || null,
        isBrandSpoofed: Boolean(rawData.target_brand),
        brandTechnique: rawData.target_brand ? 'smishing_brand_spoofing' : null,
        keyReasons: rawData.reasons || [],
        recommendations: rawData.recommendation_text ? [rawData.recommendation_text] : [],
        directiveCode: rawData.recommendation || (rawData.is_smishing ? 'DO_NOT_ENTER_CREDENTIALS' : 'SAFE_TO_PROCEED'),
        tokensDetected: textAnalysis.keywords_detected || [],
        extractedUrls: rawData.url_scan_results || [],
        analyzedAt: rawData.analyzed_at || new Date().toISOString(),
        raw: rawData,
      };
    }

    case 'screenshot': {
      const assessment = rawData.screenshot_assessment || {};
      const riskScore = typeof assessment.risk_score === 'number' ? assessment.risk_score : null;
      const riskLevel = (assessment.risk_level || 'INSUFFICIENT_EVIDENCE').toUpperCase();
      const brands = rawData.bank_brand_evidence || [];
      const hasMismatch = brands.some((b) => b.domain_mismatch_detected);
      const matchedBrand = brands.length > 0 ? brands[0].brand_name : null;

      return {
        scanType: 'screenshot',
        scanStatus: rawData.analysis_status || 'completed',
        targetInput: rawData.filename || 'Uploaded Screenshot',
        verdict: riskLevel,
        isPhishing: Boolean(riskLevel === 'CRITICAL' || riskLevel === 'HIGH'),
        riskScore: riskScore,
        displayScore: riskScore !== null ? `${riskScore.toFixed(1)}%` : 'N/A (Insufficient Typography)',
        confidence: assessment.confidence || 'normal',
        assessmentSummary: assessment.summary || 'Multimodal screenshot analysis completed.',
        targetBrand: matchedBrand,
        isBrandSpoofed: hasMismatch,
        brandTechnique: hasMismatch ? 'screenshot_domain_mismatch' : null,
        keyReasons: assessment.reasons || assessment.key_threat_factors || [],
        recommendations: rawData.recommendations || [],
        directiveCode:
          riskLevel === 'CRITICAL'
            ? 'BLOCK_AND_REPORT'
            : riskLevel === 'HIGH'
            ? 'DO_NOT_ENTER_CREDENTIALS'
            : riskLevel === 'MEDIUM'
            ? 'PROCEED_WITH_CAUTION'
            : 'SAFE_TO_PROCEED',
        extractedUrls: rawData.extracted_urls || [],
        ocrSummary: rawData.ocr_summary || {},
        socialEngineering: rawData.social_engineering_indicators || [],
        analyzedAt: rawData.analyzed_at || new Date().toISOString(),
        runtimeMs: rawData.processing_time_ms || 0,
        raw: rawData,
      };
    }

    default:
      return {
        scanType,
        targetInput: String(rawData),
        verdict: 'UNKNOWN',
        isPhishing: false,
        riskScore: null,
        displayScore: 'N/A',
        assessmentSummary: 'Unrecognized scan payload structure.',
        keyReasons: [],
        recommendations: [],
        raw: rawData,
      };
  }
}
