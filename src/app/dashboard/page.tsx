"use client";

import React from "react";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  KeyRound,
} from "lucide-react";

export default function DashboardPage() {
  const { activeWorkspace, workspaces, isLoading, error, refetchWorkspaces } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-8 border border-zinc-800 bg-zinc-950/60 rounded-lg space-y-4 animate-pulse">
        <div className="h-4 w-48 bg-zinc-800 rounded" />
        <div className="h-8 w-72 bg-zinc-850 rounded" />
        <div className="h-20 w-full bg-zinc-900/50 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-red-900/50 bg-red-950/20 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>WORKSPACE TELEMETRY ERROR</span>
        </div>
        <h2 className="text-xl font-bold font-mono text-white">
          Failed to Synchronize Workspaces
        </h2>
        <p className="text-sm text-zinc-400 font-mono">
          {error.message || "An unexpected error occurred while communicating with the control plane."}
        </p>
        <button
          onClick={refetchWorkspaces}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-xs font-mono text-red-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Workspace Discovery</span>
        </button>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-8 border border-amber-900/50 bg-amber-950/10 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>NO WORKSPACE MEMBERSHIP DETECTED</span>
        </div>
        <h2 className="text-xl font-bold font-mono text-white">
          Unassigned Operator Account
        </h2>
        <p className="text-sm text-zinc-400 font-mono">
          Your account is authenticated, but is not currently enrolled in any operational workspace.
          Contact the system administrator or check workspace assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Workspace Banner */}
      <div className="border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8 rounded-lg space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED TENANT CONTEXT ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">Accessible Workspaces:</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              {workspaces.length}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-zinc-400" />
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
              {activeWorkspace?.name}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 uppercase">
              {activeWorkspace?.role}
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Workspace Slug: <span className="text-zinc-200">{activeWorkspace?.slug}</span> // Identifier:{" "}
            <span className="text-zinc-300">{activeWorkspace?.id}</span>
          </p>
        </div>

        {/* Security & Multi-Tenancy Architecture Grid */}
        <div className="pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-zinc-900/30 rounded border border-zinc-800/60 space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <KeyRound className="w-4 h-4 text-zinc-500" />
              <span className="uppercase tracking-wider text-[10px]">Tenancy Boundary</span>
            </div>
            <div className="text-emerald-400 text-xs">
              Explicit Header Scoping Active
            </div>
            <p className="text-[11px] text-zinc-500">
              Private requests transmit X-Workspace-Id with verified member credentials.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 rounded border border-zinc-800/60 space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Layers className="w-4 h-4 text-zinc-500" />
              <span className="uppercase tracking-wider text-[10px]">Access Control</span>
            </div>
            <div className="text-zinc-200 text-xs">
              Role: <span className="text-emerald-400">{activeWorkspace?.role}</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              RBAC permissions validated server-side across all control plane operations.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 rounded border border-zinc-800/60 space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Cpu className="w-4 h-4 text-zinc-500" />
              <span className="uppercase tracking-wider text-[10px]">Backend Authority</span>
            </div>
            <div className="text-zinc-200 text-xs">
              FastAPI + PostgreSQL RLS
            </div>
            <p className="text-[11px] text-zinc-500">
              Zero direct database queries from the web application boundary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
