import { IconChartBar } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function PatternsPage() {
  return (
    <ScreenPlaceholder
      title="Rejection Patterns"
      icon={IconChartBar}
      blurb="Proprietary intelligence built from accumulated submissions — what gets rejected in each municipality and why, powering predictive risk scoring."
      sprint="Sprint 5"
    />
  );
}
