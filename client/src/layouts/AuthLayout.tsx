import { Outlet } from "react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/** Centered, editorial shell for authentication pages. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 selection:bg-primary/20">
      {/* Subtle architectural background texture */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <header className="relative z-10 mb-8 flex flex-col items-center gap-2">
        <BrandLogo />
      </header>

      <main className="relative z-10 w-full max-w-md">
        <Outlet />
      </main>

      {/* Human trust signals instead of AI hype */}
      <footer className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/80">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Deterministic ATS Scorer
        </span>
        <span className="text-border" aria-hidden>·</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Recruiter-tested Layouts
        </span>
        <span className="text-border" aria-hidden>·</span>
        <span>Zero Data Resale</span>
      </footer>
    </div>
  );
}
