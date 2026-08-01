import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { ResumePreview } from "@/components/resumes/ResumePreview";
import { Button } from "@/components/ui/button";
import type { ParsedResumeData, ResumeTemplate } from "@/types";

interface PreviewPaneProps {
  data: ParsedResumeData;
  template: ResumeTemplate;
  title?: string;
}

/** Live preview frame with a desktop / phone-width toggle. */
export function PreviewPane({ data, template, title }: PreviewPaneProps) {
  const [width, setWidth] = useState<"full" | "mobile">("full");

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant={width === "full" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setWidth("full")}
          aria-pressed={width === "full"}
          aria-label="Preview at desktop width"
        >
          <Monitor className="h-4 w-4" aria-hidden />
          Desktop
        </Button>
        <Button
          type="button"
          variant={width === "mobile" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setWidth("mobile")}
          aria-pressed={width === "mobile"}
          aria-label="Preview at phone width"
        >
          <Smartphone className="h-4 w-4" aria-hidden />
          Phone
        </Button>
      </div>
      <div className="min-h-[420px] flex-1 overflow-hidden rounded-lg border bg-muted/40 p-4 sm:p-6">
        <div
          className={`mx-auto overflow-hidden rounded-sm shadow-md ring-1 ring-black/5 transition-[max-width] duration-300 ${
            width === "mobile" ? "max-w-[375px]" : "max-w-[820px]"
          }`}
        >
          <ResumePreview data={data} template={template} title={title} className="min-h-[520px]" />
        </div>
      </div>
    </div>
  );
}
