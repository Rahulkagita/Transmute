import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Only states the frontend can actually observe. Server-side sub-steps are listed but not faked as separate progress.
export type Phase = "idle" | "processing" | "done";
const STEPS: { key: Exclude<Phase, "idle">; label: string; desc: string }[] = [
  { key: "processing", label: "Understand once → generate many", desc: "Reading · Understanding · Structuring · Validating · Generating (on server)" },
  { key: "done", label: "Complete", desc: "Deliverables received" },
];

export function PipelineProgress({ phase }: { phase: Phase }) {
  const idx = phase === "done" ? 2 : STEPS.findIndex((s) => s.key === phase);
  return (
    <ol className="flex flex-col gap-2 sm:flex-row">
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "todo";
        return (
          <li key={s.key} className={cn("flex flex-1 items-center gap-3 rounded-md border bg-card p-3", state === "active" && "border-accent")}>
            <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs", state === "done" && "border-success bg-success text-success-foreground")}>
              {state === "done" ? <Check className="h-3 w-3" /> : state === "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
            </span>
            <span>
              <span className="block text-sm font-medium">{s.label}</span>
              <span className="block font-mono text-[11px] text-muted-foreground">{s.desc}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
