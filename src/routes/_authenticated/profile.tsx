import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { errMsg } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/tsidat/bits";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Tsidat" }, { name: "description", content: "Manage your profile." }, { property: "og:title", content: "Profile — Tsidat" }, { property: "og:description", content: "Manage your profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Profile,
});

const schema = z.object({ display_name: z.string().trim().min(2).max(80), phone: z.string().trim().max(30), area: z.string().trim().max(100) });

function Profile() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [f, setF] = useState({ display_name: "", phone: "", area: "" });
  useEffect(() => { if (me) setF({ display_name: me.profile.display_name, phone: me.profile.phone ?? "", area: me.profile.area ?? "" }); }, [me]);
  if (!me) return null;
  async function save() {
    const v = schema.safeParse(f);
    if (!v.success) return toast.error(v.error.issues[0].message);
    const { error } = await supabase.from("profiles").update({ display_name: v.data.display_name, phone: v.data.phone || null, area: v.data.area || null }).eq("id", me!.id);
    if (error) return toast.error(errMsg(error));
    toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["me"] });
  }
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Profile" subtitle={`${me.email} · ${me.roles.join(", ")}`} />
      <Panel className="space-y-4">
        <div className="space-y-1.5"><Label>Name</Label><Input value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} maxLength={80} /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={30} /></div>
        <div className="space-y-1.5"><Label>Area / sub-city</Label><Input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} maxLength={100} /></div>
        <Button onClick={save}>Save</Button>
      </Panel>
    </div>
  );
}
