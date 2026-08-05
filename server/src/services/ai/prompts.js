const OPTIMIZE_INSTRUCTIONS = `You are an expert ATS resume reviewer. Compare the resume against the job description and return ONLY a single JSON object with exactly these keys:
{
  "atsScore": number from 0 to 100 (how ATS-friendly and well-structured the resume is),
  "matchPercent": number from 0 to 100 (how well the resume matches this specific job),
  "missingSkills": string[] (skills mentioned in the job description but missing from the resume, max 12),
  "matchedSkills": string[] (skills present in BOTH the resume and the job description, max 20),
  "keywordDensity": number from 0 to 100 (how densely the JD's keywords appear in the resume),
  "weakBullets": string[] (specific weak bullet points from the resume's experience/projects that read passively or lack impact, quoted as-is, max 8),
  "grammarIssues": string[] (specific grammar/spelling/wording issues found in the resume, quoted as-is, max 8),
  "formattingSuggestions": string[] (concrete ATS formatting fixes, max 8),
  "keywordSuggestions": string[] (specific phrases or keywords to add, max 8),
  "changes": [{ "type": "add-skill" | "add-keyword" | "add-section" | "improve-description", "section": string, "field": string, "value": string, "reason": string }] (max 15),
  "summary": string (2-3 sentences, plain English, no markdown)
}
Rules:
- atsScore: penalize missing sections, poor structure, sparse contact info; reward clear headings and keyword density.
- matchPercent: based on skills overlap, relevant experience and education.
- missingSkills: only include skills that are actually in the job description; do not invent skills.
- matchedSkills: only skills that literally appear in the resume AND the job description.
- weakBullets/grammarIssues: quote real text from the resume; do not fabricate.
- formattingSuggestions: concrete, copy-paste-ready fixes (e.g. "Use standard section headings like SKILLS and EXPERIENCE").
- keywordSuggestions: concrete, copy-paste-ready phrases (e.g. "Cross-functional team collaboration").
- changes: concrete additions that would raise the ATS score — a skill to add (from the JD), a keyword to weave into a section, a section to create, or a weak description to strengthen. "value" = the exact suggested text; "reason" = one short clause (e.g. "required in JD", "ATS keyword").
- Do not add any text outside the JSON object.`;

/** Build the full prompt for a resume-vs-JD optimization run. */
export function buildOptimizePrompt({ resume, jd }) {
  return `${OPTIMIZE_INSTRUCTIONS}

RESUME (structured data):
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jd, null, 2)}`;
}

const GENERATION_INSTRUCTIONS = `You are an expert ATS resume writer. Rewrite the resume so it matches the job description as closely as possible, ADDING the missing content that hurts its ATS score.

STRICT TRUTH-PRESERVATION RULES (never break these):
- NEVER invent, change or remove: company names, job titles, employers, dates, institutions, degrees, projects, links, or people.
- NEVER add fake numbers, metrics, or achievements. Quantify only when the resume already contains a concrete number.
- Do not drop any experience, education or project entry that exists in the resume. If you cannot improve an entry, keep its original text.

YOU MAY ADD (this is the point of the rewrite):
- Skills: compare the JD's required + preferred skills against the resume's skills and ADD the missing ones to the "skills" array (up to 8 new skills, all of them taken from the JD, never invented). Reorder the full list so the JD's most valued skills come first.
- Project technologies: for every project, fill "technologies" with the tech actually used (from the resume text or the JD's stack).
- ATS keywords from the JD woven naturally into the summary and descriptions wherever they genuinely apply.

HOW TO IMPROVE (writing quality):
- Rewrite the summary: strong, specific, tailored to this job description, 2-4 sentences.
- Rewrite experience and project descriptions as 3-5 achievement-focused bullets, each starting with a strong action verb (led, built, shipped, optimized, designed, delivered, reduced, automated). Separate bullets with newlines.
- Where the resume already has numbers, emphasize them ("reduced load time by 40%", not "made site faster").
- Keep the same tone and factual content; improve structure and word choice only.

OUTPUT FORMAT:
Return ONLY a single JSON object, no text outside it, with exactly these keys:
{
  "summary": string,
  "contact": { "email": string, "phone": string, "location": string, "linkedin": string, "github": string },
  "skills": string[],
  "experience": [{ "title": string, "company": string, "location": string, "startDate": string, "endDate": string, "description": string }],
  "education": [{ "degree": string, "institution": string, "startDate": string, "endDate": string, "description": string }],
  "projects": [{ "name": string, "description": string, "link": string, "technologies": string }],
  "changes": [{ "type": "add-skill" | "add-technologies" | "improve-description" | "add-keyword", "section": "skills" | "projects" | "experience" | "summary", "field": string, "value": string, "reason": string }]
}
- changes documents everything you ADDED: type "add-skill" for each new skill, "add-technologies" for project technologies, "add-keyword" for keywords woven into a section, "improve-description" for rewritten summaries/descriptions. "value" = the exact added text, "reason" = one short clause ("required in JD", "ATS keyword", "rewritten for impact").
- Omit any top-level key whose section is empty in the resume.
- Every experience/education/project entry from the resume must appear, with company/institution/dates/names copied verbatim.`;

/** Build the prompt for a full AI resume generation run. */
export function buildGenerationPrompt({ resume, jd }) {
  return `${GENERATION_INSTRUCTIONS}\n\nRESUME (structured data):\n${JSON.stringify(resume, null, 2)}\n\nJOB DESCRIPTION:\n${JSON.stringify(jd, null, 2)}`;
}

const JD_ONLY_INSTRUCTIONS = `You are an expert ATS resume writer. Create a fresh, professional resume for a job seeker targeting the job description below. The job seeker has NO work history yet, so this is a fresher-friendly resume.

STRICT TRUTH RULES (never break these):
- NEVER invent company names, employers, job titles held, dates, degrees, institutions, certifications, awards, languages, or any metric/number.
- Skills: use ONLY skills that appear in the job description (required + preferred). Include ALL of them so the ATS coverage is complete — aim for at least 10 skills, ordered most relevant first.
- Projects: suggest 2-3 portfolio/practice project ideas that demonstrate the JD's tech stack. Frame them as projects the candidate can build or has built — write the description generically (what it does, what technologies it uses) WITHOUT any company, client, date, or fake quantitative achievement. Never claim "at X company" or "increased revenue by Y%". Fill "technologies" for each project with the JD tech stack it uses.
- Do NOT create an experience section — the candidate has none.
- Do NOT create education, certifications, languages or awards — leave them out entirely.
- The summary must not claim any company, job, degree, or metric. It should highlight skills, motivation, and fit for this role.

EXPERIENCE LEVEL TONE:
- "fresher": emphasize fundamentals, learning agility, academic/portfolio projects, enthusiasm.
- "junior" (1-3 years): emphasize practical project experience, quick learning, collaboration.
- "senior": emphasize depth, ownership, architecture, mentoring — still WITHOUT inventing any employer.

OUTPUT FORMAT:
Return ONLY a single JSON object, no text outside it, with exactly these keys:
{
  "summary": string (3-4 sentences, plain English, no markdown),
  "skills": string[] (8-16 skills, all from the JD, ordered most relevant first),
  "projects": [{ "name": string, "description": string (2-3 sentences, no fabricated numbers or employers), "link": string (empty string), "technologies": string }]
}`;

/** Build the prompt for JD-only resume creation (Workflow 1). */
export function buildJdOnlyPrompt({ jd, targetTitle, experienceLevel }) {
  return `${JD_ONLY_INSTRUCTIONS}\n\nTARGET JOB TITLE: ${targetTitle || "(infer from job description)"}\nEXPERIENCE LEVEL: ${experienceLevel}\n\nJOB DESCRIPTION:\n${JSON.stringify(jd, null, 2)}`;
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

const SUGGEST_INSTRUCTIONS = `You are an expert ATS resume coach. Compare the resume against the job description and suggest concrete ADDITIONS that would raise the ATS match score. This runs while the user is editing the resume, so every suggestion must be immediately actionable in a form.

STRICT RULES:
- Never suggest fabricated facts: no invented employers, companies, dates, degrees, or numbers.
- Skills/keywords must come from the job description. Project ideas must be framed as things the candidate can build or learn (no companies, no fake metrics).
- Do not suggest removing anything; this is an ADD-ONLY assistant.

Return ONLY a single JSON object, no text outside it:
{
  "suggestions": [
    {
      "type": "add-skill" | "add-keyword" | "add-project" | "improve-summary" | "add-section",
      "section": "skills" | "summary" | "projects" | "experience" | "certifications" | "languages",
      "field": "skillsText" | "summary" | "description" | "technologies" | "name",
      "value": string (the exact text to add — for add-skill a single skill name, for add-project a short name),
      "detail": string (for add-project: a 2-3 sentence project description to paste; otherwise empty),
      "reason": string (one short clause — why it raises the score, e.g. "required in JD", "ATS keyword")
    }
  ]
}
Rules for the entries:
- max 10 suggestions, ordered by impact on the ATS score.
- add-skill: a JD skill the resume lacks (one skill per entry).
- add-keyword: a short JD phrase to weave into the summary or experience.
- add-project: a practice/portfolio project idea that demonstrates a JD technology; value = project name, detail = 2-3 sentence description mentioning the tech stack from the JD. max 3.
- improve-summary: a rewritten 2-3 sentence summary that folds in the JD keywords; value = the full new summary.
- add-section: only if the JD clearly implies it (e.g. JD mentions AWS certifications -> suggest Certifications) — value = the section title, detail = example entries.`;

/** Build the prompt for editor-time "what else should I add?" suggestions. */
export function buildSuggestPrompt({ resume, jd }) {
  return `${SUGGEST_INSTRUCTIONS}\n\nRESUME (structured data):\n${JSON.stringify(resume, null, 2)}\n\nJOB DESCRIPTION:\n${JSON.stringify(jd, null, 2)}`;
}
