import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, errMsg, PRIORITY, type PriorityLevel } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, PriorityBadge, SignedImage, StatusBadge, Timeline } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";
import { AdminOnly } from "@/components/tsidat/AdminOnly";
import { useMe } from "@/lib/auth";
import { isSuperadmin, useLocations } from "@/lib/locations";
import { LocationSelect } from "@/components/tsidat/LocationSelect";

export const Route = createFileRoute("/_authenticated/admin/incidents/$id")({
  head: () => ({ meta: [{ title: "Incident — Tsidat admin" }, { name: "description", content: "Manage an operational incident." }, { property: "og:title", content: "Incident — Tsidat admin" }, { property: "og:description", content: "Manage an operational incident." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminOnly><Incident /></AdminOnly>,
});

const LIVE = ["assigned", "en_route", "in_progress", "awaiting_verification"];

function Incident() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const locations = useLocations();
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [prio, setPrio] = useState<PriorityLevel | "">("");
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["reports", "incident", id],
    queryFn: async () => {
      const { data: inc } = await supabase.from("incidents").select("*").eq("id", id).maybeSingle();
      if (!inc) return null;
      const [{ data: reports }, { data: asgs }, { data: hist }, { data: workers }, { data: allAsg }] = await Promise.all([
        supabase.from("reports").select("id,reference,description,image_path,status,created_at").eq("incident_id", id).order("created_at"),
        supabase.from("assignments").select("*").eq("incident_id", id).order("assigned_at", { ascending: false }),
        supabase.from("status_history").select("id,to_status,note,created_at,actor_role").eq("incident_id", id).is("report_id", null).order("created_at"),
        supabase.from("profiles").select("id,display_name,area,available,account_status").eq("worker_status", "approved").eq("account_status", "active").eq("location_id", inc.location_id ?? "00000000-0000-0000-0000-000000000000"),
        supabase.from("assignments").select("worker_id,status"),
      ]);
      const load = new Map<string, { active: number; done: number }>();
      (allAsg ?? []).forEach((a) => {
        const l = load.get(a.worker_id) ?? { active: 0, done: 0 };
        if (LIVE.includes(a.status)) l.active++; if (a.status === "completed") l.done++;
        load.set(a.worker_id, l);
      });
      const area = (inc.location_description ?? "").toLowerCase();
      const ranked = (workers ?? []).map((w) => {
        const l = load.get(w.id) ?? { active: 0, done: 0 };
        const areaMatch = !!w.area && area.includes(w.area.toLowerCase());
        const score = (w.available ? 50 : 0) + (areaMatch ? 25 : 0) - l.active * 15 + Math.min(l.done, 10);
        return { ...w, ...l, areaMatch, score };
      }).sort((a, b) => b.score - a.score);
      return { inc, reports: reports ?? [], asgs: asgs ?? [], hist: hist ?? [], ranked };
    },
  });

  async function run(fn: () => PromiseLike<{ error: unknown }>, ok: string) {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success(ok);
    setNote(""); setReason("");
    qc.invalidateQueries({ queryKey: ["reports"] });
  }

  if (q.isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!q.data) return <p>Incident not found.</p>;
  const { inc, reports, asgs, hist, ranked } = q.data;
  const current = asgs.find((a) => LIVE.includes(a.status));
  const workerName = (wid: string) => ranked.find((w) => w.id === wid)?.display_name ?? "Worker";
  const closed = inc.status === "completed";

  return (
    <div>
      <PageHeader title={`${inc.reference} · ${categoryLabel(inc.category)}`} subtitle={inc.priority_reason ?? undefined} actions={<div className="flex gap-2"><StatusBadge status={inc.status} /><PriorityBadge level={inc.priority_level} /></div>} />
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b pb-4"><p className="text-sm font-semibold">Collection location: {locations.data?.find((l) => l.id === inc.location_id)?.name ?? "Unassigned"}</p>{isSuperadmin(me?.roles ?? []) && <div className="flex w-full gap-2 sm:w-80"><LocationSelect value={location} onChange={setLocation} /><Button variant="outline" disabled={!location || busy} onClick={() => run(() => supabase.rpc("superadmin_route_incident", { _incident: id, _location: location }), "Incident location updated")}>Save location</Button></div>}</div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PointsMap height="h-64" points={[{ id: inc.id, lat: inc.latitude, lng: inc.longitude, priority: inc.priority_level, title: inc.reference }]} />

          {current?.status === "awaiting_verification" && (
            <Panel className="space-y-3 border-accent">
              <h2 className="text-lg font-bold">Verify completion</h2>
              <p className="text-sm">Submitted by {workerName(current.worker_id)} · {current.completion_notes || "no notes"}</p>
              <SignedImage bucket="completion-images" path={current.completion_image_path} alt="Completion evidence" className="aspect-video w-full rounded-lg" />
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Verification note (required to return)" maxLength={500} />
              <div className="flex gap-2">
                <Button disabled={busy} onClick={() => run(() => supabase.rpc("admin_verify_completion", { _assignment: current.id, _approve: true, _note: note }), "Completion approved")}>Approve & close</Button>
                <Button variant="outline" disabled={busy || !note.trim()} onClick={() => run(() => supabase.rpc("admin_verify_completion", { _assignment: current.id, _approve: false, _note: note }), "Returned to worker")}>Return for more work</Button>
              </div>
            </Panel>
          )}

          {!closed && (
            <Panel className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-4 w-4 text-accent" />{current ? "Reassign worker" : "Assign worker"}</h2>
              <p className="text-xs text-muted-foreground">Suggestions rank available workers, area match and current workload. You decide.</p>
              {current && <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reassignment reason (required)" maxLength={300} />}
              {ranked.length === 0 && <p className="text-sm text-muted-foreground">No approved active workers. <Link to="/admin/workers" className="underline">Review applications</Link>.</p>}
              <div className="space-y-2">
                {ranked.slice(0, 6).map((w, i) => (
                  <div key={w.id} className="flex items-center gap-3 rounded-lg border p-2 text-sm">
                    <div className="flex-1">
                      <p className="font-semibold">{w.display_name} {i === 0 && <span className="ml-1 rounded bg-accent/40 px-1.5 text-xs">Suggested</span>}</p>
                      <p className="text-xs text-muted-foreground">{w.available ? "Available" : "Unavailable"} · {w.active} active · {w.done} completed {w.area && `· ${w.area}`}{w.areaMatch && " (area match)"}</p>
                    </div>
                    <Button size="sm" disabled={busy || current?.worker_id === w.id || (!!current && !reason.trim())}
                      onClick={() => run(() => supabase.rpc("admin_assign_worker", { _incident: id, _worker: w.id, _reason: reason || undefined }), "Worker assigned")}>Assign</Button>
                  </div>
                ))}
              </div>
              {current && current.status !== "awaiting_verification" && (
                <div className="border-t pt-3">
                  <p className="mb-2 text-sm font-semibold">Admin override (close without photo)</p>
                  <div className="flex gap-2"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Documented reason" maxLength={300} />
                    <Button variant="outline" disabled={busy || !note.trim()} onClick={() => run(() => supabase.rpc("admin_verify_completion", { _assignment: current.id, _approve: true, _note: note, _override: true }), "Closed by override")}>Override</Button></div>
                </div>
              )}
            </Panel>
          )}

          <Panel>
            <h2 className="mb-3 text-lg font-bold">Linked reports ({reports.length})</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {reports.map((r) => (
                <Link key={r.id} to="/admin/reports/$id" params={{ id: r.id }} className="rounded-lg border p-2 hover:border-primary">
                  <SignedImage bucket="report-images" path={r.image_path} alt="" className="aspect-video w-full rounded" />
                  <p className="mt-1 font-mono text-xs">{r.reference}</p><p className="line-clamp-2 text-sm">{r.description}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="space-y-2">
            <h2 className="text-lg font-bold">Priority</h2>
            <p className="text-sm">Score {inc.priority_score}</p>
            <Select value={prio} onValueChange={(v) => setPrio(v as PriorityLevel)}><SelectTrigger><SelectValue placeholder="Change level" /></SelectTrigger><SelectContent>{Object.entries(PRIORITY).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            {prio && <><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" maxLength={300} />
              <Button size="sm" disabled={busy || !reason.trim()} onClick={() => run(() => supabase.rpc("admin_set_priority", { _incident: id, _level: prio, _reason: reason }), "Priority updated")}>Save priority</Button></>}
          </Panel>
          {closed && (
            <Panel className="space-y-2"><h2 className="text-lg font-bold">Reopen</h2><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is it reopened?" maxLength={300} />
              <Button size="sm" variant="outline" disabled={busy || !reason.trim()} onClick={() => run(() => supabase.rpc("admin_reopen_incident", { _incident: id, _reason: reason }), "Incident reopened")}>Reopen incident</Button></Panel>
          )}
          <Panel>
            <h2 className="mb-2 text-lg font-bold">Assignments</h2>
            {asgs.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : asgs.map((a) => (
              <div key={a.id} className="border-b py-2 text-sm last:border-0"><p className="font-semibold">{workerName(a.worker_id)} · {a.status}</p><p className="text-xs text-muted-foreground">{new Date(a.assigned_at).toLocaleString()} {a.reassignment_reason && `· ${a.reassignment_reason}`} {a.override_reason && `· override: ${a.override_reason}`}</p></div>
            ))}
          </Panel>
          <Panel><h2 className="mb-3 text-lg font-bold">Incident history</h2><Timeline rows={hist} /></Panel>
        </div>
      </div>
    </div>
  );
}
