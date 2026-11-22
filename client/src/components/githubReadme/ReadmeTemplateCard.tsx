import { ArrowRight, Eye, CheckCircle2, Sparkles, Gamepad2, LayoutDashboard, Feather, Shield, Brain, Laptop, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReadmeTemplateMeta } from "@/types";

interface ReadmeTemplateCardProps {
  template: ReadmeTemplateMeta;
  onUse: (templateId: ReadmeTemplateMeta["id"]) => void;
  onPreview: (template: ReadmeTemplateMeta) => void;
}

export function ReadmeTemplateCard({ template, onUse, onPreview }: ReadmeTemplateCardProps) {
  // Select icon according to template
  const getTemplateIcon = () => {
    switch (template.id) {
      case "anime-gaming":
        return <Gamepad2 className="h-4 w-4 text-pink-400" />;
      case "modern-dashboard":
        return <LayoutDashboard className="h-4 w-4 text-indigo-400" />;
      case "minimal-aesthetic":
        return <Feather className="h-4 w-4 text-zinc-400" />;
      case "cybersecurity":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "ai-ml":
        return <Brain className="h-4 w-4 text-purple-400" />;
      case "student":
        return <GraduationCap className="h-4 w-4 text-cyan-400" />;
      case "fullstack":
      case "backend":
        return <Laptop className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  // Get background gradient for card thumbnail banner
  const getBannerGradient = () => {
    switch (template.id) {
      case "anime-gaming":
        return "from-pink-950/60 via-purple-950/70 to-cyan-950/60 border-pink-500/30";
      case "modern-dashboard":
        return "from-slate-950 via-indigo-950/60 to-slate-900 border-indigo-500/30";
      case "minimal-aesthetic":
        return "from-zinc-950 via-neutral-900 to-zinc-950 border-zinc-800";
      case "cybersecurity":
        return "from-black via-emerald-950/60 to-black border-emerald-500/40";
      case "ai-ml":
        return "from-violet-950/60 via-slate-950 to-indigo-950/60 border-purple-500/30";
      case "professional":
        return "from-slate-950 via-sky-950/50 to-slate-950 border-sky-500/30";
      case "frontend":
        return "from-rose-950/60 via-amber-950/40 to-slate-950 border-rose-500/30";
      default:
        return "from-blue-950/60 via-neutral-950 to-indigo-950/60 border-blue-500/30";
    }
  };

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div>
        {/* Visual Mock Header Banner */}
        <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${getBannerGradient()} p-4 border-b flex flex-col justify-between`}>
          {/* Top badges */}
          <div className="flex items-center justify-between z-10">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              README.md
            </span>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/20 text-primary border-primary/30">
              {template.badge}
            </Badge>
          </div>

          {/* Center visual mock representing template layout */}
          <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-1.5">
            <div className="flex items-center gap-1.5">
              {getTemplateIcon()}
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {template.id === "anime-gaming"
                  ? "Mohabbat ⚔️ Lv. 42 Sorcerer"
                  : template.id === "cybersecurity"
                  ? "root@security:~# whoami"
                  : template.id === "modern-dashboard"
                  ? "Dev Hugo Yannt 📊 Dashboard"
                  : template.id === "minimal-aesthetic"
                  ? "Imma Shady ⚪ Just Code"
                  : template.id === "student"
                  ? "Joshua Thadi 🎓 Student & Dev"
                  : template.id === "ai-ml"
                  ? "🧠 Neural Research & Models"
                  : template.id === "backend"
                  ? "alex@server:~$ neofetch"
                  : "Sahil Raut 💻 Tech Stack"}
              </span>
            </div>

            {/* Badges preview row */}
            <div className="flex flex-wrap items-center justify-center gap-1 opacity-90">
              {template.id === "anime-gaming" ? (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-pink-600/40 text-pink-300 border border-pink-500/40">LVL 42</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-600/40 text-purple-300 border border-purple-500/40">HP 100%</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-600/40 text-cyan-300 border border-cyan-500/40">RADICAL</span>
                </>
              ) : template.id === "cybersecurity" ? (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">OSCP</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">CTF 1%</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">MATRIX</span>
                </>
              ) : template.id === "minimal-aesthetic" ? (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">TypeScript</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">Go</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">Next.js</span>
                </>
              ) : (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-600/30 text-blue-300 border border-blue-500/30">TypeScript</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-600/30 text-cyan-300 border border-cyan-500/30">React</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">Node.js</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-600/30 text-purple-300 border border-purple-500/30">Docker</span>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar Simulation */}
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-white/10 pt-1.5 z-10">
            <span>theme: {template.statsTheme}</span>
            <span>badges: {template.badgesStyle}</span>
          </div>

          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-radial from-primary/10 to-transparent pointer-events-none" />
        </div>

        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2 leading-relaxed">
                {template.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-4 space-y-3">
          {/* Feature Highlights */}
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {template.features ? (
              template.features.slice(0, 3).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{feat}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Header: <strong className="text-foreground capitalize">{template.headerStyle}</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>GitHub Stats & Streak Cards</span>
                </li>
              </>
            )}
          </ul>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-5 pt-0 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="flex-1 text-xs gap-1.5 h-8 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onUse(template.id)}
          className="flex-1 text-xs gap-1.5 h-8 cursor-pointer"
        >
          <span>Use Template</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ReadmeTemplateCard;
