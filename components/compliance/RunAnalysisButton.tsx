"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles, IconLoader } from "@tabler/icons-react";
import { analyzeDocument } from "@/app/actions/analyze-document";
import { createClient } from "@/lib/supabase/client";

export function RunAnalysisButton({
  projectId,
  documentId,
}: {
  projectId: string;
  documentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [analyzing, setAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startTimer() {
    setElapsed(0);
    timerRef.current = setInterval(
      () => setElapsed((s) => s + 1),
      1000,
    );
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await analyzeDocument(projectId, documentId);
      if (res && "error" in res) {
        setError(res.error);
        return;
      }

      // Server action returned immediately — analysis is running in background.
      // Subscribe to Realtime to detect when it's done.
      setAnalyzing(true);
      startTimer();

      const supabase = createClient();
      const channel = supabase
        .channel(`doc-${documentId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "documents",
            filter: `id=eq.${documentId}`,
          },
          (payload) => {
            const status = (payload.new as { status?: string }).status;
            if (status && status !== "analyzing") {
              stopTimer();
              setAnalyzing(false);
              supabase.removeChannel(channel);
              router.refresh();
            }
          },
        )
        .subscribe();
    });
  }

  const busy = pending || analyzing;

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
          ? `Analyzing… ${elapsed}s`
          : pending
            ? "Starting…"
            : "Run AI Analysis"}
      </button>
      {analyzing && (
        <div className="text-[11px] text-ink-3">
          Gemini is reviewing the document — this usually takes 15–30 s
        </div>
      )}
      {error && (
        <div className="max-w-sm rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2 text-[11px] text-danger-fg">
          {error}
        </div>
      )}
    </div>
  );
}
