export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-3 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <span className="text-xs font-semibold text-white">PO</span>
          </div>
          <span className="text-lg font-semibold text-ink">PermitOS</span>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
          {children}
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-3">
          AI-native permit compliance · Miami Beach, FL
        </p>
      </div>
    </div>
  );
}
