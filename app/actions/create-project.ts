"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProjectType } from "@/types/db";

const WORKFLOW_STAGES = [
  "Plan set uploaded",
  "AI compliance review",
  "Provider review",
  "Architect revision",
  "Provider approval",
  "Expeditor submission",
  "City review",
] as const;

export type CreateProjectState = { error: string } | null;

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const address = (formData.get("address") as string)?.trim();
  const municipalityId = (formData.get("municipality_id") as string) || null;
  const type = formData.get("type") as ProjectType;
  const titleInput = (formData.get("title") as string)?.trim();
  const developerName =
    (formData.get("developer_name") as string)?.trim() || null;

  if (!address) return { error: "Project address is required." };
  if (!type) return { error: "Project type is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const title = titleInput || address;
  const shortTitle = address.split(",")[0]?.trim() || address;

  // Pre-generate the ID so we can insert project → member → steps
  // without relying on INSERT…RETURNING (RLS blocks it before membership exists).
  const projectId = crypto.randomUUID();

  const { error: projError } = await supabase.from("projects").insert({
    id: projectId,
    title,
    short_title: shortTitle,
    address,
    municipality_id: municipalityId,
    type,
    status: "draft" as const,
    created_by: user.id,
    developer_name: developerName,
  });
  if (projError) return { error: projError.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { error: memberError } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: user.id,
    role: profile?.role ?? "private_provider",
  });
  if (memberError) return { error: memberError.message };

  const steps = WORKFLOW_STAGES.map((name, i) => ({
    project_id: projectId,
    step_index: i + 1,
    name,
    state: (i === 0 ? "active" : "waiting") as "active" | "waiting",
  }));

  const { error: stepsError } = await supabase
    .from("workflow_steps")
    .insert(steps);
  if (stepsError) return { error: stepsError.message };

  redirect(`/projects?id=${projectId}`);
}
