import { useEffect, useRef, useState } from "react";
import { getTemplateById } from "@/templates";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

interface ResumePreviewProps {
  data: ParsedResumeData | any;
  template?: ResumeTemplate | string;
  theme?: {
    accentColor?: string;
    fontSize?: string;
  };
  /** Auto-fit density level */
  density?: string;
  onDensityDetected?: (density: string, isShort: boolean) => void;
  /** Optional title (used only for metadata or accessibility, NEVER for header name) */
  title?: string;
  className?: string;
  /** Force a specific scale or allow auto-scaling */
  scale?: number;
}

/**
 * True A4 Resume Preview Renderer.
 * 
 * Sizing:
 * - Always renders templates at true A4 dimensions (794px x 1123px at 96 DPI).
 * - Scales to fit screen/preview containers using `CSS transform: scale()`.
 * - Never shrinks font sizes or alters line wrap behavior for previews.
 * - Header ALWAYS reads personal.fullName (fallback "Your Name"), NEVER resume title.
 */
export function ResumePreview({
  data,
  template,
  theme,
  density = "density-1",
  onDensityDetected,
  className = "",
  scale: forcedScale,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1123);

  // Lookup the dedicated template component
  const tplDef = getTemplateById(template);
  const TemplateComponent = tplDef.component;

  // Active theme (custom theme or template default)
  const activeTheme = {
    ...tplDef.defaultTheme,
    ...theme,
  };

  // Measure container and content to compute pixel-perfect scale
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth > 0) {
        // True A4 width is 794px
        const nextScale = Math.min(1, containerWidth / 794);
        setAutoScale(nextScale);
      }

      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(Math.max(1123, height));
      }
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(containerRef.current);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [data, template, activeTheme, density]);

  // Separate, stable effect for Auto-Density Detection
  // Triggered only when data or template changes, preventing recursive feedback loops
  const onDensityDetectedRef = useRef(onDensityDetected);
  onDensityDetectedRef.current = onDensityDetected;

  useEffect(() => {
    if (!contentRef.current || !onDensityDetectedRef.current) return;

    const timer = setTimeout(() => {
      if (!contentRef.current || !onDensityDetectedRef.current) return;
      const height = contentRef.current.scrollHeight;
      const a4PrintableHeight = 1030;
      const threshold88 = a4PrintableHeight * 0.88;

      let baselineHeight = height;
      if (density === "density-compact") {
        baselineHeight = height / 0.88;
      } else if (density === "density-2") {
        baselineHeight = height / 1.08;
      } else if (density === "density-3") {
        baselineHeight = height / 1.18;
      }

      let detected = "density-1";
      let short = false;

      if (baselineHeight > a4PrintableHeight && baselineHeight <= a4PrintableHeight * 1.14) {
        detected = "density-compact";
        short = false;
      } else if (baselineHeight < threshold88 * 0.75) {
        detected = "density-3";
        short = true;
      } else if (baselineHeight < threshold88) {
        detected = "density-2";
        short = true;
      } else {
        detected = "density-1";
        short = false;
      }

      onDensityDetectedRef.current(detected, short);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, template]);

  const effectiveScale = forcedScale !== undefined ? forcedScale : autoScale;

  return (
    <div
      ref={containerRef}
      className={`resume-preview-viewport w-full overflow-hidden flex justify-center ${className}`}
      style={{
        // Set viewport height according to scaled content
        minHeight: `${contentHeight * effectiveScale}px`,
        height: `${contentHeight * effectiveScale}px`,
      }}
    >
      <div
        className="resume-preview-scaler origin-top shrink-0 transition-transform duration-150"
        style={{
          width: "794px",
          transform: `scale(${effectiveScale})`,
          transformOrigin: "top center",
        }}
      >
        <div ref={contentRef} className={`shadow-lg print:shadow-none ${density}`}>
          <TemplateComponent data={data} theme={activeTheme} />
        </div>
      </div>
    </div>
  );
}
