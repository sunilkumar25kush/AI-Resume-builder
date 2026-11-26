import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  FileUp,
  GitBranch,
  LayoutTemplate,
  Loader2,
  PenTool,
  Sparkles,
  Terminal,
  Upload,
} from "lucide-react";
import { toast } from "@/lib/toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { githubReadmeApi } from "@/api/githubReadme";
import { getApiErrorMessage } from "@/api/client";
import { useGithubReadmeStore } from "@/stores/githubReadme";
import { useResumesStore } from "@/stores/resumes";
import { useAuthStore } from "@/stores/auth";
import { README_TEMPLATES, getTemplatePreset } from "./templates/registry";
import type { GithubReadmeTemplateId } from "@/types";

interface CreateReadmeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTemplate?: GithubReadmeTemplateId;
  selectedTemplateId?: GithubReadmeTemplateId;
  initialTab?: "template" | "ai" | "scratch" | "import";
}

export function CreateReadmeDialog({
  open,
  onOpenChange,
  defaultTemplate = "developer",
  selectedTemplateId,
  initialTab = "template",
}: CreateReadmeDialogProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const resumes = useResumesStore((state) => state.items);
  const fetchResumes = useResumesStore((state) => state.fetch);

  const createReadme = useGithubReadmeStore((state) => state.create);
  const generateAi = useGithubReadmeStore((state) => state.generateAi);
  const importMarkdown = useGithubReadmeStore((state) => state.importMarkdown);

  const [activeTab, setActiveTab] = useState<"template" | "ai" | "scratch" | "import">(initialTab);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedTemplate, setSelectedTemplate] = useState<GithubReadmeTemplateId>(
    selectedTemplateId || defaultTemplate,
  );
  const [projectTitle, setProjectTitle] = useState("My GitHub Profile README");
  const [githubUsername, setGithubUsername] = useState(user?.github || user?.githubUrl?.split("/").pop() || "octocat");

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (selectedTemplateId) setSelectedTemplate(selectedTemplateId);
  }, [selectedTemplateId]);

  const [templateCategory, setTemplateCategory] = useState<string>("all");

  const filteredTemplates = useMemo(() => {
    return README_TEMPLATES.filter((tpl) => {
      if (templateCategory === "popular" && !tpl.badge?.includes("Popular")) return false;
      if (templateCategory === "developer" && tpl.category !== "developer") return false;
      if (templateCategory === "dashboard" && tpl.category !== "dashboard") return false;
      if (templateCategory === "gaming" && tpl.category !== "gaming") return false;
      if (templateCategory === "minimal" && tpl.category !== "minimal") return false;
      return true;
    });
  }, [templateCategory]);

  // AI Form states
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("none");
  const [aiTone, setAiTone] = useState<"professional" | "creative" | "minimal" | "hacker">("professional");
  const [fetchingGithub, setFetchingGithub] = useState(false);

  const handleFetchGithubForAi = async () => {
    if (!githubUsername.trim()) {
      toast.error("Please enter a GitHub username first.");
      return;
    }
    setFetchingGithub(true);
    try {
      const data = await githubReadmeApi.fetchGithubProfile(githubUsername.trim());
      let addition = `\n\n[GitHub Profile: @${data.username}]`;
      if (data.name) addition += `\nName: ${data.name}`;
      if (data.bio) addition += `\nBio: ${data.bio}`;
      if (data.topLanguages && data.topLanguages.length > 0) {
        addition += `\nTop Languages: ${data.topLanguages.map((l) => l.language).join(", ")}`;
      }
      if (data.projects && data.projects.length > 0) {
        const topRepos = data.projects
          .slice(0, 4)
          .map((r) => `${r.title} (${r.tech || "Code"}: ${r.description || "project"})`)
          .join("; ");
        addition += `\nKey Repositories: ${topRepos}`;
      }
      setAiPrompt((prev) => (prev ? `${prev.trim()}${addition}` : addition.trim()));
      toast.success(`Fetched GitHub context for @${data.username}! Added to prompt.`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to fetch GitHub profile");
    } finally {
      setFetchingGithub(false);
    }
  };

  // Import Form states
  const [importedMarkdown, setImportedMarkdown] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedTemplate(defaultTemplate);
      void fetchResumes();
    }
  }, [open, defaultTemplate, fetchResumes]);

  const handleCreateFromTemplate = async () => {
    setLoading(true);
    try {
      const preset = getTemplatePreset(selectedTemplate, githubUsername.trim() || "octocat");
      preset.title = projectTitle.trim() || `${selectedTemplate} README`;
      const created = await createReadme(preset);
      toast.success("GitHub README project created!");
      onOpenChange(false);
      navigate(`/github-readme/${created._id || created.id}/edit`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to create README");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    setLoading(true);
    try {
      const created = await generateAi({
        prompt: aiPrompt.trim(),
        resumeId: selectedResumeId !== "none" ? selectedResumeId : undefined,
        githubUsername: githubUsername.trim() || "octocat",
        template: selectedTemplate,
        tone: aiTone,
      });
      toast.success("AI generated your GitHub Profile README!");
      onOpenChange(false);
      navigate(`/github-readme/${created._id || created.id}/edit`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to generate README");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScratch = async () => {
    setLoading(true);
    try {
      const created = await createReadme({
        title: projectTitle.trim() || "Blank GitHub Profile",
        template: "custom",
        sourceOption: "scratch",
        profile: {
          name: user?.name || "Developer",
          headline: "Software Engineer",
          bio: "Welcome to my GitHub profile!",
          githubUsername: githubUsername.trim() || "octocat",
        },
        statsConfig: {
          showGithubStats: true,
          showStreakStats: true,
          showTopLangs: true,
          showTrophies: false,
          showActivityGraph: false,
          statsTheme: "tokyonight",
        },
        skills: [{ name: "JavaScript" }, { name: "TypeScript" }, { name: "React" }],
        socialLinks: [{ platform: "GitHub", url: `https://github.com/${githubUsername || "octocat"}` }],
        settings: {
          headerStyle: "wave",
          layout: "standard",
          badgesStyle: "for-the-badge",
        },
      });
      toast.success("Started blank README project!");
      onOpenChange(false);
      navigate(`/github-readme/${created._id || created.id}/edit`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to start blank project");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importedMarkdown.trim()) {
      toast.error("Please paste or upload Markdown content first");
      return;
    }
    setLoading(true);
    try {
      const created = await importMarkdown({
        markdown: importedMarkdown,
        title: projectTitle.trim() || "Imported README",
      });
      toast.success("Imported README successfully!");
      onOpenChange(false);
      navigate(`/github-readme/${created._id || created.id}/edit`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || "Failed to import README");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportedMarkdown(text);
      setProjectTitle(file.name.replace(/\.md$/i, "") || "Imported README");
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-5 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-1">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-5 w-5" />
            </span>
            <span>Create GitHub Profile README</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose how you want to start building your personal GitHub profile showcase.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          className="w-full mt-1 flex-1 flex flex-col overflow-hidden min-h-0"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-xl gap-1 shrink-0">
            <TabsTrigger
              value="template"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span>Choose Template</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>AI Generate</span>
            </TabsTrigger>
            <TabsTrigger
              value="scratch"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>From Scratch</span>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import Markdown</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CHOOSE TEMPLATE */}
          <TabsContent value="template" className="flex-1 flex flex-col overflow-hidden min-h-0 space-y-3 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <div className="space-y-1">
                <Label htmlFor="tpl-title" className="text-xs font-semibold">
                  Project Title
                </Label>
                <Input
                  id="tpl-title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Profile README"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tpl-user" className="text-xs font-semibold">
                  GitHub Username
                </Label>
                <Input
                  id="tpl-user"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. octocat"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 shrink-0 pt-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Template Style ({filteredTemplates.length})
              </Label>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  { id: "all", label: "All" },
                  { id: "popular", label: "Popular ★" },
                  { id: "developer", label: "Developer" },
                  { id: "dashboard", label: "Dashboard" },
                  { id: "gaming", label: "Gaming 🎮" },
                  { id: "minimal", label: "Minimal" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTemplateCategory(c.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      templateCategory === c.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-h-[180px]">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left p-3 rounded-xl border-2 text-xs transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                        : "border-border/80 hover:border-primary/50 bg-card hover:bg-card/90"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {tpl.name}
                        </span>
                        {tpl.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-foreground border border-border/60 shrink-0">
                            {tpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                      {tpl.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tpl.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {tpl.statsTheme || "tokyonight"}
                      </span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Check className="h-3 w-3" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <DialogFooter className="pt-2 shrink-0 border-t border-border/60">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleCreateFromTemplate} disabled={loading} className="gap-2 cursor-pointer shadow-sm">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Create with Template</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: AI GENERATE */}
          <TabsContent value="ai" className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-4 pt-3 min-h-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-prompt" className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Tell AI About Yourself & Your Stack</span>
                </Label>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Click a template idea below to auto-fill
                </span>
              </div>

              {/* Quick Prompt Ideas */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setAiPrompt(
                      "I am a full-stack developer specializing in React, Node.js, MongoDB, and TypeScript. I want a modern dark-themed GitHub profile with animated elements, tech stack badges, and GitHub statistics.",
                    );
                    setSelectedTemplate("developer-tech-stack");
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ⚡ Full-Stack Developer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiPrompt(
                      "I am a backend & systems engineer working with Go, Docker, and Kubernetes. I prefer a clean, minimal monochrome GitHub profile with repository metrics and system architecture.",
                    );
                    setSelectedTemplate("minimal-aesthetic");
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  🌱 Minimal Monochrome
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiPrompt(
                      "I am an AI / ML engineer working with PyTorch, LLMs, and computer vision. I want a research-oriented GitHub README with model showcases, HuggingFace badges, and arXiv links.",
                    );
                    setSelectedTemplate("ai-ml");
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  🧠 AI / ML Researcher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiPrompt(
                      "I am a creative software developer who loves gaming, anime aesthetics, and interactive web tools. I want a vibrant dark theme with GIF support and trophies.",
                    );
                    setSelectedTemplate("anime-gaming");
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  🎮 Anime & Gaming
                </button>
              </div>

              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. I am a senior full-stack developer specializing in React, TypeScript, and Node.js. Make my README exciting, modern, and clean!"
                rows={4}
                className="resize-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">GitHub Username</Label>
                  <button
                    type="button"
                    onClick={handleFetchGithubForAi}
                    disabled={fetchingGithub || !githubUsername.trim()}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Fetch public GitHub repos & languages into prompt"
                  >
                    {fetchingGithub ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <GitBranch className="h-3 w-3" />
                    )}
                    <span>{fetchingGithub ? "Fetching..." : "Fetch Info"}</span>
                  </button>
                </div>
                <Input
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="octocat"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Source Resume (Optional)</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="None (from prompt)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (from prompt)</SelectItem>
                    {resumes.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.parsedData?.name ? `${r.parsedData.name}'s Resume` : (r.fileName || "Untitled Resume")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Profile Tone</Label>
                <Select value={aiTone} onValueChange={(v) => setAiTone(v as typeof aiTone)}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative & Fun</SelectItem>
                    <SelectItem value="minimal">Minimalist</SelectItem>
                    <SelectItem value="hacker">Hacker / Terminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2 shrink-0 border-t border-border/60 mt-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleGenerateAi} disabled={loading} className="gap-2 cursor-pointer shadow-sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Generate README with AI</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 3: START FROM SCRATCH */}
          <TabsContent value="scratch" className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-4 pt-3 min-h-0">
            <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="scratch-title" className="text-xs font-semibold">
                  README Project Name
                </Label>
                <Input
                  id="scratch-title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Custom Developer README"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scratch-user" className="text-xs font-semibold">
                  GitHub Username
                </Label>
                <Input
                  id="scratch-user"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="octocat"
                />
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                You will be redirected to the interactive visual editor where you can toggle sections, pick themes, add live GitHub stats cards, and customize badges from scratch.
              </p>
            </div>

            <DialogFooter className="pt-2 shrink-0 border-t border-border/60 mt-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleCreateScratch} disabled={loading} className="gap-2 cursor-pointer shadow-sm">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Start from Scratch</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 4: IMPORT MARKDOWN */}
          <TabsContent value="import" className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-4 pt-3 min-h-0">
            <div className="space-y-3">
              {/* Dropzone */}
              <label
                htmlFor="md-file"
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/10 text-center"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Click to upload existing <strong>README.md</strong> or drag & drop
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Accepts .md and .markdown files
                </span>
                <input
                  id="md-file"
                  type="file"
                  accept=".md,.markdown,text/markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="space-y-1.5">
                <Label htmlFor="paste-md" className="text-xs font-semibold">
                  Or Paste Raw Markdown Code Directly:
                </Label>
                <Textarea
                  id="paste-md"
                  value={importedMarkdown}
                  onChange={(e) => setImportedMarkdown(e.target.value)}
                  placeholder="# Hi there 👋&#10;&#10;Paste your existing GitHub Profile README markdown here..."
                  rows={6}
                  className="font-mono text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 shrink-0 border-t border-border/60 mt-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading || !importedMarkdown.trim()} className="gap-2 cursor-pointer shadow-sm">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Import and Open in Editor</span>
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
export default CreateReadmeDialog;
