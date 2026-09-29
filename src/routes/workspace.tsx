import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SourceInput } from "@/components/workspace/SourceInput";
import { OutputSelector } from "@/components/workspace/OutputSelector";
import { SettingsPanel } from "@/components/workspace/SettingsPanel";
import { PipelineProgress, type Phase } from "@/components/workspace/PipelineProgress";
import { DeliverablesView } from "@/components/results/DeliverablesView";
import { ApiError, api } from "@/lib/api/client";
import type { CanonicalContent, Deliverable, GenerationSettings, OutputType, UploadedFile } from "@/lib/api/types";
import { SAMPLE_ADVISORY, SAMPLE_CANONICAL, SAMPLE_CONTEXT, SAMPLE_DELIVERABLES } from "@/lib/sample";

export const Route = createFileRoute("/workspace")({
  validateSearch: (s: Record<string, unknown>) => ({ sample: s['sample'] === 1 || s['sample'] === "1" ? 1 : undefined }),
  head: () => ({
    meta: [
      { title: "Transformation Workspace — Transmute" },
      { name: "description", content: "Add a source, pick outputs and settings, and generate grounded deliverables." },
      { property: "og:title", content: "Transformation Workspace — Transmute" },
      { property: "og:description", content: "One source in, many grounded deliverables out." },
    ],
  }),
  component: Workspace,
});

interface Result {
  transformation_id?: string;
  canonical: CanonicalContent;
  deliverables: Deliverable[];
  missing: OutputType[];
  isSample: boolean;
}

const DEFAULT_SETTINGS: GenerationSettings = {
  audience: "Executives",
  tone: "Professional",
  language: "English",
  detail: "Balanced",
  objective: "Inform",
};

function Workspace() {
  const { sample } = Route.useSearch();
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [outputs, setOutputs] = useState<OutputType[]>(["linkedin", "executive_summary", "advisory", "presentation"]);
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadSample = () => {
    setText(SAMPLE_ADVISORY);
    setContext(SAMPLE_CONTEXT);
  };
  useEffect(() => {
    if (sample) loadSample();
  }, [sample]);

  const busy = phase === "processing";
  const isSampleSource = text.trim() === SAMPLE_ADVISORY.trim();

  async function generate() {
    setError(null);
    setResult(null);
    try {
      setPhase("processing");
      const r = await api.transform({ text, documentIds: files.map((f) => f.file_id), context, outputs, settings });
      setResult({ ...r, isSample: false });
      setPhase("done");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError("Generation failed.", undefined, "generation_failed"));
      setPhase("idle");
    }
  }

  function showSample() {
    const deliverables = outputs.flatMap((o) => (SAMPLE_DELIVERABLES[o] ? [SAMPLE_DELIVERABLES[o]!] : []));
    setResult({
      canonical: SAMPLE_CANONICAL,
      deliverables,
      missing: outputs.filter((o) => !SAMPLE_DELIVERABLES[o]),
      isSample: true,
    });
    setError(null);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function regenerate(type: OutputType) {
    if (!result?.transformation_id) return;
    try {
      const g = await api.generate(result.transformation_id, [type], settings);
      const fresh = g.deliverables.find((d) => d.output_type === type);
      if (!fresh) throw new ApiError("Backend did not return the regenerated output.", undefined, "invalid_response");
      setResult({ ...result, deliverables: result.deliverables.map((d) => (d.output_type === type ? fresh : d)) });
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError("Regeneration failed.", undefined, "generation_failed"));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:px-8">
        <header>
          <span className="label-mono text-muted-foreground">New transformation</span>
          <h1 className="text-3xl font-semibold">One source → many deliverables</h1>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SourceInput text={text} onText={setText} context={context} onContext={setContext} files={files} onFiles={setFiles} onLoadSample={loadSample} />
          <div className="space-y-10">
            <OutputSelector selected={outputs} onChange={setOutputs} />
            <SettingsPanel value={settings} onChange={setSettings} />
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={generate} disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              Generate {outputs.length} deliverable{outputs.length === 1 ? "" : "s"}
            </Button>
            <span className="text-xs text-muted-foreground">Source is understood once, then every selected output is generated from that structure.</span>
          </div>
          {phase !== "idle" && <PipelineProgress phase={phase} />}
          {error && (
            <div className="flex flex-wrap items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
              <p className="flex-1 text-destructive">{error.message}</p>
              {(error.kind === "not_configured" || error.kind === "network") && isSampleSource && (
                <Button size="sm" variant="outline" onClick={showSample}>View static sample preview</Button>
              )}
            </div>
          )}
        </div>

        <div ref={resultsRef}>
          {result && (
            <DeliverablesView
              key={result.transformation_id ?? "sample"}
              canonical={result.canonical}
              deliverables={result.deliverables}
              missing={result.missing}
              isSample={result.isSample}
              onRegenerate={regenerate}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
