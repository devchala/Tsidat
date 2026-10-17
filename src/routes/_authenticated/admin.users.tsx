import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { errMsg, type AppRole } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/tsidat/bits";
import { AdminOnly } from "@/components/tsidat/AdminOnly";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Tsidat admin" }, { name: "description", content: "Manage users and roles." }] }),
  component: () => <AdminOnly roles={["superadmin"]}><Users /></AdminOnly>,
});

function Users() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id,display_name,phone,area,account_status,worker_status,created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      return (profiles ?? []).map((p) => ({ ...p, roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role) }));
    },
  });

  async function role(u: string, r: AppRole, grant: boolean) {
    const { error } = await supabase.rpc("admin_set_role", { _user: u, _role: r, _grant: grant });
    if (error) return toast.error(errMsg(error));
    toast.success("Roles updated"); qc.invalidateQueries({ queryKey: ["users"] });
  }
  async function status(u: string, s: "active" | "suspended") {
    const reason = s === "suspended" ? window.prompt("Reason for suspension?") : "Reactivated";
    if (!reason) return;
    const { error } = await supabase.rpc("admin_set_account_status", { _user: u, _status: s, _reason: reason });
    if (error) return toast.error(errMsg(error));
    toast.success("Account updated"); qc.invalidateQueries({ queryKey: ["users"] });
  }

  const rows = q.data?.filter((u) => u.display_name.toLowerCase().includes(search.toLowerCase())) ?? [];
  return (
    <div>
      <PageHeader title="Users" subtitle="Account access and planner roles" actions={<Input placeholder="Search name" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Roles</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((u) => {
              const self = u.id === me?.id;
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3"><p className="font-semibold">{u.display_name}</p><p className="text-xs text-muted-foreground">{u.phone ?? ""} {u.area ?? ""}</p></td>
                  <td className="p-3">{u.roles.join(", ")}{u.worker_status !== "none" && <span className="text-xs text-muted-foreground"> (worker: {u.worker_status})</span>}</td>
                  <td className="p-3">{u.account_status}</td>
                  <td className="space-x-1 p-3">
                    {!self && (["planner"] as AppRole[]).map((r) => (
                      <Button key={r} size="sm" variant="outline" onClick={() => role(u.id, r, !u.roles.includes(r))}>{u.roles.includes(r) ? `Revoke ${r}` : `Make ${r}`}</Button>
                    ))}
                    {!self && (u.account_status === "active"
                      ? <Button size="sm" variant="ghost" className="text-destructive" onClick={() => status(u.id, "suspended")}>Suspend</Button>
                      : <Button size="sm" variant="ghost" onClick={() => status(u.id, "active")}>Reactivate</Button>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
