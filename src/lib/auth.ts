import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./tsidat";

export type Me = {
  id: string;
  email: string;
  profile: {
    display_name: string;
    phone: string | null;
    area: string | null;
    account_status: string;
    worker_status: string;
    available: boolean;
    location_id: string | null;
  };
  roles: AppRole[];
  locations: { id: string; name: string }[];
};

export async function fetchMe(): Promise<Me | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [{ data: profile }, { data: roles }, { data: locations }] = await Promise.all([
    supabase.from("profiles").select("display_name,phone,area,account_status,worker_status,available,location_id").eq("id", u.user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", u.user.id),
    supabase.from("admin_locations").select("location:locations(id,name)").eq("user_id", u.user.id),
  ]);
  if (!profile) return null;
  return { id: u.user.id, email: u.user.email ?? "", profile, roles: (roles ?? []).map((r) => r.role), locations: (locations ?? []).flatMap((r) => r.location ? [r.location] : []) };
}

export const meQuery = { queryKey: ["me"], queryFn: fetchMe, staleTime: 30_000 };
export const useMe = () => useQuery(meQuery);

export function homeFor(roles: AppRole[]) {
  if (roles.includes("superadmin") || roles.includes("admin")) return "/admin" as const;
  if (roles.includes("planner")) return "/planner" as const;
  if (roles.includes("worker")) return "/worker" as const;
  return "/resident" as const;
}
