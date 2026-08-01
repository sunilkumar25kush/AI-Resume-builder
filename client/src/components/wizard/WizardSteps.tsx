import { useState } from "react";
import { CheckCircle2, ClipboardList, FileText, Loader2, ScanSearch, X } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { jdsApi } from "@/api/jds";
import { resumesApi } from "@/api/resumes";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { JobDescription, Resume } from "@/types";

export type ExperienceLevel = "fresher" | "junior" | "senior";

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: "fresher", label: "Fresher", hint: "0 years — campus / first job" },
  { value: "junior", label: "1-3 Years", hint: "Early career" },
  { value: "senior", label: "Senior", hint: "5+ years — leadership" },
];

/** Wizard Step 1 — target job title + experience level. */
export function StepTarget({
  targetTitle,
  setTargetTitle,
  experienceLevel,
  setExperienceLevel,
}: {
  targetTitle: string;
  setTargetTitle: (value: string) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (value: ExperienceLevel) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="wizard-title" className="text-sm font-medium">
          Target job title
        </label>
        <Input
          id="wizard-title"
          value={targetTitle}
          onChange={(event) => setTargetTitle(event.target.value)}
          placeholder="e.g. Frontend React Developer"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">Used to tailor the summary and file name. Leave empty to infer from the job description.</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Experience level</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              aria-pressed={experienceLevel === level.value}
              onClick={() => setExperienceLevel(level.value)}
              className={cn(
                "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors",
                experienceLevel === level.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="font-semibold">{level.label}</span>
              <span className="text-xs text-muted-foreground">{level.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Wizard Step 2 — existing resume? Yes → upload; No → fresher path. */
export function StepResume({
  hasResume,
  setHasResume,
  resume,
  setResume,
}: {
  hasResume: boolean | null;
  setHasResume: (value: boolean | null) => void;
  resume: Resume | null;
  setResume: (value: Resume | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const onFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await resumesApi.upload(file, setProgress);
      setResume(uploaded);
      toast.success("Resume uploaded and parsed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={hasResume === true}
          onClick={() => setHasResume(true)}
          className={cn(
            "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors",
            hasResume === true ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50",
          )}
        >
          <span className="font-semibold">Yes, I have a resume</span>
          <span className="text-xs text-muted-foreground">Upload it — AI optimizes it against the job description</span>
        </button>
        <button
          type="button"
          aria-pressed={hasResume === false}
          onClick={() => setHasResume(false)}
          className={cn(
            "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors",
            hasResume === false ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50",
          )}
        >
          <span className="font-semibold">No, start fresh</span>
          <span className="text-xs text-muted-foreground">AI builds a fresher-friendly resume from the job description</span>
        </button>
      </div>

      {hasResume === true ? (
        resume ? (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{resume.fileName}</p>
                <p className="text-xs text-muted-foreground">Parsed — {resume.parsedData.skills.length} skills extracted</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove resume" onClick={() => setResume(null)}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <UploadDropzone
            uploading={uploading}
            progress={progress}
            onFile={(file) => void onFile(file)}
            copyTitle="Drag & drop your existing resume"
            copyHint="or click to browse — PDF or DOCX, up to 10 MB"
            ariaLabel="Upload existing resume"
          />
        )
      ) : null}
    </div>
  );
}

/** Wizard Step 3 — job description: paste text or upload PDF/DOCX/TXT. */
export function StepJd({
  jd,
  setJd,
}: {
  jd: JobDescription | null;
  setJd: (value: JobDescription | null) => void;
}) {
  const [tab, setTab] = useState("paste");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const onPaste = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const parsed = await jdsApi.createFromText(text);
      setJd(parsed);
      toast.success("Job description parsed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File) => {
    setBusy(true);
    setProgress(0);
    try {
      const parsed = await jdsApi.uploadFile(file, setProgress);
      setJd(parsed);
      toast.success("Job description uploaded and parsed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  if (jd) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex items-center gap-3 p-4">
          <ScanSearch className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{jd.title || jd.fileName || "Job description"}</p>
            <p className="text-xs text-muted-foreground">
              {jd.skills.length} skills · {jd.responsibilities.length} responsibilities · {jd.atsKeywords.length} ATS keywords
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove job description" onClick={() => setJd(null)}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="paste">
          <ClipboardList className="mr-1.5 h-4 w-4" aria-hidden />
          Paste text
        </TabsTrigger>
        <TabsTrigger value="upload">
          <FileText className="mr-1.5 h-4 w-4" aria-hidden />
          Upload file
        </TabsTrigger>
      </TabsList>

      <TabsContent value="paste" className="flex flex-col gap-3">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste the full job description here…"
          rows={10}
          maxLength={50000}
          aria-label="Job description text"
        />
        <Button type="button" onClick={() => void onPaste()} disabled={busy || !text.trim()}>
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : null}
          {busy ? "Parsing…" : "Parse job description"}
        </Button>
      </TabsContent>

      <TabsContent value="upload">
        <UploadDropzone
          uploading={busy}
          progress={progress}
          onFile={(file) => void onFile(file)}
          accept=".pdf,.docx,.txt"
          copyTitle="Drag & drop the job description"
          copyHint="or click to browse — PDF, DOCX or TXT, up to 10 MB"
          ariaLabel="Upload job description"
        />
      </TabsContent>
    </Tabs>
  );
}
