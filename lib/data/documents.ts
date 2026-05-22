import { createClient } from "@/lib/supabase/server";
import type { DocumentDiscipline, DocumentStatus } from "@/types/db";

export type DocumentListItem = {
  id: string;
  name: string;
  fileLabel: string | null;
  discipline: DocumentDiscipline;
  status: DocumentStatus;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: string;
  projectId: string;
  projectTitle: string;
  projectShortTitle: string;
};

export async function getDocuments(): Promise<DocumentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      `id, name, file_label, discipline, status, mime_type, file_size, uploaded_at,
       project:projects(id, title, short_title)`,
    )
    .order("uploaded_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    fileLabel: d.file_label,
    discipline: d.discipline,
    status: d.status,
    mimeType: d.mime_type,
    fileSize: d.file_size,
    uploadedAt: d.uploaded_at,
    projectId: d.project?.id ?? "",
    projectTitle: d.project?.title ?? "",
    projectShortTitle: d.project?.short_title ?? d.project?.title ?? "",
  }));
}
