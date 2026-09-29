import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DeliverablesView } from "@/components/results/DeliverablesView";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/transformation/$id")({
  head: () => ({
    meta: [
      { title: "Transformation — Transmute" },
      { name: "description", content: "Deliverables and source grounding for a saved transformation." },
      { property: "og:title", content: "Transformation — Transmute" },
      { property: "og:description", content: "Deliverables and source grounding for a saved transformation." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["transformation", id], queryFn: () => api.transformation(id), retry: false });
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <Link to="/history" className="label-mono text-muted-foreground hover:text-foreground">← History</Link>
        {q.isLoading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
        {q.error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{q.error.message}</p>}
        {q.data && <DeliverablesView canonical={q.data.canonical} deliverables={q.data.deliverables} />}
      </div>
    </AppShell>
  );
}
