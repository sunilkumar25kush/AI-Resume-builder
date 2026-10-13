import type { Portfolio } from "@/types/portfolio";
import { usePortfolioSeo } from "./usePortfolioSeo";

export interface PortfolioSeoProps {
  portfolio: Portfolio | null;
}

/**
 * Component that injects document head SEO tags:
 * - Native React 19 hoisted tags (<title>, <meta>, <link>)
 * - Imperative synchronization via usePortfolioSeo
 */
export function PortfolioSeo({ portfolio }: PortfolioSeoProps) {
  usePortfolioSeo(portfolio);

  if (!portfolio) return null;

  const title =
    portfolio.publication?.seoTitle?.trim() ||
    (portfolio.profile?.fullName
      ? `${portfolio.profile.fullName} — Portfolio`
      : `${portfolio.title} — Portfolio`);

  const description =
    portfolio.publication?.seoDescription?.trim() ||
    (portfolio.profile?.bio
      ? portfolio.profile.bio.slice(0, 160)
      : portfolio.profile?.headline
        ? `${portfolio.profile.headline}. Explore projects, experience, and skills.`
        : `Explore ${portfolio.profile?.fullName || portfolio.title}'s professional portfolio website.`);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonicalUrl = `${origin}/p/${portfolio.slug}`;
  const avatarUrl = portfolio.profile?.avatarUrl?.trim() || "";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {avatarUrl && <meta property="og:image" content={avatarUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
    </>
  );
}
