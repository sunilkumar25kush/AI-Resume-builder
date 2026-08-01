import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumesStore } from "@/stores/resumes";
import type { Resume } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ResumesPage() {
  const { items, loading, fetch, prepend, remove } = useResumesStore();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const onFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const resume = await resumesApi.upload(file, setProgress);
      prepend(resume);
      toast.success("Resume parsed successfully — review and save it");
      navigate(`/resumes/${resume._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const onDelete = async (resume: Resume) => {
    try {
      await remove(resume._id);
      toast.success("Resume deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume Builder</h1>
        <p className="text-sm text-muted-foreground">Upload a resume — we extract and structure it for you</p>
      </div>

      <UploadDropzone uploading={uploading} progress={progress} onFile={(file) => void onFile(file)} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your resumes ({items.length})
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
            title="No resumes yet"
            description="Upload a PDF or DOCX above and your parsed resume will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((resume) => (
              <li key={resume._id}>
                <Card className="group flex items-center gap-3 p-4 transition-colors hover:bg-accent/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
                    onClick={() => navigate(`/resumes/${resume._id}`)}
                    aria-label={`Open ${resume.fileName}`}
                  >
                    <span className="w-full truncate font-medium">{resume.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(resume.createdAt)} · {formatBytes(resume.fileSize)} · {resume.parsedData.skills.length} skills
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground opacity-60 transition-opacity hover:text-destructive group-hover:opacity-100"
                    onClick={() => void onDelete(resume)}
                    aria-label={`Delete ${resume.fileName}`}
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
