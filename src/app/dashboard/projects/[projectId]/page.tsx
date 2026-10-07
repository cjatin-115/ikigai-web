"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { ApiClient, Project, ProjectUpdateInput } from "@/lib/api-client";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Tag,
  FolderKanban,
  Edit,
  Archive,
  ExternalLink,
  Code2,
  AlertTriangle,
  RefreshCw,
  Building2,
  Clock,
  Layers,
} from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const projectId = (params?.projectId as string) || "";
  const workspaceId = activeWorkspace?.id || "";

  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // TanStack Query for single project
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery<Project, Error>({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId || !projectId) throw new Error("Missing parameters");
      const token = await ApiClient.getAccessToken();
      if (!token) throw new Error("No active operator session found.");
      return ApiClient.getProject(token, workspaceId, projectId);
    },
    enabled: Boolean(workspaceId && projectId),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: ProjectUpdateInput) => {
      const token = await ApiClient.getAccessToken();
      if (!token) throw new Error("No active operator session found.");
      return ApiClient.updateProject(token, workspaceId, projectId, payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", workspaceId, projectId], updated);
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      setIsEditing(false);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const token = await ApiClient.getAccessToken();
      if (!token) throw new Error("No active operator session found.");
      return ApiClient.archiveProject(token, workspaceId, projectId);
    },
    onSuccess: (archived) => {
      queryClient.setQueryData(["project", workspaceId, projectId], archived);
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      setShowArchiveConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 border border-zinc-800 bg-zinc-950/40 rounded-lg animate-pulse space-y-4">
        <div className="h-6 w-48 bg-zinc-800 rounded" />
        <div className="h-4 w-72 bg-zinc-900 rounded" />
        <div className="h-32 w-full bg-zinc-900/60 rounded" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 border border-red-900/50 bg-red-950/20 rounded-lg space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>PROJECT NOT FOUND OR ACCESS DENIED</span>
        </div>
        <p className="text-zinc-400">
          {error?.message || "The requested project is not available in the active workspace."}
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/projects")}
            className="border-zinc-800 text-zinc-300"
          >
            Back to Projects
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-red-900/60 text-red-300"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              {project.status !== "archived" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveConfirm(true)}
                  className="border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-900 font-mono text-xs flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="p-4 rounded-lg border border-amber-900/60 bg-amber-950/30 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Confirm Project Archival</span>
          </div>
          <p className="text-zinc-300">
            Are you sure you want to archive &ldquo;{project.title}&rdquo;? Archival retains historical telemetry but flags the initiative as inactive.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Button
              size="sm"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {archiveMutation.isPending ? "Archiving..." : "Yes, Archive Project"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveConfirm(false)}
              className="border-zinc-800 text-zinc-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form or Detail Display */}
      {isEditing ? (
        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 font-mono">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-emerald-400" />
              Edit Project: {project.title}
            </h2>
          </div>
          <ProjectForm
            initialData={project}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync(data as ProjectUpdateInput);
            }}
            onCancel={() => setIsEditing(false)}
            submitLabel="Update Project"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-6 font-mono">
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-zinc-900 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{activeWorkspace?.name}</span>
                  <span>//</span>
                  <span className="text-zinc-400">{project.slug}</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h1>
                {project.tagline && (
                  <p className="text-sm text-zinc-400 mt-1">{project.tagline}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase px-2 py-0.5 rounded border ${
                    project.status === "active"
                      ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {project.project_type}
                </span>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="space-y-1.5">
                <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {(project.repository_url || project.deployment_url) && (
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider">
                  External Coordinates
                </h3>
                <div className="flex flex-wrap gap-4 text-xs">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Repository</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}
                  {project.deployment_url && (
                    <a
                      href={project.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Deployment</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-zinc-500">
              <div className="space-y-0.5">
                <span className="uppercase text-[10px] text-zinc-600">Category</span>
                <div className="text-zinc-300">{project.category}</div>
              </div>
              <div className="space-y-0.5">
                <span className="uppercase text-[10px] text-zinc-600">Created</span>
                <div className="text-zinc-300">
                  {new Date(project.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="uppercase text-[10px] text-zinc-600">Last Modified</span>
                <div className="text-zinc-300">
                  {new Date(project.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
