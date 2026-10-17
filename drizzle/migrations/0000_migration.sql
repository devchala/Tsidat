
-- ENUMS
create type public.app_role as enum ('resident','worker','admin','planner');
create type public.worker_status as enum ('none','pending','approved','rejected','suspended');
create type public.report_status as enum ('submitted','under_review','accepted','assigned','en_route','in_progress','awaiting_verification','completed','rejected','reopened');
create type public.priority_level as enum ('low','medium','high','critical');
create type public.waste_category as enum ('overflowing_bin','household_waste','illegal_dumping','construction_waste','street_litter','drainage_blockage','hazardous','other');
create type public.assignment_status as enum ('assigned','en_route','in_progress','awaiting_verification','completed','reassigned','rejected');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text,
  area text,
  account_status text not null default 'active' check (account_status in ('active','suspended')),
  worker_status public.worker_status not null default 'none',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.is_active_worker(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id=_user_id and p.worker_status='approved' and p.account_status='active')
    and public.has_role(_user_id,'worker')
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admin read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- protect privileged profile fields
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('tsidat.bypass', true) = 'on' then return new; end if;
  if new.account_status is distinct from old.account_status or new.worker_status is distinct from old.worker_status then
    raise exception 'Not allowed to change account or worker status';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger trg_protect_profile before update on public.profiles for each row execute function public.protect_profile_fields();

-- WORKER APPLICATIONS
create table public.worker_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  national_id text not null default '',
  service_area text not null default '',
  experience text not null default '',
  status public.worker_status not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);
grant select, update on public.worker_applications to authenticated;
grant all on public.worker_applications to service_role;
alter table public.worker_applications enable row level security;
create policy "own app read" on public.worker_applications for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own app update pending" on public.worker_applications for update to authenticated
  using (user_id = auth.uid() and status in ('pending','rejected'))
  with check (user_id = auth.uid() and status in ('pending','rejected'));
create or replace function public.protect_application()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('tsidat.bypass', true) = 'on' then return new; end if;
  if new.status is distinct from old.status or new.reviewed_by is distinct from old.reviewed_by then
    raise exception 'Not allowed';
  end if;
  return new;
end $$;
create trigger trg_protect_app before update on public.worker_applications for each row execute function public.protect_application();

-- SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare acct text := coalesce(new.raw_user_meta_data->>'account_type','resident');
begin
  insert into public.profiles(id, display_name, phone, area, worker_status)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'area',
    case when acct='worker' then 'pending'::public.worker_status else 'none' end);
  -- first ever user bootstraps the administrator
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  elsif acct = 'worker' then
    insert into public.user_roles(user_id, role) values (new.id,'worker');
    insert into public.worker_applications(user_id, national_id, service_area, experience)
    values (new.id, coalesce(new.raw_user_meta_data->>'national_id',''), coalesce(new.raw_user_meta_data->>'area',''), coalesce(new.raw_user_meta_data->>'experience',''));
  else
    insert into public.user_roles(user_id, role) values (new.id,'resident');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- INCIDENTS
create sequence public.incident_ref_seq;
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('INC-' || lpad(nextval('public.incident_ref_seq')::text, 5, '0')),
  category public.waste_category not null,
  title text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  location_description text,
  status public.report_status not null default 'accepted',
  priority_score int not null default 0,
  priority_level public.priority_level not null default 'low',
  priority_reason text,
  created_by uuid,
  accepted_at timestamptz not null default now(),
  assigned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.incidents to authenticated;
grant all on public.incidents to service_role;
alter table public.incidents enable row level security;

-- REPORTS
create sequence public.report_ref_seq;
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('TSD-' || lpad(nextval('public.report_ref_seq')::text, 6, '0')),
  resident_id uuid not null references public.profiles(id) on delete cascade,
  category public.waste_category not null,
  description text not null check (char_length(description) between 10 and 1000),
  image_path text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_description text check (location_description is null or char_length(location_description) <= 300),
  status public.report_status not null default 'submitted',
  priority_score int not null default 0,
  priority_level public.priority_level not null default 'low',
  incident_id uuid references public.incidents(id) on delete set null,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.reports(resident_id);
create index on public.reports(incident_id);
create index on public.reports(status);
grant select, insert on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "resident insert own" on public.reports for insert to authenticated with check (resident_id = auth.uid() and public.has_role(auth.uid(),'resident'));
create policy "resident read own" on public.reports for select to authenticated using (resident_id = auth.uid());
create policy "admin read reports" on public.reports for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ASSIGNMENTS
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null,
  status public.assignment_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  en_route_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  completion_image_path text,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  verified_by uuid,
  verified_at timestamptz,
  verification_note text,
  reassignment_reason text,
  override_reason text,
  created_at timestamptz not null default now()
);
create index on public.assignments(worker_id);
create index on public.assignments(incident_id);
grant select on public.assignments to authenticated;
grant all on public.assignments to service_role;
alter table public.assignments enable row level security;
create policy "worker read own" on public.assignments for select to authenticated using (worker_id = auth.uid());
create policy "admin read assignments" on public.assignments for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admin read incidents" on public.incidents for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "worker read assigned incidents" on public.incidents for select to authenticated using (
  exists(select 1 from public.assignments a where a.incident_id = incidents.id and a.worker_id = auth.uid()));
create policy "resident read linked incident" on public.incidents for select to authenticated using (
  exists(select 1 from public.reports r where r.incident_id = incidents.id and r.resident_id = auth.uid()));
create policy "worker read reports of assigned" on public.reports for select to authenticated using (
  incident_id is not null and exists(select 1 from public.assignments a where a.incident_id = reports.incident_id and a.worker_id = auth.uid() and a.status <> 'reassigned'));
-- resident can see their own report's assignment (no worker contact is stored there)
create policy "resident read assignment of own" on public.assignments for select to authenticated using (
  exists(select 1 from public.reports r where r.incident_id = assignments.incident_id and r.resident_id = auth.uid()));
-- admins see worker apps; workers profile visible to admins via policy above

-- STATUS HISTORY
create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  from_status public.report_status,
  to_status public.report_status not null,
  actor_id uuid,
  actor_role text,
  note text,
  evidence_path text,
  created_at timestamptz not null default now()
);
create index on public.status_history(report_id);
create index on public.status_history(incident_id);
grant select on public.status_history to authenticated;
grant all on public.status_history to service_role;
alter table public.status_history enable row level security;
create policy "resident read own history" on public.status_history for select to authenticated using (
  exists(select 1 from public.reports r where r.id = status_history.report_id and r.resident_id = auth.uid()));
create policy "admin read history" on public.status_history for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "worker read history of assigned" on public.status_history for select to authenticated using (
  incident_id is not null and exists(select 1 from public.assignments a where a.incident_id = status_history.incident_id and a.worker_id = auth.uid()));

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notif read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notif update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notif delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- FEEDBACK
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  resident_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now()
);
grant select, insert on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "resident insert feedback" on public.feedback for insert to authenticated with check (
  resident_id = auth.uid() and exists(select 1 from public.reports r where r.id = report_id and r.resident_id = auth.uid() and r.status='completed'));
create policy "resident read feedback" on public.feedback for select to authenticated using (resident_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- AUDIT
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "admin read audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- HELPERS
create or replace function public.category_weight(c public.waste_category) returns int language sql immutable as $$
  select case c when 'hazardous' then 45 when 'drainage_blockage' then 30 when 'illegal_dumping' then 25
    when 'overflowing_bin' then 20 when 'construction_waste' then 18 when 'household_waste' then 15
    when 'street_litter' then 8 else 10 end
$$;
create or replace function public.level_for(score int) returns public.priority_level language sql immutable as $$
  select case when score >= 60 then 'critical'::public.priority_level when score >= 40 then 'high'
    when score >= 20 then 'medium' else 'low' end
$$;
create or replace function public.notify(_user uuid, _title text, _body text, _link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id,title,body,link) values (_user,_title,_body,_link)
$$;
create or replace function public.audit(_action text, _type text, _id uuid, _details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,details) values (auth.uid(),_action,_type,_id,coalesce(_details,'{}'::jsonb))
$$;
create or replace function public.require_admin() returns void language plpgsql stable security definer set search_path = public as $$
begin if not public.has_role(auth.uid(),'admin') then raise exception 'Administrator access required'; end if; end $$;

-- report insert defaults + priority
create or replace function public.before_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare nearby int;
begin
  new.status := 'submitted'; new.incident_id := null; new.review_reason := null;
  new.resident_id := auth.uid();
  select count(*) into nearby from public.reports r
    where r.status not in ('completed','rejected') and r.created_at > now() - interval '14 days'
      and abs(r.latitude - new.latitude) < 0.002 and abs(r.longitude - new.longitude) < 0.002;
  new.priority_score := public.category_weight(new.category) + least(nearby,4) * 10;
  new.priority_level := public.level_for(new.priority_score);
  return new;
end $$;
create trigger trg_report_insert before insert on public.reports for each row execute function public.before_report_insert();

create or replace function public.after_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record;
begin
  insert into public.status_history(report_id,to_status,actor_id,actor_role,note)
  values (new.id,'submitted',new.resident_id,'resident','Report received. An administrator will review it shortly.');
  for a in select user_id from public.user_roles where role='admin' loop
    perform public.notify(a.user_id, 'New report '||new.reference, 'Priority: '||new.priority_level, '/admin/reports/'||new.id);
  end loop;
  return new;
end $$;
create trigger trg_report_after_insert after insert on public.reports for each row execute function public.after_report_insert();

-- nearby check (limited fields, no personal info)
create or replace function public.nearby_reports(_lat double precision, _lng double precision, _category public.waste_category default null)
returns table(reference text, category public.waste_category, status public.report_status, created_at timestamptz, distance_m int)
language sql stable security definer set search_path = public as $$
  select r.reference, r.category, r.status, r.created_at,
    (6371000 * 2 * asin(sqrt(power(sin(radians(r.latitude-_lat)/2),2) + cos(radians(_lat))*cos(radians(r.latitude))*power(sin(radians(r.longitude-_lng)/2),2))))::int as d
  from public.reports r
  where r.status not in ('completed','rejected') and r.created_at > now() - interval '30 days'
    and abs(r.latitude-_lat) < 0.003 and abs(r.longitude-_lng) < 0.003
    and (_category is null or r.category = _category)
  order by d limit 5
$$;
grant execute on function public.nearby_reports to authenticated;

-- set status on an incident and propagate to all linked reports
create or replace function public.propagate_incident_status(_incident uuid, _to public.report_status, _note text, _assignment uuid, _evidence text, _role text)
returns void language plpgsql security definer set search_path = public as $$
declare r record; inc record;
begin
  select * into inc from public.incidents where id=_incident;
  update public.incidents set status=_to, updated_at=now(),
    assigned_at = case when _to='assigned' then now() else assigned_at end,
    completed_at = case when _to='completed' then now() else completed_at end
  where id=_incident;
  insert into public.status_history(incident_id,assignment_id,from_status,to_status,actor_id,actor_role,note,evidence_path)
  values (_incident,_assignment,inc.status,_to,auth.uid(),_role,_note,_evidence);
  for r in select * from public.reports where incident_id=_incident and status not in ('rejected') loop
    update public.reports set status=_to, updated_at=now() where id=r.id;
    insert into public.status_history(report_id,incident_id,assignment_id,from_status,to_status,actor_id,actor_role,note,evidence_path)
    values (r.id,_incident,_assignment,r.status,_to,auth.uid(),_role,_note,_evidence);
    perform public.notify(r.resident_id,'Update on '||r.reference, _note, '/resident/reports/'||r.id);
  end loop;
end $$;

-- ADMIN: review report
create or replace function public.admin_review_report(_report uuid, _action text, _reason text, _incident uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare r record; inc_id uuid; cnt int;
begin
  perform public.require_admin();
  select * into r from public.reports where id=_report for update;
  if r is null then raise exception 'Report not found'; end if;
  if r.status in ('completed') then raise exception 'Completed reports cannot be changed'; end if;
  if _action = 'under_review' then
    if r.status <> 'submitted' then raise exception 'Only submitted reports can move to review'; end if;
    update public.reports set status='under_review', updated_at=now() where id=_report;
    insert into public.status_history(report_id,from_status,to_status,actor_id,actor_role,note)
      values (_report,r.status,'under_review',auth.uid(),'admin',coalesce(nullif(_reason,''),'An administrator is reviewing your report.'));
    perform public.notify(r.resident_id,'Report under review',r.reference||' is being reviewed.','/resident/reports/'||_report);
  elsif _action = 'reject' then
    if r.status not in ('submitted','under_review','reopened') then raise exception 'Report cannot be rejected in its current state'; end if;
    if coalesce(trim(_reason),'') = '' then raise exception 'A rejection reason is required'; end if;
    update public.reports set status='rejected', review_reason=_reason, updated_at=now() where id=_report;
    insert into public.status_history(report_id,from_status,to_status,actor_id,actor_role,note)
      values (_report,r.status,'rejected',auth.uid(),'admin','Report rejected: '||_reason);
    perform public.notify(r.resident_id,'Report not accepted',r.reference||': '||_reason,'/resident/reports/'||_report);
  elsif _action = 'accept' then
    if r.status not in ('submitted','under_review','reopened') then raise exception 'Report cannot be accepted in its current state'; end if;
    if _incident is null then
      insert into public.incidents(category,title,latitude,longitude,location_description,priority_score,priority_level,priority_reason,created_by)
      values (r.category, initcap(replace(r.category::text,'_',' ')), r.latitude, r.longitude, r.location_description,
        r.priority_score, r.priority_level, 'Category weight '||public.category_weight(r.category)||' plus nearby-report density', auth.uid())
      returning id into inc_id;
    else
      inc_id := _incident;
      select count(*) into cnt from public.reports where incident_id=inc_id;
      update public.incidents set priority_score = least(100, priority_score + 10),
        priority_level = public.level_for(least(100, priority_score + 10)),
        priority_reason = coalesce(priority_reason,'')||'; +10 for linked report '||r.reference, updated_at=now()
      where id=inc_id;
    end if;
    update public.reports set status = (select status from public.incidents where id=inc_id), incident_id=inc_id, review_reason=_reason, updated_at=now() where id=_report;
    insert into public.status_history(report_id,incident_id,from_status,to_status,actor_id,actor_role,note)
      values (_report,inc_id,r.status,(select status from public.incidents where id=inc_id),auth.uid(),'admin',
        coalesce(nullif(_reason,''),'Your report was accepted. Next: a verified collection worker will be assigned.'));
    perform public.notify(r.resident_id,'Report accepted',r.reference||' was accepted for collection.','/resident/reports/'||_report);
  else
    raise exception 'Unknown action';
  end if;
  perform public.audit('report.'||_action,'report',_report,jsonb_build_object('reason',_reason,'incident',inc_id));
  return inc_id;
end $$;

-- ADMIN: assign worker
create or replace function public.admin_assign_worker(_incident uuid, _worker uuid, _reason text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare inc record; aid uuid; prev record;
begin
  perform public.require_admin();
  select * into inc from public.incidents where id=_incident for update;
  if inc is null then raise exception 'Incident not found'; end if;
  if inc.status in ('completed','rejected') then raise exception 'Incident is closed'; end if;
  if not public.is_active_worker(_worker) then raise exception 'Worker is not approved and active'; end if;
  select * into prev from public.assignments where incident_id=_incident and status in ('assigned','en_route','in_progress','awaiting_verification') limit 1;
  if prev is not null then
    if coalesce(trim(_reason),'') = '' then raise exception 'A reassignment reason is required'; end if;
    update public.assignments set status='reassigned', reassignment_reason=_reason where id=prev.id;
    perform public.notify(prev.worker_id,'Task reassigned',inc.reference||' was reassigned: '||_reason,'/worker');
  end if;
  insert into public.assignments(incident_id,worker_id,assigned_by) values (_incident,_worker,auth.uid()) returning id into aid;
  perform public.propagate_incident_status(_incident,'assigned','A verified collection worker has been assigned. Next: the worker will head to the location.',aid,null,'admin');
  perform public.notify(_worker,'New task '||inc.reference, initcap(replace(inc.category::text,'_',' '))||' · priority '||inc.priority_level,'/worker/tasks/'||aid);
  perform public.audit(case when prev is null then 'assignment.create' else 'assignment.reassign' end,'incident',_incident,jsonb_build_object('worker',_worker,'reason',_reason));
  return aid;
end $$;

-- WORKER: progress task
create or replace function public.worker_update_task(_assignment uuid, _to public.assignment_status, _notes text default null, _image text default null)
returns void language plpgsql security definer set search_path = public as $$
declare a record; inc_to public.report_status; msg text;
begin
  if not public.is_active_worker(auth.uid()) then raise exception 'Your worker account is not active'; end if;
  select * into a from public.assignments where id=_assignment for update;
  if a is null or a.worker_id <> auth.uid() then raise exception 'Task not found'; end if;
  if _to='en_route' and a.status='assigned' then
    update public.assignments set status='en_route', en_route_at=now() where id=_assignment;
    inc_to := 'en_route'; msg := 'The collection worker is on the way. Next: work will begin on arrival.';
  elsif _to='in_progress' and a.status in ('assigned','en_route') then
    update public.assignments set status='in_progress', started_at=now() where id=_assignment;
    inc_to := 'in_progress'; msg := 'Collection is in progress. Next: the worker will upload proof of completion.';
  elsif _to='awaiting_verification' and a.status='in_progress' then
    if coalesce(_image,'') = '' then raise exception 'A completion photo is required'; end if;
    if _image not like auth.uid()::text || '/%' then raise exception 'Invalid evidence path'; end if;
    update public.assignments set status='awaiting_verification', submitted_at=now(), completion_notes=_notes,
      completion_image_path=_image, verification_status='pending' where id=_assignment;
    inc_to := 'awaiting_verification'; msg := 'Work submitted with photo evidence. Next: an administrator will verify the result.';
  else
    raise exception 'Invalid status change from % to %', a.status, _to;
  end if;
  perform public.propagate_incident_status(a.incident_id, inc_to, msg, _assignment, _image, 'worker');
  if inc_to = 'awaiting_verification' then
    perform public.notify(u.user_id,'Completion awaiting verification','A task needs your review.','/admin/incidents/'||a.incident_id)
      from public.user_roles u where u.role='admin';
  end if;
  perform public.audit('task.'||_to,'assignment',_assignment,jsonb_build_object('notes',_notes));
end $$;

-- ADMIN: verify completion
create or replace function public.admin_verify_completion(_assignment uuid, _approve boolean, _note text, _override boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare a record;
begin
  perform public.require_admin();
  select * into a from public.assignments where id=_assignment for update;
  if a is null then raise exception 'Assignment not found'; end if;
  if _override then
    if coalesce(trim(_note),'') = '' then raise exception 'Override requires a documented reason'; end if;
    if a.status not in ('assigned','en_route','in_progress','awaiting_verification') then raise exception 'Assignment closed'; end if;
    update public.assignments set status='completed', completed_at=now(), verification_status='approved', verified_by=auth.uid(), verified_at=now(), override_reason=_note where id=_assignment;
    perform public.propagate_incident_status(a.incident_id,'completed','Resolved by administrator override: '||_note,_assignment,null,'admin');
  elsif a.status <> 'awaiting_verification' then
    raise exception 'Nothing to verify';
  elsif _approve then
    update public.assignments set status='completed', completed_at=now(), verification_status='approved', verified_by=auth.uid(), verified_at=now(), verification_note=_note where id=_assignment;
    perform public.propagate_incident_status(a.incident_id,'completed','Collection verified and completed. Please rate the service.',_assignment,a.completion_image_path,'admin');
    perform public.notify(a.worker_id,'Task verified','Your completion was approved.','/worker/tasks/'||_assignment);
  else
    if coalesce(trim(_note),'') = '' then raise exception 'A reason is required'; end if;
    update public.assignments set status='in_progress', verification_status='rejected', verified_by=auth.uid(), verified_at=now(), verification_note=_note where id=_assignment;
    perform public.propagate_incident_status(a.incident_id,'in_progress','Completion needs more work: '||_note,_assignment,null,'admin');
    perform public.notify(a.worker_id,'Completion returned',_note,'/worker/tasks/'||_assignment);
  end if;
  perform public.audit(case when _override then 'completion.override' when _approve then 'completion.approve' else 'completion.reject' end,'assignment',_assignment,jsonb_build_object('note',_note));
end $$;

-- ADMIN: update incident priority
create or replace function public.admin_set_priority(_incident uuid, _level public.priority_level, _reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if coalesce(trim(_reason),'')='' then raise exception 'Reason required'; end if;
  update public.incidents set priority_level=_level, priority_reason='Manual: '||_reason, updated_at=now() where id=_incident;
  perform public.audit('incident.priority','incident',_incident,jsonb_build_object('level',_level,'reason',_reason));
end $$;

-- ADMIN: review worker / account
create or replace function public.admin_set_worker_status(_user uuid, _status public.worker_status, _reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if _status in ('rejected','suspended') and coalesce(trim(_reason),'')='' then raise exception 'Reason required'; end if;
  perform set_config('tsidat.bypass','on',true);
  update public.profiles set worker_status=_status where id=_user;
  update public.worker_applications set status=_status, reviewed_by=auth.uid(), reviewed_at=now(), rejection_reason=_reason where user_id=_user;
  perform set_config('tsidat.bypass','off',true);
  perform public.notify(_user,'Worker account '||_status, coalesce(_reason,'Your application status changed.'),'/worker');
  perform public.audit('worker.'||_status,'profile',_user,jsonb_build_object('reason',_reason));
end $$;

create or replace function public.admin_set_account_status(_user uuid, _status text, _reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if _user = auth.uid() then raise exception 'You cannot change your own account'; end if;
  perform set_config('tsidat.bypass','on',true);
  update public.profiles set account_status=_status where id=_user;
  perform set_config('tsidat.bypass','off',true);
  perform public.audit('account.'||_status,'profile',_user,jsonb_build_object('reason',_reason));
end $$;

create or replace function public.admin_set_role(_user uuid, _role public.app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if _user = auth.uid() then raise exception 'You cannot change your own roles'; end if;
  if _grant then insert into public.user_roles(user_id,role) values (_user,_role) on conflict do nothing;
  else delete from public.user_roles where user_id=_user and role=_role; end if;
  perform public.audit(case when _grant then 'role.grant' else 'role.revoke' end,'profile',_user,jsonb_build_object('role',_role));
end $$;

-- ADMIN: reopen
create or replace function public.admin_reopen_incident(_incident uuid, _reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if coalesce(trim(_reason),'')='' then raise exception 'Reason required'; end if;
  update public.assignments set status='reassigned', reassignment_reason='Reopened: '||_reason where incident_id=_incident and status not in ('reassigned');
  perform public.propagate_incident_status(_incident,'reopened','Reopened: '||_reason||'. Next: a worker will be reassigned.',null,null,'admin');
  perform public.audit('incident.reopen','incident',_incident,jsonb_build_object('reason',_reason));
end $$;

-- ANALYTICS for planners/admins (aggregated, no personal data)
create or replace function public.analytics_summary(_from timestamptz, _to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare res jsonb;
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'planner')) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'total', (select count(*) from reports where created_at between _from and _to),
    'by_status', (select coalesce(jsonb_object_agg(status, c),'{}') from (select status, count(*) c from reports where created_at between _from and _to group by status) s),
    'by_category', (select coalesce(jsonb_object_agg(category, c),'{}') from (select category, count(*) c from reports where created_at between _from and _to group by category) s),
    'by_day', (select coalesce(jsonb_agg(jsonb_build_object('day',d,'count',c) order by d),'[]') from (select date_trunc('day',created_at)::date d, count(*) c from reports where created_at between _from and _to group by 1) s),
    'avg_to_assign_hours', (select round(avg(extract(epoch from (assigned_at - accepted_at))/3600)::numeric,1) from incidents where assigned_at is not null and created_at between _from and _to),
    'avg_assign_to_complete_hours', (select round(avg(extract(epoch from (completed_at - assigned_at))/3600)::numeric,1) from incidents where completed_at is not null and created_at between _from and _to),
    'avg_rating', (select round(avg(rating)::numeric,2) from feedback where created_at between _from and _to),
    'hotspots', (select coalesce(jsonb_agg(h),'[]') from (select round(latitude::numeric,2) lat, round(longitude::numeric,2) lng, count(*) c from reports where created_at between _from and _to group by 1,2 order by 3 desc limit 10) h),
    'points', (select coalesce(jsonb_agg(jsonb_build_object('lat',round(latitude::numeric,3),'lng',round(longitude::numeric,3),'p',priority_level)),'[]') from reports where created_at between _from and _to),
    'workers', (select coalesce(jsonb_agg(w),'[]') from (select 'Worker '||left(a.worker_id::text,4) as worker, count(*) filter (where a.status='completed') completed,
        round(avg(extract(epoch from (a.completed_at-a.assigned_at))/3600)::numeric,1) avg_hours from assignments a where a.created_at between _from and _to group by a.worker_id) w)
  ) into res;
  return res;
end $$;
grant execute on function public.analytics_summary to authenticated;

-- revoke direct exec from anon on admin fns
revoke execute on all functions in schema public from anon;

-- REALTIME
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.reports;
alter publication supabase_realtime add table public.assignments;
