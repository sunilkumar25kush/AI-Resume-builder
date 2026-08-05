import { computeMatchMetrics } from "./optimizer.service.js";

const ACTION_VERBS = [
  "led",
  "built",
  "created",
  "developed",
  "designed",
  "managed",
  "implemented",
  "improved",
  "reduced",
  "delivered",
  "optimized",
  "automated",
  "launched",
  "achieved",
  "coordinated",
  "streamlined",
];

/**
 * Deterministic ATS "structure & content" score — no AI involved, so it is
 * instant, free and reproducible. Penalizes missing contact info, missing
 * sections, weak summaries, undated experience and unquantified bullets.
 */
export function computeAtsStructureScore(parsedData) {
  const data = parsedData ?? {};
  const contact = data.contact ?? {};
  const summary = (data.summary ?? "").trim();
  const summaryWords = summary ? summary.split(/\s+/).length : 0;
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  const languages = Array.isArray(data.languages) ? data.languages : [];

  const checks = [];
  const add = (label, ok, hint) => checks.push({ label, ok, hint });

  // Contact completeness (ATS can't reach a candidate without these)
  add("Email present", Boolean(contact.email?.trim()), "Top of resume mein email add karo");
  add("Phone present", Boolean(contact.phone?.trim()), "Mobile number add karo");
  add("Location present", Boolean(contact.location?.trim()), "City, State add karo");

  // Content sections
  add("Summary of 15+ words", summaryWords >= 15, "2-3 line professional summary likho (15+ words)");
  add("5+ skills listed", skills.length >= 5, "Kam se kam 5 skills list karo — ATS keywords yahi se milte hain");
  add("Experience section", experience.length > 0, "Work experience entry add karo");
  add(
    "Dates on every experience",
    experience.length > 0 && experience.every((entry) => entry.startDate || entry.endDate),
    "Har experience par start/end date honi chahiye",
  );
  add("Projects section", projects.length > 0, "2+ projects add karo — freshers ke liye critical");
  add("Education section", education.length > 0, "Education entry add karo");
  add(
    "Quantified results (numbers)",
    [...experience, ...projects].some((entry) => /\d/.test(`${entry.description ?? ""} ${entry.achievements ?? ""}`)),
    "Numbers use karo (e.g. \"40% faster\", \"200 students\") — ATS aur recruiter dono ko pasand",
  );
  add(
    "Action verbs in bullets",
    [...experience, ...projects]
      .map((entry) => `${entry.description ?? ""}`)
      .join(" ")
      .toLowerCase()
      .split(/\b/)
      .some((word) => ACTION_VERBS.includes(word)),
    "Bullets \"Led\", \"Built\", \"Improved\" jaisi strong verbs se shuru karo",
  );
  add(
    "Certifications or languages",
    certifications.length > 0 || languages.length > 0,
    "Certifications ya languages section add karo (agar hai toh)",
  );

  // Length sanity (ATS parsers choke on very long resumes)
  const allText = [
    summary,
    ...skills,
    ...experience.flatMap((entry) => Object.values(entry).join(" ")),
    ...projects.flatMap((entry) => Object.values(entry).join(" ")),
  ].join(" ");
  const totalWords = allText ? allText.split(/\s+/).length : 0;
  add("Length ~1-2 pages (300-1200 words)", totalWords >= 300 && totalWords <= 1200, "Resume 1-2 page ke beech rakho");

  const passed = checks.filter((check) => check.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks, totalWords };
}

/**
 * Full ATS report: structure score always; JD match metrics when a JD is
 * provided (same deterministic engine the optimizer uses).
 */
export function computeAtsReport({ parsedData, jd }) {
  const structure = computeAtsStructureScore(parsedData);

  let match = null;
  if (jd) {
    const metrics = computeMatchMetrics({ resume: parsedData ?? {}, jd });
    match = {
      matchPercent: metrics.matchPercent,
      keywordDensity: metrics.keywordDensity,
      matchedSkills: metrics.matchedSkills,
      missingSkills: metrics.missingSkills,
    };
  }

  // Overall: weighted blend when a JD exists, otherwise pure structure.
  const atsScore = match ? Math.round(0.6 * structure.score + 0.4 * match.matchPercent) : structure.score;

  return {
    atsScore,
    structureScore: structure.score,
    matchPercent: match?.matchPercent ?? null,
    keywordDensity: match?.keywordDensity ?? null,
    matchedSkills: match?.matchedSkills ?? [],
    missingSkills: match?.missingSkills ?? [],
    checklist: structure.checks,
    totalWords: structure.totalWords,
  };
}
