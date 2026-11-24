import React from 'react';

/**
 * Universal Skeleton Pulse line
 */
export function SkeletonLine({ className = 'h-4 w-full' }) {
  return (
    <div
      className={`animate-pulse bg-[#E2E8F0] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Metric Card Skeleton (Overview 4-card strip)
 */
export function SkeletonMetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center">
            <SkeletonLine className="h-3 w-24" />
            <div className="w-2 h-2 rounded-full bg-[#E2E8F0] animate-pulse" />
          </div>
          <SkeletonLine className="h-8 w-20" />
          <SkeletonLine className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

/**
 * Scan Dossier Skeleton Loader (For URL / SMS scanning in-flight feedback)
 */
export function SkeletonScanDossier() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Target Preview Skeleton */}
      <div className="cyber-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="h-5 w-72" />
          </div>
          <SkeletonLine className="h-6 w-24 rounded-full" />
        </div>

        {/* Directive Banner Skeleton */}
        <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] flex items-start space-x-3">
          <div className="w-5 h-5 rounded-full bg-[#E2E8F0] animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <SkeletonLine className="h-3.5 w-48" />
            <SkeletonLine className="h-3 w-full" />
          </div>
        </div>

        {/* 3 Telemetry Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3"
            >
              <SkeletonLine className="h-3 w-32" />
              <SkeletonLine className="h-8 w-16" />
              <SkeletonLine className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <SkeletonLine className="h-2.5 w-16" />
                <SkeletonLine className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Breakdown Skeleton */}
      <div className="cyber-card p-5 space-y-3">
        <SkeletonLine className="h-4 w-44 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Table Rows Skeleton (Recent Scans / History)
 */
export function SkeletonTableRows({ rows = 5 }) {
  return (
    <div className="divide-y divide-[#E2E8F0] animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-4 h-4 rounded bg-[#E2E8F0] shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-md">
              <div className="h-3.5 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-2.5 bg-[#E2E8F0] rounded w-1/3" />
            </div>
          </div>
          <div className="h-5 w-16 rounded bg-[#E2E8F0] shrink-0" />
          <div className="h-5 w-20 rounded bg-[#E2E8F0] shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

export default {
  SkeletonLine,
  SkeletonMetricCards,
  SkeletonScanDossier,
  SkeletonTableRows
};
