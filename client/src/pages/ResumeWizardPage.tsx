import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Route } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { optimizationsApi } from "@/api/optimizations";
import { resumesApi } from "@/api/resumes";
import { DesignChoiceDialog } from "@/components/resumes/DesignChoiceDialog";
import { StepAnalysis, StepGenerate } from "@/components/wizard/WizardActionSteps";
import { StepJd, StepResume, StepTarget, type ExperienceLevel } from "@/components/wizard/WizardSteps";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { JobDescription, Optimization, Resume } from "@/types";

const STEPS = ["Target", "Resume", "Job Description", "Analysis", "Generate", "Template", "Edit", "Export"];
const ANALYSIS_STEP = 3;
const GENERATE_STEP = 4;

export default function ResumeWizardPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [targetTitle, setTargetTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("fresher");
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [analysis, setAnalysis] = useState<Optimization | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Resume | null>(null);
  const [designOpen, setDesignOpen] = useState(false);

  const runAnalysis = async () => {
    if (!jd || !resume || analyzing) return;
    setAnalyzing(true);
    try {
      const result = await optimizationsApi.run(resume._id, jd._id);
      setAnalysis(result);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-run analysis when entering the analysis step with a resume + JD.
  useEffect(() => {
    if (step === ANALYSIS_STEP && resume && jd && !analysis && !analyzing) {
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resume, jd, analysis]);

  const canNext = (): boolean => {
    if (step === 0) return true;
    if (step === 1) return hasResume !== null && (!hasResume || resume !== null);
    if (step === 2) return jd !== null;
    if (step === ANALYSIS_STEP) return true;
    return true;
  };

  const onNext = () => {
    if (!canNext()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const onBack = () => setStep((current) => Math.max(current - 1, 0));

  const onGenerate = async () => {
    if (!jd || generating) return;
    setGenerating(true);
    try {
      const created = resume
        ? await resumesApi.generate(resume._id, jd._id)
        : await resumesApi.generateFromJd({ jdId: jd._id, targetTitle: targetTitle.trim(), experienceLevel });
      setGenerated(created);
      setDesignOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  const onDesignDone = () => {
    setDesignOpen(false);
    const created = generated;
    if (!created) return;
    toast.success("Resume ready — review and edit it now");
    navigate(`/resumes/${created._id}/edit`, { replace: true });
  };

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Route className="h-6 w-6" aria-hidden />
        </span>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">AI Resume Wizard</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
      </header>

      {/* Stepper — full on desktop, progress bar on mobile */}
      <nav aria-label="Wizard steps" className="flex flex-col gap-2">
        <ol className="hidden items-center gap-1 sm:flex">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <li key={label} className="flex flex-1 items-center gap-1">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary/15 text-primary ring-1 ring-primary",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                </span>
                <span className={cn("truncate text-xs", active ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
                {index < STEPS.length - 1 ? <span className="h-px flex-1 bg-border" aria-hidden /> : null}
              </li>
            );
          })}
        </ol>
        <div className="sm:hidden">
          <Progress value={progressPercent} aria-label={`Step ${step + 1} of ${STEPS.length}`} />
        </div>
      </nav>

      <section className="flex flex-col gap-6" aria-live="polite">
        {step === 0 ? (
          <StepTarget
            targetTitle={targetTitle}
            setTargetTitle={setTargetTitle}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
          />
        ) : null}
        {step === 1 ? <StepResume hasResume={hasResume} setHasResume={setHasResume} resume={resume} setResume={setResume} /> : null}
        {step === 2 ? <StepJd jd={jd} setJd={setJd} /> : null}
        {step === ANALYSIS_STEP && jd ? <StepAnalysis resume={resume} jd={jd} analysis={analysis} analyzing={analyzing} onAnalyze={() => void runAnalysis()} /> : null}
        {step === GENERATE_STEP && jd ? (
          <StepGenerate
            resume={resume}
            jd={jd}
            targetTitle={targetTitle}
            experienceLevel={experienceLevel}
            generating={generating}
            onGenerate={() => void onGenerate()}
          />
        ) : null}
        {step > GENERATE_STEP ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {step === 5
                ? "Choose how your resume looks — or keep the original design."
                : step === 6
                  ? "Fine-tune every section in the live editor."
                  : "Export to PDF, DOCX or JSON when you are done."}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(generated ? `/resumes/${generated._id}/edit` : "/resumes")}
            >
              {step === 5 || step === 6 ? "Open editor" : "Go to resumes"}
            </Button>
          </div>
        ) : null}
      </section>

      {step < GENERATE_STEP ? (
        <footer className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onBack} disabled={step === 0}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            Back
          </Button>
          <Button type="button" onClick={onNext} disabled={!canNext()}>
            Next
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </footer>
      ) : null}

      {generated && designOpen ? (
        <DesignChoiceDialog resume={generated} onOpenChange={setDesignOpen} onDone={onDesignDone} />
      ) : null}
    </div>
  );
}
