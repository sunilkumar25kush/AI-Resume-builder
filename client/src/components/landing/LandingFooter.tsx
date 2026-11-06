import { Link } from "react-router";
import { ArrowUp, Sparkles } from "lucide-react";

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 dark:bg-[#131209] text-foreground transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 select-none group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold text-base tracking-tight text-foreground">
                ResumeBuddy
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm text-pretty">
              Deterministic ATS resume optimization and developer portfolio generator. Engineered for software professionals to land technical interviews faster.
            </p>

            <p className="text-xs text-muted-foreground pt-2">
              Built with precision for engineering, product, and technical talent worldwide.
            </p>
          </div>

          {/* Navigation Column 1: Core Tools */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Core Platform
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  ATS Score Checker
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Portfolio Generator
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Cover Letter
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Sections */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Key Benefits
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Portfolio Designs
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ & Objections
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Trust & Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trust & Legal
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Systems fully operational
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} ResumeBuddy. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background dark:bg-[#181818] hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
