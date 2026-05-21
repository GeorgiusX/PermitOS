import type { BadgeVariant } from "@/lib/data/projects";

const VARIANT_CLS: Record<BadgeVariant, string> = {
  gray: "bg-surface-2 text-ink-2",
  info: "bg-info-bg text-info-fg",
  warn: "bg-warn-bg text-warn-fg",
  success: "bg-success-bg text-success-fg",
  danger: "bg-danger-bg text-danger-fg",
  accent: "bg-accent-dim text-accent",
};

export function Badge({
  text,
  variant,
}: {
  text: string;
  variant: BadgeVariant;
}) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${VARIANT_CLS[variant]}`}
    >
      {text}
    </span>
  );
}
