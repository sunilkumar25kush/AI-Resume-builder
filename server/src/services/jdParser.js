import { cleanText, extractSkills } from "./resumeParser.js";

/**
 * Best-effort job description parser: extracts title, company, skills,
 * qualifications and responsibilities from raw text. Heuristic-based —
 * parsed output is meant to be reviewed/edited by the user (AI refinement
 * arrives with the AI engine module).
 */

const JD_SECTIONS = [
  { header: "skills", names: new Set(["skills", "technical skills", "required skills", "skills & requirements", "skills and requirements", "must have skills", "nice to have", "preferred skills", "good to have", "tech stack", "technologies", "what we look for", "what you bring", "your skills"]) },
  { header: "qualifications", names: new Set(["qualifications", "requirements", "job requirements", "basic qualifications", "minimum qualifications", "what you'll need", "what you will need", "what we're looking for", "we are looking for", "must have", "essential criteria", "experience required", "education", "education requirements", "about you", "you have", "your experience"]) },
  { header: "responsibilities", names: new Set(["responsibilities", "key responsibilities", "responsibilities & duties", "duties", "what you'll do", "what you will do", "what you'll be doing", "the role", "about the role", "role & responsibilities", "role and responsibilities", "your role", "day to day", "job description"]) },
  { header: "company", names: new Set(["about us", "about the company", "about the team", "who we are", "our company", "the company", "about", "company overview", "benefits", "perks", "why join us", "what we offer"]) },
  { header: "other", names: new Set(["additional information", "equal opportunity", "how to apply", "apply", "location", "salary", "compensation", "employment type", "job type", "about this role", "overview"]) },
];

const HEADER_LOOKUP = new Map();
for (const { header, names } of JD_SECTIONS) {
  for (const name of names) HEADER_LOOKUP.set(name, header);
}

/** Lines that read as qualifications even without a section header. */
const QUAL_KEY_RE = /(degree|years? of (?:relevant )?experience|experience (?:with|in)|proficiency|knowledge of|familiarity|fluent|certification|bachelor|master'?s|ph\.?d|education|graduate|undergraduate|must have|should have|ability to|strong (?:understanding|knowledge|communication|analytical|problem-solving))/i;
/** Lines that read as responsibilities/duties even without a section header. */
const DUTY_RE = /^(manage|lead|build|develop|design|implement|own|drive|deliver|create|maintain|improve|optimize|collaborate|work|support|write|test|deploy|analyze|architect|coordinate|mentor|review|plan|execute|ensure|handle|contribute|participate|provide|define|establish|oversee|spearhead|launch|ship|prototype|integrate|troubleshoot|debug|automate|monitor)/i;

function isSectionHeaderLine(line) {
  const trimmed = line.trim().replace(/[::\s]+$/, "").toLowerCase();
  return HEADER_LOOKUP.get(trimmed);
}

function classifyLine(line, lines, index) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (QUAL_KEY_RE.test(trimmed)) return "qualifications";
  if (DUTY_RE.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) return "responsibilities";
  // Default: a bullet or short line in the middle of the JD reads as a duty/requirement
  return lines[index - 1]?.trim() ? "responsibilities" : null;
}

function cleanEntry(value) {
  return value
    .replace(/^[-•*–—:;\d.)\s]+/, "")
    .trim()
    .slice(0, 500);
}

function extractTitleCompany(preamble) {
  let title = "";
  let company = "";
  const firstLines = preamble.filter(Boolean).slice(0, 3);

  for (const line of firstLines) {
    const stripped = line.replace(/^#+\s*/, "").trim();
    if (!stripped) continue;

    // "Senior Engineer at Acme Corp" / "Senior Engineer @ Acme"
    const atMatch = stripped.match(/^(.*?)\s+(?:at|@)\s+(.+)$/);
    if (atMatch) {
      title = atMatch[1].trim();
      company = atMatch[2].replace(/[|•·–—-].*$/, "").trim();
      break;
    }
    // "Senior Engineer | Acme Corp" / "Senior Engineer - Acme"
    const pipeMatch = stripped.match(/^(.*?)\s*[|•·]\s*(.+)$/);
    const dashMatch = !pipeMatch && stripped.match(/^(.*?)\s+[-–—]\s+(.+)$/);
    const sep = pipeMatch ?? dashMatch;
    if (sep) {
      title = sep[1].trim();
      company = sep[2].trim();
      break;
    }
    if (!title) title = stripped;
  }
  return { title, company };
}

/** Parse raw job description text into structured sections. */
export function parseJdText(raw) {
  const text = cleanText(raw);
  if (text.replace(/\s/g, "").length < 10) {
    throw Object.assign(new Error("Job description text is required"), { code: "UNREADABLE" });
  }

  const lines = text.split("\n").map((line) => line.trim());
  const sections = { preamble: [], skills: [], qualifications: [], responsibilities: [], company: [], other: [] };
  let current = "preamble";
  let foundHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const header = isSectionHeaderLine(line);
    if (header) {
      current = header;
      foundHeader = true;
      continue;
    }
    if (current === "preamble") {
      sections.preamble.push(line);
    } else {
      sections[current].push(line);
    }
  }

  // Unstructured JDs (no section headers) — classify preamble lines heuristically.
  const { title, company } = extractTitleCompany(sections.preamble);
  if (!foundHeader && sections.preamble.length > 1) {
    const body = sections.preamble.slice(1);
    for (let i = 0; i < body.length; i++) {
      const bucket = classifyLine(body[i], body, i);
      if (bucket) sections[bucket].push(body[i]);
    }
  }

  const skills = extractSkills(sections.skills.length ? sections.skills : [...sections.qualifications, ...sections.preamble.filter((line) => /[,•·|]/.test(line))]);
  const qualifications = sections.qualifications.map(cleanEntry).filter(Boolean).slice(0, 50);
  const responsibilities = sections.responsibilities.map(cleanEntry).filter(Boolean).slice(0, 50);
  const companyFromSection = sections.company[0]?.trim() ?? "";

  return {
    title,
    company: company || companyFromSection,
    skills,
    qualifications,
    responsibilities,
  };
}
