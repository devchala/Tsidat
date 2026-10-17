import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Circle, ImageOff } from "lucide-react";
import { STATUS, PRIORITY, signedUrl, type ReportStatus, type PriorityLevel } from "@/lib/tsidat";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as ReportStatus];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", s?.tone)}>{s?.label ?? status}</span>;
}

export function PriorityBadge({ level }: { level: string }) {
  const p = PRIORITY[level as PriorityLevel];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", p?.tone)}>{p?.label ?? level}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-soft", className)}>{children}</div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function SignedImage({ bucket, path, alt, className }: { bucket: "report-images" | "completion-images"; path?: string | null; alt: string; className?: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["signed", bucket, path], queryFn: () => signedUrl(bucket, path), enabled: !!path, staleTime: 50 * 60_000 });
  if (!path) return null;
  if (isLoading) return <div className={cn("animate-pulse bg-muted", className)} />;
  if (!data) return <div className={cn("grid place-items-center bg-muted text-muted-foreground", className)}><ImageOff className="h-6 w-6" /></div>;
  return <img src={data} alt={alt} className={cn("object-cover", className)} />;
}

export type HistoryRow = { id: string; to_status: string; note: string | null; created_at: string; actor_role: string | null };

export function Timeline({ rows, current }: { rows: HistoryRow[]; current?: string }) {
  const s = current ? STATUS[current as ReportStatus] : null;
  return (
    <ol className="relative space-y-5 border-l-2 border-border pl-6">
      {rows.map((h, i) => (
        <li key={h.id} className="relative">
          <span className="absolute -left-[33px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-card">
            <CheckCircle2 className={cn("h-5 w-5", i === rows.length - 1 ? "text-primary" : "text-success")} />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={h.to_status} />
            <span className="text-xs text-muted-foreground">{format(new Date(h.created_at), "PP p")}</span>
            {h.actor_role && <span className="text-xs text-muted-foreground">· {h.actor_role}</span>}
          </div>
          {h.note && <p className="mt-1 text-sm">{h.note}</p>}
        </li>
      ))}
      {s && current !== "completed" && current !== "rejected" && (
        <li className="relative">
          <span className="absolute -left-[33px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-card"><Circle className="h-5 w-5 text-muted-foreground" /></span>
          <p className="text-sm font-medium text-muted-foreground">Next: {s.next}</p>
        </li>
      )}
    </ol>
  );
}

export function Kpi({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-3xl font-bold", tone)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
