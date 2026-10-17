import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Empty, PageHeader } from "@/components/tsidat/bits";
import { AdminOnly } from "@/components/tsidat/AdminOnly";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Tsidat admin" }, { name: "description", content: "Who did what, and when." }] }),
  component: () => <AdminOnly><Audit /></AdminOnly>,
});

function Audit() {
  const q = useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const [{ data: logs }, { data: profiles }] = await Promise.all([
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("profiles").select("id,display_name"),
      ]);
      const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
      return (logs ?? []).map((l) => ({ ...l, actor: names.get(l.actor_id ?? "") ?? "system" }));
    },
  });
  return (
    <div>
      <PageHeader title="Audit log" subtitle="Latest 200 privileged actions" />
      {q.data?.length === 0 && <Empty title="No actions recorded yet" />}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">When</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Details</th></tr></thead>
          <tbody>
            {q.data?.map((l) => (
              <tr key={l.id} className="border-t align-top">
                <td className="whitespace-nowrap p-3 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3">{l.actor}</td>
                <td className="p-3 font-mono text-xs">{l.action}</td>
                <td className="p-3 text-xs">{l.entity_type} · {l.entity_id?.slice(0, 8)}</td>
                <td className="max-w-xs truncate p-3 text-xs text-muted-foreground">{Object.entries(l.details as Record<string, unknown>).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
