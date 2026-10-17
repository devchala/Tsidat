
create or replace function public.worker_on_incident(_incident uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.assignments where incident_id=_incident and worker_id=_user and status <> 'reassigned')
$$;
create or replace function public.resident_on_incident(_incident uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.reports where incident_id=_incident and resident_id=_user)
$$;
grant execute on function public.worker_on_incident(uuid,uuid) to authenticated;
grant execute on function public.resident_on_incident(uuid,uuid) to authenticated;

drop policy "worker read reports of assigned" on public.reports;
create policy "worker read reports of assigned" on public.reports for select to authenticated
  using (incident_id is not null and public.worker_on_incident(incident_id, auth.uid()));
drop policy "resident read assignment of own" on public.assignments;
create policy "resident read assignment of own" on public.assignments for select to authenticated
  using (public.resident_on_incident(incident_id, auth.uid()));
drop policy "resident read linked incident" on public.incidents;
create policy "resident read linked incident" on public.incidents for select to authenticated
  using (public.resident_on_incident(id, auth.uid()));
drop policy "worker read assigned incidents" on public.incidents;
create policy "worker read assigned incidents" on public.incidents for select to authenticated
  using (public.worker_on_incident(id, auth.uid()));
