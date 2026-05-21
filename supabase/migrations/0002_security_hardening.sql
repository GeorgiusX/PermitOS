-- ============================================================================
-- PermitOS — Security hardening
-- Move SECURITY DEFINER helpers into a non-exposed `private` schema so they
-- can't be called via the public REST API, and pin search_path everywhere.
-- ============================================================================

create schema if not exists private;
grant usage on schema private to authenticated;

-- ----------------------------------------------------------------------------
-- is_project_member -> private
-- ----------------------------------------------------------------------------
create function private.is_project_member(p_project_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;
revoke all on function private.is_project_member(uuid) from public;
grant execute on function private.is_project_member(uuid) to authenticated;

-- Repoint every policy that referenced public.is_project_member.
drop policy "members read projects"    on projects;
create policy "members read projects"
  on projects for select to authenticated using (private.is_project_member(id));
drop policy "members update projects"  on projects;
create policy "members update projects"
  on projects for update to authenticated using (private.is_project_member(id));

drop policy "members read membership"  on project_members;
create policy "members read membership"
  on project_members for select to authenticated using (private.is_project_member(project_id));
drop policy "members manage membership" on project_members;
create policy "members manage membership"
  on project_members for insert to authenticated
  with check (private.is_project_member(project_id) or user_id = auth.uid());

drop policy "members read workflow"    on workflow_steps;
create policy "members read workflow"
  on workflow_steps for select to authenticated using (private.is_project_member(project_id));
drop policy "members write workflow"   on workflow_steps;
create policy "members write workflow"
  on workflow_steps for all to authenticated
  using (private.is_project_member(project_id)) with check (private.is_project_member(project_id));

drop policy "members read documents"   on documents;
create policy "members read documents"
  on documents for select to authenticated using (private.is_project_member(project_id));
drop policy "members write documents"  on documents;
create policy "members write documents"
  on documents for all to authenticated
  using (private.is_project_member(project_id)) with check (private.is_project_member(project_id));

drop policy "members read reports"     on compliance_reports;
create policy "members read reports"
  on compliance_reports for select to authenticated using (private.is_project_member(project_id));
drop policy "members write reports"    on compliance_reports;
create policy "members write reports"
  on compliance_reports for all to authenticated
  using (private.is_project_member(project_id)) with check (private.is_project_member(project_id));

drop policy "members read issues"      on issues;
create policy "members read issues"
  on issues for select to authenticated using (
    private.is_project_member((select project_id from compliance_reports where id = report_id))
  );
drop policy "members write issues"     on issues;
create policy "members write issues"
  on issues for all to authenticated using (
    private.is_project_member((select project_id from compliance_reports where id = report_id))
  ) with check (
    private.is_project_member((select project_id from compliance_reports where id = report_id))
  );

drop policy "members read threads"     on threads;
create policy "members read threads"
  on threads for select to authenticated using (private.is_project_member(project_id));
drop policy "members write threads"    on threads;
create policy "members write threads"
  on threads for all to authenticated
  using (private.is_project_member(project_id)) with check (private.is_project_member(project_id));

drop policy "members read messages"    on messages;
create policy "members read messages"
  on messages for select to authenticated using (
    private.is_project_member((select project_id from threads where id = thread_id))
  );
drop policy "members write messages"   on messages;
create policy "members write messages"
  on messages for insert to authenticated with check (
    user_id = auth.uid()
    and private.is_project_member((select project_id from threads where id = thread_id))
  );

drop policy "members read deadlines"   on deadlines;
create policy "members read deadlines"
  on deadlines for select to authenticated using (private.is_project_member(project_id));
drop policy "members write deadlines"  on deadlines;
create policy "members write deadlines"
  on deadlines for all to authenticated
  using (private.is_project_member(project_id)) with check (private.is_project_member(project_id));

drop policy "members read audit"       on audit_logs;
create policy "members read audit"
  on audit_logs for select to authenticated using (private.is_project_member(project_id));

drop function public.is_project_member(uuid);

-- ----------------------------------------------------------------------------
-- handle_new_user -> private (trigger-only; not callable via API)
-- ----------------------------------------------------------------------------
create function private.handle_new_user()
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
revoke all on function private.handle_new_user() from public;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
drop function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- set_updated_at -> private, with pinned search_path
-- ----------------------------------------------------------------------------
create function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger trg_projects_updated on projects;
create trigger trg_projects_updated
  before update on projects
  for each row execute function private.set_updated_at();
drop function public.set_updated_at();
