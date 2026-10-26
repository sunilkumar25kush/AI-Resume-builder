import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RESUME_MIME, validateMemoryMagicBytes } from "../middlewares/upload.js";
import * as portfolioService from "../services/portfolio.service.js";
import * as portfolioExportService from "../services/portfolioExport.service.js";

/**
 * Creates a blank or initialized portfolio draft for the authenticated candidate.
 * @route POST /api/portfolios
 * @access Private
 */
export const createPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.createPortfolio(req.user.id, req.validatedBody);
  console.info(`[portfolio:lifecycle] created id=${portfolio._id || portfolio.id} template=${portfolio.templateId} user=${req.user.id}`);
  res.status(201).json({ success: true, data: { portfolio } });
});

/**
 * Retrieves a paginated list of candidate portfolios.
 * @route GET /api/portfolios
 * @access Private
 */
export const getUserPortfolios = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10) || 1;
  const limit = Number.parseInt(req.query.limit ?? "20", 10) || 20;
  const status = req.query.status;
  const result = await portfolioService.listPortfolios(req.user.id, { page, limit, status });
  res.json({ success: true, data: result });
});

/**
 * Retrieves a single portfolio document by ID, scoped to user ownership.
 * @route GET /api/portfolios/:id
 * @access Private
 */
export const getPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioById(req.user.id, req.params.id);
  res.json({ success: true, data: { portfolio } });
});

/**
 * Updates design and career content on an existing portfolio document.
 * @route PATCH /api/portfolios/:id
 * @access Private
 */
export const updatePortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.updatePortfolio(req.user.id, req.params.id, req.validatedBody);
  res.json({ success: true, data: { portfolio } });
});

/** Transition portfolio state to published */
export const publishPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.publishPortfolio(
    req.user.id,
    req.params.id,
    req.validatedBody || {},
  );
  console.info(`[portfolio:lifecycle] published id=${req.params.id} slug=${portfolio.slug} user=${req.user.id}`);
  res.json({ success: true, data: { portfolio } });
});

/** Revert portfolio state to draft */
export const unpublishPortfolioById = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.unpublishPortfolio(req.user.id, req.params.id);
  console.info(`[portfolio:lifecycle] unpublished id=${req.params.id} user=${req.user.id}`);
  res.json({ success: true, data: { portfolio } });
});

/** Delete a portfolio */
export const deletePortfolioById = asyncHandler(async (req, res) => {
  const result = await portfolioService.deletePortfolio(req.user.id, req.params.id);
  console.info(`[portfolio:lifecycle] deleted id=${req.params.id} user=${req.user.id}`);
  res.json({ success: true, data: result });
});

/** Public endpoint to fetch a published portfolio by slug */
export const getPublicPortfolioBySlug = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPublicPortfolio(req.params.slug);
  res.json({ success: true, data: { portfolio } });
});

/** Generate a portfolio draft directly from an uploaded PDF or DOCX file */
export const generatePortfolioFromUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No resume file uploaded");
  }

  // 1. Verify binary magic bytes in-memory (reject spoofed Content-Type)
  await validateMemoryMagicBytes(req.file, RESUME_MIME, "Only PDF or DOCX files are allowed");

  // 2. Extract raw text server-side
  const resumeText = await portfolioService.extractResumeDocumentText(
    req.file.buffer,
    req.file.mimetype,
  );

  // 3. Run Gemini extraction pipeline and persist draft
  const portfolio = await portfolioService.generatePortfolioFromResumeText(
    req.user.id,
    resumeText,
    {
      preferredTemplate: req.validatedBody?.template || req.body?.template,
      customTitle: req.validatedBody?.title || req.body?.title,
    },
  );

  res.status(201).json({ success: true, data: { portfolio } });
});

/** Generate a portfolio draft from an existing saved resume in the user's account */
export const generatePortfolioFromResume = asyncHandler(async (req, res) => {
  const { resumeId, template, title } = req.validatedBody;
  const portfolio = await portfolioService.generatePortfolioFromExistingResume(
    req.user.id,
    resumeId,
    {
      preferredTemplate: template,
      customTitle: title,
    },
  );

  res.status(201).json({ success: true, data: { portfolio } });
});

/** Export a portfolio as React Source ZIP or Static Website ZIP */
export const exportPortfolioById = asyncHandler(async (req, res) => {
  const format = req.query.format === "static" ? "static" : "source";
  let basePortfolio;

  if (req.params.id === "demo") {
    basePortfolio = {
      title: "Demo Developer Portfolio",
      slug: "demo-developer",
      profile: {
        fullName: "Demo Developer",
        headline: "Full Stack Engineer & Creative Developer",
        bio: "Explore demo developer's public projects and open-source work.",
        email: "demo@example.com",
      },
      skills: [{ name: "JavaScript" }, { name: "TypeScript" }, { name: "React" }],
      projects: [{ title: "Demo Project", description: "A high-performance web application.", tags: ["React"] }],
      design: { template: "spotlight", theme: "dark", primaryColor: "#e3141f" },
    };
  } else {
    const doc = await portfolioService.getPortfolioById(req.user.id, req.params.id);
    basePortfolio = doc?.toObject ? doc.toObject() : doc;
  }

  let portfolio = { ...basePortfolio };

  // If live preview modifications are provided in request body, merge them cleanly and deeply
  if (req.body && typeof req.body === "object") {
    const rawOverrides = req.body.portfolio || req.body;
    if (rawOverrides && typeof rawOverrides === "object" && Object.keys(rawOverrides).length > 0) {
      portfolio = {
        ...basePortfolio,
        ...rawOverrides,
        profile: {
          ...(basePortfolio.profile || {}),
          ...(rawOverrides.profile || {}),
        },
        design: {
          ...(basePortfolio.design || {}),
          ...(rawOverrides.design || {}),
          sectionOrder: rawOverrides.design?.sectionOrder || basePortfolio.design?.sectionOrder,
          sectionVisibility: {
            ...((basePortfolio.design && basePortfolio.design.sectionVisibility) || {}),
            ...((rawOverrides.design && rawOverrides.design.sectionVisibility) || {}),
          },
          layoutOptions: {
            ...((basePortfolio.design && basePortfolio.design.layoutOptions) || {}),
            ...((rawOverrides.design && rawOverrides.design.layoutOptions) || {}),
          },
          templateSettings: {
            ...((basePortfolio.design && basePortfolio.design.templateSettings) || {}),
            ...((rawOverrides.design && rawOverrides.design.templateSettings) || {}),
          },
          customLabels: {
            ...((basePortfolio.design && basePortfolio.design.customLabels) || {}),
            ...((rawOverrides.design && rawOverrides.design.customLabels) || {}),
          },
          customText: {
            ...((basePortfolio.design && basePortfolio.design.customText) || {}),
            ...((rawOverrides.design && rawOverrides.design.customText) || {}),
          },
        },
        publication: {
          ...(basePortfolio.publication || {}),
          ...(rawOverrides.publication || {}),
        },
      };

      // Explicit array overrides if supplied
      if (Array.isArray(rawOverrides.skills)) portfolio.skills = rawOverrides.skills;
      if (Array.isArray(rawOverrides.experience)) portfolio.experience = rawOverrides.experience;
      if (Array.isArray(rawOverrides.education)) portfolio.education = rawOverrides.education;
      if (Array.isArray(rawOverrides.projects)) portfolio.projects = rawOverrides.projects;
      if (Array.isArray(rawOverrides.certifications)) portfolio.certifications = rawOverrides.certifications;
      if (Array.isArray(rawOverrides.socialLinks)) portfolio.socialLinks = rawOverrides.socialLinks;
    }
  }

  if (format === "static") {
    await portfolioExportService.exportPortfolioAsStaticZip(portfolio, res);
  } else {
    await portfolioExportService.exportPortfolioAsSourceZip(portfolio, res);
  }
});

