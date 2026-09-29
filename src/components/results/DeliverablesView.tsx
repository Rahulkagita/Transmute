import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CanonicalContent, Deliverable, OutputType } from "@/lib/api/types";
import { OUTPUT_META } from "@/lib/outputs";
import { DeliverableCard } from "./DeliverableCard";
import { GroundingPanel } from "./GroundingPanel";
import { SampleBanner } from "./SampleBanner";

interface Props {
  canonical: CanonicalContent;
  deliverables: Deliverable[];
  missing?: OutputType[] | undefined;
  isSample?: boolean | undefined;
  onRegenerate?: ((t: OutputType) => Promise<void>) | undefined;
}

export function DeliverablesView({ canonical, deliverables, missing = [], isSample, onRegenerate }: Props) {
  const [active, setActive] = useState<string>(deliverables[0]?.output_type ?? "");
  const current = deliverables.find((d) => d.output_type === active);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="label-mono text-accent">Generated deliverables</span>
          <h2 className="text-2xl font-semibold">{canonical.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{canonical.summary}</p>
        </div>
        <span className="label-mono text-muted-foreground">1 source → {deliverables.length} outputs</span>
      </div>
      {isSample && <SampleBanner />}
      {missing.length > 0 && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {isSample ? "No static sample available for: " : "Backend did not return: "}
          {missing.map((m) => OUTPUT_META[m].label).join(", ")}
        </p>
      )}
      {deliverables.length > 0 && (
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="h-auto flex-wrap bg-secondary">
            {deliverables.map((d) => (
              <TabsTrigger key={d.output_type} value={d.output_type}>{OUTPUT_META[d.output_type].label}</TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              {deliverables.map((d) => (
                <TabsContent key={d.output_type} value={d.output_type} className="mt-0">
                  <DeliverableCard deliverable={d} onRegenerate={onRegenerate && !isSample ? () => onRegenerate(d.output_type) : undefined} />
                </TabsContent>
              ))}
            </div>
            <GroundingPanel canonical={canonical} deliverable={current} />
          </div>
        </Tabs>
      )}
    </section>
  );
}
