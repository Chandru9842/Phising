import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  GitBranch,
  ArrowRight,
  Sparkles,
  Database,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Binary,
  Workflow,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function ModelInsightsView() {
  const [activeTab, setActiveTab] = useState('url_model'); // 'url_model' | 'sms_model' | 'pipeline' | 'limitations'

  // Verified URL Random Forest model metrics from saved joblib artifact
  const urlModelMetrics = {
    modelType: 'RandomForestClassifier (Scikit-Learn)',
    version: '1.0.0',
    estimators: 150,
    maxDepth: 16,
    featureCount: 26,
    datasetTotal: 403,
    trainSamples: 363,
    testSamples: 40,
    splitMethod: 'Domain-Grouped Split (Prevents Apex Domain Leakage)',
    accuracy: 92.50,
    precision: 93.75,
    recall: 88.24,
    f1Score: 90.91,
    rocAuc: 96.16,
    confusionMatrix: {
      tn: 22,
      fp: 1,
      fn: 2,
      tp: 15
    },
    topFeatures: [
      { name: 'subdomain_length', importance: 20.36, label: 'Subdomain String Length' },
      { name: 'num_digits', importance: 19.64, label: 'Numeric Digit Count' },
      { name: 'digit_ratio', importance: 12.29, label: 'Digit-to-Length Ratio' },
      { name: 'hostname_length', importance: 9.93, label: 'Host Component Length' },
      { name: 'is_https', importance: 8.33, label: 'SSL/TLS Protocol Flag' },
      { name: 'num_hyphens', importance: 6.24, label: 'Hyphen Character Count' },
      { name: 'shannon_entropy', importance: 6.17, label: 'Shannon Character Entropy' },
      { name: 'domain_length', importance: 5.45, label: 'Registered Domain Length' },
    ]
  };

  // Verified SMS TF-IDF + Logistic Regression model metrics from saved joblib artifact
  const smsModelMetrics = {
    modelType: 'TfidfVectorizer + LogisticRegression Pipeline',
    version: '1.0.0',
    vocabularySize: 5000,
    ngramRange: '1-2 n-grams (Word & Character Boundaries)',
    sublinearTf: true,
    datasetTotal: 5202,
    trainSamples: 4161,
    testSamples: 1041,
    accuracy: 98.56,
    precision: 91.55,
    recall: 97.74,
    f1Score: 94.55,
    rocAuc: 99.64,
    confusionMatrix: {
      tn: 896,
      fp: 12,
      fn: 3,
      tp: 130
    },
    topSmishingTokens: [
      { token: 'url', coeff: 6.85, type: 'Spam Token' },
      { token: 'call', coeff: 6.25, type: 'Call to Action' },
      { token: 'txt', coeff: 5.08, type: 'SMS Indicator' },
      { token: 'text', coeff: 4.64, type: 'SMS Indicator' },
      { token: 'free', coeff: 4.37, type: 'Monetary Incentive' },
      { token: 'your', coeff: 3.75, type: 'Targeting Pronoun' },
      { token: 'claim', coeff: 2.97, type: 'Reward Lure' },
      { token: 'service', coeff: 2.84, type: 'Authority Lure' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="cyber-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Cpu className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                Machine Learning & Explainability Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Verified evaluation metrics, algorithmic architecture, and explainable AI mechanisms powering PhishShield's dual-engine defense.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131926] text-amber-400 border border-[#1e293b]">
              Audited Artifacts (Joblib v1.0.0)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'url_model', label: 'URL Random Forest', icon: GlobeIcon },
            { id: 'sms_model', label: 'SMS NLP Classifier', icon: MessageIcon },
            { id: 'pipeline', label: 'Architecture Pipelines', icon: Workflow },
            { id: 'limitations', label: 'Operational Limitations', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-[#131926] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB A: URL Random Forest Model */}
      {activeTab === 'url_model' && (
        <div className="space-y-6">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="cyber-card p-5 space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
                <div className="flex items-center space-x-2 text-white">
                  <Binary className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                    URL Random Forest Architecture
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Model v1.0.0</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The URL phishing detection engine deploys an ensemble of <strong className="text-white font-mono">150 decision trees</strong> trained with Scikit-learn. To prevent domain memorization and over-optimistic evaluation, datasets were partitioned using <strong className="text-white font-mono">Domain-Grouped Train/Test Splitting</strong>, ensuring URLs from the same apex domain never co-occur in both sets.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Estimators</span>
                  <span className="text-white font-bold">{urlModelMetrics.estimators} Trees</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Max Depth</span>
                  <span className="text-white font-bold">{urlModelMetrics.maxDepth} Levels</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Static Features</span>
                  <span className="text-cyan-400 font-bold">{urlModelMetrics.featureCount} Features</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Class Weights</span>
                  <span className="text-emerald-400 font-bold">Balanced</span>
                </div>
              </div>
            </div>

            {/* TreeSHAP Overview Card */}
            <div className="cyber-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-white border-b border-[#1e293b] pb-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  TreeSHAP Explainability
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Predictions are explained using <code className="text-purple-300 font-mono text-[11px]">shap.TreeExplainer</code>. TreeSHAP computes exact Shapley additive attributions for each tree path, separating features that increase phishing likelihood from those establishing legitimacy.
              </p>
              <div className="p-3 rounded-lg bg-[#131926] border border-[#1e293b] text-[11px] font-mono text-slate-300">
                <span className="text-cyan-400 font-bold">Additive Identity:</span>
                <p className="mt-1 text-slate-400">
                  Model Output = Base Value (Prior) + Sum of SHAP Values across all 26 features.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Performance Metric Cards */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Verified Held-Out Evaluation Metrics (Test Set n=40)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Ground-Truth Benchmark
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Accuracy</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {urlModelMetrics.accuracy}%
                </span>
                <span className="text-[10px] text-emerald-400">Held-Out Test Set</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Precision</span>
                <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                  {urlModelMetrics.precision}%
                </span>
                <span className="text-[10px] text-slate-500">Phishing Detection</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Recall</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1 block">
                  {urlModelMetrics.recall}%
                </span>
                <span className="text-[10px] text-slate-500">Phishing True Positives</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">F1-Score</span>
                <span className="text-2xl font-bold text-purple-400 mt-1 block">
                  {urlModelMetrics.f1Score}%
                </span>
                <span className="text-[10px] text-slate-500">Harmonic Mean</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block uppercase">ROC-AUC</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                  {urlModelMetrics.rocAuc}%
                </span>
                <span className="text-[10px] text-slate-500">Area Under Curve</span>
              </div>
            </div>

            {/* Confusion Matrix and Split Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Test Confusion Matrix (Actual vs Predicted)
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[#0d111a] border border-emerald-500/20">
                    <span className="text-[10px] text-slate-500 block">True Negative (Safe)</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {urlModelMetrics.confusionMatrix.tn}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-amber-500/20">
                    <span className="text-[10px] text-slate-500 block">False Positive</span>
                    <span className="text-lg font-bold text-amber-400">
                      {urlModelMetrics.confusionMatrix.fp}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-rose-500/20">
                    <span className="text-[10px] text-slate-500 block">False Negative</span>
                    <span className="text-lg font-bold text-rose-400">
                      {urlModelMetrics.confusionMatrix.fn}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-cyan-500/20">
                    <span className="text-[10px] text-slate-500 block">True Positive (Phish)</span>
                    <span className="text-lg font-bold text-cyan-400">
                      {urlModelMetrics.confusionMatrix.tp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Dataset Partitioning Breakdown
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Labeled Dataset:</span>
                    <span className="text-white font-bold">{urlModelMetrics.datasetTotal} URLs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Training Set (90%):</span>
                    <span className="text-slate-300">{urlModelMetrics.trainSamples} samples (80 legit, 283 phishing)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Held-Out Test Set (10%):</span>
                    <span className="text-cyan-400">{urlModelMetrics.testSamples} samples (23 legit, 17 phishing)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-[#1e293b]">
                    <span>Validation Policy:</span>
                    <span className="text-emerald-400 text-[10px]">Domain-Grouped Split</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Importances Chart */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Top Gini Feature Importances (Random Forest)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">MDI Feature Weights</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={urlModelMetrics.topFeatures}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 25]}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
                    width={130}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-[#0d111a] border border-[#334155] rounded-lg text-xs font-mono space-y-1">
                            <span className="text-cyan-400 font-bold block">{data.name}</span>
                            <span className="text-slate-300">Importance: {data.importance}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB B: SMS NLP Classifier Model */}
      {activeTab === 'sms_model' && (
        <div className="space-y-6">
          {/* Architecture Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="cyber-card p-5 space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
                <div className="flex items-center space-x-2 text-white">
                  <Binary className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                    SMS Smishing NLP Pipeline (TF-IDF + LR)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-400">Model v1.0.0</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The SMS phishing classifier combines <strong className="text-white font-mono">Sublinear TF-IDF Vectorization</strong> with a regularized <strong className="text-white font-mono">Logistic Regression</strong> classifier. The pipeline extracts word and character boundary n-grams (1-2 range) across a vocabulary of 5,000 tokens, accurately isolating high-pressure financial coercion patterns.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Vocabulary</span>
                  <span className="text-white font-bold">{smsModelMetrics.vocabularySize} Tokens</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">N-Gram Range</span>
                  <span className="text-white font-bold">1-2 N-Grams</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Corpus</span>
                  <span className="text-purple-400 font-bold">{smsModelMetrics.datasetTotal} Messages</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Sublinear TF</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
              </div>
            </div>

            {/* Recursive URL Deep Scan Integration */}
            <div className="cyber-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-white border-b border-[#1e293b] pb-2.5">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Recursive Embedded URL Scan
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                SMS text alone does not capture the full threat. PhishShield automatically parses all embedded URLs using regex, passing each extracted link to the 26-feature Random Forest engine and Indian Banking Registry to compute a unified multi-modal risk score.
              </p>
              <div className="p-2.5 rounded-lg bg-[#131926] border border-[#1e293b] text-[11px] font-mono text-cyan-300">
                Composite Risk = Max(NLP Text Score, Embedded URL Risk Scores)
              </div>
            </div>
          </div>

          {/* Verified Performance Metric Cards */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Verified Held-Out Evaluation Metrics (Test Set n=1,041)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Ground-Truth Benchmark
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Accuracy</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {smsModelMetrics.accuracy}%
                </span>
                <span className="text-[10px] text-emerald-400">1,026 / 1,041 Correct</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Precision</span>
                <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                  {smsModelMetrics.precision}%
                </span>
                <span className="text-[10px] text-slate-500">Smish True Precision</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">Recall</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1 block">
                  {smsModelMetrics.recall}%
                </span>
                <span className="text-[10px] text-slate-500">130 of 133 Caught</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b]">
                <span className="text-[10px] text-slate-500 block uppercase">F1-Score</span>
                <span className="text-2xl font-bold text-purple-400 mt-1 block">
                  {smsModelMetrics.f1Score}%
                </span>
                <span className="text-[10px] text-slate-500">Harmonic Mean</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block uppercase">ROC-AUC</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                  {smsModelMetrics.rocAuc}%
                </span>
                <span className="text-[10px] text-slate-500">Area Under Curve</span>
              </div>
            </div>

            {/* Confusion Matrix and Split Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Test Confusion Matrix (Actual vs Predicted)
                </span>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[#0d111a] border border-emerald-500/20">
                    <span className="text-[10px] text-slate-500 block">True Negative (Ham)</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {smsModelMetrics.confusionMatrix.tn}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-amber-500/20">
                    <span className="text-[10px] text-slate-500 block">False Positive</span>
                    <span className="text-lg font-bold text-amber-400">
                      {smsModelMetrics.confusionMatrix.fp}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-rose-500/20">
                    <span className="text-[10px] text-slate-500 block">False Negative</span>
                    <span className="text-lg font-bold text-rose-400">
                      {smsModelMetrics.confusionMatrix.fn}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0d111a] border border-purple-500/20">
                    <span className="text-[10px] text-slate-500 block">True Positive (Spam)</span>
                    <span className="text-lg font-bold text-purple-400">
                      {smsModelMetrics.confusionMatrix.tp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Training & Test Corpus Details
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Authentic SMS Dataset:</span>
                    <span className="text-white font-bold">{smsModelMetrics.datasetTotal} messages</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Training Set (80%):</span>
                    <span className="text-slate-300">{smsModelMetrics.trainSamples} messages</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Held-Out Test Set (20%):</span>
                    <span className="text-purple-400">{smsModelMetrics.testSamples} messages</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-[#1e293b]">
                    <span>Vocabulary Bound:</span>
                    <span className="text-emerald-400 text-[10px]">5,000 Max Features</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Smishing Tokens Chips */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Top Smishing Features (Highest Logistic Regression Coefficients)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Log-Odds Weights</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {smsModelMetrics.topSmishingTokens.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#131926] border border-[#1e293b] flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-300 block">
                      "{item.token}"
                    </span>
                    <span className="text-[10px] text-slate-500 block">{item.type}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-400">
                    +{item.coeff.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB C: Architecture Pipelines */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* URL Pipeline Flow */}
          <div className="cyber-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center space-x-2 text-cyan-400 border-b border-[#1e293b] pb-3">
              <Workflow className="w-4 h-4" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                URL Detection Pipeline (Static Zero-Resolution Architecture)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                { step: '01', title: 'Target Input', desc: 'Raw URL string submitted; zero HTTP resolution performed.' },
                { step: '02', title: 'Feature Extraction', desc: '26 lexical, structural, and brand lure metrics computed.' },
                { step: '03', title: 'Random Forest', desc: '150 decision trees output raw classification probability.' },
                { step: '04', title: 'TreeSHAP Attribution', desc: 'Additive Shapley values calculated for positive & negative impacts.' },
                { step: '05', title: 'Brand Registry', desc: 'tldextract + Damerau-Levenshtein checks against 16 canonical banks.' },
                { step: '06', title: 'Zero-Trust Verdict', desc: 'Composite risk score calibrated with heuristic penalty overrides.' },
              ].map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-1 relative">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                    STEP {s.step}
                  </span>
                  <h4 className="text-xs font-semibold text-white font-mono">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Pipeline Flow */}
          <div className="cyber-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center space-x-2 text-purple-400 border-b border-[#1e293b] pb-3">
              <Workflow className="w-4 h-4" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                SMS Multi-Modal Pipeline (NLP Urgency + Recursive URL Scan)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                { step: '01', title: 'SMS Ingestion', desc: 'In-memory text parsing with regex boundary sanitization.' },
                { step: '02', title: 'TF-IDF Vectorizer', desc: '1,2 n-grams mapped into 5,000-dimensional feature space.' },
                { step: '03', title: 'Logistic Regression', desc: 'Calculates language smishing score and detects coercion tokens.' },
                { step: '04', title: 'URL Extraction', desc: 'Regex isolates all embedded HTTP/HTTPS and shortlinks.' },
                { step: '05', title: 'URL Deep Scan', desc: 'Every link evaluated via the 26-feature RF + SHAP pipeline.' },
                { step: '06', title: 'Composite Score', desc: 'Risk synthesized into unified verdict with customer advisory.' },
              ].map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] space-y-1 relative">
                  <span className="text-[10px] font-mono text-purple-400 font-bold block">
                    STEP {s.step}
                  </span>
                  <h4 className="text-xs font-semibold text-white font-mono">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB D: Operational Limitations */}
      {activeTab === 'limitations' && (
        <div className="cyber-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center space-x-2 text-amber-400 border-b border-[#1e293b] pb-3">
            <Scale className="w-4 h-4" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Model Limitations & Cybersecurity Realities
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In cybersecurity defense, transparent disclosure of machine learning limitations is critical. Statistical models identify learned correlation patterns, but cannot guarantee 100% defense against adversarial zero-day tactics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono uppercase">1. The HTTPS Fallacy</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The presence of HTTPS (SSL/TLS padlock) does <strong className="text-slate-200">not</strong> prove a website is safe or authentic. Over 80% of modern phishing sites use free Domain Validation certificates (Let's Encrypt, Cloudflare). HTTPS only guarantees encrypted transport, not website legitimacy.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-amber-400">
                <Info className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono uppercase">2. Adversarial Evasion & Drift</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adversaries continuously pivot through new generic top-level domains (.xyz, .buzz, .top), punycode homoglyphs, multi-hop shorteners, and newly registered domains (NRDs). Static feature extraction cannot predict novel evasion patterns unseen during training.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Scale className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono uppercase">3. Probabilistic Risk vs Absolute Proof</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A risk score of 15% does not mean zero risk; it represents the statistical confidence of the Random Forest model on the extracted feature vector. PhishShield combines ML scores with heuristic zero-trust overrides to catch known banking impersonations.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#131926] border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-purple-400">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono uppercase">4. Zero-Resolution Sandbox Boundary</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                To guarantee user safety, PhishShield intentionally avoids resolving DNS records, contacting web hosts, or downloading HTML payloads. This protects analysts from drive-by downloads, but limits feature extraction to purely lexical and syntactic structures.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GlobeIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
    </svg>
  );
}

function MessageIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" />
    </svg>
  );
}
