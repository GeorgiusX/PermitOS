import { createClient } from "@/lib/supabase/server";
import type { Municipality } from "@/types/db";

export type MunicipalityOption = Pick<
  Municipality,
  "id" | "name" | "county" | "is_live"
>;

export async function getMunicipalities(): Promise<MunicipalityOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name, county, is_live")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
