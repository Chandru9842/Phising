import React from 'react';
import { Database, Server, Shield, RefreshCw } from 'lucide-react';

export default function SystemStatus({ health, isChecking, onRefresh }) {
  const isHealthy = health?.status === 'healthy';
  const dbStatus = health?.services?.database || 'unknown';

  return (
    <div className="p-4 rounded-md bg-[#12161F] border border-[#1E2430] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#9CA3AF]" />
            <h3 className="text-xs font-mono font-semibold text-[#F3F4F6] uppercase tracking-wider">
              System Diagnostics
            </h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={isChecking}
            className="flex items-center space-x-1.5 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors px-2 py-1 rounded bg-[#0E121A] border border-[#1E2430] hover:border-[#2B3445] disabled:opacity-50"
            title="Refresh Health Status"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[11px]">Ping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Core API Service */}
          <div className="p-3 rounded-md bg-[#0E121A] border border-[#1E2430] flex items-center space-x-2.5">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isHealthy ? 'bg-[#34D399]' : 'bg-[#F87171]'
              }`}
            />
            <div className="min-w-0">
              <p className="text-[10px] text-[#6B7280] uppercase font-mono truncate">Inference Engine</p>
              <p className="text-xs font-medium text-[#F3F4F6] font-mono truncate">
                {isHealthy ? 'Online (v0.2.0)' : 'Offline / Error'}
              </p>
            </div>
          </div>

          {/* Database Service */}
          <div className="p-3 rounded-md bg-[#0E121A] border border-[#1E2430] flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#6B7280] uppercase font-mono truncate">SQLite Storage</p>
              <p className="text-xs font-medium text-[#F3F4F6] font-mono capitalize truncate">
                {dbStatus === 'connected' ? 'Connected' : dbStatus}
              </p>
            </div>
          </div>

          {/* Brand Registry */}
          <div className="p-3 rounded-md bg-[#0E121A] border border-[#1E2430] flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#6B7280] uppercase font-mono truncate">Registry</p>
              <p className="text-xs font-medium text-[#F3F4F6] font-mono truncate">
                {health?.services?.supported_banks_count || 16} Verified Banks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
