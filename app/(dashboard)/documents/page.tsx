import Link from "next/link";
import {
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
  IconCircleCheck,
  IconAlertCircle,
  IconClock,
  IconShieldCheck,
  IconPlus,
} from "@tabler/icons-react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/projects/Badge";
import { getDocuments } from "@/lib/data/documents";
import type { DocumentDiscipline, DocumentStatus } from "@/types/db";

function disciplineLabel(d: DocumentDiscipline): string {
  const MAP: Record<DocumentDiscipline, string> = {
    architectural: "Architectural",
    landscape: "Landscape",
    mep: "MEP",
    mep_electrical: "MEP — Electrical",
    mep_plumbing: "MEP — Plumbing",
    mep_mechanical: "MEP — Mechanical",
    structural: "Structural",
    survey: "Survey",
    other: "Other",
  };
  return MAP[d] ?? d;
}

function fileSizeLabel(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function StatusIcon({ status }: { status: DocumentStatus }) {
  if (status === "clean")
    return <IconCircleCheck size={14} className="text-success-fg" />;
  if (status === "issues" || status === "rfi")
    return <IconAlertCircle size={14} className="text-danger-fg" />;
  if (status === "advisory")
    return <IconAlertCircle size={14} className="text-accent" />;
  if (status === "analyzing")
    return <IconClock size={14} className="text-ink-3" />;
  return <IconClock size={14} className="text-ink-3" />;
}

function statusBadge(
  status: DocumentStatus,
): { text: string; variant: "success" | "danger" | "accent" | "gray" | "info" | "warn" } {
  switch (status) {
    case "clean":
      return { text: "Clean", variant: "success" };
    case "issues":
      return { text: "Issues", variant: "danger" };
    case "rfi":
      return { text: "RFI", variant: "danger" };
    case "advisory":
      return { text: "Advisory", variant: "accent" };
    case "analyzing":
      return { text: "Analyzing…", variant: "info" };
    default:
      return { text: "Pending", variant: "gray" };
  }
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  // Group by project
  const byProject = new Map<
    string,
    { projectTitle: string; projectId: string; docs: typeof documents }
  >();
  for (const doc of documents) {
    const existing = byProject.get(doc.projectId);
    if (existing) {
      existing.docs.push(doc);
    } else {
      byProject.set(doc.projectId, {
        projectTitle: doc.projectTitle,
        projectId: doc.projectId,
        docs: [doc],
      });
    }
  }

  const groups = Array.from(byProject.values());

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Documents">
        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-accent-hover"
        >
          <IconPlus size={13} />
          New Project
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-5">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-dim">
              <IconFileText size={24} stroke={1.75} className="text-accent" />
            </div>
            <div className="text-[14px] font-medium text-ink">No documents yet</div>
            <div className="max-w-xs text-[12px] text-ink-3">
              Create a project and upload a plan set to start the AI compliance review.
            </div>
            <Link
              href="/projects/new"
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover"
            >
              <IconPlus size={13} />
              New Project
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ projectId, projectTitle, docs }) => (
              <div key={projectId}>
                {/* Project header */}
                <div className="mb-2 flex items-center gap-2">
                  <Link
                    href={`/projects?id=${projectId}`}
                    className="text-[13px] font-medium text-ink hover:text-accent"
                  >
                    {projectTitle}
                  </Link>
                  <span className="text-[11px] text-ink-3">
                    {docs.length} {docs.length === 1 ? "document" : "documents"}
                  </span>
                </div>

                {/* Document rows */}
                <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
                  {docs.map((doc, i) => {
                    const isPdf = doc.mimeType === "application/pdf";
                    const badge = statusBadge(doc.status);
                    const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    );
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i > 0 ? "border-t border-border-subtle" : ""
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                          {isPdf ? (
                            <IconFileTypePdf size={16} className="text-danger-fg" />
                          ) : (
                            <IconPhoto size={16} className="text-accent" />
                          )}
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-medium text-ink">
                              {doc.name}
                            </span>
                            {doc.fileLabel && (
                              <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-3">
                                {doc.fileLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-ink-3">
                            <span>{disciplineLabel(doc.discipline)}</span>
                            {doc.fileSize && (
                              <>
                                <span>·</span>
                                <span>{fileSizeLabel(doc.fileSize)}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{uploadDate}</span>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge text={badge.text} variant={badge.variant} />
                          {(doc.status === "clean" ||
                            doc.status === "issues" ||
                            doc.status === "advisory") && (
                            <Link
                              href={`/compliance?project=${doc.projectId}`}
                              className="flex items-center gap-1 rounded-lg border border-border-strong px-2.5 py-1 text-[11px] text-ink-2 hover:bg-surface-2"
                            >
                              <IconShieldCheck size={12} />
                              View Report
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
