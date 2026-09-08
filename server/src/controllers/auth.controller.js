import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME, COOKIE_OPTIONS, clearAuthCookie } from "../utils/token.js";

const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.validatedBody);
  setAuthCookie(res, token);
  res.status(201).json(ApiResponse.created({ user }, "Account created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.validatedBody);
  setAuthCookie(res, token);
  res.json(ApiResponse.ok({ user }, "Logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json(ApiResponse.ok(null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.json(ApiResponse.ok({ user: null }, "Not authenticated"));
  }
  const user = await authService.getMe(req.user._id);
  res.json(ApiResponse.ok({ user }, "Profile fetched"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = await authService.forgotPassword(req.validatedBody);
  res.json(
    ApiResponse.ok(
      { devResetToken: resetToken ?? undefined },
      "If an account exists for this email, a reset link has been sent",
    ),
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validatedBody);
  res.json(ApiResponse.ok(null, "Password reset successfully"));
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { user, token } = await authService.googleAuth(req.validatedBody);
  setAuthCookie(res, token);
  res.json(ApiResponse.ok({ user }, "Logged in with Google"));
});
