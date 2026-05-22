export function RiskBox({
  score,
  critical,
  advisory,
  total,
}: {
  score: number | null;
  critical: number;
  advisory: number;
  total: number;
}) {
  const scoreColor =
    score === null
      ? "text-accent"
      : score >= 70
        ? "text-danger-fg"
        : score >= 40
          ? "text-accent"
          : "text-success-fg";

  return (
    <div className="flex shrink-0 items-center gap-4 rounded-lg bg-surface-2 px-4 py-3">
      <div>
        <div className="mb-0.5 text-[10px] text-ink-3">Risk score</div>
        <div className={`text-3xl font-medium ${scoreColor}`}>
          {score ?? "—"}
        </div>
      </div>
      <div className="h-10 w-px bg-border-strong" />
      <div className="text-center">
        <div className="text-base font-medium text-danger-fg">{critical}</div>
        <div className="text-[10px] text-ink-3">Critical</div>
      </div>
      <div className="h-10 w-px bg-border-strong" />
      <div className="text-center">
        <div className="text-base font-medium text-accent">{advisory}</div>
        <div className="text-[10px] text-ink-3">Advisory</div>
      </div>
      <div className="h-10 w-px bg-border-strong" />
      <div className="text-center">
        <div className="text-base font-medium text-success-fg">{total}</div>
        <div className="text-[10px] text-ink-3">Total</div>
      </div>
    </div>
  );
}
