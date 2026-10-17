export const CATEGORIES = [
  { value: "overflowing_bin", label: "Overflowing bin" },
  { value: "household_waste", label: "Uncollected household waste" },
  { value: "illegal_dumping", label: "Illegal dumping" },
  { value: "construction_waste", label: "Construction waste" },
  { value: "street_litter", label: "Street litter" },
  { value: "drainage_blockage", label: "Drainage blockage" },
  { value: "hazardous", label: "Hazardous waste" },
  { value: "other", label: "Other" },
] as const;

export const STATUS: Record<string, { label: string; color: string; hint: string }> = {
  submitted: {
    label: "Submitted",
    color: "#59665d",
    hint: "An administrator will review your report.",
  },
  under_review: {
    label: "Under review",
    color: "#287b69",
    hint: "We are checking the details and evidence.",
  },
  accepted: { label: "Accepted", color: "#287b69", hint: "A verified worker will be assigned." },
  assigned: { label: "Assigned", color: "#287b69", hint: "A collection worker has been assigned." },
  en_route: {
    label: "Worker en route",
    color: "#b26b16",
    hint: "The worker is heading to the location.",
  },
  in_progress: { label: "In progress", color: "#b26b16", hint: "Collection is underway." },
  awaiting_verification: {
    label: "Awaiting verification",
    color: "#7b5bb5",
    hint: "An administrator is checking the result.",
  },
  completed: { label: "Completed", color: "#24804a", hint: "The collection has been verified." },
  rejected: {
    label: "Not accepted",
    color: "#b5483d",
    hint: "Read the reason and contact your municipality if needed.",
  },
  reopened: { label: "Reopened", color: "#b26b16", hint: "The issue needs another visit." },
};

export function categoryLabel(value: string) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export function statusInfo(value: string) {
  return STATUS[value] ?? { label: value.replaceAll("_", " "), color: "#59665d", hint: "" };
}
