"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { createProject } from "@/app/actions/create-project";
import type { MunicipalityOption } from "@/lib/data/municipalities";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create Project"}
      {!pending && <IconArrowRight size={13} />}
    </button>
  );
}

export function NewProjectForm({
  municipalities,
}: {
  municipalities: MunicipalityOption[];
}) {
  const [state, action] = useActionState(createProject, null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-3">
      {/* Topbar */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-5">
        <div className="flex flex-1 items-center gap-1.5 text-[13px]">
          <Link
            href="/projects"
            className="text-ink-3 hover:text-ink-2 transition-colors"
          >
            Projects
          </Link>
          <span className="text-ink-3">/</span>
          <span className="font-medium text-ink">New Project</span>
        </div>
      </div>

      {/* Wizard step indicator */}
      <div className="flex shrink-0 border-b border-border-subtle bg-surface-2">
        <div className="flex flex-1 items-center justify-center gap-1.5 border-r border-border-subtle bg-accent-dim py-3 text-[12px] font-medium text-accent">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
            1
          </div>
          Project Details
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 border-r border-border-subtle py-3 text-[12px] text-ink-3">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface-2 text-[10px] font-medium text-ink-3">
            2
          </div>
          Upload Documents
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[12px] text-ink-3">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface-2 text-[10px] font-medium text-ink-3">
            3
          </div>
          Analysis
        </div>
      </div>

      {/* Scrollable form area */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
        <div className="w-full max-w-[620px] overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <form action={action}>
            <div className="p-6">
              <div className="mb-1 text-base font-medium text-ink">
                Project details
              </div>
              <div className="mb-5 text-[13px] text-ink-3">
                Enter the basic information for this permit project.
              </div>

              {state?.error && (
                <div className="mb-4 rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2 text-[12px] text-danger-fg">
                  {state.error}
                </div>
              )}

              {/* Address */}
              <div className="mb-4">
                <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                  Project address
                </label>
                <input
                  name="address"
                  type="text"
                  required
                  placeholder="e.g. 4200 Collins Ave, Unit 12B"
                  className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
              </div>

              {/* Municipality + Type row */}
              <div className="mb-4 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                    Municipality
                  </label>
                  <select
                    name="municipality_id"
                    className="w-full appearance-none rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  >
                    <option value="">Select municipality…</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {!m.is_live ? " (coming soon)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                    Project type
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue="residential"
                    className="w-full appearance-none rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed_use">Mixed-Use</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                  Project name / description{" "}
                  <span className="font-normal text-ink-3">(optional)</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Unit 12B bathroom renovation and landscape update"
                  className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
              </div>

              {/* Developer */}
              <div className="mb-2">
                <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                  Developer / client{" "}
                  <span className="font-normal text-ink-3">(optional)</span>
                </label>
                <input
                  name="developer_name"
                  type="text"
                  placeholder="Developer or client name for your records"
                  className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
              <span className="text-[12px] text-ink-3">Step 1 of 3</span>
              <div className="flex gap-2">
                <Link
                  href="/projects"
                  className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-1.5 text-[12px] text-ink-2 hover:bg-surface-2"
                >
                  <IconArrowLeft size={13} />
                  Cancel
                </Link>
                <SubmitButton />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
