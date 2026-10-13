import { Briefcase, Calendar, ChevronDown, ChevronUp, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioExperience } from "@/types/portfolio";

export interface ExperienceEditorProps {
  experience: PortfolioExperience[];
  onChange: (experience: PortfolioExperience[]) => void;
}

export function ExperienceEditor({ experience = [], onChange }: ExperienceEditorProps) {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true });

  const toggleOpen = (index: number) => {
    setOpenIndices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAddExperience = () => {
    const nextIndex = experience.length;
    onChange([
      ...experience,
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        highlights: [],
      },
    ]);
    setOpenIndices((prev) => ({ ...prev, [nextIndex]: true }));
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioExperience>) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  const handleAddHighlight = (expIndex: number) => {
    const exp = experience[expIndex];
    const highlights = [...(exp.highlights || []), ""];
    handleUpdate(expIndex, { highlights });
  };

  const handleUpdateHighlight = (expIndex: number, hIndex: number, value: string) => {
    const exp = experience[expIndex];
    const highlights = [...(exp.highlights || [])];
    highlights[hIndex] = value;
    handleUpdate(expIndex, { highlights });
  };

  const handleRemoveHighlight = (expIndex: number, hIndex: number) => {
    const exp = experience[expIndex];
    const highlights = (exp.highlights || []).filter((_, i) => i !== hIndex);
    handleUpdate(expIndex, { highlights });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-neutral-500" />
            <span>Work Experience ({experience.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Roles, responsibilities, engineering achievements, and impact.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddExperience}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Role</span>
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No work experience listed yet
          </p>
          <p className="text-xs text-neutral-400">
            Add your past jobs or current positions to feature in the timeline.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddExperience}
            className="mt-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Role
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((exp, index) => {
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
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {exp.title || "Untitled Role"}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">
                        {exp.company || "Company"} {exp.startDate ? `• ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "Present"}` : ""}
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
                      title="Remove experience"
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
                        <Label className="text-xs">Role Title</Label>
                        <Input
                          value={exp.title || ""}
                          onChange={(e) => handleUpdate(index, { title: e.target.value })}
                          placeholder="e.g. Senior Backend Engineer"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Company / Organization</Label>
                        <Input
                          value={exp.company || ""}
                          onChange={(e) => handleUpdate(index, { company: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Location
                        </Label>
                        <Input
                          value={exp.location || ""}
                          onChange={(e) => handleUpdate(index, { location: e.target.value })}
                          placeholder="e.g. New York, NY (Hybrid)"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Start Date
                        </Label>
                        <Input
                          value={exp.startDate || ""}
                          onChange={(e) => handleUpdate(index, { startDate: e.target.value })}
                          placeholder="e.g. Jan 2022"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> End Date
                          </Label>
                          <label className="text-[11px] text-neutral-500 flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.current || false}
                              onChange={(e) => handleUpdate(index, { current: e.target.checked })}
                              className="rounded border-neutral-300 h-3 w-3"
                            />
                            Current role
                          </label>
                        </div>
                        <Input
                          value={exp.endDate || ""}
                          disabled={exp.current}
                          onChange={(e) => handleUpdate(index, { endDate: e.target.value })}
                          placeholder={exp.current ? "Present" : "e.g. Dec 2024"}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Role Summary</Label>
                      <Textarea
                        value={exp.description || ""}
                        onChange={(e) => handleUpdate(index, { description: e.target.value })}
                        placeholder="Overview of your core team, objectives, and impact..."
                        rows={2}
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    {/* Bullet Highlights */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Key Highlights & Accomplishments</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddHighlight(index)}
                          className="h-6 text-[11px] gap-1 text-blue-600 dark:text-blue-400"
                        >
                          <Plus className="h-3 w-3" /> Add bullet
                        </Button>
                      </div>

                      {(exp.highlights || []).map((highlight, hIndex) => (
                        <div key={hIndex} className="flex items-center gap-2">
                          <span className="text-neutral-400 text-xs font-mono">•</span>
                          <Input
                            value={highlight}
                            onChange={(e) => handleUpdateHighlight(index, hIndex, e.target.value)}
                            placeholder="Architected high-throughput service reducing latency by 40%..."
                            className="h-7 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHighlight(index, hIndex)}
                            className="h-7 w-7 text-neutral-400 hover:text-red-600 shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
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
