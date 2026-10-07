"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ["api-health"],
    queryFn: () => ApiClient.getHealth(),
  });

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col justify-center space-y-8">
      <div className="space-y-3 border-b border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          MULTI-TENANT CORE // WORKSPACE: PERSONAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Ikigai Platform Foundation
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
          Clean architectural boundary connecting Next.js App Router to FastAPI and Supabase.
          Zero direct database queries from the web client.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="text-xs font-mono text-zinc-500 uppercase">Architecture</div>
          <div className="text-base font-semibold text-zinc-200">Decoupled Web Tier</div>
          <p className="text-xs text-zinc-400">
            Next.js App Router + TanStack Query communicating strictly with the FastAPI boundary.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="text-xs font-mono text-zinc-500 uppercase">Backend Status</div>
          <div className="text-base font-semibold text-zinc-200">
            {isLoading ? (
              <span className="text-zinc-400">Probing /health...</span>
            ) : isError ? (
              <span className="text-zinc-400">Offline (Start FastAPI :8000)</span>
            ) : (
              <span className="text-emerald-400">{health?.status.toUpperCase()}</span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Target: <code className="text-zinc-300">FastAPI /api/v1/health</code>
          </p>
        </div>

        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="text-xs font-mono text-zinc-500 uppercase">Data Tier</div>
          <div className="text-base font-semibold text-zinc-200">Supabase / Postgres</div>
          <p className="text-xs text-zinc-400">
            Isolated behind FastAPI repositories with Row Level Security.
          </p>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Button variant="default">Manage Workspaces</Button>
        <Button variant="outline">Telemetry Logs</Button>
      </div>
    </main>
  );
}
