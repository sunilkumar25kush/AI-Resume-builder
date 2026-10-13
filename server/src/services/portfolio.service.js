import crypto from "node:crypto";
import { Portfolio } from "../models/Portfolio.js";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";

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

  if (publicationSettings.customDomain !== undefined) {
    set["publication.customDomain"] = publicationSettings.customDomain;
  }
  if (publicationSettings.seoTitle !== undefined) {
    set["publication.seoTitle"] = publicationSettings.seoTitle;
  }
  if (publicationSettings.seoDescription !== undefined) {
    set["publication.seoDescription"] = publicationSettings.seoDescription;
  }

  const updated = await Portfolio.findOneAndUpdate(
    { _id: portfolioId, userId },
    { $set: set },
    { returnDocument: "after", runValidators: true },
  )
    .select("-__v")
    .lean();

  return updated;
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

  return portfolio;
}
