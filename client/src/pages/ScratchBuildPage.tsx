import { useState } from "react";
import { useNavigate } from "react-router";
import { FilePlus2, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeTemplate } from "@/types";

/** Scratch Builder — choose a template, create a blank resume, and fill in details in the editor. */
export default function ScratchBuildPage() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const resume = await resumesApi.createBlank(template);
      toast.success("Blank resume ready — customize your details in the editor");
      navigate(`/resumes/${resume._id}/edit`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <FilePlus2 className="h-7 w-7 text-primary" aria-hidden />
          Scratch Builder
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Start a fresh resume from scratch — select a template and customize your details directly in the editor.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Step 1 — Choose a Template</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <TemplatePicker value={template} onChange={setTemplate} />

          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              Your <strong>name, target role, contact info, and links</strong> will be automatically prefilled from your profile.
            </p>
          </div>

          <Button onClick={handleCreate} disabled={creating} className="w-fit">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FilePlus2 className="h-4 w-4" aria-hidden />}
            {creating ? "Creating…" : "Create blank resume"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
