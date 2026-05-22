# PermitOS — Session Handoff

Quick-start context so a fresh Claude Code session can continue without re-deriving anything.

## What this is
AI-native permit-compliance platform for Florida (Miami-Dade). Rebuild of an old static MVP
(`permit-check-miami`) into a full Next.js app matching `~/Downloads/permitos_interactive_2.html`
(the interactive mockup — the source of truth for UI/screens). Company brief: `COMPANY_OVERVIEW.md`.

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 (design tokens in `app/globals.css`)
- Supabase (Postgres + Auth + Storage) — project id `mcowgoenkqdvwgjunyku`, region us-east-1
- Tabler icons (`@tabler/icons-react`), Zustand (state, not used yet)
- Deployed on Vercel project `permit-check-miami` (prj_7LUeqIecSEYikJOifzFtYIwamHan,
  team team_4LMxwZvuA3TMMD1YKlUDV6kG). Live: https://permit-check-miami.vercel.app

## CRITICAL workflow constraints (machine has only 18 GB RAM)
- **Do NOT run a local dev server** (`npm run dev`) — it crashes the machine (memory). 
- **Verify with `npx tsc --noEmit`** (lightweight). Use `next build` sparingly.
- **Preview via Vercel**: `git push origin main` → Vercel auto-builds → view the live URL in a browser.
  Watch builds with the Vercel MCP (`list_deployments` / `get_deployment_build_logs`).
- **Commit + push after every increment** so a crash never loses work.
- **Keep tool outputs lean** — don't re-read large files or dump big blobs (it bloats the
  transcript and the app's memory). The mockup is 1181 lines; read targeted ranges only.

## Done
- Sprint 1: app shell (sidebar nav, 9 routed placeholder screens), auth (login/signup, Supabase),
  proxy session refresh (`proxy.ts`, Next 16 renamed from middleware).
- DB: full schema + RLS (`supabase/migrations/0001`), security hardening — helpers in `private`
  schema (`0002`), seed = 5 municipalities + 26 rules (`supabase/seed.sql`). All applied live.
- Types: canonical types generated from live DB in `types/database.ts`; clean aliases in `types/db.ts`
  (import `Project`, `UserRole`, etc. from `@/types/db`). Typed joins work.
- Data layer: `lib/data/projects.ts` — `getProjects()`, `getProjectDetail(id)` (typed joins),
  `projectStatusBadge()`, `projectPipeline()` (7-stage), `filterProjects()` helpers.
  `lib/data/municipalities.ts` — `getMunicipalities()`.
- Infra: deployed to Vercel; env vars set. Email confirmation OFF in Supabase (dev).
- Sprint 2: projects dashboard live — filter tabs (All/In Review/Needs Action/Submitted/Approved),
  project cards with 7-segment pipeline + status badges, right-hand detail panel (docs & AI
  analysis, workflow timeline, team). URL search params (`?filter=&id=`) drive state.
  New project form at `/projects/new` (wizard step 1) — server action creates project → member
  → 7 workflow_steps in correct RLS order (pre-generated UUID). Deployed + TypeScript clean.
- Sprint 3: AI Compliance Report (`/compliance?project=<id>`) — breadcrumb header, doc tabs,
  risk box, filterable/expandable issue cards, annotated plan viewer (SVG callouts from issue
  callout_x/y), action bar. Reads via `lib/data/compliance.ts` (`getComplianceReport`).
  Mutations (`app/actions/report-actions.ts`): approve report / request revision / per-issue
  status — all RLS member writes. AI pipeline (`app/actions/analyze-document.ts`): loads
  `municipality_rules` from DB → builds system prompt → sends doc to **Google Gemini Flash**
  (`gemini-2.5-flash`, REST generateContent, responseMimeType application/json, defensive enum
  normalization) → downloads doc from Storage bucket `documents` → writes compliance_report +
  issues + updates project/doc status. Provider = Gemini (matches original MVP); plain fetch, no
  AI SDK. `ai_provider` recorded as `gemini`.
  Seeded a realistic demo project (Miami-Dade landscape, 1 critical + 2 advisories) owned by
  George so dashboard + report render with real data.

## ⚠️ Sprint 3 follow-ups / known gaps
- **AI analyze action is UNTESTED end-to-end** — no document upload yet (no file in Storage),
  and **`GEMINI_API_KEY` must be set** in `.env.local` AND Vercel env (both currently empty; the
  working key from the old MVP lives in the old Vercel project env). Model override via
  `GEMINI_MODEL`. The button only appears for projects that have an uploaded doc + no report yet.
- Storage bucket is assumed to be named `documents` — confirm/create it when wiring upload.
- Export (report) and "Add Comment" buttons are present but intentionally disabled (no-ops).

## Next — Sprint 4
1. **Document upload** (New Project wizard step 2 + Documents screen): Supabase Storage upload,
   create `documents` rows with `storage_path`/`mime_type`. This unblocks the AI analyze action
   end-to-end (then test the full upload → analyze → report loop).
2. **Async analysis**: move `analyzeDocument` to a Supabase Edge Function + Realtime status so
   the UI shows live progress instead of a blocking server action.
3. **Remaining screens**: Documents, Communications, Deadlines, Checklist, Audit, Patterns,
   Municipality DB.

## Then (later sprints)
3 = AI Compliance Report + PDF viewer (port `_legacy/api/analyze.js` logic; rules come from
`municipality_rules` table, not hardcoded). 4 = Documents/Communications/Deadlines. 5 = Checklist/
Audit/Patterns/Municipality DB. Async AI analysis via Supabase Edge Function + Realtime.

## Workflow stages (7, for seeding workflow_steps)
Plan set uploaded → AI compliance review → Provider review → Architect revision →
Provider approval → Expeditor submission → City review

## Key files
- `app/(dashboard)/layout.tsx` — shell; `components/layout/Sidebar.tsx` — nav
- `lib/supabase/{client,server,middleware}.ts` — clients + session
- `lib/data/projects.ts` — project queries
- `types/db.ts` — type aliases; `types/database.ts` — generated (regen: Supabase MCP
  `generate_typescript_types` for project mcowgoenkqdvwgjunyku)
- `_legacy/` — old MVP (analyze.js has the working Claude/Gemini compliance call)
