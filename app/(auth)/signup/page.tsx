"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "../actions";

const ROLES: { value: string; label: string }[] = [
  { value: "private_provider", label: "Private Plan Review Provider" },
  { value: "architect", label: "Architect" },
  { value: "mep_engineer", label: "MEP Engineer" },
  { value: "expeditor", label: "Permit Expeditor" },
  { value: "developer", label: "Real Estate Developer" },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    null,
  );

  return (
    <>
      <h1 className="mb-1 text-base font-semibold text-ink">Create account</h1>
      <p className="mb-5 text-[13px] text-ink-2">
        Set up your PermitOS workspace.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-2">Full name</label>
          <input
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className="w-full rounded-base border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            placeholder="Jane Doe"
          />
        </div>
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
          <label className="mb-1 block text-xs font-medium text-ink-2">Your role</label>
          <select
            name="role"
            defaultValue="private_provider"
            className="w-full cursor-pointer appearance-none rounded-base border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-2">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-base border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
            placeholder="At least 8 characters"
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
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
