// Wire-level contract for the FastAPI backend (JSON as sent/received over HTTP).
// The schema can evolve: only this file and the normalizers in ./api.ts need updating.

export type WireOutputKey =
  | "linkedin"
  | "x_post"
  | "advisory"
  | "executive_summary"
  | "infographic"
  | "presentation"
  | "video_package";

/** POST /api/upload (multipart/form-data, field "file") */
export interface UploadResponseWire {
  document_id: string;
  filename: string;
  file_type: string;
  extracted_text: string;
  status: "processed" | "failed" | string;
  detail?: string;
}

/** POST /api/transform */
export interface TransformRequestWire {
  source_id?: string | undefined; // first uploaded document
  source_ids?: string[] | undefined; // all uploaded documents
  source_text?: string | undefined;
  context?: string | undefined;
  outputs: WireOutputKey[];
  audience: string; // snake_case, e.g. "government_officials"
  custom_audience?: string | undefined;
  tone: string;
  language: string;
  detail_level: string;
  objective: string;
}

/** POST /api/generate — regenerate outputs for an existing transformation */
export interface GenerateRequestWire extends Omit<TransformRequestWire, "source_id" | "source_ids" | "source_text" | "context"> {
  transformation_id: string;
}

export interface GroundingCheckWire {
  claim: string;
  status: "verified" | "requires_verification" | "not_in_source" | string;
  source_ref?: string;
}

export interface OutputWire {
  title?: string;
  content?: string;
  text?: string;
  markdown?: string;
  grounding?: GroundingCheckWire[];
  generated_statements?: { text: string; kind?: string }[];
}

/** Response of /api/transform, /api/generate and GET /api/transformation/{id} */
export interface GenerationResponseWire {
  transformation_id: string;
  status: "completed" | "failed" | "processing" | string;
  created_at?: string;
  detail?: string;
  source?: Record<string, unknown>;
  canonical_content?: Record<string, unknown>;
  outputs?: Partial<Record<WireOutputKey, OutputWire | string>>;
  grounding?: Record<string, unknown> | GroundingCheckWire[];
}

/** GET /api/history */
export interface HistoryItemWire {
  transformation_id: string;
  title?: string;
  created_at: string;
  outputs?: WireOutputKey[];
}
