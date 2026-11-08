import { Suspense, lazy, useEffect } from "react";

import { LandingHero } from "@/components/landing/LandingHero";
import { LandingNav } from "@/components/landing/LandingNav";

// Below-the-fold sections live in a separate chunk (framer-motion, showcase,
// FAQ, ...) so they never block the hero's first paint (FCP / LCP).
const loadBelowFold = () => import("@/components/landing/LandingBelowFold");
const LandingBelowFold = lazy(loadBelowFold);
const LandingFooter = lazy(() => loadBelowFold().then((m) => ({ default: m.LandingFooter })));

export default function LandingPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "ResumeBuddy — Deterministic ATS Resume & Developer Portfolio Generator";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-[#131209] text-foreground antialiased selection:bg-primary/20 selection:text-primary transition-colors">
      {/* Keyboard accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
      >
        Skip to main content
      </a>

      {/* Floating Header Navigation */}
      <LandingNav />

      {/* Main Content Landmark */}
      <main id="main-content" className="relative flex flex-col overflow-hidden">
        {/* Hero Section with Dual Pane Visuals */}
        <LandingHero />

        {/* Proof Brand Strip */}
        <section
          aria-label="Engineers hired at"
          className="py-10 border-y border-border/60 bg-muted/20 dark:bg-[#181818]/60"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
              Optimized for candidates interviewing across top engineering teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-muted-foreground/60 font-semibold text-sm sm:text-base">
              <span className="hover:text-foreground transition-colors">Stripe</span>
              <span className="hover:text-foreground transition-colors">Vercel</span>
              <span className="hover:text-foreground transition-colors">Datadog</span>
              <span className="hover:text-foreground transition-colors">Linear</span>
              <span className="hover:text-foreground transition-colors">Shopify</span>
              <span className="hover:text-foreground transition-colors">Cloudflare</span>
            </div>
          </div>
        </section>

        {/* Below-the-fold sections (lazy). min-height placeholder avoids a footer jump. */}
        <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
          <LandingBelowFold />
        </Suspense>
      </main>

      {/* Semantic Footer */}
      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}

