import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  Edit3,
  Eye,
  FileCode,
  GitPullRequest,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGithubReadmeStore } from "@/stores/githubReadme";
import { README_TEMPLATES, getTemplatePreset } from "@/components/githubReadme/templates/registry";
import { ReadmeTemplateCard } from "@/components/githubReadme/ReadmeTemplateCard";
import { ReadmeMarkdownPreview } from "@/components/githubReadme/ReadmeMarkdownPreview";
import { CreateReadmeDialog } from "@/components/githubReadme/CreateReadmeDialog";
import type { GithubReadme, GithubReadmeTemplateId, ReadmeTemplateMeta } from "@/types";

export function GithubReadmeLandingPage() {
  const navigate = useNavigate();
  const { readmes, loading, fetchReadmes, removeReadme } = useGithubReadmeStore();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialCreateTab, setInitialCreateTab] = useState<"template" | "ai" | "scratch" | "import">("template");
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] = useState<GithubReadmeTemplateId>("developer-tech-stack");

  // Template Preview Dialog State
  const [previewTemplate, setPreviewTemplate] = useState<ReadmeTemplateMeta | null>(null);
  const [previewMarkdown, setPreviewMarkdown] = useState<string>("");

  // Existing Project Preview Dialog State
  const [previewProject, setPreviewProject] = useState<GithubReadme | null>(null);

  // Copy state for project cards
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReadmes();
  }, [fetchReadmes]);

  // Filter templates based on category and search query
  const filteredTemplates = useMemo(() => {
    return README_TEMPLATES.filter((tpl) => {
      const matchesCategory =
        activeCategory === "all" ||
        tpl.category === activeCategory ||
        (activeCategory === "developer" && (tpl.category === "developer" || tpl.id === "fullstack" || tpl.id === "backend")) ||
        (activeCategory === "specialized" && (tpl.category === "specialized" || tpl.id === "ai-ml" || tpl.id === "cybersecurity" || tpl.id === "student" || tpl.id === "open-source"));

      const matchesSearch =
        searchQuery.trim() === "" ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.tags && tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Open Preview Modal for a template
  const handlePreviewTemplate = (tpl: ReadmeTemplateMeta) => {
    const preset = getTemplatePreset(tpl.id, "octocat");
    // Generate sample preview markdown from the preset
    const sampleMd = `<!-- Template: ${tpl.name} -->
${preset.content || `# ${preset.profile?.name || "Developer"}
> ${preset.profile?.headline || "Building impactful software"}

### 🛠️ Technology Stack
\`${preset.skills?.map((s) => s.name).join(" • ") || "TypeScript • React • Node.js"}\`

### 📊 GitHub Stats
![Stats](https://github-readme-stats.vercel.app/api?username=octocat&show_icons=true&theme=${tpl.statsTheme}&hide_border=true)
`}`;
    setPreviewMarkdown(sampleMd);
    setPreviewTemplate(tpl);
  };

  // Launch Create flow directly from a template card
  const handleUseTemplate = (templateId: GithubReadmeTemplateId) => {
    setSelectedTemplateForCreate(templateId);
    setInitialCreateTab("template");
    setIsCreateOpen(true);
  };

  // Copy Markdown of an existing project
  const handleCopyProjectMarkdown = async (readme: GithubReadme) => {
    try {
      await navigator.clipboard.writeText(readme.content || "");
      setCopiedId(readme._id);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  // Download Markdown file directly
  const handleDownloadProjectMarkdown = (readme: GithubReadme) => {
    const blob = new Blob([readme.content || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(readme.title || "README").replace(/\s+/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded!");
  };

  // Delete project
  const handleDeleteProject = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await removeReadme(id);
        toast.success("README project deleted");
      } catch {
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card via-background to-background py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>GitHub Profile README Builder</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Transform Your GitHub Profile Into a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                Stunning Portfolio
              </span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Design, customize, and export professional GitHub READMEs with live stats, dynamic banners, categorized tech badges, animated GIFs, and trophies.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => {
                  setInitialCreateTab("template");
                  setIsCreateOpen(true);
                }}
                className="gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                <span>Create README</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setInitialCreateTab("ai");
                  setIsCreateOpen(true);
                }}
                className="gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Generate with AI</span>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  setInitialCreateTab("import");
                  setIsCreateOpen(true);
                }}
                className="gap-2 cursor-pointer"
              >
                <FileCode className="h-4 w-4" />
                <span>Import .md</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-12 space-y-16">
        {/* 2. PREVIOUSLY CREATED PROJECTS (MY READMES) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>My README Projects</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage, edit, copy markdown, and download your GitHub profile READMEs
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setInitialCreateTab("template");
                setIsCreateOpen(true);
              }}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New README</span>
            </Button>
          </div>

          {loading && readmes.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-card border border-border/60 animate-pulse" />
              ))}
            </div>
          ) : readmes.length === 0 ? (
            <Card className="border-dashed border-2 border-border/80 bg-card/40 py-12 text-center">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <GitPullRequest className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">No README projects yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Choose a template from our library or generate one with AI to elevate your GitHub profile.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setInitialCreateTab("template");
                    setIsCreateOpen(true);
                  }}
                  className="gap-2 cursor-pointer mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First README</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readmes.map((r: GithubReadme) => (
                <Card key={r._id} className="group border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {r.title}
                        </CardTitle>
                        <CardDescription className="text-[11px] mt-0.5 flex items-center gap-2">
                          <span className="capitalize">{r.template.replace("-", " ")}</span>
                          <span>•</span>
                          <span>{new Date(r.updatedAt).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                        {r.status || "draft"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 py-2">
                    <div className="rounded bg-muted/50 p-2.5 font-mono text-[11px] text-muted-foreground line-clamp-3 select-none">
                      {r.content || "Empty README content..."}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-2 flex items-center justify-between gap-1.5 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Quick Preview"
                        onClick={() => setPreviewProject(r)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Copy Markdown"
                        onClick={() => handleCopyProjectMarkdown(r)}
                      >
                        {copiedId === r._id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Download README.md"
                        onClick={() => handleDownloadProjectMarkdown(r)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete"
                        onClick={() => handleDeleteProject(r._id, r.title)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs gap-1 cursor-pointer"
                      onClick={() => navigate(`/github-readme/${r._id}/edit`)}
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 3. TEMPLATE LIBRARY SHOWCASE */}
        <section id="templates-library" className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>GitHub README Template Library</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose from 12 distinct visual identities tailored for developers, researchers, gamers, and leaders.
            </p>
          </div>

          {/* Controls: Search and Categories */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-muted/80 p-1 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="text-xs cursor-pointer">All Templates ({README_TEMPLATES.length})</TabsTrigger>
                <TabsTrigger value="developer" className="text-xs cursor-pointer">Developers</TabsTrigger>
                <TabsTrigger value="dashboard" className="text-xs cursor-pointer">Dashboards</TabsTrigger>
                <TabsTrigger value="gaming" className="text-xs cursor-pointer">Anime & Gaming</TabsTrigger>
                <TabsTrigger value="minimal" className="text-xs cursor-pointer">Minimal</TabsTrigger>
                <TabsTrigger value="creative" className="text-xs cursor-pointer">Creative</TabsTrigger>
                <TabsTrigger value="specialized" className="text-xs cursor-pointer">Specialized</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search templates or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => (
              <ReadmeTemplateCard
                key={tpl.id}
                template={tpl}
                onUse={handleUseTemplate}
                onPreview={handlePreviewTemplate}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 4. TEMPLATE PREVIEW MODAL */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{previewTemplate?.badge}</Badge>
              <DialogTitle className="text-xl font-bold">{previewTemplate?.name}</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <ReadmeMarkdownPreview
              markdown={previewMarkdown}
              title={previewTemplate?.name}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (previewTemplate) {
                  const id = previewTemplate.id;
                  setPreviewTemplate(null);
                  handleUseTemplate(id);
                }
              }}
              className="gap-1.5"
            >
              <span>Use This Template</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. EXISTING PROJECT PREVIEW MODAL */}
      <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{previewProject?.title}</span>
              <Badge variant="outline" className="capitalize">{previewProject?.template}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Last modified on {previewProject?.updatedAt ? new Date(previewProject.updatedAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <ReadmeMarkdownPreview
              markdown={previewProject?.content || ""}
              title={previewProject?.title}
            />
          </div>

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewProject) handleDownloadProjectMarkdown(previewProject);
              }}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download README.md</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewProject(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (previewProject) {
                    navigate(`/github-readme/${previewProject._id}/edit`);
                  }
                }}
                className="gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Open Editor</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. CREATE README DIALOG */}
      <CreateReadmeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialTab={initialCreateTab}
        selectedTemplateId={selectedTemplateForCreate}
      />
    </div>
  );
}

export default GithubReadmeLandingPage;
