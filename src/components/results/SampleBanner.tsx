import { FlaskConical } from "lucide-react";

export function SampleBanner() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-sample-foreground/30 bg-sample p-3 text-sm text-sample-foreground">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>Static sample preview — not AI generated.</strong> These are hand-written examples for the demo advisory,
        shown because the FastAPI backend is not connected. Connect the backend to generate real deliverables.
      </p>
    </div>
  );
}
