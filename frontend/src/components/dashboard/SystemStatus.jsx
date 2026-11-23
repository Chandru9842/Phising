import React from 'react';
import { Database, Server, Shield, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SystemStatus({ health, isChecking, onRefresh }) {
  const isHealthy = health?.status === 'healthy';
  const dbStatus = health?.services?.database || 'unknown';

  return (
    <div className="p-5 rounded-xl bg-[#0d111a] border border-[#1e293b] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              System Diagnostics
            </h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={isChecking}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded bg-[#131926] border border-[#1e293b] hover:border-slate-700 disabled:opacity-50"
            title="Refresh Health Status"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[11px]">Ping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Core API Service */}
          <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] flex items-center space-x-3">
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${isHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                }`}
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-mono truncate">FastAPI Engine</p>
              <p className="text-xs font-bold text-white font-mono truncate">
                {isHealthy ? 'Online (v0.2.0)' : 'Offline / Error'}
              </p>
            </div>
          </div>

          {/* Database Service */}
          <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] flex items-center space-x-3">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-mono truncate">SQLite Storage</p>
              <p className="text-xs font-bold text-white font-mono capitalize truncate">
                {dbStatus === 'connected' ? 'Connected' : dbStatus}
              </p>
            </div>
          </div>

          {/* Brand Registry */}
          <div className="p-3.5 rounded-lg bg-[#131926] border border-[#1e293b] flex items-center space-x-3">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-mono truncate">Registry</p>
              <p className="text-xs font-bold text-white font-mono truncate">
                {health?.services?.supported_banks_count || 16} Verified Banks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
