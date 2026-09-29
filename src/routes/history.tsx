import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { OUTPUT_META } from "@/lib/outputs";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Transmute" },
      { name: "description", content: "Past transformations and their generated deliverables." },
      { property: "og:title", content: "History — Transmute" },
      { property: "og:description", content: "Past transformations and their generated deliverables." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const q = useQuery({ queryKey: ["history"], queryFn: api.history, retry: false });
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
        <h1 className="text-3xl font-semibold">History</h1>
        {q.isLoading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
        {q.error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{q.error.message}</p>}
        {q.data && q.data.length === 0 && <p className="text-sm text-muted-foreground">No transformations yet.</p>}
        <ul className="divide-y rounded-md border bg-card">
          {q.data?.map((h) => (
            <li key={h.transformation_id}>
              <Link to="/transformation/$id" params={{ id: h.transformation_id }} className="flex flex-wrap items-center gap-3 p-4 hover:bg-muted">
                <span className="flex-1 font-medium">{h.title}</span>
                <span className="text-xs text-muted-foreground">{h.output_types.map((t) => OUTPUT_META[t]?.label ?? t).join(" · ")}</span>
                <span className="font-mono text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
