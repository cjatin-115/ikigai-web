"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { ApiClient, Project, ProjectCreateInput } from "@/lib/api-client";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Code2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FolderGit2,
  CheckCircle2,
  Archive,
} from "lucide-react";

export default function ProjectsPage() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const workspaceId = activeWorkspace?.id || "";

  // Workspace-aware TanStack Query key
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const token = await ApiClient.getAccessToken();
      if (!token) throw new Error("No active operator session found.");
      return ApiClient.getProjects(token, workspaceId);
    },
    enabled: Boolean(workspaceId),
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ProjectCreateInput) => {
      const token = await ApiClient.getAccessToken();
      if (!token) throw new Error("No active operator session found.");
      return ApiClient.createProject(token, workspaceId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      setIsCreating(false);
    },
  });

  if (isWorkspaceLoading) {
    return (
      <div className="p-8 border border-zinc-800 bg-zinc-950/40 rounded-lg animate-pulse space-y-4">
        <div className="h-6 w-48 bg-zinc-850 rounded" />
        <div className="h-4 w-72 bg-zinc-900 rounded" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="p-8 border border-amber-900/40 bg-amber-950/10 rounded-lg space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>NO ACTIVE WORKSPACE CONTEXT</span>
        </div>
        <p className="text-zinc-400">
          Select or enroll in an operational workspace from the control plane header to access the Project Registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
            <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
            <span>Workspace Registry // {activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-tight mt-1">
            Projects
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Registered software, research, and experimental initiatives.
          </p>
        </div>

        {!isCreating && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        )}
      </div>

      {/* Inline Create Form Modal/Card */}
      {isCreating && (
        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Register New Project
            </h2>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              Target: {activeWorkspace.slug}
            </span>
          </div>
          <ProjectForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data as ProjectCreateInput);
            }}
            onCancel={() => setIsCreating(false)}
            submitLabel="Register Project"
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-lg border border-zinc-900 bg-zinc-950/40 space-y-3 animate-pulse">
              <div className="h-5 w-36 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-900 rounded" />
              <div className="h-8 w-24 bg-zinc-900/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-6 rounded-lg border border-red-900/50 bg-red-950/20 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>FAILED TO LOAD PROJECTS</span>
          </div>
          <p className="text-zinc-400">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-red-900/60 text-red-300 hover:bg-red-900/30 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">No projects in this workspace</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Register initiatives, prototypes, or research modules under the active workspace.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono"
          >
            Create Your First Project
          </Button>
        </div>
      )}

      {/* Project Grid */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group block p-5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all font-mono"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {project.title}
                </span>
                <span
                  className={`text-[10px] uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                    project.status === "active"
                      ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {project.tagline && (
                <p className="text-xs text-zinc-300 line-clamp-2 mb-3">
                  {project.tagline}
                </p>
              )}

              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/60 text-zinc-400">
                  {project.project_type}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
