import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import * as authValidations from "../validations/auth.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: authValidations.registerSchema }),
  authController.register,
);
router.post("/login", authLimiter, validate({ body: authValidations.loginSchema }), authController.login);
router.post("/logout", authController.logout);
router.post(
  "/google",
  authLimiter,
  validate({ body: authValidations.googleAuthSchema }),
  authController.googleAuth,
);
router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: authValidations.forgotPasswordSchema }),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate({ body: authValidations.resetPasswordSchema }),
  authController.resetPassword,
);
router.get("/me", protect, authController.getMe);

export default router;
