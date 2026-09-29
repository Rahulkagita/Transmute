import { Link } from "@tanstack/react-router";
import { History, LayoutTemplate, Plus, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { BackendStatus } from "./BackendStatus";

const NAV = [
  { to: "/workspace", label: "New Transformation", icon: Plus },
  { to: "/history", label: "History", icon: History },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-6">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
            T
          </span>
          <span className="font-display text-lg font-semibold">Transmute</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <BackendStatus />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 overflow-x-auto border-b px-4 py-3 md:hidden">
          <Link to="/" className="font-display font-semibold">Transmute</Link>
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} className="whitespace-nowrap text-sm text-muted-foreground" activeProps={{ className: "text-foreground font-medium" }}>
              {label}
            </Link>
          ))}
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
