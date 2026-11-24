import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function NetworkErrorCard({
  title,
  message,
  details,
  onRetry,
  isRetrying = false
}) {
  const { t } = useTranslation();

  const finalTitle = title || t('network.offlineTitle', {}, 'Connection / Network Error');
  const finalMessage = message || t('network.offlineMessage', {}, 'An error occurred while communicating with the security engine. Please check your internet connection and verify that the backend server is running.');

  return (
    <div className="rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-sm animate-fadeIn">
      {/* Blue Top Header Strip (Pic-1 Style) */}
      <div className="bg-[#1D4ED8] text-white px-5 py-3 font-semibold text-xs sm:text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="font-mono tracking-wide uppercase">Network & Security Gateway Alert</span>
        </div>
        <span className="text-[11px] font-mono opacity-80">HTTP Status: Offline</span>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">
            {finalTitle}
          </h3>
          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
            {finalMessage}
          </p>
        </div>

        {/* Technical Exception or Status Box */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#334155] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#991B1B] font-semibold text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t('network.connectionDiagnostics', {}, 'Connection Diagnostics:')}</span>
          </div>
          <p className="text-[11px] text-[#475569] break-all">
            {details || 'Target: http://127.0.0.1:8000/api — Network request failed (ERR_NETWORK / Connection Refused)'}
          </p>
        </div>

        {/* Prominent Action Button (Pic-1 Style) */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full py-2.5 px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>
              {isRetrying
                ? t('network.retrying', {}, 'Checking Network Connection...')
                : t('network.retryButton', {}, 'Check Internet & Retry Connection')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
