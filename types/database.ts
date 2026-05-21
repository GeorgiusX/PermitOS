/**
 * PermitOS database types.
 *
 * Hand-written to match supabase/migrations/0001_initial_schema.sql.
 * Once a live Supabase project is connected, regenerate the canonical version:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 */

export type OrgType =
  | "architecture"
  | "mep_engineering"
  | "structural_engineering"
  | "private_provider"
  | "expeditor"
  | "developer";

export type UserRole =
  | "architect"
  | "mep_engineer"
  | "private_provider"
  | "expeditor"
  | "developer"
  | "admin";

export type ProjectType = "residential" | "commercial" | "mixed_use";

export type ProjectStatus =
  | "draft"
  | "ai_review_pending"
  | "ai_review_complete"
  | "provider_review"
  | "revision_requested"
  | "approved"
  | "submitted"
  | "rfi_received"
  | "permit_issued"
  | "rejected";

export type DocumentDiscipline =
  | "architectural"
  | "landscape"
  | "mep"
  | "mep_electrical"
  | "mep_plumbing"
  | "mep_mechanical"
  | "structural"
  | "survey"
  | "other";

export type DocumentStatus =
  | "pending"
  | "analyzing"
  | "clean"
  | "issues"
  | "advisory"
  | "rfi";

export type IssueSeverity = "critical" | "advisory" | "pass";
export type IssueConfidence = "strong" | "medium" | "weak";
export type IssueStatus = "open" | "flagged" | "reviewed" | "resolved";
export type WorkflowState = "done" | "active" | "waiting";
export type DeadlineUrgency = "red" | "amber" | "green";

type Timestamps = { created_at: string };

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  created_at: string;
}

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  org_id: string | null;
  avatar_initials: string;
  created_at: string;
}

export type Municipality = {
  id: string;
  name: string;
  county: string | null;
  state: string;
  codes_version: string | null;
  is_live: boolean;
  last_updated: string;
  created_at: string;
}

export type MunicipalityRule = {
  id: string;
  municipality_id: string;
  code: string;
  title: string;
  description: string;
  category: DocumentDiscipline;
  effective_date: string;
  source_url: string | null;
  is_active: boolean;
  last_verified: string;
  created_at: string;
}

export type Project = {
  id: string;
  title: string;
  short_title: string | null;
  address: string | null;
  municipality_id: string | null;
  permit_no: string | null;
  type: ProjectType;
  status: ProjectStatus;
  risk_score: number | null;
  developer_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectMember = {
  project_id: string;
  user_id: string;
  role: UserRole;
  added_at: string;
}

export type WorkflowStep = {
  id: string;
  project_id: string;
  step_index: number;
  name: string;
  state: WorkflowState;
  note: string | null;
  assigned_to: string | null;
  completed_at: string | null;
}

export type DocumentRow = {
  id: string;
  project_id: string;
  name: string;
  discipline: DocumentDiscipline;
  file_label: string | null;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: number;
  status: DocumentStatus;
  uploaded_by: string | null;
  uploaded_at: string;
}

export type ComplianceReport = {
  id: string;
  document_id: string;
  project_id: string;
  risk_score: number | null;
  summary: string | null;
  critical_count: number;
  warning_count: number;
  pass_count: number;
  ai_provider: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export type Issue = {
  id: string;
  report_id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  code_ref: string | null;
  location: string | null;
  confidence: IssueConfidence;
  discipline: DocumentDiscipline;
  status: IssueStatus;
  callout_x: number | null;
  callout_y: number | null;
  created_at: string;
}

export type Thread = {
  id: string;
  project_id: string;
  title: string;
  created_by: string | null;
  created_at: string;
}

export type Message = {
  id: string;
  thread_id: string;
  user_id: string | null;
  content: string;
  ref_issue_id: string | null;
  ref_document_id: string | null;
  created_at: string;
}

export type Deadline = {
  id: string;
  project_id: string;
  name: string;
  due_date: string;
  urgency: DeadlineUrgency;
  completed: boolean;
  created_at: string;
}

export type AuditLog = {
  id: string;
  project_id: string | null;
  user_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

/** Generic table shape Supabase's client expects. */
type TableShape<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableShape<Organization, Omit<Organization, "id" | "created_at"> & Partial<Timestamps>>;
      profiles: TableShape<Profile, Omit<Profile, "avatar_initials" | "created_at"> & Partial<Timestamps>>;
      municipalities: TableShape<Municipality>;
      municipality_rules: TableShape<MunicipalityRule>;
      projects: TableShape<Project, Omit<Project, "id" | "created_at" | "updated_at"> & Partial<Project>>;
      project_members: TableShape<ProjectMember>;
      workflow_steps: TableShape<WorkflowStep>;
      documents: TableShape<DocumentRow>;
      compliance_reports: TableShape<ComplianceReport>;
      issues: TableShape<Issue>;
      threads: TableShape<Thread>;
      messages: TableShape<Message>;
      deadlines: TableShape<Deadline>;
      audit_logs: TableShape<AuditLog>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_project_member: {
        Args: { p_project_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      org_type: OrgType;
      user_role: UserRole;
      project_type: ProjectType;
      project_status: ProjectStatus;
      document_discipline: DocumentDiscipline;
      document_status: DocumentStatus;
      issue_severity: IssueSeverity;
      issue_confidence: IssueConfidence;
      issue_status: IssueStatus;
      workflow_state: WorkflowState;
      deadline_urgency: DeadlineUrgency;
    };
  };
};
