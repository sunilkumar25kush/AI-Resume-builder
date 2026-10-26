import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { PortfolioRenderer } from "@/components/portfolios/PortfolioRenderer";
import { TEMPLATE_METADATA } from "@/components/portfolios/templates/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorPresetPicker } from "@/components/portfolios/common/ColorPresetPicker";
import { ThemeModeToggle } from "@/components/portfolios/common/ThemeModeToggle";
import type { Portfolio, PortfolioDesignSettings, PortfolioTemplateId } from "@/types/portfolio";

const PublishModal = lazy(() =>
  import("@/components/portfolios/editor/PublishModal").then((m) => ({ default: m.PublishModal })),
);
const PortfolioExportModal = lazy(() =>
  import("@/components/portfolios/export/PortfolioExportModal").then((m) => ({
    default: m.PortfolioExportModal,
  })),
);


const PRESET_FONTS = [
  { id: "Inter", label: "Inter" },
  { id: "Roboto", label: "Roboto" },
  { id: "Merriweather", label: "Merriweather" },
  { id: "Playfair", label: "Playfair" },
  { id: "JetBrains", label: "JetBrains" },
];

const DEFAULT_DEMO_PORTFOLIO: Portfolio = {
  _id: "demo",
  userId: "demo",
  title: "sunil kumar — Portfolio",
  slug: "sunilkumar25kush",
  status: "published",
  profile: {
    fullName: "sunil kumar",
    headline: "HTML and JavaScript developer",
    bio: "Explore sunil kumar's public projects and open-source work.",
    email: "sunilkumar@example.com",
    location: "India",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/sunilkumar25kush" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true" },
  ],
  skills: [
    { name: "JavaScript", category: "Frontend", level: "advanced" },
    { name: "HTML5", category: "Frontend", level: "expert" },
    { name: "CSS3", category: "Frontend", level: "advanced" },
    { name: "React", category: "Frontend", level: "intermediate" },
    { name: "TypeScript", category: "Frontend", level: "intermediate" },
    { name: "Git", category: "Tooling", level: "advanced" },
  ],
  experience: [
    {
      title: "Frontend Developer",
      company: "Independent & Open Source",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      current: true,
      description: "Building modern responsive web experiences, interactive 3D portfolios, and UI components.",
      highlights: [
        "Crafted high-performance portfolio templates matching world-class standards",
        "Engineered smooth SVG bezier web diagrams and responsive layouts",
      ],
    },
  ],
  education: [
    {
      institution: "University",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science",
      startDate: "2021",
      endDate: "2025",
    },
  ],
  projects: [
    {
      title: "AI-Resume-builder",
      description: "Full-stack AI resume and portfolio engine with ATS keyword optimization and dynamic templates.",
      tags: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
      repoUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
      liveUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
      featured: true,
    },
    {
      title: "Interactive Web Experiences",
      description: "Collection of kinetic typography, brutalist poster layouts, and canvas animations.",
      tags: ["JavaScript", "CSS3", "WebGL"],
      repoUrl: "https://github.com/sunilkumar25kush",
      liveUrl: "https://github.com/sunilkumar25kush",
      featured: true,
    },
  ],
  design: {
    template: "spotlight",
    theme: "light",
    primaryColor: "#e3141f",
    fontFamily: "Inter",
  },
  publication: {
    isPublic: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function PortfolioPreviewPage() {
  const { id, templateId } = useParams<{ id?: string; templateId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateQuery = searchParams.get("template") as PortfolioTemplateId | null;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live design preview overrides
  const [previewTemplate, setPreviewTemplate] = useState<PortfolioDesignSettings["template"]>(
    templateId ? (templateId as PortfolioTemplateId) : templateQuery || "spotlight",
  );
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "system">("light");
  const [previewColor, setPreviewColor] = useState<string>("#e3141f");
  const [previewFont, setPreviewFont] = useState<string>("Inter");
  const [saving, setSaving] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isControlsHidden, setIsControlsHidden] = useState(false);

  // Keyboard shortcut listener: Pressing 'h' or 'Escape' toggles preview dock visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        setIsControlsHidden((prev) => !prev);
      } else if (e.key === "Escape" && !isControlsHidden) {
        setIsControlsHidden(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isControlsHidden]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const windowOverride = typeof window !== "undefined" && (window as unknown as { __PORTFOLIO_PREVIEW_DATA__?: Portfolio }).__PORTFOLIO_PREVIEW_DATA__;
      if (windowOverride) {
        if (isMounted) {
          setPortfolio(windowOverride);
          const resolvedTemplate = templateId || templateQuery || windowOverride.design?.template || "spotlight";
          setPreviewTemplate(resolvedTemplate as PortfolioTemplateId);
          setPreviewTheme(windowOverride.design?.theme || "light");
          setPreviewColor(windowOverride.design?.primaryColor || "#e3141f");
          setPreviewFont(windowOverride.design?.fontFamily || "Inter");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        if (id) {
          const data = await portfoliosApi.get(id);
          if (isMounted) {
            setPortfolio(data);
            const resolvedTemplate = templateQuery || data.design?.template || "spotlight";
            setPreviewTemplate(resolvedTemplate);
            setPreviewTheme(data.design?.theme || "light");
            setPreviewColor(data.design?.primaryColor || "#e3141f");
            setPreviewFont(data.design?.fontFamily || "Inter");
          }
        } else if (templateId) {
          // If viewing /portfolio-templates/:templateId, load user's portfolio or default demo
          try {
            const list = await portfoliosApi.list();
            if (isMounted && list && list.length > 0) {
              setPortfolio(list[0]);
              setPreviewTemplate(templateId as PortfolioTemplateId);
              setPreviewTheme(list[0].design?.theme || "light");
              setPreviewColor(list[0].design?.primaryColor || "#e3141f");
              setPreviewFont(list[0].design?.fontFamily || "Inter");
            } else if (isMounted) {
              setPortfolio(DEFAULT_DEMO_PORTFOLIO);
              setPreviewTemplate(templateId as PortfolioTemplateId);
            }
          } catch {
            if (isMounted) {
              setPortfolio(DEFAULT_DEMO_PORTFOLIO);
              setPreviewTemplate(templateId as PortfolioTemplateId);
            }
          }
        } else {
          // Fallback to default demo
          if (isMounted) {
            setPortfolio(DEFAULT_DEMO_PORTFOLIO);
            setPreviewTemplate(templateQuery || "spotlight");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [id, templateId, templateQuery]);

  const handleTemplateChange = (newTemplate: PortfolioTemplateId) => {
    setPreviewTemplate(newTemplate);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("template", newTemplate);
    setSearchParams(newParams, { replace: true });
  };

  const handleSaveDesign = async () => {
    if (!portfolio || !id || portfolio._id === "demo") {
      toast.info("Preset previewed successfully. To save to an account portfolio, create or edit your portfolio.");
      return;
    }
    setSaving(true);
    try {
      const updated = await portfoliosApi.update(id, {
        design: {
          ...portfolio.design,
          template: previewTemplate,
          theme: previewTheme,
          primaryColor: previewColor,
          fontFamily: previewFont,
        },
      });
      setPortfolio(updated);
      toast.success("Portfolio template and theme saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium text-neutral-300">Loading portfolio preview...</p>
        </div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-white">
        <Card className="max-w-md w-full p-6 text-center space-y-4 bg-neutral-900 border-neutral-800 text-neutral-100">
          <h2 className="text-lg font-bold">Portfolio Not Found</h2>
          <p className="text-sm text-neutral-400">
            {error || "Could not retrieve the requested portfolio draft."}
          </p>
          <Button asChild variant="outline" className="border-neutral-700 hover:bg-neutral-800">
            <Link to="/portfolios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const activePortfolio = portfolio || DEFAULT_DEMO_PORTFOLIO;

  // Construct active preview portfolio object
  const activePreviewPortfolio: Portfolio = {
    ...activePortfolio,
    design: {
      ...activePortfolio.design,
      template: previewTemplate,
      theme: previewTheme,
      primaryColor: previewColor,
      fontFamily: previewFont,
    },
  };

  const currentTemplateMeta = TEMPLATE_METADATA.find((t) => t.id === previewTemplate);

  return (
    <div className="min-h-screen w-full relative bg-background antialiased selection:bg-rose-500/20">
      {/* 
        Full-page live portfolio:
        Starts at (0, 0) with zero margin/padding, rendering edge-to-edge
        exactly like a live deployed website in the browser.
      */}
      <main className="w-full min-h-screen">
        <PortfolioRenderer portfolio={activePreviewPortfolio} />
      </main>

      {/* Floating Unobtrusive Preview Control Dock */}
      {isControlsHidden ? (
        <button
          type="button"
          onClick={() => setIsControlsHidden(false)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-950/90 hover:bg-neutral-900 text-white backdrop-blur-md border border-neutral-800 shadow-2xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 group"
          title="Show Portfolio Controls & Template Switcher"
        >
          <Eye className="h-4 w-4 text-rose-500 animate-pulse group-hover:scale-110 transition-transform" />
          <span>Customize ({currentTemplateMeta?.name || previewTemplate})</span>
        </button>
      ) : (
        <aside
          aria-label="Portfolio Preview Controls"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl pointer-events-auto transition-all duration-300"
        >
          <div className="bg-neutral-950/92 backdrop-blur-xl border border-neutral-800 text-white rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Navigation & Portfolio Info */}
            <div className="flex items-center gap-2.5">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-neutral-300 hover:text-white hover:bg-neutral-800/80 h-8 px-2.5 gap-1.5"
              >
                <Link to="/portfolios">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Portfolios</span>
                </Link>
              </Button>

              {id && id !== "demo" && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 border-neutral-700 bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-800 text-xs px-2.5 gap-1.5"
                >
                  <Link to={`/portfolios/${id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Edit Content</span>
                  </Link>
                </Button>
              )}

              <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

              <span className="text-xs font-medium text-neutral-200 truncate max-w-[140px] sm:max-w-[200px]">
                {activePortfolio.profile.fullName || activePortfolio.title}
              </span>

              <Badge
                variant="outline"
                className="text-[10px] text-neutral-400 border-neutral-700 hidden lg:inline-flex uppercase"
              >
                {activePortfolio.status}
              </Badge>
            </div>

            {/* Center: Live Template Switcher (All 20 Templates) */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-[11px] font-medium text-neutral-400">Template:</span>
                <select
                  value={previewTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value as PortfolioTemplateId)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
                >
                  {TEMPLATE_METADATA.map((tpl) => (
                    <option key={tpl.id} value={tpl.id} className="bg-neutral-900 text-white py-1">
                      {tpl.name} {tpl.badge ? `(${tpl.badge})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Mode Toggle */}
              <ThemeModeToggle theme={previewTheme} onChange={setPreviewTheme} />

              {/* Color Accent Picker */}
              <ColorPresetPicker
                currentColor={previewColor}
                onChange={setPreviewColor}
                className="hidden xl:flex"
              />

              {/* Font Selector */}
              <div className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                {PRESET_FONTS.slice(0, 3).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPreviewFont(f.id)}
                    className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${previewFont === f.id
                        ? "bg-neutral-800 text-white font-semibold"
                        : "text-neutral-400 hover:text-neutral-200"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Actions & Collapse */}
            <div className="flex items-center gap-2">
              {id && id !== "demo" && (
                <Button
                  size="sm"
                  onClick={handleSaveDesign}
                  disabled={saving}
                  className="h-8 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 border border-neutral-700"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Theme"}
                </Button>
              )}

              {/* Export Website Button */}
              <Button
                size="sm"
                onClick={() => setExportModalOpen(true)}
                className="h-8 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 border border-neutral-700 gap-1.5"
                title="Download standalone portfolio website or source code"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>

              {id && id !== "demo" && (
                <Button
                  size="sm"
                  onClick={() => setPublishModalOpen(true)}
                  className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 gap-1.5 font-medium shadow-xs"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{activePortfolio.status === "published" ? "Live Settings" : "Publish"}</span>
                </Button>
              )}

              {/* Hide Controls Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsControlsHidden(true)}
                className="h-8 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs px-2 gap-1"
                title="Hide preview controls to view pure website"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hide</span>
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Publish Dialog */}
      {publishModalOpen && activePortfolio && activePortfolio._id !== "demo" && (
        <Suspense fallback={null}>
          <PublishModal
            open={publishModalOpen}
            onOpenChange={setPublishModalOpen}
            portfolio={activePortfolio}
            onSuccess={(updated) => setPortfolio(updated)}
          />
        </Suspense>
      )}

      {/* Export Dialog */}
      {exportModalOpen && activePreviewPortfolio && (
        <Suspense fallback={null}>
          <PortfolioExportModal
            open={exportModalOpen}
            onOpenChange={setExportModalOpen}
            portfolio={activePreviewPortfolio}
          />
        </Suspense>
      )}
    </div>
  );
}
