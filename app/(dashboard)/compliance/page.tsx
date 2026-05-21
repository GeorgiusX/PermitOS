import { IconShieldCheck } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function CompliancePage() {
  return (
    <ScreenPlaceholder
      title="AI Compliance"
      icon={IconShieldCheck}
      blurb="The AI Compliance Report — issue cards, confidence scoring, and the annotated plan viewer. The core of the product, built in Sprint 3."
      sprint="Sprint 3"
    />
  );
}
