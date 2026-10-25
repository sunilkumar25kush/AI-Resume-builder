import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallbackPosterUrl?: string;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Catches WebGL context losses, shader compile errors, or hardware acceleration failures.
 * Seamlessly renders a responsive static poster fallback so the portfolio remains readable.
 */
export class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, State> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || "WebGL initialization failed" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[WebGL] Context or rendering error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const { fallbackPosterUrl, fallbackTitle = "3D Interactive Showcase" } = this.props;

      return (
        <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-[#080b12] p-6 text-center text-slate-200">
          {fallbackPosterUrl && (
            <img
              src={fallbackPosterUrl}
              alt={fallbackTitle}
              className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-xs"
              loading="lazy"
            />
          )}

          <div className="relative z-10 mx-auto max-w-md space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>

            <h3 className="text-lg font-semibold tracking-tight text-white">{fallbackTitle}</h3>

            <p className="text-xs text-slate-400">
              Hardware acceleration is disabled or unsupported on this device. Viewing optimized static presentation.
            </p>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="gap-2 border-border/60 bg-card/60 text-xs text-white hover:bg-card"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry 3D Mode</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
