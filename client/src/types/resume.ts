export interface CustomLink {
  label: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  contactOrder?: string[];
  customLinks?: CustomLink[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string;
  technologies: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  link: string;
  technologies: string;
  liveDemo: string;
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface ParsedResumeData {
  name: string;
  title?: string;
  summary: string;
  contact: ContactInfo;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  languages: string[];
  awards: string[];
  customSections: CustomSection[];
  hiddenSections: string[];
  sectionOrder?: string[];
  photoUrl?: string;
}

export type ResumeTemplate =
  | "classic-rose-serif"
  | "navy-sidebar-timeline"
  | "classic-ats-executive"
  | "photo-header-split-timeline"
  | "dense-analyst-serif"
  | "right-sidebar-light"
  | "banner-header"
  | "compact-fresher-ats"
  | "creative-blocks"
  | "elegant-serif-gold"
  | "modern-two-column-pro"
  | "tech-engineer-clean"
  | "classic"
  | "modern"
  | "minimal"
  | "compact"
  | "executive"
  | "creative"
  | "startup"
  | "google"
  | "microsoft"
  | "harvard"
  | "elegant"
  | "modern-pro"
  | "tech-engineer"
  | string;

export type AiChangeType =
  | "add-skill"
  | "add-keyword"
  | "add-section"
  | "improve-description"
  | "add-technologies"
  | "add-project";

/** One addition the AI made (or recommends) to raise the ATS score. */
export interface AiChange {
  type: AiChangeType;
  section: string;
  field: string;
  value: string;
  reason: string;
}

export interface ResumeCustomization {
  // 1. Font Size (FlowCV Sliders)
  baseFontSize?: string; // e.g. "11.5pt"
  fullNameSize?: string; // e.g. "+12.5pt"
  titleSize?: string; // e.g. "+8pt"
  sectionHeadingsSize?: string; // e.g. "+4pt"
  entryHeaderSize?: string; // e.g. "+0.5pt"
  fontSize?: string; // fallback / alias
  fontSizeScale?: "compact" | "normal" | "large";

  // 2. Spacing (FlowCV Sliders)
  lineHeight?: string; // e.g. "1.25"
  spaceElements?: string; // "[--]" | "[-]" | "[0]" | "[+]" | "[++]"
  leftRightMargin?: string; // e.g. "22mm"
  topBottomMargin?: string; // e.g. "12mm"
  pageMargin?: "compact" | "normal" | "relaxed";
  sectionSpacing?: "compact" | "normal" | "relaxed";
  entrySpacing?: "compact" | "normal" | "relaxed";

  // 3. Entries (FlowCV Layout)
  entryStructure?: "full-width" | "columns";
  datePosition?: "right" | "left" | "split";
  subtitlePlacement?: "same-line" | "below";
  bulletStyle?: "dot" | "dash" | "circle" | "square" | "arrow" | "none";
  datePlacement?: "right" | "below";
  entryLayout?: "standard" | "compact";

  // 4. Headings (FlowCV Styles)
  headingStyle?: "line" | "box" | "double" | "split" | "left-bar" | "thick-line" | "colored-line" | "wave" | "none" | "uppercase" | "capitalize" | "normal";
  headingCapitalization?: "uppercase" | "capitalize" | "normal";
  headingIcons?: "none" | "outline" | "filled";
  headingSize?: string;
  headingWeight?: "normal" | "semibold" | "bold" | "extrabold";
  headingDivider?: "line" | "bar" | "none";
  headingAlign?: "left" | "center";

  // 5. Font (FlowCV Body & Name)
  bodyFont?: string; // "Inter" | "Roboto" | "Alegreya" | "Lora" | etc.
  nameFont?: string; // "same" | "Inter" | "Playfair Display" | etc.
  fontFamily?: string;

  // 6. Colors (FlowCV Color targets & checkboxes)
  accentColor?: string;
  colorTarget?: "page" | "header" | "border";
  textColor?: string;
  backgroundColor?: string;
  accentTargets?: {
    name?: boolean;
    jobTitle?: boolean;
    headings?: boolean;
    headingsLine?: boolean;
    dots?: boolean;
    dates?: boolean;
    entrySubtitle?: boolean;
  };

  // 7. Header (FlowCV Text align & arrangement)
  headerAlignment?: "left" | "center";
  headerArrangement?: "horizontal" | "columns";
  headerSeparator?: "icon" | "bullet" | "bar";
  headerLayout?: "left" | "center" | "split";
  headerNameSize?: string;
  headerNameWeight?: "bold" | "extrabold" | "normal";
  showPhoto?: boolean;
  photoShape?: "round" | "rounded" | "square";
  photoSize?: "small" | "medium" | "large";
  photoUrl?: string;
  jobTitle?: string;
}

export interface Resume {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  parsedData: ParsedResumeData;
  aiChanges: AiChange[];
  template: ResumeTemplate;
  customization?: ResumeCustomization;
  createdAt: string;
  updatedAt: string;
}

