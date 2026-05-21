import { IconHistory } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function AuditPage() {
  return (
    <ScreenPlaceholder
      title="Audit Log"
      icon={IconHistory}
      blurb="An immutable, timestamped record of every action — uploads, AI runs, annotations, approvals — for liability protection and quality audit."
      sprint="Sprint 5"
    />
  );
}
