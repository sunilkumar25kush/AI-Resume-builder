import { useState } from "react";
import {
  Sparkles,
  Loader2,
  FileText,
  Briefcase,
  Wand2,
  Layers,
  Palette,
  LayoutGrid,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { githubReadmeApi } from "@/api/githubReadme";
import { toast } from "@/lib/toast";
import type { GithubReadme, AiAssistReadmeInput } from "@/types";

interface AiAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readmeId?: string;
  currentDoc: Partial<GithubReadme>;
  onApply: (updatedDoc: Partial<GithubReadme>) => void;
}

interface AssistantAction {
  id: AiAssistReadmeInput["action"];
  title: string;
  description: string;
  icon: typeof Sparkles;
  badge?: string;
}

const ASSISTANT_ACTIONS: AssistantAction[] = [
  {
    id: "improve-intro",
    title: "Improve my Introduction",
    description: "Polish headline and bio for high engagement and impact.",
    icon: Sparkles,
  },
  {
    id: "make-professional",
    title: "Make More Professional",
    description: "Refine tone for enterprise, recruiters, and hiring managers.",
    icon: Briefcase,
  },
  {
    id: "make-creative",
    title: "Make It Creative & Fun",
    description: "Inject energy, humor, and lively phrasing while keeping skills clear.",
    icon: Wand2,
  },
  {
    id: "add-sections",
    title: "Add Relevant Sections",
    description: "Suggest and populate missing showcase sections (Trophies, Languages, etc.).",
    icon: Layers,
    badge: "Smart Layout",
  },
  {
    id: "improve-about",
    title: "Improve my About Me",
    description: "Structure key bullets: what you're working on, learning, and collaborating on.",
    icon: FileText,
  },
  {
    id: "change-style",
    title: "Change Visual Style",
    description: "Recommend modern badge styles, themes, and visual alignment.",
    icon: Palette,
  },
  {
    id: "optimize-layout",
    title: "Optimize README Layout",
    description: "Reorganize section order for maximum visual hierarchy and readability.",
    icon: LayoutGrid,
  },
  {
    id: "better-intro",
    title: "Better Developer Intro",
    description: "Craft a catchy hook tailored to your primary languages and tools.",
    icon: Lightbulb,
  },
];

export function AiAssistantDialog({
  open,
  onOpenChange,
  readmeId,
  currentDoc,
  onApply,
}: AiAssistantDialogProps) {
  const [selectedAction, setSelectedAction] = useState<AiAssistReadmeInput["action"]>("improve-intro");
  const [customInstruction, setCustomInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultPreview, setResultPreview] = useState<Partial<GithubReadme> | null>(null);

  const handleRunAi = async () => {
    if (!readmeId) {
      toast.error("Please save your project first before using the AI assistant.");
      return;
    }

    setLoading(true);
    setResultPreview(null);

    try {
      const response = await githubReadmeApi.assistAi(readmeId, {
        action: selectedAction,
        instruction: customInstruction.trim() || undefined,
        currentDoc,
      });

      setResultPreview(response);
      toast.success("AI generated improvements! Review and apply below.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = () => {
    if (!resultPreview) return;
    onApply(resultPreview);
    toast.success("Applied AI improvements! You can undo anytime with Ctrl+Z.");
    onOpenChange(false);
    setResultPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>AI README Assistant</span>
          </DialogTitle>
          <DialogDescription>
            Select a refinement action or provide custom instructions. Your genuine skills, GitHub username, and project data are always preserved.
          </DialogDescription>
        </DialogHeader>

        {!resultPreview ? (
          <div className="space-y-4 pt-1">
            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Enhancement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ASSISTANT_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const isSelected = selectedAction === action.id;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setSelectedAction(action.id)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                          : "border-border hover:border-primary/40 bg-card hover:bg-muted/40"
                      }`}
                    >
                      <span
                        className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground flex items-center justify-between gap-1">
                          <span className="truncate">{action.title}</span>
                          {action.badge && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/30 text-primary">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Custom Instructions (Optional)</span>
                <span className="text-[10px] lowercase text-muted-foreground">e.g. emphasize cloud architecture</span>
              </label>
              <Textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Make the intro focus on building scalable backend distributed systems in Go and Node.js. Keep it crisp and punchy."
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleRunAi} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Run AI Assistant</span>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Result Preview & Diff Confirmation */
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Improvements Generated Successfully</p>
                <p className="text-muted-foreground mt-0.5">
                  AI has refined the content and section configuration. Click Apply Changes to update your editor workspace.
                </p>
              </div>
            </div>

            {/* Preview of Key Proposed Updates */}
            <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/20 text-xs">
              {resultPreview.profile?.headline && (
                <div>
                  <span className="text-muted-foreground font-semibold">New Headline:</span>
                  <p className="font-medium text-foreground mt-0.5 p-2 rounded bg-background border border-border/50">
                    {resultPreview.profile.headline}
                  </p>
                </div>
              )}

              {resultPreview.profile?.bio && (
                <div>
                  <span className="text-muted-foreground font-semibold">Updated Bio:</span>
                  <p className="font-medium text-foreground mt-0.5 p-2 rounded bg-background border border-border/50 whitespace-pre-wrap">
                    {resultPreview.profile.bio}
                  </p>
                </div>
              )}

              {resultPreview.sections && resultPreview.sections.length > 0 && (
                <div>
                  <span className="text-muted-foreground font-semibold">
                    Configured Sections ({resultPreview.sections.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resultPreview.sections.map((s, idx) => (
                      <Badge
                        key={s.id || idx}
                        variant={s.enabled ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {s.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResultPreview(null)}
                className="text-xs"
              >
                Back to Options
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Dismiss
                </Button>
                <Button size="sm" onClick={handleApplyChanges} className="gap-1.5">
                  <span>Apply to Editor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
