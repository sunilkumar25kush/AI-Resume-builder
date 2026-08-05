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

/** Scratch Builder — template choose karo, blank resume banao, editor mein details bharo. */
export default function ScratchBuildPage() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const resume = await resumesApi.createBlank(template);
      toast.success("Blank resume ready — ab details bharke khatam karo");
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
          Bina JD ke naye resume ki shuruaat — template chuno, blank resume bane, apne details editor mein bharo.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Step 1 — Template choose karo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <TemplatePicker value={template} onChange={setTemplate} />

          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              Aapka <strong>naam aur email</strong> account se prefill ho jayenge. Baaki sab (summary, skills, experience,
              projects) editor mein khud bharna hai — koi JD ya AI wait nahi.
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
