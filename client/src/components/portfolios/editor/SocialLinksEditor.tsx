import { Globe, Plus, Trash2 } from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioSocialLink } from "@/types/portfolio";

export interface SocialLinksEditorProps {
  socialLinks?: PortfolioSocialLink[];
  onChange: (links: PortfolioSocialLink[]) => void;
}

const PLATFORM_PRESETS = [
  { platform: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { platform: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { platform: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
  { platform: "website", label: "Personal Website", placeholder: "https://alexmercer.dev" },
];

export function SocialLinksEditor({ socialLinks = [], onChange }: SocialLinksEditorProps) {
  const handleAdd = (preset?: { platform: string; label: string }) => {
    onChange([
      ...socialLinks,
      {
        platform: preset?.platform || "website",
        label: preset?.label || "Website",
        url: "",
      },
    ]);
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioSocialLink>) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Globe className="h-4 w-4 text-neutral-500" />
            <span>Profile & Social Links ({socialLinks.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Connect your GitHub, LinkedIn, portfolio blog, and contact URLs.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAdd()}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Custom Link</span>
        </Button>
      </div>

      {/* Quick Add Presets if user has few links */}
      <div className="flex flex-wrap gap-2 pt-1">
        {PLATFORM_PRESETS.map((preset) => {
          const alreadyAdded = socialLinks.some(
            (l) => l.platform.toLowerCase() === preset.platform.toLowerCase(),
          );
          if (alreadyAdded) return null;
          return (
            <Button
              key={preset.platform}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAdd(preset)}
              className="text-xs h-7 px-2.5 gap-1.5 border-dashed"
            >
              <BrandIcon name={preset.platform} size={13} />
              <span>+ {preset.label}</span>
            </Button>
          );
        })}
      </div>

      {socialLinks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No profile links added
          </p>
          <p className="text-xs text-neutral-400">
            Add links so visitors can inspect your code repositories and professional background.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            >
              <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 shrink-0">
                <BrandIcon name={link.platform || "website"} size={16} />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={link.platform || ""}
                  onChange={(e) => handleUpdate(index, { platform: e.target.value })}
                  placeholder="Platform (e.g. github, linkedin)"
                  className="h-8 text-xs font-mono"
                />

                <Input
                  value={link.label || ""}
                  onChange={(e) => handleUpdate(index, { label: e.target.value })}
                  placeholder="Button label (e.g. GitHub)"
                  className="h-8 text-xs"
                />

                <Input
                  value={link.url || ""}
                  onChange={(e) => handleUpdate(index, { url: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs font-mono"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 text-neutral-400 hover:text-red-600 shrink-0"
                title="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
