import Link from "next/link";
import {
  IconHome,
  IconBuildingSkyscraper,
  IconBuildingStore,
} from "@tabler/icons-react";
import type { ProjectCard as ProjectCardData } from "@/lib/data/projects";
import {
  projectStatusBadge,
  projectPipeline,
  projectTypeLabel,
} from "@/lib/data/projects";
import { Badge } from "./Badge";
import { Pipeline } from "./Pipeline";

const TYPE_CONFIG = {
  residential: {
    Icon: IconHome,
    bg: "bg-success-bg",
    fg: "text-success-fg",
  },
  commercial: {
    Icon: IconBuildingSkyscraper,
    bg: "bg-info-bg",
    fg: "text-info-fg",
  },
  mixed_use: {
    Icon: IconBuildingStore,
    bg: "bg-warn-bg",
    fg: "text-warn-fg",
  },
} as const;

export function ProjectCard({
  project,
  selected,
  filter,
}: {
  project: ProjectCardData;
  selected: boolean;
  filter: string;
}) {
  const { Icon, bg, fg } = TYPE_CONFIG[project.type];
  const badge = projectStatusBadge(project.status);
  const pipeline = projectPipeline(project.status);

  const href = `/projects?id=${project.id}${filter !== "all" ? `&filter=${filter}` : ""}`;

  const updated = new Date(project.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={href}
      className={`block cursor-pointer rounded-xl border bg-surface p-3.5 transition-colors hover:border-border-strong ${
        selected ? "border-[1.5px] border-accent" : "border-border-subtle"
      }`}
    >
      <div className="mb-2.5 flex items-start gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
        >
          <Icon size={15} className={fg} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-ink">
            {project.title}
          </div>
          <div className="text-[11px] text-ink-3">
            {[project.municipalityName, projectTypeLabel(project.type)]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <Badge {...badge} />
      </div>

      <Pipeline stages={pipeline} />

      <div className="flex items-center gap-2">
        {project.members.slice(0, 2).map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-[11px] text-ink-3"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface-2 text-[8px] text-ink-2">
              {m.initials}
            </div>
            {m.name}
          </div>
        ))}
        <span className="ml-auto text-[11px] text-ink-3">
          Updated {updated}
        </span>
      </div>
    </Link>
  );
}
