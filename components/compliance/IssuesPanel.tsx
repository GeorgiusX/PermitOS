"use client";

import { useState, useTransition } from "react";
import {
  IconChevronDown,
  IconMapPin,
  IconFlag,
  IconCheck,
  IconCircleCheck,
} from "@tabler/icons-react";
import type { ReportIssue } from "@/lib/data/compliance";
import type { IssueConfidence, IssueSeverity, IssueStatus } from "@/types/db";
import { setIssueStatus } from "@/app/actions/report-actions";

type FilterKey = "all" | "critical" | "advisory";

const SEV_DOT: Record<IssueSeverity, string> = {
  critical: "bg-danger-fg",
  advisory: "bg-accent",
  pass: "bg-ink-3",
};

const SEV_LABEL: Record<IssueSeverity, { text: string; cls: string }> = {
  critical: { text: "Critical", cls: "text-danger-fg" },
  advisory: { text: "Advisory", cls: "text-accent" },
  pass: { text: "Pass", cls: "text-success-fg" },
};

const CONF_CLS: Record<IssueConfidence, string> = {
  strong: "bg-success-bg text-success-fg",
  medium: "bg-warn-bg text-warn-fg",
  weak: "bg-surface-2 text-ink-3 border border-border-subtle",
};

const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  flagged: "Flagged for revision",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

function IssueCard({
  issue,
  expanded,
  onToggle,
}: {
  issue: ReportIssue;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatusLocal] = useState<IssueStatus>(issue.status);
  const sev = SEV_LABEL[issue.severity];

  function update(next: IssueStatus) {
    setStatusLocal(next);
    startTransition(() => setIssueStatus(issue.id, next));
  }

  return (
    <div
      className={`cursor-pointer overflow-hidden rounded-lg border bg-surface-2 transition-colors ${
        expanded ? "border-accent" : "border-border-subtle hover:border-border-strong"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2 p-3">
        <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[issue.severity]}`} />
        <div className="flex-1">
          <div className="mb-0.5 text-[10px] text-ink-3">
            {issue.discipline} ·{" "}
            <span className={sev.cls}>{sev.text}</span>
            {status !== "open" && (
              <span className="text-ink-3"> · {STATUS_LABEL[status]}</span>
            )}
          </div>
          <div className="text-[12px] font-medium leading-snug text-ink">
            {issue.title}
          </div>
        </div>
        <IconChevronDown
          size={13}
          className={`shrink-0 text-ink-3 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {expanded && (
        <div className="border-t border-border-subtle px-3 pb-3 pl-6 pt-2.5">
          <div className="mb-2 text-[12px] leading-relaxed text-ink-2">
            {issue.description}
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {issue.location && (
              <div className="flex items-center gap-1 text-[11px] text-ink-3">
                <IconMapPin size={11} />
                {issue.location}
              </div>
            )}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${CONF_CLS[issue.confidence]}`}
            >
              Confidence: {issue.confidence}
            </span>
          </div>
          {issue.codeRef && (
            <div className="mb-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 font-mono text-[11px] leading-relaxed text-ink-3">
              {issue.codeRef}
            </div>
          )}
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              disabled={pending}
              onClick={() => update("flagged")}
              className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-2.5 py-1 text-[11px] text-ink-2 hover:bg-surface-2 disabled:opacity-50"
            >
              <IconFlag size={11} />
              Flag for revision
            </button>
            <button
              disabled={pending}
              onClick={() => update("reviewed")}
              className="flex items-center gap-1 rounded-lg border border-border-strong bg-surface px-2.5 py-1 text-[11px] text-ink-2 hover:bg-surface-2 disabled:opacity-50"
            >
              <IconCheck size={11} />
              Mark reviewed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function IssuesPanel({ issues }: { issues: ReportIssue[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = issues.filter((i) => {
    if (filter === "all") return true;
    return i.severity === filter;
  });

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "advisory", label: "Advisory" },
  ];

  return (
    <div className="flex w-[400px] min-w-[400px] flex-col overflow-hidden border-r border-border-subtle bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border-subtle px-3.5 py-2.5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              filter === key
                ? "border-accent bg-accent-dim font-medium text-accent"
                : "border-border-subtle bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-ink-3">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-ink-3">
            <IconCircleCheck
              size={28}
              className="mx-auto mb-2 text-success-fg"
            />
            No issues in this category
          </div>
        ) : (
          filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              expanded={expandedId === issue.id}
              onToggle={() =>
                setExpandedId(expandedId === issue.id ? null : issue.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
