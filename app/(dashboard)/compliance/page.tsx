import Link from "next/link";
import {
  IconDownload,
  IconShieldCheck,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { getComplianceReport } from "@/lib/data/compliance";
import { createClient } from "@/lib/supabase/server";
import { projectStatusBadge, projectTypeLabel } from "@/lib/data/projects";
import { Badge } from "@/components/projects/Badge";
import { RiskBox } from "@/components/compliance/RiskBox";
import { IssuesPanel } from "@/components/compliance/IssuesPanel";
import { PlanViewer } from "@/components/compliance/PlanViewer";
import { ReportActionBar } from "@/components/compliance/ReportActionBar";
import { RunAnalysisButton } from "@/components/compliance/RunAnalysisButton";

function Breadcrumb({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center gap-1.5 text-[13px]">
      <Link href="/projects" className="text-ink-3 transition-colors hover:text-ink-2">
        Projects
      </Link>
      <span className="text-ink-3">/</span>
      <span className="font-medium text-ink">{label}</span>
    </div>
  );
}

export default async function CompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectId } = await searchParams;

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <IconShieldCheck size={36} className="text-ink-3" />
        <div className="text-[13px] font-medium text-ink-2">
          No project selected
        </div>
        <div className="text-[12px] text-ink-3">
          Open a project and choose “View AI Compliance Report”.
        </div>
        <Link
          href="/projects"
          className="mt-1 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover"
        >
          Go to Projects
        </Link>
      </div>
    );
  }

  const result = await getComplianceReport(projectId);

  if (result.kind === "not_found") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <IconAlertCircle size={36} className="text-ink-3" />
        <div className="text-[13px] font-medium text-ink-2">
          Project not found
        </div>
        <Link
          href="/projects"
          className="mt-1 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  // Empty: project exists but has no compliance report yet.
  if (result.kind === "empty") {
    const p = result.project;
    const hasDocs = p.documents.length > 0;
    const firstDocId = p.documents[0]?.id ?? null;
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-5">
          <Breadcrumb label={`${p.shortTitle} — AI Compliance Report`} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <IconShieldCheck size={40} className="text-accent" />
          <div className="text-[14px] font-medium text-ink">
            No compliance analysis yet
          </div>
          <div className="max-w-sm text-[12px] text-ink-3">
            {hasDocs
              ? "Run the AI compliance review to check this plan set against the municipality's adopted rules."
              : "Upload a plan set on this project before running the AI compliance review."}
          </div>
          {hasDocs && firstDocId && (
            <RunAnalysisButton projectId={p.projectId} documentId={firstDocId} />
          )}
        </div>
      </div>
    );
  }

  const r = result.report;
  const badge = projectStatusBadge(r.status);
  const sheetLabel = r.documentLabel || r.documentName || "Plan sheet";
  const reviewedAt = new Date(r.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let reviewerName = "Reviewer";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    reviewerName = profile?.full_name || profile?.email || "Reviewer";
  }

  const approved = r.status === "approved" || r.status === "submitted";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-5">
        <Breadcrumb label={`${r.shortTitle} — AI Compliance Report`} />
        <button
          disabled
          className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-1.5 text-[12px] text-ink-2 disabled:opacity-50"
        >
          <IconDownload size={13} />
          Export
        </button>
      </div>

      {/* Doc tabs */}
      {r.documents.length > 0 && (
        <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-b border-border-subtle bg-surface px-4">
          {r.documents.map((doc, i) => {
            const active = doc.name === r.documentName || (r.documentName === null && i === 0);
            const col =
              doc.status === "clean"
                ? "text-success-fg"
                : doc.status === "issues" || doc.status === "rfi"
                  ? "text-danger-fg"
                  : doc.status === "advisory"
                    ? "text-accent"
                    : "text-ink-3";
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-3 text-[12px] ${
                  active
                    ? "border-accent font-medium text-accent"
                    : "border-transparent text-ink-2"
                }`}
              >
                <IconCircleCheck size={12} className={col} />
                {doc.name}
              </div>
            );
          })}
        </div>
      )}

      {/* Report header: info + risk box */}
      <div className="flex shrink-0 items-start gap-5 border-b border-border-subtle bg-surface px-5 py-3.5">
        <div className="flex-1">
          <div className="mb-0.5 text-[15px] font-medium text-ink">
            {r.documentName ? `${r.documentName} — ${r.projectTitle}` : r.projectTitle}
          </div>
          <div className="mb-2 text-[11px] text-ink-3">
            {[r.municipalityName, r.permitNo ? `Permit #${r.permitNo}` : null, r.documentLabel]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge {...badge} />
            <Badge text={projectTypeLabel(r.type)} variant="gray" />
            <Badge text={`Reviewed ${reviewedAt}`} variant="gray" />
            {r.aiProvider && (
              <Badge text={`AI: ${r.aiProvider}`} variant="info" />
            )}
          </div>
        </div>
        <RiskBox
          score={r.riskScore}
          critical={r.criticalCount}
          advisory={r.warningCount}
          total={r.issues.length}
        />
      </div>

      {/* Summary */}
      {r.summary && (
        <div className="shrink-0 border-b border-border-subtle bg-surface-2 px-5 py-2.5 text-[12px] leading-relaxed text-ink-2">
          {r.summary}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <IssuesPanel issues={r.issues} />
        <PlanViewer
          issues={r.issues}
          sheetLabel={sheetLabel}
          projectTitle={r.projectTitle}
          permitNo={r.permitNo}
        />
      </div>

      {/* Action bar */}
      <ReportActionBar
        reportId={r.reportId}
        projectId={r.projectId}
        reviewerName={reviewerName}
        issueCount={r.issues.length}
        approved={approved}
      />
    </div>
  );
}
