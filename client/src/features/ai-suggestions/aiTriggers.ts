export interface AiPromptScenario {
  id: string;
  triggerMood: "curious" | "excited" | "thinking" | "proud";
  message: string;
  actionLabel?: string;
}

export const AI_SUGGESTION_PROMPTS: Record<string, AiPromptScenario> = {
  bulletEnhanced: {
    id: "bulletEnhanced",
    triggerMood: "excited",
    message: "I've drafted bullet points highlighting your metrics and achievements! Ready to review?",
    actionLabel: "Show suggestions",
  },
  lowAtsScore: {
    id: "lowAtsScore",
    triggerMood: "curious",
    message: "Missing keywords detected! Want me to weave them naturally into your experience?",
    actionLabel: "Optimize with AI",
  },
  summaryGenerated: {
    id: "summaryGenerated",
    triggerMood: "proud",
    message: "A high-impact executive summary has been crafted for you.",
    actionLabel: "Insert summary",
  },
};

