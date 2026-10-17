import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/tsidat";

export const isSuperadmin = (roles: AppRole[]) => roles.includes("superadmin");
export const isAdministrator = (roles: AppRole[]) => isSuperadmin(roles) || roles.includes("admin");
export function locationAllowed(roles: AppRole[], assigned: string[], location: string | null) {
  return isSuperadmin(roles) || (roles.includes("admin") && location !== null && assigned.includes(location));
}
export const useLocations = (enabled = true) => useQuery({
  queryKey: ["locations"],
  enabled,
  queryFn: async () => {
    const { data, error } = await supabase.from("locations").select("id,name").order("name");
    if (error) throw error;
    return data;
  },
});