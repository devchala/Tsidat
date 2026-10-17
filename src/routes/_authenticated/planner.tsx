import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, errMsg, STATUS, type ReportStatus } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kpi, PageHeader, Panel } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";
import { AdminOnly } from "@/components/tsidat/AdminOnly";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "Analytics — Tsidat" }, { name: "description", content: "Waste trends, hotspots and performance." }] }),
  component: () => <AdminOnly roles={["admin", "planner"]}><Planner /></AdminOnly>,
});

type Summary = {
  total: number; by_status: Record<string, number>; by_category: Record<string, number>;
  by_day: { day: string; count: number }[]; avg_to_assign_hours: number | null; avg_assign_to_complete_hours: number | null;
  avg_rating: number | null; hotspots: { lat: number; lng: number; c: number }[]; points: { lat: number; lng: number; p: string }[];
  workers: { worker: string; completed: number; avg_hours: number | null }[];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

function Planner() {
  const [from, setFrom] = useState(iso(new Date(Date.now() - 30 * 864e5)));
  const [to, setTo] = useState(iso(new Date()));
  const q = useQuery({
    queryKey: ["analytics", from, to],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_summary", { _from: new Date(from).toISOString(), _to: new Date(to + "T23:59:59").toISOString() });
      if (error) throw new Error(errMsg(error));
      return data as unknown as Summary;
    },
  });
  const s = q.data;
  const completed = s?.by_status.completed ?? 0;

  function exportCsv() {
    if (!s) return;
    const lines = [["metric", "value"], ["total_reports", s.total], ["avg_hours_to_assign", s.avg_to_assign_hours ?? ""], ["avg_hours_assign_to_complete", s.avg_assign_to_complete_hours ?? ""], ["avg_rating", s.avg_rating ?? ""],
      ...Object.entries(s.by_status).map(([k, v]) => [`status_${k}`, v]), ...Object.entries(s.by_category).map(([k, v]) => [`category_${k}`, v])];
    const blob = new Blob([lines.map((l) => l.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tsidat-summary-${from}-${to}.csv`; a.click();
  }

  return (
    <div>
      <PageHeader title="Analytics & planning" subtitle="Aggregated data only — no personal information."
        actions={<div className="flex flex-wrap items-center gap-2"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /><Button variant="outline" onClick={exportCsv} disabled={!s}><Download className="mr-1 h-4 w-4" />CSV</Button></div>} />
      {q.isLoading && <div className="h-64 animate-pulse rounded-xl bg-muted" />}
      {q.error && <p className="text-destructive">{(q.error as Error).message}</p>}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Kpi label="Reports" value={s.total} />
            <Kpi label="Completed" value={completed} tone="text-success" />
            <Kpi label="Avg to assign" value={s.avg_to_assign_hours != null ? `${s.avg_to_assign_hours}h` : "—"} />
            <Kpi label="Avg assign → done" value={s.avg_assign_to_complete_hours != null ? `${s.avg_assign_to_complete_hours}h` : "—"} />
            <Kpi label="Satisfaction" value={s.avg_rating != null ? `${s.avg_rating}/5` : "—"} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel><h2 className="mb-3 font-bold">Reports per day</h2>
              <ResponsiveContainer width="100%" height={240}><LineChart data={s.by_day}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Line dataKey="count" stroke="var(--chart-1)" strokeWidth={2} /></LineChart></ResponsiveContainer></Panel>
            <Panel><h2 className="mb-3 font-bold">By category</h2>
              <ResponsiveContainer width="100%" height={240}><BarChart data={Object.entries(s.by_category).map(([k, v]) => ({ name: categoryLabel(k), v }))}><XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="v" fill="var(--chart-2)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
            <Panel><h2 className="mb-3 font-bold">Status breakdown</h2>
              <div className="space-y-2">{Object.entries(s.by_status).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-sm"><span className="w-40">{STATUS[k as ReportStatus]?.label ?? k}</span><div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(v / Math.max(s.total, 1)) * 100}%` }} /></div><span className="w-8 text-right">{v}</span></div>
              ))}</div></Panel>
            <Panel><h2 className="mb-3 font-bold">Worker performance</h2>
              {s.workers.length === 0 ? <p className="text-sm text-muted-foreground">No assignments in range.</p> : (
                <table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th>Worker</th><th>Completed</th><th>Avg hours</th></tr></thead>
                  <tbody>{s.workers.map((w) => <tr key={w.worker} className="border-t"><td className="py-1">{w.worker}</td><td>{w.completed}</td><td>{w.avg_hours ?? "—"}</td></tr>)}</tbody></table>
              )}</Panel>
          </div>
          <Panel className="mt-6"><h2 className="mb-3 font-bold">Geographic hotspots</h2>
            <PointsMap points={s.points.map((p, i) => ({ id: String(i), lat: p.lat, lng: p.lng, priority: p.p, title: "Report area" }))} />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">{s.hotspots.map((h) => <span key={`${h.lat}${h.lng}`} className="rounded-full bg-secondary px-2 py-1">{h.lat}, {h.lng}: {h.c} reports</span>)}</div>
          </Panel>
        </>
      )}
    </div>
  );
}
