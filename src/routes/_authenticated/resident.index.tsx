import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { categoryLabel } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, SignedImage, StatusBadge } from "@/components/tsidat/bits";

export const Route = createFileRoute("/_authenticated/resident/")({
  head: () => ({ meta: [{ title: "My reports — Tsidat" }, { name: "description", content: "Track your waste reports." }, { property: "og:title", content: "My reports — Tsidat" }, { property: "og:description", content: "Track your waste reports." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ResidentHome,
});

function ResidentHome() {
  const { data: me } = useMe();
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", "mine", me?.id],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("id,reference,category,status,created_at,image_path,location_description,latitude,longitude").eq("resident_id", me!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const open = data?.filter((r) => !["completed", "rejected"].includes(r.status)).length ?? 0;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={`Hello, ${me?.profile.display_name.split(" ")[0] ?? ""}`} subtitle={data ? `${open} open report${open === 1 ? "" : "s"} · ${data.length} total` : undefined}
        actions={<Button asChild size="lg"><Link to="/resident/new"><Plus className="mr-1 h-4 w-4" />Report waste</Link></Button>} />
      {error && <p className="text-destructive">Could not load your reports.</p>}
      {isLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>}
      {data && data.length === 0 && <Empty title="No reports yet">Spotted waste in your area? <Link to="/resident/new" className="text-primary underline">Report it now</Link>.</Empty>}
      <div className="space-y-3">
        {data?.map((r) => (
          <Link key={r.id} to="/resident/reports/$id" params={{ id: r.id }} className="flex gap-4 rounded-xl border bg-card p-3 shadow-soft transition hover:border-primary">
            <SignedImage bucket="report-images" path={r.image_path} alt="" className="h-20 w-20 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{r.reference}</span><StatusBadge status={r.status} /></div>
              <p className="mt-1 font-semibold">{categoryLabel(r.category)}</p>
              <p className="truncate text-sm text-muted-foreground">{r.location_description || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`} · {formatDistanceToNow(new Date(r.created_at))} ago</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
