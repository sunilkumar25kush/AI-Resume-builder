/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { UploadDropzone } from "@/components/resumes/UploadDropzone";
import { Button } from "@/components/ui/button";
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
import { PortfolioCreationAnimationModal } from "@/components/portfolios/common/PortfolioCreationAnimationModal";
import { useAuthStore } from "@/stores/auth";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useResumesStore } from "@/stores/resumes";
import type { CreatePortfolioInput, Portfolio, PortfolioDesignSettings } from "@/types";

export const TEMPLATE_OPTIONS: Array<{
  id: PortfolioDesignSettings["template"];
  name: string;
  desc: string;
  badge: string;
  gradient: string;
  previewNote: string;
}> = [
    {
      id: "devport",
      name: "DevPort (Featured)",
      desc: "Cosmic dark theme, orbital avatar, glowing typewriter & floating code card",
      badge: "Featured ★",
      gradient: "from-cyan-500 via-indigo-500 to-pink-500",
      previewNote: "Cosmic Dark & Orbital Badges",
    },
    {
      id: "creative",
      name: "Modern 3D",
      desc: "Midnight indigo theme, 3D avatar halo, electric purple gradient & stats",
      badge: "New ★",
      gradient: "from-purple-600 via-indigo-600 to-blue-600",
      previewNote: "Midnight & 3D Avatar Halo",
    },
    {
      id: "developer",
      name: "Tech / Dev",
      desc: "Terminal accents, GitHub repository links, and code highlights",
      badge: "Engineering",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      previewNote: "Terminal & Code Accents",
    },
    {
      id: "minimal",
      name: "Minimalist",
      desc: "Typography-focused editorial elegance with generous whitespace",
      badge: "Editorial",
      gradient: "from-neutral-700 via-neutral-500 to-neutral-400",
      previewNote: "Quiet Editorial Whitespace",
    },
    {
      id: "oss-maintainer",
      name: "OSS Maintainer",
      desc: "GitHub-native developer aesthetic with pinned repositories & stats",
      badge: "OSS ★",
      gradient: "from-emerald-500 to-teal-700",
      previewNote: "GitHub Pinned & Stats",
    },
    {
      id: "motion-studio",
      name: "Motion Canvas",
      desc: "Kinetic typography, Framer Motion viewport transitions & decks",
      badge: "Kinetic ★",
      gradient: "from-violet-600 to-indigo-600",
      previewNote: "Kinetic Framer Motion",
    },
    {
      id: "ramen-shop",
      name: "Ramen Shop 3D",
      desc: "Cyberpunk retro-futuristic arcade diner with 3D canvas loop",
      badge: "3D WebGL ★",
      gradient: "from-pink-500 via-purple-500 to-cyan-500",
      previewNote: "3D Cyberpunk Diner",
    },
    {
      id: "spotlight",
      name: "Spotlight",
      desc: "Obsidian & crimson aesthetic with avatar halo and featured work spotlights",
      badge: "Spotlight ★",
      gradient: "from-rose-600 to-neutral-950",
      previewNote: "Obsidian & Crimson Halo",
    },
    {
      id: "dat-immersive",
      name: "Immersive Engineer",
      desc: "Glassmorphic cyan telemetry HUD with real-time cyber status",
      badge: "HUD Telemetry",
      gradient: "from-cyan-500 to-blue-900",
      previewNote: "Glassmorphic Cyber HUD",
    },
    {
      id: "seyi-editorial",
      name: "Kinetic Editorial",
      desc: "High-fashion editorial magazine with kinetic ticker ribbons",
      badge: "Editorial",
      gradient: "from-amber-700 to-stone-900",
      previewNote: "Editorial Ticker Ribbon",
    },
    {
      id: "sameera-material",
      name: "Material Journal",
      desc: "Material Design 3 card elevations and journal typography",
      badge: "Clean",
      gradient: "from-blue-500 to-rose-400",
      previewNote: "Material Design 3 Cards",
    },
    {
      id: "resume-page",
      name: "One-Page Résumé",
      desc: "Structured A4 print-ready grid designed for hiring managers",
      badge: "Recruiter-Ready",
      gradient: "from-slate-700 to-slate-900",
      previewNote: "A4 Recruiter & Print",
    },
    {
      id: "poster",
      name: "Poster Brutalist",
      desc: "High-contrast brutalist monochrome typography & stark borders",
      badge: "Brutalist",
      gradient: "from-neutral-900 to-black",
      previewNote: "Brutalist Monochrome",
    },
    {
      id: "nahuel-cosmos",
      name: "Nahuel Cosmos",
      desc: "Constellation particle aesthetic with obsidian and gold typography",
      badge: "Cosmic",
      gradient: "from-amber-500 to-stone-950",
      previewNote: "Constellation Star Grid",
    },
    {
      id: "danny-webgl",
      name: "WebGL Résumé",
      desc: "Fluid shader background plane with minimal Swiss typography",
      badge: "Shader WebGL",
      gradient: "from-emerald-400 to-neutral-900",
      previewNote: "WebGL Shader Canvas",
    },
    {
      id: "portfolio-os",
      name: "Portfolio OS",
      desc: "Interactive 3D desktop OS window manager environment",
      badge: "Desktop OS",
      gradient: "from-blue-600 to-indigo-900",
      previewNote: "Desktop OS Environment",
    },
    {
      id: "buffalo-room",
      name: "Buffalo Room 3D",
      desc: "Isometric 3D interactive room with warm clay surfaces",
      badge: "Isometric 3D",
      gradient: "from-orange-600 to-stone-900",
      previewNote: "3D Isometric Studio",
    },
    {
      id: "folio-2019",
      name: "Worldfolio (folio-2019)",
      desc: "Playful low-poly physics vehicle terrain world with zones",
      badge: "Physics 3D ★",
      gradient: "from-yellow-400 to-amber-500",
      previewNote: "3D Vehicle Physics World",
    },
    {
      id: "notebook-room",
      name: "Notebook Room 3D",
      desc: "Isometric 3D desk journal built with warm forest tones",
      badge: "Journal 3D",
      gradient: "from-emerald-800 to-stone-900",
      previewNote: "3D Isometric Desk Journal",
    },
    {
      id: "naresh-keyboard",
      name: "Skills Keyboard 3D",
      desc: "Interactive mechanical key switch matrix with responsive keycaps",
      badge: "Keyboard 3D",
      gradient: "from-indigo-600 to-slate-900",
      previewNote: "3D Mechanical Switchboard",
    },
  ];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: Portfolio) => void;
}

export default function CreatePortfolioDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePortfolioDialogProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const prepend = usePortfoliosStore((state) => state.prepend);
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);

  const [sourceType, setSourceType] = useState<"upload" | "resume" | "scratch">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioDesignSettings["template"]>("devport");
  const [submitting, setSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<string>("");

  useEffect(() => {
    if (open) {
      void fetchResumes();
    }
  }, [open, fetchResumes]);

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
      onSuccess?.(created);
      setSubmittingStatus("Finalizing portfolio theme & assets...");
      // Brief aesthetic pause to showcase the completed AI creation state
      await new Promise((resolve) => setTimeout(resolve, 600));

      onOpenChange(false);
      setUploadedFile(null);
      setUploadProgress(null);
      navigate(`/portfolios/${created._id}/edit`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
      setSubmittingStatus("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${sourceType === "upload"
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
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${sourceType === "resume"
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
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors ${sourceType === "scratch"
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Choose Portfolio Template
                </Label>
                <span className="text-[11px] font-mono text-primary font-semibold">
                  {selectedTemplate === "devport" ? "DevPort Cosmic" : selectedTemplate === "creative" ? "Modern 3D" : selectedTemplate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {TEMPLATE_OPTIONS.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      disabled={submitting}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all overflow-hidden ${isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs"
                          : "border-border hover:border-primary/40 hover:bg-accent/40"
                        }`}
                    >
                      {/* Gradient Accent Bar */}
                      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${tpl.gradient} mb-2.5 opacity-90 group-hover:opacity-100 transition-opacity`} />

                      <div className="flex w-full items-center justify-between text-xs font-bold">
                        <span className="truncate">{tpl.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${isSelected ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                          }`}>
                          {tpl.badge}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {tpl.desc}
                      </p>

                      <div className="mt-2 text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{tpl.previewNote}</span>
                      </div>
                    </button>
                  );
                })}
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
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
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

      {/* Animated Multi-Step AI Portfolio Creation Showcase */}
      {submitting && (
        <PortfolioCreationAnimationModal
          isOpen={submitting}
          statusMessage={submittingStatus}
          uploadProgress={uploadProgress}
          templateName={selectedTemplate === "devport" ? "DevPort" : selectedTemplate}
        />
      )}
    </>
  );
}
