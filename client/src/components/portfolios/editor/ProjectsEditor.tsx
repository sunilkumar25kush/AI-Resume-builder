import { ChevronDown, ChevronUp, ExternalLink, FolderGit2, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioProject } from "@/types/portfolio";

export interface ProjectsEditorProps {
  projects: PortfolioProject[];
  onChange: (projects: PortfolioProject[]) => void;
}

export function ProjectsEditor({ projects = [], onChange }: ProjectsEditorProps) {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true });

  const toggleOpen = (index: number) => {
    setOpenIndices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAddProject = () => {
    const nextIndex = projects.length;
    onChange([
      ...projects,
      {
        title: "",
        description: "",
        tags: [],
        liveUrl: "",
        repoUrl: "",
        imageUrl: "",
        featured: false,
      },
    ]);
    setOpenIndices((prev) => ({ ...prev, [nextIndex]: true }));
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioProject>) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-neutral-500" />
            <span>Featured Projects ({projects.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Open-source libraries, web applications, case studies, and engineering repos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddProject}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No projects added yet
          </p>
          <p className="text-xs text-neutral-400">
            Add high-impact engineering projects to attract recruiters and collaborators.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddProject}
            className="mt-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, index) => {
            const isOpen = openIndices[index] ?? false;
            return (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs"
              >
                {/* Header card toggle */}
                <div
                  className="flex items-center justify-between p-3.5 bg-neutral-50/50 dark:bg-neutral-850/50 cursor-pointer select-none"
                  onClick={() => toggleOpen(index)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-neutral-200 dark:bg-neutral-800 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {proj.title || "Untitled Project"}
                        </h4>
                        {proj.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {proj.tags && proj.tags.length > 0 ? proj.tags.join(", ") : "No tags specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      className="h-8 w-8 text-neutral-400 hover:text-red-600"
                      title="Remove project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleOpen(index)}
                      className="h-8 w-8 text-neutral-500"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Form fields */}
                {isOpen && (
                  <div className="p-4 space-y-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Project Title *</Label>
                        <Input
                          value={proj.title || ""}
                          onChange={(e) => handleUpdate(index, { title: e.target.value })}
                          placeholder="e.g. Distributed Cache Engine"
                          className="h-8 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Tech Stack / Tags</Label>
                          <span className="text-[10px] text-neutral-400">Comma separated</span>
                        </div>
                        <Input
                          value={proj.tags ? proj.tags.join(", ") : ""}
                          onChange={(e) =>
                            handleUpdate(index, {
                              tags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g. Go, Redis, Docker, gRPC"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Live Demo URL
                        </Label>
                        <Input
                          value={proj.liveUrl || ""}
                          onChange={(e) => handleUpdate(index, { liveUrl: e.target.value })}
                          placeholder="https://myproject.com"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <BrandIcon name="github" size={13} /> Repository / Code URL
                        </Label>
                        <Input
                          value={proj.repoUrl || ""}
                          onChange={(e) => handleUpdate(index, { repoUrl: e.target.value })}
                          placeholder="https://github.com/user/project"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Project Description</Label>
                      <Textarea
                        value={proj.description || ""}
                        onChange={(e) => handleUpdate(index, { description: e.target.value })}
                        placeholder="What problem does this project solve? What technical decisions or architecture choices were made?"
                        rows={3}
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proj.featured || false}
                          onChange={(e) => handleUpdate(index, { featured: e.target.checked })}
                          className="rounded border-neutral-300 h-4 w-4"
                        />
                        <span>Highlight as Featured Project</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
