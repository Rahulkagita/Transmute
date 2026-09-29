import { FileText, Linkedin, MessageSquare, Presentation, ShieldAlert, Clapperboard, LayoutGrid } from "lucide-react";
import type { OutputType } from "./api/types";

export interface OutputMeta {
  type: OutputType;
  label: string;
  short: string;
  icon: typeof FileText;
  structure: string[];
  note?: string;
}

export const OUTPUT_META: Record<OutputType, OutputMeta> = {
  linkedin: {
    type: "linkedin",
    label: "LinkedIn Post",
    short: "Professional, publication-ready post",
    icon: Linkedin,
    structure: ["Hook line", "Context", "Key points", "Call to action", "Hashtags"],
  },
  twitter: {
    type: "twitter",
    label: "X / Twitter",
    short: "Single post or thread by source length",
    icon: MessageSquare,
    structure: ["Lead post", "Numbered thread posts (if needed)", "Closing post"],
  },
  advisory: {
    type: "advisory",
    label: "Advisory",
    short: "Structured professional advisory",
    icon: ShieldAlert,
    structure: ["Title & severity", "Summary", "Affected", "Details", "Recommended actions", "References from source"],
  },
  executive_summary: {
    type: "executive_summary",
    label: "Executive Summary",
    short: "Concise decision-maker briefing",
    icon: FileText,
    structure: ["Bottom line", "Key facts", "Risks", "Decisions required"],
  },
  infographic: {
    type: "infographic",
    label: "Infographic",
    short: "Content + layout recommendations",
    icon: LayoutGrid,
    structure: ["Headline", "Data panels", "Layout plan", "Visual recommendations"],
    note: "Produces infographic content and layout guidance — not a rendered image.",
  },
  presentation: {
    type: "presentation",
    label: "Presentation",
    short: "Slide-by-slide content with speaker notes",
    icon: Presentation,
    structure: ["Title slide", "Content slides", "Speaker notes per slide"],
  },
  video_package: {
    type: "video_package",
    label: "Video Package",
    short: "Script, storyboard, narration, subtitles",
    icon: Clapperboard,
    structure: ["Script", "Storyboard", "Scene descriptions", "Narration", "Subtitles", "Visual recommendations"],
    note: "Produces a production package — not a rendered video.",
  },
};
