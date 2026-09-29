import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AUDIENCES, DETAIL_LEVELS, LANGUAGES, OBJECTIVES, TONES, type GenerationSettings } from "@/lib/api/types";

function Field<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="space-y-1.5">
      <span className="label-mono text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="w-full bg-card"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

export function SettingsPanel({ value, onChange }: { value: GenerationSettings; onChange: (v: GenerationSettings) => void }) {
  const set = <K extends keyof GenerationSettings>(k: K, v: GenerationSettings[K]) => onChange({ ...value, [k]: v });
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="label-mono mr-2 text-accent">03</span>Settings</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Audience" value={value.audience} options={AUDIENCES} onChange={(v) => set("audience", v)} />
        <Field label="Tone" value={value.tone} options={TONES} onChange={(v) => set("tone", v)} />
        <Field label="Detail" value={value.detail} options={DETAIL_LEVELS} onChange={(v) => set("detail", v)} />
        <Field label="Objective" value={value.objective} options={OBJECTIVES} onChange={(v) => set("objective", v)} />
        <Field label="Language" value={value.language} options={LANGUAGES} onChange={(v) => set("language", v)} />
        {value.audience === "Custom" && (
          <label className="space-y-1.5">
            <span className="label-mono text-muted-foreground">Custom audience</span>
            <Input className="bg-card" value={value.custom_audience ?? ""} onChange={(e) => set("custom_audience", e.target.value)} placeholder="e.g. Hospital IT leads" />
          </label>
        )}
      </div>
    </section>
  );
}
