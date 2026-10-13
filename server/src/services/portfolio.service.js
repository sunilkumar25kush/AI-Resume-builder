import crypto from "node:crypto";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { Portfolio } from "../models/Portfolio.js";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { geminiService } from "./ai/gemini.service.js";
import { cleanText, normalizeResumeText } from "./resumeParser.js";
import { createPortfolioSchema } from "../validations/portfolio.validation.js";

/** Convert text into a URL-friendly slug */
export function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a unique slug based on title/name */
async function generateUniqueSlug(baseText = "portfolio") {
  const cleanBase = slugify(baseText) || "portfolio";
  let candidate = cleanBase;
  let exists = await Portfolio.exists({ slug: candidate });

  if (!exists) return candidate;

  // Append short random hex if collision
  for (let i = 0; i < 5; i++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    candidate = `${cleanBase}-${suffix}`;
    exists = await Portfolio.exists({ slug: candidate });
    if (!exists) return candidate;
  }

  return `${cleanBase}-${Date.now().toString(36)}`;
}

/** Create a new draft portfolio */
export async function createPortfolio(userId, input) {
  let slug = input.slug?.trim().toLowerCase();

  if (slug) {
    const existing = await Portfolio.exists({ slug });
    if (existing) {
      throw ApiError.conflict(`Slug '${slug}' is already in use`);
    }
  } else {
    const baseText = input.title || input.profile?.fullName || "portfolio";
    slug = await generateUniqueSlug(baseText);
  }

  // If a source resume was referenced, verify it belongs to this user
  if (input.resumeId) {
    const resume = await Resume.findOne({ _id: input.resumeId, user: userId });
    if (!resume) {
      throw ApiError.notFound("Referenced source resume not found");
    }
  }

  try {
    const portfolio = await Portfolio.create({
      userId,
      title: input.title,
      slug,
      status: "draft",
      resumeId: input.resumeId || null,
      profile: input.profile || {},
      socialLinks: input.socialLinks || [],
      skills: input.skills || [],
      experience: input.experience || [],
      education: input.education || [],
      projects: input.projects || [],
      certifications: input.certifications || [],
      design: input.design || {},
      publication: {
        isPublic: false,
        publishedAt: null,
        ...(input.publication || {}),
      },
    });

    return portfolio;
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict(`Slug '${slug}' is already in use`);
    }
    throw err;
  }
}

/** List user portfolios with pagination and optional status filter */
export async function listPortfolios(userId, { page = 1, limit = 20, status } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const query = { userId };
  if (status) query.status = status;

  const [portfolios, total] = await Promise.all([
    Portfolio.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select("-__v")
      .lean(),
    Portfolio.countDocuments(query),
  ]);

  return {
    portfolios,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

/** Fetch a single portfolio owned by the user */
export async function getPortfolioById(userId, portfolioId) {
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId })
    .select("-__v")
    .lean();

  if (!portfolio) {
    throw ApiError.notFound("Portfolio not found");
  }

  return portfolio;
}

/** Update permitted portfolio fields with mass-assignment protection */
export async function updatePortfolio(userId, portfolioId, updateData) {
  const existing = await Portfolio.findOne({ _id: portfolioId, userId });
  if (!existing) {
    throw ApiError.notFound("Portfolio not found");
  }

  // If slug is changing, verify it is available
  if (updateData.slug && updateData.slug !== existing.slug) {
    const slugInUse = await Portfolio.exists({
      slug: updateData.slug,
      _id: { $ne: portfolioId },
    });
    if (slugInUse) {
      throw ApiError.conflict(`Slug '${updateData.slug}' is already in use`);
    }
  }

  // Construct explicit $set object with dotted paths to prevent erasing sibling objects
  const set = {};

  if (updateData.title !== undefined) set.title = updateData.title;
  if (updateData.slug !== undefined) set.slug = updateData.slug;
  if (updateData.status !== undefined) set.status = updateData.status;
  if (updateData.socialLinks !== undefined) set.socialLinks = updateData.socialLinks;
  if (updateData.skills !== undefined) set.skills = updateData.skills;
  if (updateData.experience !== undefined) set.experience = updateData.experience;
  if (updateData.education !== undefined) set.education = updateData.education;
  if (updateData.projects !== undefined) set.projects = updateData.projects;
  if (updateData.certifications !== undefined) set.certifications = updateData.certifications;

  if (updateData.profile) {
    for (const [k, v] of Object.entries(updateData.profile)) {
      set[`profile.${k}`] = v;
    }
  }

  if (updateData.design) {
    for (const [k, v] of Object.entries(updateData.design)) {
      set[`design.${k}`] = v;
    }
  }

  if (updateData.publication) {
    for (const [k, v] of Object.entries(updateData.publication)) {
      set[`publication.${k}`] = v;
    }
  }

  try {
    const updated = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId },
      { $set: set },
      { returnDocument: "after", runValidators: true },
    )
      .select("-__v")
      .lean();

    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict("Slug is already in use by another portfolio");
    }
    throw err;
  }
}

/** Publish a portfolio (state transition to published & isPublic) */
export async function publishPortfolio(userId, portfolioId, publicationSettings = {}) {
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
  if (!portfolio) {
    throw ApiError.notFound("Portfolio not found");
  }

  const set = {
    status: "published",
    "publication.isPublic": true,
    "publication.publishedAt": new Date(),
  };

  if (publicationSettings.slug && publicationSettings.slug !== portfolio.slug) {
    const cleanSlug = slugify(publicationSettings.slug);
    if (!cleanSlug) {
      throw ApiError.badRequest("Invalid slug provided");
    }
    const slugInUse = await Portfolio.exists({
      slug: cleanSlug,
      _id: { $ne: portfolioId },
    });
    if (slugInUse) {
      throw ApiError.conflict(`Slug '${cleanSlug}' is already in use`);
    }
    set.slug = cleanSlug;
  }

  if (publicationSettings.customDomain !== undefined) {
    set["publication.customDomain"] = publicationSettings.customDomain;
  }
  if (publicationSettings.seoTitle !== undefined) {
    set["publication.seoTitle"] = publicationSettings.seoTitle;
  }
  if (publicationSettings.seoDescription !== undefined) {
    set["publication.seoDescription"] = publicationSettings.seoDescription;
  }

  try {
    const updated = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId },
      { $set: set },
      { returnDocument: "after", runValidators: true },
    )
      .select("-__v")
      .lean();

    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict("Slug is already in use by another portfolio");
    }
    throw err;
  }
}

/** Unpublish a portfolio (revert to draft) */
export async function unpublishPortfolio(userId, portfolioId) {
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
  if (!portfolio) {
    throw ApiError.notFound("Portfolio not found");
  }

  const updated = await Portfolio.findOneAndUpdate(
    { _id: portfolioId, userId },
    {
      $set: {
        status: "draft",
        "publication.isPublic": false,
      },
    },
    { returnDocument: "after", runValidators: true },
  )
    .select("-__v")
    .lean();

  return updated;
}

/** Delete a portfolio */
export async function deletePortfolio(userId, portfolioId) {
  const result = await Portfolio.findOneAndDelete({ _id: portfolioId, userId });
  if (!result) {
    throw ApiError.notFound("Portfolio not found");
  }

  return { deleted: true, id: portfolioId };
}

/** Publicly fetch a published portfolio by its slug */
export async function getPublicPortfolio(rawSlug) {
  const slug = rawSlug?.trim().toLowerCase();
  if (!slug) {
    throw ApiError.badRequest("Invalid portfolio slug");
  }

  const portfolio = await Portfolio.findOne({
    slug,
    status: "published",
    "publication.isPublic": true,
  })
    // Explicitly exclude all internal/sensitive fields (PII, source references, user IDs)
    .select(
      "title slug profile socialLinks skills experience education projects certifications design publication updatedAt -_id",
    )
    .lean();

  if (!portfolio) {
    throw ApiError.notFound("Portfolio not found or not published");
  }

  // Safety defense: strictly delete any potential internal or sensitive metadata
  delete portfolio._id;
  delete portfolio.userId;
  delete portfolio.user;
  delete portfolio.resumeId;
  delete portfolio.__v;

  return portfolio;
}

/** Extract text safely from uploaded document buffer with bounded limits */
export async function extractResumeDocumentText(buffer, mimeType) {
  if (!buffer || buffer.length === 0) {
    throw ApiError.badRequest("Uploaded file is empty");
  }

  let text = "";
  try {
    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      text = result?.text || "";
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result?.value || "";
    } else {
      throw ApiError.badRequest("Only PDF and DOCX files are supported");
    }
  } catch (err) {
    const msg = (err?.message || "").toLowerCase();
    if (msg.includes("password") || msg.includes("encrypted")) {
      throw ApiError.badRequest(
        "The PDF document is encrypted or password-protected. Please upload an unencrypted file.",
      );
    }
    if (err instanceof ApiError) throw err;
    throw ApiError.badRequest(
      "Could not parse this file — it may be corrupted, malformed, or unreadable.",
    );
  }

  const cleaned = cleanText(text);
  const alphaNumericChars = cleaned.replace(/[^a-zA-Z0-9]/g, "");
  if (alphaNumericChars.length < 30) {
    throw ApiError.badRequest(
      "Could not extract readable text from this document. Please ensure it is not scanned, empty, or an image-only file.",
    );
  }

  return cleaned.slice(0, 50000);
}

/** Convert structured parsedData into coherent plain text for AI extraction */
export function resumeToText(parsedData = {}) {
  const parts = [];

  if (parsedData.name) parts.push(parsedData.name);
  if (parsedData.title) parts.push(parsedData.title);

  const contact = parsedData.contact || {};
  const contactParts = [
    contact.email && `Email: ${contact.email}`,
    contact.phone && `Phone: ${contact.phone}`,
    contact.location && `Location: ${contact.location}`,
    contact.linkedin && `LinkedIn: ${contact.linkedin}`,
    contact.github && `GitHub: ${contact.github}`,
    contact.website && `Website: ${contact.website}`,
  ].filter(Boolean);
  if (contactParts.length) parts.push(`CONTACT:\n${contactParts.join("\n")}`);

  if (parsedData.summary) parts.push(`SUMMARY:\n${parsedData.summary}`);

  if (Array.isArray(parsedData.skills) && parsedData.skills.length) {
    const skillList = parsedData.skills
      .map((s) => (typeof s === "string" ? s : s.name))
      .filter(Boolean)
      .join(", ");
    parts.push(`SKILLS:\n${skillList}`);
  }

  if (Array.isArray(parsedData.experience) && parsedData.experience.length) {
    const expText = parsedData.experience
      .map((e) => {
        const header = `${e.title || "Role"} at ${e.company || "Company"} (${e.startDate || ""} - ${e.endDate || "Present"})`;
        const body = e.description || e.achievements || "";
        return `${header}\n${body}`;
      })
      .join("\n\n");
    parts.push(`EXPERIENCE:\n${expText}`);
  }

  if (Array.isArray(parsedData.projects) && parsedData.projects.length) {
    const projText = parsedData.projects
      .map((p) => {
        const header = `${p.name || p.title || "Project"} ${p.link || p.liveDemo ? `(${p.link || p.liveDemo})` : ""}`;
        const desc = p.description || "";
        const tech = p.technologies ? `Technologies: ${p.technologies}` : "";
        return `${header}\n${desc}\n${tech}`.trim();
      })
      .join("\n\n");
    parts.push(`PROJECTS:\n${projText}`);
  }

  if (Array.isArray(parsedData.education) && parsedData.education.length) {
    const eduText = parsedData.education
      .map((ed) => `${ed.degree || "Degree"} from ${ed.institution || "Institution"} (${ed.startDate || ""} - ${ed.endDate || ""})`)
      .join("\n");
    parts.push(`EDUCATION:\n${eduText}`);
  }

  if (Array.isArray(parsedData.certifications) && parsedData.certifications.length) {
    const certText = parsedData.certifications
      .map((c) => (typeof c === "string" ? c : c.name || ""))
      .filter(Boolean)
      .join("\n");
    parts.push(`CERTIFICATIONS:\n${certText}`);
  }

  return parts.join("\n\n");
}

/** Fallback transformer from parsed resume data to portfolio draft */
function transformParsedResumeToPortfolio(parsed = {}) {
  const fullName = (parsed.name || "").replace(/^(?:name|target title):\s*/i, "").trim();
  const skills = Array.isArray(parsed.skills)
    ? parsed.skills.map((s) => ({
        name: typeof s === "string" ? s : s.name || "",
        category: "General",
        level: "intermediate",
      }))
    : [];

  const experience = (parsed.experience || []).map((e) => ({
    title: e.title || "",
    company: e.company || "",
    location: e.location || "",
    startDate: e.startDate || "",
    endDate: e.endDate || "",
    current: !e.endDate || e.endDate.toLowerCase().includes("present"),
    description: e.description || e.achievements || "",
    highlights: e.technologies ? [e.technologies] : [],
  }));

  const education = (parsed.education || []).map((ed) => ({
    institution: ed.institution || "",
    degree: ed.degree || "",
    fieldOfStudy: "",
    startDate: ed.startDate || "",
    endDate: ed.endDate || "",
    grade: "",
  }));

  const projects = (parsed.projects || []).map((p) => ({
    title: p.name || p.title || "Project",
    description: p.description || "",
    tags: p.technologies
      ? p.technologies.split(/[,•|]+/).map((t) => t.trim()).filter(Boolean)
      : [],
    liveUrl: p.liveDemo || p.link || "",
    repoUrl: p.link?.includes("github") ? p.link : "",
    featured: false,
  }));

  const socialLinks = [];
  if (parsed.contact?.github) {
    socialLinks.push({ platform: "github", label: "GitHub", url: parsed.contact.github });
  }
  if (parsed.contact?.linkedin) {
    socialLinks.push({ platform: "linkedin", label: "LinkedIn", url: parsed.contact.linkedin });
  }
  if (parsed.contact?.website) {
    socialLinks.push({ platform: "website", label: "Website", url: parsed.contact.website });
  }

  return {
    title: fullName ? `${fullName}'s Portfolio` : "My Portfolio",
    profile: {
      fullName,
      headline: parsed.title || "Software Professional",
      bio: parsed.summary || "",
      email: parsed.contact?.email || "",
      phone: parsed.contact?.phone || "",
      location: parsed.contact?.location || "",
      avatarUrl: "",
    },
    socialLinks,
    skills,
    experience,
    education,
    projects,
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map((c) => ({
          name: typeof c === "string" ? c : c.name || "",
          issuer: "",
        }))
      : [],
    design: {
      template: "modern",
      theme: "system",
      primaryColor: "#2563eb",
    },
  };
}

/** Helper to sanitize and normalize AI/heuristic payload before schema validation */
function sanitizePortfolioPayload(payload = {}) {
  const safe = { ...payload };

  if (safe.profile && typeof safe.profile === "object") {
    safe.profile = { ...safe.profile };
    if (safe.profile.email && typeof safe.profile.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safe.profile.email.trim())) {
        safe.profile.email = "";
      }
    }
  } else {
    safe.profile = {};
  }

  // Normalize skills into objects: { name, category, level }
  if (Array.isArray(safe.skills)) {
    safe.skills = safe.skills
      .map((s) => {
        if (typeof s === "string") return { name: s.trim(), category: "General", level: "intermediate" };
        if (s && typeof s === "object" && s.name) {
          return {
            name: String(s.name).trim(),
            category: s.category || "General",
            level: ["beginner", "intermediate", "advanced", "expert"].includes(s.level) ? s.level : "intermediate",
          };
        }
        return null;
      })
      .filter((s) => s && s.name.length > 0);
  } else {
    safe.skills = [];
  }

  // Normalize socialLinks
  if (Array.isArray(safe.socialLinks)) {
    safe.socialLinks = safe.socialLinks
      .filter((l) => l && typeof l === "object" && (l.url || l.platform))
      .map((l) => ({
        platform: String(l.platform || "").trim(),
        label: String(l.label || l.platform || "Link").trim(),
        url: String(l.url || "").trim(),
      }));
  } else {
    safe.socialLinks = [];
  }

  // Normalize experience
  if (Array.isArray(safe.experience)) {
    safe.experience = safe.experience
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        title: String(e.title || "").trim(),
        company: String(e.company || "").trim(),
        location: String(e.location || "").trim(),
        startDate: String(e.startDate || "").trim(),
        endDate: String(e.endDate || "").trim(),
        current: Boolean(e.current),
        description: String(e.description || "").trim(),
        highlights: Array.isArray(e.highlights)
          ? e.highlights.map((h) => String(h || "").trim()).filter(Boolean)
          : [],
      }));
  } else {
    safe.experience = [];
  }

  // Normalize education
  if (Array.isArray(safe.education)) {
    safe.education = safe.education
      .filter((ed) => ed && typeof ed === "object")
      .map((ed) => ({
        institution: String(ed.institution || "").trim(),
        degree: String(ed.degree || "").trim(),
        fieldOfStudy: String(ed.fieldOfStudy || "").trim(),
        startDate: String(ed.startDate || "").trim(),
        endDate: String(ed.endDate || "").trim(),
        grade: String(ed.grade || "").trim(),
      }));
  } else {
    safe.education = [];
  }

  // Normalize projects
  if (Array.isArray(safe.projects)) {
    safe.projects = safe.projects
      .filter((p) => p && typeof p === "object")
      .map((p) => ({
        title: String(p.title || "Project").trim(),
        description: String(p.description || "").trim(),
        tags: Array.isArray(p.tags) ? p.tags.map((t) => String(t || "").trim()).filter(Boolean) : [],
        liveUrl: String(p.liveUrl || "").trim(),
        repoUrl: String(p.repoUrl || "").trim(),
        imageUrl: String(p.imageUrl || "").trim(),
        featured: Boolean(p.featured),
      }));
  } else {
    safe.projects = [];
  }

  // Normalize certifications
  if (Array.isArray(safe.certifications)) {
    safe.certifications = safe.certifications
      .map((c) => {
        if (typeof c === "string") return { name: c.trim(), issuer: "", issueDate: "", url: "" };
        if (c && typeof c === "object") {
          return {
            name: String(c.name || "").trim(),
            issuer: String(c.issuer || "").trim(),
            issueDate: String(c.issueDate || "").trim(),
            url: String(c.url || "").trim(),
          };
        }
        return null;
      })
      .filter((c) => c && c.name.length > 0);
  } else {
    safe.certifications = [];
  }

  // Normalize design
  const validTemplates = ["modern", "minimal", "developer", "executive", "creative"];
  const validThemes = ["light", "dark", "system"];
  safe.design = {
    template: validTemplates.includes(safe.design?.template) ? safe.design.template : "modern",
    theme: validThemes.includes(safe.design?.theme) ? safe.design.theme : "system",
    primaryColor: safe.design?.primaryColor || "#2563eb",
    fontFamily: safe.design?.fontFamily || "Inter",
    customCss: safe.design?.customCss || "",
  };

  return safe;
}

/** Generate a validated, editable portfolio draft from extracted resume text */
export async function generatePortfolioFromResumeText(
  userId,
  resumeText,
  { preferredTemplate, customTitle, resumeId } = {},
) {
  if (!resumeText || resumeText.length < 20) {
    throw ApiError.badRequest("Insufficient text to generate portfolio");
  }

  let extracted;
  try {
    extracted = await geminiService.extractPortfolioFromResume({ resumeText });
  } catch (aiErr) {
    console.warn(
      "[portfolio] Gemini extraction issue, using heuristic parser fallback:",
      aiErr.message,
    );
    const parsed = normalizeResumeText(resumeText);
    extracted = transformParsedResumeToPortfolio(parsed);
  }

  if (!extracted || typeof extracted !== "object") {
    const parsed = normalizeResumeText(resumeText);
    extracted = transformParsedResumeToPortfolio(parsed);
  }

  // Enforce preferred template or title overrides
  if (preferredTemplate) {
    extracted.design = extracted.design || {};
    extracted.design.template = preferredTemplate;
  }
  if (customTitle?.trim()) {
    extracted.title = customTitle.trim();
  } else if (!extracted.title?.trim()) {
    extracted.title = extracted.profile?.fullName
      ? `${extracted.profile.fullName}'s Portfolio`
      : "My Portfolio";
  }

  // Ensure resumeId association
  if (resumeId) {
    extracted.resumeId = resumeId;
  }

  // Validate AI output through Zod portfolio creation schema with recovery fallback
  let cleanInput;
  const sanitized = sanitizePortfolioPayload(extracted);
  const parsedValidation = createPortfolioSchema.safeParse(sanitized);

  if (parsedValidation.success) {
    cleanInput = parsedValidation.data;
  } else {
    console.warn(
      "[portfolio] AI extraction did not strictly match schema, falling back to parsed resume transformer:",
      parsedValidation.error.issues,
    );
    const parsed = normalizeResumeText(resumeText);
    const fallbackExtracted = transformParsedResumeToPortfolio(parsed);
    if (preferredTemplate) {
      fallbackExtracted.design.template = preferredTemplate;
    }
    if (customTitle?.trim()) {
      fallbackExtracted.title = customTitle.trim();
    }
    if (resumeId) {
      fallbackExtracted.resumeId = resumeId;
    }
    const fallbackSanitized = sanitizePortfolioPayload(fallbackExtracted);
    const fallbackValidation = createPortfolioSchema.safeParse(fallbackSanitized);
    cleanInput = fallbackValidation.success ? fallbackValidation.data : fallbackSanitized;
  }

  return createPortfolio(userId, cleanInput);
}

/** Generate portfolio from an existing saved resume in the user's account */
export async function generatePortfolioFromExistingResume(
  userId,
  resumeId,
  { preferredTemplate, customTitle } = {},
) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();
  if (!resume) {
    throw ApiError.notFound("Resume not found");
  }

  const resumeText = resumeToText(resume.parsedData);
  if (!resumeText || resumeText.length < 20) {
    throw ApiError.badRequest("Selected resume contains insufficient data to generate a portfolio");
  }

  return generatePortfolioFromResumeText(userId, resumeText, {
    preferredTemplate,
    customTitle,
    resumeId: resume._id,
  });
}
