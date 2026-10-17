import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchMe, homeFor } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: async () => {
    const me = await fetchMe();
    throw redirect({ to: me ? homeFor(me.roles) : "/auth", replace: true });
  },
});
