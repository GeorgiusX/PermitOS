import { getMunicipalities } from "@/lib/data/municipalities";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

export default async function NewProjectPage() {
  const municipalities = await getMunicipalities();
  return <NewProjectForm municipalities={municipalities} />;
}
