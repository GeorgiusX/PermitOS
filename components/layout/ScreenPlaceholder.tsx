import type { Icon, IconProps } from "@tabler/icons-react";
import type { ComponentType } from "react";
import { Topbar } from "@/components/layout/Topbar";

export function ScreenPlaceholder({
  title,
  icon: Icon,
  blurb,
  sprint,
}: {
  title: string;
  icon: ComponentType<IconProps>;
  blurb: string;
  sprint: string;
}) {
  return (
    <>
      <Topbar title={title} />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-dim">
            <Icon size={24} stroke={1.75} className="text-accent" />
          </div>
          <h2 className="mb-1.5 text-base font-medium text-ink">{title}</h2>
          <p className="text-[13px] leading-relaxed text-ink-2">{blurb}</p>
          <span className="mt-4 inline-block rounded-full bg-surface-2 px-3 py-1 text-[11px] text-ink-3">
            {sprint}
          </span>
        </div>
      </div>
    </>
  );
}
