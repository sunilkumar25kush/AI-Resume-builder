import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Eye,
  GitBranch,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGithubReadmeStore } from "@/stores/githubReadme";
import { ReadmeMarkdownPreview } from "@/components/githubReadme/ReadmeMarkdownPreview";
import type {
  GithubReadmeProfile,
  GithubReadmeStatsConfig,
  GithubReadmeSkill,
  GithubReadmeSocial,
  GithubReadmeProject,
  GithubReadmeSettings,
} from "@/types";

export function GithubReadmeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activeReadme, loading, fetchReadmeById, updateReadme } = useGithubReadmeStore();

  // Local editable state
  const [title, setTitle] = useState("My GitHub Profile README");
  const [template, setTemplate] = useState("developer-tech-stack");
  const [markdown, setMarkdown] = useState("");
  const [profile, setProfile] = useState<GithubReadmeProfile>({
    name: "",
    headline: "",
    bio: "",
    githubUsername: "octocat",
    location: "",
    portfolioUrl: "",
    currentRole: "",
    currentWork: "",
    learning: "",
    askMeAbout: "",
    funFact: "",
    email: "",
  });

  const [statsConfig, setStatsConfig] = useState<GithubReadmeStatsConfig>({
    showGithubStats: true,
    showStreakStats: true,
    showTopLangs: true,
    showTrophies: true,
    showActivityGraph: true,
    statsTheme: "tokyonight",
  });

  const [skills, setSkills] = useState<GithubReadmeSkill[]>([]);
  const [socialLinks, setSocialLinks] = useState<GithubReadmeSocial[]>([]);
  const [projects, setProjects] = useState<GithubReadmeProject[]>([]);
  const [settings, setSettings] = useState<GithubReadmeSettings>({
    headerStyle: "wave",
    layout: "standard",
    badgesStyle: "for-the-badge",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Load readme by ID
  useEffect(() => {
    if (id) {
      fetchReadmeById(id);
    }
  }, [id, fetchReadmeById]);

  // Synchronize store data to local form state
  useEffect(() => {
    if (activeReadme) {
      setTitle(activeReadme.title || "My GitHub Profile README");
      setTemplate(activeReadme.template || "developer-tech-stack");
      setMarkdown(activeReadme.content || "");
      if (activeReadme.profile) setProfile({ ...activeReadme.profile });
      if (activeReadme.statsConfig) setStatsConfig({ ...activeReadme.statsConfig });
      if (Array.isArray(activeReadme.skills)) setSkills([...activeReadme.skills]);
      if (Array.isArray(activeReadme.socialLinks)) setSocialLinks([...activeReadme.socialLinks]);
      if (Array.isArray(activeReadme.projects)) setProjects([...activeReadme.projects]);
      if (activeReadme.settings) setSettings({ ...activeReadme.settings });
    }
  }, [activeReadme]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await updateReadme(id, {
        title,
        content: markdown,
        profile,
        statsConfig,
        skills,
        socialLinks,
        projects,
        settings,
      });
      toast.success("README saved successfully!");
    } catch {
      toast.error("Failed to save README");
    } finally {
      setIsSaving(false);
    }
  }, [id, title, markdown, profile, statsConfig, skills, socialLinks, projects, settings, updateReadme]);

  // Keyboard shortcut for saving (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Copy Markdown
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  // Download Markdown file
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_") || "README"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded!");
  };

  // Skills helpers
  const [newSkillName, setNewSkillName] = useState("");

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), category: "Languages & Tools" }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Social link helpers
  const [newSocialPlatform, setNewSocialPlatform] = useState("LinkedIn");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const handleAddSocial = () => {
    if (!newSocialUrl.trim()) return;
    setSocialLinks([...socialLinks, { platform: newSocialPlatform, url: newSocialUrl.trim() }]);
    setNewSocialUrl("");
  };

  const handleRemoveSocial = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Project helpers
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectLink, setNewProjectLink] = useState("");
  const [newProjectTech, setNewProjectTech] = useState("");

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    setProjects([
      ...projects,
      {
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        link: newProjectLink.trim(),
        tech: newProjectTech.trim(),
        stars: "0",
      },
    ]);
    setNewProjectTitle("");
    setNewProjectDesc("");
    setNewProjectLink("");
    setNewProjectTech("");
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (loading && !activeReadme) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/github-readme")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Back to READMEs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm font-semibold max-w-xs sm:max-w-sm truncate bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background"
            />
            <Badge variant="secondary" className="text-[10px] capitalize shrink-0 hidden sm:inline-flex">
              {template.replace("-", " ")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs gap-1.5 cursor-pointer hidden sm:inline-flex"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{isCopied ? "Copied" : "Copy MD"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs gap-1.5 cursor-pointer hidden sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-sm"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save</span>
          </Button>
        </div>
      </header>

      {/* 2. MAIN SPLIT PANE CONTENT */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT PANE: CONTROLS & VISUAL EDITING (5 COLS) */}
        <section className="lg:col-span-5 border-r border-border/80 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-card/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full bg-muted/80 p-1">
              <TabsTrigger value="profile" className="text-xs cursor-pointer">Profile</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs cursor-pointer">Stats</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs cursor-pointer">Skills</TabsTrigger>
              <TabsTrigger value="socials" className="text-xs cursor-pointer">Socials</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs cursor-pointer">Projects</TabsTrigger>
              <TabsTrigger value="raw" className="text-xs cursor-pointer">Raw MD</TabsTrigger>
            </TabsList>

            {/* TAB 1: PROFILE */}
            <TabsContent value="profile" className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name / Display Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Sunil Kumar"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">GitHub Username</Label>
                <div className="relative">
                  <GitBranch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={profile.githubUsername}
                    onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                    placeholder="e.g. octocat"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Professional Headline</Label>
                <Input
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="Full-Stack Software Engineer & Open-Source Creator"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">About Me (Bio)</Label>
                <Textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Introduce yourself, your passions, and what drives you..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Current Role</Label>
                  <Input
                    value={profile.currentRole || ""}
                    onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                    placeholder="Full Stack Engineer"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Location</Label>
                  <Input
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="India / Remote"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Currently Building / Working On</Label>
                <Input
                  value={profile.currentWork || ""}
                  onChange={(e) => setProfile({ ...profile, currentWork: e.target.value })}
                  placeholder="e.g. AI-powered Developer Tools"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Currently Learning</Label>
                <Input
                  value={profile.learning || ""}
                  onChange={(e) => setProfile({ ...profile, learning: e.target.value })}
                  placeholder="e.g. Distributed Systems & Rust"
                />
              </div>
            </TabsContent>

            {/* TAB 2: GITHUB STATS & THEMES */}
            <TabsContent value="stats" className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Stats Cards Theme</Label>
                <Select
                  value={statsConfig.statsTheme}
                  onValueChange={(val) => setStatsConfig({ ...statsConfig, statsTheme: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyonight">Tokyo Night</SelectItem>
                    <SelectItem value="radical">Radical (Neon)</SelectItem>
                    <SelectItem value="nord">Nord (Arctic)</SelectItem>
                    <SelectItem value="dracula">Dracula</SelectItem>
                    <SelectItem value="onedark">One Dark</SelectItem>
                    <SelectItem value="github_dark">GitHub Dark</SelectItem>
                    <SelectItem value="highcontrast">High Contrast</SelectItem>
                    <SelectItem value="matrix">Matrix Green</SelectItem>
                    <SelectItem value="synthwave">Synthwave 84</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show GitHub Stats Card</Label>
                  <Switch
                    checked={statsConfig.showGithubStats}
                    onCheckedChange={(checked) => setStatsConfig({ ...statsConfig, showGithubStats: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Contribution Streak Stats</Label>
                  <Switch
                    checked={statsConfig.showStreakStats}
                    onCheckedChange={(checked) => setStatsConfig({ ...statsConfig, showStreakStats: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Most Used Languages</Label>
                  <Switch
                    checked={statsConfig.showTopLangs}
                    onCheckedChange={(checked) => setStatsConfig({ ...statsConfig, showTopLangs: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show GitHub Profile Trophies</Label>
                  <Switch
                    checked={statsConfig.showTrophies}
                    onCheckedChange={(checked) => setStatsConfig({ ...statsConfig, showTrophies: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Activity Graph</Label>
                  <Switch
                    checked={statsConfig.showActivityGraph}
                    onCheckedChange={(checked) => setStatsConfig({ ...statsConfig, showActivityGraph: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: SKILLS & BADGES */}
            <TabsContent value="skills" className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. Next.js, Go, Docker)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={handleAddSkill} className="h-8 gap-1 text-xs cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1 py-1 px-2.5 text-xs font-mono flex items-center"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </TabsContent>

            {/* TAB: SOCIAL LINKS */}
            <TabsContent value="socials" className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GitHub">GitHub</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter / X</SelectItem>
                    <SelectItem value="Portfolio">Portfolio</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Discord">Discord</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Profile URL (e.g. https://...)"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSocial()}
                  className="h-8 text-xs flex-1"
                />
                <Button size="sm" onClick={handleAddSocial} className="h-8 gap-1 text-xs cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </Button>
              </div>

              <div className="space-y-1.5 pt-2">
                {socialLinks.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-border/80 rounded-md p-2 text-xs bg-card">
                    <span className="font-medium text-foreground truncate">{s.platform}: <span className="text-muted-foreground font-mono truncate">{s.url}</span></span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSocial(idx)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: PROJECTS */}
            <TabsContent value="projects" className="space-y-4 pt-2">
              <div className="space-y-2 border border-border/60 rounded-lg p-3 bg-muted/20">
                <Label className="text-xs font-semibold">Add New Project</Label>
                <Input
                  placeholder="Project Title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Short Description"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Repository / Live URL"
                    value={newProjectLink}
                    onChange={(e) => setNewProjectLink(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Tech Stack (e.g. React • Node)"
                    value={newProjectTech}
                    onChange={(e) => setNewProjectTech(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button size="sm" onClick={handleAddProject} className="w-full h-8 text-xs gap-1 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Project</span>
                </Button>
              </div>

              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border border-border/80 rounded-md p-2.5 text-xs bg-card"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{proj.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{proj.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProject(idx)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 5: RAW MARKDOWN */}
            <TabsContent value="raw" className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Direct Markdown Editing</Label>
                <span className="text-[10px] text-muted-foreground">{markdown.length} characters</span>
              </div>
              <Textarea
                rows={22}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="font-mono text-xs leading-relaxed bg-neutral-950 text-neutral-100 p-3"
                placeholder="# README.md markdown content..."
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* RIGHT PANE: LIVE MARKDOWN PREVIEW (7 COLS) */}
        <section className="lg:col-span-7 h-full overflow-y-auto p-4 sm:p-8 bg-background">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" />
                Live GitHub Preview
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">README.md</span>
            </div>

            <ReadmeMarkdownPreview
              markdown={markdown}
              title={title}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default GithubReadmeEditorPage;
