import { useState } from "react";
import {
  Check,
  FolderGit2,
  GitBranch,
  Loader2,
  Search,
  Star,
  Users,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { githubReadmeApi } from "@/api/githubReadme";
import type { GithubProfileData, GithubReadmeProject, GithubReadmeSkill } from "@/types";

const GithubLogo = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface GithubIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (data: {
    name?: string;
    headline?: string;
    bio?: string;
    githubUsername?: string;
    location?: string;
    website?: string;
    skills?: GithubReadmeSkill[];
    projects?: GithubReadmeProject[];
  }) => void;
  initialUsername?: string;
}

export function GithubIntegrationModal({
  open,
  onOpenChange,
  onApply,
  initialUsername = "",
}: GithubIntegrationModalProps) {
  const [username, setUsername] = useState(initialUsername || "octocat");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<GithubProfileData | null>(null);

  // Selection states
  const [includeBio, setIncludeBio] = useState(true);
  const [includeSkills, setIncludeSkills] = useState(true);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [selectedProjectIndexes, setSelectedProjectIndexes] = useState<number[]>([0, 1, 2, 3]);

  // Fetch data from GitHub API
  const handleFetchProfile = async () => {
    if (!username.trim()) {
      toast.error("Please enter a GitHub username");
      return;
    }
    setLoading(true);
    try {
      const data = await githubReadmeApi.fetchGithubProfile(username.trim());
      setProfileData(data);
      // Auto-select top 4 repos
      setSelectedProjectIndexes(data.projects.slice(0, 4).map((_, i) => i));
      toast.success(`Found @${data.username} (${data.publicRepos} repos, ${data.totalStars} stars)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load GitHub profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // OAuth Connect trigger
  const handleOAuthConnect = async () => {
    try {
      const oauthUrl = await githubReadmeApi.getGithubOAuthUrl();
      if (oauthUrl) {
        window.location.href = oauthUrl;
      } else {
        toast.info("Direct GitHub API lookup is active (OAuth app credentials not configured on server).");
      }
    } catch {
      toast.error("Failed to initialize GitHub OAuth");
    }
  };

  // Toggle single project selection
  const toggleProject = (index: number) => {
    if (selectedProjectIndexes.includes(index)) {
      setSelectedProjectIndexes(selectedProjectIndexes.filter((i) => i !== index));
    } else {
      setSelectedProjectIndexes([...selectedProjectIndexes, index]);
    }
  };

  // Apply selected information
  const handleApplySelected = () => {
    if (!profileData) return;

    const chosenSkills: GithubReadmeSkill[] = includeSkills
      ? profileData.topLanguages.map((l) => ({
          name: l.language,
          category: "Languages & Tools",
        }))
      : [];

    const chosenProjects: GithubReadmeProject[] = includeProjects
      ? profileData.projects
          .filter((_, idx) => selectedProjectIndexes.includes(idx))
          .map((p) => ({
            title: p.title,
            description: p.description,
            link: p.link,
            tech: p.tech,
            stars: p.stars,
          }))
      : [];

    onApply({
      name: profileData.name || profileData.username,
      headline: profileData.bio ? `${profileData.bio.slice(0, 80)}` : "Software Engineer & Open Source Creator",
      bio: includeBio ? profileData.bio : undefined,
      githubUsername: profileData.username,
      location: includeLocation ? profileData.location : undefined,
      website: profileData.blog,
      skills: chosenSkills.length > 0 ? chosenSkills : undefined,
      projects: chosenProjects.length > 0 ? chosenProjects : undefined,
    });

    toast.success("GitHub information applied to README!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-neutral-900 text-white">
              <GithubLogo className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Import from GitHub</DialogTitle>
              <DialogDescription className="text-xs">
                Fetch public repositories, languages, and statistics to enrich your profile README.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Lookup Input Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-mono">@</span>
              <Input
                placeholder="github username (e.g. octocat, torvalds)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchProfile()}
                className="pl-7 h-9 text-xs font-mono"
              />
            </div>
            <Button
              onClick={handleFetchProfile}
              disabled={loading}
              size="sm"
              className="h-9 text-xs gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              <span>Fetch Data</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleOAuthConnect}
              size="sm"
              className="h-9 text-xs gap-1.5 cursor-pointer shrink-0"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>OAuth Connect</span>
            </Button>
          </div>

          {/* Profile Overview Card */}
          {profileData && (
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-card">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.username}
                  className="h-14 w-14 rounded-full border border-border/60 shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{profileData.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">@{profileData.username}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{profileData.totalStars} Stars</span>
                    </Badge>
                  </div>

                  {profileData.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{profileData.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <strong>{profileData.followers}</strong> followers
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderGit2 className="h-3 w-3" />
                      <strong>{profileData.publicRepos}</strong> repositories
                    </span>
                    {profileData.location && (
                      <span>📍 {profileData.location}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selection Checkboxes */}
              <div className="space-y-3 border border-border/60 rounded-lg p-3 bg-muted/20">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Information to Include
                </Label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBio}
                      onChange={(e) => setIncludeBio(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>Bio & Introduction</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLocation}
                      onChange={(e) => setIncludeLocation(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>Location & City</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSkills}
                      onChange={(e) => setIncludeSkills(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>Top Languages ({profileData.topLanguages.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeProjects}
                      onChange={(e) => setIncludeProjects(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>Featured Repositories</span>
                  </label>
                </div>
              </div>

              {/* Top Languages Preview */}
              {profileData.topLanguages.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Detected Tech Languages</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.topLanguages.map((l) => (
                      <Badge key={l.language} variant="outline" className="text-xs font-mono py-0.5">
                        {l.language} ({l.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Repositories Selector */}
              {profileData.projects.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">
                    Select Repositories to Feature ({selectedProjectIndexes.length} chosen)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border/60 rounded-md">
                    {profileData.projects.map((proj, idx) => {
                      const isSelected = selectedProjectIndexes.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleProject(idx)}
                          className={`p-2.5 rounded border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 bg-card hover:border-border"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProject(idx)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold truncate">{proj.title}</span>
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                {proj.stars}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {proj.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!profileData}
            onClick={handleApplySelected}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Selected Info</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GithubIntegrationModal;
