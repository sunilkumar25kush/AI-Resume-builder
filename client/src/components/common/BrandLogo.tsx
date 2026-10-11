import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  linkToHome?: boolean;
}

/**
 * Bespoke architectural brand mark for ResumeStudio.
 * Replaces generic AI sparkles with a crafted document & precision folio glyph.
 */
export function BrandGlyph({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-transform hover:scale-[1.02]",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        {/* Folio base sheet */}
        <path d="M4 4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
        {/* Folio folded corner */}
        <polyline points="14 2 14 8 20 8" />
        {/* Precision editorial alignment lines */}
        <line x1="8" y1="13" x2="16" y2="13" strokeWidth="2" />
        <line x1="8" y1="17" x2="13" y2="17" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function BrandLogo({ compact = false, className, linkToHome = true }: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5 px-3", compact && "justify-center px-0", className)}>
      <BrandGlyph />
      {!compact ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">Resume</span>
            <span className="text-base font-light tracking-tight text-primary">Studio</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Pro
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/80 font-medium tracking-normal mt-0.5">
            ATS & Career Studio
          </span>
        </div>
      ) : null}
    </div>
  );

  if (!linkToHome) {
    return content;
  }

  return (
    <Link to="/" className="inline-flex outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      {content}
    </Link>
  );
}
