"use client";

import React, { useState } from "react";
import {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectType,
  ProjectStatus,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectCreateInput | ProjectUpdateInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "Software Engineering");
  const [projectType, setProjectType] = useState<ProjectType>(initialData?.project_type || "software");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || "active");
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repository_url || "");
  const [deploymentUrl, setDeploymentUrl] = useState(initialData?.deployment_url || "");
  const [technologies, setTechnologies] = useState(initialData?.technologies?.join(", ") || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const techList = technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: ProjectCreateInput | ProjectUpdateInput = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || "Software Engineering",
        project_type: projectType,
        status: status,
        repository_url: repositoryUrl.trim() || undefined,
        deployment_url: deploymentUrl.trim() || undefined,
        technologies: techList,
        is_featured: isFeatured,
      };

      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.message || "Failed to process project submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
      {error && (
        <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="project-title" className="text-zinc-400 uppercase text-[11px]">
            Project Title *
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quantum Ledger"
            required
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-slug" className="text-zinc-400 uppercase text-[11px]">
            Slug (Optional)
          </label>
          <input
            id="project-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. quantum-ledger"
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="project-tagline" className="text-zinc-400 uppercase text-[11px]">
          Tagline
        </label>
        <input
          id="project-tagline"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Short punchline summary"
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="project-description" className="text-zinc-400 uppercase text-[11px]">
          Description
        </label>
        <textarea
          id="project-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Comprehensive project scope and goals..."
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="project-type" className="text-zinc-400 uppercase text-[11px]">
            Project Type
          </label>
          <select
            id="project-type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600"
          >
            <option value="software">Software</option>
            <option value="research">Research</option>
            <option value="experiment">Experiment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-status" className="text-zinc-400 uppercase text-[11px]">
            Status
          </label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-category" className="text-zinc-400 uppercase text-[11px]">
            Category
          </label>
          <input
            id="project-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Systems & Cloud"
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="project-repo" className="text-zinc-400 uppercase text-[11px]">
            Repository URL
          </label>
          <input
            id="project-repo"
            type="url"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-deployment" className="text-zinc-400 uppercase text-[11px]">
            Deployment URL
          </label>
          <input
            id="project-deployment"
            type="url"
            value={deploymentUrl}
            onChange={(e) => setDeploymentUrl(e.target.value)}
            placeholder="https://app.domain.com"
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="project-technologies" className="text-zinc-400 uppercase text-[11px]">
          Technologies (comma separated)
        </label>
        <input
          id="project-technologies"
          type="text"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Rust, TypeScript, PostgreSQL"
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          id="project-featured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-0 focus:outline-none"
        />
        <label htmlFor="project-featured" className="text-zinc-300 text-xs cursor-pointer select-none">
          Highlight as featured project
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-zinc-800 text-zinc-400 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Processing...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
