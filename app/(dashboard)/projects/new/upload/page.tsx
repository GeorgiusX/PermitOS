import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentUploadForm } from "@/components/projects/DocumentUploadForm";

export default async function UploadDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: projectId } = await searchParams;

  if (!projectId) redirect("/projects/new");

  // Verify the project exists and the user is a member
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, short_title")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) redirect("/projects/new");

  return <DocumentUploadForm projectId={projectId} />;
}
