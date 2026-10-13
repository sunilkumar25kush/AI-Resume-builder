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
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { EmptyState } from "@/components/common/EmptyState";
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

export default function PortfoliosPage() {
  const user = useAuthStore((state) => state.user);
  const { items, loading, error, fetch, prepend, remove } = usePortfoliosStore();
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);

  const [createOpen, setCreateOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"resume" | "scratch">("resume");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioDesignSettings["template"]>("modern");
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);
    try {
      const payload: CreatePortfolioInput = {
        title: portfolioTitle.trim(),
        resumeId: sourceType === "resume" && selectedResumeId ? selectedResumeId : undefined,
        design: { template: selectedTemplate },
      };
      const created = await portfoliosApi.create(payload);
      prepend(created);
      toast.success("Portfolio draft created successfully!");
      setCreateOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
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
              <CardTitle className="text-sm font-semibold">1-Click Resume Import</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Instantly sync your work history, projects, and skills without manual data entry.
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
            Select modern themes with responsive layouts tailored for engineering and creative roles.
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
            description="You haven't generated any portfolio websites yet. Click below to create your first portfolio from an existing resume or start fresh."
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
                        toast.info(`Portfolio editor will be available in Phase 2`);
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
                          onClick={() => window.open(`/p/${portfolio.slug}`, "_blank")}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" aria-hidden />
              Create Portfolio Website
            </DialogTitle>
            <DialogDescription>
              Set up the initial foundation for your personal portfolio website.
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
              />
            </div>

            {/* Source Selection */}
            <div className="space-y-1.5">
              <Label>Source Content</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType("resume")}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                    sourceType === "resume"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <FileText className="h-3.5 w-3.5 text-primary" aria-hidden />
                    From Existing Resume
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Auto-fill experience, projects & skills
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType("scratch")}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                    sourceType === "scratch"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Start Blank
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Build sections manually from scratch
                  </span>
                </button>
              </div>
            </div>

            {/* If Resume source, select which resume */}
            {sourceType === "resume" && (
              <div className="space-y-1.5">
                <Label htmlFor="resume-select">Select Resume to Import</Label>
                {resumes.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    No parsed resumes found. You can still create a portfolio and add details manually, or upload a resume first in the Resume Builder.
                  </p>
                ) : (
                  <select
                    id="resume-select"
                    value={selectedResumeId}
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
              <Label>Initial Template</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
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

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Phase 1 Foundation:</span> Routes, entry points, and landing UI are live. AI portfolio compilation and MongoDB models will connect in Phase 2.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Initializing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
