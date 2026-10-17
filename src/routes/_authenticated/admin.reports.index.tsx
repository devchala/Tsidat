import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel, hoursSince, PRIORITY, STATUS } from "@/lib/tsidat";
import { Empty, PageHeader, PriorityBadge, StatusBadge } from "@/components/tsidat/bits";
import { AdminOnly } from "@/components/tsidat/AdminOnly";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/reports/")({
  head: () => ({ meta: [{ title: "Reports — Tsidat admin" }, { name: "description", content: "Review and manage citizen reports." }] }),
  component: () => <AdminOnly><Reports /></AdminOnly>,
});

const PAGE = 20;

function Reports() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("review");
  const [prio, setPrio] = useState("all");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("priority");
  const [page, setPage] = useState(0);

  const q = useQuery({
    queryKey: ["reports", "admin-list", search, status, prio, cat, sort, page],
    queryFn: async () => {
      let qb = supabase.from("reports").select("id,reference,category,status,priority_level,priority_score,created_at,location_description,incident_id", { count: "exact" });
      if (status === "review") qb = qb.in("status", ["submitted", "under_review", "reopened"]);
      else if (status !== "all") qb = qb.eq("status", status as never);
      if (prio !== "all") qb = qb.eq("priority_level", prio as never);
      if (cat !== "all") qb = qb.eq("category", cat as never);
      if (search.trim()) qb = qb.or(`reference.ilike.%${search.trim().replace(/[%,()]/g, "")}%,description.ilike.%${search.trim().replace(/[%,()]/g, "")}%`);
      qb = sort === "priority" ? qb.order("priority_score", { ascending: false }).order("created_at") : qb.order("created_at", { ascending: sort === "oldest" });
      const { data, count, error } = await qb.range(page * PAGE, page * PAGE + PAGE - 1);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  return (
    <div>
      <PageHeader title="Reports" subtitle={q.data ? `${q.data.count} matching` : undefined} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search reference or description" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-64" />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="review">Needs review</SelectItem><SelectItem value="all">All statuses</SelectItem>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
        <Select value={prio} onValueChange={(v) => { setPrio(v); setPage(0); }}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{Object.entries(PRIORITY).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
        <Select value={cat} onValueChange={(v) => { setCat(v); setPage(0); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="priority">Priority</SelectItem><SelectItem value="newest">Newest</SelectItem><SelectItem value="oldest">Oldest</SelectItem></SelectContent></Select>
      </div>
      {q.isLoading && <div className="h-64 animate-pulse rounded-xl bg-muted" />}
      {q.data?.rows.length === 0 && <Empty title="No reports match these filters" />}
      {!!q.data?.rows.length && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Reference</th><th className="p-3">Category</th><th className="p-3">Priority</th><th className="p-3">Status</th><th className="p-3">Location</th><th className="p-3">Age</th></tr></thead>
            <tbody>
              {q.data.rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/50">
                  <td className="p-3"><Link to="/admin/reports/$id" params={{ id: r.id }} className="font-mono font-semibold text-primary hover:underline">{r.reference}</Link></td>
                  <td className="p-3">{categoryLabel(r.category)}</td>
                  <td className="p-3"><PriorityBadge level={r.priority_level} /> <span className="text-xs text-muted-foreground">{r.priority_score}</span></td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="max-w-48 truncate p-3 text-muted-foreground">{r.location_description || "—"}</td>
                  <td className="p-3 text-muted-foreground">{hoursSince(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {q.data && q.data.count > PAGE && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm">Page {page + 1} / {Math.ceil(q.data.count / PAGE)}</span>
          <Button variant="outline" size="sm" disabled={(page + 1) * PAGE >= q.data.count} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
