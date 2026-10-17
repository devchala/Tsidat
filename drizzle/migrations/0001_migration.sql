
create policy "report img upload own" on storage.objects for insert to authenticated
  with check (bucket_id='report-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "report img read" on storage.objects for select to authenticated using (
  bucket_id='report-images' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_role(auth.uid(),'admin')
    or exists(select 1 from public.reports r join public.assignments a on a.incident_id=r.incident_id
      where r.image_path = storage.objects.name and a.worker_id = auth.uid() and a.status <> 'reassigned')));
create policy "completion img upload own" on storage.objects for insert to authenticated
  with check (bucket_id='completion-images' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_worker(auth.uid()));
create policy "completion img read" on storage.objects for select to authenticated using (
  bucket_id='completion-images' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_role(auth.uid(),'admin')
    or exists(select 1 from public.assignments a join public.reports r on r.incident_id=a.incident_id
      where a.completion_image_path = storage.objects.name and r.resident_id = auth.uid())));
