"use client";

import React, { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNav } from "./DashboardNav";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";

interface DashboardShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <DashboardHeader
        userEmail={userEmail}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950/40 p-4 space-y-6 shrink-0">
          <DashboardNav />

          <div className="mt-auto pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500 space-y-1">
            <div className="text-zinc-600 uppercase text-[10px] tracking-wider">
              Active Context
            </div>
            <div className="text-zinc-300 font-medium truncate">
              {activeWorkspace?.name || "No Workspace Selected"}
            </div>
            <div className="text-[10px] text-zinc-500 truncate">
              ID: {activeWorkspace?.id || "None"}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-64 h-full bg-zinc-950 border-r border-zinc-800 p-4 space-y-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <DashboardNav />

              <div className="mt-auto pt-4 border-t border-zinc-900 text-[11px] font-mono text-zinc-500 space-y-1">
                <div className="text-zinc-600 uppercase text-[10px] tracking-wider">
                  Active Context
                </div>
                <div className="text-zinc-300 font-medium truncate">
                  {activeWorkspace?.name || "No Workspace Selected"}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">
                  ID: {activeWorkspace?.id || "None"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-950/20">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-zinc-900 px-6 py-3 bg-zinc-950 text-center text-[10px] font-mono text-zinc-600">
        IKIGAI CONTROL PLANE // MULTI-TENANT ARCHITECTURE // PHASE 3C.2
      </footer>
    </div>
  );
}
