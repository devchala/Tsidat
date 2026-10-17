import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, MapPin, Truck, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tsidat ጽዳት — Report waste, track collection" },
      { name: "description", content: "Cleaner communities, transparent collection. Report waste with a photo and location and follow every step to resolution." },
      { property: "og:title", content: "Tsidat ጽዳት — Cleaner Communities" },
      { property: "og:description", content: "Report waste, dispatch verified workers, and track collection transparently." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Camera, t: "Snap a photo", d: "Show the problem. Evidence speeds up action." },
  { icon: MapPin, t: "Pin the spot", d: "Use GPS or tap the map — no address needed." },
  { icon: Truck, t: "A verified worker collects", d: "Admins dispatch approved crews by priority." },
  { icon: ShieldCheck, t: "Verified & closed", d: "Completion photo is checked before closing." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-xl font-bold">
          <img src="/logo.png" alt="" className="h-9 w-auto" />
          Tsidat <span className="text-primary">ጽዳት</span>
        </span>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:pt-12">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">Civic waste management platform</p>
          <h1 className="text-5xl font-extrabold leading-[1.02] md:text-6xl">Cleaner communities. <span className="text-primary">Transparent</span> collection.</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">See waste? Report it in under a minute and follow every step until it's cleared — with photo proof.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Report waste <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/auth" search={{ mode: "worker" }}>Apply as a worker</Link></Button>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Sanitation worker collecting waste on a neighborhood street" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
          <div className="absolute -bottom-5 left-5 rounded-2xl border bg-card p-4 shadow-soft">
            <p className="text-xs text-muted-foreground">Report TSD-000142</p>
            <p className="font-semibold text-success">Completed · verified</p>
          </div>
        </div>
      </section>

      <section className="bg-hero py-16 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.t} className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur">
                <s.icon className="h-6 w-6 text-accent" />
                <p className="mt-3 text-sm opacity-70">Step {i + 1}</p>
                <p className="font-display text-lg font-bold">{s.t}</p>
                <p className="mt-1 text-sm opacity-85">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-3">
        {[
          { i: Camera, t: "For residents", d: "Report, track status in real time, and rate the result." },
          { i: Truck, t: "For workers", d: "Verified crews get clear tasks, maps and a simple proof flow." },
          { i: BarChart3, t: "For municipalities", d: "Command center, hotspots, response times and audit trail." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border bg-card p-6 shadow-soft">
            <c.i className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-xl font-bold">{c.t}</h3>
            <p className="mt-1 text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">Tsidat ጽዳት · Complexity for the system, simplicity for the citizen.</footer>
    </div>
  );
}
