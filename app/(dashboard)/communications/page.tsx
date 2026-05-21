import { IconMessageCircle } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function CommunicationsPage() {
  return (
    <ScreenPlaceholder
      title="Communications"
      icon={IconMessageCircle}
      blurb="Threaded, document-linked messaging between every party on a project. Real-time updates via Supabase. No more email."
      sprint="Sprint 4"
    />
  );
}
