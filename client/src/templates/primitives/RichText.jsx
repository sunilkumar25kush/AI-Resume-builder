import React from "react";

/**
 * Parses markdown **bold** and [links](url) without dangerouslySetInnerHTML,
 * ensuring real selectable text for ATS parsers and clickable links in print/PDF.
 */
export function RichText({ text, className = "" }) {
  if (!text) return null;

  // Pattern matching [label](url) OR **bold**
  const regex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*)/g;
  const parts = String(text).split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check for **bold**
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <strong key={index} className="font-semibold text-[inherit]">{part.slice(2, -2)}</strong>;
        }

        // Check for [label](url)
        const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
        if (linkMatch) {
          const [, label, url] = linkMatch;
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit underline decoration-current underline-offset-2 hover:opacity-80"
            >
              {label}
            </a>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
