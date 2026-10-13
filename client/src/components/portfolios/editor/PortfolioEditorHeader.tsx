import { Link } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Globe, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PortfolioEditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveState: "saved" | "saving" | "error" | "unsaved";
  onRetry: () => void;
  onSaveNow: () => void;
  portfolioId: string;
  portfolioSlug?: string;
  isPublic?: boolean;
}

export function PortfolioEditorHeader({
  title,
  onTitleChange,
  saveState,
  onRetry,
  onSaveNow,
  portfolioId,
  portfolioSlug,
  isPublic,
}: PortfolioEditorHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xl">
          <Button asChild variant="ghost" size="icon" className="shrink-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <Link to="/portfolios" title="Back to Portfolios">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="flex flex-col min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Portfolio Title (e.g. Alex Mercer Portfolio)"
              className="h-8 font-semibold text-base sm:text-lg border-transparent hover:border-neutral-300 dark:hover:border-neutral-750 focus:border-neutral-400 bg-transparent px-2 -ml-2 rounded-md shadow-none focus-visible:ring-1"
            />
            {portfolioSlug && (
              <span className="text-[11px] text-neutral-400 font-mono px-0.5 truncate">
                slug: /{portfolioSlug} {isPublic && "• Published"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Autosave Status & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium">
            {saveState === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">Saving...</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">Saved</span>
              </>
            )}
            {saveState === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 dark:text-amber-400 hidden sm:inline">Unsaved edits</span>
              </>
            )}
            {saveState === "error" && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Save failed</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="h-5 px-1.5 text-[11px] text-red-600 hover:text-red-700 underline"
                >
                  Retry
                </Button>
              </>
            )}
          </div>

          {/* Save Now Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveNow}
            disabled={saveState === "saving" || saveState === "saved"}
            className="text-xs gap-1.5"
          >
            {saveState === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save Now</span>
          </Button>

          {/* View Website CTA */}
          <Button
            asChild
            variant="default"
            size="sm"
            className="text-xs gap-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100"
          >
            <Link to={`/portfolios/${portfolioId}`} target="_blank" rel="noopener noreferrer">
              <Globe className="h-3.5 w-3.5" />
              <span>Preview Site</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
