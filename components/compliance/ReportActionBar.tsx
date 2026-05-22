"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconRefresh,
  IconMessageCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { approveReport, requestRevision } from "@/app/actions/report-actions";

export function ReportActionBar({
  reportId,
  projectId,
  reviewerName,
  issueCount,
  approved,
}: {
  reportId: string;
  projectId: string;
  reviewerName: string;
  issueCount: number;
  approved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onApprove() {
    startTransition(async () => {
      await approveReport(reportId, projectId);
      router.push(`/projects?id=${projectId}`);
    });
  }

  function onRequestRevision() {
    startTransition(async () => {
      await requestRevision(projectId);
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2.5 border-t border-border-subtle bg-surface px-5 py-3">
      <div className="flex-1 text-[12px] text-ink-3">
        Reviewed by <strong className="font-medium text-ink">{reviewerName}</strong>{" "}
        · {issueCount} issue{issueCount !== 1 ? "s" : ""} identified ·{" "}
        {approved
          ? "Package approved"
          : "Sign-off required before architect revision"}
      </div>
      <button
        disabled={pending || approved}
        onClick={onRequestRevision}
        className="flex items-center gap-1.5 rounded-lg border border-danger-fg/20 bg-danger-bg px-3.5 py-1.5 text-[12px] text-danger-fg hover:brightness-95 disabled:opacity-50"
      >
        <IconRefresh size={13} />
        Request Revision
      </button>
      <button
        disabled
        className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-1.5 text-[12px] text-ink-2 disabled:opacity-50"
      >
        <IconMessageCircle size={13} />
        Add Comment
      </button>
      <button
        disabled={pending || approved}
        onClick={onApprove}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        <IconCircleCheck size={13} />
        {approved ? "Approved" : "Approve Package"}
      </button>
    </div>
  );
}
