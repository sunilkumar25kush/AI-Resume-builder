import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME, COOKIE_OPTIONS, clearAuthCookie } from "../utils/token.js";

const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

export const registerUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.validatedBody);
  if (token) setAuthCookie(res, token);
  res.status(201).json(ApiResponse.created({ user }, "Account created successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.validatedBody);
  setAuthCookie(res, token);
  res.json(ApiResponse.ok({ user }, "Logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json(ApiResponse.ok(null, "Logged out successfully"));
});

export const getCurrentUserSession = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.json(ApiResponse.ok({ user: null }, "Not authenticated"));
  }
  const user = await authService.getMe(req.user._id);
  res.json(ApiResponse.ok({ user }, "Profile fetched"));
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.validatedBody);
  res.json(
    ApiResponse.ok(
      null,
      "If an account exists for this email, a reset link has been sent",
    ),
  );
});

export const resetPasswordWithToken = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validatedBody);
  res.json(ApiResponse.ok(null, "Password reset successfully"));
});

export const authenticateWithGoogle = asyncHandler(async (req, res) => {
  const { user, token } = await authService.googleAuth(req.validatedBody);
  setAuthCookie(res, token);
  res.json(ApiResponse.ok({ user }, "Logged in with Google"));
});

// Backward-compatible aliases
export const register = registerUser;
export const login = loginUser;
export const logout = logoutUser;
export const getMe = getCurrentUserSession;
export const forgotPassword = requestPasswordReset;
export const resetPassword = resetPasswordWithToken;
export const googleAuth = authenticateWithGoogle;

