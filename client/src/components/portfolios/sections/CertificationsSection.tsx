import { Award, ExternalLink } from "lucide-react";

import { SafeLink } from "@/components/portfolios/common/SafeLink";
import type { PortfolioCertification } from "@/types/portfolio";

export interface CertificationsSectionProps {
  certifications?: PortfolioCertification[];
  variant?: "minimal" | "developer";
  primaryColor?: string;
  showEmpty?: boolean;
}

export function CertificationsSection({
  certifications = [],
  variant = "minimal",
  primaryColor: _primaryColor,
  showEmpty = false,
}: CertificationsSectionProps) {
  const validCerts = certifications.filter((c) => c?.name?.trim());

  if (validCerts.length === 0 && !showEmpty) {
    return null;
  }

  if (variant === "developer") {
    return (
      <section className="py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              // 06. Credentials
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-2">
            <Award className="h-5 w-5 text-neutral-500" />
            <span>Certifications & Licenses</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validCerts.map((cert, idx) => (
              <div
                key={`${cert.name}-${idx}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 line-clamp-2">
                    {cert.name}
                  </h3>
                  {cert.issuer && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      {cert.issuer}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>{cert.issueDate || "Credential"}</span>
                  {cert.url && (
                    <SafeLink
                      href={cert.url}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Verify <ExternalLink className="h-3 w-3" />
                    </SafeLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className="py-12 sm:py-16 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Certifications
        </h2>

        <div className="space-y-4">
          {validCerts.map((cert, idx) => (
            <div key={`${cert.name}-${idx}`} className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {cert.name}
                </span>
                {cert.issuer && (
                  <span className="text-xs text-neutral-500 font-light ml-2">
                    — {cert.issuer}
                  </span>
                )}
              </div>

              {cert.url ? (
                <SafeLink
                  href={cert.url}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline shrink-0 inline-flex items-center gap-1"
                >
                  Verify <ExternalLink className="h-3 w-3" />
                </SafeLink>
              ) : cert.issueDate ? (
                <span className="text-xs text-neutral-400 shrink-0 font-light">{cert.issueDate}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
