import { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FolderArchive,
  GitBranch,
  GitCommit,
  Info,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateGithubReadme } from "../exportValidation";
import { githubReadmeApi } from "@/api/githubReadme";
import { toast } from "@/lib/toast";
import type { GithubReadme, GithubRepoCheckResult } from "@/types";

interface ExportPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: Partial<GithubReadme>;
  readmeId?: string;
  initialTab?: "export" | "publish";
}

const GithubLogo = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export function ExportPublishDialog({
  open,
  onOpenChange,
  doc,
  readmeId,
  initialTab = "export",
}: ExportPublishDialogProps) {
  const [activeTab, setActiveTab] = useState<"export" | "publish">(initialTab);

  // Copy state
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // GitHub Publishing State
  const [targetUsername, setTargetUsername] = useState(doc.profile?.githubUsername || "octocat");
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem("gh_pat_token") || "");
  const [rememberToken, setRememberToken] = useState(true);
  const [commitMessage, setCommitMessage] = useState("Update GitHub profile README.md");

  const [checkingRepo, setCheckingRepo] = useState(false);
  const [repoStatus, setRepoStatus] = useState<GithubRepoCheckResult | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<string>("");
  const [publishSuccess, setPublishSuccess] = useState<{ repoUrl: string; fileUrl: string } | null>(null);

  // Validation report
  const validation = useMemo(() => {
    return validateGithubReadme(doc.content || "", doc);
  }, [doc]);

  // Handle Copy Markdown
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(doc.content || "");
      setCopied(true);
      toast.success("README markdown copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy markdown to clipboard");
    }
  };

  // Handle Download README.md
  const handleDownloadMarkdown = () => {
    const raw = doc.content || "";
    const blob = new Blob([raw], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded successfully!");
  };

  // Handle Download ZIP Package with assets
  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await githubReadmeApi.downloadZip(readmeId || "new", {
        customMarkdown: doc.content || "",
        title: doc.title || `${targetUsername}_README`,
      });
      toast.success("ZIP Package downloaded with assets and updated paths!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download ZIP package";
      toast.error(msg);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Check Profile Repo Status
  const handleCheckRepo = async () => {
    if (!targetUsername.trim()) {
      toast.error("Please enter your GitHub username");
      return;
    }
    if (!githubToken.trim()) {
      toast.error("Please enter a GitHub Personal Access Token (PAT) with repo permissions");
      return;
    }

    if (rememberToken) {
      localStorage.setItem("gh_pat_token", githubToken.trim());
    }

    setCheckingRepo(true);
    setRepoStatus(null);
    setPublishSuccess(null);

    try {
      const status = await githubReadmeApi.checkProfileRepo(targetUsername.trim(), githubToken.trim());
      setRepoStatus(status);
      toast.success(
        status.repoExists
          ? `Found repository https://github.com/${targetUsername}/${targetUsername}!`
          : `Repository not found. We will create https://github.com/${targetUsername}/${targetUsername} for you.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to check repository";
      toast.error(msg);
    } finally {
      setCheckingRepo(false);
    }
  };

  // Publish to GitHub
  const handlePublish = async () => {
    if (!targetUsername.trim() || !githubToken.trim()) {
      toast.error("GitHub username and Access Token are required.");
      return;
    }

    if (repoStatus?.readmeExists && !confirmOverwrite) {
      toast.error("Please confirm overwriting the existing README.md first.");
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(null);

    try {
      setPublishStep("Verifying repository permissions...");
      if (rememberToken) {
        localStorage.setItem("gh_pat_token", githubToken.trim());
      }

      setPublishStep("Committing README.md to default branch...");
      const result = await githubReadmeApi.publishProfileReadme({
        username: targetUsername.trim(),
        token: githubToken.trim(),
        content: doc.content || "",
        commitMessage: commitMessage.trim() || "Update GitHub profile README.md",
        sha: repoStatus?.sha || null,
        createRepoIfMissing: !repoStatus?.repoExists,
      });

      setPublishSuccess({
        repoUrl: result.repoUrl,
        fileUrl: result.fileUrl,
      });
      toast.success("Successfully published to your GitHub profile!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish README to GitHub";
      toast.error(msg);
    } finally {
      setIsPublishing(false);
      setPublishStep("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold">Export & Publish README</DialogTitle>
              <DialogDescription className="text-xs">
                Export markdown files, download asset packages, or publish directly to your personal GitHub profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 1. PRE-FLIGHT VALIDATION STATUS BANNER */}
        <div
          className={`rounded-lg border p-3 text-xs transition-colors ${
            validation.isValid
              ? "border-emerald-500/30 bg-emerald-500/10"
              : validation.issues.some((i) => i.type === "error")
              ? "border-destructive/40 bg-destructive/5"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : validation.issues.some((i) => i.type === "error") ? (
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="font-semibold text-foreground">
                {validation.isValid
                  ? "GitHub Compatibility: 100% Valid"
                  : validation.issues.some((i) => i.type === "error")
                  ? "Action Required Before Exporting"
                  : "Pre-Flight Validation Notice"}
              </span>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span>{validation.stats.words} words</span>
              <span>•</span>
              <span>{validation.stats.badgeCount} badges</span>
              <span>•</span>
              <span>{validation.stats.imageCount} images</span>
            </div>
          </div>

          {/* Issue Warnings / Errors List */}
          {validation.issues.length > 0 && (
            <div className="mt-2.5 space-y-1.5 border-t border-border/40 pt-2">
              {validation.issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-start gap-1.5 text-[11px]">
                  {issue.type === "error" ? (
                    <span className="text-destructive font-bold shrink-0">✕</span>
                  ) : issue.type === "warning" ? (
                    <span className="text-amber-500 font-bold shrink-0">⚠</span>
                  ) : (
                    <Info className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">{issue.title}: </span>
                    <span className="text-muted-foreground">{issue.description}</span>
                  </div>
                </div>
              ))}
              {validation.issues.length > 3 && (
                <p className="text-[10px] text-muted-foreground italic">
                  + {validation.issues.length - 3} more minor items detected
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. TABS: EXPORT FILES VS PUBLISH DIRECTLY */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full mt-1"
        >
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="export" className="flex items-center gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Download & Copy</span>
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-1.5 text-xs">
              <GithubLogo className="h-3.5 w-3.5" />
              <span>Publish to GitHub</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DOWNLOAD & COPY */}
          <TabsContent value="export" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Pure README.md */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <span>README.md File</span>
                    </h4>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Pure Markdown
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Download the complete Markdown file compatible with GitHub. Preserves all badges, dynamic stats, trophies, and section order.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadMarkdown}
                  className="w-full h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download README.md</span>
                </Button>
              </div>

              {/* Option B: ZIP Package with Images */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <FolderArchive className="h-4 w-4 text-emerald-500" />
                      <span>Full Assets Package (.ZIP)</span>
                    </h4>
                    <Badge variant="secondary" className="text-[10px] font-mono text-emerald-500">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Bundles <code className="text-primary font-mono text-[11px]">README.md</code> together with all uploaded images in an <code className="text-primary font-mono text-[11px]">images/</code> directory with updated relative paths.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="w-full h-8 text-xs gap-1.5 cursor-pointer border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  {downloadingZip ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FolderArchive className="h-3.5 w-3.5" />
                  )}
                  <span>Download Package (ZIP)</span>
                </Button>
              </div>
            </div>

            {/* Quick Copy Markdown Section */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold text-foreground">Copy Markdown to Clipboard</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Instantly paste directly into the GitHub web editor.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="h-8 text-xs gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Markdown"}</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: PUBLISH DIRECTLY TO GITHUB */}
          <TabsContent value="publish" className="space-y-4 pt-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <GithubLogo className="h-3.5 w-3.5" />
                <span>GitHub Profile Repository Magic</span>
              </p>
              <p className="text-muted-foreground">
                GitHub looks for a public repository named exactly like your username (e.g.{" "}
                <code className="text-primary font-mono">{targetUsername}/{targetUsername}</code>).
                When a <code className="text-primary font-mono">README.md</code> is placed at its root, GitHub renders it at the top of your public profile page!
              </p>
            </div>

            {/* Inputs: Username & GitHub Access Token */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pub-username" className="text-xs font-semibold">
                  GitHub Profile Username
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">@</span>
                  <Input
                    id="pub-username"
                    value={targetUsername}
                    onChange={(e) => {
                      setTargetUsername(e.target.value);
                      setRepoStatus(null);
                    }}
                    placeholder="octocat"
                    className="pl-7 h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pub-token" className="text-xs font-semibold flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-primary" />
                    <span>Personal Access Token (PAT)</span>
                  </Label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=AI+GitHub+Profile+README+Builder"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <Input
                    id="pub-token"
                    type="password"
                    value={githubToken}
                    onChange={(e) => {
                      setGithubToken(e.target.value);
                      setRepoStatus(null);
                    }}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="pl-8 h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberToken}
                  onChange={(e) => setRememberToken(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                />
                <span>Save token locally in this browser</span>
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckRepo}
                disabled={checkingRepo || !targetUsername.trim() || !githubToken.trim()}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                {checkingRepo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Check Repo Status</span>
              </Button>
            </div>

            {/* Repository Verification Card */}
            {repoStatus && (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-muted-foreground">Target Profile Repository:</span>
                    <h5 className="font-mono font-semibold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <GithubLogo className="h-4 w-4" />
                      <span>{targetUsername}/{targetUsername}</span>
                    </h5>
                  </div>
                  <Badge variant={repoStatus.repoExists ? "default" : "secondary"} className="text-[10px]">
                    {repoStatus.repoExists ? "Repository Exists" : "Will Create Repository"}
                  </Badge>
                </div>

                {repoStatus.readmeExists ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">README.md Already Exists</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Publishing will update the existing file on branch <code className="font-mono font-bold text-foreground">{repoStatus.defaultBranch || "main"}</code>.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={confirmOverwrite}
                        onChange={(e) => setConfirmOverwrite(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <span>I confirm I want to overwrite the existing README.md</span>
                    </label>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Ready to create README.md for your profile!</span>
                  </div>
                )}

                {/* Commit Message */}
                <div className="space-y-1">
                  <Label htmlFor="pub-commit" className="text-[11px] font-semibold text-muted-foreground">
                    Commit Message
                  </Label>
                  <div className="relative">
                    <GitCommit className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      id="pub-commit"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Update GitHub profile README.md"
                      className="pl-8 h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Final Publish Button */}
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || (repoStatus.readmeExists && !confirmOverwrite)}
                  className="w-full h-9 text-xs gap-2 cursor-pointer shadow-sm"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{publishStep || "Publishing..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Publish Directly to GitHub</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Success Card */}
            {publishSuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>README Published Successfully!</span>
                </div>
                <p className="text-muted-foreground">
                  Your profile repository has been updated. Visit your GitHub profile to see your new showcase live!
                </p>
                <div className="pt-2">
                  <a
                    href={publishSuccess.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
                  >
                    <span>View Repository on GitHub</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
