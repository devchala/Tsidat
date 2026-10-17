import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Plus, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocations } from "@/lib/locations";
import { errMsg } from "@/lib/tsidat";
import { AdminOnly } from "@/components/tsidat/AdminOnly";
import { PageHeader, Empty } from "@/components/tsidat/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/locations")({
  head: () => ({ meta: [
    { title: "Locations & local admins — Tsidat" },
    { name: "description", content: "Manage collection locations and appoint local administrators." },
    { property: "og:title", content: "Locations & local admins — Tsidat" },
    { property: "og:description", content: "Manage collection locations and appoint local administrators." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AdminOnly roles={["superadmin"]}><Locations /></AdminOnly>,
});

function Locations() {
  const qc = useQueryClient();
  const locations = useLocations();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const people = useQuery({ queryKey: ["local-admins"], queryFn: async () => {
    const [p, r, a] = await Promise.all([
      supabase.from("profiles").select("id,display_name,phone,account_status").order("display_name"),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("admin_locations").select("user_id,location_id"),
    ]);
    if (p.error || r.error || a.error) throw p.error || r.error || a.error;
    return { users: (p.data ?? []).filter((u) => !r.data?.some((role) => role.user_id === u.id && role.role === "superadmin")), memberships: a.data ?? [] };
  } });
  async function run(action: () => PromiseLike<{ error: unknown }>, success: string) {
    setBusy(true);
    try { const { error } = await action(); if (error) throw error; toast.success(success); setName(""); await qc.invalidateQueries(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-4xl">
    <PageHeader title="Locations & local admins" subtitle={`${locations.data?.length ?? 0} collection locations`} />
    <form className="mb-8 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); run(() => supabase.rpc("superadmin_create_location", { _name: name }), "Location created"); }}>
      <Input aria-label="New location name" placeholder="Location name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="min-w-0 flex-1" />
      <Button disabled={busy || name.trim().length < 2}><Plus className="mr-2 h-4 w-4" />Add location</Button>
    </form>
    {(locations.error || people.error) && <p className="mb-4 text-destructive">{errMsg(locations.error || people.error)}</p>}
    {locations.data?.length === 0 && <Empty title="No locations yet" />}
    <div className="grid gap-4 sm:grid-cols-2">
      {locations.data?.map((location) => {
        const assigned = people.data?.memberships.filter((m) => m.location_id === location.id) ?? [];
        const candidates = people.data?.users.filter((u) => u.account_status === "active" && !assigned.some((m) => m.user_id === u.id)) ?? [];
        return <section key={location.id} className="min-w-0 rounded-lg border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 shrink-0 text-primary" />{location.name}</h2>
          <div className="my-4 space-y-2">
            {assigned.length === 0 && <p className="text-sm text-muted-foreground">No local admins</p>}
            {assigned.map((m) => <div key={m.user_id} className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1 break-words">{people.data?.users.find((u) => u.id === m.user_id)?.display_name ?? "Local admin"}</span><Button size="icon" variant="ghost" title="Remove local admin" aria-label="Remove local admin" disabled={busy} onClick={() => run(() => supabase.rpc("superadmin_set_local_admin", { _user: m.user_id, _location: location.id, _grant: false }), "Local admin removed")}><X className="h-4 w-4" /></Button></div>)}
          </div>
          <div className="space-y-2">
            <Select value={selected[location.id] ?? ""} onValueChange={(v) => setSelected({ ...selected, [location.id]: v })}><SelectTrigger aria-label={`Admin for ${location.name}`}><SelectValue placeholder="Choose an existing account" /></SelectTrigger><SelectContent>{candidates.map((u) => <SelectItem key={u.id} value={u.id}>{u.display_name}{u.phone ? ` · ${u.phone}` : ""}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" className="w-full" disabled={busy || !selected[location.id]} onClick={() => { const user = selected[location.id]; if (user) run(() => supabase.rpc("superadmin_set_local_admin", { _user: user, _location: location.id, _grant: true }), "Local admin appointed"); }}><ShieldCheck className="mr-2 h-4 w-4" />Appoint local admin</Button>
          </div>
        </section>;
      })}
    </div>
  </div>;
}