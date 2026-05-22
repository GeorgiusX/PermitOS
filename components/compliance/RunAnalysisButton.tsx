"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";
import { analyzeDocument } from "@/app/actions/analyze-document";

export function RunAnalysisButton({
  projectId,
  documentId,
}: {
  projectId: string;
  documentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await analyzeDocument(projectId, documentId);
      if (res && "error" in res) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={run}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        <IconSparkles size={14} />
        {pending ? "Analyzing… (this can take a minute)" : "Run AI Analysis"}
      </button>
      {error && (
        <div className="max-w-sm rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2 text-[11px] text-danger-fg">
          {error}
        </div>
      )}
    </div>
  );
}
