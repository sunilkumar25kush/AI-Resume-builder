import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, CloudUpload, FileText, History, Loader2, PenLine, Redo2, Sparkles, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { RenameDialog } from "@/components/common/RenameDialog";
import { EditorFormCards } from "@/components/resumes/EditorFormCards";
import { AiSuggestPanel } from "@/components/resumes/AiSuggestPanel";
import { suggestionToChange } from "@/components/resumes/editorForm";
import type { AiSuggestion } from "@/api/ai";
import { PreviewPane } from "@/components/resumes/PreviewPane";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { VersionDrawer } from "@/components/resumes/VersionDrawer";
import { editSchema, toApiPayload, toFormValues, toParsedData, type EditFormValues } from "@/components/resumes/editorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiChange, Resume, ResumeTemplate } from "@/types";

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="h-3.5 w-3.5" aria-hidden />
        Save failed — check connection
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      Saved
    </span>
  );
}

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [aiBannerDismissed, setAiBannerDismissed] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<AiChange[]>([]);

  const lastSavedRef = useRef<string>("");
  const saveTimerRef = useRef<number | undefined>(undefined);
  const pendingRef = useRef(false);
  const versionRef = useRef(0);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const undoStackRef = useRef<EditFormValues[]>([]);
  const redoStackRef = useRef<EditFormValues[]>([]);
  const [, setHistoryTick] = useState(0);

  const form = useForm<z.input<typeof editSchema>, unknown, z.output<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: resume ? toFormValues(resume) : undefined,
  });
  const values = form.watch() as unknown as EditFormValues;

  // The reactive `values` prop is applied by react-hook-form in an async
  // effect — on the first render after fetch the watched values are still
  // empty. Only treat the form as usable once the resume is synced in, so we
  // never serialize (or save) an empty form over the real data.
  const formReady = resume !== null && typeof values.skillsText === "string";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    resumesApi
      .get(id)
      .then((data) => {
        if (cancelled) return;
        setResume(data);
        setTemplate(data.template ?? "classic");
        lastSavedRef.current = "";
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/resumes");
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const save = async () => {
    if (!resume) return;
    const serialized = JSON.stringify(toApiPayload(values, template));
    if (serialized === lastSavedRef.current) {
      pendingRef.current = false;
      return;
    }
    const version = ++versionRef.current;
    pendingRef.current = true;
    setSaveState("saving");
    try {
      await resumesApi.update(resume._id, toApiPayload(values, template));
      lastSavedRef.current = serialized;
      pendingRef.current = false;
      if (version === versionRef.current) setSaveState("saved");
    } catch (error) {
      if (version === versionRef.current) {
        pendingRef.current = false;
        setSaveState("error");
        toast.error(getApiErrorMessage(error));
      }
    }
  };
  saveRef.current = save;

  // History snapshots for undo/redo (debounced, capped at 50).
  useEffect(() => {
    if (!resume || !formReady) return;
    const timer = window.setTimeout(() => {
      undoStackRef.current.push(structuredClone(values));
      if (undoStackRef.current.length > 50) undoStackRef.current.shift();
      redoStackRef.current = [];
      setHistoryTick((tick) => tick + 1);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [values, resume, formReady]);

  const onUndo = () => {
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    redoStackRef.current.push(structuredClone(values));
    form.reset(previous);
    lastSavedRef.current = "";
    setHistoryTick((tick) => tick + 1);
  };

  const onRedo = () => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push(structuredClone(values));
    form.reset(next);
    lastSavedRef.current = "";
    setHistoryTick((tick) => tick + 1);
  };

  const handleRestored = (updated: Resume) => {
    const formValues = toFormValues(updated);
    form.reset(formValues);
    setResume(updated);
    setTemplate(updated.template ?? "classic");
    // Align the autosave baseline so no phantom save fires after restore.
    lastSavedRef.current = JSON.stringify(toApiPayload(formValues, updated.template ?? "classic"));
  };

  // Debounced autosave on any form/template change.
  useEffect(() => {
    if (!resume || !formReady) return;
    const serialized = JSON.stringify(toApiPayload(values, template));
    if (serialized === lastSavedRef.current) return;
    window.clearTimeout(saveTimerRef.current);
    pendingRef.current = true;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = undefined;
      void saveRef.current();
    }, 600);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [values, template, resume, formReady]);

  // Flush any pending save on unmount (uses latest closure via ref).
  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimerRef.current);
      if (pendingRef.current) void saveRef.current();
    };
  }, []);

  if (!resume || !formReady) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const title = resume.fileName.replace(/\.[^.]+$/, "");
  const previewData = toParsedData(values);

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Link to={`/resumes/${resume._id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to preview
            </Link>
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="truncate">{resume.fileName}</span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setRenameOpen(true)} aria-label="Rename resume">
                <PenLine className="h-4 w-4" aria-hidden />
              </Button>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={onUndo} disabled={undoStackRef.current.length === 0} aria-label="Undo">
              <Undo2 className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onRedo} disabled={redoStackRef.current.length === 0} aria-label="Redo">
              <Redo2 className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setHistoryOpen(true)} aria-label="Open version history">
              <History className="mr-1.5 h-4 w-4" aria-hidden />
              History
            </Button>
            <SaveIndicator state={saveState} />
          </div>
        </div>

        {resume.aiChanges.length > 0 && !aiBannerDismissed ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-medium text-emerald-800">
                AI added {resume.aiChanges.length} improvement{resume.aiChanges.length === 1 ? "" : "s"} — green highlights show what changed
              </p>
              <p className="text-xs text-emerald-700/80">
                Edit karte hi highlight hat jata hai. Aap kisi bhi AI addition ko change ya remove kar sakte ho — yeh sirf suggestions hain.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAiBannerDismissed(true)}>
              Dismiss
            </Button>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudUpload className="h-4 w-4 text-primary" aria-hidden />
              Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemplatePicker value={template} onChange={(next) => setTemplate(next)} />
          </CardContent>
        </Card>

        <div className="lg:hidden">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Editor view">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "edit"}
              onClick={() => setMobileTab("edit")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mobileTab === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "preview"}
              onClick={() => setMobileTab("preview")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mobileTab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className={`flex flex-col gap-6 ${mobileTab === "edit" ? "" : "hidden lg:flex"}`}>
            <AiSuggestPanel
              resumeId={resume._id}
              onApplied={(suggestion: AiSuggestion) =>
                setAppliedSuggestions((prev) => [...prev, suggestionToChange(suggestion)])
              }
            />
            <EditorFormCards aiChanges={[...(resume.aiChanges ?? []), ...appliedSuggestions]} />
          </div>
          <div className={mobileTab === "preview" ? "lg:sticky lg:top-4" : "hidden lg:sticky lg:top-4 lg:block"}>
            <PreviewPane data={previewData} template={template} title={title} />
          </div>
        </div>
      </div>

      <VersionDrawer resume={resume} open={historyOpen} onOpenChange={setHistoryOpen} onRestored={handleRestored} />

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename resume"
        description="Pick a clear file name — exports use it (e.g. “Sunil Kumar Java Trainer.pdf”)."
        value={title}
        saving={renaming}
        onSave={async (name) => {
          setRenaming(true);
          try {
            const ext = resume.fileName.match(/\.[^.]+$/)?.[0] ?? "";
            const updated = await resumesApi.update(resume._id, { fileName: ext ? `${name}${ext}` : name });
            setResume(updated);
            toast.success("Resume renamed");
            setRenameOpen(false);
          } catch (error) {
            toast.error(getApiErrorMessage(error));
          } finally {
            setRenaming(false);
          }
        }}
      />
    </FormProvider>
  );
}
