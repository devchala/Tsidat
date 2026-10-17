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

export const Route = createFileRoute("/_authenticated/admin/workers")({
  head: () => ({ meta: [{ title: "Workers — Tsidat admin" }, { name: "description", content: "Verify and manage collection workers." }] }),
  component: () => <AdminOnly><Workers /></AdminOnly>,
});

type WS = "pending" | "approved" | "rejected" | "suspended";

function Workers() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<WS>("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const q = useQuery({
    queryKey: ["workers", tab],
    queryFn: async () => {
      const { data, error } = await supabase.from("worker_applications").select("*, profile:profiles!worker_applications_user_id_fkey(display_name,phone,available)").eq("status", tab).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  async function set(user: string, status: WS) {
    const { error } = await supabase.rpc("admin_set_worker_status", { _user: user, _status: status, _reason: reasons[user] || undefined });
    if (error) return toast.error(errMsg(error));
    toast.success(`Worker ${status}`);
    qc.invalidateQueries({ queryKey: ["workers"] });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Workers" subtitle="Only approved, active workers can receive tasks." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as WS)} className="mb-4"><TabsList><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger><TabsTrigger value="suspended">Suspended</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger></TabsList></Tabs>
      {q.data?.length === 0 && <Empty title={`No ${tab} workers`} />}
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
                {tab !== "approved" && <Button onClick={() => set(w.user_id, "approved")}>Approve</Button>}
                <Input placeholder="Reason (for reject/suspend)" value={reasons[w.user_id] ?? ""} onChange={(e) => setReasons({ ...reasons, [w.user_id]: e.target.value })} maxLength={300} />
                <div className="flex gap-2">
                  {tab === "pending" && <Button variant="destructive" className="flex-1" disabled={!reasons[w.user_id]?.trim()} onClick={() => set(w.user_id, "rejected")}>Reject</Button>}
                  {tab === "approved" && <Button variant="destructive" className="flex-1" disabled={!reasons[w.user_id]?.trim()} onClick={() => set(w.user_id, "suspended")}>Suspend</Button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
