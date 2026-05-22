"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IssueStatus } from "@/types/db";

export async function setIssueStatus(issueId: string, status: IssueStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("issues")
    .update({ status })
    .eq("id", issueId);
  if (error) throw error;
  revalidatePath("/compliance");
}

export async function approveReport(reportId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error: rErr } = await supabase
    .from("compliance_reports")
    .update({ approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (rErr) throw rErr;

  const { error: pErr } = await supabase
    .from("projects")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (pErr) throw pErr;

  revalidatePath("/compliance");
  revalidatePath("/projects");
}

export async function requestRevision(projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      status: "revision_requested",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  if (error) throw error;

  revalidatePath("/compliance");
  revalidatePath("/projects");
}
