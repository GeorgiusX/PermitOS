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

- Sprint 4 ✓: Document upload (wizard step 2 → `/projects/new/upload?id=…`), `uploadDocument`
  server action (Storage + DB row), Documents screen (`/documents` — grouped by project, status
  badges, link to compliance report), Storage bucket `documents` created (migration 0004, auth
  RLS), Detail Panel gets "Upload plan set" CTA when no docs present.
  **`GEMINI_API_KEY` added to `.env.local`. Must also be set in Vercel env** (Production +
  Preview) — without it the AI analyze action returns an error. Model override via `GEMINI_MODEL`.

## ⚠️ Known gaps / follow-ups
- **Test end-to-end loop** once `GEMINI_API_KEY` is set in Vercel: upload a PDF →
  "Run AI Analysis" on compliance page → report should populate.
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is still a placeholder (not needed yet).
- Export (report) and "Add Comment" buttons are present but intentionally disabled (no-ops).
- Vercel function timeout: `analyzeDocument` can take 30-60s for large PDFs — may need
  `export const maxDuration = 60` in the compliance page or a move to Edge Function + Realtime.

## Next — Sprint 5
1. **Async analysis** (high value): move `analyzeDocument` to a Supabase Edge Function triggered
   via a DB insert, with Realtime subscription in the UI to show live progress. Eliminates the
   blocking server action and Vercel timeout risk.
2. **Communications screen**: thread + message UI for project discussions (threads/messages tables exist).
3. **Deadlines screen**: deadline list with urgency badges (deadlines table exists).
4. **Checklist screen**: per-project checklist items.
5. **Remaining placeholders**: Audit, Patterns, Municipality DB screens.

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
