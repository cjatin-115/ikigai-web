"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { ChevronDown, Check, Building2, Shield, RefreshCw } from "lucide-react";

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, selectWorkspace, isLoading, error, refetchWorkspaces } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-500 animate-pulse">
        <Building2 className="w-3.5 h-3.5" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/40 border border-red-900/50 text-xs font-mono text-red-400">
        <span>Workspace sync failed</span>
        <button
          onClick={refetchWorkspaces}
          title="Retry loading workspaces"
          className="p-1 hover:bg-red-900/40 rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900/40 border border-zinc-800 text-xs font-mono text-amber-500">
        <Shield className="w-3.5 h-3.5" />
        <span>No Workspaces</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-600"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span className="font-semibold text-white max-w-[140px] truncate">
          {activeWorkspace?.name || "Select Workspace"}
        </span>
        {activeWorkspace && (
          <span className="text-[10px] text-zinc-400 uppercase px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
            {activeWorkspace.role}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 mt-1.5 w-64 rounded-md bg-zinc-950 border border-zinc-800 shadow-xl py-1 z-50 focus:outline-none"
        >
          <div className="px-3 py-1.5 border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Available Workspaces ({workspaces.length})
          </div>
          {workspaces.map((ws) => {
            const isSelected = activeWorkspace?.id === ws.id;
            return (
              <button
                key={ws.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  selectWorkspace(ws.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors ${
                  isSelected
                    ? "bg-zinc-900 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{ws.name}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{ws.slug}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase text-zinc-400 bg-zinc-800/80 px-1 py-0.5 rounded border border-zinc-700/40">
                    {ws.role}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
