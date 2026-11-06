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
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (existing) {
    if (!existing.passwordHash) {
      // User registered via Google OAuth previously — set their password now so they can log in with password too
      existing.passwordHash = await hashPassword(password);
      if (!existing.name && name) existing.name = name;
      await existing.save();
      return issueAuthPayload(existing);
    }
    throw ApiError.conflict("An account with this email already exists. Please log in instead.");
  }

  let user;
  try {
    user = await User.create({ name, email: normalizedEmail, passwordHash: await hashPassword(password) });
  } catch (err) {
    if (err.code === DUP_KEY_CODE) {
      throw ApiError.conflict("An account with this email already exists. Please log in instead.");
    }
    throw err;
  }

  // Welcome notification — only sent for genuinely new accounts.
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
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  if (!user.passwordHash) {
    throw ApiError.badRequest("This account was created using Google Sign-In. Please sign in with Google or reset your password.");
  }

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

  // In development, log the token to the server console so the flow is
  // testable without an email provider. NEVER return it in the HTTP response
  // — a misconfigured NODE_ENV=development on staging would expose it to any caller.
  if (env.NODE_ENV === "development") {
    console.log(`[dev] password reset token for ${user.email}:`, rawToken);
  }
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
  if (!googleClient) throw ApiError.badRequest("Google login is not configured on this server");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("[auth] Google ID token verification failed:", err?.message);
    throw ApiError.unauthorized(`Google verification failed: ${err?.message || "Invalid credential"}`);
  }

  if (!payload || !payload.email) {
    throw ApiError.unauthorized("Google token did not contain a valid email address");
  }

  const { sub: googleId, email, name, picture } = payload;
  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });
  if (!user) {
    try {
      user = await User.create({
        name: name ?? normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        avatar: picture ?? "",
        role: ROLES.USER,
      });
    } catch (err) {
      if (err.code === DUP_KEY_CODE) {
        user = await User.findOne({ email: normalizedEmail });
      } else {
        throw err;
      }
    }
  } else {
    // If account was created with email/password, link googleId and avatar if not present
    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
      changed = true;
    }
    if (changed) {
      await user.save().catch(() => {});
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
