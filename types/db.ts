/**
 * Convenience aliases over the generated Supabase types.
 * Import row/enum types from here in app code instead of digging into
 * Database["public"]["Tables"][...] everywhere.
 */
import type { Tables, TablesInsert, Enums } from "@/types/database";

// Row types
export type Organization = Tables<"organizations">;
export type Profile = Tables<"profiles">;
export type Municipality = Tables<"municipalities">;
export type MunicipalityRule = Tables<"municipality_rules">;
export type Project = Tables<"projects">;
export type ProjectMember = Tables<"project_members">;
export type WorkflowStep = Tables<"workflow_steps">;
export type DocumentRow = Tables<"documents">;
export type ComplianceReport = Tables<"compliance_reports">;
export type Issue = Tables<"issues">;
export type Thread = Tables<"threads">;
export type Message = Tables<"messages">;
export type Deadline = Tables<"deadlines">;
export type AuditLog = Tables<"audit_logs">;

// Insert types (handy for server actions)
export type ProjectInsert = TablesInsert<"projects">;
export type WorkflowStepInsert = TablesInsert<"workflow_steps">;
export type DocumentInsert = TablesInsert<"documents">;

// Enums
export type UserRole = Enums<"user_role">;
export type ProjectType = Enums<"project_type">;
export type ProjectStatus = Enums<"project_status">;
export type DocumentDiscipline = Enums<"document_discipline">;
export type DocumentStatus = Enums<"document_status">;
export type IssueSeverity = Enums<"issue_severity">;
export type IssueConfidence = Enums<"issue_confidence">;
export type IssueStatus = Enums<"issue_status">;
export type WorkflowState = Enums<"workflow_state">;
export type DeadlineUrgency = Enums<"deadline_urgency">;
export type OrgType = Enums<"org_type">;
