import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validations/user.js";

const router = Router();

router.patch("/me", protect, validate({ body: updateProfileSchema }), userController.updateMe);
router.patch("/me/avatar", protect, uploadAvatar.single("avatar"), userController.uploadAvatar);

export default router;
