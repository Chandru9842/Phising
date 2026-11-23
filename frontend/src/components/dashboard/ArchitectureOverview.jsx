import React from 'react';
import { Layers, Shield, Cpu, Lock, Sparkles, BookOpen } from 'lucide-react';

export default function ArchitectureOverview() {
  const priorities = [
    {
      priority: 'Priority 1',
      title: 'Real ML URL Phishing Detection',
      status: 'Implemented & Active',
      statusColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      description: 'Lexical, host-based, and structural feature extraction (26 features) + Scikit-learn Random Forest model trained on authentic phishing datasets.',
      artifacts: ['backend/app/ml/feature_extraction.py', 'backend/app/ml/url_classifier.py', 'backend/app/api/scan.py'],
    },
    {
      priority: 'Priority 2',
      title: 'Banking Brand Impersonation & SHAP Explainability',
      status: 'Implemented & Active',
      statusColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
      description: 'tldextract for registered domains, Damerau-Levenshtein distance typosquatting checks against canonical Indian banks, and TreeSHAP explainability plots.',
      artifacts: ['backend/app/ml/brand_detection.py', 'backend/app/ml/explainer.py', 'backend/app/core/indian_banks.py'],
    },
    {
      priority: 'Priority 3',
      title: 'SMS Phishing (Smishing) Detection',
      status: 'Implemented & Active',
      statusColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
      description: 'NLP pipeline with TF-IDF Vectorization and Logistic Regression trained on Indian banking smishing lures + automated embedded URL extraction and analysis.',
      artifacts: ['backend/app/ml/sms/sms_classifier.py', 'backend/app/ml/sms/predict_sms.py', 'backend/app/api/sms.py'],
    },
    {
      priority: 'Priority 4',
      title: 'UI/UX Design System & SaaS Modernization',
      status: 'In Progress (Phase 4A)',
      statusColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      description: 'Enterprise dark cybersecurity interface inspired by Inspo MCP production references (Linear, Grafana, Tinybird) with responsive layout and centralized design tokens.',
      artifacts: ['frontend/src/index.css', 'frontend/tailwind.config.js', 'frontend/src/components/common/Navbar.jsx'],
    },
    {
      priority: 'Priority 5',
      title: 'Screenshot Analysis, OCR & Threat Intelligence',
      status: 'Planned',
      statusColor: 'text-slate-400 bg-slate-900 border-slate-700',
      description: 'OpenCV visual feature comparison and EasyOCR text extraction to detect cloned banking login portals, visual logo spoofing, and fake security badges.',
      artifacts: ['backend/app/core/screenshot_analyzer.py', 'backend/app/api/screenshots.py'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm">
        <div className="flex items-center space-x-2 text-cyan-400 mb-2">
          <Layers className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            PhishShield Modular Architecture Roadmap
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Designed strictly following modular engineering standards: training, prediction, feature extraction, and explainability logic are separated into discrete, testable components.
        </p>

        <div className="mt-6 space-y-3.5">
          {priorities.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 rounded-full bg-[#07090e] border border-[#1e293b] text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border self-start sm:self-auto ${item.statusColor}`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 pl-8 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-2.5 pl-8 flex flex-wrap gap-2">
                {item.artifacts.map((art, aIdx) => (
                  <code
                    key={aIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#07090e] text-cyan-300 border border-[#1e293b]"
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
