import { useState, useId, useMemo } from "react";
import { Check, Copy, Download, FileCode } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface ReadmeMarkdownPreviewProps {
  markdown: string;
  title?: string;
  className?: string;
  showToolbar?: boolean;
  theme?: "dark" | "light";
}

/** Robust regex-based markdown and raw HTML parser tailored for GitHub Profile READMEs */
function parseGithubMarkdown(md: string): string {
  if (!md || !md.trim()) {
    return "<div class='text-muted-foreground italic text-center py-12 text-sm'>No README content to display. Add sections or customize on the left.</div>";
  }

  let html = md;

  // 1. Strip potentially unsafe scripts
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Fenced code blocks ```lang ... ```
  const codeBlocks: string[] = [];
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gim, (_match, _lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const placeholder = `%%CODE_BLOCK_${codeBlocks.length}%%`;
    codeBlocks.push(
      `<pre class="my-4 p-4 rounded-xl bg-[#161b22] text-[#e6edf3] font-mono text-xs overflow-x-auto border border-[#30363d] leading-relaxed"><code>${escaped}</code></pre>`,
    );
    return placeholder;
  });

  // 3. Headings with anchors and border styles
  html = html.replace(
    /^#### (.*$)/gim,
    '<h4 class="text-sm font-semibold mt-4 mb-2 pb-1 border-b border-border/40">$1</h4>',
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-base sm:text-lg font-bold mt-6 mb-3 pb-1 border-b border-border/60 flex items-center gap-2">$1</h3>',
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-lg sm:text-xl font-bold mt-7 mb-3 pb-1.5 border-b border-border flex items-center gap-2">$1</h2>',
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-xl sm:text-2xl font-extrabold mt-6 mb-4 pb-2 border-b border-border tracking-tight">$1</h1>',
  );

  // 4. Blockquotes
  html = html.replace(
    /^\> (.*$)/gim,
    '<blockquote class="border-l-4 border-primary/70 bg-muted/40 pl-4 py-2 my-3 text-muted-foreground italic rounded-r-md">$1</blockquote>',
  );

  // 5. Horizontal Rules
  html = html.replace(/^(?:---|___|\*\*\*)$/gim, '<hr class="my-6 border-border/60" />');

  // 6. Markdown Tables
  const tableRegex = /\|(.+)\|\r?\n\| *[-:]+[-| :]*\|\r?\n((?:\|.*\|\r?\n?)*)/g;
  html = html.replace(tableRegex, (_match, header, body) => {
    const headers = header
      .split("|")
      .map((h: string) => h.trim())
      .filter(Boolean);
    const rows = body
      .trim()
      .split(/\r?\n/)
      .map((row: string) =>
        row
          .split("|")
          .map((c: string) => c.trim())
          .filter(Boolean),
      );

    const headerHtml = `<tr>${headers
      .map((h: string) => `<th class="border border-border/70 px-4 py-2 bg-muted/60 text-left font-semibold text-xs sm:text-sm">${h}</th>`)
      .join("")}</tr>`;

    const bodyHtml = rows
      .map(
        (cols: string[]) =>
          `<tr class="hover:bg-muted/20 transition-colors">${cols
            .map((c: string) => `<td class="border border-border/70 px-4 py-2 text-xs sm:text-sm">${c}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-border text-sm">${headerHtml}${bodyHtml}</table></div>`;
  });

  // 7. Linked Images: [![Alt](imgUrl)](linkUrl)
  html = html.replace(
    /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
    '<a href="$3" target="_blank" rel="noopener noreferrer" class="inline-block transition-transform hover:scale-105 active:scale-95 m-0.5"><img src="$2" alt="$1" class="inline-block rounded-xs max-w-full" loading="lazy" /></a>',
  );

  // 8. Standalone Markdown Images: ![Alt](imgUrl)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="inline-block max-w-full rounded-xs m-0.5" loading="lazy" />',
  );

  // 9. Markdown Links: [Text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium inline-flex items-center gap-0.5">$1</a>',
  );

  // 10. Bold & Italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 11. Inline Code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary font-medium">$1</code>',
  );

  // 12. Unordered lists
  html = html.replace(
    /^- (.*$)/gim,
    '<li class="ml-5 list-disc my-1 text-sm leading-relaxed text-foreground/90">$1</li>',
  );

  // 13. Ensure raw <img /> tags get safe error fallbacks and responsiveness
  html = html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (_match, pre, src, post) => {
    // Preserve existing attributes (width, height, align) and ensure max-w-full
    return `<img ${pre} src="${src}" ${post} class="inline-block max-w-full h-auto" loading="lazy" />`;
  });

  // 14. Restore fenced code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODE_BLOCK_${idx}%%`, block);
  });

  return html;
}

export function ReadmeMarkdownPreview({
  markdown,
  title = "README.md",
  className = "",
  showToolbar = false,
  theme = "dark",
}: ReadmeMarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");
  const uniqueId = useId().replace(/:/g, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded README.md");
  };

  const parsedHtml = useMemo(() => parseGithubMarkdown(markdown), [markdown]);

  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl transition-colors ${
        isDark
          ? "bg-[#0d1117] text-[#c9d1d9] border-[#30363d]"
          : "bg-[#ffffff] text-[#1f2328] border-[#d0d7de]"
      } border shadow-xs overflow-hidden ${className}`}
    >
      {/* Scoped CSS for GitHub README authentic layout, badges, alignment, and tables */}
      <style>{`
        .gh-readme-${uniqueId} {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          line-height: 1.6;
          word-wrap: break-word;
        }
        .gh-readme-${uniqueId} [align="center"] {
          text-align: center !important;
          margin-left: auto;
          margin-right: auto;
        }
        .gh-readme-${uniqueId} [align="left"] {
          text-align: left !important;
        }
        .gh-readme-${uniqueId} [align="right"] {
          text-align: right !important;
        }
        .gh-readme-${uniqueId} div[align="center"] > img,
        .gh-readme-${uniqueId} p[align="center"] > img,
        .gh-readme-${uniqueId} p[align="center"] > a > img {
          display: inline-block !important;
          vertical-align: middle;
        }
        .gh-readme-${uniqueId} p[align="center"],
        .gh-readme-${uniqueId} p[align="left"] {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .gh-readme-${uniqueId} p[align="center"] {
          justify-content: center;
        }
        .gh-readme-${uniqueId} p[align="left"] {
          justify-content: flex-start;
        }
        .gh-readme-${uniqueId} table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          display: table;
        }
        .gh-readme-${uniqueId} td,
        .gh-readme-${uniqueId} th {
          border: 1px solid ${isDark ? "#30363d" : "#d0d7de"};
          padding: 0.5rem 0.75rem;
        }
        .gh-readme-${uniqueId} td[align="center"],
        .gh-readme-${uniqueId} th[align="center"] {
          text-align: center !important;
        }
        .gh-readme-${uniqueId} img {
          max-width: 100%;
          box-sizing: content-box;
        }
        .gh-readme-${uniqueId} hr {
          border-color: ${isDark ? "#30363d" : "#d0d7de"};
          margin: 1.5rem 0;
        }
        .gh-readme-${uniqueId} h1,
        .gh-readme-${uniqueId} h2,
        .gh-readme-${uniqueId} h3,
        .gh-readme-${uniqueId} h4 {
          color: ${isDark ? "#f0f6fc" : "#1f2328"};
          border-color: ${isDark ? "#21262d" : "#d8dee4"};
        }
        .gh-readme-${uniqueId} a {
          color: ${isDark ? "#4493f8" : "#0969da"};
        }
        .gh-readme-${uniqueId} code {
          background-color: ${isDark ? "rgba(110,118,129,0.4)" : "rgba(175,184,193,0.2)"};
          color: ${isDark ? "#e6edf3" : "#1f2328"};
          border-radius: 6px;
          padding: 0.2em 0.4em;
          font-size: 85%;
        }
      `}</style>

      {/* Optional Standalone File Header bar (only when showToolbar is true) */}
      {showToolbar && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b text-xs font-medium ${
            isDark
              ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
              : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" />
            <span className="font-semibold">{title}</span>
            <span className="text-[11px] font-mono opacity-70">
              {markdown.length} chars • {markdown.split("\n").length} lines
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-lg border border-border bg-background/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === "raw"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Raw MD
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      {activeTab === "preview" ? (
        <div
          className={`p-6 sm:p-10 overflow-x-auto min-h-[400px] gh-readme-${uniqueId}`}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      ) : (
        <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono overflow-x-auto min-h-[400px] bg-neutral-950 text-neutral-100 whitespace-pre-wrap leading-relaxed select-all">
          {markdown}
        </pre>
      )}
    </div>
  );
}

export default ReadmeMarkdownPreview;
