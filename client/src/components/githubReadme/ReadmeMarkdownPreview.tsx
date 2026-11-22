import { useState } from "react";
import { Check, Copy, Download, FileCode } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface ReadmeMarkdownPreviewProps {
  markdown: string;
  title?: string;
  className?: string;
}

/** Simple regex-based markdown to HTML parser tailored for GitHub READMEs */
function parseGithubMarkdown(md: string): string {
  if (!md) return "<p class='text-muted-foreground italic'>No content to display.</p>";

  let html = md;

  // Escape dangerous script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-foreground mt-6 mb-3 pb-1 border-b border-border/50 flex items-center gap-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-foreground mt-8 mb-4 pb-1.5 border-b border-border flex items-center gap-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-extrabold text-foreground mt-6 mb-4 pb-2 border-b border-border">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary/60 bg-muted/30 pl-4 py-1.5 my-3 text-muted-foreground italic">$1</blockquote>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');

  // Markdown Tables
  const tableRegex = /\|(.+)\|\n\| *[-:]+[-| :]*\|\n((?:\|.*\|\n?)*)/g;
  html = html.replace(tableRegex, (_match, header, body) => {
    const headers = header
      .split("|")
      .map((h: string) => h.trim())
      .filter(Boolean);
    const rows = body
      .trim()
      .split("\n")
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

  // Images with Links [![Alt](img)](url)
  html = html.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, '<a href="$3" target="_blank" rel="noopener noreferrer" class="inline-block transition-opacity hover:opacity-85 mr-1.5 mb-1.5"><img src="$2" alt="$1" class="inline-block rounded-xs max-w-full" loading="lazy" /></a>');

  // Standalone Images ![Alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block max-w-full rounded-xs mr-1.5 mb-1.5" loading="lazy" />');

  // Links [Text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium inline-flex items-center gap-0.5">$1</a>');

  // Bold & Italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Inline Code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">$1</code>');

  // Unordered list items
  html = html.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc my-1 text-sm leading-relaxed text-foreground/90">$1</li>');

  // Clean empty paragraphs / double breaks
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
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
          className="p-6 sm:p-8 overflow-x-auto min-h-[360px] text-foreground leading-normal"
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
