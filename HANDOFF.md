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
- Data layer: `lib/data/projects.ts` — `getProjects()`, `getProjectDetail(id)` (typed joins).
- Infra: deployed to Vercel; env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  set in Vercel dashboard. Email confirmation is OFF in Supabase (dev). `.env.local` set locally.

## Next — Sprint 2 (in progress)
1. **New Project creation flow** (task): server action to insert project + creator membership +
   seed 7 workflow steps; a "New Project" form (wizard step 1). Use `crypto.randomUUID()` for the
   project id (RLS blocks INSERT…RETURNING before the membership row exists; order =
   project → member → workflow_steps).
2. **Projects dashboard UI**: replace `app/(dashboard)/projects/page.tsx` placeholder with the real
   mockup view — filter tabs, project cards (pipeline/badges/team), right-hand detail panel
   (docs & AI analysis, risk, workflow timeline, team), empty state.
   Need a status→badge and status→pipeline(7) mapping helper (not built yet).

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
