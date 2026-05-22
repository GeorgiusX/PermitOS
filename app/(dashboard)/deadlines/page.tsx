import Link from "next/link";
import {
  IconCalendarDue,
  IconAlertTriangle,
  IconCircleCheck,
  IconCalendar,
} from "@tabler/icons-react";
import { Topbar } from "@/components/layout/Topbar";
import { getDeadlines } from "@/lib/data/deadlines";
import type { DeadlineUrgency } from "@/types/db";

const URGENCY_CFG: Record<
  DeadlineUrgency,
  { label: string; dot: string; row: string; badge: string }
> = {
  red: {
    label: "Urgent",
    dot: "bg-danger-fg",
    row: "border-l-2 border-danger-fg",
    badge: "bg-danger-bg text-danger-fg",
  },
  amber: {
    label: "Due soon",
    dot: "bg-warn-fg",
    row: "border-l-2 border-warn-fg",
    badge: "bg-warn-bg text-warn-fg",
  },
  green: {
    label: "On track",
    dot: "bg-success-fg",
    row: "border-l-2 border-success-fg",
    badge: "bg-success-bg text-success-fg",
  },
};

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function dueDateLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dueDateColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return "text-danger-fg font-medium";
  if (days <= 3) return "text-danger-fg";
  if (days <= 7) return "text-warn-fg";
  return "text-ink-3";
}

const URGENCY_ORDER: DeadlineUrgency[] = ["red", "amber", "green"];

export default async function DeadlinesPage() {
  const deadlines = await getDeadlines();

  const groups = URGENCY_ORDER.map((urgency) => ({
    urgency,
    items: deadlines.filter((d) => d.urgency === urgency),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Topbar title="Deadlines" />

      <div className="flex-1 overflow-y-auto p-5">
        {deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-dim">
              <IconCalendarDue size={24} stroke={1.75} className="text-accent" />
            </div>
            <div className="text-[14px] font-medium text-ink">
              No upcoming deadlines
            </div>
            <div className="max-w-xs text-[12px] text-ink-3">
              Deadline tracking will surface submission dates, city review
              windows, and permit expiry for your active projects.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ urgency, items }) => {
              const cfg = URGENCY_CFG[urgency];
              return (
                <div key={urgency}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="text-[12px] font-medium text-ink-2">
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-ink-3">{items.length}</span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
                    {items.map((item, i) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-3 ${cfg.row} ${
                          i > 0 ? "border-t border-border-subtle" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                          {urgency === "red" ? (
                            <IconAlertTriangle size={15} className="text-danger-fg" />
                          ) : urgency === "amber" ? (
                            <IconCalendar size={15} className="text-warn-fg" />
                          ) : (
                            <IconCircleCheck size={15} className="text-success-fg" />
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-[13px] font-medium text-ink">
                            {item.name}
                          </div>
                          <Link
                            href={`/projects?id=${item.projectId}`}
                            className="text-[11px] text-ink-3 hover:text-accent"
                          >
                            {item.projectShortTitle}
                          </Link>
                        </div>

                        <div className={`shrink-0 text-[12px] ${dueDateColor(item.dueDate)}`}>
                          {dueDateLabel(item.dueDate)}
                        </div>

                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
