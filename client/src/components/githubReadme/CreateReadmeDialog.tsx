import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FileUp,
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

  // AI Form states
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("none");
  const [aiTone, setAiTone] = useState<"professional" | "creative" | "minimal" | "hacker">("professional");

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
      const msg = err instanceof Error ? err.message : "Failed to create README";
      toast.error(msg);
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
      const msg = err instanceof Error ? err.message : "Failed to generate README";
      toast.error(msg);
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
      const msg = err instanceof Error ? err.message : "Failed to start blank project";
      toast.error(msg);
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
      const msg = err instanceof Error ? err.message : "Failed to import README";
      toast.error(msg);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-5 w-5" />
            </span>
            <span>Create GitHub Profile README</span>
          </DialogTitle>
          <DialogDescription>
            Choose how you want to start building your personal GitHub profile showcase.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-4 h-11">
            <TabsTrigger value="template" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Choose</span> Template
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="scratch" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <PenTool className="h-4 w-4" />
              Scratch
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <FileUp className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CHOOSE TEMPLATE */}
          <TabsContent value="template" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-title" className="text-xs font-semibold">
                  Project Title
                </Label>
                <Input
                  id="tpl-title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Profile README"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-user" className="text-xs font-semibold">
                  GitHub Username
                </Label>
                <Input
                  id="tpl-user"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. octocat"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Template Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {README_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{tpl.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                      <span className="mt-2 text-[10px] font-mono text-primary font-medium">
                        {tpl.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateFromTemplate} disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Create with Template</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: AI GENERATE */}
          <TabsContent value="ai" className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="ai-prompt" className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Tell AI About Yourself & Your Stack</span>
              </Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. I am a senior full-stack developer with 5 years of experience in React, TypeScript, Node.js, and AWS. I love building cloud microservices, contributing to open source, and mentoring developers. Make my README exciting and clean!"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GitHub Username</Label>
                <Input
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="octocat"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Source Resume (Optional)</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleGenerateAi} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Generate README with AI</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 3: START FROM SCRATCH */}
          <TabsContent value="scratch" className="space-y-4 pt-3">
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

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateScratch} disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Start from Scratch</span>
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 4: IMPORT MARKDOWN */}
          <TabsContent value="import" className="space-y-4 pt-3">
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

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading || !importedMarkdown.trim()} className="gap-2">
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
