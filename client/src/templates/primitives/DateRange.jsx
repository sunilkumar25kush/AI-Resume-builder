import React from "react";

export function DateRange({
  startDate,
  endDate,
  format = "dash", // "dash" | "from-to" | "paren"
  className = "",
}) {
  if (!startDate && !endDate) return null;

  const start = startDate ? String(startDate).trim() : "";
  const end = endDate ? String(endDate).trim() : "Present";

  let formatted = "";
  if (format === "from-to") {
    if (start && end) formatted = `From ${start} to ${end}`;
    else if (start) formatted = `Since ${start}`;
    else formatted = end;
  } else if (format === "paren") {
    formatted = start && end ? `(${start} – ${end})` : `(${start || end})`;
  } else {
    formatted = start && end ? `${start} – ${end}` : (start || end);
  }

  return <span className={`whitespace-nowrap ${className}`}>{formatted}</span>;
}
