import { useLayoutEffect, useState, type RefObject } from "react";

export type DensityLevel = "density-compact" | "density-1" | "density-2" | "density-3";

export interface AutoDensityResult {
  density: DensityLevel;
  setDensity: (d: DensityLevel) => void;
  isShortContent: boolean;
}

/**
 * Measures the rendered content height and dynamically determines
 * the optimal density class to eliminate awkward empty space on short resumes.
 */
export function useAutoDensity(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
): AutoDensityResult {
  const [density, setDensity] = useState<DensityLevel>("density-1");
  const [isShortContent, setIsShortContent] = useState(false);

  useLayoutEffect(() => {
    if (!enabled || !containerRef.current) return;
    const el = containerRef.current;

    const scrollHeight = el.scrollHeight;
    const a4PrintableHeight = 1030; // approx printable height at 96 DPI
    const threshold88 = a4PrintableHeight * 0.88; // ~906px

    if (scrollHeight > a4PrintableHeight) {
      // If content slightly overflows 1 page, step down to density-compact (9.5pt)
      if (scrollHeight <= a4PrintableHeight * 1.14) {
        setDensity("density-compact");
      } else {
        setDensity("density-1");
      }
      setIsShortContent(false);
    } else if (scrollHeight < threshold88 * 0.75) {
      // Content fills < 66% of the page -> step up to density-3 (11.5pt)
      setDensity("density-3");
      setIsShortContent(true);
    } else if (scrollHeight < threshold88) {
      // Content fills between 66% and 88% -> step up to density-2 (11pt)
      setDensity("density-2");
      setIsShortContent(true);
    } else {
      // Filled nicely >= 88% -> standard density-1 (10.5pt)
      setDensity("density-1");
      setIsShortContent(false);
    }
  }, [containerRef, enabled]);

  return { density, setDensity, isShortContent };
}
