export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          ai_provider: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          critical_count: number
          document_id: string
          id: string
          pass_count: number
          project_id: string
          risk_score: number | null
          summary: string | null
          warning_count: number
        }
        Insert: {
          ai_provider?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          critical_count?: number
          document_id: string
          id?: string
          pass_count?: number
          project_id: string
          risk_score?: number | null
          summary?: string | null
          warning_count?: number
        }
        Update: {
          ai_provider?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          critical_count?: number
          document_id?: string
          id?: string
          pass_count?: number
          project_id?: string
          risk_score?: number | null
          summary?: string | null
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string
          id: string
          name: string
          project_id: string
          urgency: Database["public"]["Enums"]["deadline_urgency"]
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date: string
          id?: string
          name: string
          project_id: string
          urgency?: Database["public"]["Enums"]["deadline_urgency"]
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          name?: string
          project_id?: string
          urgency?: Database["public"]["Enums"]["deadline_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          discipline: Database["public"]["Enums"]["document_discipline"]
          file_label: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          project_id: string
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          uploaded_at: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          discipline?: Database["public"]["Enums"]["document_discipline"]
          file_label?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          discipline?: Database["public"]["Enums"]["document_discipline"]
          file_label?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          callout_x: number | null
          callout_y: number | null
          code_ref: string | null
          confidence: Database["public"]["Enums"]["issue_confidence"]
          created_at: string
          description: string
          discipline: Database["public"]["Enums"]["document_discipline"]
          id: string
          location: string | null
          report_id: string
          severity: Database["public"]["Enums"]["issue_severity"]
          status: Database["public"]["Enums"]["issue_status"]
          title: string
        }
        Insert: {
          callout_x?: number | null
          callout_y?: number | null
          code_ref?: string | null
          confidence?: Database["public"]["Enums"]["issue_confidence"]
          created_at?: string
          description: string
          discipline?: Database["public"]["Enums"]["document_discipline"]
          id?: string
          location?: string | null
          report_id: string
          severity: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
        }
        Update: {
          callout_x?: number | null
          callout_y?: number | null
          code_ref?: string | null
          confidence?: Database["public"]["Enums"]["issue_confidence"]
          created_at?: string
          description?: string
          discipline?: Database["public"]["Enums"]["document_discipline"]
          id?: string
          location?: string | null
          report_id?: string
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "compliance_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          ref_document_id: string | null
          ref_issue_id: string | null
          thread_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          ref_document_id?: string | null
          ref_issue_id?: string | null
          thread_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          ref_document_id?: string | null
          ref_issue_id?: string | null
          thread_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ref_document_id_fkey"
            columns: ["ref_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_ref_issue_id_fkey"
            columns: ["ref_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          codes_version: string | null
          county: string | null
          created_at: string
          id: string
          is_live: boolean
          last_updated: string
          name: string
          state: string
        }
        Insert: {
          codes_version?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_live?: boolean
          last_updated?: string
          name: string
          state?: string
        }
        Update: {
          codes_version?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_live?: boolean
          last_updated?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      municipality_rules: {
        Row: {
          category: Database["public"]["Enums"]["document_discipline"]
          code: string
          created_at: string
          description: string
          effective_date: string
          id: string
          is_active: boolean
          last_verified: string
          municipality_id: string
          source_url: string | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["document_discipline"]
          code: string
          created_at?: string
          description: string
          effective_date?: string
          id?: string
          is_active?: boolean
          last_verified?: string
          municipality_id: string
          source_url?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_discipline"]
          code?: string
          created_at?: string
          description?: string
          effective_date?: string
          id?: string
          is_active?: boolean
          last_verified?: string
          municipality_id?: string
          source_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipality_rules_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["org_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["org_type"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["org_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_initials?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_initials?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          added_at: string
          project_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          added_at?: string
          project_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          added_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          developer_name: string | null
          id: string
          municipality_id: string | null
          permit_no: string | null
          risk_score: number | null
          short_title: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          developer_name?: string | null
          id?: string
          municipality_id?: string | null
          permit_no?: string | null
          risk_score?: number | null
          short_title?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          developer_name?: string | null
          id?: string
          municipality_id?: string | null
          permit_no?: string | null
          risk_score?: number | null
          short_title?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_versions: {
        Row: {
          changed_at: string
          changed_by: string | null
          code: string
          description: string
          effective_date: string
          id: string
          rule_id: string
          title: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          code: string
          description: string
          effective_date: string
          id?: string
          rule_id: string
          title: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          code?: string
          description?: string
          effective_date?: string
          id?: string
          rule_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rule_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_versions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "municipality_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          id: string
          name: string
          note: string | null
          project_id: string
          state: Database["public"]["Enums"]["workflow_state"]
          step_index: number
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          id?: string
          name: string
          note?: string | null
          project_id: string
          state?: Database["public"]["Enums"]["workflow_state"]
          step_index: number
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          id?: string
          name?: string
          note?: string | null
          project_id?: string
          state?: Database["public"]["Enums"]["workflow_state"]
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      deadline_urgency: "red" | "amber" | "green"
      document_discipline:
        | "architectural"
        | "landscape"
        | "mep"
        | "mep_electrical"
        | "mep_plumbing"
        | "mep_mechanical"
        | "structural"
        | "survey"
        | "other"
      document_status:
        | "pending"
        | "analyzing"
        | "clean"
        | "issues"
        | "advisory"
        | "rfi"
      issue_confidence: "strong" | "medium" | "weak"
      issue_severity: "critical" | "advisory" | "pass"
      issue_status: "open" | "flagged" | "reviewed" | "resolved"
      org_type:
        | "architecture"
        | "mep_engineering"
        | "structural_engineering"
        | "private_provider"
        | "expeditor"
        | "developer"
      project_status:
        | "draft"
        | "ai_review_pending"
        | "ai_review_complete"
        | "provider_review"
        | "revision_requested"
        | "approved"
        | "submitted"
        | "rfi_received"
        | "permit_issued"
        | "rejected"
      project_type: "residential" | "commercial" | "mixed_use"
      user_role:
        | "architect"
        | "mep_engineer"
        | "private_provider"
        | "expeditor"
        | "developer"
        | "admin"
      workflow_state: "done" | "active" | "waiting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      deadline_urgency: ["red", "amber", "green"],
      document_discipline: [
        "architectural",
        "landscape",
        "mep",
        "mep_electrical",
        "mep_plumbing",
        "mep_mechanical",
        "structural",
        "survey",
        "other",
      ],
      document_status: [
        "pending",
        "analyzing",
        "clean",
        "issues",
        "advisory",
        "rfi",
      ],
      issue_confidence: ["strong", "medium", "weak"],
      issue_severity: ["critical", "advisory", "pass"],
      issue_status: ["open", "flagged", "reviewed", "resolved"],
      org_type: [
        "architecture",
        "mep_engineering",
        "structural_engineering",
        "private_provider",
        "expeditor",
        "developer",
      ],
      project_status: [
        "draft",
        "ai_review_pending",
        "ai_review_complete",
        "provider_review",
        "revision_requested",
        "approved",
        "submitted",
        "rfi_received",
        "permit_issued",
        "rejected",
      ],
      project_type: ["residential", "commercial", "mixed_use"],
      user_role: [
        "architect",
        "mep_engineer",
        "private_provider",
        "expeditor",
        "developer",
        "admin",
      ],
      workflow_state: ["done", "active", "waiting"],
    },
  },
} as const
