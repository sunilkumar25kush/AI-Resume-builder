import { ThemeWrapper } from "@/components/portfolios/common/ThemeWrapper";
import { getPortfolioTemplate } from "@/components/portfolios/templates/registry";
import type { Portfolio } from "@/types/portfolio";

export interface PortfolioRendererProps {
  portfolio: Partial<Portfolio>;
  showEmpty?: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  className?: string;
  overrideTemplate?: "minimal" | "developer";
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
}: PortfolioRendererProps) {
  const activeTemplateId = overrideTemplate || portfolio.design?.template;
  const TemplateComponent = getPortfolioTemplate(activeTemplateId);

  const resolvedSectionOrder = sectionOrder || portfolio.design?.sectionOrder;
  const resolvedHiddenSections =
    hiddenSections ||
    (portfolio.design?.sectionVisibility
      ? Object.entries(portfolio.design.sectionVisibility)
          .filter(([, visible]) => visible === false)
          .map(([key]) => key)
      : []);

  return (
    <ThemeWrapper design={portfolio.design} className={className}>
      <TemplateComponent
        portfolio={portfolio}
        showEmpty={showEmpty}
        sectionOrder={resolvedSectionOrder}
        hiddenSections={resolvedHiddenSections}
      />
    </ThemeWrapper>
  );
}
