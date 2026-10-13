import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Globe, Loader2, Sparkles } from "lucide-react";

import { portfoliosApi } from "@/api/portfolios";
import { getApiErrorMessage } from "@/api/client";
import { PortfolioRenderer } from "@/components/portfolios/PortfolioRenderer";
import { PortfolioSeo } from "@/components/portfolios/common/PortfolioSeo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Portfolio } from "@/types/portfolio";

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    async function fetchPublic() {
      setLoading(true);
      setError(null);
      try {
        const data = await portfoliosApi.getBySlug(slug!);
        if (isMounted) {
          setPortfolio(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchPublic();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <Card className="max-w-md w-full p-8 text-center space-y-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500">
            <Globe className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Portfolio Not Found</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This portfolio is currently private, unpublished, or the link may have changed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default" className="gap-2">
              <Link to="/">
                <Sparkles className="h-4 w-4" />
                Build Your Portfolio
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/portfolios">
                <ArrowLeft className="h-4 w-4" />
                Your Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Dynamic SEO Head Elements */}
      <PortfolioSeo portfolio={portfolio} />

      {/* Main Portfolio Presentation */}
      <main className="flex-1">
        <PortfolioRenderer portfolio={portfolio} showEmpty={false} />
      </main>

      {/* Discreet Public Attribution Footer */}
      <footer className="py-6 px-4 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/50 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()} {portfolio.profile?.fullName || portfolio.title}. All rights reserved.
          </span>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Built with AI Resume Builder</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
