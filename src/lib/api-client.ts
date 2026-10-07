/**
 * Ikigai API Client Boundary
 * Encapsulates all communications with the ikigai-api backend.
 * Passes Bearer tokens and X-Workspace-Id.
 * Zero direct Supabase client calls for application business entities.
 */

import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type ProjectStatus = "active" | "archived";
export type ProjectType = "software" | "research" | "experiment" | "other";

export interface Project {
  id: string;
  workspace_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  category: string;
  status: ProjectStatus;
  project_type: ProjectType;
  repository_url: string | null;
  deployment_url: string | null;
  technologies: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  title: string;
  slug?: string;
  description?: string;
  tagline?: string;
  category?: string;
  project_type?: ProjectType;
  repository_url?: string;
  deployment_url?: string;
  technologies?: string[];
  is_featured?: boolean;
}

export interface ProjectUpdateInput {
  title?: string;
  slug?: string;
  description?: string;
  tagline?: string;
  category?: string;
  status?: ProjectStatus;
  project_type?: ProjectType;
  repository_url?: string;
  deployment_url?: string;
  technologies?: string[];
  is_featured?: boolean;
}

export interface ContactMessage {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "RECEIVED" | "READ" | "SPAM_FLAGGED" | "ARCHIVED";
  sender_ip_hash: string;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  workspace_id: string;
  synthetic_name: string;
  synthetic_avatar_seed: string;
  content: string;
  rating: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  sender_ip_hash: string;
  created_at: string;
}

export type WorkspaceRole = "owner" | "admin" | "member" | "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}

export interface ApiHealth {
  status: string;
  service: string;
  version: string;
  storage: string;
}

export class ApiClient {
  /**
   * Resolves the current user's JWT access token from the active Supabase session.
   * Zero localStorage usage: utilizes the browser Supabase client's in-memory session.
   */
  static async getAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  private static getHeaders(token?: string, workspaceId?: string): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (workspaceId) {
      headers["X-Workspace-Id"] = workspaceId;
    }
    return headers;
  }

  static async getHealth(): Promise<ApiHealth> {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to reach Ikigai API");
    return res.json();
  }

  /**
   * Discovers all workspaces accessible to the authenticated user.
   * Multi-tenant discovery endpoint: does not require X-Workspace-Id.
   */
  static async getMyWorkspaces(token: string): Promise<Workspace[]> {
    const res = await fetch(`${API_BASE_URL}/workspaces/me`, {
      method: "GET",
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to load workspaces: ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid workspace discovery response: expected array");
    }
    const validRoles = new Set(["owner", "admin", "member", "OWNER", "ADMIN", "MEMBER"]);
    for (const ws of data) {
      if (!ws || typeof ws !== "object") {
        throw new Error("Invalid workspace item: expected object");
      }
      if (!ws.id || !ws.name || !ws.slug || !ws.role) {
        throw new Error("Invalid workspace item: missing required fields (id, name, slug, role)");
      }
      if (!validRoles.has(ws.role)) {
        throw new Error(`Invalid workspace role: '${ws.role}'`);
      }
    }
    return data as Workspace[];
  }

  static async getProjects(token: string, workspaceId: string): Promise<Project[]> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for getProjects");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/projects`, {
      method: "GET",
      headers: this.getHeaders(token, workspaceId),
    });
    if (!res.ok) {
      throw new Error(`Failed to load projects: ${res.statusText}`);
    }
    return res.json();
  }

  static async getProject(token: string, workspaceId: string, projectId: string): Promise<Project> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for getProject");
    }
    if (!projectId) {
      throw new Error("Project ID is required for getProject");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/projects/${projectId}`, {
      method: "GET",
      headers: this.getHeaders(token, workspaceId),
    });
    if (!res.ok) {
      throw new Error(`Failed to load project: ${res.statusText}`);
    }
    return res.json();
  }

  static async createProject(token: string, workspaceId: string, payload: ProjectCreateInput): Promise<Project> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for createProject");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/projects`, {
      method: "POST",
      headers: this.getHeaders(token, workspaceId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.detail || `Failed to create project: ${res.statusText}`);
    }
    return res.json();
  }

  static async updateProject(token: string, workspaceId: string, projectId: string, payload: ProjectUpdateInput): Promise<Project> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for updateProject");
    }
    if (!projectId) {
      throw new Error("Project ID is required for updateProject");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/projects/${projectId}`, {
      method: "PATCH",
      headers: this.getHeaders(token, workspaceId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.detail || `Failed to update project: ${res.statusText}`);
    }
    return res.json();
  }

  static async archiveProject(token: string, workspaceId: string, projectId: string): Promise<Project> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for archiveProject");
    }
    if (!projectId) {
      throw new Error("Project ID is required for archiveProject");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/projects/${projectId}`, {
      method: "DELETE",
      headers: this.getHeaders(token, workspaceId),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.detail || `Failed to archive project: ${res.statusText}`);
    }
    return res.json();
  }

  static async getMessages(token: string, workspaceId: string): Promise<ContactMessage[]> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for getMessages");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/messages`, {
      method: "GET",
      headers: this.getHeaders(token, workspaceId),
    });
    if (!res.ok) {
      throw new Error(`Failed to load inbox messages: ${res.statusText}`);
    }
    return res.json();
  }

  static async approveReview(reviewId: string, token: string, workspaceId: string): Promise<any> {
    if (!workspaceId) {
      throw new Error("Workspace ID is required for approveReview");
    }
    const res = await fetch(`${API_BASE_URL}/workspaces/current/reviews/${reviewId}/approve`, {
      method: "POST",
      headers: this.getHeaders(token, workspaceId),
    });
    if (!res.ok) {
      throw new Error(`Failed to approve review: ${res.statusText}`);
    }
    return res.json();
  }
}
