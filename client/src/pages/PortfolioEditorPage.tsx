import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  Award,
  Briefcase,
  Cpu,
  Eye,
  FolderGit2,
  Globe,
  GraduationCap,
  Layers,
  Layout,
  Loader2,
  Monitor,
  Palette,
  Smartphone,
  Tablet,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { portfoliosApi } from "@/api/portfolios";
import { getApiErrorMessage } from "@/api/client";
import { CertificationsEditor } from "@/components/portfolios/editor/CertificationsEditor";
import { DesignControls } from "@/components/portfolios/editor/DesignControls";
import { EducationEditor } from "@/components/portfolios/editor/EducationEditor";
import { ExperienceEditor } from "@/components/portfolios/editor/ExperienceEditor";
import { PortfolioEditorHeader } from "@/components/portfolios/editor/PortfolioEditorHeader";
import { ProfileEditor } from "@/components/portfolios/editor/ProfileEditor";
import { ProjectsEditor } from "@/components/portfolios/editor/ProjectsEditor";
import { PublishModal } from "@/components/portfolios/editor/PublishModal";
import { PortfolioExportModal } from "@/components/portfolios/export/PortfolioExportModal";
import { ReviewBanner } from "@/components/portfolios/editor/ReviewBanner";
import { SectionOrderControls } from "@/components/portfolios/editor/SectionOrderControls";
import { SkillsEditor } from "@/components/portfolios/editor/SkillsEditor";
import { SocialLinksEditor } from "@/components/portfolios/editor/SocialLinksEditor";
import { PortfolioRenderer } from "@/components/portfolios/PortfolioRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  Portfolio,
  PortfolioCertification,
  PortfolioDesignSettings,
  PortfolioEducation,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioProject,
  PortfolioSkill,
  PortfolioSocialLink,
} from "@/types/portfolio";

type EditorTab = "content" | "design" | "sections";
type ContentSubTab = "profile" | "skills" | "experience" | "projects" | "education" | "certs" | "links";
type ViewportSize = "desktop" | "tablet" | "mobile";

export default function PortfolioEditorPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>("profile");
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  // Autosave State
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error" | "unsaved">("saved");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Refs for race-condition prevention and debounce
  const versionRef = useRef(0);
  const lastSavedSnapshotRef = useRef<string>("");
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const pendingPayloadRef = useRef<Partial<Portfolio> | null>(null);
  const isInitialLoadRef = useRef(true);

  // Load portfolio on mount
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await portfoliosApi.get(id!);
        if (isMounted) {
          setPortfolio(data);
          // Set clean snapshot baseline
          const snapshot = JSON.stringify(extractSavablePayload(data));
          lastSavedSnapshotRef.current = snapshot;
          setSaveState("saved");
          isInitialLoadRef.current = true;
        }
      } catch (err) {
        if (isMounted) setError(getApiErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Performs actual API persist call
  const performSave = async (payload: Partial<Portfolio>) => {
    if (!id || !payload) return;
    const version = ++versionRef.current;
    setSaveState("saving");

    try {
      const updated = await portfoliosApi.update(id, payload);
      // Ensure responses that arrived out of order don't overwrite newer edits
      if (version === versionRef.current) {
        setSaveState("saved");
        lastSavedSnapshotRef.current = JSON.stringify(extractSavablePayload(updated));
        pendingPayloadRef.current = null;
      }
    } catch (err) {
      if (version === versionRef.current) {
        setSaveState("error");
        // Keep pendingPayloadRef intact so user can retry
        toast.error("Autosave failed: " + getApiErrorMessage(err));
      }
    }
  };

  const performSaveRef = useRef(performSave);
  performSaveRef.current = performSave;

  // Debounced autosave effect
  useEffect(() => {
    if (!portfolio || isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    const payload = extractSavablePayload(portfolio);
    const serialized = JSON.stringify(payload);

    // Skip if nothing changed since last confirmed save
    if (serialized === lastSavedSnapshotRef.current) {
      return;
    }

    pendingPayloadRef.current = payload;
    setSaveState("unsaved");

    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      void performSaveRef.current(payload);
    }, 750);

    return () => {
      window.clearTimeout(debounceTimerRef.current);
    };
  }, [portfolio]);

  // Flush any pending save on page unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(debounceTimerRef.current);
      if (pendingPayloadRef.current) {
        void performSaveRef.current(pendingPayloadRef.current);
      }
    };
  }, []);

  const handleManualSave = () => {
    if (!portfolio) return;
    window.clearTimeout(debounceTimerRef.current);
    const payload = extractSavablePayload(portfolio);
    void performSave(payload);
  };

  const handleRetry = () => {
    if (!portfolio) return;
    const payload = pendingPayloadRef.current || extractSavablePayload(portfolio);
    void performSave(payload);
  };

  // Sub-editor state update helpers
  const handleTitleChange = (newTitle: string) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, title: newTitle } : null));
  };

  const handleProfileChange = (profile: PortfolioProfile) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, profile } : null));
  };

  const handleSkillsChange = (skills: PortfolioSkill[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, skills } : null));
  };

  const handleExperienceChange = (experience: PortfolioExperience[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, experience } : null));
  };

  const handleProjectsChange = (projects: PortfolioProject[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, projects } : null));
  };

  const handleEducationChange = (education: PortfolioEducation[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, education } : null));
  };

  const handleCertificationsChange = (certifications: PortfolioCertification[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, certifications } : null));
  };

  const handleSocialLinksChange = (socialLinks: PortfolioSocialLink[]) => {
    if (!portfolio) return;
    setPortfolio((prev) => (prev ? { ...prev, socialLinks } : null));
  };

  const handleDesignChange = (design: PortfolioDesignSettings) => {
    if (!portfolio) return;
    // Template/design update preserves underlying content completely
    setPortfolio((prev) => (prev ? { ...prev, design } : null));
  };

  const handleSectionOrderChange = (
    sectionOrder: string[],
    sectionVisibility: Record<string, boolean>,
  ) => {
    if (!portfolio) return;
    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            design: {
              ...prev.design,
              sectionOrder,
              sectionVisibility,
            },
          }
        : null,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading portfolio editor...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="p-3 w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Portfolio Not Found
          </h2>
          <p className="text-sm text-neutral-500">
            {error || "Could not retrieve the requested portfolio for editing."}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/portfolios">Return to Portfolios</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Header with title & autosave indicator */}
      <PortfolioEditorHeader
        title={portfolio.title}
        onTitleChange={handleTitleChange}
        saveState={saveState}
        onRetry={handleRetry}
        onSaveNow={handleManualSave}
        portfolioId={portfolio._id}
        portfolioSlug={portfolio.slug}
        isPublic={portfolio.publication?.isPublic}
        onPublishClick={() => setPublishModalOpen(true)}
        onExportClick={() => setExportModalOpen(true)}
      />


      {/* Mobile Mode Switcher (Visible on small screens only) */}
      <div className="lg:hidden flex items-center justify-center p-2 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-2 w-full max-w-xs p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            type="button"
            onClick={() => setMobileMode("edit")}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              mobileMode === "edit"
                ? "bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500"
            }`}
          >
            Edit Content
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("preview")}
            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
              mobileMode === "preview"
                ? "bg-white dark:bg-neutral-900 shadow-xs text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: The Editor */}
        <div
          className={`lg:col-span-6 xl:col-span-5 flex flex-col space-y-4 ${
            mobileMode === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Main Category Tabs */}
          <div className="bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 grid grid-cols-3 gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "content"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "design"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Design</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "sections"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Sections</span>
            </button>
          </div>

          {/* Tab Content Panes */}
          {activeTab === "content" && (
            <div className="space-y-4">
              {/* Extraction summary & review banner */}
              <ReviewBanner portfolio={portfolio} />

              {/* Sub-tab navigation for content sections */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <SubTabButton
                  active={contentSubTab === "profile"}
                  onClick={() => setContentSubTab("profile")}
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Profile"
                />
                <SubTabButton
                  active={contentSubTab === "skills"}
                  onClick={() => setContentSubTab("skills")}
                  icon={<Cpu className="h-3.5 w-3.5" />}
                  label="Skills"
                  count={portfolio.skills?.length}
                />
                <SubTabButton
                  active={contentSubTab === "experience"}
                  onClick={() => setContentSubTab("experience")}
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label="Experience"
                  count={portfolio.experience?.length}
                />
                <SubTabButton
                  active={contentSubTab === "projects"}
                  onClick={() => setContentSubTab("projects")}
                  icon={<FolderGit2 className="h-3.5 w-3.5" />}
                  label="Projects"
                  count={portfolio.projects?.length}
                />
                <SubTabButton
                  active={contentSubTab === "education"}
                  onClick={() => setContentSubTab("education")}
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  label="Education"
                  count={portfolio.education?.length}
                />
                <SubTabButton
                  active={contentSubTab === "certs"}
                  onClick={() => setContentSubTab("certs")}
                  icon={<Award className="h-3.5 w-3.5" />}
                  label="Certifications"
                  count={portfolio.certifications?.length}
                />
                <SubTabButton
                  active={contentSubTab === "links"}
                  onClick={() => setContentSubTab("links")}
                  icon={<Globe className="h-3.5 w-3.5" />}
                  label="Links"
                  count={portfolio.socialLinks?.length}
                />
              </div>

              {/* Individual Form Panels */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
                {contentSubTab === "profile" && (
                  <ProfileEditor
                    profile={portfolio.profile || { fullName: "" }}
                    onChange={handleProfileChange}
                  />
                )}
                {contentSubTab === "skills" && (
                  <SkillsEditor
                    skills={portfolio.skills || []}
                    onChange={handleSkillsChange}
                  />
                )}
                {contentSubTab === "experience" && (
                  <ExperienceEditor
                    experience={portfolio.experience || []}
                    onChange={handleExperienceChange}
                  />
                )}
                {contentSubTab === "projects" && (
                  <ProjectsEditor
                    projects={portfolio.projects || []}
                    onChange={handleProjectsChange}
                  />
                )}
                {contentSubTab === "education" && (
                  <EducationEditor
                    education={portfolio.education || []}
                    onChange={handleEducationChange}
                  />
                )}
                {contentSubTab === "certs" && (
                  <CertificationsEditor
                    certifications={portfolio.certifications || []}
                    onChange={handleCertificationsChange}
                  />
                )}
                {contentSubTab === "links" && (
                  <SocialLinksEditor
                    socialLinks={portfolio.socialLinks || []}
                    onChange={handleSocialLinksChange}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "design" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <DesignControls
                design={portfolio.design || { template: "minimal", theme: "system" }}
                onChange={handleDesignChange}
              />
            </div>
          )}

          {activeTab === "sections" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <SectionOrderControls
                sectionOrder={portfolio.design?.sectionOrder}
                sectionVisibility={portfolio.design?.sectionVisibility}
                onChange={handleSectionOrderChange}
              />
            </div>
          )}
        </div>

        {/* Right Pane: Sticky Live Preview */}
        <div
          className={`lg:col-span-6 xl:col-span-7 flex flex-col ${
            mobileMode === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="sticky top-20 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex flex-col">
            {/* Simulated browser header & viewport controls */}
            <div className="px-4 py-2.5 bg-neutral-100/80 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
                  <span>preview:</span>
                  <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[120px] sm:max-w-[200px]">
                    /p/{portfolio.slug || "draft"}
                  </span>
                </div>
              </div>

              {/* Viewport size controls */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewport("desktop")}
                  className={`h-7 w-7 ${
                    viewport === "desktop"
                      ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-xs"
                      : "text-neutral-400"
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewport("tablet")}
                  className={`h-7 w-7 ${
                    viewport === "tablet"
                      ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-xs"
                      : "text-neutral-400"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewport("mobile")}
                  className={`h-7 w-7 ${
                    viewport === "mobile"
                      ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-xs"
                      : "text-neutral-400"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>

                <Button asChild variant="ghost" size="icon" className="h-7 w-7 ml-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200" title="Open Fullscreen Preview">
                  <Link to={`/portfolios/${portfolio._id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Live rendered template container */}
            <div className="p-3 bg-neutral-100/50 dark:bg-neutral-950/60 overflow-x-auto min-h-[600px] max-h-[calc(100vh-140px)] overflow-y-auto">
              <div
                className={`mx-auto transition-all duration-300 rounded-xl overflow-hidden shadow-xs border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 ${
                  viewport === "mobile"
                    ? "max-w-[375px]"
                    : viewport === "tablet"
                      ? "max-w-[768px]"
                      : "w-full"
                }`}
              >
                <PortfolioRenderer
                  portfolio={portfolio}
                  showEmpty={false}
                  sectionOrder={portfolio.design?.sectionOrder}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      {portfolio && (
        <PublishModal
          open={publishModalOpen}
          onOpenChange={setPublishModalOpen}
          portfolio={portfolio}
          onSuccess={(updated) => setPortfolio(updated)}
        />
      )}

      {/* Export Dialog */}
      {portfolio && (
        <PortfolioExportModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          portfolio={portfolio}
        />
      )}
    </div>

  );
}

function SubTabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            active
              ? "bg-white/20 text-white dark:bg-black/10 dark:text-black"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** Extracts only valid database fields to send over wire */
function extractSavablePayload(p: Portfolio): Partial<Portfolio> {
  return {
    title: p.title,
    profile: p.profile,
    skills: p.skills,
    experience: p.experience,
    education: p.education,
    projects: p.projects,
    certifications: p.certifications,
    socialLinks: p.socialLinks,
    design: p.design,
  };
}
