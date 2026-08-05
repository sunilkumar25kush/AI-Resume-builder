import { CheckCircle2, Gauge, Lightbulb, Loader2, RefreshCw, Sparkles, WandSparkles } from "lucide-react";

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
}: {
  resume: Resume | null;
  jd: JobDescription;
  analysis: Optimization | null;
  analyzing: boolean;
  onAnalyze: () => void;
}) {
  if (analyzing) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Running AI analysis">
        <Skeleton className="h-40 w-40 self-center rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!resume) return <JdInsights jd={jd} />;
  if (!analysis) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Run the AI analysis to compare your resume with the job description.</p>
        <Button type="button" onClick={onAnalyze}>
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          Run analysis
        </Button>
      </div>
    );
  }

  const result = analysis.result;
  return (
    <div className="flex flex-col gap-6">
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

      <Button type="button" variant="outline" size="sm" className="self-start" onClick={onAnalyze}>
        <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
        Re-run analysis
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
}: {
  resume: Resume | null;
  jd: JobDescription;
  targetTitle: string;
  experienceLevel: ExperienceLevel;
  generating: boolean;
  onGenerate: () => void;
}) {
  const levelLabel = experienceLevel === "fresher" ? "Fresher" : experienceLevel === "junior" ? "1-3 Years" : "Senior";
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

      <Button type="button" size="lg" onClick={onGenerate} disabled={generating} className="w-full sm:w-auto">
        {generating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <WandSparkles className="mr-1.5 h-4 w-4" aria-hidden />}
        {generating ? "Generating with AI…" : "Generate resume"}
      </Button>
    </div>
  );
}
