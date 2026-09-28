import React from "react";

export function CandidateName({ personal, className = "", children }) {
  if (personal?.isPlaceholder) {
    return (
      <span className={`text-neutral-400 font-normal italic ${className}`}>
        {children || personal.fullName || "Your Name"}
        <span className="ml-2.5 text-[11px] text-amber-700 font-sans font-medium tracking-normal lowercase not-italic no-print bg-amber-50 border border-amber-200/80 rounded-sm px-1.5 py-0.5 inline-block align-middle">
          Add your name
        </span>
      </span>
    );
  }

  return children || personal.fullName;
}
