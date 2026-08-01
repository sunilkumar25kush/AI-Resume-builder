import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Loader2, ScanSearch, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { jdsApi } from "@/api/jds";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useJdsStore } from "@/stores/jds";
import type { JobDescription } from "@/types";

const MAX_TEXT = 50000;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function JDsPage() {
  const { items, loading, fetch, prepend, remove } = useJdsStore();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const onParseText = async () => {
    if (!text.trim() || parsing) return;
    setParsing(true);
    try {
      const jd = await jdsApi.createFromText(text);
      prepend(jd);
      toast.success("Job description parsed");
      navigate(`/jds/${jd._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setParsing(false);
    }
  };

  const onFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const jd = await jdsApi.uploadFile(file, setProgress);
      prepend(jd);
      toast.success("Job description parsed from file");
      navigate(`/jds/${jd._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setUploading(false);
      setProgress(null);
    }
  };

  const onDelete = async (jd: JobDescription) => {
    try {
      await remove(jd._id);
      toast.success("Job description deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const canParse = text.trim().length > 0 && !parsing;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">JD Parser</h1>
        <p className="text-sm text-muted-foreground">Paste or upload a job description — we extract the key details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste a job description</CardTitle>
          <CardDescription>Title, company, skills, qualifications and responsibilities are extracted automatically</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, MAX_TEXT))}
            rows={7}
            placeholder={"Senior Software Engineer at Acme Corp\n\nWe are looking for…"}
            aria-label="Job description text"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{text.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}</span>
            <Button onClick={() => void onParseText()} disabled={!canParse}>
              {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <ScanSearch className="mr-2 h-4 w-4" aria-hidden />}
              {parsing ? "Parsing…" : "Parse"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        or upload a file
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <UploadDropzone
        uploading={uploading}
        progress={progress}
        onFile={(file) => void onFile(file)}
        copyTitle="Drag & drop a job description"
        copyHint="or click to browse — PDF or DOCX, up to 10 MB"
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Saved ({items.length})
        </h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No job descriptions yet"
            description="Paste or upload one above and it will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((jd) => (
              <li key={jd._id}>
                <Card className="group flex items-center gap-3 p-4 transition-colors hover:bg-accent/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
                    onClick={() => navigate(`/jds/${jd._id}`)}
                    aria-label={`Open ${jd.title || jd.fileName}`}
                  >
                    <span className="w-full truncate font-medium">{jd.title || jd.fileName || "Untitled role"}</span>
                    <span className="text-xs text-muted-foreground">
                      {[jd.company, formatDate(jd.createdAt)].filter(Boolean).join(" · ")} · {jd.skills.length} skills
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground opacity-60 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => void onDelete(jd)}
                    aria-label={`Delete ${jd.title || jd.fileName}`}
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
