"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DocumentDiscipline } from "@/types/db";

const STORAGE_BUCKET = "documents";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/tiff",
];

const DISCIPLINES: DocumentDiscipline[] = [
  "architectural",
  "landscape",
  "mep",
  "mep_electrical",
  "mep_plumbing",
  "mep_mechanical",
  "structural",
  "survey",
  "other",
];

export type UploadDocumentState = { error: string } | null;

export async function uploadDocument(
  _prev: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const projectId = (formData.get("project_id") as string)?.trim();
  const file = formData.get("file") as File | null;
  const nameInput = (formData.get("name") as string)?.trim();
  const label = (formData.get("label") as string)?.trim() || null;
  const disciplineInput = formData.get("discipline") as string;

  if (!projectId) return { error: "Missing project ID." };
  if (!file || file.size === 0) return { error: "Please select a file to upload." };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Only PDF and image files are supported." };
  }
  if (file.size > 52_428_800) return { error: "File must be 50 MB or smaller." };

  const discipline = DISCIPLINES.includes(disciplineInput as DocumentDiscipline)
    ? (disciplineInput as DocumentDiscipline)
    : "other";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Verify user is a member of the project
  const { data: member } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return { error: "You are not a member of this project." };

  const docId = crypto.randomUUID();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const storagePath = `${projectId}/${docId}.${ext}`;
  const name = nameInput || file.name;

  // Upload to Supabase Storage
  const bytes = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadErr) return { error: `Upload failed: ${uploadErr.message}` };

  // Create documents row
  const { error: dbErr } = await supabase.from("documents").insert({
    id: docId,
    project_id: projectId,
    name,
    file_label: label,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
    discipline,
    status: "pending",
    uploaded_by: user.id,
  });
  if (dbErr) {
    // Clean up the uploaded file on DB failure
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return { error: dbErr.message };
  }

  redirect(`/compliance?project=${projectId}`);
}
