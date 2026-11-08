import { Suspense } from "react";
import { ThemeWrapper } from "@/components/portfolios/common/ThemeWrapper";
import { getPortfolioTemplate } from "@/components/portfolios/templates/registry";
import type { Portfolio } from "@/types/portfolio";

export interface PortfolioRendererProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  className?: string;
  overrideTemplate?: Portfolio["design"]["template"];
  previewMode?: "desktop" | "tablet" | "mobile" | "thumbnail";
}

/**
 * Top-level PortfolioRenderer.
 * Resolves the approved template from the registry, applies isolated theme tokens,
 * and renders sections without modifying underlying portfolio data.
 */
export function PortfolioRenderer({
  portfolio,
  showEmpty = false,
  sectionOrder,
  hiddenSections,
  className = "",
  overrideTemplate,
  previewMode,
}: PortfolioRendererProps) {
  const activeTemplateId = overrideTemplate || portfolio.design?.template;
  const TemplateComponent = getPortfolioTemplate(activeTemplateId);

  const baseOrder =
    sectionOrder ||
    portfolio.design?.sectionOrder || [
      "hero",
      "about",
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
      "contact",
    ];

  // Guarantee hero is present (at index 0 if missing) so HeroSection and avatar are never dropped
  const resolvedSectionOrder = baseOrder.includes("hero") ? baseOrder : ["hero", ...baseOrder];

  const resolvedHiddenSections =
    hiddenSections ||
    (portfolio.design?.sectionVisibility
      ? Object.entries(portfolio.design.sectionVisibility)
        .filter(([, visible]) => visible === false)
        .map(([key]) => key)
      : []);

  return (
    <ThemeWrapper design={portfolio.design} className={className}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-neutral-600 animate-pulse">
            <div className="h-8 w-8 rounded-full border-2 border-neutral-700 border-t-primary animate-spin" />
          </div>
        }
      >
        <TemplateComponent
          portfolio={portfolio}
          showEmpty={showEmpty}
          sectionOrder={resolvedSectionOrder}
          hiddenSections={resolvedHiddenSections}
          previewMode={previewMode}
        />
      </Suspense>
    </ThemeWrapper>
  );
}
