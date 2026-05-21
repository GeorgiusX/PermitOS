import { IconChecklist } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function ChecklistPage() {
  return (
    <ScreenPlaceholder
      title="Submission Checklist"
      icon={IconChecklist}
      blurb="Per-municipality completeness check — required document types, application forms, and fee calculations validated before AI review runs."
      sprint="Sprint 5"
    />
  );
}
