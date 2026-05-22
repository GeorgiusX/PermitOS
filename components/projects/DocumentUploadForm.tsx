"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowLeft,
  IconUpload,
  IconFileTypePdf,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { uploadDocument } from "@/app/actions/upload-document";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Uploading…" : "Upload & Continue"}
      {!pending && <IconArrowRight size={13} />}
    </button>
  );
}

function FilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const isPdf = file.type === "application/pdf";
  const sizeKb = (file.size / 1024).toFixed(0);
  const sizeMb = (file.size / 1024 / 1024).toFixed(1);
  const sizeLabel = file.size > 1_000_000 ? `${sizeMb} MB` : `${sizeKb} KB`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-strong bg-surface-2 px-3 py-2.5">
      {isPdf ? (
        <IconFileTypePdf size={20} className="shrink-0 text-danger-fg" />
      ) : (
        <IconPhoto size={20} className="shrink-0 text-accent" />
      )}
      <div className="flex-1 overflow-hidden">
        <div className="truncate text-[12px] font-medium text-ink">
          {file.name}
        </div>
        <div className="text-[11px] text-ink-3">{sizeLabel}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 text-ink-3 hover:text-ink"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}

export function DocumentUploadForm({ projectId }: { projectId: string }) {
  const [state, action] = useActionState(uploadDocument, null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-3">
      {/* Topbar */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border-subtle bg-surface px-5">
        <div className="flex flex-1 items-center gap-1.5 text-[13px]">
          <Link href="/projects" className="text-ink-3 hover:text-ink-2 transition-colors">
            Projects
          </Link>
          <span className="text-ink-3">/</span>
          <span className="font-medium text-ink">New Project</span>
        </div>
      </div>

      {/* Wizard step indicator */}
      <div className="flex shrink-0 border-b border-border-subtle bg-surface-2">
        <div className="flex flex-1 items-center justify-center gap-1.5 border-r border-border-subtle py-3 text-[12px] text-ink-3">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-success-fg text-[10px] font-medium text-white">
            ✓
          </div>
          Project Details
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 border-r border-border-subtle bg-accent-dim py-3 text-[12px] font-medium text-accent">
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
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

      {/* Form area */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
        <div className="w-full max-w-[620px] overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <form ref={formRef} action={action}>
            <input type="hidden" name="project_id" value={projectId} />

            {/* Hidden file input — connected to drag zone */}
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept=".pdf,image/png,image/jpeg,image/webp,image/tiff"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="p-6">
              <div className="mb-1 text-base font-medium text-ink">
                Upload plan set
              </div>
              <div className="mb-5 text-[13px] text-ink-3">
                Upload the document you want to run the AI compliance review
                against. PDF or image files up to 50 MB.
              </div>

              {state?.error && (
                <div className="mb-4 rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2 text-[12px] text-danger-fg">
                  {state.error}
                </div>
              )}

              {/* Drop zone */}
              {file ? (
                <div className="mb-4">
                  <FilePreview file={file} onRemove={() => setFile(null)} />
                </div>
              ) : (
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
                    dragging
                      ? "border-accent bg-accent-dim"
                      : "border-border-strong bg-surface-2 hover:border-accent hover:bg-accent-dim/40"
                  }`}
                >
                  <IconUpload
                    size={24}
                    className={dragging ? "text-accent" : "text-ink-3"}
                  />
                  <div className="text-center">
                    <div className="text-[13px] font-medium text-ink-2">
                      Drop a file here or{" "}
                      <span className="text-accent">click to browse</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-3">
                      PDF, PNG, JPEG, WebP, TIFF · max 50 MB
                    </div>
                  </div>
                </div>
              )}

              {/* Document name */}
              <div className="mb-4">
                <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                  Document name{" "}
                  <span className="font-normal text-ink-3">(optional — defaults to filename)</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Site Plan Sheet A1.1"
                  className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
              </div>

              {/* Discipline + Label row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                    Discipline
                  </label>
                  <select
                    name="discipline"
                    defaultValue="architectural"
                    className="w-full appearance-none rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  >
                    <option value="architectural">Architectural</option>
                    <option value="landscape">Landscape</option>
                    <option value="structural">Structural</option>
                    <option value="mep">MEP (General)</option>
                    <option value="mep_electrical">MEP — Electrical</option>
                    <option value="mep_plumbing">MEP — Plumbing</option>
                    <option value="mep_mechanical">MEP — Mechanical</option>
                    <option value="survey">Survey</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                    Sheet label{" "}
                    <span className="font-normal text-ink-3">(optional)</span>
                  </label>
                  <input
                    name="label"
                    type="text"
                    placeholder="e.g. A1.1, L-100"
                    className="w-full rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
              <span className="text-[12px] text-ink-3">Step 2 of 3</span>
              <div className="flex gap-2">
                <Link
                  href="/projects"
                  className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-1.5 text-[12px] text-ink-2 hover:bg-surface-2"
                >
                  <IconArrowLeft size={13} />
                  Skip for now
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
