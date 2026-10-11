import { useEffect, useState } from "react";
import { Check, Download, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTemplate } from "@/templates/resumeTemplates";
import type { Resume, ResumeTemplate } from "@/types";

interface DesignChoiceDialogProps {
  resume: Resume | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
  onDownloadPdf?: () => void;
  downloadingPdf?: boolean;
}

/**
 * Post-generation design choice dialog ("Keep Existing Design" vs "Choose a New Design").
 * Choosing a template PATCHes it onto the generated resume; "keep" leaves the original template.
 */
export function DesignChoiceDialog({
  resume,
  onOpenChange,
  onDone,
  onDownloadPdf,
  downloadingPdf,
}: DesignChoiceDialogProps) {
  const currentTemplate = (resume?.template as ResumeTemplate) || "classic-rose-serif";
  const [selected, setSelected] = useState<ResumeTemplate>(currentTemplate);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (resume?.template) {
      setSelected(resume.template as ResumeTemplate);
    }
  }, [resume?.template]);

  const apply = async (template: ResumeTemplate | null) => {
    if (!resume || applying) return;
    setApplying(true);
    try {
      if (template && template !== resume.template) {
        await resumesApi.update(resume._id, { template });
      }
      onDone();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setApplying(false);
    }
  };

  const currentDef = resume ? getTemplate(resume.template) : null;
  const selectedDef = getTemplate(selected);

  return (
    <Dialog
      open={resume !== null}
      onOpenChange={(open) => !open && !applying && onOpenChange(false)}
    >
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border bg-card">
        {/* Sticky Dialog Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm shrink-0 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Palette className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Optimized resume ready
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Your resume was rewritten for the job — facts untouched, wording improved. Choose your design:
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Option 1: Keep existing layout */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all hover:bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Option 1
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    Keep existing design
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preserves original layout ({currentDef?.name || "Current layout"}) — content updates only.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void apply(null)}
                  disabled={applying}
                  className="font-medium"
                >
                  {applying ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  )}
                  Open in Editor
                </Button>
                {onDownloadPdf ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onDownloadPdf}
                    disabled={downloadingPdf || applying}
                    className="font-medium"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    )}
                    Download PDF
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Option 2: Choose a new layout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Option 2
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    Choose a new design
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick from 10 professionally formatted templates to re-render your resume.
                </p>
              </div>
              {selectedDef && (
                <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border">
                  Selected: <strong className="text-foreground font-semibold">{selectedDef.name}</strong>
                </div>
              )}
            </div>

            <TemplatePicker value={selected} onChange={setSelected} />
          </div>
        </div>

        {/* Sticky Dialog Footer — Always visible and accessible */}
        <div className="border-t bg-background/95 backdrop-blur-sm px-6 py-3.5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            Selected style: <span className="font-semibold text-foreground">{selectedDef?.name || "Standard"}</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void apply(null)}
              disabled={applying}
              className="text-xs"
            >
              Keep Original &amp; Open
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => void apply(selected)}
              disabled={applying}
              className="shadow-sm font-semibold px-4"
            >
              {applying ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Check className="mr-1.5 h-4 w-4" aria-hidden />
              )}
              Apply design &amp; open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
