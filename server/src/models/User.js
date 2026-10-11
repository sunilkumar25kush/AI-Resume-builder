import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    isActive: { type: Boolean, default: true },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    targetJobTitle: { type: String, default: "", trim: true, maxlength: 120 },
    linkedin: { type: String, default: "", trim: true, maxlength: 500 },
    github: { type: String, default: "", trim: true, maxlength: 500 },
    website: { type: String, default: "", trim: true, maxlength: 500 },
    linkedinUrl: { type: String, default: "", trim: true, maxlength: 500 },
    githubUrl: { type: String, default: "", trim: true, maxlength: 500 },
    websiteUrl: { type: String, default: "", trim: true, maxlength: 500 },
    contactOrder: { type: [String], default: [] },
    customLinks: {
      type: [
        {
          label: { type: String, default: "", trim: true, maxlength: 80 },
          url: { type: String, default: "", trim: true, maxlength: 500 },
        },
      ],
      default: [],
    },
    autoPopulateResume: { type: Boolean, default: true },
    passwordResetToken: { type: String, select: false, index: { sparse: true } },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    phone: this.phone || "",
    location: this.location || "",
    targetJobTitle: this.targetJobTitle || "",
    linkedin: this.linkedin || "",
    github: this.github || "",
    website: this.website || "",
    linkedinUrl: this.linkedinUrl || "",
    githubUrl: this.githubUrl || "",
    websiteUrl: this.websiteUrl || "",
    contactOrder: this.contactOrder || [],
    customLinks: this.customLinks || [],
    autoPopulateResume: this.autoPopulateResume ?? true,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
