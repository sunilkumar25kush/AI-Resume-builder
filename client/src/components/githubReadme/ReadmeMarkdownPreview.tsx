import { useState, useId } from "react";
import { Check, Copy, Download, FileCode } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface ReadmeMarkdownPreviewProps {
  markdown: string;
  title?: string;
  className?: string;
}

/** Robust regex-based markdown and raw HTML parser tailored for GitHub Profile READMEs */
function parseGithubMarkdown(md: string): string {
  if (!md || !md.trim()) {
    return "<div class='text-muted-foreground italic text-center py-8'>No content to display.</div>";
  }

  let html = md;

  // 1. Strip potentially unsafe scripts
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Fenced code blocks ```lang ... ```
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gim, (_match, _lang, code) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="my-4 p-4 rounded-xl bg-neutral-900/90 text-neutral-100 font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed"><code>${escaped}</code></pre>`;
  });

  // 3. Headings with anchors and border styles
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-foreground mt-4 mb-2 pb-1 border-b border-border/40">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-foreground mt-6 mb-3 pb-1 border-b border-border/60 flex items-center gap-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-foreground mt-8 mb-4 pb-1.5 border-b border-border flex items-center gap-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-extrabold text-foreground mt-6 mb-4 pb-2 border-b border-border tracking-tight">$1</h1>');

  // 4. Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary/70 bg-muted/40 pl-4 py-2 my-3 text-muted-foreground italic rounded-r-md">$1</blockquote>');

  // 5. Horizontal Rules
  html = html.replace(/^(?:---|___|\*\*\*)$/gim, '<hr class="my-6 border-border" />');

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
    '<a href="$3" target="_blank" rel="noopener noreferrer" class="inline-block transition-transform hover:scale-105 active:scale-95 m-1"><img src="$2" alt="$1" class="inline-block rounded-xs max-w-full" loading="lazy" onerror="this.style.opacity=\'0.5\';" /></a>',
  );

  // 8. Standalone Markdown Images: ![Alt](imgUrl)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="inline-block max-w-full rounded-xs m-1" loading="lazy" onerror="this.style.opacity=\'0.5\';" />',
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
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary font-medium">$1</code>');

  // 12. Unordered lists
  html = html.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc my-1 text-sm leading-relaxed text-foreground/90">$1</li>');

  // 13. Ensure raw <img /> tags get safe error fallbacks and responsiveness
  html = html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (_match, pre, src, post) => {
    return `<img ${pre} src="${src}" ${post} class="inline-block max-w-full h-auto" loading="lazy" onerror="this.style.opacity='0.5';" />`;
  });

  // 14. Convert multiline breaks to clean spacers
  html = html.replace(/\n\n+/g, "<div class='h-3'></div>");

  return html;
}

export function ReadmeMarkdownPreview({
  markdown,
  title = "README.md",
  className = "",
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

  const parsedHtml = parseGithubMarkdown(markdown);

  return (
    <div className={`rounded-xl border border-border bg-card shadow-xs overflow-hidden ${className}`}>
      {/* Scoped CSS for GitHub README raw HTML centering, badges, tables, and widgets */}
      <style>{`
        .gh-readme-${uniqueId} [align="center"] {
          text-align: center !important;
        }
        .gh-readme-${uniqueId} [align="center"] img {
          display: inline-block !important;
          margin-left: auto;
          margin-right: auto;
        }
        .gh-readme-${uniqueId} p[align="center"] {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .gh-readme-${uniqueId} table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .gh-readme-${uniqueId} td[align="center"],
        .gh-readme-${uniqueId} th[align="center"] {
          text-align: center !important;
        }
        .gh-readme-${uniqueId} table td,
        .gh-readme-${uniqueId} table th {
          border: 1px solid var(--border, rgba(128, 128, 128, 0.2));
          padding: 0.5rem 0.75rem;
        }
        .gh-readme-${uniqueId} img {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      {/* GitHub Repo File Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <FileCode className="h-4 w-4 text-primary" />
          <span className="font-semibold">{title}</span>
          <span className="text-muted-foreground text-[11px] font-mono">
            {markdown.length} chars • {markdown.split("\n").length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Switch Preview / Raw */}
          <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs">
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

      {/* Main Content View */}
      {activeTab === "preview" ? (
        <div
          className={`p-6 sm:p-8 overflow-x-auto min-h-[360px] text-foreground leading-normal gh-readme-${uniqueId}`}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      ) : (
        <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono overflow-x-auto min-h-[360px] bg-muted/20 text-foreground/90 whitespace-pre-wrap leading-relaxed select-all">
          {markdown}
        </pre>
      )}
    </div>
  );
}
export default ReadmeMarkdownPreview;
