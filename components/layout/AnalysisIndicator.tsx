"use client";

import { IconLoader, IconCircleCheck, IconX } from "@tabler/icons-react";
import { useAnalysis } from "@/contexts/AnalysisContext";

export function AnalysisIndicator() {
  const { status, elapsed, clearAnalysis } = useAnalysis();

  if (status === "idle") return null;

  const done = status === "done";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-lg">
      {done ? (
        <IconCircleCheck size={16} className="shrink-0 text-success-fg" />
      ) : (
        <IconLoader size={16} className="shrink-0 animate-spin text-accent" />
      )}
      <div className="text-[13px] font-medium text-ink">
        {done ? "Analysis complete" : `Analyzing document… ${elapsed}s`}
      </div>
      {!done && (
        <span className="text-[11px] text-ink-3">15–30 s</span>
      )}
      {done && (
        <button
          onClick={clearAnalysis}
          className="ml-1 rounded-md p-0.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          <IconX size={13} />
        </button>
      )}
    </div>
  );
}
