import { createClient } from "@/lib/supabase/server";
import type { DeadlineUrgency } from "@/types/db";

export type DeadlineItem = {
  id: string;
  name: string;
  dueDate: string;
  urgency: DeadlineUrgency;
  completed: boolean;
  projectId: string;
  projectShortTitle: string;
};

export async function getDeadlines(): Promise<DeadlineItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deadlines")
    .select(
      `id, name, due_date, urgency, completed,
       project:projects(id, short_title)`,
    )
    .eq("completed", false)
    .order("due_date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    dueDate: d.due_date,
    urgency: d.urgency,
    completed: d.completed,
    projectId: d.project?.id ?? "",
    projectShortTitle: d.project?.short_title ?? "",
  }));
}
