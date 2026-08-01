import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/api/client";
import { ASSIST_ACTION_LABELS, aiApi, type AssistAction, type AssistSection } from "@/api/ai";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AiAssistMenuProps {
  section: AssistSection;
  /** Returns the current content of the section (string, string[], or entry object). */
  getContent: () => unknown;
  /** Called with the AI result — apply it to the form. */
  onResult: (result: unknown) => void;
  label?: string;
  align?: "start" | "end";
  compact?: boolean;
}

/** Sparkles dropdown with the 9 AI-assist actions for one section. */
export function AiAssistMenu({ section, getContent, onResult, label = "AI assist", align = "end", compact = false }: AiAssistMenuProps) {
  const [busy, setBusy] = useState<AssistAction | null>(null);

  const run = async (action: AssistAction) => {
    setBusy(action);
    try {
      const result = await aiApi.assist(section, action, getContent());
      onResult(result);
      toast.success(`${ASSIST_ACTION_LABELS[action]} applied`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-primary" aria-label={`AI assist — ${label}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
          {!compact ? label : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {(Object.keys(ASSIST_ACTION_LABELS) as AssistAction[]).map((action) => (
          <DropdownMenuItem key={action} onSelect={() => void run(action)} disabled={busy !== null}>
            {ASSIST_ACTION_LABELS[action]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <span className="text-xs text-muted-foreground">Facts are never changed — only wording</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
