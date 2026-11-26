import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Eye,
  FileCode,
  Laptop,
  Loader2,
  Moon,
  Pencil,
  Send,
  Smartphone,
  Sun,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGithubReadmeStore } from "@/stores/githubReadme";
import { ReadmeMarkdownPreview } from "@/components/githubReadme/ReadmeMarkdownPreview";
import { ExportPublishDialog } from "@/components/githubReadme/editor/ExportPublishDialog";
import { compileReadmeToMarkdown, getDefaultSections } from "@/components/githubReadme/compiler";
import type { GithubReadme } from "@/types";

export function GithubReadmePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activeReadme, loading, fetchReadmeById } = useGithubReadmeStore();

  const [doc, setDoc] = useState<Partial<GithubReadme> | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [githubTheme, setGithubTheme] = useState<"dark" | "light">("dark");
  const [isCopied, setIsCopied] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReadmeById(id);
    }
  }, [id, fetchReadmeById]);

  useEffect(() => {
    if (activeReadme) {
      const initialSections =
        Array.isArray(activeReadme.sections) && activeReadme.sections.length > 0
          ? activeReadme.sections
          : getDefaultSections(activeReadme.template);

      setDoc({
        ...activeReadme,
        sections: initialSections,
        content: activeReadme.content || compileReadmeToMarkdown({ ...activeReadme, sections: initialSections }),
      });
    }
  }, [activeReadme]);

  const handleCopy = () => {
    if (!doc?.content) return;
    navigator.clipboard.writeText(doc.content);
    setIsCopied(true);
    toast.success("Markdown copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc?.content) return;
    const blob = new Blob([doc.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded README.md");
  };

  if (loading && !doc) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = doc?.profile || { name: "Developer", githubUsername: "octocat" };
  const username = profile.githubUsername || "octocat";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-foreground">
      {/* Top Navigation & Action Toolbar */}
      <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/90 backdrop-blur-md px-4 flex items-center justify-between gap-3 select-none">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/github-readme/${id}/edit`)}
            className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Editor</span>
          </Button>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
              {doc?.title || "GitHub Profile README"}
            </h1>
            <Badge variant="outline" className="text-[10px] capitalize hidden md:inline-flex">
              {doc?.template?.replace("-", " ")}
            </Badge>
          </div>
        </div>

        {/* Center: Viewport & View Mode Toggles */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Preview vs Raw */}
          <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/40 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Raw Markdown</span>
            </button>
          </div>

          {/* GitHub Dark / Light preview simulator */}
          {viewMode === "preview" && (
            <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/40 text-xs">
              <button
                type="button"
                onClick={() => setGithubTheme("dark")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  githubTheme === "dark"
                    ? "bg-neutral-800 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview in GitHub Dark theme"
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setGithubTheme("light")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  githubTheme === "light"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview in GitHub Light theme"
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
            </div>
          )}

          {/* Device viewport */}
          <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDevice("desktop")}
              className={`h-7 w-7 cursor-pointer ${
                device === "desktop" ? "bg-background text-foreground" : "text-muted-foreground"
              }`}
              title="Desktop View (Full Scale)"
            >
              <Laptop className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDevice("mobile")}
              className={`h-7 w-7 cursor-pointer ${
                device === "mobile" ? "bg-background text-foreground" : "text-muted-foreground"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/github-readme/${id}/edit`)}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit README</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs gap-1.5 cursor-pointer"
            title="Download README.md"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPublishOpen(true)}
            className="h-8 text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish</span>
          </Button>
        </div>
      </header>

      {/* Main Preview Canvas Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-neutral-950/90">
        <div
          className={`w-full transition-all duration-300 ${
            device === "mobile" ? "max-w-[420px]" : "max-w-5xl"
          }`}
        >
          {viewMode === "raw" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Raw Markdown Representation</span>
                <span>{(doc?.content || "").length} characters</span>
              </div>
              <pre className="p-6 text-xs sm:text-sm font-mono overflow-x-auto min-h-[500px] bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 whitespace-pre-wrap leading-relaxed select-all">
                {doc?.content || ""}
              </pre>
            </div>
          ) : (
            <div
              className={`rounded-2xl border transition-colors shadow-2xl overflow-hidden ${
                githubTheme === "dark"
                  ? "bg-[#0d1117] border-[#30363d]"
                  : "bg-white border-[#d0d7de]"
              }`}
            >
              {/* GitHub Repository Header Simulation */}
              <div
                className={`px-5 py-3.5 border-b flex items-center justify-between text-xs font-mono ${
                  githubTheme === "dark"
                    ? "bg-[#161b22] border-[#30363d] text-[#8b949e]"
                    : "bg-[#f6f8fa] border-[#d0d7de] text-[#57606a]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{username}</span>
                  <span>/</span>
                  <span className="font-semibold text-foreground">README.md</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Public
                  </Badge>
                </div>
              </div>

              {/* High-Fidelity README Render */}
              <div className="p-6 sm:p-12">
                <ReadmeMarkdownPreview
                  markdown={doc?.content || ""}
                  title={doc?.title}
                  theme={githubTheme}
                  showToolbar={false}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Publish Dialog */}
      {doc && (
        <ExportPublishDialog
          open={isPublishOpen}
          onOpenChange={setIsPublishOpen}
          doc={doc}
          readmeId={id}
          initialTab="publish"
        />
      )}
    </div>
  );
}

export default GithubReadmePreviewPage;
