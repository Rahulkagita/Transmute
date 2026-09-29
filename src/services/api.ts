// Single service layer for the external FastAPI backend. UI components never call fetch directly.
import type {
  CanonicalContent,
  Deliverable,
  GeneratedStatement,
  GenerationSettings,
  GroundingCheck,
  GroundingStatus,
  HistoryItem,
  OutputType,
  SourceFact,
  UploadedFile,
} from "@/lib/api/types";
import { OUTPUT_TYPES } from "@/lib/api/types";
import type {
  GenerateRequestWire,
  GenerationResponseWire,
  GroundingCheckWire,
  HistoryItemWire,
  OutputWire,
  TransformRequestWire,
  UploadResponseWire,
  WireOutputKey,
} from "./types";

/** FastAPI base URL from VITE_API_BASE_URL. Empty = backend not configured. */
export const API_BASE_URL = ((import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "").replace(/\/$/, "");
export const isBackendConfigured = () => API_BASE_URL.length > 0;

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];
export const MAX_FILE_MB = 20;
const DEFAULT_TIMEOUT_MS = 30_000;
const GENERATION_TIMEOUT_MS = 180_000;

export type ApiErrorKind = "not_configured" | "network" | "timeout" | "http" | "invalid_response" | "generation_failed" | "validation";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public kind: ApiErrorKind = "http",
  ) {
    super(message);
  }
}

// ---------- transport ----------

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  if (!isBackendConfigured()) {
    throw new ApiError(
      "Backend not connected — VITE_API_BASE_URL is not set, so there is no FastAPI server to send this request to.",
      undefined,
      "not_configured",
    );
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: ctrl.signal, headers: { Accept: "application/json", ...init.headers } });
  } catch (e) {
    if (ctrl.signal.aborted) {
      throw new ApiError(`The backend did not respond within ${Math.round(timeoutMs / 1000)} seconds. Try again.`, undefined, "timeout");
    }
    throw new ApiError(
      `Backend not connected — could not reach ${API_BASE_URL}. Check the FastAPI server is running and allows CORS from this site.`,
      undefined,
      "network",
    );
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      const d = body?.detail;
      detail = typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x?.msg ?? JSON.stringify(x)).join("; ") : "";
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail || `Request failed (${res.status} ${res.statusText}).`, res.status, "http");
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("Backend returned an invalid response.", res.status, "invalid_response");
  }
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ---------- mapping helpers ----------

const toWireKey = (t: OutputType): WireOutputKey => (t === "twitter" ? "x_post" : t);
const fromWireKey = (k: string): OutputType | null => {
  const t = k === "x_post" ? "twitter" : k;
  return (OUTPUT_TYPES as readonly string[]).includes(t) ? (t as OutputType) : null;
};
const snake = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function settingsToWire(s: GenerationSettings) {
  return {
    audience: snake(s.audience),
    custom_audience: s.audience === "Custom" ? s.custom_audience : undefined,
    tone: snake(s.tone),
    language: snake(s.language),
    detail_level: snake(s.detail),
    objective: snake(s.objective),
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : str(isObj(x) ? x["text"] : ""))).filter(Boolean) : []);
const facts = (v: unknown): SourceFact[] =>
  Array.isArray(v)
    ? v.flatMap((x) =>
        typeof x === "string" ? [{ text: x }] : isObj(x) && typeof x["text"] === "string" ? [{ text: x["text"], source_ref: str(x["source_ref"]) || undefined }] : [],
      )
    : [];

function normalizeCanonical(raw: unknown): CanonicalContent {
  const c = isObj(raw) ? raw : {};
  return {
    title: str(c["title"], "Not specified in source."),
    summary: str(c["summary"]),
    key_points: strArr(c["key_points"]),
    facts: facts(c["facts"]),
    statistics: facts(c["statistics"]),
    dates: facts(c["dates"]),
    entities: Array.isArray(c["entities"])
      ? c["entities"].flatMap((e) => (isObj(e) && typeof e["name"] === "string" ? [{ name: e["name"], type: str(e["type"], "entity") }] : []))
      : [],
    risks: strArr(c["risks"]),
    recommendations: strArr(c["recommendations"]),
    source_sections: Array.isArray(c["source_sections"])
      ? c["source_sections"].flatMap((s) => (isObj(s) ? [{ id: str(s["id"]), heading: str(s["heading"]), text: str(s["text"]) }] : []))
      : [],
  };
}

const STATUSES: GroundingStatus[] = ["verified", "requires_verification", "not_in_source"];
const checks = (v: unknown): GroundingCheck[] =>
  Array.isArray(v)
    ? v.flatMap((g: GroundingCheckWire) =>
        isObj(g) && typeof g.claim === "string"
          ? [{ claim: g.claim, status: (STATUSES as string[]).includes(g.status) ? (g.status as GroundingStatus) : "requires_verification", source_ref: g.source_ref }]
          : [],
      )
    : [];

function groundingFor(grounding: GenerationResponseWire["grounding"], key: string): GroundingCheck[] {
  if (Array.isArray(grounding)) return checks(grounding);
  if (!isObj(grounding)) return [];
  if (key in grounding) return checks(grounding[key]);
  if (key === "twitter" && "x_post" in grounding) return checks(grounding["x_post"]);
  return [];
}

function normalizeDeliverables(res: GenerationResponseWire, requested?: OutputType[]): Deliverable[] {
  if (res.outputs !== undefined && !isObj(res.outputs)) {
    throw new ApiError("Backend response has an invalid outputs field.", undefined, "invalid_response");
  }
  const out: Deliverable[] = [];
  for (const [key, value] of Object.entries(res.outputs ?? {})) {
    const type = fromWireKey(key);
    if (!type || (requested && !requested.includes(type)) || value == null) continue;
    const o: OutputWire = typeof value === "string" ? { content: value } : value;
    const content = o.content ?? o.markdown ?? o.text ?? "";
    if (!content.trim()) continue;
    const own = checks(o.grounding);
    out.push({
      output_type: type,
      title: o.title ?? "",
      content,
      grounding: own.length ? own : groundingFor(res.grounding, key),
      generated_statements: (o.generated_statements ?? []).map<GeneratedStatement>((g) => ({
        text: g.text,
        kind: g.kind === "recommendation" ? "recommendation" : "interpretation",
      })),
    });
  }
  return out;
}

function assertCompleted(res: GenerationResponseWire) {
  if (!isObj(res) || typeof res.transformation_id !== "string") {
    throw new ApiError("Backend response is missing a transformation_id.", undefined, "invalid_response");
  }
  if (res.status && res.status !== "completed") {
    throw new ApiError(res.detail || `Generation did not complete (status: ${res.status}).`, undefined, "generation_failed");
  }
}

export interface GenerationResult {
  transformation_id: string;
  created_at?: string | undefined;
  canonical: CanonicalContent;
  deliverables: Deliverable[];
  missing: OutputType[];
}

function toResult(res: GenerationResponseWire, requested?: OutputType[]): GenerationResult {
  assertCompleted(res);
  const deliverables = normalizeDeliverables(res, requested);
  const got = new Set(deliverables.map((d) => d.output_type));
  return {
    transformation_id: res.transformation_id,
    created_at: res.created_at,
    canonical: normalizeCanonical(res.canonical_content),
    deliverables,
    missing: (requested ?? []).filter((t) => !got.has(t)),
  };
}

// ---------- public API ----------

export interface TransformInput {
  text?: string | undefined;
  documentIds: string[];
  context?: string | undefined;
  outputs: OutputType[];
  settings: GenerationSettings;
}

export const api = {
  async upload(file: File): Promise<UploadedFile> {
    const fd = new FormData();
    fd.append("file", file);
    const r = await request<UploadResponseWire>("/api/upload", { method: "POST", body: fd }, GENERATION_TIMEOUT_MS);
    if (!isObj(r) || typeof r.document_id !== "string") {
      throw new ApiError("Upload response is missing a document_id.", undefined, "invalid_response");
    }
    if (r.status && r.status !== "processed") {
      throw new ApiError(r.detail || `The file could not be processed (status: ${r.status}).`, undefined, "http");
    }
    const text = str(r.extracted_text);
    return {
      file_id: r.document_id,
      filename: str(r.filename, file.name),
      mime_type: str(r.file_type),
      char_count: text.length,
      extracted_preview: text.slice(0, 500),
    };
  },

  async transform(input: TransformInput): Promise<GenerationResult> {
    if (!input.text?.trim() && input.documentIds.length === 0) {
      throw new ApiError("Add source text or upload a file first.", undefined, "validation");
    }
    if (input.outputs.length === 0) throw new ApiError("Select at least one output type.", undefined, "validation");
    const body: TransformRequestWire = {
      source_id: input.documentIds[0],
      source_ids: input.documentIds.length ? input.documentIds : undefined,
      source_text: input.text?.trim() || undefined,
      context: input.context?.trim() || undefined,
      outputs: input.outputs.map(toWireKey),
      ...settingsToWire(input.settings),
    };
    const res = await request<GenerationResponseWire>("/api/transform", post(body), GENERATION_TIMEOUT_MS);
    return toResult(res, input.outputs);
  },

  async generate(transformationId: string, outputs: OutputType[], settings: GenerationSettings): Promise<GenerationResult> {
    const body: GenerateRequestWire = { transformation_id: transformationId, outputs: outputs.map(toWireKey), ...settingsToWire(settings) };
    const res = await request<GenerationResponseWire>("/api/generate", post(body), GENERATION_TIMEOUT_MS);
    return toResult(res, outputs);
  },

  async history(): Promise<HistoryItem[]> {
    const r = await request<HistoryItemWire[]>("/api/history");
    if (!Array.isArray(r)) throw new ApiError("History response is not a list.", undefined, "invalid_response");
    return r
      .filter((h) => isObj(h) && typeof h.transformation_id === "string")
      .map((h) => ({
        transformation_id: h.transformation_id,
        title: str(h.title, "Untitled transformation"),
        created_at: str(h.created_at),
        output_types: (h.outputs ?? []).flatMap((k) => fromWireKey(k) ?? []),
      }));
  },

  async transformation(id: string): Promise<GenerationResult> {
    const res = await request<GenerationResponseWire>(`/api/transformation/${encodeURIComponent(id)}`);
    return toResult(res);
  },
};
