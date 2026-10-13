import { useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Palette,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { EmptyState } from "@/components/common/EmptyState";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useResumesStore } from "@/stores/resumes";
import type { CreatePortfolioInput, Portfolio, PortfolioDesignSettings } from "@/types";

const TEMPLATE_OPTIONS: Array<{
  id: PortfolioDesignSettings["template"];
  name: string;
  desc: string;
  badge: string;
}> = [
  { id: "modern", name: "Modern Clean", desc: "Balanced layout with crisp typography & cards", badge: "Popular" },
  { id: "developer", name: "Tech / Dev", desc: "Terminal accents, GitHub links, and code highlights", badge: "Engineering" },
  { id: "minimal", name: "Minimalist", desc: "Typography-focused elegance with generous whitespace", badge: "Clean" },
  { id: "executive", name: "Executive", desc: "Structured, formal presentation for leadership roles", badge: "Leadership" },
];

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PortfoliosPage() {
  const user = useAuthStore((state) => state.user);
  const { items, loading, error, fetch, prepend, remove } = usePortfoliosStore();
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);

  const [createOpen, setCreateOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"upload" | "resume" | "scratch">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioDesignSettings["template"]>("modern");
  const [submitting, setSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch();
    void fetchResumes();
  }, [fetch, fetchResumes]);

  // Set default title based on authenticated user name
  useEffect(() => {
    if (user?.name && !portfolioTitle) {
      setPortfolioTitle(`${user.name.split(" ")[0]}'s Portfolio`);
    }
  }, [user, portfolioTitle]);

  // Select first resume by default if available
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id);
    }
  }, [resumes, selectedResumeId]);

  const handleCreateSubmit = async () => {
    if (!portfolioTitle.trim()) {
      toast.error("Please enter a title for your portfolio");
      return;
    }

    if (sourceType === "upload" && !uploadedFile) {
      toast.error("Please select or drop a resume file (PDF or DOCX)");
      return;
    }

    if (sourceType === "resume" && !selectedResumeId) {
      toast.error("Please select an existing resume to import");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      let created: Portfolio;
      if (sourceType === "upload" && uploadedFile) {
        setSubmittingStatus("Uploading & extracting career data with Gemini AI...");
        created = await portfoliosApi.uploadAndGenerate(
          uploadedFile,
          { template: selectedTemplate, title: portfolioTitle.trim() },
          (pct) => setUploadProgress(pct),
        );
        toast.success("Portfolio generated successfully with Gemini AI!");
      } else if (sourceType === "resume" && selectedResumeId) {
        setSubmittingStatus("Compiling portfolio from selected resume with Gemini AI...");
        created = await portfoliosApi.generateFromResume(selectedResumeId, {
          template: selectedTemplate,
          title: portfolioTitle.trim(),
        });
        toast.success("Portfolio generated successfully from resume!");
      } else {
        setSubmittingStatus("Creating blank portfolio draft...");
        const payload: CreatePortfolioInput = {
          title: portfolioTitle.trim(),
          design: { template: selectedTemplate },
        };
        created = await portfoliosApi.create(payload);
        toast.success("Blank portfolio draft created!");
      }

      prepend(created);
      setCreateOpen(false);
      setUploadedFile(null);
      setUploadProgress(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
      setSubmittingStatus("");
    }
  };

  const handleDelete = async (portfolio: Portfolio) => {
    if (!confirm(`Are you sure you want to delete "${portfolio.title}"?`)) return;
    setDeletingId(portfolio._id);
    try {
      await remove(portfolio._id);
      toast.success("Portfolio deleted");
    } catch {
      toast.error("Failed to delete portfolio");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Globe className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Portfolio Generator</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Transform your resume into a personalized, responsive portfolio website
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 sm:self-start">
          <Plus className="h-4 w-4" aria-hidden />
          Create Portfolio
        </Button>
      </div>

      {/* Feature Value-Proposition Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle className="text-sm font-semibold">AI Resume Extraction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Upload PDF/DOCX or pick an existing resume — Gemini AI extracts bio, experience, skills, and projects.
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Palette className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle className="text-sm font-semibold">Designer Templates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Select modern themes with responsive layouts tailored for engineering, design, and executive roles.
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Globe className="h-4 w-4" aria-hidden />
              </span>
              <CardTitle className="text-sm font-semibold">Custom Slug & Live URL</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Publish your portfolio to a clean public URL shareable on LinkedIn, GitHub, and job applications.
          </CardContent>
        </Card>
      </section>

      {/* Error State Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetch()}
            className="gap-1.5 border-destructive/30 hover:bg-destructive/20"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      )}

      {/* Main Portfolios List Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Portfolios ({items.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No portfolios yet"
            description="Transform your career history into a live web portfolio. Upload your resume or pick an existing one to generate an AI-powered draft."
            action={
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                Create Portfolio
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((portfolio) => (
              <Card
                key={portfolio._id}
                className="group flex flex-col justify-between border-border/80 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={portfolio.status === "published" ? "default" : "secondary"}
                      className="text-[10px] uppercase font-semibold tracking-wide"
                    >
                      {portfolio.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(portfolio.updatedAt)}
                    </span>
                  </div>
                  <CardTitle className="pt-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                    {portfolio.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {portfolio.profile?.headline || portfolio.profile?.bio || `Template: ${portfolio.design.template}`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    <span className="truncate font-mono">/p/{portfolio.slug}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        toast.info(`Portfolio customization studio will open in the next phase`);
                      }}
                    >
                      Edit
                    </Button>

                    <div className="flex items-center gap-1">
                      {portfolio.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Open public link"
                          onClick={() => window.open(`/api/portfolios/public/${portfolio.slug}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete portfolio"
                        disabled={deletingId === portfolio._id}
                        onClick={() => void handleDelete(portfolio)}
                      >
                        {deletingId === portfolio._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Create Portfolio Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              Generate Portfolio Website
            </DialogTitle>
            <DialogDescription>
              Upload a resume or start fresh to create an AI-powered personal portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-title">Portfolio Title</Label>
              <Input
                id="portfolio-title"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                placeholder="e.g. Rahul Sharma — Full Stack Engineer"
                maxLength={100}
                disabled={submitting}
              />
            </div>

            {/* Source Selection */}
            <div className="space-y-1.5">
              <Label>Source Option</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSourceType("upload")}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${
                    sourceType === "upload"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <UploadCloud className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Upload File
                  </div>
                  <span className="text-[10px] text-muted-foreground">PDF or DOCX</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSourceType("resume")}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${
                    sourceType === "resume"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <FileText className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Saved Resume
                  </div>
                  <span className="text-[10px] text-muted-foreground">From account</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSourceType("scratch")}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${
                    sourceType === "scratch"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Start Blank
                  </div>
                  <span className="text-[10px] text-muted-foreground">Empty draft</span>
                </button>
              </div>
            </div>

            {/* If Upload source, show file dropzone */}
            {sourceType === "upload" && (
              <div className="space-y-2">
                <Label>Upload Resume (PDF or DOCX)</Label>
                {uploadedFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="h-5 w-5 text-primary shrink-0" aria-hidden />
                      <div className="truncate">
                        <p className="font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={submitting}
                      onClick={() => setUploadedFile(null)}
                      title="Remove file"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ) : (
                  <UploadDropzone
                    uploading={submitting}
                    progress={uploadProgress}
                    onFile={(file) => setUploadedFile(file)}
                    copyTitle="Drop resume file here or click to browse"
                    copyHint="PDF or DOCX (max 10 MB)"
                  />
                )}
              </div>
            )}

            {/* If Saved Resume source, select which resume */}
            {sourceType === "resume" && (
              <div className="space-y-1.5">
                <Label htmlFor="resume-select">Select Saved Resume</Label>
                {resumes.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    No parsed resumes found in your account. You can choose "Upload File" above to parse a new file directly.
                  </p>
                ) : (
                  <select
                    id="resume-select"
                    value={selectedResumeId}
                    disabled={submitting}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.parsedData?.name || r.fileName || "Untitled Resume"} ({r.template || "Standard"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Template Selection */}
            <div className="space-y-1.5">
              <Label>Portfolio Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${
                      selectedTemplate === tpl.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between text-xs font-semibold">
                      <span>{tpl.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{tpl.badge}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{tpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status / Progress Notification when submitting */}
            {submitting && (
              <div className="space-y-2 rounded-xl bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  <span>{submittingStatus || "Processing document..."}</span>
                </div>
                {uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="h-1.5" />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Generating...
                </>
              ) : (
                "Generate Portfolio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
