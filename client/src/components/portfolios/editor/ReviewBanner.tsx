import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileSearch, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Portfolio } from "@/types/portfolio";

export interface ReviewBannerProps {
  portfolio: Portfolio;
}

export function ReviewBanner({ portfolio }: ReviewBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const missingItems: string[] = [];
  if (!portfolio.profile?.fullName?.trim()) missingItems.push("Full Name");
  if (!portfolio.profile?.headline?.trim()) missingItems.push("Headline");
  if (!portfolio.profile?.bio?.trim()) missingItems.push("Bio / Summary");
  if (!portfolio.profile?.email?.trim()) missingItems.push("Email address");
  if (!portfolio.skills || portfolio.skills.length === 0) missingItems.push("Skills (0 found)");
  if (!portfolio.experience || portfolio.experience.length === 0) missingItems.push("Experience (0 found)");
  if (!portfolio.projects || portfolio.projects.length === 0) missingItems.push("Projects (0 found)");

  const skillCount = portfolio.skills?.length || 0;
  const projectCount = portfolio.projects?.length || 0;
  const expCount = portfolio.experience?.length || 0;
  const eduCount = portfolio.education?.length || 0;
  const certCount = portfolio.certifications?.length || 0;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs p-4 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <FileSearch className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Extracted Career Information
              </h2>
              {missingItems.length === 0 ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3" /> All core fields present
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 text-[11px] gap-1">
                  <AlertCircle className="h-3 w-3" /> {missingItems.length} items need review
                </Badge>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Parsed from your resume. Review, customize, or remove items below. Values are never fabricated.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1 shrink-0"
        >
          <span>{expanded ? "Hide Details" : "View Breakdown"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          {/* Quick counts */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <strong>{skillCount}</strong> Skills
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <strong>{projectCount}</strong> Projects
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <strong>{expCount}</strong> Roles
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <strong>{eduCount}</strong> Education
            </span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <strong>{certCount}</strong> Certifications
            </span>
          </div>

          {/* Missing or empty items list */}
          {missingItems.length > 0 && (
            <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-2.5 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold block mb-1">Recommended for a strong portfolio:</span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                {missingItems.map((item) => (
                  <li key={item}>Missing {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span>AI extraction only extracts factual data detected in your uploaded source.</span>
          </div>
        </div>
      )}
    </div>
  );
}
