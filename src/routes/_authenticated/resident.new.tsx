import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Camera, CheckCircle2, Crosshair, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { CATEGORIES, categoryLabel, errMsg, STATUS, validateImage, type WasteCategory } from "@/lib/tsidat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, StatusBadge } from "@/components/tsidat/bits";
import { PickerMap } from "@/components/tsidat/Maps";
import { cn } from "@/lib/utils";
import { LocationSelect } from "@/components/tsidat/LocationSelect";

export const Route = createFileRoute("/_authenticated/resident/new")({
  head: () => ({ meta: [{ title: "Report waste — Tsidat" }, { name: "description", content: "Submit a new waste report." }, { property: "og:title", content: "Report waste — Tsidat" }, { property: "og:description", content: "Submit a new waste report." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: NewReport,
});

const schema = z.object({
  category: z.string().min(1, "Choose a category"),
  description: z.string().trim().min(10, "Describe the problem in at least 10 characters").max(1000),
  location_description: z.string().trim().max(300).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

type Nearby = { reference: string; category: string; status: string; created_at: string; distance_m: number };

function NewReport() {
  const { data: me } = useMe();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<WasteCategory | "">("");
  const [description, setDescription] = useState("");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locDesc, setLocDesc] = useState("");
  const [location, setLocation] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Nearby[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; reference: string; status: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (me && !me.roles.includes("resident")) return <p>Only resident accounts can submit reports.</p>;

  function pick(f?: File) {
    if (!f) return;
    const err = validateImage(f);
    if (err) return toast.error(err);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function locate() {
    if (!navigator.geolocation) return setGeoMsg("Location isn't available on this device. Tap the map instead.");
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setGeoBusy(false); setGeoMsg(`Located within ~${Math.round(p.coords.accuracy)} m. Adjust the pin if needed.`); },
      () => { setGeoBusy(false); setGeoMsg("Location permission denied. Tap the map to place the pin."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function review() {
    const v = schema.safeParse({ category, description, location_description: locDesc, lat: pos?.[0], lng: pos?.[1] });
    if (!file) return toast.error("Add a photo first");
    if (!v.success) return toast.error(v.error.issues[0].message);
    if (!pos || !location) return toast.error("Choose the report location");
    const { data } = await supabase.rpc("location_nearby_reports", { _lat: pos[0], _lng: pos[1], _location: location });
    setNearby((data as Nearby[]) ?? []);
    setStep(4);
  }

  async function submit() {
    if (!file || !pos || !category || !me || !location) return;
    setBusy(true);
    try {
      const ext = file.type.split("/")[1];
      const path = `${me.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("report-images").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data, error } = await supabase.from("reports").insert({
        resident_id: me.id, category, description: description.trim(), image_path: path,
        latitude: pos[0], longitude: pos[1], location_description: locDesc.trim() || null, location_id: location,
      }).select("id,reference,status").single();
      if (error) throw error;
      setDone(data);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl">
        <Panel className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-3 text-2xl font-bold">Report submitted</h1>
          <p className="mt-1 font-mono text-lg">{done.reference}</p>
          {preview && <img src={preview} alt="Submitted" className="mx-auto mt-4 aspect-video w-full rounded-lg object-cover" />}
          <div className="mt-4 space-y-1 text-left text-sm">
            <p><b>Category:</b> {categoryLabel(category)}</p>
            <p><b>Location:</b> {locDesc || `${pos?.[0].toFixed(5)}, ${pos?.[1].toFixed(5)}`}</p>
            <p><b>Description:</b> {description}</p>
            <p className="flex items-center gap-2"><b>Status:</b> <StatusBadge status={done.status} /></p>
            <p className="text-muted-foreground">Next: {STATUS.submitted.next} You'll get a notification at each step.</p>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild><Link to="/resident/reports/$id" params={{ id: done.id }}>Track this report</Link></Button>
            <Button asChild variant="outline"><Link to="/resident">My reports</Link></Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Report waste" subtitle={`Step ${step} of 4`} />
      <div className="mb-6 flex gap-1">{[1, 2, 3, 4].map((i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />)}</div>

      {step === 1 && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold">Add a photo</h2>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          {preview ? (
            <div className="space-y-3">
              <img src={preview} alt="Preview" className="aspect-video w-full rounded-lg object-cover" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()}><RefreshCw className="mr-1 h-4 w-4" />Replace</Button>
                <Button variant="ghost" onClick={() => { setFile(null); setPreview(null); }}><Trash2 className="mr-1 h-4 w-4" />Remove</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
              <Camera className="h-10 w-10" /><span className="font-semibold">Take or upload a photo</span><span className="text-xs">JPG, PNG or WEBP · max 8 MB</span>
            </button>
          )}
          <Button className="w-full" size="lg" disabled={!file} onClick={() => setStep(2)}>Continue</Button>
        </Panel>
      )}

      {step === 2 && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold">What kind of waste?</h2>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)} className={cn("rounded-xl border p-3 text-left transition", category === c.value ? "border-primary bg-secondary" : "hover:border-primary/50")}>
                <p className="font-semibold">{c.label}</p><p className="text-xs text-muted-foreground">{c.hint}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label>Describe the problem</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} placeholder="e.g. Bin has been overflowing for 3 days, waste spreading onto the road" />
            <p className="text-right text-xs text-muted-foreground">{description.length}/1000</p>
          </div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button className="flex-1" disabled={!category || description.trim().length < 10} onClick={() => setStep(3)}>Continue</Button></div>
        </Panel>
      )}

      {step === 3 && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold">Where is it?</h2>
          <div className="space-y-1.5"><Label>Collection location</Label><LocationSelect value={location} onChange={setLocation} /></div>
          <Button variant="secondary" onClick={locate} disabled={geoBusy}>{geoBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crosshair className="mr-2 h-4 w-4" />}Use my location</Button>
          {geoMsg && <p className="text-sm text-muted-foreground">{geoMsg}</p>}
          <PickerMap value={pos} onChange={(a, b) => setPos([a, b])} />
          <p className="text-xs text-muted-foreground">{pos ? `Pin: ${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}` : "Tap the map to drop a pin."}</p>
          <div className="space-y-1.5"><Label>Landmark or area (optional)</Label><Input value={locDesc} onChange={(e) => setLocDesc(e.target.value)} maxLength={300} placeholder="e.g. Behind Bole Medhanialem church" /></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button className="flex-1" disabled={!pos || !location} onClick={review}>Review</Button></div>
        </Panel>
      )}

      {step === 4 && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold">Confirm & submit</h2>
          {nearby && nearby.length > 0 && (
            <div className="rounded-xl border border-warning bg-warning/10 p-4">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" />Similar reports nearby</p>
              <ul className="mt-2 space-y-1 text-sm">
                {nearby.map((n) => <li key={n.reference}>{categoryLabel(n.category)} · {n.distance_m} m away · {STATUS[n.status as keyof typeof STATUS]?.label}</li>)}
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">If this is the same problem it may already be handled. You can still submit if it's different or still needs attention.</p>
            </div>
          )}
          {preview && <img src={preview} alt="" className="aspect-video w-full rounded-lg object-cover" />}
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <dt className="text-muted-foreground">Category</dt><dd className="col-span-2">{categoryLabel(category)}</dd>
            <dt className="text-muted-foreground">Description</dt><dd className="col-span-2">{description}</dd>
            <dt className="text-muted-foreground">Location</dt><dd className="col-span-2">{locDesc || "—"} ({pos?.[0].toFixed(5)}, {pos?.[1].toFixed(5)})</dd>
          </dl>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(3)}>Back</Button><Button className="flex-1" size="lg" onClick={submit} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit report</Button></div>
        </Panel>
      )}
    </div>
  );
}
