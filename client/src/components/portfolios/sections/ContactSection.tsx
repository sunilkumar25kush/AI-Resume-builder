import type { CSSProperties } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";

import { BrandIcon } from "@/components/portfolios/common/BrandIcon";
import { SafeLink } from "@/components/portfolios/common/SafeLink";
import type { PortfolioProfile, PortfolioSocialLink } from "@/types/portfolio";

export interface ContactSectionProps {
  profile?: PortfolioProfile;
  socialLinks?: PortfolioSocialLink[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function ContactSection({
  profile = { fullName: "" },
  socialLinks = [],
  variant = "minimal",
  primaryColor,
  showEmpty = false,
}: ContactSectionProps) {
  const { email, phone, location } = profile;

  if (!email && !phone && !location && socialLinks.length === 0 && !showEmpty) {
    return null;
  }

  const accentStyle: CSSProperties = primaryColor
    ? { backgroundColor: primaryColor, color: "#fff" }
    : {};

  if (variant === "developer") {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 07. Connect
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="inline-flex p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                Let's Build Something Together
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Whether you have an interesting project, an engineering opening, or just want to discuss tech, feel free to reach out.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {email && (
                <SafeLink
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all hover:opacity-95"
                  style={accentStyle}
                >
                  <Mail className="h-4 w-4" />
                  <span>Send an Email</span>
                </SafeLink>
              )}

              {phone && (
                <SafeLink
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{phone}</span>
                </SafeLink>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-center gap-3">
                {socialLinks.map((link, idx) => (
                  <SafeLink
                    key={`${link.platform}-${idx}`}
                    href={link.url}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <BrandIcon name={link.platform} size={14} />
                    <span>{link.label || link.platform}</span>
                  </SafeLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Get In Touch
        </h2>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light max-w-lg mx-auto">
          I am always open to new discussions, collaborations, and opportunities.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-6">
          {email && (
            <SafeLink
              href={`mailto:${email}`}
              className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8"
            >
              {email}
            </SafeLink>
          )}

          {phone && (
            <SafeLink
              href={`tel:${phone}`}
              className="text-base sm:text-lg font-light text-neutral-600 dark:text-neutral-400 hover:underline underline-offset-8"
            >
              {phone}
            </SafeLink>
          )}
        </div>

        {socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-neutral-500">
            {socialLinks.map((link, idx) => (
              <SafeLink
                key={`${link.platform}-${idx}`}
                href={link.url}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 underline underline-offset-4"
              >
                {link.label || link.platform}
              </SafeLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
