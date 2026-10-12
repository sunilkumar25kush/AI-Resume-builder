import React from "react";

export function Icon({ name, size = 14, className = "" }) {
  const baseProps = {
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "mail":
    case "email":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      );

    case "phone":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.57 3.92C8.57 3.36 8.13 3 7.57 3H4.07C3.51 3 3 3.37 3 3.93c0 9.42 7.64 17.07 17.01 17.07.56 0 1-.51 1-1.07v-3.55c0-.56-.45-1-1-1z" />
        </svg>
      );

    case "location":
    case "mapPin":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </svg>
      );

    case "linkedin":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75a1.75 1.75 0 0 0-1.75 1.75c0 .97.78 1.76 1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8z" />
        </svg>
      );

    case "github":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );

    case "globe":
    case "website":
    case "portfolio":
      return (
        <svg {...baseProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm6.92 9h-3.64a15.82 15.82 0 0 0-1.33-5.08A8.02 8.02 0 0 1 18.92 11zM12 4.07c.86 1.48 1.54 3.65 1.78 6.93H10.22c.24-3.28.92-5.45 1.78-6.93zM4.08 13h3.64c.12 1.81.58 3.54 1.33 5.08A8.02 8.02 0 0 1 4.08 13zm3.64-2H4.08a8.02 8.02 0 0 1 4.97-5.08A15.82 15.82 0 0 0 7.72 11zm2.5 0c-.24-3.28-.92-5.45-1.78-6.93A14.28 14.28 0 0 1 12 4.07c.86 1.48 1.54 3.65 1.78 6.93zm.5 2h3.56c-.24 3.28-.92 5.45-1.78 6.93A14.28 14.28 0 0 1 12 19.93c-.86-1.48-1.54-3.65-1.78-6.93zm3.69 5.08c.75-1.54 1.21-3.27 1.33-5.08h3.64a8.02 8.02 0 0 1-4.97 5.08z" />
        </svg>
      );

    case "calendar":
      return (
        <svg
          {...baseProps}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );

    case "link":
    case "external":
      return (
        <svg
          {...baseProps}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );

    default:
      return null;
  }
}
