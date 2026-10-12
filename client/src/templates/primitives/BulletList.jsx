import React from "react";
import { RichText } from "./RichText";

export function BulletList({
  bullets,
  className = "",
  itemClassName = "",
  bulletStyle = "dot", // "dot" | "dash" | "none"
  bulletColor,
}) {
  if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
    return null;
  }

  // Filter empty bullets
  const validBullets = bullets.filter((b) => b && String(b).trim().length > 0);
  if (validBullets.length === 0) return null;

  return (
    <ul className={`space-y-1 list-none p-0 m-0 ${className}`}>
      {validBullets.map((bullet, idx) => (
        <li
          key={idx}
          className={`break-inside-avoid relative pl-4 leading-snug resume-bullet-item ${itemClassName}`}
        >
          <span
            className="resume-bullet-icon absolute left-0 top-[0.45em] inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: bulletColor || "var(--rc-bullet-color, currentColor)" }}
            aria-hidden="true"
          />
          <span
            className="resume-bullet-dash absolute left-0 top-0 select-none text-[inherit] opacity-75 font-normal hidden"
            aria-hidden="true"
          >
            –
          </span>
          <span
            className="resume-bullet-arrow absolute left-0 top-0 select-none text-[inherit] opacity-80 font-normal hidden text-[11px]"
            aria-hidden="true"
          >
            ▸
          </span>
          <RichText text={bullet} />
        </li>
      ))}
    </ul>
  );
}
