import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, api, isBackendConfigured } from "@/lib/api/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Transmute" },
      { name: "description", content: "Backend connection status and configuration." },
      { property: "og:title", content: "Settings — Transmute" },
      { property: "og:description", content: "Backend connection status and configuration." },
    ],
  }),
  component: SettingsPage,
});

const ENDPOINTS = ["POST /api/upload", "POST /api/transform", "POST /api/generate", "GET /api/history", "GET /api/transformation/{id}"];

function SettingsPage() {
  const [state, setState] = useState<{ status: "idle" | "testing" | "ok" | "fail"; msg?: string }>({ status: "idle" });
  async function test() {
    setState({ status: "testing" });
    try {
      await api.history();
      setState({ status: "ok", msg: "Connected — GET /api/history responded." });
    } catch (e) {
      setState({ status: "fail", msg: e instanceof Error ? e.message : "Connection failed." });
    }
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <div className="space-y-3 rounded-md border bg-card p-5">
          <span className="label-mono text-muted-foreground">FastAPI base URL</span>
          <p className="font-mono text-sm">{isBackendConfigured() ? API_BASE_URL : "Not configured — set VITE_API_BASE_URL"}</p>
          <Button variant="outline" size="sm" onClick={test} disabled={state.status === "testing"}>
            {state.status === "testing" && <Loader2 className="animate-spin" />} Test connection
          </Button>
          {state.msg && <p className={`text-sm ${state.status === "ok" ? "text-success" : "text-destructive"}`}>{state.msg}</p>}
        </div>
        <div className="rounded-md border bg-card p-5">
          <span className="label-mono text-muted-foreground">Expected endpoints</span>
          <ul className="mt-2 space-y-1 font-mono text-sm">{ENDPOINTS.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </div>
    </AppShell>
  );
}
