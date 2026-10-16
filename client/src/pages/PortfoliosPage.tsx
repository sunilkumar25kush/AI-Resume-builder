import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfoliosStore } from "@/stores/portfolios";
import type { Portfolio } from "@/types";

const CreatePortfolioDialog = lazy(
  () => import("@/components/portfolios/common/CreatePortfolioDialog"),
);
const PublishModal = lazy(() =>
  import("@/components/portfolios/editor/PublishModal").then((m) => ({ default: m.PublishModal })),
);
const PortfolioExportModal = lazy(() =>
  import("@/components/portfolios/export/PortfolioExportModal").then((m) => ({
    default: m.PortfolioExportModal,
  })),
);

const dateFormatCache = new Map<string, string>();
function formatDate(value: string): string {
  const cached = dateFormatCache.get(value);
  if (cached) return cached;
  try {
    const formatted = new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    dateFormatCache.set(value, formatted);
    return formatted;
  } catch {
    return value;
  }
}

export default function PortfoliosPage() {
  const items = usePortfoliosStore((state) => state.items);
  const loading = usePortfoliosStore((state) => state.loading);
  const error = usePortfoliosStore((state) => state.error);
  const fetch = usePortfoliosStore((state) => state.fetch);
  const remove = usePortfoliosStore((state) => state.remove);

  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishPortfolioTarget, setPublishPortfolioTarget] = useState<Portfolio | null>(null);
  const [exportPortfolioTarget, setExportPortfolioTarget] = useState<Portfolio | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleDelete = async (portfolio: Portfolio) => {
    if (!confirm(`Are you sure you want to delete "${portfolio.title}"?`)) return;
    setDeletingId(portfolio._id);
    try {
      await remove(portfolio._id);
      toast.success("Portfolio deleted");
    } catch {
      toast.error("Failed to delete portfolio");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Portfolio Websites</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              AI Powered
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate stunning, responsive developer portfolio websites from your resume in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetch()}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Generate Portfolio
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Grid of existing portfolios */}
      <section>
        {loading && items.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="space-y-2 p-5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No portfolio websites yet"
            description="Create your first developer portfolio from an uploaded resume or build one from scratch with our templates."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" aria-hidden />
                Generate Portfolio
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((portfolio) => (
              <Card
                key={portfolio._id}
                className="group relative flex flex-col justify-between overflow-hidden border border-border/70 hover:border-primary/50 transition-all hover:shadow-md bg-card"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={portfolio.status === "published" ? "default" : "secondary"}
                      className="text-[10px] uppercase font-semibold tracking-wide"
                    >
                      {portfolio.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(portfolio.updatedAt)}
                    </span>
                  </div>
                  <div className="pt-2 flex items-start gap-3">
                    {portfolio.profile?.avatarUrl && (
                      <div className="h-10 w-10 shrink-0 rounded-xl border border-border/80 overflow-hidden bg-muted">
                        <img
                          src={normalizeAvatarUrl(portfolio.profile.avatarUrl, 40)}
                          alt={portfolio.title}
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors truncate">
                        {portfolio.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {portfolio.profile?.headline || portfolio.profile?.bio || `Template: ${portfolio.design.template}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    <span className="truncate font-mono">/p/{portfolio.slug}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Link to={`/portfolios/${portfolio._id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                      >
                        <Link
                          to={portfolio.status === "published" && portfolio.slug ? `/p/${portfolio.slug}` : `/portfolios/${portfolio._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          View
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={portfolio.status === "published" ? "Publish settings & share" : "Publish portfolio"}
                        onClick={() => setPublishPortfolioTarget(portfolio)}
                        className={
                          portfolio.status === "published"
                            ? "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground hover:text-primary"
                        }
                      >
                        <Globe className="h-4 w-4" aria-hidden />
                      </Button>
                      {portfolio.status === "published" && (
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-sm"
                          title="Open public website"
                        >
                          <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Export portfolio (Source code or static site)"
                        onClick={() => setExportPortfolioTarget(portfolio)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete portfolio"
                        disabled={deletingId === portfolio._id}
                        onClick={() => void handleDelete(portfolio)}
                      >
                        {deletingId === portfolio._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Lazy-loaded Create Portfolio Modal */}
      {createOpen && (
        <Suspense fallback={null}>
          <CreatePortfolioDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
        </Suspense>
      )}

      {/* Lazy-loaded Publish & Sharing Dialog */}
      {publishPortfolioTarget && (
        <Suspense fallback={null}>
          <PublishModal
            open={Boolean(publishPortfolioTarget)}
            onOpenChange={(open) => !open && setPublishPortfolioTarget(null)}
            portfolio={publishPortfolioTarget}
            onSuccess={() => {
              setPublishPortfolioTarget(null);
              void fetch();
            }}
          />
        </Suspense>
      )}

      {/* Lazy-loaded Export Dialog */}
      {exportPortfolioTarget && (
        <Suspense fallback={null}>
          <PortfolioExportModal
            open={Boolean(exportPortfolioTarget)}
            onOpenChange={(open) => !open && setExportPortfolioTarget(null)}
            portfolio={exportPortfolioTarget}
          />
        </Suspense>
      )}
    </div>
  );
}
