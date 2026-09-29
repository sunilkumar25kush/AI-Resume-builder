import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { TEMPLATES, getTemplateById, sampleResume } from "@/templates";
import type { ResumeTemplate } from "@/types";

interface TemplatePickerProps {
  value: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
  theme?: {
    accentColor?: string;
    fontSize?: string;
  };
  onThemeChange?: (theme: { accentColor?: string; fontSize?: string }) => void;
}

/**
 * Scaled thumbnail card rendering the REAL template component with REAL sample data.
 * Dynamic ResizeObserver calculates exact transform scale so the A4 794px canvas
 * scales down flawlessly into the card.
 */
function ScaledTemplateThumbnail({
  template,
}: {
  template: (typeof TEMPLATES)[number];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.18);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / 794);
        }
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const Component = template.component;

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[794/1050] overflow-hidden rounded-md border border-neutral-200/90 bg-white relative shadow-2xs"
    >
      <div
        className="pointer-events-none select-none origin-top-left absolute top-0 left-0"
        style={{
          width: "794px",
          minHeight: "1123px",
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <Component data={sampleResume} theme={template.defaultTheme} />
      </div>
    </div>
  );
}

export function TemplatePicker({ value, onChange, theme, onThemeChange }: TemplatePickerProps) {
  const activeDef = getTemplateById(value);
  const activeId = activeDef?.id || value;

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5"
        role="radiogroup"
        aria-label="Resume template"
      >
        {TEMPLATES.map((template) => {
          const selected = template.id === activeId;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                onChange(template.id as ResumeTemplate);
                if (onThemeChange && template.defaultTheme) {
                  onThemeChange({
                    accentColor: template.defaultTheme.accentColor,
                    fontSize: theme?.fontSize || template.defaultTheme.fontSize || "14px",
                  });
                }
              }}
              className={`group relative flex flex-col rounded-xl border p-2.5 text-left transition-all hover:shadow-md cursor-pointer ${
                selected
                  ? "border-primary bg-primary/[0.03] ring-2 ring-primary shadow-sm"
                  : "border-border hover:border-neutral-400 bg-card"
              }`}
            >
              {/* Selected indicator check badge */}
              {selected && (
                <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}

              {/* Real Scaled Down Live Render Thumbnail */}
              <div className="mb-2 w-full overflow-hidden rounded-md transition-transform group-hover:scale-[1.02]">
                <ScaledTemplateThumbnail template={template} />
              </div>

              {/* Title & Reference Badge */}
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className={`text-[12.5px] font-bold leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                  {template.name}
                </span>
                {template.reference && (
                  <span className="shrink-0 text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {template.reference}
                  </span>
                )}
              </div>

              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Theme Tweaks (Accent & Font Size) */}
      {onThemeChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Accent Color:</span>
            <div className="flex items-center gap-1.5">
              {["#C2185B", "#2B3450", "#000000", "#0F4C81", "#7C3AED", "#B08D57", "#4F46E5", "#1D4ED8"].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onThemeChange({ ...theme, accentColor: color })}
                  className={`h-5 w-5 rounded-full border border-black/10 transition-transform ${
                    theme?.accentColor === color ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select accent ${color}`}
                />
              ))}
              <input
                type="color"
                value={theme?.accentColor || "#1D4ED8"}
                onChange={(e) => onThemeChange({ ...theme, accentColor: e.target.value })}
                className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                title="Custom color"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Font Size:</span>
            <div className="flex rounded border bg-background p-0.5">
              {[
                { label: "Compact", size: "13px" },
                { label: "Standard", size: "14px" },
                { label: "Spacious", size: "15px" },
              ].map((opt) => (
                <button
                  key={opt.size}
                  type="button"
                  onClick={() => onThemeChange({ ...theme, fontSize: opt.size })}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    (theme?.fontSize || "14px") === opt.size
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
