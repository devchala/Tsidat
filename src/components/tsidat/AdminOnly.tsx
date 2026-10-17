import type { ReactNode } from "react";
import { useMe } from "@/lib/auth";
import type { AppRole } from "@/lib/tsidat";

export function AdminOnly({ children, roles = ["admin", "superadmin"] }: { children: ReactNode; roles?: AppRole[] }) {
  const { data: me } = useMe();
  if (!me) return null;
  if (!me.roles.some((r) => roles.includes(r))) {
    return <div className="rounded-xl border p-10 text-center"><p className="font-semibold">You don't have access to this page.</p></div>;
  }
  return <>{children}</>;
}
