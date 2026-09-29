import { Check } from "lucide-react";
import { OUTPUT_TYPES, type OutputType } from "@/lib/api/types";
import { OUTPUT_META } from "@/lib/outputs";
import { cn } from "@/lib/utils";

export function OutputSelector({ selected, onChange }: { selected: OutputType[]; onChange: (v: OutputType[]) => void }) {
  const toggle = (t: OutputType) => onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold"><span className="label-mono mr-2 text-accent">02</span>Outputs</h2>
        <span className="label-mono text-muted-foreground">{selected.length} selected</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OUTPUT_TYPES.map((t) => {
          const m = OUTPUT_META[t];
          const on = selected.includes(t);
          const Icon = m.icon;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t)}
              className={cn(
                "flex items-start gap-3 rounded-md border bg-card p-3 text-left transition-all hover:border-foreground/40",
                on && "border-foreground bg-primary text-primary-foreground hover:border-foreground",
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", on ? "text-accent" : "text-muted-foreground")} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{m.label}</span>
                <span className={cn("block text-xs", on ? "text-primary-foreground/70" : "text-muted-foreground")}>{m.short}</span>
              </span>
              <span className={cn("grid h-4 w-4 place-items-center rounded-sm border", on && "border-accent bg-accent text-accent-foreground")}>
                {on && <Check className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
