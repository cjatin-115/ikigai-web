"use client";

import React from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { User, Menu, X } from "lucide-react";

interface DashboardHeaderProps {
  userEmail: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function DashboardHeader({
  userEmail,
  onToggleSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-zinc-950/80 backdrop-blur border-b border-zinc-900">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
            aria-label="Toggle navigation sidebar"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm tracking-wider font-bold text-white">
            IKIGAI
          </span>
          <span className="hidden sm:inline text-zinc-600 font-mono text-xs">
            // CONTROL PLANE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Workspace Selector */}
        <WorkspaceSelector />

        {/* Operator Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono text-zinc-300">
          <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="max-w-[150px] truncate">{userEmail}</span>
        </div>

        {/* Session Termination Button */}
        <LogoutButton />
      </div>
    </header>
  );
}
