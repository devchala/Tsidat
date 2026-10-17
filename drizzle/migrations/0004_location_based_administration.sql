CREATE TABLE public.locations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 2 AND 100), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.locations TO anon, authenticated; GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations readable" ON public.locations FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.admin_locations (user_id uuid NOT NULL REFERENCES public.profiles(id), location_id uuid NOT NULL REFERENCES public.locations(id), PRIMARY KEY(user_id,location_id));
GRANT SELECT ON public.admin_locations TO authenticated; GRANT ALL ON public.admin_locations TO service_role;
ALTER TABLE public.admin_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD COLUMN location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.reports ADD COLUMN location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.incidents ADD COLUMN location_id uuid REFERENCES public.locations(id);
CREATE INDEX ON public.profiles(location_id); CREATE INDEX ON public.reports(location_id); CREATE INDEX ON public.incidents(location_id);
INSERT INTO public.user_roles(user_id,role) SELECT user_id,'superadmin' FROM public.user_roles WHERE role='admin' ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id WHERE r.user_id=_user_id AND p.account_status='active' AND (r.role=_role OR (_role='admin' AND r.role='superadmin')))
$$;
CREATE OR REPLACE FUNCTION public.can_manage_location(_location uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.has_role(auth.uid(),'superadmin') OR (public.has_role(auth.uid(),'admin') AND EXISTS(SELECT 1 FROM public.admin_locations WHERE user_id=auth.uid() AND location_id=_location))
$$;
CREATE POLICY "own administration locations" ON public.admin_locations FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'superadmin'));
CREATE OR REPLACE FUNCTION public.can_manage_worker(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.has_role(auth.uid(),'superadmin') OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_user AND public.has_role(_user,'worker') AND public.can_manage_location(p.location_id) AND NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user AND role IN ('admin','superadmin','planner')))
$$;
CREATE OR REPLACE FUNCTION public.require_superadmin() RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(auth.uid(),'superadmin') THEN RAISE EXCEPTION 'Superadmin access required'; END IF; END $$;
CREATE OR REPLACE FUNCTION public.require_location(_location uuid) RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.can_manage_location(_location) THEN RAISE EXCEPTION 'This location is outside your administration area'; END IF; END $$;
ALTER POLICY "admin read profiles" ON public.profiles USING (public.can_manage_worker(id));
ALTER POLICY "own roles read" ON public.user_roles USING (user_id=auth.uid() OR public.can_manage_worker(user_id));
ALTER POLICY "own app read" ON public.worker_applications USING (user_id=auth.uid() OR public.can_manage_worker(user_id));
ALTER POLICY "admin read reports" ON public.reports USING (public.can_manage_location(location_id));
ALTER POLICY "admin read incidents" ON public.incidents USING (public.can_manage_location(location_id));
ALTER POLICY "admin read assignments" ON public.assignments USING (EXISTS(SELECT 1 FROM public.incidents i WHERE i.id=incident_id AND public.can_manage_location(i.location_id)));
ALTER POLICY "admin read history" ON public.status_history USING (EXISTS(SELECT 1 FROM public.incidents i WHERE i.id=incident_id AND public.can_manage_location(i.location_id)) OR EXISTS(SELECT 1 FROM public.reports r WHERE r.id=report_id AND public.can_manage_location(r.location_id)));
ALTER POLICY "resident read feedback" ON public.feedback USING (resident_id=auth.uid() OR EXISTS(SELECT 1 FROM public.reports r WHERE r.id=report_id AND public.can_manage_location(r.location_id)));
ALTER POLICY "admin read audit" ON public.audit_logs USING (public.has_role(auth.uid(),'superadmin') OR (public.has_role(auth.uid(),'admin') AND actor_id=auth.uid()));
ALTER POLICY "report img read" ON storage.objects USING (bucket_id='report-images' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.reports r WHERE r.image_path=name AND public.can_manage_location(r.location_id)) OR EXISTS(SELECT 1 FROM public.reports r JOIN public.assignments a ON a.incident_id=r.incident_id WHERE r.image_path=name AND a.worker_id=auth.uid() AND a.status<>'reassigned')));
ALTER POLICY "completion img read" ON storage.objects USING (bucket_id='completion-images' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.assignments a JOIN public.incidents i ON i.id=a.incident_id WHERE a.completion_image_path=name AND public.can_manage_location(i.location_id)) OR EXISTS(SELECT 1 FROM public.assignments a JOIN public.reports r ON r.incident_id=a.incident_id WHERE a.completion_image_path=name AND r.resident_id=auth.uid())));
CREATE OR REPLACE FUNCTION public.superadmin_create_location(_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE lid uuid; BEGIN PERFORM public.require_superadmin(); INSERT INTO public.locations(name) VALUES(trim(_name)) RETURNING id INTO lid; PERFORM public.audit('location.create','location',lid,jsonb_build_object('name',trim(_name))); RETURN lid; END $$;
CREATE OR REPLACE FUNCTION public.superadmin_set_local_admin(_user uuid,_location uuid,_grant boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 PERFORM public.require_superadmin(); IF public.has_role(_user,'superadmin') THEN RAISE EXCEPTION 'Superadmin already has access to all locations'; END IF;
 IF _grant THEN INSERT INTO public.admin_locations VALUES(_user,_location) ON CONFLICT DO NOTHING; INSERT INTO public.user_roles(user_id,role) VALUES(_user,'admin') ON CONFLICT DO NOTHING;
 ELSE DELETE FROM public.admin_locations WHERE user_id=_user AND location_id=_location; IF NOT EXISTS(SELECT 1 FROM public.admin_locations WHERE user_id=_user) THEN DELETE FROM public.user_roles WHERE user_id=_user AND role='admin'; END IF; END IF;
 PERFORM public.audit('admin.location','profile',_user,jsonb_build_object('location',_location,'grant',_grant)); END $$;
CREATE OR REPLACE FUNCTION public.admin_add_location_worker(_email text,_location uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE uid uuid; BEGIN
 PERFORM public.require_location(_location); IF _location IS NULL OR NOT EXISTS(SELECT 1 FROM public.locations WHERE id=_location) THEN RAISE EXCEPTION 'Choose a location'; END IF;
 SELECT id INTO uid FROM auth.users WHERE lower(email)=lower(trim(_email)); IF uid IS NULL THEN RAISE EXCEPTION 'No account found. Ask the worker to create an account first.'; END IF;
 IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=uid AND role IN ('admin','superadmin','planner')) THEN RAISE EXCEPTION 'An administrator or planner cannot be enrolled as a local worker'; END IF;
 IF NOT public.has_role(auth.uid(),'superadmin') AND EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND location_id IS NOT NULL AND location_id<>_location) THEN RAISE EXCEPTION 'Worker belongs to another location'; END IF;
 IF EXISTS(SELECT 1 FROM public.assignments a JOIN public.incidents i ON i.id=a.incident_id WHERE a.worker_id=uid AND a.status IN ('assigned','en_route','in_progress','awaiting_verification') AND i.location_id IS DISTINCT FROM _location) THEN RAISE EXCEPTION 'Worker has active tasks in another location'; END IF;
 PERFORM set_config('tsidat.bypass','on',true); UPDATE public.profiles SET location_id=_location,area=(SELECT name FROM public.locations WHERE id=_location),worker_status='approved' WHERE id=uid;
 INSERT INTO public.user_roles(user_id,role) VALUES(uid,'worker') ON CONFLICT DO NOTHING;
 INSERT INTO public.worker_applications(user_id,service_area,status,reviewed_by,reviewed_at) VALUES(uid,(SELECT name FROM public.locations WHERE id=_location),'approved',auth.uid(),now()) ON CONFLICT(user_id) DO UPDATE SET service_area=excluded.service_area,status='approved',reviewed_by=auth.uid(),reviewed_at=now();
 PERFORM set_config('tsidat.bypass','off',true); PERFORM public.notify(uid,'Worker approved','You have been added to your collection location.','/worker'); PERFORM public.audit('worker.enroll','profile',uid,jsonb_build_object('location',_location)); RETURN uid; END $$;
CREATE OR REPLACE FUNCTION public.protect_profile_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF current_setting('tsidat.bypass',true)='on' THEN RETURN new; END IF; IF new.account_status IS DISTINCT FROM old.account_status OR new.worker_status IS DISTINCT FROM old.worker_status OR new.location_id IS DISTINCT FROM old.location_id THEN RAISE EXCEPTION 'Not allowed to change account, worker status or assigned location'; END IF; new.updated_at:=now(); RETURN new; END $$;
DO $scope$ DECLARE f record; definition text; guard text; BEGIN FOR f IN SELECT p.oid,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('admin_review_report','admin_assign_worker','admin_verify_completion','admin_set_priority','admin_reopen_incident','admin_set_worker_status','admin_set_account_status','admin_set_role') LOOP
 definition:=pg_get_functiondef(f.oid);
 guard:=CASE f.proname
 WHEN 'admin_review_report' THEN 'perform public.require_location((select location_id from public.reports where id=_report)); if _incident is not null and (select location_id from public.incidents where id=_incident) is distinct from (select location_id from public.reports where id=_report) then raise exception ''Reports can only link to incidents in the same location''; end if;'
 WHEN 'admin_assign_worker' THEN 'perform public.require_location((select location_id from public.incidents where id=_incident)); if not public.can_manage_worker(_worker) or (select location_id from public.profiles where id=_worker) is distinct from (select location_id from public.incidents where id=_incident) then raise exception ''Worker must belong to the incident location''; end if;'
 WHEN 'admin_verify_completion' THEN 'perform public.require_location((select i.location_id from public.assignments a join public.incidents i on i.id=a.incident_id where a.id=_assignment));'
 WHEN 'admin_set_priority' THEN 'perform public.require_location((select location_id from public.incidents where id=_incident));'
 WHEN 'admin_reopen_incident' THEN 'perform public.require_location((select location_id from public.incidents where id=_incident));'
 WHEN 'admin_set_worker_status' THEN 'if not public.can_manage_worker(_user) then raise exception ''Worker is outside your location''; end if; if not exists(select 1 from public.profiles where id=_user and location_id is not null) then raise exception ''Assign the worker a location first''; end if;'
 WHEN 'admin_set_account_status' THEN 'perform public.require_superadmin();'
 WHEN 'admin_set_role' THEN 'perform public.require_superadmin(); if _role in (''admin'',''superadmin'') then raise exception ''Use location administrator management''; end if;'
 END;
 definition:=replace(definition,'perform public.require_admin();','perform public.require_admin(); '||guard);
 IF f.proname='admin_review_report' THEN definition:=replace(definition,'insert into public.incidents(category,title,','insert into public.incidents(location_id,category,title,'); definition:=replace(definition,'values (r.category,','values (r.location_id,r.category,'); END IF;
 EXECUTE definition;
 END LOOP; END $scope$;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE acct text:=coalesce(new.raw_user_meta_data->>'account_type','resident'); lid uuid; BEGIN
 PERFORM pg_advisory_xact_lock(74839201);
 IF acct='worker' THEN lid:=nullif(new.raw_user_meta_data->>'location_id','')::uuid; IF lid IS NULL OR NOT EXISTS(SELECT 1 FROM public.locations WHERE id=lid) THEN RAISE EXCEPTION 'Choose a valid service location'; END IF; END IF;
 INSERT INTO public.profiles(id,display_name,phone,area,location_id,worker_status) VALUES(new.id,coalesce(new.raw_user_meta_data->>'display_name',new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),new.raw_user_meta_data->>'phone',CASE WHEN lid IS NOT NULL THEN (SELECT name FROM public.locations WHERE id=lid) ELSE new.raw_user_meta_data->>'area' END,lid,CASE WHEN acct='worker' THEN 'pending'::public.worker_status ELSE 'none' END);
 IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role='superadmin') THEN INSERT INTO public.user_roles(user_id,role) VALUES(new.id,'superadmin');
 ELSIF acct='worker' THEN INSERT INTO public.user_roles(user_id,role) VALUES(new.id,'worker'); INSERT INTO public.worker_applications(user_id,national_id,service_area,experience) VALUES(new.id,coalesce(new.raw_user_meta_data->>'national_id',''),(SELECT name FROM public.locations WHERE id=lid),coalesce(new.raw_user_meta_data->>'experience',''));
 ELSE INSERT INTO public.user_roles(user_id,role) VALUES(new.id,'resident'); END IF; RETURN new; END $$;
CREATE OR REPLACE FUNCTION public.validate_report_location() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF new.location_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.locations WHERE id=new.location_id) THEN RAISE EXCEPTION 'Choose the report location'; END IF; RETURN new; END $$;
CREATE TRIGGER trg_report_location BEFORE INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION public.validate_report_location();
CREATE OR REPLACE FUNCTION public.can_user_manage_location(_user uuid,_location uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_user,'superadmin') OR (public.has_role(_user,'admin') AND EXISTS(SELECT 1 FROM public.admin_locations WHERE user_id=_user AND location_id=_location)) $$;
CREATE OR REPLACE FUNCTION public.after_report_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE a record; BEGIN
 INSERT INTO public.status_history(report_id,to_status,actor_id,actor_role,note) VALUES(new.id,'submitted',new.resident_id,'resident','Report received. An administrator will review it shortly.');
 FOR a IN SELECT DISTINCT user_id FROM public.user_roles WHERE role IN ('admin','superadmin') AND public.can_user_manage_location(user_id,new.location_id) LOOP PERFORM public.notify(a.user_id,'New report '||new.reference,'Priority: '||new.priority_level,'/admin/reports/'||new.id); END LOOP; RETURN new; END $$;
CREATE OR REPLACE FUNCTION public.superadmin_route_report(_report uuid,_location uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r record; BEGIN PERFORM public.require_superadmin(); SELECT * INTO r FROM public.reports WHERE id=_report FOR UPDATE; IF r IS NULL OR r.incident_id IS NOT NULL THEN RAISE EXCEPTION 'Only unlinked reports can change location'; END IF; IF _location IS NULL OR NOT EXISTS(SELECT 1 FROM public.locations WHERE id=_location) THEN RAISE EXCEPTION 'Choose a valid location'; END IF; UPDATE public.reports SET location_id=_location WHERE id=_report; PERFORM public.audit('report.location','report',_report,jsonb_build_object('location',_location)); END $$;
DO $analytics$ DECLARE d text; BEGIN
 SELECT pg_get_functiondef(p.oid) INTO d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='analytics_summary';
 d:=replace(d,'from reports where','from reports where (public.has_role(auth.uid(),''superadmin'') or public.has_role(auth.uid(),''planner'') or public.can_manage_location(location_id)) and');
 d:=replace(d,'from incidents where','from incidents where (public.has_role(auth.uid(),''superadmin'') or public.has_role(auth.uid(),''planner'') or public.can_manage_location(location_id)) and');
 d:=replace(d,'from feedback where','from feedback where (public.has_role(auth.uid(),''superadmin'') or public.has_role(auth.uid(),''planner'') or exists(select 1 from public.reports r where r.id=feedback.report_id and public.can_manage_location(r.location_id))) and');
 d:=replace(d,'from assignments a where','from assignments a where (public.has_role(auth.uid(),''superadmin'') or public.has_role(auth.uid(),''planner'') or exists(select 1 from public.incidents i where i.id=a.incident_id and public.can_manage_location(i.location_id))) and'); EXECUTE d;
 SELECT pg_get_functiondef(p.oid) INTO d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='worker_update_task';
 d:=replace(d,'where u.role=''admin''','where u.role in (''admin'',''superadmin'') and public.can_user_manage_location(u.user_id,(select location_id from public.incidents where id=a.incident_id))'); EXECUTE d;
END $analytics$;
REVOKE EXECUTE ON FUNCTION public.notify(uuid,text,text,text), public.audit(text,text,uuid,jsonb), public.propagate_incident_status(uuid,public.report_status,text,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.superadmin_create_location(text),public.superadmin_set_local_admin(uuid,uuid,boolean),public.admin_add_location_worker(text,uuid),public.superadmin_route_report(uuid,uuid),public.require_superadmin(),public.require_location(uuid),public.can_manage_location(uuid),public.can_manage_worker(uuid),public.can_user_manage_location(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.superadmin_create_location(text),public.superadmin_set_local_admin(uuid,uuid,boolean),public.admin_add_location_worker(text,uuid),public.superadmin_route_report(uuid,uuid),public.require_superadmin(),public.require_location(uuid),public.can_manage_location(uuid),public.can_manage_worker(uuid),public.can_user_manage_location(uuid,uuid) TO authenticated;