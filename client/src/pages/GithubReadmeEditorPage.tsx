import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Eye,
  FileCode,
  FolderGit2,
  Laptop,
  Layers,
  Loader2,
  Redo2,
  RefreshCw,
  Save,
  Send,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Undo2,
  CopyPlus,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useGithubReadmeStore } from "@/stores/githubReadme";
import { SectionListPanel } from "@/components/githubReadme/editor/SectionListPanel";
import { PropertiesPanel } from "@/components/githubReadme/editor/PropertiesPanel";
import { AiAssistantDialog } from "@/components/githubReadme/editor/AiAssistantDialog";
import { GithubIntegrationModal } from "@/components/githubReadme/GithubIntegrationModal";
import { ExportPublishDialog } from "@/components/githubReadme/editor/ExportPublishDialog";
import { ReadmeMarkdownPreview } from "@/components/githubReadme/ReadmeMarkdownPreview";
import { compileReadmeToMarkdown, getDefaultSections } from "@/components/githubReadme/compiler";
import { getTemplatePreset } from "@/components/githubReadme/templates/registry";
import type {
  GithubReadme,
  GithubReadmeProject,
  GithubReadmeSection,
  GithubReadmeSectionType,
  GithubReadmeSkill,
} from "@/types";

export function GithubReadmeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activeReadme, loading, fetchReadmeById, updateReadme, duplicateReadme } =
    useGithubReadmeStore();

  // Primary Document State
  const [doc, setDoc] = useState<Partial<GithubReadme>>({
    title: "My GitHub Profile README",
    template: "developer-tech-stack",
    content: "",
    profile: {
      name: "Developer",
      headline: "Full-Stack Software Engineer & Creator",
      bio: "Passionate about building performant web applications and open source tools.",
      githubUsername: "octocat",
      location: "Global",
    },
    statsConfig: {
      showGithubStats: true,
      showStreakStats: true,
      showTopLangs: true,
      showTrophies: true,
      showActivityGraph: true,
      statsTheme: "tokyonight",
    },
    skills: [
      { name: "TypeScript", category: "Languages" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "Docker", category: "DevOps" },
    ],
    socialLinks: [],
    projects: [],
    sections: getDefaultSections("developer-tech-stack"),
    settings: {
      headerStyle: "wave",
      layout: "standard",
      badgesStyle: "for-the-badge",
    },
  });

  // Editor View State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("sec_header");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [mobilePanelTab, setMobilePanelTab] = useState<"sections" | "preview" | "properties">("preview");

  // Save & Sync State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isCopied, setIsCopied] = useState(false);

  // Modals State
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDialogInitialTab, setExportDialogInitialTab] = useState<"export" | "publish">("export");

  // Undo / Redo History Stack
  const [history, setHistory] = useState<Partial<GithubReadme>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Load document by ID
  useEffect(() => {
    if (id) {
      fetchReadmeById(id);
    }
  }, [id, fetchReadmeById]);

  // Sync loaded active document into state
  useEffect(() => {
    if (activeReadme) {
      const initialSections =
        Array.isArray(activeReadme.sections) && activeReadme.sections.length > 0
          ? activeReadme.sections
          : getDefaultSections(activeReadme.template);

      const mergedDoc: Partial<GithubReadme> = {
        ...activeReadme,
        sections: initialSections,
        content: activeReadme.content || compileReadmeToMarkdown({ ...activeReadme, sections: initialSections }),
      };

      setDoc(mergedDoc);
      setHistory([mergedDoc]);
      setHistoryIndex(0);
      setSaveStatus("saved");
    }
  }, [activeReadme]);

  // Record history snapshot whenever doc changes through visual editing
  const pushToHistory = (newDoc: Partial<GithubReadme>) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      // Keep max 30 snapshots
      const next = [...sliced, newDoc];
      if (next.length > 30) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const targetIndex = historyIndex - 1;
      const targetDoc = history[targetIndex];
      setHistoryIndex(targetIndex);
      setDoc(targetDoc);
      setSaveStatus("unsaved");
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const targetIndex = historyIndex + 1;
      const targetDoc = history[targetIndex];
      setHistoryIndex(targetIndex);
      setDoc(targetDoc);
      setSaveStatus("unsaved");
    }
  };

  // Update doc state helper
  const handleUpdateDoc = useCallback(
    (updates: Partial<GithubReadme>) => {
      setDoc((prev) => {
        const next = { ...prev, ...updates };
        // Automatically compile markdown whenever visual fields change
        next.content = compileReadmeToMarkdown(next);
        pushToHistory(next);
        setSaveStatus("unsaved");
        return next;
      });
    },
    [historyIndex],
  );

  // Update a specific section
  const handleUpdateSection = useCallback(
    (sectionId: string, updates: Partial<GithubReadmeSection>) => {
      setDoc((prev) => {
        const nextSections = (prev.sections || []).map((sec) =>
          sec.id === sectionId ? { ...sec, ...updates } : sec,
        );
        const next = { ...prev, sections: nextSections };
        next.content = compileReadmeToMarkdown(next);
        pushToHistory(next);
        setSaveStatus("unsaved");
        return next;
      });
    },
    [historyIndex],
  );

  // Toggle section enabled
  const handleToggleSection = (sectionId: string, enabled: boolean) => {
    handleUpdateSection(sectionId, { enabled });
  };

  // Reorder sections
  const handleReorderSections = (newSections: GithubReadmeSection[]) => {
    setDoc((prev) => {
      const next = { ...prev, sections: newSections };
      next.content = compileReadmeToMarkdown(next);
      pushToHistory(next);
      setSaveStatus("unsaved");
      return next;
    });
  };

  // Add section
  const handleAddSection = (type: GithubReadmeSectionType, title: string) => {
    const newSec: GithubReadmeSection = {
      id: `sec_${type}_${Date.now()}`,
      type,
      title,
      enabled: true,
      customMarkdown: type === "custom" ? "### Custom Section\n\nAdd your content here..." : "",
    };
    setDoc((prev) => {
      const nextSections = [...(prev.sections || []), newSec];
      const next = { ...prev, sections: nextSections };
      next.content = compileReadmeToMarkdown(next);
      pushToHistory(next);
      setSaveStatus("unsaved");
      return next;
    });
    setSelectedSectionId(newSec.id);
  };

  // Remove section
  const handleRemoveSection = (sectionId: string) => {
    setDoc((prev) => {
      const nextSections = (prev.sections || []).filter((s) => s.id !== sectionId);
      const next = { ...prev, sections: nextSections };
      next.content = compileReadmeToMarkdown(next);
      pushToHistory(next);
      setSaveStatus("unsaved");
      return next;
    });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  // Raw Markdown edit synchronization
  const handleRawMarkdownChange = (raw: string) => {
    setDoc((prev) => {
      const next = { ...prev, content: raw };
      setSaveStatus("unsaved");
      return next;
    });
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!id) return;
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      await updateReadme(id, {
        title: doc.title,
        template: doc.template,
        content: doc.content,
        profile: doc.profile,
        statsConfig: doc.statsConfig,
        skills: doc.skills,
        socialLinks: doc.socialLinks,
        projects: doc.projects,
        sections: doc.sections,
        experience: doc.experience,
        education: doc.education,
        certifications: doc.certifications,
        achievements: doc.achievements,
        competitive: doc.competitive,
        bannerUrl: doc.bannerUrl,
        gifUrl: doc.gifUrl,
        settings: doc.settings,
      });
      setSaveStatus("saved");
      toast.success("README saved successfully!");
    } catch {
      setSaveStatus("unsaved");
      toast.error("Failed to save README");
    } finally {
      setIsSaving(false);
    }
  }, [id, doc, updateReadme]);

  // Debounced auto-save every 2.5s if unsaved
  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2500);
    return () => clearTimeout(timer);
  }, [saveStatus, handleSave]);

  // Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleUndo, handleRedo]);

  // Duplicate current README
  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const duplicated = await duplicateReadme(id);
      toast.success("README duplicated!");
      navigate(`/github-readme/${duplicated._id}/edit`);
    } catch {
      toast.error("Failed to duplicate README");
    }
  };

  // Reset to original template preset
  const handleResetToTemplate = () => {
    if (!doc.template) return;
    if (confirm("Reset all sections and data back to the default template layout?")) {
      const preset = getTemplatePreset(doc.template, doc.profile?.githubUsername || "octocat");
      const defaultSecs = getDefaultSections(doc.template);
      const resetDoc: Partial<GithubReadme> = {
        ...doc,
        ...preset,
        profile: {
          name: preset.profile?.name || "Developer",
          headline: preset.profile?.headline || "Software Engineer",
          bio: preset.profile?.bio || "",
          githubUsername: preset.profile?.githubUsername || "octocat",
          ...preset.profile,
        },
        sections: defaultSecs,
      };
      resetDoc.content = compileReadmeToMarkdown(resetDoc);
      setDoc(resetDoc);
      pushToHistory(resetDoc);
      setSaveStatus("unsaved");
      toast.success("Reset to template preset!");
    }
  };

  // Copy Markdown
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(doc.content || "");
      setIsCopied(true);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  // Apply GitHub profile data import
  const handleApplyGithubData = (imported: {
    name?: string;
    headline?: string;
    bio?: string;
    githubUsername?: string;
    location?: string;
    website?: string;
    skills?: GithubReadmeSkill[];
    projects?: GithubReadmeProject[];
  }) => {
    setDoc((prev) => {
      const nextProfile = {
        ...prev.profile,
        ...(imported.name ? { name: imported.name } : {}),
        ...(imported.headline ? { headline: imported.headline } : {}),
        ...(imported.bio ? { bio: imported.bio } : {}),
        ...(imported.githubUsername ? { githubUsername: imported.githubUsername } : {}),
        ...(imported.location ? { location: imported.location } : {}),
        ...(imported.website ? { portfolioUrl: imported.website } : {}),
      };

      // Merge skills avoiding duplicates
      const existingSkillNames = new Set((prev.skills || []).map((s) => s.name.toLowerCase()));
      const newSkills = (imported.skills || []).filter(
        (s) => !existingSkillNames.has(s.name.toLowerCase()),
      );
      const mergedSkills = [...(prev.skills || []), ...newSkills];

      // Merge projects avoiding duplicates
      const existingRepoNames = new Set((prev.projects || []).map((p) => p.title.toLowerCase()));
      const newProjects = (imported.projects || []).filter(
        (p) => !existingRepoNames.has(p.title.toLowerCase()),
      );
      const mergedProjects = [...(prev.projects || []), ...newProjects];

      const next: Partial<GithubReadme> = {
        ...prev,
        profile: nextProfile,
        skills: mergedSkills,
        projects: mergedProjects,
      };
      next.content = compileReadmeToMarkdown(next);
      pushToHistory(next);
      setSaveStatus("unsaved");
      return next;
    });
    toast.success("GitHub profile data imported into your README!");
  };

  // Apply AI assistant improvements
  const handleApplyAiAssist = (aiDoc: Partial<GithubReadme>) => {
    setDoc((prev) => {
      const next: Partial<GithubReadme> = {
        ...prev,
        ...aiDoc,
        profile: {
          ...prev.profile,
          ...(aiDoc.profile || {}),
        },
        statsConfig: {
          ...prev.statsConfig,
          ...(aiDoc.statsConfig || {}),
        },
        settings: {
          ...prev.settings,
          ...(aiDoc.settings || {}),
        },
        sections: aiDoc.sections && aiDoc.sections.length > 0 ? aiDoc.sections : prev.sections,
        skills: aiDoc.skills && aiDoc.skills.length > 0 ? aiDoc.skills : prev.skills,
        projects: aiDoc.projects && aiDoc.projects.length > 0 ? aiDoc.projects : prev.projects,
      };
      next.content = compileReadmeToMarkdown(next);
      pushToHistory(next);
      setSaveStatus("unsaved");
      return next;
    });
  };

  const selectedSection =
    (doc.sections || []).find((s) => s.id === selectedSectionId) || null;

  if (loading && !activeReadme) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-12 border-b border-border/80 bg-background/95 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 select-none z-20">
        {/* Left: Back & Project Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/github-readme")}
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Back to READMEs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Input
            value={doc.title || ""}
            onChange={(e) => handleUpdateDoc({ title: e.target.value })}
            className="h-7 text-xs font-semibold max-w-[180px] sm:max-w-xs truncate bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background"
            placeholder="Project Title"
          />

          <Badge variant="outline" className="text-[10px] capitalize hidden md:inline-flex">
            {doc.template?.replace("-", " ")}
          </Badge>
        </div>

        {/* Center: Undo / Redo & Auto-save Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-muted/40">
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <span className="text-[11px] font-mono text-muted-foreground hidden lg:inline-flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                saveStatus === "saved"
                  ? "bg-emerald-500"
                  : saveStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-blue-500"
              }`}
            />
            {saveStatus === "saved"
              ? "All changes saved"
              : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved"}
          </span>
        </div>

        {/* Right: Actions (GitHub Import, AI Assist, Duplicate, Reset, Copy, Download, Save) */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGithubModalOpen(true)}
            className="h-7 text-xs gap-1 cursor-pointer border-border/80 hover:border-primary/50"
            title="Import profile & repositories from GitHub"
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">GitHub Sync</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiAssistantOpen(true)}
            className="h-7 text-xs gap-1 cursor-pointer border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium"
            title="AI Editing Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">AI Assist</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground hidden sm:inline-flex cursor-pointer"
            title="Duplicate README Project"
          >
            <CopyPlus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Duplicate</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToTemplate}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground hidden sm:inline-flex cursor-pointer"
            title="Reset to Template Default"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="h-7 text-xs gap-1 cursor-pointer"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExportDialogInitialTab("export");
              setIsExportDialogOpen(true);
            }}
            className="h-7 text-xs gap-1 cursor-pointer"
            title="Download README.md or Assets ZIP Package"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExportDialogInitialTab("publish");
              setIsExportDialogOpen(true);
            }}
            className="h-7 text-xs gap-1 cursor-pointer border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            title="Publish README directly to your GitHub profile repository"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium">Publish</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 text-xs gap-1 cursor-pointer shadow-sm"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save</span>
          </Button>
        </div>
      </header>

      {/* Mobile / Tablet Panel Switcher Bar (< lg) */}
      <div className="lg:hidden flex items-center justify-around border-b border-border/80 bg-card/60 px-2 py-1.5 shrink-0 text-xs select-none">
        <button
          type="button"
          onClick={() => setMobilePanelTab("sections")}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-md font-medium cursor-pointer transition-colors ${
            mobilePanelTab === "sections"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Sections</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanelTab("preview")}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-md font-medium cursor-pointer transition-colors ${
            mobilePanelTab === "preview"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanelTab("properties")}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-md font-medium cursor-pointer transition-colors ${
            mobilePanelTab === "properties"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Properties</span>
        </button>
      </div>

      {/* 2. THREE-PANEL WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* PANEL 1 (LEFT): SECTIONS & REORDERING */}
        <div className={`h-full lg:block ${mobilePanelTab === "sections" ? "block w-full flex-1" : "hidden"}`}>
          <SectionListPanel
            sections={doc.sections || []}
            selectedSectionId={selectedSectionId}
            onSelectSection={(secId) => {
              setSelectedSectionId(secId);
              if (window.innerWidth < 1024) {
                setMobilePanelTab("properties");
              }
            }}
            onToggleSection={handleToggleSection}
            onReorderSections={handleReorderSections}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
          />
        </div>

        {/* PANEL 2 (CENTER): LIVE PREVIEW & GITHUB CONTAINER */}
        <main
          className={`flex-1 flex flex-col h-full overflow-hidden bg-background ${
            mobilePanelTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Center Toolbar: View Toggles */}
          <div className="h-10 border-b border-border/80 px-4 flex items-center justify-between gap-2 shrink-0 select-none bg-card/20">
            {/* View Mode: Preview vs Raw */}
            <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "raw"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Raw Markdown</span>
              </button>
            </div>

            {/* Device Frame Switcher */}
            {viewMode === "preview" && (
              <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-muted/40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`h-6 w-6 cursor-pointer ${
                    previewDevice === "desktop" ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`h-6 w-6 cursor-pointer ${
                    previewDevice === "mobile" ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Center Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-muted/10">
            {viewMode === "raw" ? (
              <div className="w-full max-w-4xl h-full flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Direct Markdown Editor</span>
                  <span>{(doc.content || "").length} characters</span>
                </div>
                <Textarea
                  value={doc.content || ""}
                  onChange={(e) => handleRawMarkdownChange(e.target.value)}
                  className="flex-1 font-mono text-xs leading-relaxed p-4 bg-neutral-950 text-neutral-100 rounded-lg border-border/80 resize-none"
                  placeholder="# Write GitHub Markdown..."
                />
              </div>
            ) : (
              /* GitHub Profile README Container Mockup */
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === "mobile"
                    ? "max-w-[400px] border-x border-t border-border/80 rounded-t-2xl shadow-xl bg-card"
                    : "max-w-4xl"
                }`}
              >
                {/* GitHub Repo Header Simulation */}
                <div className="border border-border/80 rounded-t-xl bg-card px-4 py-2.5 flex items-center justify-between text-xs font-mono text-muted-foreground border-b-0">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {doc.profile?.githubUsername || "octocat"}
                    </span>
                    <span>/</span>
                    <span className="text-foreground">README.md</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Public
                  </Badge>
                </div>

                {/* Rendered Markdown Preview Body */}
                <div className="border border-border/80 rounded-b-xl bg-card/60 p-4 sm:p-8 shadow-xs">
                  <ReadmeMarkdownPreview
                    markdown={doc.content || ""}
                    title={doc.title}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* PANEL 3 (RIGHT): PROPERTIES & SETTINGS */}
        <div className={`h-full lg:block ${mobilePanelTab === "properties" ? "block w-full flex-1" : "hidden"}`}>
          <PropertiesPanel
            doc={doc}
            selectedSection={selectedSection}
            onUpdateDoc={handleUpdateDoc}
            onUpdateSection={handleUpdateSection}
          />
        </div>
      </div>

      {/* GitHub Integration Modal */}
      <GithubIntegrationModal
        open={isGithubModalOpen}
        onOpenChange={setIsGithubModalOpen}
        initialUsername={doc.profile?.githubUsername}
        onApply={handleApplyGithubData}
      />

      {/* AI Editing Assistant Dialog */}
      <AiAssistantDialog
        open={isAiAssistantOpen}
        onOpenChange={setIsAiAssistantOpen}
        readmeId={id}
        currentDoc={doc}
        onApply={handleApplyAiAssist}
      />

      {/* Export & Publishing Dialog */}
      <ExportPublishDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        doc={doc}
        readmeId={id}
        initialTab={exportDialogInitialTab}
      />
    </div>
  );
}

export default GithubReadmeEditorPage;
