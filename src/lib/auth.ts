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
  };
  roles: AppRole[];
};

export async function fetchMe(): Promise<Me | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("display_name,phone,area,account_status,worker_status,available").eq("id", u.user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", u.user.id),
  ]);
  if (!profile) return null;
  return { id: u.user.id, email: u.user.email ?? "", profile, roles: (roles ?? []).map((r) => r.role) };
}

export const meQuery = { queryKey: ["me"], queryFn: fetchMe, staleTime: 30_000 };
export const useMe = () => useQuery(meQuery);

export function homeFor(roles: AppRole[]) {
  if (roles.includes("admin")) return "/admin" as const;
  if (roles.includes("planner")) return "/planner" as const;
  if (roles.includes("worker")) return "/worker" as const;
  return "/resident" as const;
}
