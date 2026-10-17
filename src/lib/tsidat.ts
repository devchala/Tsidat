import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type WasteCategory = Database["public"]["Enums"]["waste_category"];
export type PriorityLevel = Database["public"]["Enums"]["priority_level"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const CATEGORIES: { value: WasteCategory; label: string; hint: string }[] = [
  { value: "overflowing_bin", label: "Overflowing bin", hint: "Public or shared bin is full" },
  { value: "household_waste", label: "Uncollected household waste", hint: "Missed pickup" },
  { value: "illegal_dumping", label: "Illegal dumping", hint: "Waste dumped in open space" },
  { value: "construction_waste", label: "Construction waste", hint: "Rubble, debris" },
  { value: "street_litter", label: "Street litter", hint: "Scattered litter" },
  { value: "drainage_blockage", label: "Drainage blockage", hint: "Waste blocking drains" },
  { value: "hazardous", label: "Hazardous waste", hint: "Chemicals, medical, sharp" },
  { value: "other", label: "Other", hint: "Something else" },
];
export const categoryLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

export const STATUS: Record<ReportStatus, { label: string; tone: string; next: string }> = {
  submitted: { label: "Submitted", tone: "bg-muted text-foreground", next: "An administrator will review your report." },
  under_review: { label: "Under review", tone: "bg-info/15 text-info", next: "We are checking the details and evidence." },
  accepted: { label: "Accepted", tone: "bg-secondary text-secondary-foreground", next: "A verified worker will be assigned." },
  assigned: { label: "Assigned", tone: "bg-info/15 text-info", next: "The worker will head to the location." },
  en_route: { label: "En route", tone: "bg-warning/20 text-accent-foreground", next: "Work starts when the worker arrives." },
  in_progress: { label: "In progress", tone: "bg-warning/25 text-accent-foreground", next: "The worker will upload proof of completion." },
  awaiting_verification: { label: "Awaiting verification", tone: "bg-accent/40 text-accent-foreground", next: "An administrator will verify the result." },
  completed: { label: "Completed", tone: "bg-success/15 text-success", next: "Done. Please rate the service." },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive", next: "See the reason given. You may submit a new report." },
  reopened: { label: "Reopened", tone: "bg-warning/20 text-accent-foreground", next: "A worker will be reassigned." },
};

export const PRIORITY: Record<PriorityLevel, { label: string; tone: string; color: string }> = {
  low: { label: "Low", tone: "bg-muted text-muted-foreground", color: "oklch(0.62 0.12 120)" },
  medium: { label: "Medium", tone: "bg-info/15 text-info", color: "oklch(0.55 0.11 235)" },
  high: { label: "High", tone: "bg-warning/25 text-accent-foreground", color: "oklch(0.72 0.16 65)" },
  critical: { label: "Critical", tone: "bg-destructive/15 text-destructive", color: "oklch(0.56 0.2 28)" },
};

export const DEFAULT_CENTER: [number, number] = [9.0108, 38.7613]; // Addis Ababa

export async function signedUrl(bucket: "report-images" | "completion-images", path?: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImage(f: File): string | null {
  if (!ALLOWED_IMAGE.includes(f.type)) return "Please use a JPG, PNG or WEBP photo.";
  if (f.size > MAX_IMAGE_BYTES) return "Photo must be smaller than 8 MB.";
  return null;
}

export function hoursSince(d: string) {
  const h = (Date.now() - new Date(d).getTime()) / 36e5;
  return h < 1 ? `${Math.round(h * 60)}m` : h < 48 ? `${Math.round(h)}h` : `${Math.round(h / 24)}d`;
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong";
}
