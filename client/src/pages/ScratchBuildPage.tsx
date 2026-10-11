import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, FilePlus2, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeTemplate } from "@/types";

/** Scratch Builder — choose an executive template and create a clean draft. */
export default function ScratchBuildPage() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const resume = await resumesApi.createBlank(template);
      toast.success("Blank resume initialized — open in the editor");
      navigate(`/resumes/${resume._id}/edit`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <section className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          <FilePlus2 className="h-7 w-7 text-primary" aria-hidden />
          Scratch Builder
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          Start with a clean slate. Select an executive typographical template, and your verified profile details
          (full name, target role, contact info, and portfolio links) will automatically pre-populate the header.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Choose an Executive Template</CardTitle>
          <CardDescription>
            Each layout is designed to strictly adhere to standard A4 printing bounds with verified ATS font hierarchies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <TemplatePicker value={template} onChange={setTemplate} />

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your <strong className="text-foreground">full name, target job role, contact details, and web links</strong> will be automatically imported from your profile vault. You can customize, reorder, or toggle sections at any time.
            </p>
          </div>

          <Button onClick={handleCreate} disabled={creating} size="lg" className="w-fit gap-2 font-semibold">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FilePlus2 className="h-4 w-4" aria-hidden />}
            {creating ? "Initializing Draft…" : "Create & Open in Editor"}
            {!creating && <ArrowRight className="h-4 w-4 ml-1" aria-hidden />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
