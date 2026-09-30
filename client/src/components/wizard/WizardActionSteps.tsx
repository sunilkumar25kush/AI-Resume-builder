import { AlertCircle, CheckCircle2, Download, ExternalLink, FileDown, Gauge, Lightbulb, Loader2, PenLine, RefreshCw, Sparkles, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/components/resumes/ScoreRing";
import type { JobDescription, Optimization, Resume } from "@/types";
import type { ExperienceLevel } from "@/components/wizard/WizardSteps";

function ChipGroup({ label, chips, tone }: { label: string; chips: string[]; tone: "default" | "green" | "red" }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Badge
            key={chip}
            variant={tone === "red" ? "destructive" : "secondary"}
            className={tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : undefined}
          >
            {chip}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/** JD-only insights (no resume to compare against) — honest JD breakdown. */
function JdInsights({ jd }: { jd: JobDescription }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Lightbulb className="h-4 w-4" aria-hidden />
          Job description insights
        </h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">Title: {jd.title || "—"}</Badge>
          {jd.experienceRequired ? <Badge variant="outline">Experience: {jd.experienceRequired}</Badge> : null}
          <Badge variant="outline">{jd.qualifications.length} qualifications</Badge>
          <Badge variant="outline">{jd.responsibilities.length} responsibilities</Badge>
        </div>
      </div>
      <ChipGroup label="Required skills" chips={jd.skills} tone="default" />
      <ChipGroup label="Preferred skills" chips={jd.preferredSkills} tone="default" />
      <ChipGroup label="ATS keywords" chips={jd.atsKeywords} tone="default" />
      <ChipGroup label="Soft skills" chips={jd.softSkills} tone="default" />
      <p className="text-sm text-muted-foreground">
        No resume uploaded — full ATS comparison will be available once you generate and edit your resume.
      </p>
    </div>
  );
}

/** Wizard Step 4 — AI analysis: full ATS comparison (resume) or JD insights. */
export function StepAnalysis({
  resume,
  jd,
  analysis,
  analyzing,
  onAnalyze,
  error,
}: {
  resume: Resume | null;
  jd: JobDescription;
  analysis: Optimization | null;
  analyzing: boolean;
  onAnalyze: () => void;
  error?: string | null;
}) {
  if (analyzing) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center" aria-busy="true" aria-label="Running AI analysis">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Analyzing resume against job description…</p>
          <p className="text-xs text-muted-foreground">Evaluating ATS keywords, skills match, and bullet impact (takes 15–45s)</p>
        </div>
        <Skeleton className="h-4 w-3/4 max-w-sm" />
        <Skeleton className="h-4 w-1/2 max-w-xs" />
      </div>
    );
  }

  if (!resume) return <JdInsights jd={jd} />;
  if (!analysis) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        {error ? (
          <div className="flex w-full max-w-md flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive" role="alert">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>Analysis failed</span>
            </div>
            <p className="text-xs text-destructive/90">{error}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Run the AI analysis to compare your resume with the job description.</p>
        )}
        <Button type="button" onClick={onAnalyze} disabled={analyzing}>
          {error ? <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden /> : <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />}
          {error ? "Retry analysis" : "Run analysis"}
        </Button>
      </div>
    );
  }

  const result = analysis.result;
  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left text-sm text-destructive" role="alert">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>Re-analysis failed</span>
          </div>
          <p className="text-xs text-destructive/90">{error}</p>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <ScoreRing score={result.atsScore} />
        <p className="text-xs text-muted-foreground">ATS score</p>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Gauge className="h-4 w-4" aria-hidden />
          Job match
        </h3>
        <div className="flex items-center gap-3">
          <Progress value={result.matchPercent} className="h-2.5 flex-1" aria-label={`${result.matchPercent}% match`} />
          <span className="w-12 text-right text-sm font-semibold">{result.matchPercent}%</span>
        </div>
        {result.keywordDensity > 0 ? (
          <div className="flex items-center gap-3">
            <Progress value={result.keywordDensity} className="h-2 flex-1" aria-label={`${result.keywordDensity}% keyword density`} />
            <span className="w-12 text-right text-xs text-muted-foreground">{result.keywordDensity}% density</span>
          </div>
        ) : null}
        {result.summary ? <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p> : null}
      </section>

      <ChipGroup label="Missing skills" chips={result.missingSkills} tone="red" />
      <ChipGroup label="Matched skills" chips={result.matchedSkills} tone="green" />
      {result.missingSkills.length === 0 && result.matchedSkills.length > 0 ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
          No missing skills detected — great coverage!
        </p>
      ) : null}

      <Button
        type="button"
        variant={error ? "destructive" : "outline"}
        size="sm"
        className="self-start"
        onClick={onAnalyze}
        disabled={analyzing}
      >
        <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
        {error ? "Retry re-analysis" : "Re-run analysis"}
      </Button>
    </div>
  );
}

/** Wizard Step 5 — generate the resume from everything collected. */
export function StepGenerate({
  resume,
  jd,
  targetTitle,
  experienceLevel,
  generating,
  onGenerate,
  error,
  generated,
  onDownloadPdf,
  onDownloadDocx,
  downloadingPdf,
  downloadingDocx,
  onOpenEditor,
  onPreview,
  onChangeTemplate,
}: {
  resume: Resume | null;
  jd: JobDescription;
  targetTitle: string;
  experienceLevel: ExperienceLevel;
  generating: boolean;
  onGenerate: () => void;
  error?: string | null;
  generated?: Resume | null;
  onDownloadPdf?: () => void;
  onDownloadDocx?: () => void;
  downloadingPdf?: boolean;
  downloadingDocx?: boolean;
  onOpenEditor?: () => void;
  onPreview?: () => void;
  onChangeTemplate?: () => void;
}) {
  const levelLabel = experienceLevel === "fresher" ? "Fresher" : experienceLevel === "junior" ? "1-3 Years" : "Senior";

  if (generated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground">AI Resume Ready!</h3>
                <p className="text-xs text-muted-foreground">
                  Optimized for {targetTitle || jd.title || "your target role"} · {generated.parsedData.skills.length} skills included
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 capitalize">
              Template: {generated.template}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {onDownloadPdf ? (
              <Button
                type="button"
                variant="default"
                size="default"
                disabled={downloadingPdf}
                onClick={onDownloadPdf}
                className="bg-primary hover:bg-primary/90"
              >
                {downloadingPdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="mr-2 h-4 w-4" aria-hidden />
                )}
                Download PDF
              </Button>
            ) : null}

            {onDownloadDocx ? (
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={downloadingDocx}
                onClick={onDownloadDocx}
              >
                {downloadingDocx ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" aria-hidden />
                )}
                Download DOCX
              </Button>
            ) : null}

            {onOpenEditor ? (
              <Button type="button" variant="secondary" size="default" onClick={onOpenEditor}>
                <PenLine className="mr-2 h-4 w-4" aria-hidden />
                Open in Editor
              </Button>
            ) : null}

            {onPreview ? (
              <Button type="button" variant="ghost" size="default" onClick={onPreview}>
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                Live Preview
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">File Name</p>
                <p className="text-sm text-muted-foreground">{generated.fileName}</p>
              </div>
              <Badge variant="secondary">{levelLabel}</Badge>
            </div>
            <div className="flex items-start justify-between gap-4 border-t pt-3">
              <div>
                <p className="text-sm font-semibold">Matched Job</p>
                <p className="text-sm text-muted-foreground">
                  {jd.title || jd.fileName || "JD"} · {jd.skills.length} required skills
                </p>
              </div>
              <Badge variant="outline">{resume ? "Optimized existing" : "Built fresh"}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Want to pick another visual theme or tweak parameters?
          </p>
          <div className="flex items-center gap-2">
            {onChangeTemplate ? (
              <Button type="button" variant="outline" size="sm" onClick={onChangeTemplate}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Change Template
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" onClick={onGenerate} disabled={generating}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Target role</p>
              <p className="text-sm text-muted-foreground">{targetTitle || jd.title || "Inferred from job description"}</p>
            </div>
            <Badge variant="secondary">{levelLabel}</Badge>
          </div>
          <div className="flex items-start justify-between gap-4 border-t pt-3">
            <div>
              <p className="text-sm font-semibold">Job description</p>
              <p className="text-sm text-muted-foreground">
                {jd.title || jd.fileName || "JD"} · {jd.skills.length} skills
              </p>
            </div>
            <Badge variant="outline">{resume ? "Optimize existing" : "Build fresh"}</Badge>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {resume
          ? "The AI will rewrite your summary, strengthen experience and project bullets, and weave in the JD's ATS keywords — while keeping every company, title, date and fact exactly as they are."
          : "The AI will write a professional summary, pick skills from the job description, and suggest portfolio projects. It will never invent companies, experience, degrees or achievements — you add those in the editor."}
      </p>

      {error ? (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>Resume generation failed</span>
          </div>
          <p className="text-xs text-destructive/90">{error}</p>
        </div>
      ) : null}

      <Button type="button" size="lg" onClick={onGenerate} disabled={generating} className="w-full sm:w-auto">
        {generating ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
        ) : error ? (
          <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
        ) : (
          <WandSparkles className="mr-1.5 h-4 w-4" aria-hidden />
        )}
        {generating ? "Generating with AI…" : error ? "Retry generation" : "Generate resume"}
      </Button>
    </div>
  );
}
