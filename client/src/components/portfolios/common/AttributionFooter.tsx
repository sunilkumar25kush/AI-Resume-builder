import { ExternalLink, ShieldCheck } from "lucide-react";

export interface AttributionFooterProps {
  author: string;
  templateName: string;
  license?: string;
  originalUrl?: string;
  repoUrl?: string;
  notes?: string;
}

export function AttributionFooter({
  author,
  templateName,
  license = "MIT License",
  originalUrl,
  repoUrl,
  notes,
}: AttributionFooterProps) {
  const targetUrl = originalUrl || repoUrl;

  return (
    <footer className="w-full py-8 px-4 border-t border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-950/50 text-xs text-neutral-500 dark:text-neutral-400 mt-16">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Design adapted from <strong>{templateName}</strong> by <strong>{author}</strong> ({license}).
          </span>
        </div>
        <div className="flex items-center gap-4">
          {notes && <span className="text-neutral-400 dark:text-neutral-500">{notes}</span>}
          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Original Source
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default AttributionFooter;
