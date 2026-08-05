import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Gauge, Lightbulb, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { optimizationsApi } from "@/api/optimizations";
import { resumesApi } from "@/api/resumes";
import { DesignChoiceDialog } from "@/components/resumes/DesignChoiceDialog";
import { ScoreRing } from "@/components/resumes/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Optimization, OptimizationResult, Resume } from "@/types";

function ResultCard({ optimization }: { optimization: Optimization }) {
  const result: OptimizationResult = optimization.result;
  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        <ScoreRing score={result.atsScore} />
        <p className="text-center text-xs text-muted-foreground">ATS score</p>
      </div>

      <div className="flex flex-col gap-6">
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
              <span className="w-12 text-right text-xs text-muted-foreground">{result.keywordDensity}%</span>
            </div>
          ) : null}
          {result.summary ? <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p> : null}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Missing skills
          </h3>
          {result.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((skill) => (
                <Badge key={skill} variant="destructive">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              No missing skills detected — great coverage!
            </p>
          )}
        </section>

        {result.changes.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
              Suggested additions
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.changes.map((change, index) => (
                <li key={`${change.value}-${index}`} className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-emerald-300 bg-white/70 text-[10px] uppercase tracking-wide text-emerald-700">
                      {change.type.replace(/-/g, " ")}
                    </Badge>
                    <span className="text-sm font-medium text-emerald-900">{change.value}</span>
                  </div>
                  {change.reason ? <p className="mt-0.5 text-xs text-emerald-700/70">{change.reason}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.matchedSkills.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Matched skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((skill) => (
                <Badge key={skill} className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {result.weakBullets.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Weak bullets
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.weakBullets.map((bullet) => (
                <li key={bullet} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
                  “{bullet}”
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.grammarIssues.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Grammar issues
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.grammarIssues.map((issue) => (
                <li key={issue} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-800">
                  {issue}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.formattingSuggestions.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-4 w-4" aria-hidden />
              Formatting suggestions
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.formattingSuggestions.map((suggestion) => (
                <li key={suggestion} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                  {suggestion}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.keywordSuggestions.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-4 w-4" aria-hidden />
              Keyword suggestions
            </h3>
            <ul className="flex flex-col gap-1.5">
              {result.keywordSuggestions.map((keyword) => (
                <li key={keyword} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                  {keyword}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default function OptimizeResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [optimization, setOptimization] = useState<Optimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    optimizationsApi
      .get(id)
      .then((data) => {
        if (!cancelled) setOptimization(data);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/optimize");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onDelete = async () => {
    if (!optimization) return;
    setDeleting(true);
    try {
      await optimizationsApi.remove(optimization._id);
      toast.success("Analysis deleted");
      navigate("/optimize");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDeleting(false);
    }
  };

  const onGenerate = async () => {
    if (!optimization) return;
    setGenerating(true);
    try {
      const generated = await resumesApi.generate(optimization.resumeId, optimization.jdId);
      setGeneratedResume(generated);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setGenerating(false);
    }
  };

  const onDesignDone = () => {
    const generated = generatedResume;
    setGeneratedResume(null);
    setGenerating(false);
    if (generated) {
      toast.success("Optimized resume generated");
      navigate(`/resumes/${generated._id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!optimization) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to="/optimize" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All analyses
          </Link>
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {optimization.resumeTitle}
            <span className="text-muted-foreground"> → </span>
            {optimization.jdTitle}
          </h1>
          {optimization.jdCompany ? (
            <p className="text-sm text-muted-foreground">{optimization.jdCompany}</p>
          ) : null}
        </div>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void onDelete()} disabled={deleting} aria-label="Delete analysis">
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
        </Button>
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Generate optimized resume
            </p>
            <p className="text-xs text-muted-foreground">
              AI rewrites your resume for this job description — companies, dates and facts stay untouched, only wording improves. Takes 30–120 seconds.
            </p>
          </div>
          <Button onClick={() => void onGenerate()} disabled={generating} className="shrink-0">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="mr-2 h-4 w-4" aria-hidden />}
            {generating ? "Generating…" : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analysis results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultCard optimization={optimization} />
        </CardContent>
      </Card>

      <DesignChoiceDialog resume={generatedResume} onOpenChange={(open) => !open && setGeneratedResume(null)} onDone={onDesignDone} />
    </div>
  );
}
