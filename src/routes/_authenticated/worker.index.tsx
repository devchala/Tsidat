import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, List, Map as MapIcon, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { categoryLabel, hoursSince } from "@/lib/tsidat";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, PriorityBadge, StatusBadge } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";

export const Route = createFileRoute("/_authenticated/worker/")({
  head: () => ({ meta: [{ title: "My tasks — Tsidat" }, { name: "description", content: "Assigned collection tasks." }] }),
  component: WorkerHome,
});

function WorkerHome() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "map">("list");
  const approved = me?.profile.worker_status === "approved";

  const app = useQuery({
    queryKey: ["myapp", me?.id], enabled: !!me && !approved,
    queryFn: async () => (await supabase.from("worker_applications").select("*").eq("user_id", me!.id).maybeSingle()).data,
  });

  const tasks = useQuery({
    queryKey: ["tasks", "mine", me?.id], enabled: !!me && approved,
    queryFn: async () => {
      const { data, error } = await supabase.from("assignments").select("id,status,assigned_at,verification_status,incident:incidents(id,reference,category,priority_level,latitude,longitude,location_description)").eq("worker_id", me!.id).order("assigned_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!me) return null;
  if (!me.roles.includes("worker")) return <p>This area is for collection workers.</p>;

  if (!approved) {
    const s = me.profile.worker_status;
    return (
      <div className="mx-auto max-w-lg">
        <Panel className="text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
          <h1 className="mt-3 text-2xl font-bold">Application {s}</h1>
          <p className="mt-2 text-muted-foreground">
            {s === "pending" && "An administrator is reviewing your application. You'll be notified once approved."}
            {s === "rejected" && `Your application was not approved${app.data?.rejection_reason ? `: ${app.data.rejection_reason}` : "."}`}
            {s === "suspended" && `Your worker access is suspended${app.data?.rejection_reason ? `: ${app.data.rejection_reason}` : "."}`}
          </p>
          {app.data && <p className="mt-4 text-sm text-muted-foreground">Service area: {app.data.service_area || "—"} · Applied {new Date(app.data.created_at).toLocaleDateString()}</p>}
        </Panel>
      </div>
    );
  }

  async function toggleAvail(v: boolean) {
    const { error } = await supabase.from("profiles").update({ available: v }).eq("id", me!.id);
    if (error) return toast.error("Could not update availability");
    qc.invalidateQueries({ queryKey: ["me"] });
  }

  const active = tasks.data?.filter((t) => ["assigned", "en_route", "in_progress", "awaiting_verification"].includes(t.status)) ?? [];
  const past = tasks.data?.filter((t) => ["completed", "reassigned", "rejected"].includes(t.status)) ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My tasks" subtitle={`${active.length} active`}
        actions={
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><Switch checked={me.profile.available} onCheckedChange={toggleAvail} />Available</label>
            <div className="flex rounded-lg border p-0.5">
              <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
              <Button size="sm" variant={view === "map" ? "secondary" : "ghost"} onClick={() => setView("map")}><MapIcon className="h-4 w-4" /></Button>
            </div>
          </div>
        } />
      {tasks.isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted" />}
      {tasks.data && active.length === 0 && <Empty title="No active tasks">New assignments appear here instantly.</Empty>}
      {view === "map" && active.length > 0 && (
        <PointsMap points={active.filter((t) => t.incident).map((t) => ({ id: t.id, lat: t.incident!.latitude, lng: t.incident!.longitude, priority: t.incident!.priority_level, title: t.incident!.reference, subtitle: categoryLabel(t.incident!.category), onClick: () => navigate({ to: "/worker/tasks/$id", params: { id: t.id } }) }))} />
      )}
      {view === "list" && <TaskList items={active} />}
      {past.length > 0 && (<><h2 className="mb-3 mt-10 text-lg font-bold">History</h2><TaskList items={past} /></>)}
    </div>
  );
}

type T = { id: string; status: string; assigned_at: string; incident: { reference: string; category: string; priority_level: string; location_description: string | null; latitude: number; longitude: number } | null };
function TaskList({ items }: { items: T[] }) {
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <Link key={t.id} to="/worker/tasks/$id" params={{ id: t.id }} className="block rounded-xl border bg-card p-4 shadow-soft hover:border-primary">
          <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{t.incident?.reference}</span><StatusBadge status={t.status === "reassigned" ? "rejected" : t.status} /><PriorityBadge level={t.incident?.priority_level ?? "low"} /></div>
          <p className="mt-1 font-semibold">{categoryLabel(t.incident?.category ?? "")}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />Assigned {hoursSince(t.assigned_at)} ago · {t.incident?.location_description || `${t.incident?.latitude.toFixed(4)}, ${t.incident?.longitude.toFixed(4)}`}</p>
        </Link>
      ))}
    </div>
  );
}
