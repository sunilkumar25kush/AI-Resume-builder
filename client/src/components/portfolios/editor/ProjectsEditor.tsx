import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderGit2,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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

  const handleImageFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleUpdate(index, { imageUrl: reader.result });
        toast.success("Project screenshot loaded!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearImage = (index: number) => {
    handleUpdate(index, { imageUrl: "" });
    toast.info("Project screenshot removed");
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
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 dark:text-neutral-500">
            <FolderGit2 className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No projects added yet
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Add your featured open-source libraries, web applications, or case studies to showcase your technical craft.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddProject}
            className="mt-2 text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add First Project
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
                        {proj.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shrink-0">
                            <ImageIcon className="h-2.5 w-2.5" />
                            Image
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

                    {/* Project Image / Screenshot Customization */}
                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Project Thumbnail / Screenshot</span>
                        </Label>
                        {proj.imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearImage(index)}
                            className="h-6 px-2 text-[11px] text-red-500 hover:text-red-600 gap-1"
                          >
                            <X className="h-3 w-3" /> Remove Image
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Thumbnail Preview */}
                        <div className="w-20 h-14 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {proj.imageUrl ? (
                            <img
                              src={proj.imageUrl}
                              alt={proj.title || "Project Preview"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <FolderGit2 className="h-6 w-6 text-neutral-400" />
                          )}
                        </div>

                        {/* Input options: File Upload or Direct URL */}
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center gap-2">
                            <Input
                              value={proj.imageUrl || ""}
                              onChange={(e) => handleUpdate(index, { imageUrl: e.target.value })}
                              placeholder="Image URL or upload below (e.g. https://...)"
                              className="h-8 text-xs font-mono"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              className="h-8 text-xs shrink-0 gap-1.5"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload</span>
                            </Button>
                            <input
                              type="file"
                              ref={(el) => {
                                fileInputRefs.current[index] = el;
                              }}
                              accept="image/*"
                              onChange={(e) => handleImageFileUpload(index, e)}
                              className="hidden"
                            />
                          </div>
                          <p className="text-[10px] text-neutral-400">
                            Upload a screenshot from disk (PNG, JPG, WebP &lt; 2 MB) or provide a direct image link.
                          </p>
                        </div>
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
