import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Bell, LayoutDashboard, FileText, Plus, Users, ShieldCheck, ScrollText, BarChart3, ClipboardList, UserRound, LogOut, Leaf, Loader2, MapPin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Bell; exact?: boolean };

export function AppShell() {
  const { data: me, isLoading } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const unread = useQuery({
    queryKey: ["unread", me?.id],
    enabled: !!me,
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false);
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (!me) return;
    const ch = supabase
      .channel(`notif-${me.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${me.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["unread"] });
        qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => qc.invalidateQueries({ queryKey: ["reports"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, () => qc.invalidateQueries({ queryKey: ["tasks"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me, qc]);

  if (isLoading || !me) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (me.profile.account_status === "suspended") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="text-2xl font-bold">Account suspended</h1>
          <p className="text-muted-foreground">Your account has been suspended by an administrator. Contact your municipality for help.</p>
          <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  const r = me.roles;
  const items: NavItem[] = [];
  const superadmin = r.includes("superadmin");
  if (superadmin || r.includes("admin")) items.push(
    { to: "/admin", label: "Command center", icon: LayoutDashboard, exact: true },
    { to: "/admin/reports", label: "Reports", icon: FileText },
    { to: "/admin/workers", label: "Workers", icon: ShieldCheck },
    { to: "/admin/audit", label: "Audit log", icon: ScrollText },
  );
  if (superadmin) items.push({ to: "/admin/locations", label: "Locations & admins", icon: MapPin }, { to: "/admin/users", label: "Users", icon: Users });
  if (superadmin || r.includes("admin") || r.includes("planner")) items.push({ to: "/planner", label: "Analytics", icon: BarChart3 });
  if (r.includes("worker")) items.push({ to: "/worker", label: "My tasks", icon: ClipboardList });
  if (r.includes("resident")) items.push(
    { to: "/resident", label: "My reports", icon: FileText, exact: true },
    { to: "/resident/new", label: "New report", icon: Plus },
  );
  items.push({ to: "/notifications", label: "Notifications", icon: Bell }, { to: "/profile", label: "Profile", icon: UserRound });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const active = (i: NavItem) => (i.exact ? path === i.to : path === i.to || path.startsWith(i.to + "/"));

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex md:sticky md:top-0 md:h-screen">
        <Link to="/" className="flex items-center gap-2 px-5 py-6">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Leaf className="h-5 w-5" /></span>
          <span className="font-display text-xl font-bold">Tsidat <span className="text-sidebar-primary">ጽዳት</span></span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent", active(i) && "bg-sidebar-accent text-sidebar-accent-foreground")}>
              <i.icon className="h-4 w-4" />
              <span className="flex-1">{i.label}</span>
              {i.to === "/notifications" && !!unread.data && <span className="rounded-full bg-sidebar-primary px-2 text-xs text-sidebar-primary-foreground">{unread.data}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-semibold">{me.profile.display_name}</p>
          <p className="truncate text-xs opacity-70">{me.roles.join(" · ")}</p>
          <p className="mt-1 text-xs opacity-70">{superadmin ? "All locations" : me.locations.map((l) => l.name).join(" · ") || me.profile.area}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm opacity-80 hover:opacity-100"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="font-display text-lg font-bold">Tsidat <span className="text-primary">ጽዳት</span></Link>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="relative p-2"><Bell className="h-5 w-5" />{!!unread.data && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />}</Link>
          <button onClick={signOut} className="p-2" aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
        </div>
        <nav className="flex w-full gap-4 overflow-x-auto pb-1 text-xs">{items.map((i) => <Link key={i.to} to={i.to} className={cn("shrink-0", active(i) ? "font-semibold text-primary" : "text-muted-foreground")}>{i.label}</Link>)}</nav>
      </header>

      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card py-2 md:hidden">
        {items.filter((i) => i.to !== "/notifications").slice(0, 5).map((i) => (
          <Link key={i.to} to={i.to} className={cn("flex flex-col items-center gap-0.5 px-2 text-[11px] text-muted-foreground", active(i) && "text-primary")}>
            <i.icon className="h-5 w-5" />{i.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
