"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "analyzing" | "done" | "error";

type AnalysisState = {
  documentId: string | null;
  projectId: string | null;
  elapsed: number;
  status: Status;
};

type AnalysisContextValue = AnalysisState & {
  startAnalysis: (projectId: string, documentId: string) => void;
  clearAnalysis: () => void;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>({
    documentId: null,
    projectId: null,
    elapsed: 0,
    status: "idle",
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a stable ref to the active Supabase channel so we can clean it up
  // even if the component that started it has unmounted.
  const channelRef = useRef<ReturnType<typeof createClient>["channel"] | null>(null);
  const router = useRouter();

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function removeChannel() {
    if (channelRef.current) {
      createClient().removeChannel(channelRef.current as never);
      channelRef.current = null;
    }
  }

  function startAnalysis(projectId: string, documentId: string) {
    removeChannel();
    stopTimer();

    setState({ documentId, projectId, elapsed: 0, status: "analyzing" });

    timerRef.current = setInterval(
      () => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })),
      1000,
    );

    const supabase = createClient();
    const channel = supabase
      .channel(`analysis-${documentId}`)
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
            removeChannel();
            setState((s) => ({ ...s, status: "done" }));
            router.refresh();
            // Auto-dismiss the "done" pill after 5 s.
            setTimeout(
              () =>
                setState({
                  documentId: null,
                  projectId: null,
                  elapsed: 0,
                  status: "idle",
                }),
              5000,
            );
          }
        },
      )
      .subscribe();

    // Store as unknown to avoid fighting the Supabase generic types.
    channelRef.current = channel as unknown as ReturnType<
      typeof createClient
    >["channel"];
  }

  function clearAnalysis() {
    stopTimer();
    removeChannel();
    setState({ documentId: null, projectId: null, elapsed: 0, status: "idle" });
  }

  // Cleanup when the provider unmounts (full page unload).
  useEffect(() => {
    return () => {
      stopTimer();
      removeChannel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnalysisContext.Provider value={{ ...state, startAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
