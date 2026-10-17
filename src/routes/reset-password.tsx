import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errMsg } from "@/lib/tsidat";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Tsidat" }, { name: "description", content: "Choose a new password for your Tsidat account." }, { property: "og:title", content: "Reset password — Tsidat" }, { property: "og:description", content: "Choose a new password." }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Use at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={save} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
        <Button className="w-full" disabled={busy}>Save password</Button>
      </form>
    </div>
  );
}
