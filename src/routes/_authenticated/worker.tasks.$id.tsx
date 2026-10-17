import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { categoryLabel, errMsg, validateImage } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, PriorityBadge, SignedImage, StatusBadge, Timeline } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";

export const Route = createFileRoute("/_authenticated/worker/tasks/$id")({
  head: () => ({ meta: [{ title: "Task — Tsidat" }, { name: "description", content: "Collection task details." }] }),
  component: TaskDetail,
});

function TaskDetail() {
  const { id } = Route.useParams();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const q = useQuery({
    queryKey: ["tasks", "detail", id],
    queryFn: async () => {
      const { data: a, error } = await supabase.from("assignments").select("*, incident:incidents(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!a) return null;
      const [{ data: reports }, { data: hist }] = await Promise.all([
        supabase.from("reports").select("id,reference,description,image_path,created_at").eq("incident_id", a.incident_id),
        supabase.from("status_history").select("id,to_status,note,created_at,actor_role").eq("incident_id", a.incident_id).is("report_id", null).order("created_at"),
      ]);
      return { a, reports: reports ?? [], hist: hist ?? [] };
    },
  });

  if (q.isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!q.data || !q.data.a.incident) return <p>Task not found. <Link to="/worker" className="text-primary underline">Back</Link></p>;
  const { a, reports, hist } = q.data;
  const inc = a.incident!;
  const closed = a.status === "reassigned";

  async function move(to: "en_route" | "in_progress" | "awaiting_verification") {
    setBusy(true);
    try {
      let path: string | null = null;
      if (to === "awaiting_verification") {
        if (!file) throw new Error("Add a completion photo");
        const err = validateImage(file); if (err) throw new Error(err);
        path = `${me!.id}/${a.id}-${Date.now()}.${file.type.split("/")[1]}`;
        const up = await supabase.storage.from("completion-images").upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
      }
      const { error } = await supabase.rpc("worker_update_task", { _assignment: a.id, _to: to, _notes: notes.trim() || undefined, _image: path ?? undefined });
      if (error) throw error;
      toast.success("Task updated");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={categoryLabel(inc.category)} subtitle={inc.reference} actions={<div className="flex gap-2"><StatusBadge status={closed ? "rejected" : a.status} /><PriorityBadge level={inc.priority_level} /></div>} />
      {closed && <Panel className="mb-4 border-warning">This task was reassigned{a.reassignment_reason ? `: ${a.reassignment_reason}` : "."}</Panel>}
      {a.verification_status === "rejected" && a.status === "in_progress" && <Panel className="mb-4 border-destructive"><b>Returned by admin:</b> {a.verification_note}</Panel>}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <PointsMap height="h-64" points={[{ id: inc.id, lat: inc.latitude, lng: inc.longitude, priority: inc.priority_level, title: inc.reference }]} />
          <Button asChild variant="secondary" className="w-full"><a href={`https://www.google.com/maps/dir/?api=1&destination=${inc.latitude},${inc.longitude}`} target="_blank" rel="noreferrer"><Navigation className="mr-2 h-4 w-4" />Open navigation</a></Button>
          <p className="text-sm text-muted-foreground">{inc.location_description || `${inc.latitude.toFixed(5)}, ${inc.longitude.toFixed(5)}`}</p>

          {!closed && a.status !== "completed" && (
            <Panel className="space-y-3">
              <h2 className="text-lg font-bold">Update progress</h2>
              {a.status === "assigned" && <Button className="w-full" size="lg" disabled={busy} onClick={() => move("en_route")}>I'm on my way</Button>}
              {(a.status === "assigned" || a.status === "en_route") && <Button className="w-full" size="lg" variant={a.status === "assigned" ? "outline" : "default"} disabled={busy} onClick={() => move("in_progress")}>Start work</Button>}
              {a.status === "in_progress" && (
                <>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}><Camera className="mr-2 h-4 w-4" />{file ? `Photo: ${file.name}` : "Add completion photo"}</Button>
                  {file && <img src={URL.createObjectURL(file)} alt="Completion preview" className="aspect-video w-full rounded-lg object-cover" />}
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Completion notes (what was collected, any issues)" />
                  <Button className="w-full" size="lg" disabled={busy || !file} onClick={() => move("awaiting_verification")}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit for verification</Button>
                </>
              )}
              {a.status === "awaiting_verification" && <p className="text-sm text-muted-foreground">Submitted. Waiting for an administrator to verify.</p>}
            </Panel>
          )}
          {a.completion_image_path && <Panel><p className="mb-2 font-semibold">Your completion photo</p><SignedImage bucket="completion-images" path={a.completion_image_path} alt="Completion" className="aspect-video w-full rounded-lg" /></Panel>}
        </div>
        <div className="space-y-4">
          <Panel>
            <h2 className="mb-3 text-lg font-bold">Reported issue ({reports.length})</h2>
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id}><SignedImage bucket="report-images" path={r.image_path} alt="Reported waste" className="aspect-video w-full rounded-lg" /><p className="mt-2 text-sm">{r.description}</p></div>
              ))}
            </div>
          </Panel>
          <Panel><h2 className="mb-3 text-lg font-bold">History</h2><Timeline rows={hist} /></Panel>
        </div>
      </div>
    </div>
  );
}
