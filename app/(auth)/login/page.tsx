"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    null,
  );

  return (
    <>
      <h1 className="mb-1 text-base font-semibold text-ink">Sign in</h1>
      <p className="mb-5 text-[13px] text-ink-2">
        Welcome back. Sign in to your workspace.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-2">Email</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-base border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            placeholder="you@firm.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-2">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-base border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="rounded-base bg-danger-bg px-3 py-2 text-xs text-danger-fg">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-full rounded-base bg-accent py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-ink-2">
        No account?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
