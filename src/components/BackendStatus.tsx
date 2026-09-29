import { API_BASE_URL, isBackendConfigured } from "@/lib/api/client";

export function BackendStatus() {
  const ok = isBackendConfigured();
  return (
    <div className="space-y-1">
      <div className="label-mono text-sidebar-foreground/50">FastAPI backend</div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
        <span className="truncate">{ok ? API_BASE_URL : "Not configured"}</span>
      </div>
    </div>
  );
}
