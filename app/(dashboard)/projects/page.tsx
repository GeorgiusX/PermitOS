import Link from "next/link";
import { IconSearch, IconPlus, IconLayoutGrid } from "@tabler/icons-react";
import { getProjects, getProjectDetail, filterProjects } from "@/lib/data/projects";
import { FilterTabs } from "@/components/projects/FilterTabs";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { DetailPanel } from "@/components/projects/DetailPanel";
import { Topbar } from "@/components/layout/Topbar";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; id?: string }>;
}) {
  const { filter = "all", id } = await searchParams;

  const allProjects = await getProjects();
  const filtered = filterProjects(allProjects, filter);

  // Auto-select first project in the filtered list when no explicit id
  const selectedId = id ?? filtered[0]?.id ?? null;
  const detail = selectedId ? await getProjectDetail(selectedId) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Projects">
        {/* Search placeholder */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-[5px] w-48">
          <IconSearch size={13} className="text-ink-3 shrink-0" />
          <span className="text-[12px] text-ink-3">Search projects…</span>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-1 rounded-lg bg-accent px-3.5 py-[7px] text-[12px] font-medium text-white hover:bg-accent-hover"
        >
          <IconPlus size={13} />
          New Project
        </Link>
      </Topbar>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: filter tabs + project cards */}
        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
          <FilterTabs current={filter} />

          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <IconLayoutGrid size={36} className="text-ink-3" />
              <div className="text-[13px] font-medium text-ink-2">
                No projects
              </div>
              <div className="text-[12px] text-ink-3">
                {filter === "all"
                  ? "Create your first project to get started."
                  : "No projects match this filter."}
              </div>
              {filter === "all" && (
                <Link
                  href="/projects/new"
                  className="mt-1 flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-[12px] font-medium text-white hover:bg-accent-hover"
                >
                  <IconPlus size={13} />
                  New Project
                </Link>
              )}
            </div>
          ) : (
            filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                selected={project.id === selectedId}
                filter={filter}
              />
            ))
          )}
        </div>

        {/* Right: detail panel */}
        {detail ? (
          <DetailPanel detail={detail} />
        ) : allProjects.length > 0 ? null : null}
      </div>
    </div>
  );
}
