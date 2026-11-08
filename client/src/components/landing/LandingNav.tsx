import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  const navLinks = [
    { label: "Benefits", href: "#benefits" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Templates", href: "#templates" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        aria-label="Main Navigation"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl"
      >
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2 rounded-2xl border border-border/80 bg-background/85 dark:bg-[#181818]/90 backdrop-blur-md shadow-xs transition-colors">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group select-none py-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              ResumeBuddy
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Desktop Navigation">
            {navLinks.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollTo(item.href)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions & Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Button
                asChild
                size="sm"
                className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
              >
                <Link to="/resumes" className="flex items-center gap-1.5">
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login">Sign in</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                >
                  <Link to="/register">
                    <span>Start building free</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Panel */}
        {mobileOpen && (
          <div
            className="animate-in fade-in slide-in-from-top-2 duration-300 fixed inset-x-4 top-20 z-40 p-5 rounded-2xl border border-border bg-background/95 dark:bg-[#181818]/95 backdrop-blur-xl shadow-xl flex flex-col gap-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollTo(item.href)}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild className="w-full rounded-xl text-xs font-semibold">
                  <Link to="/resumes" onClick={() => setMobileOpen(false)}>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full rounded-xl text-xs font-medium">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Sign in to Account
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl text-xs font-semibold">
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      Start building free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
    </>
  );
}

