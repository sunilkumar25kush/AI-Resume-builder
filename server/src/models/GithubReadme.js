import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true, maxlength: 200 },
    headline: { type: String, default: "", trim: true, maxlength: 300 },
    bio: { type: String, default: "", trim: true, maxlength: 5000 },
    githubUsername: { type: String, default: "", trim: true, maxlength: 100 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    portfolioUrl: { type: String, default: "", trim: true, maxlength: 500 },
    currentRole: { type: String, default: "", trim: true, maxlength: 200 },
    currentWork: { type: String, default: "", trim: true, maxlength: 500 },
    learning: { type: String, default: "", trim: true, maxlength: 500 },
    askMeAbout: { type: String, default: "", trim: true, maxlength: 500 },
    funFact: { type: String, default: "", trim: true, maxlength: 500 },
    email: { type: String, default: "", trim: true, maxlength: 254 },
  },
  { _id: false },
);

const statsConfigSchema = new mongoose.Schema(
  {
    showGithubStats: { type: Boolean, default: true },
    showStreakStats: { type: Boolean, default: true },
    showTopLangs: { type: Boolean, default: true },
    showTrophies: { type: Boolean, default: false },
    showActivityGraph: { type: Boolean, default: false },
    statsTheme: { type: String, default: "tokyonight", maxlength: 50 },
  },
  { _id: false },
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, default: "Languages & Tools", trim: true, maxlength: 100 },
    badgeColor: { type: String, default: "", trim: true, maxlength: 50 },
    icon: { type: String, default: "", trim: true, maxlength: 50 },
  },
  { _id: false },
);

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, default: "", trim: true, maxlength: 50 },
    username: { type: String, default: "", trim: true, maxlength: 100 },
    url: { type: String, default: "", trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    link: { type: String, default: "", trim: true, maxlength: 1000 },
    stars: { type: String, default: "", trim: true, maxlength: 50 },
    tech: { type: String, default: "", trim: true, maxlength: 200 },
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    headerStyle: {
      type: String,
      enum: ["wave", "typing", "capsule", "minimal", "ascii", "badges"],
      default: "wave",
    },
    layout: {
      type: String,
      enum: ["standard", "compact", "centered", "two-column"],
      default: "standard",
    },
    badgesStyle: {
      type: String,
      enum: ["flat", "flat-square", "for-the-badge", "plastic"],
      default: "for-the-badge",
    },
  },
  { _id: false },
);

const githubReadmeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "My GitHub Profile README",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    template: {
      type: String,
      enum: [
        "minimal",
        "developer",
        "cyberpunk",
        "creative",
        "academic",
        "modern",
        "developer-tech-stack",
        "modern-dashboard",
        "anime-gaming",
        "minimal-aesthetic",
        "professional",
        "fullstack",
        "frontend",
        "backend",
        "ai-ml",
        "open-source",
        "student",
        "cybersecurity",
        "custom",
      ],
      default: "developer-tech-stack",
    },
    sourceOption: {
      type: String,
      enum: ["template", "ai", "scratch", "import"],
      default: "template",
    },
    content: {
      type: String,
      default: "",
      maxlength: 500000,
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    statsConfig: {
      type: statsConfigSchema,
      default: () => ({}),
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

githubReadmeSchema.index({ userId: 1, createdAt: -1 });

export const GithubReadme = mongoose.model("GithubReadme", githubReadmeSchema);
export default GithubReadme;
