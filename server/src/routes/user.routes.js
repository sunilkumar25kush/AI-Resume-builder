import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { optionalProtect, protect } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validations/user.js";

const router = Router();

router.get("/me", optionalProtect, userController.getCurrentUserProfile);
router.patch("/me", protect, validate({ body: updateProfileSchema }), userController.updateCurrentUserProfile);
router.patch("/me/avatar", protect, uploadAvatar.single("avatar"), userController.updateCurrentUserAvatar);

export default router;

