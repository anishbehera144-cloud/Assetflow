"use client";

import { RefreshCw } from "lucide-react";

export function ReportRefreshButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
    >
      <RefreshCw size={14} />
      Refresh
    </button>
  );
}