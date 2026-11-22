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

// Specific document endpoints
router.get("/:id", getReadmeById);
router.patch("/:id", validate({ body: updateGithubReadmeSchema }), updateReadmeById);
router.delete("/:id", deleteReadmeById);

export default router;
