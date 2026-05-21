import { IconClock } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function DeadlinesPage() {
  return (
    <ScreenPlaceholder
      title="Deadlines"
      icon={IconClock}
      blurb="Permit expirations, RFI response windows, and inspection dates as first-class alerts — surfaced before they lapse."
      sprint="Sprint 4"
    />
  );
}
