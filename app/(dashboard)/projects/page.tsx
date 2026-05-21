import { IconLayoutGrid } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function ProjectsPage() {
  return (
    <ScreenPlaceholder
      title="Projects"
      icon={IconLayoutGrid}
      blurb="The project dashboard — cards, pipeline status, risk scores, and the detail panel — lands in Sprint 2 once the data layer is wired."
      sprint="Sprint 2"
    />
  );
}
