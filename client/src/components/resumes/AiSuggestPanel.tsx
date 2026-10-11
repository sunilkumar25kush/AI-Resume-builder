import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
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
 * Targeted keyword and skill addition panel — audits a job description
 * to surface additions that improve ATS coverage and recruiter relevance.
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
        toast.info("No critical gaps identified — your resume is already well-aligned with this job description.");
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
        toast.info(`Add section '${suggestion.value}' using the editor section cards above.`);
        return;
    }
    setApplied((prev) => new Set(prev).add(index));
    onApplied(suggestion);
    toast.success(`Applied to draft: ${suggestion.value}`);
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
            <Lightbulb className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Role Alignment &amp; Keyword Insights
          </CardTitle>
          <CardDescription>
            Surface high-impact skills and keywords from the job description to strengthen your draft.
          </CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" aria-label={open ? "Collapse insights" : "Expand insights"}>
          {open ? "Close" : "Open"}
        </Button>
      </CardHeader>

      {open ? (
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("jd")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "jd" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Saved Job Description
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "paste" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Paste New JD Text
            </button>
          </div>

          {mode === "jd" ? (
            <select
              value={jdId}
              onChange={(event) => setJdId(event.target.value)}
              onClick={loadJds}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a saved job description…</option>
              {jds.map((jd) => (
                <option key={jd._id} value={jd._id}>
                  {jd.title || jd.company || jd.text.slice(0, 60)}
                </option>
              ))}
            </select>
          ) : (
            <Textarea
              rows={4}
              placeholder="Paste the target job description or requirements here…"
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
            />
          )}

          <Button type="button" onClick={run} disabled={busy || !canRun} className="font-medium">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Lightbulb className="mr-2 h-4 w-4" aria-hidden />}
            {busy ? "Analyzing alignment…" : "Identify Missing Keywords"}
          </Button>

          {suggestions ? (
            <ul className="flex flex-col gap-2 pt-1">
              {suggestions.map((suggestion, index) => {
                const done = applied.has(index);
                return (
                  <li
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    className={`rounded-lg border p-3.5 transition-colors ${done ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30" : "border-border bg-background"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        {TYPE_LABELS[suggestion.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">{suggestion.reason}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">{suggestion.value}</p>
                    {suggestion.detail ? (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{suggestion.detail}</p>
                    ) : null}
                    {suggestion.type === "add-section" ? (
                      <p className="mt-2 text-xs text-muted-foreground">Add this section using the editor section cards above.</p>
                    ) : done ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Applied to draft
                      </p>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="mt-2 text-xs" onClick={() => apply(index)}>
                        Apply to draft
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
