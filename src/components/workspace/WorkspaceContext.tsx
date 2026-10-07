"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient, type Workspace } from "@/lib/api-client";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  selectWorkspace: (workspaceId: string) => void;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const ACTIVE_WORKSPACE_STORAGE_KEY = "ikigai:active_workspace_id";

/**
 * Pure function to resolve active workspace based on persisted preference and membership list:
 * 1. If no workspaces exist, returns null.
 * 2. If persistedId is found in workspaces, returns that workspace.
 * 3. Otherwise defaults to the first accessible workspace.
 */
export function resolveActiveWorkspace(
  persistedId: string | null,
  workspaces: Workspace[]
): Workspace | null {
  if (!workspaces || workspaces.length === 0) return null;
  if (persistedId) {
    const found = workspaces.find((ws) => ws.id === persistedId);
    if (found) return found;
  }
  return workspaces[0];
}

function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
  } catch {
    // Gracefully handle storage quota or private-browsing restrictions
  }
}

export function WorkspaceProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
    return getStoredWorkspaceId();
  });

  const {
    data: workspaces = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Workspace[], Error>({
    queryKey: ["workspaces", "me", userId],
    queryFn: async () => {
      const token = await ApiClient.getAccessToken();
      if (!token) {
        throw new Error("No active operator session found.");
      }
      return ApiClient.getMyWorkspaces(token);
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });

  const activeWorkspace: Workspace | null = React.useMemo(() => {
    return resolveActiveWorkspace(selectedWorkspaceId, workspaces);
  }, [workspaces, selectedWorkspaceId]);

  const selectWorkspace = (workspaceId: string) => {
    const target = workspaces.find((ws) => ws.id === workspaceId);
    if (target) {
      setSelectedWorkspaceId(target.id);
      setStoredWorkspaceId(target.id);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        error: error ? (error as Error) : null,
        selectWorkspace,
        refetchWorkspaces: () => {
          refetch();
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
