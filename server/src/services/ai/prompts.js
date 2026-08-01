const OPTIMIZE_INSTRUCTIONS = `You are an expert ATS resume reviewer. Compare the resume against the job description and return ONLY a single JSON object with exactly these keys:
{
  "atsScore": number from 0 to 100 (how ATS-friendly and well-structured the resume is),
  "matchPercent": number from 0 to 100 (how well the resume matches this specific job),
  "missingSkills": string[] (skills mentioned in the job description but missing from the resume, max 12),
  "keywordSuggestions": string[] (specific phrases or keywords to add, max 8),
  "summary": string (2-3 sentences, plain English, no markdown)
}
Rules:
- atsScore: penalize missing sections, poor structure, sparse contact info; reward clear headings and keyword density.
- matchPercent: based on skills overlap, relevant experience and education.
- missingSkills: only include skills that are actually in the job description; do not invent skills.
- keywordSuggestions: concrete, copy-paste-ready phrases (e.g. "Cross-functional team collaboration").
- Do not add any text outside the JSON object.`;

/** Build the full prompt for a resume-vs-JD optimization run. */
export function buildOptimizePrompt({ resume, jd }) {
  return `${OPTIMIZE_INSTRUCTIONS}

RESUME (structured data):
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jd, null, 2)}`;
}
