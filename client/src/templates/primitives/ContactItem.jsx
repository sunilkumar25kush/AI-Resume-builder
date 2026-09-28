import React from "react";
import { Icon } from "./Icon";

export function ContactItem({
  type,
  value,
  href,
  icon = true,
  iconBadge = false,
  badgeClassName = "",
  className = "",
  linkClassName = "",
}) {
  if (!value) return null;

  let targetHref = href;
  if (!targetHref) {
    if (type === "email") targetHref = `mailto:${value}`;
    else if (type === "phone") targetHref = `tel:${value.replace(/[^0-9+]/g, "")}`;
    else if (type === "website" || type === "portfolio" || type === "linkedin" || type === "github") {
      targetHref = value.startsWith("http") ? value : `https://${value}`;
    }
  }

  // Display label: simplify urls if desired
  let displayValue = value;
  if (type === "linkedin" || type === "github") {
    displayValue = value.replace(/^https?:\/\/(www\.)?/, "");
  }

  const content = (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {icon && (
        iconBadge ? (
          <span className={`inline-flex items-center justify-center rounded-full ${badgeClassName}`}>
            <Icon name={type} size={12} />
          </span>
        ) : (
          <Icon name={type} size={13} className="shrink-0 opacity-70" />
        )
      )}
      <span>{displayValue}</span>
    </span>
  );

  if (targetHref) {
    return (
      <a
        href={targetHref}
        target={type === "email" || type === "phone" ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={`hover:opacity-80 transition-opacity ${linkClassName}`}
      >
        {content}
      </a>
    );
  }

  return content;
}
