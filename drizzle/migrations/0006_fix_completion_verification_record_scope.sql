CREATE OR REPLACE FUNCTION public.admin_verify_completion(_assignment uuid, _approve boolean, _note text, _override boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE task public.assignments%ROWTYPE;
BEGIN
  PERFORM public.require_admin();
  SELECT assignment_row.* INTO task
  FROM public.assignments AS assignment_row
  WHERE assignment_row.id = _assignment
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment not found';
  END IF;
  PERFORM public.require_location((SELECT incident_row.location_id FROM public.incidents AS incident_row WHERE incident_row.id = task.incident_id));
  IF _override THEN
    IF coalesce(trim(_note),'') = '' THEN RAISE EXCEPTION 'Override requires a documented reason'; END IF;
    IF task.status NOT IN ('assigned','en_route','in_progress','awaiting_verification') THEN RAISE EXCEPTION 'Assignment closed'; END IF;
    UPDATE public.assignments SET status='completed', completed_at=now(), verification_status='approved', verified_by=auth.uid(), verified_at=now(), override_reason=_note WHERE id=_assignment;
    PERFORM public.propagate_incident_status(task.incident_id,'completed','Resolved by administrator override: '||_note,_assignment,null,'admin');
  ELSIF task.status <> 'awaiting_verification' THEN
    RAISE EXCEPTION 'Nothing to verify';
  ELSIF _approve THEN
    UPDATE public.assignments SET status='completed', completed_at=now(), verification_status='approved', verified_by=auth.uid(), verified_at=now(), verification_note=_note WHERE id=_assignment;
    PERFORM public.propagate_incident_status(task.incident_id,'completed','Collection verified and completed. Please rate the service.',_assignment,task.completion_image_path,'admin');
    PERFORM public.notify(task.worker_id,'Task verified','Your completion was approved.','/worker/tasks/'||_assignment);
  ELSE
    IF coalesce(trim(_note),'') = '' THEN RAISE EXCEPTION 'A reason is required'; END IF;
    UPDATE public.assignments SET status='in_progress', verification_status='rejected', verified_by=auth.uid(), verified_at=now(), verification_note=_note WHERE id=_assignment;
    PERFORM public.propagate_incident_status(task.incident_id,'in_progress','Completion needs more work: '||_note,_assignment,null,'admin');
    PERFORM public.notify(task.worker_id,'Completion returned',_note,'/worker/tasks/'||_assignment);
  END IF;
  PERFORM public.audit(CASE WHEN _override THEN 'completion.override' WHEN _approve THEN 'completion.approve' ELSE 'completion.reject' END,'assignment',_assignment,jsonb_build_object('note',_note));
END
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_verify_completion(uuid,boolean,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_verify_completion(uuid,boolean,text,boolean) TO authenticated;