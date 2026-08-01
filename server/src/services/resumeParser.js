import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

/**
 * Best-effort resume parser: extracts raw text from PDF/DOCX and normalizes
 * it into structured sections. Heuristic-based — parsed output is meant to
 * be reviewed/edited by the user before saving.
 */

const SECTION_HEADERS = new Set([
  "summary", "profile", "objective", "professional summary",
  "education", "academic background", "work experience", "experience", "professional experience",
  "employment history", "skills", "technical skills", "core skills", "technologies",
  "projects", "project", "personal projects", "academic projects",
  "certifications", "certificates", "languages", "interests", "achievements", "awards",
  "volunteering", "activities", "extracurricular", "publications", "references",
]);

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_RE = /(?:\+?\d[\d\s().-]{8,}\d)/g;
const LINK_RE = /(?:https?:\/\/|www\.)[^\s]+/g;

export function cleanText(raw) {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeHeader(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 50) return false;
  const lower = trimmed.toLowerCase().replace(/[:\s]+$/, "");
  if (SECTION_HEADERS.has(lower)) return true;
  // ALL-CAPS short line (common resume section header style)
  return /^[A-Z][A-Z0-9&/()\-\s]{2,}$/.test(trimmed) && trimmed.split(/\s+/).length <= 4;
}

function isSkillLine(line) {
  // "React, Node.js, MongoDB • AWS · Git" style lines
  return /[,•·|]/.test(line) && line.length <= 300 && !looksLikeHeader(line);
}

function parseSections(lines) {
  const sections = [{ header: "preamble", lines: [] }];
  for (const line of lines) {
    if (looksLikeHeader(line)) {
      sections.push({ header: line.trim().toLowerCase().replace(/[:\s]+$/, ""), lines: [] });
    } else {
      sections[sections.length - 1].lines.push(line);
    }
  }
  return sections;
}

export function extractSkills(lines) {
  const skills = new Set();
  for (const line of lines) {
    if (!isSkillLine(line)) continue;
    const tokens = line.split(/[,•·|;]+/).map((token) => token.trim());
    for (const token of tokens) {
      const cleaned = token.replace(/^[:\-–]+\s*/, "").trim();
      if (cleaned.length > 1 && cleaned.length <= 60 && !/^\d+$/.test(cleaned)) {
        skills.add(cleaned);
      }
    }
  }
  return [...skills];
}

function splitBlocks(lines) {
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(line.trim());
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

const DATE_RE_G = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\b(?:19|20)\d{2}\b|present|current/gi;
const DATE_RE = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\b(?:19|20)\d{2}\b|present|current/i;

function hasDate(line) {
  DATE_RE_G.lastIndex = 0;
  return DATE_RE_G.test(line);
}

function extractDates(line) {
  DATE_RE_G.lastIndex = 0;
  return line.match(DATE_RE_G) ?? [];
}

function isDateOnlyLine(line) {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed.length < 40 && hasDate(trimmed) && !/[|•·]/.test(trimmed);
}

/** DOCX paragraphs often put dates on their own line — fold them into the previous block line. */
function mergeDateLines(block) {
  const merged = [];
  for (const line of block) {
    const trimmed = line.trim();
    if (trimmed && merged.length && isDateOnlyLine(trimmed)) {
      merged[merged.length - 1] += ` ${trimmed}`;
    } else {
      merged.push(trimmed);
    }
  }
  return merged.filter(Boolean);
}

/** DOCX paragraphs often put dates on their own line — fold them into the previous non-empty line. */
function foldDateLines(lines) {
  const folded = [];
  let lastNonEmpty = -1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && isDateOnlyLine(trimmed) && lastNonEmpty >= 0) {
      folded[lastNonEmpty] += ` ${trimmed}`;
    } else {
      folded.push(line);
      if (trimmed) lastNonEmpty = folded.length - 1;
    }
  }
  return folded;
}

function parseExperienceBlocks(blocks) {
  return blocks.map((block) => {
    const entry = { title: "", company: "", location: "", startDate: "", endDate: "", description: "" };
    const lines = mergeDateLines(block);
    const headerLine = lines[0] ?? "";
    const dateLineIndex = lines.slice(0, 3).findIndex(hasDate);
    const dateLine = dateLineIndex >= 0 ? lines[dateLineIndex] : "";

    // Header like "Senior Engineer | Acme Corp | Bengaluru" or "Acme Corp — 2020-2023"
    const parts = headerLine.split(/\s{2,}|\t/).map((part) => part.trim()).filter(Boolean);
    const pipeParts = parts.length === 1 ? parts[0].split(/\s*[|•·]\s*/).map((part) => part.trim()).filter(Boolean) : parts;

    if (pipeParts.length >= 2) {
      [entry.title, entry.company] = pipeParts;
      if (pipeParts.length >= 3) entry.location = pipeParts[2];
    } else if (hasDate(headerLine)) {
      entry.company = headerLine.replace(DATE_RE, "").replace(/[–\-—|]+/g, "").trim();
    } else {
      entry.title = headerLine;
    }

    if (dateLine) {
      const dateParts = extractDates(dateLine);
      if (dateParts.length >= 2) {
        entry.startDate = dateParts[0];
        entry.endDate = dateParts[1];
      } else {
        entry.endDate = dateLine.toLowerCase().includes("present") || dateLine.toLowerCase().includes("current") ? "Present" : dateParts[0] ?? "";
      }
    }

    entry.description = lines.slice(dateLineIndex >= 0 ? dateLineIndex + 1 : 1).join(" ");
    return entry;
  });
}

function parseEducationBlocks(blocks) {
  return blocks.map((block) => {
    const entry = { degree: "", institution: "", startDate: "", endDate: "", description: "" };
    const lines = mergeDateLines(block);
    const headerLine = lines[0] ?? "";
    const dateLineIndex = lines.slice(0, 3).findIndex(hasDate);
    const dateLine = dateLineIndex >= 0 ? lines[dateLineIndex] : "";

    const parts = headerLine.split(/\s{2,}|\t|\s*[|•·]\s*/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      [entry.degree, entry.institution] = parts;
    } else {
      entry.degree = headerLine;
    }

    if (dateLine) {
      const dateParts = extractDates(dateLine);
      if (dateParts.length >= 2) {
        entry.startDate = dateParts[0];
        entry.endDate = dateParts[1];
      } else {
        entry.endDate = dateParts[0] ?? "";
      }
    }

    entry.description = lines.slice(dateLineIndex >= 0 ? dateLineIndex + 1 : 1).join(" ");
    return entry;
  });
}

function parseProjectBlocks(blocks) {
  return blocks.map((block) => {
    const entry = { name: "", description: "", link: "" };
    const headerLine = block[0] ?? "";
    const link = headerLine.match(/https?:\/\/[^\s]+/) ?? block.join(" ").match(/https?:\/\/[^\s]+/);
    if (link) entry.link = link[0];
    entry.name = headerLine.replace(/https?:\/\/[^\s]+/, "").trim();
    entry.description = block.slice(1).join(" ");
    if (!entry.description && block.length > 1) entry.description = block.slice(1).join(" ");
    return entry;
  });
}

function joinSectionText(lines) {
  return lines
    .filter((line) => !isSkillLine(line))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Normalize raw extracted text into the structured resume shape. */
export function normalizeResumeText(text) {
  const raw = cleanText(text);
  if (raw.replace(/\s/g, "").length < 20) {
    throw Object.assign(new Error("Could not find readable content in this file"), { code: "UNREADABLE" });
  }

  const email = raw.match(EMAIL_RE)?.[0] ?? "";
  const phone = raw.match(PHONE_RE)?.[0]?.replace(/\s+/g, " ").trim() ?? "";
  const links = raw.match(LINK_RE) ?? [];
  const linkedin = links.find((link) => link.includes("linkedin")) ?? "";
  const github = links.find((link) => link.includes("github")) ?? "";

  const sections = parseSections(raw.split("\n"));
  const getSection = (...names) => sections.find((section) => names.includes(section.header))?.lines ?? [];

  const summaryLines = getSection("summary", "profile", "objective", "professional summary");
  const preamble = sections[0].lines;
  const summary = joinSectionText([...preamble.filter((line) => !EMAIL_RE.test(line) && !PHONE_RE.test(line) && !LINK_RE.test(line)), ...summaryLines]);

  const skills = extractSkills(getSection("skills", "technical skills", "core skills", "technologies"));
  const experienceBlocks = splitBlocks(foldDateLines(getSection("experience", "work experience", "professional experience", "employment history")));
  const educationBlocks = splitBlocks(foldDateLines(getSection("education", "academic background")));
  const projectBlocks = splitBlocks(foldDateLines(getSection("projects", "project", "personal projects", "academic projects")));

  return {
    summary,
    contact: { email, phone, location: "", linkedin, github },
    skills,
    experience: parseExperienceBlocks(experienceBlocks),
    education: parseEducationBlocks(educationBlocks),
    projects: parseProjectBlocks(projectBlocks),
  };
}

/** Extract raw text from an uploaded file buffer based on its MIME type. */
export async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text;
  }
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
