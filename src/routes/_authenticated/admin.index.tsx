import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel, hoursSince, PRIORITY, STATUS } from "@/lib/tsidat";
import { Empty, Kpi, PageHeader, Panel, PriorityBadge, StatusBadge } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminOnly } from "@/components/tsidat/AdminOnly";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Command center — Tsidat" }, { name: "description", content: "Waste management command center." }] }),
  component: () => <AdminOnly><Command /></AdminOnly>,
});

const RANGES = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days", "3650": "All time" } as const;
const ACTIVE = ["accepted", "assigned", "en_route", "in_progress", "awaiting_verification", "reopened"];

function Command() {
  const navigate = useNavigate();
  const [range, setRange] = useState<keyof typeof RANGES>("30");
  const [fStatus, setFStatus] = useState("active");
  const [fPrio, setFPrio] = useState("all");
  const [fCat, setFCat] = useState("all");
  const from = useMemo(() => new Date(Date.now() - Number(range) * 864e5).toISOString(), [range]);

  const q = useQuery({
    queryKey: ["reports", "admin-dash", range],
    queryFn: async () => {
      const [reports, incidents, workers, apps] = await Promise.all([
        supabase.from("reports").select("id,status,created_at").gte("created_at", from),
        supabase.from("incidents").select("id,reference,category,status,priority_level,priority_score,latitude,longitude,location_description,accepted_at,assigned_at,completed_at,created_at, reports(count), assignments(status)").gte("created_at", from),
        supabase.from("profiles").select("id,available,worker_status").eq("worker_status", "approved"),
        supabase.from("worker_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return { reports: reports.data ?? [], incidents: incidents.data ?? [], workers: workers.data ?? [], pendingApps: apps.count ?? 0 };
    },
  });

  if (q.isLoading || !q.data) return <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>;
  const { reports, incidents, workers, pendingApps } = q.data;
  const cnt = (s: string[]) => reports.filter((r) => s.includes(r.status)).length;
  const done = incidents.filter((i) => i.status === "completed");
  const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) + "h" : "—");
  const toAssign = avg(incidents.filter((i) => i.assigned_at).map((i) => (+new Date(i.assigned_at!) - +new Date(i.accepted_at)) / 36e5));
  const toComplete = avg(done.filter((i) => i.assigned_at && i.completed_at).map((i) => (+new Date(i.completed_at!) - +new Date(i.assigned_at!)) / 36e5));
  const busyWorkers = new Set<string>();
  const resolvedBase = reports.filter((r) => r.status !== "submitted" && r.status !== "under_review").length;

  const filtered = incidents.filter((i) =>
    (fStatus === "all" || (fStatus === "active" ? ACTIVE.includes(i.status) : i.status === fStatus)) &&
    (fPrio === "all" || i.priority_level === fPrio) && (fCat === "all" || i.category === fCat));
  const prioRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  const urgent = incidents.filter((i) => ACTIVE.includes(i.status) && (i.priority_level === "critical" || i.priority_level === "high"))
    .sort((a, b) => prioRank[a.priority_level] - prioRank[b.priority_level] || +new Date(a.created_at) - +new Date(b.created_at));
  const unassigned = incidents.filter((i) => i.status === "accepted" || i.status === "reopened");

  return (
    <div>
      <PageHeader title="Command center" subtitle="Live operational overview"
        actions={<Select value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(RANGES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Kpi label="Total reports" value={reports.length} />
        <Kpi label="Awaiting review" value={cnt(["submitted", "under_review"])} tone="text-info" />
        <Kpi label="Unassigned incidents" value={unassigned.length} tone="text-warning" />
        <Kpi label="Assigned" value={incidents.filter((i) => i.status === "assigned").length} />
        <Kpi label="In progress" value={incidents.filter((i) => ["en_route", "in_progress", "awaiting_verification"].includes(i.status)).length} />
        <Kpi label="Completed" value={done.length} tone="text-success" />
        <Kpi label="Rejected reports" value={cnt(["rejected"])} tone="text-destructive" />
        <Kpi label="Resolution rate" value={resolvedBase ? Math.round((cnt(["completed"]) / resolvedBase) * 100) + "%" : "—"} hint="completed / reviewed" />
        <Kpi label="Avg to assign" value={toAssign} />
        <Kpi label="Avg assign → done" value={toComplete} />
        <Kpi label="Pending workers" value={<Link to="/admin/workers" className="hover:underline">{pendingApps}</Link>} />
        <Kpi label="Workers available" value={`${workers.filter((w) => w.available && !busyWorkers.has(w.id)).length}/${workers.length}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto text-lg font-bold">Operational map</h2>
            <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="all">All statuses</SelectItem>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={fPrio} onValueChange={setFPrio}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{Object.entries(PRIORITY).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={fCat} onValueChange={setFCat}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <PointsMap height="h-[460px]" points={filtered.map((i) => ({ id: i.id, lat: i.latitude, lng: i.longitude, priority: i.priority_level, title: `${i.reference} · ${categoryLabel(i.category)}`, subtitle: STATUS[i.status].label, onClick: () => navigate({ to: "/admin/incidents/$id", params: { id: i.id } }) }))} />
          <p className="mt-2 text-xs text-muted-foreground">{filtered.length} incidents shown · <Link to="/admin/reports" className="underline">Review new reports</Link></p>
        </Panel>
        <Panel>
          <h2 className="mb-3 text-lg font-bold">Urgent queue</h2>
          {urgent.length === 0 ? <Empty title="No urgent incidents" /> : (
            <div className="space-y-2">
              {urgent.map((i) => (
                <Link key={i.id} to="/admin/incidents/$id" params={{ id: i.id }} className="block rounded-lg border p-3 hover:border-primary">
                  <div className="flex items-center gap-2"><PriorityBadge level={i.priority_level} /><StatusBadge status={i.status} /><span className="ml-auto text-xs text-muted-foreground">{hoursSince(i.created_at)}</span></div>
                  <p className="mt-1 text-sm font-semibold">{i.reference} · {categoryLabel(i.category)}</p>
                  <p className="text-xs text-muted-foreground">{(i.reports as unknown as { count: number }[])[0]?.count ?? 0} reports · {i.location_description || `${i.latitude.toFixed(3)}, ${i.longitude.toFixed(3)}`}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
