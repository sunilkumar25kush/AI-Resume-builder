import type { CSSProperties } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import type { PortfolioProfile, PortfolioSocialLink } from "@/types/portfolio";

export interface HeroSectionProps {
  profile?: PortfolioProfile;
  socialLinks?: PortfolioSocialLink[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function HeroSection({
  profile = { fullName: "" },
  socialLinks = [],
  variant = "minimal",
  primaryColor,
  showEmpty = false,
}: HeroSectionProps) {
  const { fullName, headline, location, avatarUrl, email, phone } = profile;
  const avatarSrc = normalizeAvatarUrl(avatarUrl);

  if (!fullName?.trim() && !headline?.trim() && !avatarSrc && !showEmpty) {
    return null;
  }

  const initials = (fullName || "P")
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const accentStyle: CSSProperties = primaryColor
    ? { backgroundColor: primaryColor, color: "#fff" }
    : {};

  if (variant === "developer") {
    return (
      <section className="relative py-12 md:py-20 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Available for opportunities</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                {fullName || (showEmpty ? "Your Full Name" : "")}
              </h1>

              {headline && (
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed max-w-2xl">
                  {headline}
                </p>
              )}

              {location && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{location}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {email && (
                  <SafeLink
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm"
                    style={accentStyle}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Get in touch</span>
                  </SafeLink>
                )}

                {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
                  <SafeLink
                    key={`${link.platform}-${idx}`}
                    href={link.url}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    <BrandIcon name={link.platform} size={16} />
                    <span>{link.label || link.platform}</span>
                  </SafeLink>
                ))}
              </div>
            </div>

            {avatarSrc && (
              <Avatar className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 shadow-md shrink-0 overflow-hidden">
                <AvatarImage
                  src={avatarSrc}
                  alt={fullName || "Profile avatar"}
                  className="object-cover size-full rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="rounded-2xl text-xl font-bold font-mono">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant: Elegant, typography-first, serene spacing
  return (
    <section className="py-16 sm:py-24 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {avatarSrc && (
          <Avatar className="h-24 w-24 mx-auto rounded-full ring-2 ring-neutral-200 dark:ring-neutral-800 shadow-sm overflow-hidden">
            <AvatarImage
              src={avatarSrc}
              alt={fullName || "Profile avatar"}
              className="object-cover size-full rounded-full"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-lg font-medium">{initials}</AvatarFallback>
          </Avatar>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
            {fullName || (showEmpty ? "Your Name" : "")}
          </h1>

          {headline && (
            <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-xl mx-auto">
              {headline}
            </p>
          )}
        </div>

        {(location || phone || email) && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 pt-2">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <SafeLink href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </SafeLink>
              </span>
            )}
            {email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <SafeLink href={`mailto:${email}`} className="hover:underline">
                  {email}
                </SafeLink>
              </span>
            )}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {socialLinks.map((link: PortfolioSocialLink, idx: number) => (
              <SafeLink
                key={`${link.platform}-${idx}`}
                href={link.url}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <BrandIcon name={link.platform} size={14} />
                <span>{link.label || link.platform}</span>
              </SafeLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
