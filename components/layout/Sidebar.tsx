"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutGrid,
  IconFileText,
  IconMessageCircle,
  IconClock,
  IconShieldCheck,
  IconChecklist,
  IconHistory,
  IconChartBar,
  IconMap,
  IconLogout,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { signOut } from "@/app/(auth)/actions";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  badge?: string;
  badgeTone?: "accent" | "info";
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    heading: "Workspace",
    items: [
      { id: "projects", href: "/projects", label: "Projects", icon: IconLayoutGrid, badge: "4" },
      { id: "documents", href: "/documents", label: "Documents", icon: IconFileText },
      {
        id: "communications",
        href: "/communications",
        label: "Communications",
        icon: IconMessageCircle,
        badge: "2",
        badgeTone: "info",
      },
      { id: "deadlines", href: "/deadlines", label: "Deadlines", icon: IconClock },
    ],
  },
  {
    heading: "Review",
    items: [
      { id: "compliance", href: "/compliance", label: "AI Compliance", icon: IconShieldCheck },
      { id: "checklist", href: "/checklist", label: "Submission Checklist", icon: IconChecklist },
      { id: "audit", href: "/audit", label: "Audit Log", icon: IconHistory },
    ],
  },
  {
    heading: "Intelligence",
    items: [
      { id: "patterns", href: "/patterns", label: "Rejection Patterns", icon: IconChartBar },
      { id: "municipality", href: "/municipality", label: "Municipality DB", icon: IconMap },
    ],
  },
];

export type SidebarUser = {
  name: string;
  role: string;
  initials: string;
};

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 min-w-56 flex-col border-r border-border-subtle bg-surface">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 pb-3.5 pt-4.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
          <span className="text-[11px] font-semibold text-white">PO</span>
        </div>
        <div>
          <span className="text-sm font-medium text-ink">PermitOS</span>
          <span className="mt-px block text-[10px] text-ink-3">Miami Beach</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV.map((section) => (
          <div key={section.heading}>
            <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-ink-3">
              {section.heading}
            </div>
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex w-full items-center gap-2.5 rounded-base px-2 py-[7px] text-[13px] transition-colors ${
                    active
                      ? "bg-accent-dim text-accent"
                      : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icon size={16} stroke={1.75} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-px text-[10px] font-medium text-white ${
                        item.badgeTone === "info" ? "bg-info-fg" : "bg-accent"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-2">
        <div className="flex items-center gap-2 rounded-base px-2 py-1.5">
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent-dim text-[10px] font-medium text-accent">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-ink">
              {user.name}
            </span>
            <span className="block text-[10px] text-ink-3">{user.role}</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-base text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <IconLogout size={15} stroke={1.75} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
