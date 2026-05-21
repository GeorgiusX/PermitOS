import { IconFileText } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function DocumentsPage() {
  return (
    <ScreenPlaceholder
      title="Documents"
      icon={IconFileText}
      blurb="Plan sets grouped by project with review-cycle version control. Each version links to the compliance report generated against it."
      sprint="Sprint 4"
    />
  );
}
