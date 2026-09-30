import { userService } from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  res.json(ApiResponse.ok({ user: req.user ?? null }));
});

export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.validatedBody);
  res.json(ApiResponse.ok({ user }, "Profile updated"));
});

export const updateCurrentUserAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user._id, req.file);
  res.json(ApiResponse.ok({ user }, "Avatar updated"));
});

// Backward-compatible aliases
export const updateMe = updateCurrentUserProfile;
export const uploadAvatar = updateCurrentUserAvatar;
export const getMe = getCurrentUserProfile;

