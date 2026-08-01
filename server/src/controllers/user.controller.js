import { userService } from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.validatedBody);
  res.json(ApiResponse.ok({ user }, "Profile updated"));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  res.json(ApiResponse.ok({ user }, "Avatar updated"));
});
