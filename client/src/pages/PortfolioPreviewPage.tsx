import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  Moon,
  Pencil,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { PortfolioRenderer } from "@/components/portfolios/PortfolioRenderer";
import { PublishModal } from "@/components/portfolios/editor/PublishModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Portfolio, PortfolioDesignSettings } from "@/types/portfolio";

const PRESET_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
  { name: "Slate", value: "#475569" },
];

export default function PortfolioPreviewPage() {
  const { id } = useParams<{ id: string }>();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local live design preview overrides (content data remains untouched)
  const [previewTemplate, setPreviewTemplate] = useState<PortfolioDesignSettings["template"]>("devport");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "system">("system");
  const [previewColor, setPreviewColor] = useState<string>("#2563eb");
  const [saving, setSaving] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const data = await portfoliosApi.get(id!);
        if (isMounted) {
          setPortfolio(data);
          const tpl = data.design?.template || "devport";
          setPreviewTemplate(tpl);
          setPreviewTheme(data.design?.theme || "system");
          setPreviewColor(data.design?.primaryColor || "#2563eb");
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSaveDesign = async () => {
    if (!portfolio || !id) return;
    setSaving(true);
    try {
      const updated = await portfoliosApi.update(id, {
        design: {
          ...portfolio.design,
          template: previewTemplate,
          theme: previewTheme,
          primaryColor: previewColor,
        },
      });
      setPortfolio(updated);
      toast.success("Portfolio design settings saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading portfolio website...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Portfolio Not Found
          </h2>
          <p className="text-sm text-neutral-500">
            {error || "Could not retrieve the requested portfolio draft."}
          </p>
          <Button asChild variant="outline">
            <Link to="/portfolios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Construct active preview portfolio object (decoupled design from content)
  const activePreviewPortfolio: Portfolio = {
    ...portfolio,
    design: {
      ...portfolio.design,
      template: previewTemplate,
      theme: previewTheme,
      primaryColor: previewColor,
    },
  };

  return (
    <div className="relative">
      {/* Floating Preview Control Bar */}
      <div className="sticky top-0 z-50 w-full bg-neutral-900/90 text-white backdrop-blur-md border-b border-neutral-800 shadow-lg px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="ghost" className="text-neutral-300 hover:text-white h-8 px-2">
              <Link to="/portfolios">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>Portfolios</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-neutral-700 hidden sm:block" />
            <span className="text-xs font-medium text-neutral-300 truncate max-w-[150px] sm:max-w-xs">
              {portfolio.title}
            </span>
            <Badge variant="outline" className="text-[10px] text-neutral-400 border-neutral-700 uppercase">
              {portfolio.status}
            </Badge>
          </div>

          {/* Interactive Template & Theme Switcher */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Template Selector */}
            <div className="inline-flex rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                onClick={() => setPreviewTemplate("devport")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  previewTemplate === "devport"
                    ? "bg-gradient-to-r from-cyan-600 to-pink-600 text-white shadow-xs font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                DevPort
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate("creative")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  previewTemplate === "creative"
                    ? "bg-purple-600 text-white shadow-xs font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Modern 3D
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate("developer")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  previewTemplate === "developer"
                    ? "bg-neutral-700 text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate("minimal")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  previewTemplate === "minimal"
                    ? "bg-neutral-700 text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Minimal
              </button>
            </div>

            {/* Theme Mode Toggle */}
            <div className="inline-flex rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                title="Light mode"
                onClick={() => setPreviewTheme("light")}
                className={`p-1.5 rounded-md transition-colors ${
                  previewTheme === "light"
                    ? "bg-neutral-700 text-amber-300"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Dark mode"
                onClick={() => setPreviewTheme("dark")}
                className={`p-1.5 rounded-md transition-colors ${
                  previewTheme === "dark"
                    ? "bg-neutral-700 text-blue-300"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Color Accent Picker */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  title={col.name}
                  onClick={() => setPreviewColor(col.value)}
                  className="w-4 h-4 rounded-full border border-white/20 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: col.value }}
                >
                  {previewColor === col.value && <Check className="h-2.5 w-2.5 text-white" />}
                </button>
              ))}
            </div>

            {/* Save Design */}
            <Button
              size="sm"
              onClick={handleSaveDesign}
              disabled={saving}
              className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Theme"}
            </Button>

            {/* Publish Action */}
            <Button
              size="sm"
              onClick={() => setPublishModalOpen(true)}
              className={`h-8 text-xs px-3 gap-1.5 ${
                portfolio.status === "published"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{portfolio.status === "published" ? "Published" : "Publish"}</span>
            </Button>

            {/* Edit Portfolio Content */}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 border-neutral-700 bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700 text-xs px-3 gap-1.5"
            >
              <Link to={`/portfolios/${portfolio._id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Content</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Rendered Portfolio Website */}
      <PortfolioRenderer portfolio={activePreviewPortfolio} />

      {/* Publish Dialog */}
      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        portfolio={portfolio}
        onSuccess={(updated) => setPortfolio(updated)}
      />
    </div>
  );
}
