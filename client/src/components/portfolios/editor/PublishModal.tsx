import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { portfoliosApi } from "@/api/portfolios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Portfolio } from "@/types/portfolio";

export interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio;
  onSuccess: (updated: Portfolio) => void;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PublishModal({
  open,
  onOpenChange,
  portfolio,
  onSuccess,
}: PublishModalProps) {
  const isPublished = portfolio.status === "published" && portfolio.publication?.isPublic;

  const [slug, setSlug] = useState(portfolio.slug || "");
  const [seoTitle, setSeoTitle] = useState(portfolio.publication?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(portfolio.publication?.seoDescription || "");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

  // Sync state whenever modal opens or portfolio updates
  useEffect(() => {
    if (open) {
      setSlug(portfolio.slug || "");
      setSeoTitle(portfolio.publication?.seoTitle || "");
      setSeoDescription(portfolio.publication?.seoDescription || "");
      setShowUnpublishConfirm(false);
      setCopied(false);
    }
  }, [open, portfolio]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/p/${slug.trim() || portfolio.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Public link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  };

  const handlePublishOrRepublish = async () => {
    const cleanSlug = sanitizeSlug(slug);
    if (!cleanSlug) {
      toast.error("Please enter a valid URL slug");
      return;
    }
    if (!SLUG_REGEX.test(cleanSlug)) {
      toast.error("Slug must be lowercase alphanumeric with hyphens (e.g. alex-mercer)");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await portfoliosApi.publish(portfolio._id, {
        slug: cleanSlug,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
      });
      toast.success(isPublished ? "Portfolio republish settings updated!" : "Portfolio published successfully!");
      onSuccess(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setSubmitting(true);
    try {
      const updated = await portfoliosApi.unpublish(portfolio._id);
      toast.success("Portfolio unpublished. It is now private.");
      onSuccess(updated);
      setShowUnpublishConfirm(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              <span>{isPublished ? "Publish Settings & Live URL" : "Publish Portfolio Website"}</span>
            </DialogTitle>
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className="text-[11px] font-semibold tracking-wide uppercase"
            >
              {isPublished ? "Live • Public" : "Draft • Private"}
            </Badge>
          </div>
          <DialogDescription>
            {isPublished
              ? "Your portfolio is live on the web. Anyone with this link can view your published portfolio."
              : "Publish your portfolio to a custom public URL accessible to recruiters and visitors."}
          </DialogDescription>
        </DialogHeader>

        {/* Live URL Card */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Public Web Address
            </span>
            {isPublished && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Online
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate select-all">
              {publicUrl}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs shrink-0"
              title="Copy public link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            {isPublished && (
              <Button
                asChild
                variant="default"
                size="sm"
                className="gap-1.5 text-xs shrink-0 bg-primary text-primary-foreground"
              >
                <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                  <span>Visit</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Form Fields: Slug & SEO */}
        <div className="space-y-4 py-2">
          {/* Custom Slug Input */}
          <div className="space-y-1.5">
            <Label htmlFor="portfolio-slug" className="text-xs font-semibold">
              Custom URL Slug
            </Label>
            <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 focus-within:ring-1 focus-within:ring-primary">
              <span className="text-xs text-neutral-400 font-mono select-none">/p/</span>
              <Input
                id="portfolio-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-name-or-role"
                className="border-0 bg-transparent px-1 font-mono text-xs shadow-none focus-visible:ring-0"
                maxLength={60}
                disabled={submitting}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Lowercase letters, numbers, and hyphens only. Must be unique.
            </p>
          </div>

          {/* SEO Title */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-title" className="text-xs font-semibold">
              SEO Page Title <span className="text-neutral-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`${portfolio.profile?.fullName || portfolio.title} — Portfolio`}
              className="text-xs"
              maxLength={120}
              disabled={submitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Displayed on browser tabs and Google search snippets.
            </p>
          </div>

          {/* SEO Description */}
          <div className="space-y-1.5">
            <Label htmlFor="seo-description" className="text-xs font-semibold">
              SEO Meta Description <span className="text-neutral-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={
                portfolio.profile?.headline
                  ? `${portfolio.profile.headline}. Explore projects, experience, and skills.`
                  : "Explore my professional portfolio website."
              }
              className="text-xs min-h-[60px] resize-none"
              maxLength={300}
              disabled={submitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Summary for search engines and social cards (LinkedIn, Twitter).
            </p>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <p className="font-semibold text-blue-800 dark:text-blue-300">Privacy & Security Guarantee</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
                Only approved public portfolio details are served. Your account email, private notes, raw resume uploads, and database user IDs are strictly excluded from public routes.
              </p>
            </div>
          </div>

          {/* Unpublish Confirmation Warning */}
          {showUnpublishConfirm && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">Are you sure you want to unpublish?</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                  Your portfolio will immediately become private and return a 404 Not Found error to anyone visiting your public link. You can republish at any time.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleUnpublish}
                    disabled={submitting}
                    className="h-7 text-xs"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Confirm Unpublish
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnpublishConfirm(false)}
                    disabled={submitting}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            {isPublished && !showUnpublishConfirm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUnpublishConfirm(true)}
                disabled={submitting}
                className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Unpublish Site</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs"
            >
              Close
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePublishOrRepublish}
              disabled={submitting || showUnpublishConfirm}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isPublished ? (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  <span>Update Published Site</span>
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  <span>Publish Now</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
