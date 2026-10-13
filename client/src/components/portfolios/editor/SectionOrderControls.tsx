import { ArrowDown, ArrowUp, Eye, EyeOff, Layers, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SectionOrderControlsProps {
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  onChange: (order: string[], visibility: Record<string, boolean>) => void;
}

const DEFAULT_ORDER = [
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "certifications",
  "contact",
];

const SECTION_LABELS: Record<string, { label: string; desc: string }> = {
  about: { label: "About Me", desc: "Biographical overview & background summary" },
  skills: { label: "Skills & Tech Stack", desc: "Categorized technologies & competency badges" },
  projects: { label: "Projects & Engineering", desc: "Featured case studies, repos, and live demos" },
  experience: { label: "Work Experience", desc: "Employment timeline and accomplishments" },
  education: { label: "Education", desc: "Degrees and universities" },
  certifications: { label: "Certifications", desc: "Professional credentials and licenses" },
  contact: { label: "Contact Details", desc: "Direct mailto CTA and social links" },
};

export function SectionOrderControls({
  sectionOrder = DEFAULT_ORDER,
  sectionVisibility = {},
  onChange,
}: SectionOrderControlsProps) {
  // Ensure all default sections are present in currentOrder
  const currentOrder = [
    ...sectionOrder.filter((k) => k !== "hero"),
    ...DEFAULT_ORDER.filter((d) => !sectionOrder.includes(d)),
  ];

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    // Keep hero at start internally
    onChange(["hero", ...newOrder], sectionVisibility);
  };

  const handleToggleVisibility = (sectionKey: string) => {
    const isCurrentlyVisible = sectionVisibility[sectionKey] !== false;
    const newVisibility = {
      ...sectionVisibility,
      [sectionKey]: !isCurrentlyVisible,
    };
    onChange(["hero", ...currentOrder], newVisibility);
  };

  const handleReset = () => {
    onChange(["hero", ...DEFAULT_ORDER], {});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-500" />
            <span>Section Ordering & Visibility</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Reorder sections or hide sections you do not want displayed on your live website.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Order</span>
        </Button>
      </div>

      <div className="space-y-2">
        {currentOrder.map((sectionKey, index) => {
          const info = SECTION_LABELS[sectionKey] || { label: sectionKey, desc: "" };
          const isVisible = sectionVisibility[sectionKey] !== false;

          return (
            <div
              key={sectionKey}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isVisible
                  ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs"
                  : "bg-neutral-50 dark:bg-neutral-950 border-dashed border-neutral-300 dark:border-neutral-800 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold flex items-center justify-center text-neutral-500 shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {info.label}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate max-w-xs sm:max-w-md">
                    {info.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Visibility Toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleVisibility(sectionKey)}
                  className={`h-7 px-2 text-xs gap-1 ${
                    isVisible
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                  title={isVisible ? "Hide section" : "Show section"}
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{isVisible ? "Visible" : "Hidden"}</span>
                </Button>

                {/* Move Up */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => handleMove(index, "up")}
                  className="h-7 w-7 text-neutral-500 disabled:opacity-30"
                  title="Move section up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>

                {/* Move Down */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === currentOrder.length - 1}
                  onClick={() => handleMove(index, "down")}
                  className="h-7 w-7 text-neutral-500 disabled:opacity-30"
                  title="Move section down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
