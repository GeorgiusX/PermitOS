import { IconMap } from "@tabler/icons-react";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function MunicipalityPage() {
  return (
    <ScreenPlaceholder
      title="Municipality DB"
      icon={IconMap}
      blurb="The jurisdiction-specific rule database — the platform's competitive moat. The AI queries it per submission so every check is hyper-local."
      sprint="Sprint 5"
    />
  );
}
