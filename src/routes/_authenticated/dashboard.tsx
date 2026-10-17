import { createFileRoute, redirect } from "@tanstack/react-router";
import { meQuery, homeFor } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery);
    throw redirect({ to: me ? homeFor(me.roles) : "/auth", replace: true });
  },
});
