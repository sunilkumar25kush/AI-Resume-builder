import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  createReadme,
  deleteReadmeById,
  generateReadmeAi,
  getReadmeById,
  getUserReadmes,
  importReadme,
  updateReadmeById,
  duplicateReadme,
  assistReadmeAi,
  fetchGithubProfile,
  getGithubOAuthUrl,
  exchangeGithubOAuth,
  checkProfileRepo,
  publishProfileReadme,
  exportReadmeZip,
} from "../controllers/githubReadme.controller.js";
import {
  createGithubReadmeSchema,
  generateReadmeAiSchema,
  importReadmeSchema,
  updateGithubReadmeSchema,
} from "../validations/githubReadme.validation.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Collection endpoints
router.get("/", getUserReadmes);
router.post("/", validate({ body: createGithubReadmeSchema }), createReadme);

// AI & Import endpoints
router.post(
  "/generate/ai",
  aiLimiter,
  validate({ body: generateReadmeAiSchema }),
  generateReadmeAi,
);
router.post(
  "/import",
  validate({ body: importReadmeSchema }),
  importReadme,
);

router.post("/:id/duplicate", duplicateReadme);
router.post("/:id/assist", aiLimiter, assistReadmeAi);

// GitHub API Integration endpoints
router.get("/github/profile/:username", fetchGithubProfile);
router.get("/github/oauth-url", getGithubOAuthUrl);
router.post("/github/exchange-oauth", exchangeGithubOAuth);
router.post("/github/check-repo/:username", checkProfileRepo);
router.post("/github/publish", publishProfileReadme);

// ZIP Export endpoints
router.post("/export-zip", exportReadmeZip);
router.post("/:id/export-zip", exportReadmeZip);

// Specific document endpoints
router.get("/:id", getReadmeById);
router.patch("/:id", validate({ body: updateGithubReadmeSchema }), updateReadmeById);
router.delete("/:id", deleteReadmeById);

export default router;
