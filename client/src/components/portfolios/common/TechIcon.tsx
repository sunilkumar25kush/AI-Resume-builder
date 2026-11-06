import {
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";

export interface TechIconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Authentic Tech Brand Icons with official brand colors.
 * Brand colors remain invariant regardless of the portfolio's primaryColor.
 */
export function TechIcon({ name, size = 18, className = "" }: TechIconProps) {
  const norm = (name || "").toLowerCase().trim();

  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: `inline-block shrink-0 ${className}`,
    "aria-hidden": true,
  };

  // React (Official Cyan #61DAFB)
  if (norm.includes("react") || norm === "rn") {
    return (
      <svg {...svgProps} viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="#61DAFB" strokeWidth="1.2">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </svg>
    );
  }

  // Next.js (Official Black/White #000000)
  if (norm.includes("next") || norm === "nextjs") {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#000000">
        <circle cx="12" cy="12" r="10" fill="#000000" />
        <path d="M15.328 16.538 10.383 10.118v6.42H9.01V7.462h1.373l5.067 6.577V7.462h1.373v9.076h-1.495z" fill="#FFFFFF" />
      </svg>
    );
  }

  // TypeScript (Official TS Blue #3178C6)
  if (norm.includes("typescript") || norm === "ts") {
    return (
      <svg {...svgProps} viewBox="0 0 24 24">
        <rect width="22" height="22" x="1" y="1" rx="4" fill="#3178C6" />
        <path d="M4.5 10h5.5v2H7.5v7H5.2v-7H3V10h1.5zm6.5 4.8c.6.4 1.3.6 2 .6.9 0 1.4-.4 1.4-1 0-.6-.5-.9-1.4-1.3l-.6-.2c-1.3-.5-2-1.2-2-2.3 0-1.5 1.1-2.6 3-2.6 1 0 1.8.3 2.5.7l-.6 1.7c-.5-.3-1.1-.6-1.8-.6-.7 0-1.2.4-1.2 1 0 .5.5.8 1.3 1.2l.6.2c1.5.6 2.1 1.3 2.1 2.4 0 1.6-1.2 2.6-3.2 2.6-1.1 0-2.1-.3-2.9-.9l.8-1.5z" fill="#FFFFFF" />
      </svg>
    );
  }

  // JavaScript (Official JS Yellow #F7DF1E)
  if (norm.includes("javascript") || norm === "js" || norm.includes("es6")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24">
        <rect width="22" height="22" x="1" y="1" rx="4" fill="#F7DF1E" />
        <path d="M11.5 15.5c0 2-1.3 2.8-3 2.8-.8 0-1.6-.2-2.2-.6l.5-1.7c.4.3.9.5 1.5.5.8 0 1.3-.4 1.3-1.2V8h1.9v7.5zm7 0c0 2-1.4 2.8-3.3 2.8-1.1 0-2.1-.3-2.8-.8l.6-1.7c.6.4 1.3.7 2.1.7.9 0 1.5-.4 1.5-1.1 0-.7-.5-1-1.6-1.5l-.6-.3c-1.4-.6-2.2-1.4-2.2-2.6 0-1.6 1.2-2.7 3.1-2.7 1 0 1.8.3 2.4.7l-.6 1.7c-.5-.3-1.1-.6-1.8-.6-.8 0-1.3.4-1.3 1 0 .6.4.9 1.4 1.3l.6.3c1.6.7 2.6 1.4 2.6 2.8z" fill="#000000" />
      </svg>
    );
  }

  // Node.js (Official Node Green #339933)
  if (norm.includes("node") || norm.includes("nodejs")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#339933">
        <path d="M12 2.2 3.5 7.1v9.8L12 21.8l8.5-4.9V7.1L12 2.2zm-1 15.3c-2.3 0-3.6-1.2-3.6-3.2 0-2.1 1.5-3 3.8-3.4l1.3-.2v-.8c0-.7-.4-1.1-1.3-1.1-.8 0-1.4.3-1.8.8l-1-1.1c.8-.8 1.8-1.2 3.1-1.2 2.1 0 3.3 1.1 3.3 2.9v5h-1.9v-1.1c-.5.8-1.4 1.4-2.6 1.4zm.5-1.5c1.1 0 1.9-.6 1.9-1.6v-.8l-1.1.2c-1.3.2-2 .7-2 1.8 0 .8.5 1.4 1.2 1.4z" />
      </svg>
    );
  }

  // Python (Official Blue #3776AB & Yellow #FFD43B)
  if (norm.includes("python") || norm.includes("py")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24">
        <path d="M11.9 2c-3.1 0-4.9.4-4.9 2.5v1.9h5v.6H5c-2.4 0-4.5 1.4-4.5 4.5 0 2.6 1.8 4.4 4.5 4.4h1.5v-2.1c0-2.4 2-4.4 4.4-4.4h5V7c0-2.2-1.9-5-5-5h.5zm-2.8 1.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" fill="#3776AB" />
        <path d="M12.1 22c3.1 0 4.9-.4 4.9-2.5v-1.9h-5v-.6h7c2.4 0 4.5-1.4 4.5-4.5 0-2.6-1.8-4.4-4.5-4.4h-1.5v2.1c0 2.4-2 4.4-4.4 4.4h-5V17c0 2.2 1.9 5 5 5h-.5zm2.8-1.5a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" fill="#FFD43B" />
      </svg>
    );
  }

  // HTML5 (Official HTML Orange #E34F26)
  if (norm.includes("html") || norm.includes("html5")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24">
        <path d="M3 2l1.8 18.5L12 23l7.2-2.5L21 2H3z" fill="#E34F26" />
        <path d="M12 3.8v17.2l5.7-1.9L19 3.8H12z" fill="#EF652A" />
        <path d="M12 7.7H7.4l.3 3.3h4.3v-3.3zm0 5.4H9.5l.2 2.3 2.3.6v-2.9zm0-5.4h4.6l-.3 3.3H12v-3.3zm0 5.4v2.9l2.3-.6.3-2.3H12z" fill="#FFFFFF" />
      </svg>
    );
  }

  // CSS3 (Official CSS Blue #1572B6)
  if (norm.includes("css") || norm.includes("sass") || norm.includes("scss")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24">
        <path d="M3 2l1.8 18.5L12 23l7.2-2.5L21 2H3z" fill="#1572B6" />
        <path d="M12 3.8v17.2l5.7-1.9L19 3.8H12z" fill="#33A9DC" />
        <path d="M12 7.7H7.4l.4 4.8h4.2V7.7zm0 6.6H9.7l.2 2.1 2.1.6v-2.7zm0-6.6h4.6l-.4 4.8H12V7.7zm0 6.6v2.7l2.1-.6.3-2.1H12z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Tailwind CSS (Official Cyan #06B6D4)
  if (norm.includes("tailwind")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#06B6D4">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.974 12 6.001 12z" />
      </svg>
    );
  }

  // Express / API (Official Charcoal/Black #000000)
  if (norm.includes("express") || norm.includes("api") || norm.includes("rest")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#1C1917">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  }

  // MongoDB (Official Leaf Green #47A248)
  if (norm.includes("mongo") || norm.includes("mongodb")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#47A248">
        <path d="M12.19 2.5s-.28.32-.48.56C10.15 4.9 6.5 9.4 6.5 14.15c0 4.1 3.2 7.35 5.5 7.35s5.5-3.25 5.5-7.35c0-4.75-3.65-9.25-5.21-11.09-.08-.09-.1-.56-.1-.56zm-.19 2.76c1.67 2.15 4.45 6.07 4.45 8.89 0 2.82-1.95 5.75-4.45 5.75v-14.64z" />
      </svg>
    );
  }

  // PostgreSQL (Official Blue #336791)
  if (norm.includes("postgres") || norm.includes("sql") || norm.includes("mysql") || norm.includes("database")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#336791">
        <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.48 6 2s-2.13 2-6 2-6-1.48-6-2 2.13-2 6-2zm-6 5.56c1.36.91 3.54 1.44 6 1.44s4.64-.53 6-1.44V12c0 .52-2.13 2-6 2s-6-1.48-6-2v-1.44zm0 5c1.36.91 3.54 1.44 6 1.44s4.64-.53 6-1.44V17c0 .52-2.13 2-6 2s-6-1.48-6-2v-1.44z" />
      </svg>
    );
  }

  // Docker (Official Whale Blue #2496ED)
  if (norm.includes("docker") || norm.includes("container")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#2496ED">
        <path d="M2.5 13.5c.3 3.9 3.5 7 7.5 7 4.4 0 8.1-3.4 8.5-7.8.6-.2 1.8-.4 2.5-.1.4.2.7.5.8.9.4-.5.7-1.2.7-2 0-.2-.1-.4-.2-.5-1-.9-2.5-.7-3.6-.4-.6-1.7-2-2.8-3.7-2.8h-.5v1.2c0 .4-.3.7-.7.7H13V8.5c0-.4-.3-.7-.7-.7h-2.1c-.4 0-.7.3-.7.7v1.2H8.3c-.4 0-.7.3-.7.7V11H6.4c-.4 0-.7.3-.7.7v1.8H2.5zm6.5-4.2h1.5v1.2H9V9.3zm-2.8 0h1.5v1.2H6.2V9.3zm5.6 0h1.5v1.2h-1.5V9.3z" />
      </svg>
    );
  }

  // Git / GitHub (Official Git Orange-Red #F05032)
  if (norm.includes("git") || norm.includes("version")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#F05032">
        <path d="m21.7 11.3-9-9c-.4-.4-1-.4-1.4 0L9.1 4.5l2.8 2.8c.4-.1.9 0 1.2.3.4.4.5 1 .3 1.5l2.7 2.7c.5-.2 1.1-.1 1.5.3.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.4-.4-.5-1-.3-1.5l-2.6-2.6c-.3.1-.7.2-1 .1l-2.7 2.7c.1.3.1.7 0 1-.4.6-1.3.8-1.9.4-.6-.4-.8-1.3-.4-1.9.3-.4.7-.6 1.2-.6l2.7-2.7V6.4c-.5-.3-.8-.8-.8-1.4 0-.3.1-.6.3-.9L2.3 11.3c-.4.4-.4 1 0 1.4l9 9c.4.4 1 .4 1.4 0l9-9c.4-.4.4-1 0-1.4z" />
      </svg>
    );
  }

  // Redis (Official Redis Red #DC382D)
  if (norm.includes("redis")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#DC382D">
        <path d="m12 2-9 4.5v11L12 22l9-4.5v-11L12 2zm0 2.3 6.6 3.3L12 10.9 5.4 7.6 12 4.3zM4.9 9.3l6.1 3.1v6.8L4.9 16.1V9.3zm8.1 9.9v-6.8l6.1-3.1v6.8l-6.1 3.1z" />
      </svg>
    );
  }

  // GraphQL (Official Magenta #E10098)
  if (norm.includes("graphql")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#E10098">
        <path d="M12 2 3.3 7v10L12 22l8.7-5V7L12 2zm0 2.5 6.7 3.9v7.7L12 20l-6.7-3.9V8.4L12 4.5zM12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4.3 7.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    );
  }

  // AWS / Cloud (Official Amazon Orange #FF9900)
  if (norm.includes("aws") || norm.includes("cloud") || norm.includes("azure") || norm.includes("gcp")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#FF9900">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
      </svg>
    );
  }

  // Golang / Go (Official Go Cyan #00ADD8)
  if (norm === "go" || norm.includes("golang")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#00ADD8">
        <path d="M1.5 10.5c.3 0 .5.2.5.5v1c0 1.9 1.6 3.5 3.5 3.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-3c-1.4 0-2.5-1.1-2.5-2.5v-1c0-.3-.2-.5-.5-.5zm9.5-3c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.6 0 4.8-1.8 5.3-4.2H11v-1.5h7.2c.1.4.1.8.1 1.2 0 4.1-3.4 7.5-7.5 7.5S3.3 18.1 3.3 14 6.7 6.5 10.8 6.5c2.1 0 4 .9 5.3 2.3l-1.1 1.1c-1.1-1.4-2.6-2.4-4-2.4zm10.5 4h-5c-.3 0-.5.2-.5.5s.2.5.5.5h5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm-1 3h-4c-.3 0-.5.2-.5.5s.2.5.5.5h4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" />
      </svg>
    );
  }

  // Java (Official #5382A1 / #E76F00)
  if (norm.includes("java") || norm.includes("spring")) {
    return (
      <svg {...svgProps} viewBox="0 0 24 24" fill="#E76F00">
        <path d="M8.8 17.5c-2.4.2-3.8.4-3.8.4s1.4.8 4.2.8c3.2 0 5.4-.8 5.4-.8s-1.4-.3-3.4-.4h-2.4zm-1.8-3.1s-1.8.6 0 1.2c2.2.7 6.1.6 8.3 0 0 0 1.2-.5-.5-.9-1.9-.4-5.9-.6-7.8-.3zm8.1-4.9c-.8 2.1-2.5 3.5-2.5 3.5s3.2-1.6 2.3-4.5c-.8-2.5-3.3-3.8-3.3-3.8s1.6 1.1 1.7 2.1c.1.9-.3 1.7-.2 2.7zm-4.7-6.2c.4 1.4-.4 2.8-.4 2.8s1.8-1.5 1.1-3.5c-.7-1.8-2.7-2.6-2.7-2.6s1.3.8 1.4 1.7c.1.8-.4 1.6-.4 1.6z" />
      </svg>
    );
  }

  // Generic category fallbacks with dedicated distinctive colors
  if (norm.includes("frontend") || norm.includes("ui") || norm.includes("web") || norm.includes("design")) {
    return <Layers className={`text-sky-500 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("backend") || norm.includes("server")) {
    return <Server className={`text-emerald-500 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("data") || norm.includes("db") || norm.includes("storage")) {
    return <Database className={`text-purple-500 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("devops") || norm.includes("tool") || norm.includes("build")) {
    return <Wrench className={`text-amber-500 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("network") || norm.includes("web") || norm.includes("http")) {
    return <Globe className={`text-teal-500 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("terminal") || norm.includes("cli") || norm.includes("bash") || norm.includes("shell")) {
    return <Terminal className={`text-neutral-700 dark:text-neutral-300 ${className}`} style={{ width: size, height: size }} />;
  }

  if (norm.includes("core") || norm.includes("algorithm") || norm.includes("system")) {
    return <Cpu className={`text-rose-500 ${className}`} style={{ width: size, height: size }} />;
  }

  // Default clean code icon
  return <Code2 className={`text-indigo-500 ${className}`} style={{ width: size, height: size }} />;
}
