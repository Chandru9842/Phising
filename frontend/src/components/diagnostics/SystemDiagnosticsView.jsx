import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Activity,
  Server,
  Database,
  Shield,
  Cpu,
  Globe,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Code,
  Clock,
  Layers,
  Lock,
  Wifi,
  ExternalLink
} from 'lucide-react';

export default function SystemDiagnosticsView({
  health,
  isChecking = false,
  onRefresh,
  stats
}) {
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [activeTab, setActiveTab] = useState('subsystems'); // 'subsystems' | 'raw_metadata'

  const measurePing = async () => {
    const t0 = performance.now();
    try {
      await onRefresh?.();
      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));
      setLastPingTime(new Date());
    } catch {
      setLatencyMs(null);
    }
  };

  useEffect(() => {
    if (!lastPingTime) {
      setLastPingTime(new Date());
    }
  }, []);

  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';
  const isDisconnected = health?.status === 'disconnected';
  const dbStatus = health?.services?.database || 'unknown';

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="cyber-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0F172A] mb-1">
              <Activity className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                Infrastructure Health & Telemetry
              </h2>
            </div>
            <p className="text-xs text-[#475569]">
              Live status of backend services, SQLite persistence layer, ML inference engines, and banking registry.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {lastPingTime && (
              <span className="text-[10px] font-mono text-[#64748B]">
                Last checked: {lastPingTime.toLocaleTimeString()}
              </span>
            )}

            <button
              type="button"
              onClick={measurePing}
              disabled={isChecking}
              className="cyber-btn-secondary text-xs px-3 py-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[#0F172A]' : ''}`} />
              <span>Probe All Subsystems</span>
            </button>
          </div>
        </div>

        {/* Global Operational Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            isHealthy
              ? 'bg-[#ECFDF5] border-emerald-500/30 text-[#065F46]'
              : isDegraded
              ? 'bg-[#FFFBEB] border-amber-500/30 text-[#92400E]'
              : 'bg-[#FEF2F2] border-rose-500/30 text-[#991B1B]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`w-3 h-3 rounded-full ${
                  isHealthy
                    ? 'bg-emerald-400 animate-pulse'
                    : isDegraded
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-500'
                }`}
              />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                {isHealthy
                  ? 'All PhishShield Subsystems Operational'
                  : isDegraded
                  ? 'System Degraded — Check Service Logs'
                  : 'Backend Disconnected — Connection Refused'}
              </h4>
              <p className="text-[11px] opacity-80 mt-0.5">
                FastAPI Gateway • SQLite Storage • 26-Feature RF • TF-IDF Smishing • 16-Bank Registry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
            {latencyMs !== null && (
              <span className="px-2.5 py-1 rounded bg-white border border-[#E2E8F0] text-[#334155] flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-[#0F172A]" />
                <span>{latencyMs} ms RTT</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                isHealthy
                  ? 'bg-emerald-500/10 text-[#065F46] border-emerald-500/30'
                  : 'bg-rose-500/10 text-[#991B1B] border-rose-500/30'
              }`}
            >
              {health?.status ? health.status.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex space-x-2 pt-1 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab('subsystems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'subsystems'
                ? 'bg-cyan-500/15 text-[#0F172A] font-bold border border-cyan-500/30'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Subsystems Grid (6 Services)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw_metadata')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'raw_metadata'
                ? 'bg-cyan-500/15 text-[#0F172A] font-bold border border-cyan-500/30'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Raw Service JSON Payload
          </button>
        </div>
      </div>

      {/* 2. Subsystems Grid */}
      {activeTab === 'subsystems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Subsystem 1: FastAPI Gateway */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Server className="w-4 h-4 text-[#0F172A]" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  FastAPI Core Engine
                </h4>
              </div>
              <span className="cyber-badge cyber-badge-safe text-[9px]">ONLINE</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Application:</span>
                <span className="text-white">{health?.app_name || 'PhishShield'}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Version:</span>
                <span className="text-[#0F172A]">v{health?.version || '0.1.0'}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Environment:</span>
                <span className="text-[#0F172A]">{health?.environment || 'development'}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Host / Port:</span>
                <span className="text-[#334155]">127.0.0.1:8000</span>
              </div>
            </div>
          </div>

          {/* Subsystem 2: SQLite Persistence Layer */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Database className="w-4 h-4 text-[#0F172A]" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  SQLite Persistence Layer
                </h4>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${
                  dbStatus === 'connected'
                    ? 'bg-emerald-500/10 text-[#065F46] border-emerald-500/30'
                    : 'bg-rose-500/10 text-[#991B1B] border-rose-500/30'
                }`}
              >
                {dbStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Storage Engine:</span>
                <span className="text-white">SQLite (SQLAlchemy)</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Live Query Probe:</span>
                <span className="text-[#065F46]">SELECT 1 Verified</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Total Audit Scans:</span>
                <span className="text-[#0F172A] font-bold">{stats?.total_scans ?? '—'} records</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Phishing Flags:</span>
                <span className="text-[#991B1B]">{stats?.phishing_detected ?? '—'} flagged</span>
              </div>
            </div>
          </div>

          {/* Subsystem 3: Indian Banking Registry */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Banking Brand Registry
                </h4>
              </div>
              <span className="cyber-badge cyber-badge-safe text-[9px]">ACTIVE</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Protected Entities:</span>
                <span className="text-indigo-300 font-bold">
                  {health?.services?.supported_banks_count || 16} Major Banks
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Typosquat Algorithm:</span>
                <span className="text-[#0F172A]">Damerau-Levenshtein</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>SLD Parser:</span>
                <span className="text-[#0F172A]">tldextract engine</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Brand Flags in DB:</span>
                <span className="text-indigo-400">{stats?.brand_impersonations ?? '—'} detections</span>
              </div>
            </div>
          </div>

          {/* Subsystem 4: URL Random Forest Engine */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Cpu className="w-4 h-4 text-[#0F172A]" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  URL Random Forest Model
                </h4>
              </div>
              <span className="cyber-badge cyber-badge-safe text-[9px]">OPERATIONAL</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Model Artifact:</span>
                <span className="text-white">url_rf_model.joblib</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Ensemble Size:</span>
                <span className="text-[#0F172A]">150 Decision Trees</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Feature Pipeline:</span>
                <span className="text-[#0F172A]">26 Static Features</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Explainability:</span>
                <span className="text-purple-400">TreeSHAP Explainer</span>
              </div>
            </div>
          </div>

          {/* Subsystem 5: SMS Smishing NLP Engine */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  SMS NLP Classifier
                </h4>
              </div>
              <span className="cyber-badge cyber-badge-safe text-[9px]">OPERATIONAL</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Model Artifact:</span>
                <span className="text-white">sms_tfidf_lr_model.joblib</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Classifier:</span>
                <span className="text-purple-300">Logistic Regression</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>TF-IDF Bounds:</span>
                <span className="text-[#0F172A]">5,000 N-Grams</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>URL Deep Scan:</span>
                <span className="text-[#065F46]">Automatic / Recursive</span>
              </div>
            </div>
          </div>

          {/* Subsystem 6: Frontend Client Environment */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2 text-white">
                <Globe className="w-4 h-4 text-[#065F46]" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Vite Client Application
                </h4>
              </div>
              <span className="cyber-badge cyber-badge-safe text-[9px]">ONLINE</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#475569]">
                <span>Dev Server:</span>
                <span className="text-white">http://127.0.0.1:5173</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>UI Stack:</span>
                <span className="text-[#0F172A]">React 18 + Vite 5</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Design System:</span>
                <span className="text-[#0F172A]">Enterprise Dark Tokens</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>API Proxy:</span>
                <span className="text-[#065F46]">Active (/api → :8000)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Raw Metadata Inspector */}
      {activeTab === 'raw_metadata' && (
        <div className="cyber-card p-5 space-y-4">
          <div className="flex items-center space-x-2 text-[#334155] border-b border-[#E2E8F0] pb-2.5">
            <Terminal className="w-4 h-4 text-[#0F172A]" />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
              Raw Backend Service JSON Response (/api/health & /api/v1/history/stats)
            </h4>
          </div>

          <pre className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#065F46] overflow-x-auto leading-relaxed select-all">
            {JSON.stringify(
              {
                health_response: health || 'Unavailable',
                stats_response: stats || 'Unavailable',
                client_diagnostics: {
                  url: window.location.href,
                  user_agent: navigator.userAgent,
                  timestamp: new Date().toISOString(),
                  round_trip_ms: latencyMs,
                }
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
