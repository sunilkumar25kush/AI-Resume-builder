import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Eye,
  EyeOff,
  FileCode,
  FolderGit2,
  GraduationCap,
  GripVertical,
  Layout,
  Mail,
  Plus,
  Share2,
  Shield,
  Smile,
  Sparkles,
  Terminal,
  Trophy,
  User,
  Zap,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GithubReadmeSection, GithubReadmeSectionType } from "@/types";

interface SectionListPanelProps {
  sections: GithubReadmeSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string, enabled: boolean) => void;
  onReorderSections: (newSections: GithubReadmeSection[]) => void;
  onAddSection: (type: GithubReadmeSectionType, title: string) => void;
  onRemoveSection: (id: string) => void;
}

const SECTION_TYPE_METAS: { type: GithubReadmeSectionType; label: string; icon: any; description: string }[] = [
  { type: "header", label: "Profile Header", icon: Layout, description: "Banner, headline, waving greeting & visitor counter" },
  { type: "intro", label: "Introduction", icon: Smile, description: "Short elevator pitch and headline" },
  { type: "about", label: "About Me", icon: User, description: "Current work, learning, role, and quick facts" },
  { type: "skills", label: "Skills & Technologies", icon: Code2, description: "Categorized shields.io badges & icons" },
  { type: "socials", label: "Social Links", icon: Share2, description: "LinkedIn, X/Twitter, Portfolio, Discord badges" },
  { type: "stats", label: "GitHub Statistics", icon: Zap, description: "GitHub stats card & contribution streak" },
  { type: "trophies", label: "GitHub Trophies", icon: Trophy, description: "GitHub profile trophy achievements" },
  { type: "graph", label: "Contribution Graph", icon: Sparkles, description: "Visual GitHub activity graph" },
  { type: "top_langs", label: "Most Used Languages", icon: Terminal, description: "Compact language breakdown card" },
  { type: "projects", label: "Featured Projects", icon: FolderGit2, description: "Showcase table of repositories and stars" },
  { type: "experience", label: "Work Experience", icon: Briefcase, description: "Career timeline, roles, and company impact" },
  { type: "education", label: "Education", icon: GraduationCap, description: "Degrees, institutions, and graduation years" },
  { type: "certifications", label: "Certifications", icon: Shield, description: "Cloud, security, and developer credentials" },
  { type: "achievements", label: "Achievements", icon: Award, description: "Hackathons won, awards, and milestones" },
  { type: "competitive", label: "Competitive Programming", icon: BookOpen, description: "LeetCode & Codeforces statistics cards" },
  { type: "contact", label: "Contact Information", icon: Mail, description: "Direct channels, email, and social reach-out" },
  { type: "custom", label: "Custom Markdown", icon: FileCode, description: "Freeform raw Markdown section with custom title" },
];

export function SectionListPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onToggleSection,
  onReorderSections,
  onAddSection,
  onRemoveSection,
}: SectionListPanelProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onReorderSections(next);
  };

  const getIconForType = (type: GithubReadmeSectionType) => {
    const meta = SECTION_TYPE_METAS.find((m) => m.type === type);
    const IconComponent = meta?.icon || FileCode;
    return <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />;
  };

  const enabledCount = sections.filter((s) => s.enabled).length;

  return (
    <aside className="w-full lg:w-72 xl:w-80 h-full border-r border-border/80 bg-card/40 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-border/80 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>Sections</span>
            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
              {enabledCount}/{sections.length}
            </Badge>
          </h3>
          <p className="text-[11px] text-muted-foreground">Order & customize layout</p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddModalOpen(true)}
          className="h-7 text-xs gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {sections.map((sec, idx) => {
          const isSelected = sec.id === selectedSectionId;

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`group flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : sec.enabled
                  ? "border-border/80 bg-card hover:border-primary/40 text-foreground"
                  : "border-border/40 bg-muted/30 opacity-60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                {getIconForType(sec.type)}
                <span className="font-medium truncate">{sec.title}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-20"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, "up");
                  }}
                  title="Move Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-20"
                  disabled={idx === sections.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, "down");
                  }}
                  title="Move Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 cursor-pointer ${sec.enabled ? "text-primary" : "text-muted-foreground"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSection(sec.id, !sec.enabled);
                  }}
                  title={sec.enabled ? "Hide Section" : "Show Section"}
                >
                  {sec.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>

                {sec.type === "custom" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSection(sec.id);
                    }}
                    title="Delete Section"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>Add README Section</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Choose a section to include in your profile README.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2 py-2">
            {SECTION_TYPE_METAS.map((meta) => {
              const alreadyExists = sections.some((s) => s.type === meta.type && meta.type !== "custom");
              const IconComp = meta.icon;

              return (
                <button
                  key={meta.type}
                  type="button"
                  disabled={alreadyExists}
                  onClick={() => {
                    onAddSection(meta.type, meta.label);
                    setIsAddModalOpen(false);
                  }}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    alreadyExists
                      ? "opacity-40 bg-muted/20 border-border/40 cursor-not-allowed"
                      : "border-border/80 bg-card hover:border-primary/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{meta.label}</span>
                      {alreadyExists && <span className="text-[10px] text-muted-foreground">Added</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {meta.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

export default SectionListPanel;
