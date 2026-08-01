import { RESUME_TEMPLATES } from "@/templates/resumeTemplates";
import type { ResumeTemplate } from "@/types";

interface TemplatePickerProps {
  value: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
}

/** One-button-per-template switcher. */
export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Resume template">
      {RESUME_TEMPLATES.map((template) => {
        const selected = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(template.id)}
            className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
              selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent/50"
            }`}
          >
            <span className={`text-sm font-semibold ${selected ? "text-primary" : ""}`}>{template.name}</span>
            <span className="text-xs text-muted-foreground">{template.description}</span>
          </button>
        );
      })}
    </div>
  );
}
