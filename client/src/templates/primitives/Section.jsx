import React from "react";

export function Section({
  title,
  children,
  className = "",
  headerClassName = "",
  titleClassName = "",
  headerRight,
  underline = false,
  underlineClassName = "",
  style,
}) {
  // If no children or empty, hide completely
  if (!children) return null;
  if (Array.isArray(children) && children.every((c) => !c)) return null;

  return (
    <section className={`break-inside-avoid-page ${className}`} style={style}>
      {title && (
        <div className={`flex items-baseline justify-between ${headerClassName}`}>
          <h2 className={titleClassName}>{title}</h2>
          {headerRight}
        </div>
      )}
      {underline && <div className={underlineClassName} />}
      <div className="mt-1">{children}</div>
    </section>
  );
}
