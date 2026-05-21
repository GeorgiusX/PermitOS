import Link from "next/link";
import {
  IconCheck,
  IconEye,
  IconCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import type { ProjectDetail, ProjectDoc } from "@/lib/data/projects";
import {
  projectStatusBadge,
  projectTypeLabel,
} from "@/lib/data/projects";
import type { DocumentDiscipline, DocumentStatus, UserRole } from "@/types/db";
import { Badge } from "./Badge";

const ROLE_LABELS: Record<UserRole, string> = {
  private_provider: "Private Provider",
  architect: "Architect",
  mep_engineer: "MEP Engineer",
  expeditor: "Permit Expeditor",
  developer: "Developer",
  admin: "Admin",
};

const DISC_LABEL: Record<DocumentDiscipline, string> = {
  architectural: "Architectural",
  landscape: "Landscape",
  mep: "MEP",
  mep_electrical: "MEP Electrical",
  mep_plumbing: "MEP Plumbing",
  mep_mechanical: "MEP Mechanical",
  structural: "Structural",
  survey: "Survey",
  other: "Other",
};

const DOC_STATUS_CFG: Record<
  DocumentStatus,
  { text: string; cls: string }
> = {
  clean: { text: "Clean", cls: "bg-success-bg text-success-fg" },
  issues: { text: "Has issues", cls: "bg-danger-bg text-danger-fg" },
  advisory: { text: "Advisory", cls: "bg-warn-bg text-warn-fg" },
  analyzing: { text: "Analyzing…", cls: "bg-info-bg text-info-fg" },
  pending: { text: "Not uploaded", cls: "bg-surface-2 text-ink-3" },
  rfi: { text: "City RFI", cls: "bg-danger-bg text-danger-fg" },
};

function DocRow({ doc }: { doc: ProjectDoc }) {
  const cfg = DOC_STATUS_CFG[doc.status] ?? DOC_STATUS_CFG.pending;
  return (
    <div className="flex items-center gap-2 border-b border-border-subtle py-2 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium text-ink">
          {doc.name}
        </div>
        <div className="text-[10px] text-ink-3">
          {DISC_LABEL[doc.discipline]}
          {doc.fileLabel ? ` · ${doc.fileLabel}` : ""}
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.cls}`}
      >
        {cfg.text}
      </span>
    </div>
  );
}

function WorkflowIcon({ state }: { state: string }) {
  if (state === "done")
    return (
      <div className="z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-success-bg text-success-fg">
        <IconCheck size={12} />
      </div>
    );
  if (state === "active")
    return (
      <div className="z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
        <IconEye size={12} />
      </div>
    );
  return (
    <div className="z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-3">
      <IconCircle size={12} />
    </div>
  );
}

export function DetailPanel({ detail }: { detail: ProjectDetail }) {
  const badge = projectStatusBadge(detail.status);

  const riskColor =
    detail.riskScore !== null
      ? detail.riskScore >= 70
        ? "text-danger-fg"
        : detail.riskScore >= 40
          ? "text-accent"
          : "text-success-fg"
      : "text-accent";

  return (
    <div className="flex min-w-[348px] w-[348px] flex-col overflow-hidden border-l border-border-subtle bg-surface">
      {/* Header */}
      <div className="border-b border-border-subtle p-3.5 pb-3">
        <div className="mb-0.5 text-sm font-medium text-ink">
          {detail.shortTitle}
        </div>
        <div className="mb-2.5 text-[11px] text-ink-3">
          {[
            detail.municipalityName,
            detail.permitNo ? `Permit #${detail.permitNo}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge {...badge} />
          <Badge text={projectTypeLabel(detail.type)} variant="gray" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3.5">
        {/* Documents & AI Analysis */}
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-ink-3">
            Documents &amp; AI Analysis
          </div>
          {detail.docs.length === 0 ? (
            <div className="py-3 text-center text-[11px] text-ink-3">
              No documents uploaded yet
            </div>
          ) : (
            detail.docs.map((doc) => <DocRow key={doc.id} doc={doc} />)
          )}
          {detail.riskScore !== null && (
            <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-surface-2 p-2">
              <div className="text-[10px] text-ink-3">Overall risk</div>
              <div className={`ml-auto text-base font-medium ${riskColor}`}>
                {detail.riskScore}/100
              </div>
              <div className="text-[11px] text-danger-fg">
                {detail.criticalCount} critical
              </div>
              <div className="text-[11px] text-accent">
                {detail.warningCount} advisory
              </div>
            </div>
          )}
        </div>

        {/* Workflow */}
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-ink-3">
            Workflow
          </div>
          {detail.workflow.map((step, i) => (
            <div key={i} className="relative flex items-start gap-2.5">
              {i < detail.workflow.length - 1 && (
                <div className="absolute bottom-[-8px] left-[13px] top-[26px] w-[0.5px] bg-border-subtle" />
              )}
              <WorkflowIcon state={step.state} />
              <div className="flex-1 pb-3.5">
                <div className="text-[12px] font-medium text-ink">
                  {step.name}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    step.state === "active" ? "text-accent" : "text-ink-3"
                  }`}
                >
                  {step.note ||
                    (step.state === "done"
                      ? "Completed"
                      : step.state === "active"
                        ? "In progress — your step"
                        : "Pending")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-ink-3">
            Project team
          </div>
          {detail.members.map((m, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-info-bg text-[9px] font-medium text-info-fg">
                {m.initials}
              </div>
              <span className="text-[12px] text-ink">{m.name}</span>
              <span className="ml-auto text-[10px] text-ink-3">
                {ROLE_LABELS[m.role]}
              </span>
            </div>
          ))}
        </div>

        {/* View compliance report */}
        <Link
          href={`/compliance?project=${detail.id}`}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-surface py-2 text-[12px] text-ink-2 transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
        >
          <IconExternalLink size={12} />
          View AI Compliance Report
        </Link>
      </div>
    </div>
  );
}
