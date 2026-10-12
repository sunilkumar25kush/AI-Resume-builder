import React from "react";
import { Icon } from "./Icon";

export function HeaderContactRow({
  personal = {},
  className = "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
  itemClassName = "",
  linkClassName = "hover:underline",
  defaultSeparator = "•",
  iconSize = 13,
}) {
  if (!personal) return null;

  const cleanHandle = (type, val) => {
    if (!val) return "";
    let str = String(val).trim();
    if (type === "linkedin") {
      return str
        .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, "")
        .replace(/^https?:\/\/(www\.)?linkedin\.com\/?/i, "")
        .replace(/\/+$/, "") || "LinkedIn";
    }
    if (type === "github") {
      return str
        .replace(/^https?:\/\/(www\.)?github\.com\/?/i, "")
        .replace(/\/+$/, "") || "GitHub";
    }
    if (type === "website") {
      return str.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
    }
    return str;
  };

  const contactMap = {
    email: personal.email
      ? {
          type: "email",
          text: personal.email,
          href: `mailto:${personal.email}`,
        }
      : null,
    phone: personal.phone
      ? {
          type: "phone",
          text: personal.phone,
          href: `tel:${personal.phone.replace(/[^0-9+]/g, "")}`,
        }
      : null,
    location: personal.location
      ? {
          type: "location",
          text: personal.location,
          href: null,
        }
      : null,
    linkedin: personal.linkedin
      ? {
          type: "linkedin",
          text: cleanHandle("linkedin", personal.linkedin),
          href: personal.linkedinUrl || (personal.linkedin.startsWith("http") ? personal.linkedin : `https://linkedin.com/in/${personal.linkedin}`),
        }
      : null,
    github: personal.github
      ? {
          type: "github",
          text: cleanHandle("github", personal.github),
          href: personal.githubUrl || (personal.github.startsWith("http") ? personal.github : `https://github.com/${personal.github}`),
        }
      : null,
    website: personal.website
      ? {
          type: "website",
          text: cleanHandle("website", personal.website),
          href: personal.websiteUrl || (personal.website.startsWith("http") ? personal.website : `https://${personal.website}`),
        }
      : null,
  };

  const order = personal.contactOrder || ["email", "phone", "location", "linkedin", "github", "website"];
  const items = order.map((key) => contactMap[key]).filter(Boolean);

  if (Array.isArray(personal.customLinks)) {
    personal.customLinks.forEach((l) => {
      if (l && l.url) {
        items.push({
          type: "link",
          text: l.label || l.url.replace(/^https?:\/\/(www\.)?/, ""),
          href: l.url.startsWith("http") ? l.url : `https://${l.url}`,
        });
      }
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`header-contact-row ${className}`}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span
              className="header-sep-symbol select-none px-1"
              aria-hidden="true"
            >
              {defaultSeparator}
            </span>
          )}
          <span className="header-contact-item inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="header-contact-icon shrink-0 inline-flex items-center" aria-hidden="true">
              <Icon name={item.type} size={iconSize} />
            </span>
            {item.href ? (
              <a
                href={item.href}
                target={item.type === "email" || item.type === "phone" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`transition-colors ${linkClassName}`}
              >
                <span className={itemClassName}>{item.text}</span>
              </a>
            ) : (
              <span className={itemClassName}>{item.text}</span>
            )}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
