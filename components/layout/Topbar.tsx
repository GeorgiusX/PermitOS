import type { ReactNode } from "react";

export function Topbar({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-5">
      <span className="flex-1 text-sm font-medium text-ink">{title}</span>
      {children}
    </div>
  );
}
