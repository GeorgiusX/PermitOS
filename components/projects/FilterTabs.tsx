import Link from "next/link";

const TABS = [
  { key: "all", label: "All" },
  { key: "review", label: "In Review" },
  { key: "action", label: "Needs Action" },
  { key: "submitted", label: "Submitted" },
  { key: "approved", label: "Approved" },
] as const;

export function FilterTabs({ current }: { current: string }) {
  return (
    <div className="flex shrink-0 flex-wrap gap-1.5">
      {TABS.map(({ key, label }) => {
        const active = current === key;
        return (
          <Link
            key={key}
            href={`/projects?filter=${key}`}
            className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
              active
                ? "border-accent bg-accent-dim font-medium text-accent"
                : "border-border-subtle bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
