import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { categoryLabel, errMsg } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, SignedImage, StatusBadge, Timeline } from "@/components/tsidat/bits";
import { PointsMap } from "@/components/tsidat/Maps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/resident/reports/$id")({
  head: () => ({ meta: [{ title: "Report details — Tsidat" }, { name: "description", content: "Status timeline for your report." }, { property: "og:title", content: "Report details — Tsidat" }, { property: "og:description", content: "Status timeline for your report." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReportDetail,
});

function ReportDetail() {
  const { id } = Route.useParams();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["reports", "detail", id],
    queryFn: async () => {
      const { data: r, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!r) return null;
      const [{ data: hist }, { data: fb }, { data: asg }] = await Promise.all([
        supabase.from("status_history").select("id,to_status,note,created_at,actor_role").eq("report_id", id).order("created_at"),
        supabase.from("feedback").select("*").eq("report_id", id).maybeSingle(),
        r.incident_id ? supabase.from("assignments").select("completion_image_path,completion_notes,verification_status,completed_at").eq("incident_id", r.incident_id).eq("status", "completed").maybeSingle() : Promise.resolve({ data: null }),
      ]);
      return { r, hist: hist ?? [], fb, asg };
    },
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (q.isLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!q.data) return <p>Report not found. <Link to="/resident" className="text-primary underline">Back</Link></p>;
  const { r, hist, fb, asg } = q.data;

  async function sendFeedback() {
    if (!rating) return toast.error("Choose a rating");
    const { error } = await supabase.from("feedback").insert({ report_id: id, resident_id: me!.id, rating, comment: comment.trim() || null });
    if (error) return toast.error(errMsg(error));
    toast.success("Thanks for your feedback");
    qc.invalidateQueries({ queryKey: ["reports", "detail", id] });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={categoryLabel(r.category)} subtitle={r.reference} actions={<StatusBadge status={r.status} />} />
      <div className="grid gap-6 md:grid-cols-5">
        <div className="space-y-4 md:col-span-3">
          <Panel><h2 className="mb-4 text-lg font-bold">Progress</h2><Timeline rows={hist} current={r.status} /></Panel>
          {r.status === "rejected" && r.review_reason && <Panel className="border-destructive"><p className="font-semibold text-destructive">Reason</p><p>{r.review_reason}</p></Panel>}
          {asg?.completion_image_path && (
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Completion evidence</h2>
              <SignedImage bucket="completion-images" path={asg.completion_image_path} alt="After collection" className="aspect-video w-full rounded-lg" />
              {asg.completion_notes && <p className="mt-2 text-sm">{asg.completion_notes}</p>}
            </Panel>
          )}
          {r.status === "completed" && (
            <Panel>
              <h2 className="text-lg font-bold">Rate the service</h2>
              {fb ? (
                <p className="mt-2">You rated {fb.rating}/5. {fb.comment}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={cn("h-8 w-8", n <= rating ? "fill-accent text-accent" : "text-muted-foreground")} /></button>)}</div>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Anything to add? (optional)" />
                  <Button onClick={sendFeedback}>Send feedback</Button>
                </div>
              )}
            </Panel>
          )}
        </div>
        <div className="space-y-4 md:col-span-2">
          <SignedImage bucket="report-images" path={r.image_path} alt="Reported waste" className="aspect-square w-full rounded-xl" />
          <Panel className="space-y-2 text-sm">
            <p>{r.description}</p>
            <p className="text-muted-foreground">{r.location_description || `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`}</p>
            <p className="text-muted-foreground">Submitted {new Date(r.created_at).toLocaleString()}</p>
          </Panel>
          <PointsMap height="h-56" points={[{ id: r.id, lat: r.latitude, lng: r.longitude, priority: r.priority_level, title: r.reference }]} />
        </div>
      </div>
    </div>
  );
}
