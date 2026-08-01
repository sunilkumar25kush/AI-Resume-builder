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

const GENERATION_INSTRUCTIONS = `You are an expert ATS resume writer. Rewrite the resume so it matches the job description as closely as possible.

STRICT TRUTH-PRESERVATION RULES (never break these):
- NEVER invent, change or remove: company names, job titles, employers, dates, institutions, degrees, projects, links, or people.
- NEVER invent skills that are not already in the resume. You may reorder or reword the existing skills, and you may surface a skill from the resume that the JD values, but you must not fabricate new ones.
- NEVER add fake numbers, metrics, or achievements. Quantify only when the resume already contains a concrete number.
- Do not drop any experience, education or project entry that exists in the resume. If you cannot improve an entry, keep its original text.

HOW TO IMPROVE (writing quality only):
- Rewrite the summary: strong, specific, tailored to this job description, 2-4 sentences.
- Rewrite experience/project bullet descriptions with strong action verbs (led, built, shipped, optimized, designed, delivered, reduced, automated).
- Where the resume already has numbers, emphasize them ("reduced load time by 40%", not "made site faster").
- Naturally weave in ATS keywords from the job description wherever they genuinely apply to existing content.
- Keep the same tone and factual content; improve structure and word choice only.

OUTPUT FORMAT:
Return ONLY a single JSON object, no text outside it, with exactly these keys:
{
  "summary": string,
  "contact": { "email": string, "phone": string, "location": string, "linkedin": string, "github": string },
  "skills": string[],
  "experience": [{ "title": string, "company": string, "location": string, "startDate": string, "endDate": string, "description": string }],
  "education": [{ "degree": string, "institution": string, "startDate": string, "endDate": string, "description": string }],
  "projects": [{ "name": string, "description": string, "link": string }]
}
- Omit any top-level key whose section is empty in the resume (do not invent content for empty sections).
- Every experience/education/project entry from the resume must appear, with company/institution/dates/names copied verbatim.`;

/** Build the prompt for a full AI resume generation run. */
export function buildGenerationPrompt({ resume, jd }) {
  return `${GENERATION_INSTRUCTIONS}

RESUME (structured data):
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jd, null, 2)}`;
}
