// Typed contract for the FastAPI backend. Keep in sync with the Python pydantic models.

export const OUTPUT_TYPES = [
  "linkedin",
  "twitter",
  "advisory",
  "executive_summary",
  "infographic",
  "presentation",
  "video_package",
] as const;
export type OutputType = (typeof OUTPUT_TYPES)[number];

export const AUDIENCES = [
  "General Public",
  "Executives",
  "Technical Audience",
  "Government Officials",
  "Researchers",
  "Students",
  "Custom",
] as const;
export const TONES = ["Professional", "Formal", "Technical", "Conversational", "Persuasive", "Informative"] as const;
export const LANGUAGES = ["English"] as const;
export const DETAIL_LEVELS = ["Concise", "Balanced", "Detailed"] as const;
export const OBJECTIVES = ["Inform", "Educate", "Warn", "Summarize", "Promote", "Brief Decision Makers"] as const;

export interface GenerationSettings {
  audience: (typeof AUDIENCES)[number];
  custom_audience?: string | undefined;
  tone: (typeof TONES)[number];
  language: (typeof LANGUAGES)[number];
  detail: (typeof DETAIL_LEVELS)[number];
  objective: (typeof OBJECTIVES)[number];
}

/** POST /api/upload response */
export interface UploadedFile {
  file_id: string;
  filename: string;
  mime_type: string;
  char_count: number;
  extracted_preview: string;
}

/** Canonical representation — built once per source (UNDERSTAND ONCE). */
export interface CanonicalContent {
  title: string;
  summary: string;
  key_points: string[];
  facts: SourceFact[];
  statistics: SourceFact[];
  dates: SourceFact[];
  entities: { name: string; type: string }[];
  risks: string[];
  recommendations: string[];
  source_sections: { id: string; heading: string; text: string }[];
}

export interface SourceFact {
  text: string;
  source_ref?: string | undefined; // id of a source_section
}

/** POST /api/transform */
export interface TransformRequest {
  text?: string | undefined;
  file_ids?: string[] | undefined;
  context?: string | undefined;
}
export interface TransformResponse {
  transformation_id: string;
  canonical: CanonicalContent;
}

export type GroundingStatus = "verified" | "requires_verification" | "not_in_source";
export interface GroundingCheck {
  claim: string;
  status: GroundingStatus;
  source_ref?: string | undefined;
}
export interface GeneratedStatement {
  text: string;
  kind: "interpretation" | "recommendation";
}

export interface Deliverable {
  output_type: OutputType;
  title: string;
  content: string; // markdown
  grounding: GroundingCheck[];
  generated_statements: GeneratedStatement[];
}

/** POST /api/generate */
export interface GenerateRequest {
  transformation_id: string;
  output_types: OutputType[];
  settings: GenerationSettings;
}
export interface GenerateResponse {
  transformation_id: string;
  deliverables: Deliverable[];
}

/** GET /api/history */
export interface HistoryItem {
  transformation_id: string;
  title: string;
  created_at: string;
  output_types: OutputType[];
}

/** GET /api/transformation/{id} */
export interface TransformationDetail {
  transformation_id: string;
  created_at: string;
  canonical: CanonicalContent;
  settings?: GenerationSettings | undefined;
  deliverables: Deliverable[];
}
