
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { sanitizeExternalUrl } from "./urlUtils";

export interface SafeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string | null;
  className?: string;
  children: ReactNode;
}

/**
 * Safe external link component.
 * Automatically enforces `target="_blank" rel="noopener noreferrer"` and rejects unsafe schemes.
 */
export function SafeLink({
  href,
  className = "",
  children,
  onClick,
  ...rest
}: SafeLinkProps) {
  const safeHref = sanitizeExternalUrl(href);

  if (!safeHref) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  );
}
