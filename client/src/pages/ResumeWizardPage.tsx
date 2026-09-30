import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Download, ExternalLink, FileDown, FileText, Loader2, PenLine, Route } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { optimizationsApi } from "@/api/optimizations";
import { resumesApi } from "@/api/resumes";
import { DesignChoiceDialog } from "@/components/resumes/DesignChoiceDialog";
import { StepAnalysis, StepGenerate } from "@/components/wizard/WizardActionSteps";
import { StepJd, StepResume, StepTarget, type ExperienceLevel } from "@/components/wizard/WizardSteps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { exportResumePdf } from "@/utils/exportPdfClient";
import { exportResumeDocx } from "@/utils/exportDocx";
import { exportResumeJson } from "@/utils/exportJson";
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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Resume | null>(null);
  const [designOpen, setDesignOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const runAnalysis = async () => {
    if (!jd || !resume || analyzing) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await optimizationsApi.run(resume._id, jd._id);
      setAnalysis(result);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setAnalysisError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-run analysis when entering the analysis step with a resume + JD.
  useEffect(() => {
    if (step === ANALYSIS_STEP && resume && jd && !analysis && !analyzing && !analysisError) {
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resume, jd, analysis, analysisError]);

  const handleDownloadPdf = async (targetResume = generated) => {
    if (!targetResume) return;
    setDownloadingPdf(true);
    try {
      const title = targetResume.fileName.replace(/\.[^.]+$/, "");
      await exportResumePdf(
        targetResume.parsedData,
        targetResume.template,
        targetResume.fileName,
        title,
        targetResume._id,
      );
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async (targetResume = generated) => {
    if (!targetResume) return;
    setDownloadingDocx(true);
    try {
      const title = targetResume.fileName.replace(/\.[^.]+$/, "");
      await exportResumeDocx(
        targetResume.parsedData,
        targetResume.template,
        targetResume.fileName,
        title,
      );
      toast.success("DOCX downloaded successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadJson = (targetResume = generated) => {
    if (!targetResume) return;
    try {
      exportResumeJson(targetResume.parsedData, targetResume.fileName);
      toast.success("JSON downloaded successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const canNext = (): boolean => {
    if (step === 0) return true;
    if (step === 1) return hasResume !== null && (!hasResume || resume !== null);
    if (step === 2) return jd !== null;
    if (step === ANALYSIS_STEP) return !analyzing;
    if (step === GENERATE_STEP) return generated !== null;
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
    setGenerationError(null);
    try {
      const created = resume
        ? await resumesApi.generate(resume._id, jd._id)
        : await resumesApi.generateFromJd({ jdId: jd._id, targetTitle: targetTitle.trim(), experienceLevel });
      setGenerated(created);
      setDesignOpen(true);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setGenerationError(msg);
      toast.error(msg);
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
        {step === ANALYSIS_STEP && jd ? (
          <StepAnalysis
            resume={resume}
            jd={jd}
            analysis={analysis}
            analyzing={analyzing}
            onAnalyze={() => void runAnalysis()}
            error={analysisError}
          />
        ) : null}
        {step === GENERATE_STEP && jd ? (
          <StepGenerate
            resume={resume}
            jd={jd}
            targetTitle={targetTitle}
            experienceLevel={experienceLevel}
            generating={generating}
            onGenerate={() => void onGenerate()}
            error={generationError}
            generated={generated}
            onDownloadPdf={() => void handleDownloadPdf()}
            onDownloadDocx={() => void handleDownloadDocx()}
            downloadingPdf={downloadingPdf}
            downloadingDocx={downloadingDocx}
            onOpenEditor={() => generated && navigate(`/resumes/${generated._id}/edit`)}
            onPreview={() => generated && navigate(`/resumes/${generated._id}`)}
            onChangeTemplate={() => setDesignOpen(true)}
          />
        ) : null}
        {step > GENERATE_STEP ? (
          <div className="flex flex-col gap-6">
            {generated ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Download Your Generated Resume</h2>
                      <p className="text-sm text-muted-foreground">
                        {generated.fileName} · Template: {generated.template} · {generated.parsedData.skills.length} skills
                      </p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Ready to Download
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="default"
                      size="default"
                      disabled={downloadingPdf}
                      onClick={() => void handleDownloadPdf()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {downloadingPdf ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                      )}
                      Download PDF
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      disabled={downloadingDocx}
                      onClick={() => void handleDownloadDocx()}
                    >
                      {downloadingDocx ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <FileDown className="mr-2 h-4 w-4" aria-hidden />
                      )}
                      Download DOCX
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => void handleDownloadJson()}
                    >
                      <FileText className="mr-2 h-4 w-4" aria-hidden />
                      Download JSON
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="default"
                      onClick={() => navigate(`/resumes/${generated._id}/edit`)}
                    >
                      <PenLine className="mr-2 h-4 w-4" aria-hidden />
                      Open in Editor
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="default"
                      onClick={() => navigate(`/resumes/${generated._id}`)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                      Live Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                {step === 5
                  ? "Choose how your resume looks — or keep the original design."
                  : step === 6
                    ? "Fine-tune every section in the live editor."
                    : "Your AI-tailored resume is generated and ready to download or submit."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(generated ? `/resumes/${generated._id}/edit` : "/resumes")}
                >
                  {step === 5 || step === 6 ? "Open editor" : "Go to all resumes"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <footer className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={step === 0 || analyzing || generating}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={onNext} disabled={!canNext() || analyzing || generating}>
            Next
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </footer>

      {generated && designOpen ? (
        <DesignChoiceDialog
          resume={generated}
          onOpenChange={setDesignOpen}
          onDone={onDesignDone}
          onDownloadPdf={() => void handleDownloadPdf()}
          downloadingPdf={downloadingPdf}
        />
      ) : null}
    </div>
  );
}
