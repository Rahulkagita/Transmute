import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OUTPUT_TYPES } from "@/lib/api/types";
import { OUTPUT_META } from "@/lib/outputs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Transmute — Transform Information Into Communication" },
      { name: "description", content: "One source. Multiple publication-ready, source-grounded deliverables." },
      { property: "og:title", content: "Transmute — Transform Information Into Communication" },
      { property: "og:description", content: "One source. Multiple publication-ready, source-grounded deliverables." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="grid-paper min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold">Transmute</span>
        <Link to="/workspace" search={{ sample: undefined }} className="label-mono text-muted-foreground hover:text-foreground">Open workspace →</Link>
      </header>
      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div>
          <span className="label-mono text-accent">Understand once → generate many</span>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.02] md:text-7xl">Transform Information Into Communication</h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">One source. Multiple publication-ready deliverables.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/workspace" search={{ sample: undefined }}>Start Transforming <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-card">
              <Link to="/workspace" search={{ sample: 1 }}>Try Sample</Link>
            </Button>
          </div>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-40 shrink-0 rounded-md border bg-card p-4 shadow-sm">
            <span className="label-mono text-muted-foreground">Source</span>
            <div className="mt-3 space-y-1.5">
              {[90, 75, 85, 60, 80].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-muted-foreground/25" style={{ width: `${w}%` }} />)}
            </div>
          </div>
          <div className="h-px flex-1 bg-foreground/30" />
          <ul className="space-y-1.5">
            {OUTPUT_TYPES.map((t) => {
              const m = OUTPUT_META[t];
              return (
                <li key={t} className="flex items-center gap-2 rounded-sm border bg-card px-3 py-1.5 text-sm">
                  <m.icon className="h-3.5 w-3.5 text-accent" /> {m.label}
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
