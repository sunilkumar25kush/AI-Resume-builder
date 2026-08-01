import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.js";
import { ROLES } from "../constants/index.js";
import User from "../models/User.js";
import { notificationService } from "./notification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

const DUP_KEY_CODE = 11000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Deterministic hash for reset tokens so they can be queried (bcrypt is salted → not queryable). */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

async function issueAuthPayload(user) {
  const token = signToken({ sub: user._id.toString(), role: user.role });
  return { user: user.toSafeJSON(), token };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({ name, email, passwordHash: await hashPassword(password) });

  // Welcome notification — gives the bell something real on first login.
  await notificationService.createNotification({
    userId: user._id,
    type: "info",
    title: "Welcome to AI Resume Builder! 👋",
    body: "Upload your first resume or paste a job description to get AI-powered suggestions.",
    link: "/",
  });

  return issueAuthPayload(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  return issueAuthPayload(user);
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized("Account no longer exists");
  return user.toSafeJSON();
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ email });
  // Never reveal whether an email exists — same response either way.
  if (!user) return { resetToken: null };

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  // No email provider configured yet — dev mode returns the token so the
  // flow is testable; production would send it by email.
  if (env.NODE_ENV === "development") return { resetToken: rawToken };
  return { resetToken: null };
}

async function resetPassword({ token, password }) {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw ApiError.badRequest("Reset token is invalid or has expired");

  user.passwordHash = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}

async function googleAuth({ credential }) {
  if (!googleClient) throw ApiError.badRequest("Google login is not configured");

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    try {
      user = await User.create({
        name: name ?? email.split("@")[0],
        email,
        googleId,
        avatar: picture ?? "",
        role: ROLES.USER,
      });
    } catch (err) {
      if (err.code === DUP_KEY_CODE) {
        // Race: another request created the account first.
        user = await User.findOne({ email });
      } else {
        throw err;
      }
    }
  }
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");
  return issueAuthPayload(user);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export const authService = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
};
