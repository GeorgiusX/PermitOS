-- ============================================================================
-- PermitOS — Initial schema
-- Multi-party permit compliance platform. Postgres / Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type org_type as enum (
  'architecture', 'mep_engineering', 'structural_engineering',
  'private_provider', 'expeditor', 'developer'
);

create type user_role as enum (
  'architect', 'mep_engineer', 'private_provider',
  'expeditor', 'developer', 'admin'
);

create type project_type as enum ('residential', 'commercial', 'mixed_use');

create type project_status as enum (
  'draft', 'ai_review_pending', 'ai_review_complete', 'provider_review',
  'revision_requested', 'approved', 'submitted', 'rfi_received',
  'permit_issued', 'rejected'
);

create type document_discipline as enum (
  'architectural', 'landscape', 'mep', 'mep_electrical', 'mep_plumbing',
  'mep_mechanical', 'structural', 'survey', 'other'
);

create type document_status as enum (
  'pending', 'analyzing', 'clean', 'issues', 'advisory', 'rfi'
);

create type issue_severity as enum ('critical', 'advisory', 'pass');
create type issue_confidence as enum ('strong', 'medium', 'weak');
create type issue_status as enum ('open', 'flagged', 'reviewed', 'resolved');
create type workflow_state as enum ('done', 'active', 'waiting');
create type deadline_urgency as enum ('red', 'amber', 'green');

-- ----------------------------------------------------------------------------
-- Reference / org tables
-- ----------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        org_type not null,
  created_at  timestamptz not null default now()
);

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  role          user_role not null default 'private_provider',
  org_id        uuid references organizations(id) on delete set null,
  avatar_initials text generated always as (
    upper(left(coalesce(nullif(full_name, ''), email), 2))
  ) stored,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Municipality intelligence database (the moat)
-- ----------------------------------------------------------------------------
create table municipalities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  county        text,
  state         text not null default 'FL',
  codes_version text,
  is_live       boolean not null default false,
  last_updated  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create table municipality_rules (
  id              uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  code            text not null,            -- e.g. "§18A-7"
  title           text not null,
  description     text not null,
  category        document_discipline not null,
  effective_date  date not null default current_date,
  source_url      text,
  is_active       boolean not null default true,
  last_verified   date not null default current_date,
  created_at      timestamptz not null default now()
);
create index idx_rules_municipality on municipality_rules(municipality_id) where is_active;

-- Immutable history of every rule change, so old reports reference the
-- rule text that was active when the plans were submitted.
create table rule_versions (
  id          uuid primary key default gen_random_uuid(),
  rule_id     uuid not null references municipality_rules(id) on delete cascade,
  code        text not null,
  title       text not null,
  description text not null,
  effective_date date not null,
  changed_by  uuid references profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Projects
-- ----------------------------------------------------------------------------
create table projects (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  short_title     text,
  address         text,
  municipality_id uuid references municipalities(id) on delete set null,
  permit_no       text,
  type            project_type not null default 'residential',
  status          project_status not null default 'draft',
  risk_score      int,                       -- 0-100, null until AI runs
  developer_name  text,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_projects_status on projects(status);

create table project_members (
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        user_role not null,
  added_at    timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index idx_members_user on project_members(user_id);

create table workflow_steps (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  step_index  int not null,
  name        text not null,
  state       workflow_state not null default 'waiting',
  note        text,
  assigned_to uuid references profiles(id) on delete set null,
  completed_at timestamptz,
  unique (project_id, step_index)
);

-- ----------------------------------------------------------------------------
-- Documents & compliance
-- ----------------------------------------------------------------------------
create table documents (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  name            text not null,
  discipline      document_discipline not null default 'other',
  file_label      text,                     -- e.g. "L-1 through L-4"
  storage_path    text,                     -- Supabase Storage object path
  file_size       bigint,
  mime_type       text,
  version         int not null default 1,
  status          document_status not null default 'pending',
  uploaded_by     uuid references profiles(id) on delete set null,
  uploaded_at     timestamptz not null default now()
);
create index idx_documents_project on documents(project_id);

create table compliance_reports (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  project_id      uuid not null references projects(id) on delete cascade,
  risk_score      int,
  summary         text,
  critical_count  int not null default 0,
  warning_count   int not null default 0,
  pass_count      int not null default 0,
  ai_provider     text,                     -- 'claude' | 'gemini'
  approved_by     uuid references profiles(id) on delete set null,
  approved_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_reports_project on compliance_reports(project_id);

create table issues (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references compliance_reports(id) on delete cascade,
  severity    issue_severity not null,
  title       text not null,
  description text not null,
  code_ref    text,                          -- "Ch. 18A §18A-6(C)"
  location    text,                          -- "Plan Sheet L-3, Grid D4"
  confidence  issue_confidence not null default 'medium',
  discipline  document_discipline not null default 'other',
  status      issue_status not null default 'open',
  callout_x   real,                          -- normalized 0-1 plan coords
  callout_y   real,
  created_at  timestamptz not null default now()
);
create index idx_issues_report on issues(report_id);

-- ----------------------------------------------------------------------------
-- Communications
-- ----------------------------------------------------------------------------
create table threads (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_threads_project on threads(project_id);

create table messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references threads(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  content     text not null,
  ref_issue_id    uuid references issues(id) on delete set null,
  ref_document_id uuid references documents(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_messages_thread on messages(thread_id);

-- ----------------------------------------------------------------------------
-- Deadlines
-- ----------------------------------------------------------------------------
create table deadlines (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  due_date    date not null,
  urgency     deadline_urgency not null default 'green',
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index idx_deadlines_due on deadlines(due_date) where not completed;

-- ----------------------------------------------------------------------------
-- Audit log (append-only)
-- ----------------------------------------------------------------------------
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete set null,
  user_id     uuid references profiles(id) on delete set null,
  event_type  text not null,
  event_data  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_project on audit_logs(project_id);

-- ----------------------------------------------------------------------------
-- Triggers: updated_at + new-user profile
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_projects_updated
  before update on projects
  for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'private_provider')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS helper: is the current user a member of this project?
-- SECURITY DEFINER bypasses RLS inside the function to avoid policy recursion.
-- ----------------------------------------------------------------------------
create or replace function is_project_member(p_project_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------
alter table organizations      enable row level security;
alter table profiles           enable row level security;
alter table municipalities     enable row level security;
alter table municipality_rules enable row level security;
alter table rule_versions      enable row level security;
alter table projects           enable row level security;
alter table project_members    enable row level security;
alter table workflow_steps     enable row level security;
alter table documents          enable row level security;
alter table compliance_reports enable row level security;
alter table issues             enable row level security;
alter table threads            enable row level security;
alter table messages           enable row level security;
alter table deadlines          enable row level security;
alter table audit_logs         enable row level security;

-- Profiles: anyone authenticated can read profiles (needed for team displays);
-- users can update only their own.
create policy "profiles readable by authenticated"
  on profiles for select to authenticated using (true);
create policy "users update own profile"
  on profiles for update to authenticated using (id = auth.uid());

-- Organizations: readable by authenticated users.
create policy "orgs readable by authenticated"
  on organizations for select to authenticated using (true);

-- Municipality data: readable by all authenticated users.
create policy "municipalities readable"
  on municipalities for select to authenticated using (true);
create policy "rules readable"
  on municipality_rules for select to authenticated using (true);
create policy "rule_versions readable"
  on rule_versions for select to authenticated using (true);

-- Projects: members can read; any authenticated user can create;
-- members can update.
create policy "members read projects"
  on projects for select to authenticated using (is_project_member(id));
create policy "authenticated create projects"
  on projects for insert to authenticated with check (created_by = auth.uid());
create policy "members update projects"
  on projects for update to authenticated using (is_project_member(id));

-- Project members: visible to co-members; project creator can add members.
create policy "members read membership"
  on project_members for select to authenticated using (is_project_member(project_id));
create policy "members manage membership"
  on project_members for insert to authenticated with check (is_project_member(project_id) or user_id = auth.uid());

-- Child tables: scoped to project membership.
create policy "members read workflow"
  on workflow_steps for select to authenticated using (is_project_member(project_id));
create policy "members write workflow"
  on workflow_steps for all to authenticated
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create policy "members read documents"
  on documents for select to authenticated using (is_project_member(project_id));
create policy "members write documents"
  on documents for all to authenticated
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create policy "members read reports"
  on compliance_reports for select to authenticated using (is_project_member(project_id));
create policy "members write reports"
  on compliance_reports for all to authenticated
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create policy "members read issues"
  on issues for select to authenticated using (
    is_project_member((select project_id from compliance_reports where id = report_id))
  );
create policy "members write issues"
  on issues for all to authenticated using (
    is_project_member((select project_id from compliance_reports where id = report_id))
  ) with check (
    is_project_member((select project_id from compliance_reports where id = report_id))
  );

create policy "members read threads"
  on threads for select to authenticated using (is_project_member(project_id));
create policy "members write threads"
  on threads for all to authenticated
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create policy "members read messages"
  on messages for select to authenticated using (
    is_project_member((select project_id from threads where id = thread_id))
  );
create policy "members write messages"
  on messages for insert to authenticated with check (
    user_id = auth.uid()
    and is_project_member((select project_id from threads where id = thread_id))
  );

create policy "members read deadlines"
  on deadlines for select to authenticated using (is_project_member(project_id));
create policy "members write deadlines"
  on deadlines for all to authenticated
  using (is_project_member(project_id)) with check (is_project_member(project_id));

-- Audit log: members can read; inserts only via service role (admin client),
-- so no insert policy is granted to authenticated users.
create policy "members read audit"
  on audit_logs for select to authenticated using (is_project_member(project_id));
