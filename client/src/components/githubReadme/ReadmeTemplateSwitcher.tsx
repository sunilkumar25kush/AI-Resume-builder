import { useState, useMemo } from "react";
import {
  Check,
  ChevronDown,
  Gamepad2,
  LayoutDashboard,
  Feather,
  Shield,
  Brain,
  Laptop,
  GraduationCap,
  Sparkles,
  Search,
  Layers,
  Code2,
  Terminal,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { README_TEMPLATES } from "./templates/registry";
import type { GithubReadmeTemplateId } from "@/types";

interface ReadmeTemplateSwitcherProps {
  currentTemplateId: GithubReadmeTemplateId;
  onSelectTemplate: (templateId: GithubReadmeTemplateId) => void;
  className?: string;
  triggerVariant?: "pill" | "button";
}

type CategoryFilter = "all" | "popular" | "developer" | "dashboard" | "gaming" | "minimal" | "specialized";

const CATEGORIES: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "All Templates" },
  { id: "popular", label: "Popular ★" },
  { id: "developer", label: "Developer" },
  { id: "dashboard", label: "Dashboard" },
  { id: "gaming", label: "Gaming & Anime" },
  { id: "minimal", label: "Minimal" },
  { id: "specialized", label: "Specialized" },
];

export function ReadmeTemplateSwitcher({
  currentTemplateId,
  onSelectTemplate,
  className = "",
  triggerVariant = "pill",
}: ReadmeTemplateSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const currentTemplate = useMemo(() => {
    return README_TEMPLATES.find((t) => t.id === currentTemplateId) || README_TEMPLATES[0];
  }, [currentTemplateId]);

  const filteredTemplates = useMemo(() => {
    return README_TEMPLATES.filter((tpl) => {
      // Category filter
      if (selectedCategory === "popular" && !tpl.badge?.includes("Popular")) {
        return false;
      }
      if (selectedCategory === "developer" && tpl.category !== "developer") {
        return false;
      }
      if (selectedCategory === "dashboard" && tpl.category !== "dashboard") {
        return false;
      }
      if (selectedCategory === "gaming" && tpl.category !== "gaming") {
        return false;
      }
      if (selectedCategory === "minimal" && tpl.category !== "minimal") {
        return false;
      }
      if (selectedCategory === "specialized" && !["specialized", "student", "security"].includes(tpl.category || "")) {
        return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = tpl.name.toLowerCase().includes(query);
        const matchesDesc = tpl.description.toLowerCase().includes(query);
        const matchesTags = tpl.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesBadge = tpl.badge?.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesTags || matchesBadge;
      }

      return true;
    });
  }, [selectedCategory, search]);

  const getTemplateIcon = (tplId: string) => {
    switch (tplId) {
      case "anime-gaming":
        return <Gamepad2 className="h-4 w-4 text-pink-400" />;
      case "modern-dashboard":
        return <LayoutDashboard className="h-4 w-4 text-indigo-400" />;
      case "minimal-aesthetic":
        return <Feather className="h-4 w-4 text-zinc-300" />;
      case "cyberpunk":
      case "cybersecurity":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "ai-ml":
        return <Brain className="h-4 w-4 text-purple-400" />;
      case "student":
        return <GraduationCap className="h-4 w-4 text-cyan-400" />;
      case "hacker-terminal":
        return <Terminal className="h-4 w-4 text-emerald-500" />;
      case "fullstack":
      case "backend":
        return <Code2 className="h-4 w-4 text-amber-400" />;
      default:
        return <Laptop className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleSelect = (tplId: GithubReadmeTemplateId) => {
    onSelectTemplate(tplId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "pill" ? (
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-muted/40 hover:bg-muted hover:border-primary/50 text-xs font-semibold text-foreground transition-all cursor-pointer group shadow-2xs select-none ${className}`}
            title="Click to switch README template"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="truncate max-w-[150px] sm:max-w-none">{currentTemplate.name}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-hover:translate-y-0.5" />
          </button>
        ) : (
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 bg-card hover:bg-muted text-xs font-medium cursor-pointer ${className}`}
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Switch Template: <strong>{currentTemplate.name}</strong></span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[88vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5 shrink-0 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>Change README Template</span>
            </DialogTitle>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs px-2.5 py-0.5 font-mono">
              {README_TEMPLATES.length} Styles Available
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Switch template layouts instantly. Your profile info, bio, links, and selected technologies are safely preserved.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates & tags..."
              className="pl-8 h-8 text-xs bg-muted/30"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((tpl) => {
            const isCurrent = tpl.id === currentTemplateId;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelect(tpl.id)}
                className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all relative flex flex-col justify-between group ${
                  isCurrent
                    ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                    : "border-border/80 hover:border-primary/50 bg-card hover:bg-card/90"
                }`}
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-muted/80">
                        {getTemplateIcon(tpl.id)}
                      </span>
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tpl.name}
                      </h4>
                    </div>
                    {tpl.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-foreground border border-border/60">
                        {tpl.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {tpl.description}
                  </p>

                  {/* Feature Tags */}
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tpl.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom status */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Theme: {tpl.statsTheme || "tokyonight"}
                  </span>
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground group-hover:underline">
                      Use Template →
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
              No README templates found matching "{search}".
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
