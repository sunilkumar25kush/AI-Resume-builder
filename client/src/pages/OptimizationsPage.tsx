import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Gauge, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { optimizationsApi } from "@/api/optimizations";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useJdsStore } from "@/stores/jds";
import { useOptimizationsStore } from "@/stores/optimizations";
import { useResumesStore } from "@/stores/resumes";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export default function OptimizationsPage() {
  const navigate = useNavigate();
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);
  const jds = useJdsStore((state) => state.items);
  const fetchJds = useJdsStore((state) => state.fetch);
  const { items, loading, fetch, prepend, remove } = useOptimizationsStore();

  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    void fetchResumes();
    void fetchJds();
    void fetch();
  }, [fetchResumes, fetchJds, fetch]);

  const canRun = useMemo(() => Boolean(resumeId && jdId && !running), [resumeId, jdId, running]);

  const onRun = async () => {
    if (!canRun) return;
    setRunning(true);
    try {
      const optimization = await optimizationsApi.run(resumeId, jdId);
      prepend(optimization);
      toast.success("Analysis complete");
      navigate(`/optimize/${optimization._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRunning(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success("Analysis deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Optimizer</h1>
        <p className="text-sm text-muted-foreground">Compare a resume against a job description — ATS score, match %, missing skills</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Run new analysis
          </CardTitle>
          <CardDescription>Pick one of your resumes and one job description</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="resume-select">Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger id="resume-select" aria-label="Select resume">
                  <SelectValue placeholder="Choose a resume…" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume._id} value={resume._id}>
                      {resume.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jd-select">Job description</Label>
              <Select value={jdId} onValueChange={setJdId}>
                <SelectTrigger id="jd-select" aria-label="Select job description">
                  <SelectValue placeholder="Choose a JD…" />
                </SelectTrigger>
                <SelectContent>
                  {jds.map((jd) => (
                    <SelectItem key={jd._id} value={jd._id}>
                      {jd.title || jd.fileName || "Untitled role"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {running ? "AI is reviewing — this can take 30–120 seconds…" : "Powered by Google Gemini"}
            </p>
            <Button onClick={() => void onRun()} disabled={!canRun}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Gauge className="mr-2 h-4 w-4" aria-hidden />}
              {running ? "Analyzing…" : "Run analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">History ({items.length})</h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Gauge} title="No analyses yet" description="Run your first resume-vs-JD comparison above." />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item._id}>
                <Card className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
                  <div className={`w-14 shrink-0 text-center text-2xl font-bold ${scoreTone(item.result.atsScore)}`}>
                    {item.result.atsScore}
                    <span className="block text-[10px] font-normal uppercase tracking-wide text-muted-foreground">ATS</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-1 text-left"
                      onClick={() => navigate(`/optimize/${item._id}`)}
                      aria-label={`Open analysis for ${item.resumeTitle}`}
                    >
                      <span className="w-full truncate font-medium">
                        {item.resumeTitle} → {item.jdTitle}
                      </span>
                      <span className="w-full text-xs text-muted-foreground">
                        {formatDate(item.createdAt)} · {item.result.matchPercent}% match
                      </span>
                      <Progress value={item.result.matchPercent} className="h-1.5 w-full" aria-label={`${item.result.matchPercent}% match`} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground opacity-60 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => void onDelete(item._id)}
                    aria-label="Delete analysis"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
