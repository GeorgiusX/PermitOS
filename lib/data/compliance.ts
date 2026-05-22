import { createClient } from "@/lib/supabase/server";
import type {
  ProjectStatus,
  ProjectType,
  IssueSeverity,
  IssueConfidence,
  IssueStatus,
  DocumentDiscipline,
  DocumentStatus,
} from "@/types/db";

export type ReportIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  codeRef: string | null;
  location: string | null;
  confidence: IssueConfidence;
  discipline: DocumentDiscipline;
  status: IssueStatus;
  calloutX: number | null;
  calloutY: number | null;
};

export type ReportDocTab = {
  id: string;
  name: string;
  discipline: DocumentDiscipline;
  status: DocumentStatus;
};

export type ComplianceReportView = {
  reportId: string;
  projectId: string;
  projectTitle: string;
  shortTitle: string;
  municipalityName: string | null;
  permitNo: string | null;
  status: ProjectStatus;
  type: ProjectType;
  riskScore: number | null;
  summary: string | null;
  criticalCount: number;
  warningCount: number;
  passCount: number;
  aiProvider: string | null;
  createdAt: string;
  documentName: string | null;
  documentLabel: string | null;
  documentStoragePath: string | null;
  documentMimeType: string | null;
  documents: ReportDocTab[];
  issues: ReportIssue[];
};

/** Minimal project header used when a project has no report yet. */
export type ReportProjectStub = {
  projectId: string;
  projectTitle: string;
  shortTitle: string;
  municipalityName: string | null;
  permitNo: string | null;
  status: ProjectStatus;
  type: ProjectType;
  documents: ReportDocTab[];
};

export type ComplianceResult =
  | { kind: "report"; report: ComplianceReportView }
  | { kind: "empty"; project: ReportProjectStub }
  | { kind: "not_found" };

/** Latest compliance report for a project (RLS-scoped), with issues + doc tabs. */
export async function getComplianceReport(
  projectId: string,
): Promise<ComplianceResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, title, short_title, permit_no, status, type, risk_score,
       municipality:municipalities(name),
       documents(id, name, discipline, status, file_label),
       compliance_reports(
         id, risk_score, summary, critical_count, warning_count, pass_count,
         ai_provider, created_at,
         document:documents(name, file_label, storage_path, mime_type),
         issues(id, severity, title, description, code_ref, location,
                confidence, discipline, status, callout_x, callout_y)
       )`,
    )
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { kind: "not_found" };

  const documents: ReportDocTab[] = (data.documents ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    discipline: d.discipline,
    status: d.status,
  }));

  const reports = (data.compliance_reports ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const latest = reports[0];

  if (!latest) {
    return {
      kind: "empty",
      project: {
        projectId: data.id,
        projectTitle: data.title,
        shortTitle: data.short_title ?? data.title,
        municipalityName: data.municipality?.name ?? null,
        permitNo: data.permit_no,
        status: data.status,
        type: data.type,
        documents,
      },
    };
  }

  const issues: ReportIssue[] = (latest.issues ?? []).map((i) => ({
    id: i.id,
    severity: i.severity,
    title: i.title,
    description: i.description,
    codeRef: i.code_ref,
    location: i.location,
    confidence: i.confidence,
    discipline: i.discipline,
    status: i.status,
    calloutX: i.callout_x,
    calloutY: i.callout_y,
  }));

  // Critical first, then advisory, then pass; preserve insertion order within a tier.
  const SEV_RANK: Record<IssueSeverity, number> = {
    critical: 0,
    advisory: 1,
    pass: 2,
  };
  issues.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  return {
    kind: "report",
    report: {
      reportId: latest.id,
      projectId: data.id,
      projectTitle: data.title,
      shortTitle: data.short_title ?? data.title,
      municipalityName: data.municipality?.name ?? null,
      permitNo: data.permit_no,
      status: data.status,
      type: data.type,
      riskScore: latest.risk_score ?? data.risk_score,
      summary: latest.summary,
      criticalCount: latest.critical_count,
      warningCount: latest.warning_count,
      passCount: latest.pass_count,
      aiProvider: latest.ai_provider,
      createdAt: latest.created_at,
      documentName: latest.document?.name ?? null,
      documentLabel: latest.document?.file_label ?? null,
      documentStoragePath: latest.document?.storage_path ?? null,
      documentMimeType: latest.document?.mime_type ?? null,
      documents,
      issues,
    },
  };
}
