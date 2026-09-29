import { useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ACCEPTED_EXTENSIONS, ApiError, MAX_FILE_MB, api } from "@/lib/api/client";
import type { UploadedFile } from "@/lib/api/types";

interface Props {
  text: string;
  onText: (v: string) => void;
  context: string;
  onContext: (v: string) => void;
  files: UploadedFile[];
  onFiles: (f: UploadedFile[]) => void;
  onLoadSample: () => void;
}

export function SourceInput({ text, onText, context, onContext, files, onFiles, onLoadSample }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    for (const file of Array.from(list)) {
      const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError(`${file.name}: unsupported file type. Use PDF, DOCX or TXT.`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`${file.name}: larger than ${MAX_FILE_MB} MB.`);
        continue;
      }
      if (file.size === 0) {
        setError(`${file.name}: file is empty.`);
        continue;
      }
      setUploading(file.name);
      try {
        const uploaded = await api.upload(file);
        onFiles([...files, uploaded]);
      } catch (e) {
        setError(`${file.name}: ${e instanceof ApiError ? e.message : "Upload failed."}`);
      } finally {
        setUploading(null);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold"><span className="label-mono mr-2 text-accent">01</span>Source</h2>
        <Button variant="link" size="sm" onClick={onLoadSample} className="h-auto p-0 text-accent-foreground underline">
          Load sample advisory
        </Button>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder="Paste a news article, report, advisory, policy document, research abstract…"
        className="min-h-56 resize-y bg-card font-mono text-[13px] leading-relaxed"
      />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-wrap items-center gap-3 rounded-md border border-dashed bg-card/60 p-3"
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_EXTENSIONS.join(",")} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={!!uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <FileUp />}
          {uploading ? `Uploading ${uploading}…` : "Upload file"}
        </Button>
        <span className="text-xs text-muted-foreground">PDF, DOCX, TXT · up to {MAX_FILE_MB} MB · drag & drop</span>
        {files.map((f) => (
          <span key={f.file_id} className="flex items-center gap-2 rounded-sm bg-secondary px-2 py-1 text-xs">
            {f.filename} · {f.char_count.toLocaleString()} chars
            <button aria-label={`Remove ${f.filename}`} onClick={() => onFiles(files.filter((x) => x.file_id !== f.file_id))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Textarea
        value={context}
        onChange={(e) => onContext(e.target.value)}
        placeholder="Optional context or instructions (e.g. 'Emphasise the patching deadline')"
        className="min-h-16 bg-card text-sm"
      />
    </section>
  );
}
