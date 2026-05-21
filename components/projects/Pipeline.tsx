export function Pipeline({ stages }: { stages: number[] }) {
  return (
    <div className="mb-2.5 flex items-center gap-[3px]">
      {stages.map((v, i) => (
        <div
          key={i}
          className={`h-[3px] flex-1 rounded-full ${
            v === 1
              ? "bg-accent"
              : v === 0.5
                ? "bg-accent/40"
                : "bg-surface-2"
          }`}
        />
      ))}
    </div>
  );
}
