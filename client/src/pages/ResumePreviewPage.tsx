import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, FileText, Loader2, PenLine, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { RenameDialog } from "@/components/common/RenameDialog";
import { ResumeSections } from "@/components/resumes/ResumeSections";
import { ResumePreview } from "@/components/resumes/ResumePreview";
import { TemplatePicker } from "@/components/resumes/TemplatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { exportResumeDocx } from "@/utils/exportDocx";
import { exportResumeJson } from "@/utils/exportJson";
import { exportResumePdf } from "@/utils/exportPdfClient";
import type { Resume, ResumeTemplate } from "@/types";

export default function ResumePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "content">("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("classic-rose-serif");
  const [theme, setTheme] = useState<{ accentColor?: string; fontSize?: string }>({
    fontSize: "14px",
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    resumesApi
      .get(id)
      .then((data) => {
        if (!cancelled) {
          setResume(data);
          setSelectedTemplate((data.template as ResumeTemplate) || "classic-rose-serif");
        }
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/resumes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onTemplateChange = async (nextTemplate: ResumeTemplate) => {
    setSelectedTemplate(nextTemplate);
    if (!resume) return;
    try {
      const updated = await resumesApi.update(resume._id, { template: nextTemplate });
      setResume(updated);
      toast.success("Template updated");
    } catch {
      // optimistic update retained
    }
  };

  const onDelete = async () => {
    if (!resume) return;
    setDeleting(true);
    try {
      await resumesApi.remove(resume._id);
      toast.success("Resume deleted");
      navigate("/resumes");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDeleting(false);
    }
  };

  const [density, setDensity] = useState<string>("density-1");
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [isShortContent, setIsShortContent] = useState<boolean>(false);
  const [detectedDensity, setDetectedDensity] = useState<string>("density-1");

  const handleDensityDetected = useCallback((detected: string, isShort: boolean) => {
    setIsShortContent(isShort);
    setDetectedDensity(detected);
    if (autoFit) {
      setDensity(detected);
    }
  }, [autoFit]);

  const onExport = async (kind: "pdf" | "docx") => {
    if (!resume) return;

    // Step 3: Name/header handling
    // If personal.fullName is empty or "Your Name", block download
    const rawName = (
      (resume.parsedData as any)?.personal?.fullName ||
      resume.parsedData?.name ||
      ""
    ).trim();

    if (!rawName || rawName.toLowerCase() === "your name") {
      toast.error("Add your full name before downloading");
      return;
    }

    setExporting(kind);
    const title = resume.fileName.replace(/\.[^.]+$/, "");
    try {
      if (kind === "pdf") {
        await exportResumePdf(
          resume.parsedData,
          selectedTemplate,
          resume.fileName,
          title,
          resume._id,
          density,
          theme
        );
      } else {
        await exportResumeDocx(resume.parsedData, selectedTemplate, resume.fileName, title);
      }
      toast.success(`${kind.toUpperCase()} downloaded`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to="/resumes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All resumes
          </Link>
          <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{resume.fileName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
            aria-label="Print or Save PDF"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print / PDF
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={exporting !== null}>
                {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Download className="mr-1.5 h-4 w-4" aria-hidden />}
                {exporting ? `Exporting…` : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void onExport("pdf")}>Download PDF</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onExport("docx")}>Download DOCX</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => resume && exportResumeJson(resume.parsedData, resume.fileName)}>
                Download JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)} aria-label="Rename resume">
            <PenLine className="mr-1.5 h-4 w-4" aria-hidden />
            Rename
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/resumes/${resume._id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
              Edit
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void onDelete()} disabled={deleting} aria-label="Delete resume">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === "preview" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Live A4 Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === "content" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Parsed Data Content
        </button>
      </div>

      {activeTab === "preview" ? (
        <div className="space-y-6">
          {/* Template Selector with Thumbnails and Theme Tweaks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Choose Template</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplatePicker
                value={selectedTemplate}
                onChange={onTemplateChange}
                theme={theme}
                onThemeChange={setTheme}
              />
            </CardContent>
          </Card>

          {/* Auto-Fit to Page Density Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border bg-card text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Auto-Fit Page Density:</span>
              <button
                type="button"
                onClick={() => {
                  const next = !autoFit;
                  setAutoFit(next);
                  if (next) {
                    setDensity(detectedDensity);
                    toast.info(`Auto-fit enabled: ${detectedDensity.replace("density-", "")}`);
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors cursor-pointer ${
                  autoFit
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {autoFit ? "Auto-Fit: ON" : "Auto-Fit: OFF"}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground mr-1">Density:</span>
              {[
                { id: "density-compact", label: "Compact (9.5pt)" },
                { id: "density-1", label: "Standard (10.5pt)" },
                { id: "density-2", label: "Spacious (11pt)" },
                { id: "density-3", label: "Expanded (11.5pt)" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setAutoFit(false);
                    setDensity(opt.id);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    density === opt.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Hint for short resumes when content is still short at density-3 */}
            {isShortContent && density === "density-3" && (
              <div className="w-full mt-1.5 text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md p-2 text-[11.5px] flex items-center justify-between">
                <span>💡 <strong>Tip for single-page layout:</strong> Add education, certificates or more project details to fill the page.</span>
                <Link to={`/resumes/${resume._id}/edit`} className="font-semibold underline ml-2 shrink-0">
                  Edit resume
                </Link>
              </div>
            )}
          </div>

          {/* Scaled True A4 Live Preview */}
          <div className="rounded-xl border bg-muted/30 p-4 sm:p-8 flex justify-center overflow-hidden">
            <div className="w-full max-w-[840px] overflow-hidden">
              <ResumePreview
                data={resume.parsedData}
                template={selectedTemplate}
                theme={theme}
                density={density}
                onDensityDetected={handleDensityDetected}
              />
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parsed Data Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeSections data={resume.parsedData} />
          </CardContent>
        </Card>
      )}

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename resume"
        description="Pick a clear file name — exports use it (e.g. “Sunil Kumar Java Trainer.pdf”)."
        value={resume.fileName.replace(/\.[^.]+$/, "")}
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
    </div>
  );
}
