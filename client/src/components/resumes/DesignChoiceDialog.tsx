import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTemplate } from "@/templates/resumeTemplates";
import type { Resume, ResumeTemplate } from "@/types";

interface DesignChoiceDialogProps {
  resume: Resume | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/**
 * Post-generation design choice (spec: "Keep Existing Design" vs
 * "Generate New Design"). Choosing a template PATCHes it onto the
 * generated resume; "keep" leaves the inherited template.
 */
export function DesignChoiceDialog({ resume, onOpenChange, onDone }: DesignChoiceDialogProps) {
  const [selected, setSelected] = useState<ResumeTemplate | null>(null);
  const [applying, setApplying] = useState(false);

  const apply = async (template: ResumeTemplate | null) => {
    if (!resume) return;
    setApplying(true);
    try {
      if (template && template !== resume.template) {
        await resumesApi.update(resume._id, { template });
      }
      onDone();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setApplying(false);
    }
  };

  return (
    <Dialog open={resume !== null} onOpenChange={(open) => !open && !applying && onOpenChange(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            Optimized resume ready
          </DialogTitle>
          <DialogDescription>
            Your resume was rewritten for the job — facts untouched, wording improved. Choose a design:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Option 1 — Keep existing design</p>
            <p className="text-xs text-muted-foreground">
              Preserves the original layout ({resume ? getTemplate(resume.template).name : ""}) — content only.
            </p>
            <Button variant="outline" className="self-start" onClick={() => void apply(null)} disabled={applying}>
              {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Check className="mr-2 h-4 w-4" aria-hidden />}
              Open with current design
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Option 2 — Choose a new design</p>
            <TemplatePicker value={selected ?? "classic"} onChange={setSelected} />
            <div className="flex justify-end">
              <Button onClick={() => void apply(selected)} disabled={applying || selected === null}>
                {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="mr-2 h-4 w-4" aria-hidden />}
                Apply design &amp; open
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
