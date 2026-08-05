import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, FileSearch, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { atsApi, type AtsReport } from "@/api/ats";
import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { ScoreRing } from "@/components/resumes/ScoreRing";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useJdsStore } from "@/stores/jds";
import type { Resume } from "@/types";

type JdMode = "saved" | "paste";

/** ATS Checker — upload karo, instant score lo. Sab deterministic, AI call nahi. */
export default function AtsCheckPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [jdMode, setJdMode] = useState<JdMode>("saved");
  const [jdId, setJdId] = useState("");
  const [jdText, setJdText] = useState("");
  const [report, setReport] = useState<AtsReport | null>(null);
  const [checking, setChecking] = useState(false);

  const jds = useJdsStore((state) => state.items);
  const fetchJds = useJdsStore((state) => state.fetch);

  const loadResumes = useCallback(async () => {
    try {
      setResumes(await resumesApi.list());
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    void loadResumes();
    void fetchJds();
  }, [loadResumes, fetchJds]);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedResumeId) ?? null,
    [resumes, selectedResumeId],
  );

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setReport(null);
    try {
      const resume = await resumesApi.upload(file, setProgress);
      setSelectedResumeId(resume._id);
      await loadResumes();
      const auto = await atsApi.check({ resumeId: resume._id });
      setReport(auto);
      toast.success("Resume parsed — ATS score ready");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const canCheck = Boolean(selectedResumeId) && (jdMode === "saved" ? !jdId : jdText.trim().length >= 20);

  const handleCheck = async () => {
    if (!selectedResumeId) return;
    setChecking(true);
    try {
      const result = await atsApi.check({
        resumeId: selectedResumeId,
        jdId: jdMode === "saved" ? jdId || undefined : undefined,
        jdText: jdMode === "paste" ? jdText.trim() : undefined,
      });
      setReport(result);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <FileSearch className="h-7 w-7 text-primary" aria-hidden />
          ATS Checker
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Koi bhi resume check karo — instant ATS score, checklist aur (optional) job match. Sab deterministic, koi AI
          wait nahi.
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Resume</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {resumes.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="resume-select">Saved resume</Label>
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(event) => {
                    setSelectedResumeId(event.target.value);
                    setReport(null);
                  }}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Select a resume…</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.parsedData?.name || resume.fileName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <UploadDropzone uploading={uploading} progress={progress} onFile={handleFile} ariaLabel="Upload resume to check" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Job Description (optional)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2" role="tablist" aria-label="JD source">
              {(["saved", "paste"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={jdMode === mode}
                  onClick={() => setJdMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    jdMode === mode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {mode === "saved" ? "Saved JD" : "Paste JD"}
                </button>
              ))}
            </div>

            {jdMode === "saved" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="jd-select">Choose a parsed JD</Label>
                <select
                  id="jd-select"
                  value={jdId}
                  onChange={(event) => setJdId(event.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Bina JD ke sirf structure score</option>
                  {jds.map((jd) => (
                    <option key={jd._id} value={jd._id}>
                      {jd.title || jd.company || jd.fileName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="jd-text">Paste JD text (min 20 chars)</Label>
                <textarea
                  id="jd-text"
                  value={jdText}
                  onChange={(event) => setJdText(event.target.value)}
                  rows={5}
                  placeholder="Job description paste karo…"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <Button onClick={handleCheck} disabled={!canCheck || checking}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {checking ? "Checking…" : "Check ATS score"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {report ? (
        <section className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={report.atsScore} />
            <p className="text-center text-xs text-muted-foreground">Overall ATS score</p>
            <p className="text-center text-xs text-muted-foreground">
              Structure: {report.structureScore} · Words: {report.totalWords}
              {report.matchPercent !== null ? ` · JD match: ${report.matchPercent}%` : ""}
            </p>
            {selectedResume ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/resumes/${selectedResume._id}/edit`}>Edit this resume</Link>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            {report.missingSkills.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Missing skills (JD se)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {report.missingSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      {skill}
                    </span>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Checklist</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {report.checklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    {item.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className={item.ok ? "text-sm font-medium" : "text-sm font-medium text-amber-700"}>{item.label}</span>
                      {!item.ok ? <span className="text-xs text-muted-foreground">{item.hint}</span> : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}
    </div>
  );
}
