import { CircleCheck, CircleHelp, CircleX, Lightbulb, Sparkles } from "lucide-react";
import type { CanonicalContent, Deliverable, GroundingStatus } from "@/lib/api/types";

const STATUS: Record<GroundingStatus, { label: string; icon: typeof CircleCheck; cls: string }> = {
  verified: { label: "Found in source", icon: CircleCheck, cls: "text-success" },
  requires_verification: { label: "Requires verification", icon: CircleHelp, cls: "text-warning-foreground" },
  not_in_source: { label: "Not specified in source", icon: CircleX, cls: "text-destructive" },
};

export function GroundingPanel({ canonical, deliverable }: { canonical: CanonicalContent; deliverable?: Deliverable | undefined }) {
  const sectionById = new Map(canonical.source_sections.map((s) => [s.id, s]));
  return (
    <aside className="space-y-6">
      <div>
        <h3 className="label-mono mb-2 text-muted-foreground">Source grounding</h3>
        {deliverable && deliverable.grounding.length > 0 ? (
          <ul className="space-y-2">
            {deliverable.grounding.map((c, i) => {
              const s = STATUS[c.status];
              const sec = c.source_ref ? sectionById.get(c.source_ref) : undefined;
              return (
                <li key={i} className="rounded-sm border bg-card p-2.5 text-sm">
                  <div className="flex items-start gap-2">
                    <s.icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.cls}`} />
                    <div className="min-w-0">
                      <p className="font-medium">{c.claim}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.label}{sec ? ` · ${sec.heading}` : ""}
                      </p>
                      {sec && <p className="mt-1 border-l-2 border-accent pl-2 font-mono text-xs text-muted-foreground">{sec.text}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No grounding checks returned for this deliverable.</p>
        )}
      </div>

      {deliverable && deliverable.generated_statements.length > 0 && (
        <div>
          <h3 className="label-mono mb-2 text-muted-foreground">Generated — not in source</h3>
          <ul className="space-y-2">
            {deliverable.generated_statements.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {g.kind === "recommendation" ? <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
                <span><span className="label-mono mr-1 text-muted-foreground">{g.kind}</span>{g.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="label-mono mb-2 text-muted-foreground">Canonical facts (shared by all outputs)</h3>
        <dl className="space-y-3 text-sm">
          {[
            ["Statistics", canonical.statistics.map((f) => f.text)],
            ["Dates", canonical.dates.map((f) => f.text)],
            ["Entities", canonical.entities.map((e) => e.name)],
            ["Risks", canonical.risks],
          ].map(([label, items]) =>
            (items as string[]).length ? (
              <div key={label as string}>
                <dt className="font-medium">{label as string}</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {(items as string[]).map((t) => <span key={t} className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs">{t}</span>)}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>
    </aside>
  );
}
