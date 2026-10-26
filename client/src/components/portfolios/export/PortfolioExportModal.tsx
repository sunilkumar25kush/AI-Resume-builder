import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Code2,
  Download,
  Globe,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";


import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Portfolio } from "@/types/portfolio";

export interface PortfolioExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio;
}

export function PortfolioExportModal({
  open,
  onOpenChange,
  portfolio,
}: PortfolioExportModalProps) {
  const [format, setFormat] = useState<"source" | "static">("source");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateName = portfolio.design?.template || "devport";

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);

    const suffix = format === "source" ? "react-source" : "static-website";
    const filenameFallback = `${portfolio.slug || "portfolio"}-${suffix}.zip`;

    try {
      await portfoliosApi.downloadExport(portfolio._id, format, filenameFallback, portfolio);
      toast.success(
        format === "source"
          ? "React source code ZIP downloaded successfully!"
          : "Static website ZIP downloaded successfully!",
      );
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(`Export failed: ${msg}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !exporting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Export Portfolio Website
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Download your portfolio as a full React/Vite source project or a pre-built static website.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Portfolio Summary Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-foreground truncate">{portfolio.title}</span>
            <span className="text-muted-foreground font-mono">/p/{portfolio.slug}</span>
          </div>
          <Badge variant="outline" className="capitalize text-[11px] font-mono shrink-0">
            {templateName} template
          </Badge>
        </div>

        {/* Format Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Option A: React Source ZIP */}
          <button
            type="button"
            onClick={() => setFormat("source")}
            disabled={exporting}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all relative ${
              format === "source"
                ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/20"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Code2 className="h-4 w-4" />
                </span>
                <span className="font-bold text-sm text-foreground">React Source Code</span>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  format === "source"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                }`}
              >
                {format === "source" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">
              Full Vite + React 19 project with Tailwind CSS v4, Lucide icons, components, and package.json.
            </p>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">Vite + React 19</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">Tailwind CSS v4</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">Vercel / Netlify</span>
            </div>
          </button>

          {/* Option B: Static Website ZIP */}
          <button
            type="button"
            onClick={() => setFormat("static")}
            disabled={exporting}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all relative ${
              format === "static"
                ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/20"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="font-bold text-sm text-foreground">Static Website</span>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  format === "static"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                }`}
              >
                {format === "static" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">
              Pre-built standalone HTML, CSS, and vanilla JS. Ready for GitHub Pages, Netlify Drop, or instant local view.
            </p>

            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">100% Offline</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">Zero Node.js</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">GitHub Pages</span>
            </div>
          </button>
        </div>

        {/* Feature Highlights & Guarantees */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground text-[11px] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Export Guarantees</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Independent of backend API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>No API keys or secrets embedded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Preserves colors, fonts & sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Includes hosting deployment README</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="text-xs gap-1.5 min-w-[150px]"
          >
            {exporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating ZIP...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>
                  Download {format === "source" ? "Source ZIP" : "Static ZIP"}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
