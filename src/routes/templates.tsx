import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OUTPUT_TYPES } from "@/lib/api/types";
import { OUTPUT_META } from "@/lib/outputs";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Output Templates — Transmute" },
      { name: "description", content: "The structure each output format follows when generated from a source." },
      { property: "og:title", content: "Output Templates — Transmute" },
      { property: "og:description", content: "The structure each output format follows when generated from a source." },
    ],
  }),
  component: Templates,
});

function Templates() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
        <div>
          <h1 className="text-3xl font-semibold">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Each output has its own template controlling structure and format. Facts always come from the shared source structure.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {OUTPUT_TYPES.map((t) => {
            const m = OUTPUT_META[t];
            return (
              <div key={t} className="rounded-md border bg-card p-5">
                <div className="flex items-center gap-2"><m.icon className="h-4 w-4 text-accent" /><h2 className="font-semibold">{m.label}</h2></div>
                <p className="mt-1 text-sm text-muted-foreground">{m.short}</p>
                <ol className="mt-3 space-y-1">
                  {m.structure.map((s, i) => <li key={s} className="font-mono text-xs"><span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span> {s}</li>)}
                </ol>
                {m.note && <p className="mt-3 text-xs text-muted-foreground">{m.note}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
