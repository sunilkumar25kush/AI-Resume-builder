import { useEffect } from "react";
import type { Portfolio } from "@/types/portfolio";

export interface PortfolioSeoProps {
  portfolio: Portfolio | null;
}

/**
 * Custom hook to dynamically manage document head metadata for public portfolio routes:
 * - Document Title
 * - Meta Description
 * - Canonical Link
 * - OpenGraph (og:title, og:description, og:url, og:type, og:image)
 * - Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image)
 *
 * Automatically restores previous document head state on component unmount.
 */
export function usePortfolioSeo(portfolio: Portfolio | null) {
  useEffect(() => {
    if (!portfolio || typeof document === "undefined") return;

    // 1. Calculate SEO values
    const originalTitle = document.title;
    const computedTitle =
      portfolio.publication?.seoTitle?.trim() ||
      (portfolio.profile?.fullName
        ? `${portfolio.profile.fullName} — Portfolio`
        : `${portfolio.title} — Portfolio`);

    const computedDescription =
      portfolio.publication?.seoDescription?.trim() ||
      (portfolio.profile?.bio
        ? portfolio.profile.bio.slice(0, 160)
        : portfolio.profile?.headline
          ? `${portfolio.profile.headline}. Explore projects, experience, and skills.`
          : `Explore ${portfolio.profile?.fullName || portfolio.title}'s professional portfolio website.`);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const canonicalUrl = `${origin}/p/${portfolio.slug}`;
    const avatarUrl = portfolio.profile?.avatarUrl
      ? (portfolio.profile.avatarUrl.startsWith("/")
          ? `${origin}${portfolio.profile.avatarUrl}`
          : portfolio.profile.avatarUrl.trim())
      : "";

    // 2. Set document title
    document.title = computedTitle;

    // Helper to create or update meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string): HTMLMetaElement => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
      return element;
    };

    // Helper to create or update canonical link
    let canonicalElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonicalElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", canonicalUrl);

    // 3. Inject standard description and OpenGraph / Twitter tags
    const managedTags: HTMLMetaElement[] = [
      setMetaTag("name", "description", computedDescription),
      setMetaTag("property", "og:title", computedTitle),
      setMetaTag("property", "og:description", computedDescription),
      setMetaTag("property", "og:type", "website"),
      setMetaTag("property", "og:url", canonicalUrl),
      setMetaTag("name", "twitter:card", "summary_large_image"),
      setMetaTag("name", "twitter:title", computedTitle),
      setMetaTag("name", "twitter:description", computedDescription),
    ];

    if (avatarUrl) {
      managedTags.push(
        setMetaTag("property", "og:image", avatarUrl),
        setMetaTag("name", "twitter:image", avatarUrl),
      );
    }

    // 4. Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (createdCanonical && canonicalElement?.parentNode) {
        canonicalElement.parentNode.removeChild(canonicalElement);
      }
    };
  }, [portfolio]);
}
