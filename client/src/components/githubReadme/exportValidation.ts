import type { GithubReadme, ValidationIssue, ValidationReport } from "@/types";

/**
 * Validates a GitHub Profile README Markdown string and document model
 * ensuring full compatibility with GitHub's Markdown renderer and sanitizer.
 */
export function validateGithubReadme(
  markdown: string,
  doc?: Partial<GithubReadme>,
): ValidationReport {
  const issues: ValidationIssue[] = [];
  const text = markdown || "";

  // 1. STATS CALCULATION
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;

  const imageMatches = text.match(/!\[.*?\]\(.*?\)|<img\s+[^>]*src=["'].*?["'][^>]*>/gi) || [];
  const imageCount = imageMatches.length;

  const badgeMatches = text.match(/img\.shields\.io\/badge|badge\.svg/gi) || [];
  const badgeCount = badgeMatches.length;

  const linkMatches = text.match(/\[.*?\]\(.*?\)|<a\s+[^>]*href=["'].*?["'][^>]*>/gi) || [];
  const linkCount = linkMatches.length;

  // 2. USERNAME & PLACEHOLDER CHECKS
  const username = doc?.profile?.githubUsername?.trim() || "";
  if (!username || username.toLowerCase() === "octocat") {
    issues.push({
      id: "placeholder-username",
      type: "warning",
      title: "GitHub Username Placeholder Detected",
      description: `Your profile currently uses "${username || "empty"}" as the username. GitHub stats cards, trophies, and profile links will display placeholder data instead of your real metrics.`,
      fixSuggestion: "Update your GitHub username in the Properties panel under Profile Information.",
    });
  }

  // 3. CODE BLOCK FENCE CLOSURE
  const codeBlockMatches = text.match(/```/g) || [];
  if (codeBlockMatches.length % 2 !== 0) {
    issues.push({
      id: "unclosed-code-block",
      type: "error",
      title: "Unclosed Markdown Code Block",
      description: "An odd number of triple backticks (```) was found. This will cause the remainder of your README to render as raw code.",
      fixSuggestion: "Ensure every opening code fence has a corresponding closing fence.",
    });
  }

  // 4. BROKEN LINKS & EMPTY TARGETS
  const emptyLinkRegex = /\[([^\]]+)\]\(\s*\)/g;
  let emptyLinkMatch;
  while ((emptyLinkMatch = emptyLinkRegex.exec(text)) !== null) {
    issues.push({
      id: `empty-link-${emptyLinkMatch.index}`,
      type: "warning",
      title: `Empty Link Target: "[${emptyLinkMatch[1]}]()"`,
      description: "A Markdown link has anchor text but an empty URL target.",
      fixSuggestion: "Provide a valid web destination URL or remove the empty brackets.",
    });
  }

  const emptyImageRegex = /!\[([^\]]*)\]\(\s*\)/g;
  let emptyImgMatch;
  while ((emptyImgMatch = emptyImageRegex.exec(text)) !== null) {
    issues.push({
      id: `empty-image-${emptyImgMatch.index}`,
      type: "error",
      title: "Broken Image Target",
      description: "An image tag has an empty source URL.",
      fixSuggestion: "Provide an image URL or delete the broken tag.",
    });
  }

  // 5. DATA URI & BLOB URLS (GitHub blocks these)
  if (/data:image\/[a-zA-Z0-9+]+;base64,/i.test(text)) {
    issues.push({
      id: "data-uri-image",
      type: "warning",
      title: "Base64 Data URI Detected in Markdown",
      description: "GitHub's image proxy (camo) strips or blocks raw base64 data URIs for security reasons.",
      fixSuggestion: "Export your README as a ZIP Package so all images are bundled in images/ with relative paths, or host images on a public CDN.",
    });
  }

  if (/blob:http/i.test(text)) {
    issues.push({
      id: "blob-url-image",
      type: "error",
      title: "Temporary Browser Blob URL Found",
      description: "Temporary local browser blob: URLs will not be accessible on GitHub.",
      fixSuggestion: "Upload images to an asset repository, use our ZIP package export, or host on an image provider.",
    });
  }

  // 6. GITHUB HTML SANITIZER & PROHIBITED TAGS
  const prohibitedTagRegex = /<\s*(script|style|iframe|form|input|button|embed|object|meta|link)\b/gi;
  let prohibitedMatch;
  while ((prohibitedMatch = prohibitedTagRegex.exec(text)) !== null) {
    const tagName = prohibitedMatch[1].toLowerCase();
    issues.push({
      id: `prohibited-tag-${tagName}`,
      type: "warning",
      title: `Unsupported HTML Tag: <${tagName}>`,
      description: `GitHub's Markdown renderer strips <${tagName}> tags automatically for security reasons.`,
      fixSuggestion: `Replace <${tagName}> with standard Markdown formatting or supported HTML tags (<p>, <div>, <table>).`,
    });
  }

  // 7. UNSUPPORTED CSS PROPERTIES IN STYLE ATTRIBUTES
  const styleAttrRegex = /style=["']([^"']*)["']/gi;
  let styleMatch;
  while ((styleMatch = styleAttrRegex.exec(text)) !== null) {
    const styleContent = styleMatch[1].toLowerCase();
    if (
      styleContent.includes("display: flex") ||
      styleContent.includes("display: grid") ||
      styleContent.includes("position: fixed") ||
      styleContent.includes("animation") ||
      styleContent.includes("transform")
    ) {
      issues.push({
        id: "unsupported-css-properties",
        type: "info",
        title: "Browser-Only CSS Detected in style attribute",
        description: "GitHub's HTML sanitizer strips advanced CSS like flexbox, grid, animations, and fixed positioning.",
        fixSuggestion: "Use HTML tables (<table>, <tr>, <td>) or <p align=\"center\"> for alignment and multi-column layouts.",
      });
      break;
    }
  }

  // 8. UNBALANCED COMMON HTML TAGS
  const commonTags = ["div", "table", "details", "summary"];
  for (const tag of commonTags) {
    const openCount = (text.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) || []).length;
    const closeCount = (text.match(new RegExp(`</${tag}>`, "gi")) || []).length;
    if (openCount !== closeCount) {
      issues.push({
        id: `unbalanced-${tag}`,
        type: "warning",
        title: `Unbalanced <${tag}> Tags`,
        description: `Found ${openCount} opening <${tag}> tag(s) and ${closeCount} closing </${tag}> tag(s).`,
        fixSuggestion: `Ensure every <${tag}> is properly closed with </${tag}>.`,
      });
    }
  }

  // 9. CONTENT COMPLETENESS CHECKS
  if (doc?.skills && doc.skills.length === 0) {
    issues.push({
      id: "no-skills",
      type: "info",
      title: "No Skills or Technologies Added",
      description: "Adding your tech stack badges makes your GitHub profile immediately recognizable to visitors and recruiters.",
      fixSuggestion: "Add languages and tools in the Skills section from the editor panel.",
    });
  }

  if (!text.trim()) {
    issues.push({
      id: "empty-content",
      type: "error",
      title: "README Content is Empty",
      description: "Your document contains no Markdown content to export.",
      fixSuggestion: "Choose a template or write Markdown content before exporting.",
    });
  }

  const isValid = issues.length === 0;
  const canExport = text.trim().length > 0;

  return {
    isValid,
    canExport,
    issues,
    stats: {
      characters,
      words,
      lines,
      sectionsCount: doc?.sections?.filter((s) => s.enabled).length || 0,
      imageCount,
      badgeCount,
      linkCount,
    },
  };
}
