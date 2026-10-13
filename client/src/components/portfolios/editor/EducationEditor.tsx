import { GraduationCap, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortfolioEducation } from "@/types/portfolio";

export interface EducationEditorProps {
  education: PortfolioEducation[];
  onChange: (education: PortfolioEducation[]) => void;
}

export function EducationEditor({ education = [], onChange }: EducationEditorProps) {
  const handleAdd = () => {
    onChange([
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioEducation>) => {
    const updated = [...education];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-neutral-500" />
            <span>Education ({education.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Degrees, academic background, universities, and graduation dates.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Degree</span>
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No education entries listed
          </p>
          <p className="text-xs text-neutral-400">
            Add your degrees or academic institutions to showcase your background.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAdd}
            className="mt-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 relative shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  Degree #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-7 w-7 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Institution / University *</Label>
                  <Input
                    value={edu.institution || ""}
                    onChange={(e) => handleUpdate(index, { institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Degree & Field *</Label>
                  <Input
                    value={edu.degree || ""}
                    onChange={(e) => handleUpdate(index, { degree: e.target.value })}
                    placeholder="e.g. B.S. Computer Science"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Field of Study</Label>
                  <Input
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) => handleUpdate(index, { fieldOfStudy: e.target.value })}
                    placeholder="e.g. Software Engineering"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">GPA / Honors (optional)</Label>
                  <Input
                    value={edu.grade || ""}
                    onChange={(e) => handleUpdate(index, { grade: e.target.value })}
                    placeholder="e.g. Magna Cum Laude"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    value={edu.startDate || ""}
                    onChange={(e) => handleUpdate(index, { startDate: e.target.value })}
                    placeholder="e.g. 2018"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">End / Graduation Date</Label>
                  <Input
                    value={edu.endDate || ""}
                    onChange={(e) => handleUpdate(index, { endDate: e.target.value })}
                    placeholder="e.g. 2022"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
