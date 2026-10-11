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
      if (type === "linkedin" && !value.includes("linkedin.com") && !value.startsWith("http")) {
        targetHref = `https://linkedin.com/in/${value}`;
      } else if (type === "github" && !value.includes("github.com") && !value.startsWith("http")) {
        targetHref = `https://github.com/${value}`;
      } else {
        targetHref = value.startsWith("http") ? value : `https://${value}`;
      }
    }
  }

  // Display label: strictly show clean name/handle, never full URL
  let displayValue = String(value).trim();
  if (type === "linkedin") {
    if (/^https?:\/\//i.test(displayValue) || /^linkedin\.com/i.test(displayValue) || /^www\.linkedin\.com/i.test(displayValue)) {
      displayValue =
        displayValue
          .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, "")
          .replace(/^https?:\/\/(www\.)?linkedin\.com\/?/i, "")
          .replace(/\/+$/, "") || "LinkedIn";
    }
  } else if (type === "github") {
    if (/^https?:\/\//i.test(displayValue) || /^github\.com/i.test(displayValue) || /^www\.github\.com/i.test(displayValue)) {
      displayValue =
        displayValue
          .replace(/^https?:\/\/(www\.)?github\.com\/?/i, "")
          .replace(/\/+$/, "") || "GitHub";
    }
  } else if (type === "website" || type === "portfolio") {
    if (/^https?:\/\//i.test(displayValue)) {
      displayValue = displayValue.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
    }
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
