import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, FileSearch, FileText, Gauge, Loader2, Sparkles, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";

import { atsApi, type AtsReport } from "@/api/ats";
import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { ScoreRing } from "@/components/resumes/ScoreRing";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useJdsStore } from "@/stores/jds";
import type { Resume } from "@/types";

type ResumeMode = "saved" | "upload";
type JdMode = "saved" | "paste";

/** ATS Checker — upload or select a resume for an instant, deterministic score and checklist. */
export default function AtsCheckPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeMode, setResumeMode] = useState<ResumeMode>("saved");
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
      const list = await resumesApi.list();
      setResumes(list);
      if (list.length === 0) {
        setResumeMode("upload");
      }
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

  const canCheck = Boolean(selectedResumeId) && (jdMode === "saved" || jdText.trim().length >= 20);

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
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
          Analyze any resume for ATS compatibility — instant ATS score, structural checklist, and optional job description match. Fully deterministic with zero wait time.
        </p>
      </section>

      {/* Symmetrical 2-Column Suite */}
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {/* Step 1 Card — Resume Source */}
        <Card className="flex flex-col justify-between h-full border border-border/80 shadow-xs">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Step 1 — Choose Resume</CardTitle>
                <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30">
                  Required
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Select an existing parsed resume from your account or upload a new file
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* Tab Switcher */}
              <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Resume source">
                <button
                  type="button"
                  role="tab"
                  aria-selected={resumeMode === "saved"}
                  onClick={() => setResumeMode("saved")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    resumeMode === "saved"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Saved Resume ({resumes.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={resumeMode === "upload"}
                  onClick={() => setResumeMode("upload")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    resumeMode === "upload"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {resumeMode === "saved" ? (
                <div className="flex flex-col gap-3 min-h-[170px] justify-between">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="resume-select" className="text-xs font-medium">
                      Select from your resumes
                    </Label>
                    <select
                      id="resume-select"
                      value={selectedResumeId}
                      onChange={(event) => {
                        setSelectedResumeId(event.target.value);
                        setReport(null);
                      }}
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 truncate"
                    >
                      <option value="">Choose a resume…</option>
                      {resumes.map((resume) => (
                        <option key={resume._id} value={resume._id}>
                          {resume.parsedData?.name || resume.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedResume ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-semibold text-foreground truncate block">
                          {selectedResume.parsedData?.name || selectedResume.fileName}
                        </span>
                        <span className="text-muted-foreground text-[11px] truncate block">
                          Ready for ATS analysis
                        </span>
                      </div>
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground space-y-2">
                      <p>No saved resumes found in your account.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setResumeMode("upload")}
                        className="text-xs gap-1"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        Upload a Resume
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Pick a resume from the dropdown above to scan its structure and keywords.
                    </p>
                  )}
                </div>
              ) : (
                <div className="min-h-[170px]">
                  <UploadDropzone
                    uploading={uploading}
                    progress={progress}
                    onFile={handleFile}
                    ariaLabel="Upload resume to check"
                  />
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Step 2 Card — Job Description */}
        <Card className="flex flex-col justify-between h-full border border-border/80 shadow-xs">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Step 2 — Job Description</CardTitle>
                <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
                  Optional
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Target a specific role to calculate keyword match %, or analyze structure only
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* Tab Switcher */}
              <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="JD source">
                <button
                  type="button"
                  role="tab"
                  aria-selected={jdMode === "saved"}
                  onClick={() => setJdMode("saved")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    jdMode === "saved"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Saved JD ({jds.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={jdMode === "paste"}
                  onClick={() => setJdMode("paste")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    jdMode === "paste"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Paste JD Text</span>
                </button>
              </div>

              {jdMode === "saved" ? (
                <div className="flex flex-col gap-3 min-h-[170px] justify-between">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="jd-select" className="text-xs font-medium">
                      Target role / parsed JD
                    </Label>
                    <select
                      id="jd-select"
                      value={jdId}
                      onChange={(event) => setJdId(event.target.value)}
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 truncate"
                    >
                      <option value="">Structure & ATS best practices only (no JD match)</option>
                      {jds.map((jd) => (
                        <option key={jd._id} value={jd._id}>
                          {jd.title || jd.company || jd.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {jdId
                      ? "ATS Checker will evaluate both overall formatting and keyword overlap with this JD."
                      : "Selecting no JD will evaluate general formatting, section balance, action verbs, and contact info."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 min-h-[170px]">
                  <Label htmlFor="jd-text" className="text-xs font-medium">
                    Job Description Content
                  </Label>
                  <textarea
                    id="jd-text"
                    value={jdText}
                    onChange={(event) => setJdText(event.target.value)}
                    rows={5}
                    placeholder="Paste job description text here (minimum 20 characters)…"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{jdText.trim().length >= 20 ? "Ready for keyword extraction" : "Minimum 20 characters required"}</span>
                    <span>{jdText.length} chars</span>
                  </div>
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <Button
              onClick={handleCheck}
              disabled={!canCheck || checking}
              className="w-full gap-2 text-sm font-semibold shadow-xs"
              size="default"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Scanning ATS compatibility…
                </>
              ) : (
                <>
                  <Gauge className="h-4 w-4" aria-hidden />
                  Check ATS Score
                </>
              )}
            </Button>
          </div>
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
            {(report.missingSkills?.length ?? 0) > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Missing Skills (from Job Description)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {report.missingSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300">
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
                      <span className={item.ok ? "text-sm font-medium" : "text-sm font-medium text-amber-700 dark:text-amber-400"}>{item.label}</span>
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
