import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { githubReadmeApi } from "@/api/githubReadme";
import { toast } from "@/lib/toast";
import type {
  GithubReadme,
  GithubReadmeSection,
} from "@/types";

interface PropertiesPanelProps {
  doc: Partial<GithubReadme>;
  selectedSection: GithubReadmeSection | null;
  onUpdateDoc: (updates: Partial<GithubReadme>) => void;
  onUpdateSection: (sectionId: string, updates: Partial<GithubReadmeSection>) => void;
  className?: string;
  activeTab?: "section" | "settings";
  hideHeaderTabs?: boolean;
}

const STATS_THEMES = [
  { value: "tokyonight", label: "Tokyo Night (Default)" },
  { value: "radical", label: "Radical (Neon Glow)" },
  { value: "nord", label: "Nord (Arctic Blue)" },
  { value: "dracula", label: "Dracula (Vampire)" },
  { value: "github_dark", label: "GitHub Dark (Monochrome)" },
  { value: "onedark", label: "One Dark (Atom)" },
  { value: "matrix", label: "Matrix (Hacker Green)" },
  { value: "highcontrast", label: "High Contrast" },
  { value: "synthwave", label: "Synthwave '84" },
];

const POPULAR_SKILLS = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js",
  "Python", "Go", "Rust", "Docker", "Kubernetes", "AWS",
  "PostgreSQL", "MongoDB", "Redis", "TailwindCSS", "GraphQL",
];

export function PropertiesPanel({
  doc,
  selectedSection,
  onUpdateDoc,
  onUpdateSection,
  className = "",
  activeTab,
  hideHeaderTabs = false,
}: PropertiesPanelProps) {
  const [internalTab, setInternalTab] = useState<"section" | "settings">("section");
  const panelTab = activeTab || internalTab;

  const profile = doc.profile || { name: "", headline: "", bio: "", githubUsername: "octocat" };
  const statsConfig = doc.statsConfig || {
    showGithubStats: true,
    showStreakStats: true,
    showTopLangs: true,
    showTrophies: true,
    showActivityGraph: true,
    statsTheme: "tokyonight",
  };
  const settings = doc.settings || { headerStyle: "wave", layout: "standard", badgesStyle: "for-the-badge" };
  const skills = doc.skills || [];
  const socialLinks = doc.socialLinks || [];
  const projects = doc.projects || [];
  const experience = doc.experience || [];
  const education = doc.education || [];

  // Local helper states for adding items
  const [newSkill, setNewSkill] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] = useState("LinkedIn");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjLink, setNewProjLink] = useState("");
  const [newProjTech, setNewProjTech] = useState("");

  const [newExpRole, setNewExpRole] = useState("");
  const [newExpComp, setNewExpComp] = useState("");
  const [newExpPeriod, setNewExpPeriod] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");

  const [newEduDeg, setNewEduDeg] = useState("");
  const [newEduInst, setNewEduInst] = useState("");
  const [newEduYear, setNewEduYear] = useState("");

  // Asset Upload States
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGif, setUploadingGif] = useState(false);
  const [uploadingCustomImg, setUploadingCustomImg] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);
  const customImgInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, target: "banner" | "gif" | "custom") => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("Please select a valid image file (PNG, JPG, GIF, WebP, SVG)");
      return;
    }

    if (target === "banner") setUploadingBanner(true);
    if (target === "gif") setUploadingGif(true);
    if (target === "custom") setUploadingCustomImg(true);

    try {
      const res = await githubReadmeApi.uploadAsset(file);
      if (target === "banner") {
        onUpdateDoc({ bannerUrl: res.url });
        toast.success("Banner image uploaded!");
      } else if (target === "gif") {
        onUpdateDoc({ gifUrl: res.url });
        toast.success("Mascot GIF uploaded!");
      } else if (target === "custom" && selectedSection) {
        const currentMd = selectedSection.customMarkdown || "";
        const inserted = `${currentMd}\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${res.url})\n`;
        onUpdateSection(selectedSection.id, { customMarkdown: inserted });
        toast.success("Image inserted into custom section!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload asset";
      toast.error(msg);
    } finally {
      if (target === "banner") setUploadingBanner(false);
      if (target === "gif") setUploadingGif(false);
      if (target === "custom") setUploadingCustomImg(false);
    }
  };

  const handleAddSkill = (skillName?: string) => {
    const name = (skillName || newSkill).trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    onUpdateDoc({ skills: [...skills, { name, category: "Languages & Tools" }] });
    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    onUpdateDoc({ skills: skills.filter((_, i) => i !== index) });
  };

  const handleAddSocial = () => {
    if (!newSocialUrl.trim()) return;
    onUpdateDoc({
      socialLinks: [...socialLinks, { platform: newSocialPlatform, url: newSocialUrl.trim() }],
    });
    setNewSocialUrl("");
  };

  const handleRemoveSocial = (index: number) => {
    onUpdateDoc({ socialLinks: socialLinks.filter((_, i) => i !== index) });
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    onUpdateDoc({
      projects: [
        ...projects,
        {
          title: newProjTitle.trim(),
          description: newProjDesc.trim(),
          link: newProjLink.trim(),
          tech: newProjTech.trim(),
          stars: "0",
        },
      ],
    });
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjLink("");
    setNewProjTech("");
  };

  const handleRemoveProject = (index: number) => {
    onUpdateDoc({ projects: projects.filter((_, i) => i !== index) });
  };

  const handleAddExperience = () => {
    if (!newExpRole.trim()) return;
    onUpdateDoc({
      experience: [
        ...experience,
        {
          role: newExpRole.trim(),
          company: newExpComp.trim(),
          period: newExpPeriod.trim(),
          description: newExpDesc.trim(),
        },
      ],
    });
    setNewExpRole("");
    setNewExpComp("");
    setNewExpPeriod("");
    setNewExpDesc("");
  };

  const handleRemoveExperience = (index: number) => {
    onUpdateDoc({ experience: experience.filter((_, i) => i !== index) });
  };

  const handleAddEducation = () => {
    if (!newEduDeg.trim()) return;
    onUpdateDoc({
      education: [
        ...education,
        {
          degree: newEduDeg.trim(),
          institution: newEduInst.trim(),
          year: newEduYear.trim(),
        },
      ],
    });
    setNewEduDeg("");
    setNewEduInst("");
    setNewEduYear("");
  };

  const handleRemoveEducation = (index: number) => {
    onUpdateDoc({ education: education.filter((_, i) => i !== index) });
  };

  return (
    <aside className={`w-full h-full bg-card/20 flex flex-col shrink-0 select-none ${className}`}>
      {/* Panel Switcher (if not hidden) */}
      {!hideHeaderTabs && (
        <div className="p-3 border-b border-border/80">
          <Tabs
            value={panelTab}
            onValueChange={(v) => setInternalTab(v as "section" | "settings")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full h-8 bg-muted/80 p-0.5">
              <TabsTrigger value="section" className="text-xs cursor-pointer">
                {selectedSection ? selectedSection.title : "Section Props"}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs cursor-pointer">
                Global Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {panelTab === "settings" ? (
          /* GLOBAL SETTINGS TAB */
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Stats Cards Theme</Label>
              <Select
                value={statsConfig.statsTheme}
                onValueChange={(val) =>
                  onUpdateDoc({ statsConfig: { ...statsConfig, statsTheme: val } })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATS_THEMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Badges Style</Label>
              <Select
                value={settings.badgesStyle}
                onValueChange={(val: any) =>
                  onUpdateDoc({ settings: { ...settings, badgesStyle: val } })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for-the-badge">for-the-badge (Bold)</SelectItem>
                  <SelectItem value="flat">flat (Clean)</SelectItem>
                  <SelectItem value="flat-square">flat-square (Modern)</SelectItem>
                  <SelectItem value="plastic">plastic (Classic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Custom Banner Image</Label>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {uploadingBanner ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploadingBanner ? "Uploading..." : "Upload File"}</span>
                </button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "banner");
                  }}
                />
              </div>
              <Input
                placeholder="https://example.com/banner.png or upload above"
                value={doc.bannerUrl || ""}
                onChange={(e) => onUpdateDoc({ bannerUrl: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Animated Mascot GIF</Label>
                <button
                  type="button"
                  onClick={() => gifInputRef.current?.click()}
                  disabled={uploadingGif}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {uploadingGif ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploadingGif ? "Uploading..." : "Upload GIF"}</span>
                </button>
                <input
                  ref={gifInputRef}
                  type="file"
                  accept="image/gif,image/webp,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "gif");
                  }}
                />
              </div>
              <Input
                placeholder="https://media.giphy.com/.../giphy.gif or upload above"
                value={doc.gifUrl || ""}
                onChange={(e) => onUpdateDoc({ gifUrl: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        ) : !selectedSection ? (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <Layers className="h-8 w-8 mx-auto opacity-40" />
            <p className="font-semibold text-foreground">No Section Selected</p>
            <p className="text-[11px]">Click any section in the left panel to configure its specific properties.</p>
          </div>
        ) : (
          /* CONTEXTUAL SECTION PROPERTIES */
          <div className="space-y-4">
            {/* Section Title Editor */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Section Heading</Label>
              <Input
                value={selectedSection.title}
                onChange={(e) => onUpdateSection(selectedSection.id, { title: e.target.value })}
                className="h-8 text-xs font-medium"
              />
            </div>

            {/* HEADER SECTION */}
            {selectedSection.type === "header" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Display Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => onUpdateDoc({ profile: { ...profile, name: e.target.value } })}
                    placeholder="Sunil Kumar"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">GitHub Username</Label>
                  <Input
                    value={profile.githubUsername}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, githubUsername: e.target.value } })
                    }
                    placeholder="octocat"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Headline</Label>
                  <Input
                    value={profile.headline}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, headline: e.target.value } })
                    }
                    placeholder="Full-Stack Software Engineer"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Header Style</Label>
                  <Select
                    value={settings.headerStyle}
                    onValueChange={(val: any) =>
                      onUpdateDoc({ settings: { ...settings, headerStyle: val } })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wave">Waving Gradient Capsule</SelectItem>
                      <SelectItem value="capsule">Slice Minimal Capsule</SelectItem>
                      <SelectItem value="typing">Animated Typing SVG</SelectItem>
                      <SelectItem value="minimal">Minimalist Text</SelectItem>
                      <SelectItem value="ascii">Terminal ASCII Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ABOUT / INTRO SECTION */}
            {(selectedSection.type === "about" || selectedSection.type === "intro") && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">About Me (Bio)</Label>
                  <Textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => onUpdateDoc({ profile: { ...profile, bio: e.target.value } })}
                    placeholder="Passionate engineer crafting resilient systems..."
                    className="text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Current Role</Label>
                  <Input
                    value={profile.currentRole || ""}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, currentRole: e.target.value } })
                    }
                    placeholder="Lead Full Stack Engineer"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Currently Building</Label>
                  <Input
                    value={profile.currentWork || ""}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, currentWork: e.target.value } })
                    }
                    placeholder="High-performance cloud tools"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Currently Learning</Label>
                  <Input
                    value={profile.learning || ""}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, learning: e.target.value } })
                    }
                    placeholder="Distributed Consensus & Rust"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Location</Label>
                  <Input
                    value={profile.location || ""}
                    onChange={(e) =>
                      onUpdateDoc({ profile: { ...profile, location: e.target.value } })
                    }
                    placeholder="San Francisco, CA / Remote"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* SKILLS SECTION */}
            {selectedSection.type === "skills" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Add Technology Badge</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Next.js, Go, Docker"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                      className="h-8 text-xs"
                    />
                    <Button size="sm" onClick={() => handleAddSkill()} className="h-8 text-xs gap-1 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>

                {/* Popular tech quick-add chips */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Quick Add Suggestions</Label>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_SKILLS.filter(
                      (p) => !skills.some((s) => s.name.toLowerCase() === p.toLowerCase()),
                    ).slice(0, 8).map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleAddSkill(tech)}
                        className="px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Skills List */}
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-semibold">Current Stack ({skills.length})</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 border border-border/60 rounded-md bg-muted/20">
                    {skills.map((sk, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="gap-1 py-0.5 px-2 text-xs font-mono flex items-center"
                      >
                        <span>{sk.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL LINKS SECTION */}
            {selectedSection.type === "socials" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-2 border border-border/60 rounded-lg p-2.5 bg-muted/20">
                  <Label className="text-xs font-semibold">Add Social Channel</Label>
                  <div className="flex gap-2">
                    <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GitHub">GitHub</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Twitter">Twitter / X</SelectItem>
                        <SelectItem value="Portfolio">Portfolio</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="Discord">Discord</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://..."
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                  <Button size="sm" onClick={handleAddSocial} className="w-full h-8 text-xs gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Channel</span>
                  </Button>
                </div>

                {/* Links list */}
                <div className="space-y-1.5">
                  {socialLinks.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-border/80 rounded-md p-2 text-xs bg-card"
                    >
                      <span className="font-medium text-foreground truncate">
                        {s.platform}: <span className="text-muted-foreground font-mono">{s.url}</span>
                      </span>
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
              </div>
            )}

            {/* STATS SECTION */}
            {(selectedSection.type === "stats" || selectedSection.type === "top_langs" || selectedSection.type === "graph" || selectedSection.type === "trophies") && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Theme</Label>
                  <Select
                    value={statsConfig.statsTheme}
                    onValueChange={(val) =>
                      onUpdateDoc({ statsConfig: { ...statsConfig, statsTheme: val } })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATS_THEMES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">GitHub Stats Card</Label>
                    <Switch
                      checked={statsConfig.showGithubStats}
                      onCheckedChange={(checked) =>
                        onUpdateDoc({ statsConfig: { ...statsConfig, showGithubStats: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Streak Stats Card</Label>
                    <Switch
                      checked={statsConfig.showStreakStats}
                      onCheckedChange={(checked) =>
                        onUpdateDoc({ statsConfig: { ...statsConfig, showStreakStats: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Top Languages Card</Label>
                    <Switch
                      checked={statsConfig.showTopLangs}
                      onCheckedChange={(checked) =>
                        onUpdateDoc({ statsConfig: { ...statsConfig, showTopLangs: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">GitHub Trophies</Label>
                    <Switch
                      checked={statsConfig.showTrophies}
                      onCheckedChange={(checked) =>
                        onUpdateDoc({ statsConfig: { ...statsConfig, showTrophies: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Activity Graph</Label>
                    <Switch
                      checked={statsConfig.showActivityGraph}
                      onCheckedChange={(checked) =>
                        onUpdateDoc({ statsConfig: { ...statsConfig, showActivityGraph: checked } })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS SECTION */}
            {selectedSection.type === "projects" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-2 border border-border/60 rounded-lg p-2.5 bg-muted/20">
                  <Label className="text-xs font-semibold">Add Featured Project</Label>
                  <Input
                    placeholder="Project Name"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Short Description"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Repo / Live URL"
                      value={newProjLink}
                      onChange={(e) => setNewProjLink(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Tech (e.g. Go • Redis)"
                      value={newProjTech}
                      onChange={(e) => setNewProjTech(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button size="sm" onClick={handleAddProject} className="w-full h-8 text-xs gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {projects.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border border-border/80 rounded-md p-2 text-xs bg-card"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProject(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WORK EXPERIENCE SECTION */}
            {selectedSection.type === "experience" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-2 border border-border/60 rounded-lg p-2.5 bg-muted/20">
                  <Label className="text-xs font-semibold">Add Position</Label>
                  <Input
                    placeholder="Job Role (e.g. Senior Software Engineer)"
                    value={newExpRole}
                    onChange={(e) => setNewExpRole(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Company"
                      value={newExpComp}
                      onChange={(e) => setNewExpComp(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Period (e.g. 2022 - Present)"
                      value={newExpPeriod}
                      onChange={(e) => setNewExpPeriod(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Textarea
                    placeholder="Key impact and achievements..."
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <Button size="sm" onClick={handleAddExperience} className="w-full h-8 text-xs gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Role</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-border/80 rounded-md p-2 text-xs bg-card">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{exp.role} @ {exp.company}</p>
                        <p className="text-[11px] text-muted-foreground">{exp.period}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExperience(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION SECTION */}
            {selectedSection.type === "education" && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-2 border border-border/60 rounded-lg p-2.5 bg-muted/20">
                  <Label className="text-xs font-semibold">Add Education</Label>
                  <Input
                    placeholder="Degree (e.g. B.S. in Computer Science)"
                    value={newEduDeg}
                    onChange={(e) => setNewEduDeg(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Institution"
                      value={newEduInst}
                      onChange={(e) => setNewEduInst(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Graduation Year"
                      value={newEduYear}
                      onChange={(e) => setNewEduYear(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button size="sm" onClick={handleAddEducation} className="w-full h-8 text-xs gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Education</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-border/80 rounded-md p-2 text-xs bg-card">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{edu.degree}</p>
                        <p className="text-[11px] text-muted-foreground">{edu.institution} ({edu.year})</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEducation(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM MARKDOWN SECTION */}
            {selectedSection.type === "custom" && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Custom Section Markdown</Label>
                  <button
                    type="button"
                    onClick={() => customImgInputRef.current?.click()}
                    disabled={uploadingCustomImg}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {uploadingCustomImg ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    <span>Insert Image</span>
                  </button>
                  <input
                    ref={customImgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "custom");
                    }}
                  />
                </div>
                <Textarea
                  rows={10}
                  value={selectedSection.customMarkdown || ""}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { customMarkdown: e.target.value })
                  }
                  placeholder="### My Custom Section&#10;&#10;Write any custom GitHub markdown here..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default PropertiesPanel;
