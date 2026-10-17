import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, errMsg, STATUS } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, PriorityBadge, SignedImage, StatusBadge, Timeline } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";
import { AdminOnly } from "@/components/tsidat/AdminOnly";
import { useMe } from "@/lib/auth";
import { useLocations, isSuperadmin } from "@/lib/locations";
import { LocationSelect } from "@/components/tsidat/LocationSelect";

export const Route = createFileRoute("/_authenticated/admin/reports/$id")({
  head: () => ({ meta: [{ title: "Review report — Tsidat admin" }, { name: "description", content: "Review report evidence." }, { property: "og:title", content: "Review report — Tsidat admin" }, { property: "og:description", content: "Review report evidence." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminOnly><Review /></AdminOnly>,
});

function Review() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const locations = useLocations();
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["reports", "admin-detail", id],
    queryFn: async () => {
      const { data: r } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
      if (!r) return null;
      const d = 0.003;
      const [{ data: hist }, { data: near }, { data: reporter }] = await Promise.all([
        supabase.from("status_history").select("id,to_status,note,created_at,actor_role").eq("report_id", id).order("created_at"),
        supabase.from("incidents").select("id,reference,category,status,priority_level,latitude,longitude").eq("location_id", r.location_id ?? "00000000-0000-0000-0000-000000000000").not("status", "in", "(completed,rejected)")
          .gte("latitude", r.latitude - d).lte("latitude", r.latitude + d).gte("longitude", r.longitude - d).lte("longitude", r.longitude + d),
        supabase.from("profiles").select("display_name").eq("id", r.resident_id).maybeSingle(),
      ]);
      return { r, hist: hist ?? [], near: near ?? [], reporter };
    },
  });

  async function act(action: "under_review" | "accept" | "reject", incident?: string) {
    setBusy(true);
    const { data, error } = await supabase.rpc("admin_review_report", { _report: id, _action: action, _reason: reason, _incident: incident });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Report updated");
    qc.invalidateQueries({ queryKey: ["reports"] });
    if (action === "accept" && data) navigate({ to: "/admin/incidents/$id", params: { id: data as string } });
  }

  if (q.isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!q.data) return <p>Report not found.</p>;
  const { r, hist, near, reporter } = q.data;
  const reviewable = ["submitted", "under_review", "reopened"].includes(r.status);

  return (
    <div>
      <PageHeader title={`${r.reference} · ${categoryLabel(r.category)}`} subtitle={`By ${reporter?.display_name ?? "resident"} · ${new Date(r.created_at).toLocaleString()}`}
        actions={<div className="flex gap-2"><StatusBadge status={r.status} /><PriorityBadge level={r.priority_level} /></div>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SignedImage bucket="report-images" path={r.image_path} alt="Evidence" className="aspect-video w-full rounded-xl" />
          <Panel><p>{r.description}</p><p className="mt-2 text-sm text-muted-foreground">{r.location_description || "No landmark given"} · {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Priority score {r.priority_score}: category weight plus nearby-report density.</p></Panel>
          <PointsMap height="h-64" points={[{ id: r.id, lat: r.latitude, lng: r.longitude, priority: r.priority_level, title: r.reference }, ...near.map((n) => ({ id: n.id, lat: n.latitude, lng: n.longitude, priority: n.priority_level, title: `${n.reference} (incident)` }))]} />
        </div>
        <div className="space-y-4">
          <div className="space-y-2 border-b pb-4"><p className="text-sm font-semibold">Collection location: {locations.data?.find((l) => l.id === r.location_id)?.name ?? "Unassigned"}</p>
            {isSuperadmin(me?.roles ?? []) && !r.incident_id && <div className="flex gap-2"><LocationSelect value={location} onChange={setLocation} /><Button variant="outline" disabled={!location || busy} onClick={async () => { setBusy(true); const { error } = await supabase.rpc("superadmin_route_report", { _report: id, _location: location }); setBusy(false); if (error) return toast.error(errMsg(error)); toast.success("Report location updated"); qc.invalidateQueries({ queryKey: ["reports"] }); }}>Save location</Button></div>}
          </div>
          {r.incident_id && <Panel>Linked to incident <Link to="/admin/incidents/$id" params={{ id: r.incident_id }} className="font-semibold text-primary underline">open incident</Link></Panel>}
          {reviewable && (
            <Panel className="space-y-3">
              <h2 className="text-lg font-bold">Review decision</h2>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Note to resident (required to reject)" />
              <div className="flex flex-wrap gap-2">
                {r.status === "submitted" && <Button variant="outline" disabled={busy} onClick={() => act("under_review")}>Mark under review</Button>}
                <Button disabled={busy} onClick={() => act("accept")}>Accept · new incident</Button>
                <Button variant="destructive" disabled={busy || !reason.trim()} onClick={() => act("reject")}>Reject</Button>
              </div>
              {near.length > 0 && (
                <div className="border-t pt-3">
                  <p className="mb-2 text-sm font-semibold">Or link to an existing nearby incident (same waste pile):</p>
                  {near.map((n) => (
                    <div key={n.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                      <span>{n.reference} · {categoryLabel(n.category)} · {STATUS[n.status].label}</span>
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("accept", n.id)}>Link</Button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
          <Panel><h2 className="mb-3 text-lg font-bold">Timeline</h2><Timeline rows={hist} current={r.status} /></Panel>
        </div>
      </div>
    </div>
  );
}
