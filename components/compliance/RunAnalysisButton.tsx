"use client";

import { useState, useTransition } from "react";
import { IconSparkles, IconLoader } from "@tabler/icons-react";
import { analyzeDocument } from "@/app/actions/analyze-document";
import { useAnalysis } from "@/contexts/AnalysisContext";

export function RunAnalysisButton({
  projectId,
  documentId,
}: {
  projectId: string;
  documentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { startAnalysis, documentId: activeDocId, status } = useAnalysis();

  const analyzing = activeDocId === documentId && status === "analyzing";
  const busy = pending || analyzing;

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await analyzeDocument(projectId, documentId);
      if (res && "error" in res) {
        setError(res.error);
        return;
      }
      // Server action returned — hand off tracking to the layout-level context
      // so progress survives navigation.
      startAnalysis(projectId, documentId);
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={run}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {analyzing ? (
          <IconLoader size={14} className="animate-spin" />
        ) : (
          <IconSparkles size={14} />
        )}
        {analyzing
          ? "Analyzing…"
          : pending
            ? "Starting…"
            : "Run AI Analysis"}
      </button>
      {error && (
        <div className="max-w-sm rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2 text-[11px] text-danger-fg">
          {error}
        </div>
      )}
    </div>
  );
}
