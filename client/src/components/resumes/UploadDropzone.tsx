import { useRef, useState, type DragEvent } from "react";
import { CloudUpload, FileText, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  uploading: boolean;
  progress: number | null;
  onFile: (file: File) => void;
  copyTitle?: string;
  copyHint?: string;
}

const ACCEPT = ".pdf,.docx";

/** Drag-and-drop + click upload zone for PDF/DOCX files. */
export function UploadDropzone({ uploading, progress, onFile, copyTitle, copyHint }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pickFile = (file?: File) => {
    if (!file || uploading) return;
    onFile(file);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload resume"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          pickFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {uploading ? <Loader2 className="h-7 w-7 animate-spin" aria-hidden /> : <CloudUpload className="h-7 w-7" aria-hidden />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {uploading ? "Uploading and parsing…" : dragging ? "Drop it here" : (copyTitle ?? "Drag & drop your resume")}
        </p>
        <p className="text-sm text-muted-foreground">
          {copyHint ?? "or click to browse — PDF or DOCX, up to 10 MB"}
        </p>
      </div>
      {uploading && progress !== null ? (
        <div className="w-full max-w-xs">
          <Progress value={progress} aria-label={`Upload progress ${progress}%`} />
          <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
        </div>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Your text is extracted automatically — you can review and fix it before saving
        </span>
      )}
    </div>
  );
}
