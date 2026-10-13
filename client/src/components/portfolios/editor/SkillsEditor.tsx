import { Cpu, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioSkill } from "@/types/portfolio";

export interface SkillsEditorProps {
  skills: PortfolioSkill[];
  onChange: (skills: PortfolioSkill[]) => void;
}

export function SkillsEditor({ skills = [], onChange }: SkillsEditorProps) {
  const handleAddSkill = () => {
    onChange([
      ...skills,
      {
        name: "",
        category: "Technologies",
        level: "intermediate",
      },
    ]);
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioSkill>) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-neutral-500" />
            <span>Skills & Technologies ({skills.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            List your languages, frameworks, cloud tooling, and key technical proficiencies.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSkill}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Skill</span>
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No skills listed yet
          </p>
          <p className="text-xs text-neutral-400">
            Add skills to showcase your core stack and expertise.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddSkill}
            className="mt-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Skill
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={skill.name || ""}
                  onChange={(e) => handleUpdate(index, { name: e.target.value })}
                  placeholder="Skill name (e.g. React, Go, AWS)"
                  className="h-8 text-xs font-medium"
                />

                <Input
                  value={skill.category || ""}
                  onChange={(e) => handleUpdate(index, { category: e.target.value })}
                  placeholder="Category (e.g. Backend, Cloud)"
                  className="h-8 text-xs"
                />

                <select
                  value={skill.level || "intermediate"}
                  onChange={(e) =>
                    handleUpdate(index, {
                      level: e.target.value as "beginner" | "intermediate" | "advanced" | "expert",
                    })
                  }
                  className="h-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 text-neutral-400 hover:text-red-600 shrink-0"
                title="Remove skill"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
