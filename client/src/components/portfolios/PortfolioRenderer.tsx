import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { ThemeWrapper } from "@/components/portfolios/common/ThemeWrapper";
import { getPortfolioTemplate } from "@/components/portfolios/templates/registry";
import type { Portfolio } from "@/types/portfolio";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RendererErrorBoundaryProps {
  children: ReactNode;
  templateName?: string;
}

interface RendererErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RendererErrorBoundary extends Component<RendererErrorBoundaryProps, RendererErrorBoundaryState> {
  constructor(props: RendererErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RendererErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Portfolio template rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[420px] w-full flex-col items-center justify-center p-8 text-center bg-neutral-900/40 rounded-xl border border-neutral-800 text-neutral-300">
          <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold text-white mb-1">
            Template Preview Suspended
          </h4>
          <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed">
            {this.props.templateName
              ? `There was an unexpected issue rendering the ${this.props.templateName} layout with the current data.`
              : "Unable to render template preview at this time."}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
            className="text-xs gap-1.5 h-8 border-neutral-700 hover:bg-neutral-800 text-white"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reload Preview</span>
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <RendererErrorBoundary templateName={String(activeTemplateId)}>
        <Suspense
          fallback={
            <div className="flex h-full w-full min-h-[400px] items-center justify-center bg-neutral-950 text-neutral-600 animate-pulse">
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
      </RendererErrorBoundary>
    </ThemeWrapper>
  );
}
export default PortfolioRenderer;
