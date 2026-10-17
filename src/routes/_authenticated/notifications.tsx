import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader } from "@/components/tsidat/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Tsidat" }, { name: "description", content: "Your updates." }] }),
  component: Notifications,
});

function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["unread"] }); };
  async function readAll() {
    const ids = q.data?.filter((n) => !n.read).map((n) => n.id) ?? [];
    if (ids.length) await supabase.from("notifications").update({ read: true }).in("id", ids);
    refresh();
  }
  async function open(n: { id: string; link: string | null }) {
    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    refresh();
    if (n.link) navigate({ to: n.link });
  }
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Notifications" actions={<Button variant="outline" size="sm" onClick={readAll}>Mark all read</Button>} />
      {q.data?.length === 0 && <Empty title="You're all caught up" />}
      <div className="space-y-2">
        {q.data?.map((n) => (
          <button key={n.id} onClick={() => open(n)} className={cn("block w-full rounded-xl border bg-card p-4 text-left shadow-soft hover:border-primary", !n.read && "border-l-4 border-l-primary")}>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at))} ago</p>
          </button>
        ))}
      </div>
    </div>
  );
}
