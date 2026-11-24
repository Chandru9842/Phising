import React from 'react';
import { Database, Server, Shield, RefreshCw, Cpu } from 'lucide-react';

export default function SystemStatus({ health, isChecking, onRefresh }) {
  const isHealthy = health?.status === 'healthy';
  const dbStatus = health?.services?.database || 'unknown';

  return (
    <div className="p-5 rounded-lg bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#475569]" />
            <h3 className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
              System Diagnostics
            </h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={isChecking}
            className="flex items-center space-x-1.5 text-xs text-[#475569] hover:text-[#0F172A] transition-colors px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] disabled:opacity-50"
            title="Refresh Health Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="font-mono text-xs">Ping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Core API Service */}
          <div className="p-3.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
            <Cpu className="w-4 h-4 text-[#475569] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-[#64748B] uppercase font-mono truncate">Inference Engine</p>
              <p className="text-[13px] font-semibold text-[#0F172A] font-mono truncate">
                {isChecking ? 'Checking...' : isHealthy ? 'Online (v0.2.0)' : 'Offline / Error'}
              </p>
            </div>
          </div>

          {/* Database Service */}
          <div className="p-3.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
            <Database className="w-4 h-4 text-[#475569] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-[#64748B] uppercase font-mono truncate">SQLite Storage</p>
              <p className="text-[13px] font-semibold text-[#0F172A] font-mono capitalize truncate">
                {isChecking ? 'Connecting...' : dbStatus === 'connected' ? 'Connected' : dbStatus}
              </p>
            </div>
          </div>

          {/* Brand Registry */}
          <div className="p-3.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center space-x-3">
            <Shield className="w-4 h-4 text-[#475569] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-[#64748B] uppercase font-mono truncate">Registry</p>
              <p className="text-[13px] font-semibold text-[#0F172A] font-mono truncate">
                {health?.services?.supported_banks_count || 16} RBI Banks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
