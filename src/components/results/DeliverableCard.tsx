import { useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, Pencil, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Deliverable } from "@/lib/api/types";
import { OUTPUT_META } from "@/lib/outputs";

interface Props {
  deliverable: Deliverable;
  onRegenerate?: (() => Promise<void>) | undefined;
}

export function DeliverableCard({ deliverable, onRegenerate }: Props) {
  const meta = OUTPUT_META[deliverable.output_type];
  const [content, setContent] = useState(deliverable.content);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => setContent(deliverable.content), [deliverable.content]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  function download() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deliverable.output_type}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function regenerate() {
    if (!onRegenerate) return;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <span className="label-mono text-muted-foreground">{meta.label}</span>
        <div className="ml-auto flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? <Eye /> : <Pencil />} {editing ? "View" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={copy}>{copied ? <Check /> : <Copy />} Copy</Button>
          <Button variant="ghost" size="sm" onClick={download}><Download /> .md</Button>
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={regenerating}>
              {regenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} Regenerate
            </Button>
          )}
        </div>
      </div>
      {meta.note && <p className="border-b bg-muted px-4 py-2 text-xs text-muted-foreground">{meta.note}</p>}
      {editing ? (
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-80 rounded-none border-0 font-mono text-[13px] focus-visible:ring-0" />
      ) : (
        <pre className="whitespace-pre-wrap p-5 font-sans text-sm leading-relaxed">{content}</pre>
      )}
    </div>
  );
}
