import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { aiApi, type AiSuggestion } from "@/api/ai";
import { getApiErrorMessage } from "@/api/client";
import { EMPTY_PROJECT, splitSkills, type EditFormValues } from "@/components/resumes/editorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useJdsStore } from "@/stores/jds";

const TYPE_LABELS: Record<AiSuggestion["type"], string> = {
  "add-skill": "Skill",
  "add-keyword": "Keyword",
  "add-project": "Project",
  "improve-summary": "Summary",
  "add-section": "Section",
};

interface AiSuggestPanelProps {
  resumeId: string;
  /** Called after a suggestion is applied so the editor can green-highlight it. */
  onApplied: (suggestion: AiSuggestion) => void;
}

/**
 * Editor-time "what else should I add?" panel — reads a saved JD (or pasted
 * JD text) and lists concrete additions that would raise the ATS score.
 */
export function AiSuggestPanel({ resumeId, onApplied }: AiSuggestPanelProps) {
  const { getValues, setValue } = useFormContext<EditFormValues>();
  const jds = useJdsStore((state) => state.items);
  const fetchJds = useJdsStore((state) => state.fetch);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"jd" | "paste">("jd");
  const [jdId, setJdId] = useState("");
  const [jdText, setJdText] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[] | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  const canRun = mode === "jd" ? jdId.length > 0 : jdText.trim().length >= 20;

  const run = async () => {
    setBusy(true);
    setSuggestions(null);
    setApplied(new Set());
    try {
      const result = await aiApi.suggestions(resumeId, {
        jdId: mode === "jd" ? jdId : undefined,
        jdText: mode === "paste" ? jdText.trim() : undefined,
      });
      if (result.suggestions.length === 0) {
        toast.info("AI ko koi missing cheez nahi mili — resume is already strong for this JD");
      }
      setSuggestions(result.suggestions);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const apply = (index: number) => {
    const suggestion = suggestions?.[index];
    if (!suggestion) return;
    switch (suggestion.type) {
      case "add-skill": {
        const current = splitSkills(getValues("skillsText"));
        setValue("skillsText", [...current, suggestion.value].join("\n"), { shouldDirty: true });
        break;
      }
      case "add-project": {
        const current = getValues("projects");
        setValue(
          "projects",
          [
            ...current,
            {
              ...EMPTY_PROJECT,
              name: suggestion.value,
              technologies: suggestion.detail.split(",")[0]?.trim() ?? "",
              description: suggestion.detail,
            },
          ],
          { shouldDirty: true },
        );
        break;
      }
      case "improve-summary":
        setValue("summary", suggestion.value, { shouldDirty: true });
        break;
      case "add-keyword": {
        const summary = getValues("summary");
        setValue("summary", summary ? `${summary} ${suggestion.value}` : suggestion.value, { shouldDirty: true });
        break;
      }
      case "add-section":
        // Sections are structural — the user adds them via the form; the
        // suggestion text (detail) shows what to put in it.
        toast.info(`Section add karo: ${suggestion.value} — ${suggestion.detail || suggestion.reason}`);
        return;
    }
    setApplied((prev) => new Set(prev).add(index));
    onApplied(suggestion);
    toast.success(`Added: ${suggestion.value}`);
  };

  const loadJds = () => {
    if (jds.length === 0) void fetchJds();
  };

  return (
    <Card className={open ? "border-primary/40" : ""}>
      <CardHeader
        className="cursor-pointer select-none flex-row items-center justify-between gap-2 space-y-0"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            AI Suggest
          </CardTitle>
          <CardDescription>JD se aur kya add kare — ATS score badhane ke liye</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" aria-label={open ? "Collapse AI Suggest" : "Expand AI Suggest"}>
          {open ? "Close" : "Open"}
        </Button>
      </CardHeader>

      {open ? (
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("jd")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "jd" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Saved JD
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "paste" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Paste JD
            </button>
          </div>

          {mode === "jd" ? (
            <select
              value={jdId}
              onChange={(event) => setJdId(event.target.value)}
              onClick={loadJds}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a job description…</option>
              {jds.map((jd) => (
                <option key={jd._id} value={jd._id}>
                  {jd.title || jd.text.slice(0, 60)}
                </option>
              ))}
            </select>
          ) : (
            <Textarea
              rows={4}
              placeholder="JD text yahan paste karo…"
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
            />
          )}

          <Button type="button" onClick={run} disabled={busy || !canRun}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy ? "AI soch raha hai…" : "Get suggestions"}
          </Button>

          {suggestions ? (
            <ul className="flex flex-col gap-2">
              {suggestions.map((suggestion, index) => {
                const done = applied.has(index);
                return (
                  <li
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className={`rounded-lg border p-3 ${done ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-background"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {TYPE_LABELS[suggestion.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">{suggestion.reason}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">{suggestion.value}</p>
                    {suggestion.detail ? (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{suggestion.detail}</p>
                    ) : null}
                    {suggestion.type === "add-section" ? (
                      <p className="mt-2 text-xs text-muted-foreground">Section card se manually add karna hoga.</p>
                    ) : done ? (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Added — green highlight mein dikh raha hai
                      </p>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => apply(index)}>
                        Add
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
