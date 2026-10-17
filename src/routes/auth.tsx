import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errMsg } from "@/lib/tsidat";
import { LocationSelect } from "@/components/tsidat/LocationSelect";
import { useLocations } from "@/lib/locations";

const search = z.object({ mode: z.enum(["signin", "signup", "worker", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Tsidat ጽዳት" },
      { name: "description", content: "Sign in or create a Tsidat account to report and track waste collection." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Sign in — Tsidat" },
      { property: "og:description", content: "Access your Tsidat resident, worker or admin dashboard." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  display_name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  phone: z.string().trim().max(30).optional(),
});
const workerSchema = signupSchema.extend({
  location_id: z.string().uuid("Choose your service location"),
  national_id: z.string().trim().min(4, "Enter your ID number").max(40),
  experience: z.string().trim().max(500).optional(),
});

function AuthPage() {
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const locations = useLocations(mode === "worker");
  const [f, setF] = useState({ display_name: "", email: "", password: "", phone: "", location_id: "", national_id: "", experience: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard", replace: true }); });
  }, [navigate]);

  function goBack() {
    navigate({ to: "/" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("If an account exists, a reset link is on its way.");
      } else {
        const schema = mode === "worker" ? workerSchema : signupSchema;
        const parsed = schema.safeParse(f);
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        const { email, password, ...meta } = parsed.data;
        const { data: su, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { ...meta, account_type: mode === "worker" ? "worker" : "resident" } },
        });
        if (error) throw error;
        if (su.session) navigate({ to: "/dashboard", replace: true });
        else setSent("Account created. You can now sign in.");
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  }


  const titles = { signin: "Welcome back", signup: "Create resident account", worker: "Apply as a collection worker", forgot: "Reset your password" };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-hero p-10 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold"><Leaf className="h-6 w-6 text-accent" /> Tsidat ጽዳት</Link>
        <div>
          <p className="font-display text-4xl font-bold leading-tight">Every report has evidence. Every update explains what's next.</p>
          <p className="mt-4 opacity-80">Residents, verified workers and administrators — one platform.</p>
        </div>
        <p className="text-sm opacity-60">Local admin and planner accounts are granted by the superadmin.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Button type="button" variant="ghost" size="sm" onClick={goBack} className="-ml-2 mb-3 text-muted-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{titles[mode]}</h1>
          {mode === "worker" && <p className="mt-2 text-sm text-muted-foreground">Your application will be reviewed by an administrator before you can receive tasks.</p>}
          {sent ? (
            <div className="mt-6 rounded-xl border bg-secondary p-5 text-secondary-foreground">{sent}</div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {(mode === "signup" || mode === "worker") && (
                <>
                  <Field label="Full name"><Input value={f.display_name} onChange={set("display_name")} required maxLength={80} /></Field>
                  <Field label="Phone (optional)"><Input value={f.phone} onChange={set("phone")} maxLength={30} /></Field>
                </>
              )}
              {mode === "worker" && (
                <>
                  <Field label="Service location"><LocationSelect value={f.location_id} onChange={(location_id) => setF({ ...f, location_id })} />{locations.data?.length === 0 && <p className="text-sm text-muted-foreground">No service locations yet. Contact your municipality.</p>}</Field>
                  <Field label="National ID or employee number"><Input value={f.national_id} onChange={set("national_id")} required maxLength={40} /></Field>
                  <Field label="Experience (optional)"><Textarea value={f.experience} onChange={set("experience")} maxLength={500} /></Field>
                </>
              )}
              <Field label="Email"><Input type="email" value={f.email} onChange={set("email")} required maxLength={255} autoComplete="email" /></Field>
              {mode !== "forgot" && <Field label="Password"><Input type="password" value={f.password} onChange={set("password")} required minLength={mode === "signin" ? 1 : 8} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></Field>}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : mode === "worker" ? "Submit application" : "Create account"}</Button>
            </form>
          )}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {mode !== "signin" && <Link to="/auth" search={{ mode: "signin" }} className="text-primary underline">Sign in</Link>}
            {mode !== "signup" && <Link to="/auth" search={{ mode: "signup" }} className="text-primary underline">Create resident account</Link>}
            {mode !== "worker" && <Link to="/auth" search={{ mode: "worker" }} className="text-primary underline">Apply as worker</Link>}
            {mode === "signin" && <Link to="/auth" search={{ mode: "forgot" }} className="text-muted-foreground underline">Forgot password?</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
