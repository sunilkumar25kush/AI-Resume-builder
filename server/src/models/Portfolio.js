import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "", trim: true, maxlength: 200 },
    headline: { type: String, default: "", trim: true, maxlength: 300 },
    bio: { type: String, default: "", trim: true, maxlength: 5000 },
    email: { type: String, default: "", trim: true, maxlength: 254 },
    phone: { type: String, default: "", trim: true, maxlength: 50 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    avatarUrl: { type: String, default: "", trim: true, maxlength: 2000000 },
  },
  { _id: false },
);

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, default: "", trim: true, maxlength: 50 },
    label: { type: String, default: "", trim: true, maxlength: 100 },
    url: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, default: "General", trim: true, maxlength: 100 },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true, maxlength: 200 },
    company: { type: String, default: "", trim: true, maxlength: 200 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    startDate: { type: String, default: "", trim: true, maxlength: 100 },
    endDate: { type: String, default: "", trim: true, maxlength: 100 },
    current: { type: Boolean, default: false },
    description: { type: String, default: "", trim: true, maxlength: 5000 },
    highlights: { type: [String], default: [] },
  },
  { _id: false },
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: "", trim: true, maxlength: 200 },
    degree: { type: String, default: "", trim: true, maxlength: 200 },
    fieldOfStudy: { type: String, default: "", trim: true, maxlength: 200 },
    startDate: { type: String, default: "", trim: true, maxlength: 100 },
    endDate: { type: String, default: "", trim: true, maxlength: 100 },
    grade: { type: String, default: "", trim: true, maxlength: 50 },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true, maxlength: 5000 },
    tags: { type: [String], default: [] },
    liveUrl: { type: String, default: "", trim: true, maxlength: 1000 },
    repoUrl: { type: String, default: "", trim: true, maxlength: 1000 },
    imageUrl: { type: String, default: "", trim: true, maxlength: 2000000 },
    featured: { type: Boolean, default: false },
  },
  { _id: false },
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true, maxlength: 200 },
    issuer: { type: String, default: "", trim: true, maxlength: 200 },
    issueDate: { type: String, default: "", trim: true, maxlength: 100 },
    url: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const designSettingsSchema = new mongoose.Schema(
  {
    template: {
      type: String,
      enum: [
        "spotlight",
        "poster",
        "devport",
        "creative",
        "developer",
        "minimal",
        "modern",
        "executive",
      ],
      default: "spotlight",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    primaryColor: { type: String, default: "#2563eb", trim: true, maxlength: 50 },
    fontFamily: { type: String, default: "Inter", trim: true, maxlength: 100 },
    customCss: { type: String, default: "", trim: true, maxlength: 10000 },
    backgroundEffect: { type: String, default: "default", trim: true, maxlength: 100 },
    sectionOrder: {
      type: [String],
      default: ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
    },
    sectionVisibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    layoutOptions: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    templateSettings: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { _id: false },
);

const publicationSchema = new mongoose.Schema(
  {
    isPublic: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    customDomain: { type: String, default: "", trim: true, lowercase: true, maxlength: 255 },
    seoTitle: { type: String, default: "", trim: true, maxlength: 200 },
    seoDescription: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { _id: false },
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Portfolio title is required"],
      trim: true,
      maxlength: [200, "Portfolio title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Portfolio slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      maxlength: [100, "Slug cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    certifications: {
      type: [certificationSchema],
      default: [],
    },
    design: {
      type: designSettingsSchema,
      default: () => ({}),
    },
    publication: {
      type: publicationSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Alias user -> userId for backward/consistent compatibility with existing codebase
portfolioSchema.virtual("user").get(function () {
  return this.userId;
});

// Compound indexes for user listing and fast public search
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ status: 1, slug: 1 });

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);
