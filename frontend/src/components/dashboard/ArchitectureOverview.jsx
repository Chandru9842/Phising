import React from 'react';
import { Layers } from 'lucide-react';

export default function ArchitectureOverview() {
  const priorities = [
    {
      priority: 'Priority 1',
      title: 'Real ML URL Phishing Detection',
      status: 'Implemented & Active',
      statusColor: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      description: 'Lexical, host-based, and structural feature extraction (26 features) + Scikit-learn Random Forest model trained on authentic phishing datasets.',
      artifacts: ['backend/app/ml/feature_extraction.py', 'backend/app/ml/url_classifier.py', 'backend/app/api/scan.py'],
    },
    {
      priority: 'Priority 2',
      title: 'Banking Brand Impersonation & SHAP Explainability',
      status: 'Implemented & Active',
      statusColor: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      description: 'tldextract for registered domains, Damerau-Levenshtein distance typosquatting checks against canonical Indian banks, and TreeSHAP explainability plots.',
      artifacts: ['backend/app/ml/brand_detection.py', 'backend/app/ml/explainer.py', 'backend/app/core/indian_banks.py'],
    },
    {
      priority: 'Priority 3',
      title: 'SMS Phishing (Smishing) Detection',
      status: 'Implemented & Active',
      statusColor: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      description: 'NLP pipeline with TF-IDF Vectorization and Logistic Regression trained on Indian banking smishing lures + automated embedded URL extraction and analysis.',
      artifacts: ['backend/app/ml/sms/sms_classifier.py', 'backend/app/ml/sms/predict_sms.py', 'backend/app/api/sms.py'],
    },
    {
      priority: 'Priority 4',
      title: 'UI/UX Design System & SaaS Modernization',
      status: 'Active (Stripe / Cloudflare)',
      statusColor: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      description: 'Enterprise light cybersecurity interface inspired by Stripe Dashboard and Cloudflare Zero Trust with responsive layout and centralized design tokens.',
      artifacts: ['frontend/src/index.css', 'frontend/tailwind.config.js', 'frontend/src/components/common/Navbar.jsx'],
    },
    {
      priority: 'Priority 5',
      title: 'Screenshot Analysis, OCR & Threat Intelligence',
      status: 'Implemented (Phase 5E/6A)',
      statusColor: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      description: 'Defensive URL defanging, visual logo spoofing analysis, and EasyOCR text extraction to detect cloned banking login portals and credential harvesting.',
      artifacts: ['backend/app/core/screenshot_analyzer.py', 'backend/app/api/screenshots.py'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center space-x-2 text-[#0F172A] mb-2">
          <Layers className="w-5 h-5" />
          <h2 className="text-lg font-heading font-bold text-[#0F172A] tracking-tight">
            PhishShield Modular Architecture Roadmap
          </h2>
        </div>
        <p className="text-[13.5px] text-[#475569] leading-relaxed max-w-3xl">
          Designed strictly following modular engineering standards: training, prediction, feature extraction, and explainability logic are separated into discrete, testable components.
        </p>

        <div className="mt-6 space-y-3.5">
          {priorities.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-heading font-semibold text-[#0F172A]">{item.title}</h3>
                </div>
                <span
                  className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded border self-start sm:self-auto ${item.statusColor}`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-[13.5px] text-[#475569] mt-2 pl-9 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-2.5 pl-9 flex flex-wrap gap-2">
                {item.artifacts.map((art, aIdx) => (
                  <code
                    key={aIdx}
                    className="text-xs font-mono px-2 py-0.5 rounded bg-white text-[#0F172A] border border-[#E2E8F0]"
                  >
                    {art}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
