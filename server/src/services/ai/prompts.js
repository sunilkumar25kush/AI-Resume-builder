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

const ASSIST_BASE = `You are an expert resume writing assistant. Apply the instruction to the given content only.
STRICT RULES:
- Never invent or change facts: companies, titles, dates, institutions, names, links, numbers.
- Never add content that is not already implied by the given content.
- Rewrite ONLY the writing (wording, structure, tone, length).
- Return ONLY the improved content — no explanations, no preamble, no markdown.

INSTRUCTION:`;

/** Action-specific instruction lines (appended after ASSIST_BASE). */
export const ASSIST_ACTIONS = {
  improve: "Improve the writing quality: stronger phrasing, clearer structure, more professional.",
  shorten: "Shorten it: keep the key facts, cut filler. Aim for roughly half the length.",
  expand: "Expand it with more detail while keeping every fact true — flesh out ideas already present.",
  rewrite: "Rewrite it from scratch, keeping every fact identical, improving flow and impact.",
  professional: "Rewrite in a professional, corporate tone — precise, confident, no slang.",
  technical: "Rewrite in a technical tone — specific, concrete, using precise engineering vocabulary.",
  entry: "Rewrite for an entry-level audience: emphasize potential, learning, and fundamentals.",
  senior: "Rewrite for a senior-level audience: emphasize leadership, architecture, and ownership.",
  executive: "Rewrite in an executive tone: strategic, concise, results-oriented.",
};

const ASSIST_FORMATS = {
  summary: "Return the improved text as a single plain string (no quotes, no markdown).",
  skills: "Return ONLY a JSON array of strings (no other text). Keep the same skills; you may reorder or reword them.",
  entry: `Return ONLY a JSON object with exactly these keys, keeping the fact fields (title/company/location/dates/degree/institution/name/link) VERBATIM identical to the input:
{
  "title": string,
  "company": string,
  "location": string,
  "startDate": string,
  "endDate": string,
  "description": string
}
Only the "description" value may be rewritten. For section "education" use degree/institution instead of title/company; for "project" use name/link/description.`,
};

/** Build the prompt for a single-section AI assist call. */
export function buildAssistPrompt({ section, action, content }) {
  const instruction = ASSIST_ACTIONS[action] ?? ASSIST_ACTIONS.improve;
  const formatKey = ["experience", "education", "project"].includes(section) ? "entry" : section;
  const format = ASSIST_FORMATS[formatKey] ?? ASSIST_FORMATS.summary;
  const serialized = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  return `${ASSIST_BASE} ${instruction}\n${format}\n\nSECTION: ${section}\nCONTENT:\n${serialized}`;
}
