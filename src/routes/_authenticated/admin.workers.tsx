import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { errMsg } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, PageHeader } from "@/components/tsidat/bits";
import { AdminOnly } from "@/components/tsidat/AdminOnly";
import { useMe } from "@/lib/auth";
import { isSuperadmin } from "@/lib/locations";
import { LocationSelect } from "@/components/tsidat/LocationSelect";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/workers")({
  head: () => ({ meta: [{ title: "Workers — Tsidat admin" }, { name: "description", content: "Verify and manage collection workers." }, { property: "og:title", content: "Workers — Tsidat admin" }, { property: "og:description", content: "Verify and manage collection workers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminOnly><Workers /></AdminOnly>,
});

type WS = "pending" | "approved" | "rejected" | "suspended";

function Workers() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const global = isSuperadmin(me?.roles ?? []);
  const allowed = global ? undefined : me?.locations.map((l) => l.id) ?? [];
  const [location, setLocation] = useState("all");
  const [addLocation, setAddLocation] = useState("");
  const [email, setEmail] = useState("");
  const [workerLocations, setWorkerLocations] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<WS>("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const q = useQuery({
    queryKey: ["workers", tab, location, me?.id],
    queryFn: async () => {
      let request = supabase.from("worker_applications").select("*, profile:profiles!worker_applications_user_id_fkey!inner(display_name,phone,available,location_id)").eq("status", tab).order("created_at");
      if (location !== "all") request = request.eq("profile.location_id", location);
      const { data, error } = await request;
      if (error) throw error;
      return data;
    },
  });

  async function set(user: string, status: WS) {
    setBusy(true);
    const { error } = await supabase.rpc("admin_set_worker_status", { _user: user, _status: status, _reason: reasons[user] || undefined });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success(`Worker ${status}`);
    qc.invalidateQueries({ queryKey: ["workers"] });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.rpc("admin_add_location_worker", { _email: email, _location: addLocation });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Worker added to location"); setEmail(""); setTab("approved");
    qc.invalidateQueries();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Workers" subtitle={global ? "All collection locations" : me?.locations.map((l) => l.name).join(" · ")} actions={<div className="w-56"><LocationSelect value={location} onChange={setLocation} allowed={allowed} all /></div>} />
      <form onSubmit={add} className="mb-8 grid gap-3 border-b pb-6 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="worker-email">Worker account email</Label><Input id="worker-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Existing account email" /></div>
        <div className="space-y-1.5"><Label>Collection location</Label><LocationSelect value={addLocation} onChange={setAddLocation} allowed={allowed} label="Worker location" /></div>
        <Button className="sm:col-span-2 sm:justify-self-start" disabled={busy || !email.trim() || !addLocation}><Plus className="mr-2 h-4 w-4" />Add worker</Button>
      </form>
      <Tabs value={tab} onValueChange={(v) => setTab(v as WS)} className="mb-4"><TabsList><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger><TabsTrigger value="suspended">Suspended</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger></TabsList></Tabs>
      {q.data?.length === 0 && <Empty title={`No ${tab} workers`} />}
      {q.error && <p className="text-destructive">{errMsg(q.error)}</p>}
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading workers…</p>}
      <div className="space-y-3">
        {q.data?.map((w) => (
          <div key={w.id} className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold">{w.profile?.display_name}</p>
                <p className="text-sm text-muted-foreground">Area: {w.service_area || "—"} · ID: {w.national_id || "—"} · {w.profile?.phone || "no phone"}</p>
                {w.experience && <p className="mt-1 text-sm">{w.experience}</p>}
                {w.rejection_reason && <p className="mt-1 text-sm text-destructive">Reason: {w.rejection_reason}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Applied {new Date(w.created_at).toLocaleDateString()} {w.reviewed_at && `· reviewed ${new Date(w.reviewed_at).toLocaleDateString()}`}</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-64">
                {tab !== "approved" && <Button disabled={busy || !w.profile?.location_id} onClick={() => set(w.user_id, "approved")}>Approve</Button>}
                {!w.profile?.location_id && <p className="text-xs text-warning">No assigned location</p>}
                {global && <><LocationSelect value={workerLocations[w.user_id] ?? w.profile?.location_id ?? ""} onChange={(v) => setWorkerLocations({ ...workerLocations, [w.user_id]: v })} label="Assigned worker location" /><Button variant="outline" disabled={busy || !workerLocations[w.user_id]} onClick={async () => { const chosen = workerLocations[w.user_id]; if (!chosen) return; setBusy(true); const { error } = await supabase.rpc("superadmin_set_worker_location", { _user: w.user_id, _location: chosen }); setBusy(false); if (error) return toast.error(errMsg(error)); toast.success("Worker location updated"); qc.invalidateQueries(); }}>Save worker location</Button></>}
                <Input placeholder="Reason (for reject/suspend)" value={reasons[w.user_id] ?? ""} onChange={(e) => setReasons({ ...reasons, [w.user_id]: e.target.value })} maxLength={300} />
                <div className="flex gap-2">
                  {tab === "pending" && <Button variant="destructive" className="flex-1" disabled={busy || !reasons[w.user_id]?.trim()} onClick={() => set(w.user_id, "rejected")}>Reject</Button>}
                  {tab === "approved" && <Button variant="destructive" className="flex-1" disabled={busy || !reasons[w.user_id]?.trim()} onClick={() => set(w.user_id, "suspended")}>Suspend</Button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
