import { createClient } from "@/lib/supabase/server";
import type {
  ProjectStatus,
  ProjectType,
  UserRole,
  WorkflowState,
  DocumentDiscipline,
  DocumentStatus,
} from "@/types/db";

// ── Badge helpers ────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "gray"
  | "info"
  | "warn"
  | "success"
  | "danger"
  | "accent";

export type StatusBadge = { text: string; variant: BadgeVariant };

const STATUS_BADGE: Record<ProjectStatus, StatusBadge> = {
  draft: { text: "Draft", variant: "gray" },
  ai_review_pending: { text: "AI review pending", variant: "info" },
  ai_review_complete: { text: "AI review complete", variant: "info" },
  provider_review: { text: "Provider review", variant: "warn" },
  revision_requested: { text: "Revision requested", variant: "danger" },
  approved: { text: "Approved", variant: "success" },
  submitted: { text: "Submitted to city", variant: "success" },
  rfi_received: { text: "City RFI received", variant: "danger" },
  permit_issued: { text: "Permit issued", variant: "success" },
  rejected: { text: "Rejected", variant: "danger" },
};

export function projectStatusBadge(status: ProjectStatus): StatusBadge {
  return STATUS_BADGE[status] ?? { text: status, variant: "gray" };
}

/** 7-element array: 1 = done, 0.5 = in-progress, 0 = pending */
const STATUS_PIPELINE: Record<ProjectStatus, number[]> = {
  draft: [0, 0, 0, 0, 0, 0, 0],
  ai_review_pending: [1, 0.5, 0, 0, 0, 0, 0],
  ai_review_complete: [1, 1, 0, 0, 0, 0, 0],
  provider_review: [1, 1, 0.5, 0, 0, 0, 0],
  revision_requested: [1, 1, 1, 0.5, 0, 0, 0],
  approved: [1, 1, 1, 1, 1, 0, 0],
  submitted: [1, 1, 1, 1, 1, 0.5, 0],
  rfi_received: [1, 1, 1, 1, 1, 1, 0.5],
  permit_issued: [1, 1, 1, 1, 1, 1, 1],
  rejected: [1, 1, 1, 0, 0, 0, 0],
};

export function projectPipeline(status: ProjectStatus): number[] {
  return STATUS_PIPELINE[status] ?? [0, 0, 0, 0, 0, 0, 0];
}

// ── Filter helpers ────────────────────────────────────────────────────────────

export type FilterKey = "all" | "review" | "action" | "submitted" | "approved";

const FILTER_MAP: Partial<Record<FilterKey, ProjectStatus[]>> = {
  review: ["ai_review_pending", "ai_review_complete", "provider_review"],
  action: ["revision_requested", "rfi_received"],
  submitted: ["submitted"],
  approved: ["approved", "permit_issued"],
};

export function filterProjects<T extends { status: ProjectStatus }>(
  projects: T[],
  filter: string,
): T[] {
  const statuses = FILTER_MAP[filter as FilterKey];
  if (!statuses) return projects;
  return projects.filter((p) => statuses.includes(p.status));
}

export type ProjectMemberView = {
  role: UserRole;
  name: string;
  initials: string;
};

export type ProjectCard = {
  id: string;
  title: string;
  shortTitle: string;
  municipalityName: string | null;
  type: ProjectType;
  status: ProjectStatus;
  riskScore: number | null;
  permitNo: string | null;
  updatedAt: string;
  members: ProjectMemberView[];
};

export type ProjectDoc = {
  id: string;
  name: string;
  discipline: DocumentDiscipline;
  fileLabel: string | null;
  status: DocumentStatus;
  uploadedBy: string | null;
  uploadedAt: string;
};

export type WorkflowStepView = {
  index: number;
  name: string;
  state: WorkflowState;
  note: string | null;
};

export type ProjectDetail = ProjectCard & {
  address: string | null;
  developerName: string | null;
  criticalCount: number;
  warningCount: number;
  docs: ProjectDoc[];
  workflow: WorkflowStepView[];
};

const TYPE_LABEL: Record<ProjectType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed-Use",
};

export function projectTypeLabel(t: ProjectType) {
  return TYPE_LABEL[t];
}

/** All projects the signed-in user is a member of (RLS-scoped), newest first. */
export async function getProjects(): Promise<ProjectCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, title, short_title, type, status, risk_score, permit_no, updated_at,
       municipality:municipalities(name),
       members:project_members(role, profile:profiles(full_name, email, avatar_initials))`,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    shortTitle: p.short_title ?? p.title,
    municipalityName: p.municipality?.name ?? null,
    type: p.type,
    status: p.status,
    riskScore: p.risk_score,
    permitNo: p.permit_no,
    updatedAt: p.updated_at,
    members: (p.members ?? []).map((m) => ({
      role: m.role,
      name: m.profile?.full_name || m.profile?.email || "Member",
      initials: m.profile?.avatar_initials ?? "?",
    })),
  }));
}

/** Single project with documents, workflow, team and report counts. */
export async function getProjectDetail(
  id: string,
): Promise<ProjectDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, title, short_title, address, type, status, risk_score, permit_no,
       developer_name, updated_at,
       municipality:municipalities(name),
       members:project_members(role, profile:profiles(full_name, email, avatar_initials)),
       documents(id, name, discipline, file_label, status, uploaded_by, uploaded_at),
       workflow_steps(step_index, name, state, note),
       compliance_reports(critical_count, warning_count)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const latestReport = data.compliance_reports?.[0] ?? null;

  return {
    id: data.id,
    title: data.title,
    shortTitle: data.short_title ?? data.title,
    address: data.address,
    developerName: data.developer_name,
    municipalityName: data.municipality?.name ?? null,
    type: data.type,
    status: data.status,
    riskScore: data.risk_score,
    permitNo: data.permit_no,
    updatedAt: data.updated_at,
    criticalCount: latestReport?.critical_count ?? 0,
    warningCount: latestReport?.warning_count ?? 0,
    members: (data.members ?? []).map((m) => ({
      role: m.role,
      name: m.profile?.full_name || m.profile?.email || "Member",
      initials: m.profile?.avatar_initials ?? "?",
    })),
    docs: (data.documents ?? [])
      .map((d) => ({
        id: d.id,
        name: d.name,
        discipline: d.discipline,
        fileLabel: d.file_label,
        status: d.status,
        uploadedBy: d.uploaded_by,
        uploadedAt: d.uploaded_at,
      })),
    workflow: (data.workflow_steps ?? [])
      .slice()
      .sort((a, b) => a.step_index - b.step_index)
      .map((w) => ({
        index: w.step_index,
        name: w.name,
        state: w.state,
        note: w.note,
      })),
  };
}
