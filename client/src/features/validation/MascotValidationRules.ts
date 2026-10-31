import type { MascotExpression, MascotHandGesture } from "@/config/mascotBehaviors";
import type { SpeechValidationTip } from "@/components/ResumeBuddy/MascotSpeechBubble";

export interface MascotValidationIssue {
  fieldId: string;
  fieldLabel: string;
  message: string;
  mood: MascotExpression;
  gesture: MascotHandGesture;
  tip?: SpeechValidationTip;
}

/**
 * Standardized Date Parser to handle YYYY-MM, YYYY, Month YYYY, and common formats.
 * Returns timestamp in ms, or null if cannot be determined.
 */
export function parseDateToTimestamp(dateStr: string): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // "Present", "Current", "Ongoing", "Now" -> treated as far future
  if (/^(present|current|ongoing|now|till date)$/i.test(trimmed)) {
    return 9999999999999;
  }

  // 4-digit year only: "2024"
  if (/^\d{4}$/.test(trimmed)) {
    return new Date(`${trimmed}-01-01`).getTime();
  }

  // ISO / YYYY-MM / YYYY-MM-DD
  if (/^\d{4}-\d{1,2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // General date parse (e.g. "May 2023", "05/2023", "October 2021")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  // Extract year if 4 digits exist
  const yearMatch = trimmed.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    return new Date(`${yearMatch[1]}-01-01`).getTime();
  }

  return null;
}

/**
 * Validates an email field value
 */
export function validateEmail(value: string, fieldId = "email"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null; // Empty fields handled by required check if applicable

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      fieldId,
      fieldLabel: "Email",
      message: "Could you check your email address? It looks like it's missing the '@' symbol or domain.",
      mood: "confused",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "Email",
        incorrect: "sunil123gmail.com",
        correct: "sunil123@gmail.com",
      },
    };
  }
  return null;
}

/**
 * Validates a person's full name
 */
export function validateFullName(value: string, fieldId = "name"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Check if it's all digits or symbols without alphabetical characters (e.g. "123456")
  const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed);
  const isPureNumbersOrSymbols = !hasLetters || /^[0-9\W_]+$/.test(trimmed);

  if (isPureNumbersOrSymbols || trimmed.length < 2) {
    return {
      fieldId,
      fieldLabel: "Full Name",
      message: "Please enter your real full name instead of numbers or symbols.",
      mood: "warning",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "Full Name",
        incorrect: "123456",
        correct: "Sunil Kumar",
      },
    };
  }
  return null;
}

/**
 * Validates LinkedIn profile URL or destination URL
 */
export function validateLinkedIn(value: string, fieldId = "linkedin"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If entered in a URL field (dest-url or linkedinUrl), or contains profile indicator
  const isUrlField = fieldId.toLowerCase().includes("url") || fieldId.toLowerCase().includes("dest");
  
  // If it's a plain word like "linkedinprofile" or missing URL scheme in URL field
  const looksLikeIncompleteUrl =
    isUrlField &&
    !/^https?:\/\//i.test(trimmed) &&
    !trimmed.includes("linkedin.com");

  const isInvalidString =
    trimmed.toLowerCase() === "linkedinprofile" ||
    trimmed.toLowerCase() === "linkedin" ||
    looksLikeIncompleteUrl;

  if (isInvalidString) {
    return {
      fieldId,
      fieldLabel: "LinkedIn",
      message: "LinkedIn profiles should include the complete link so recruiters can view your profile.",
      mood: "confused",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "LinkedIn",
        incorrect: "linkedinprofile",
        correct: "https://www.linkedin.com/in/username/",
      },
    };
  }
  return null;
}

/**
 * Validates GitHub profile URL or destination URL
 */
export function validateGitHub(value: string, fieldId = "github"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isUrlField = fieldId.toLowerCase().includes("url") || fieldId.toLowerCase().includes("dest");
  
  const isInvalidString =
    trimmed.toLowerCase() === "github" ||
    (isUrlField && !/^https?:\/\//i.test(trimmed) && !trimmed.includes("github.com"));

  if (isInvalidString) {
    return {
      fieldId,
      fieldLabel: "GitHub",
      message: "Please provide your full GitHub profile URL so recruiters can see your repositories.",
      mood: "confused",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "GitHub",
        incorrect: "github",
        correct: "https://github.com/username",
      },
    };
  }
  return null;
}

/**
 * Validates phone number
 */
export function validatePhone(value: string, fieldId = "phone"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Phone should not contain letters (e.g. "abc123456")
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (hasLetters || digitsOnly.length < 7) {
    return {
      fieldId,
      fieldLabel: "Phone",
      message: "Phone number should only contain digits, spaces, and '+' country code.",
      mood: "confused",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "Phone",
        incorrect: "abc123456",
        correct: "+91 98765 43210 (or a valid phone number)",
      },
    };
  }
  return null;
}

/**
 * Validates experience duration / years
 */
export function validateExperienceYears(value: string, fieldId = "experienceYears"): MascotValidationIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Detect negative numbers like "-5 years", "-2"
  if (trimmed.startsWith("-") || /-\d+/.test(trimmed)) {
    return {
      fieldId,
      fieldLabel: "Experience",
      message: "Experience cannot be negative. Please enter 0 or a positive number.",
      mood: "warning",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "Experience",
        incorrect: "-5 years",
        correct: "0 or a positive number (e.g. 5 years)",
      },
    };
  }
  return null;
}

/**
 * Validates chronological date ranges (End Date must not be earlier than Start Date)
 */
export function validateDateRange(
  startDateStr: string,
  endDateStr: string,
  endFieldId = "endDate",
  sectionLabel = "Role / Education"
): MascotValidationIssue | null {
  if (!startDateStr || !endDateStr) return null;

  const startTs = parseDateToTimestamp(startDateStr);
  const endTs = parseDateToTimestamp(endDateStr);

  if (startTs !== null && endTs !== null && endTs < startTs) {
    return {
      fieldId: endFieldId,
      fieldLabel: "Dates",
      message: `In ${sectionLabel}, your end date appears earlier than your start date.`,
      mood: "warning",
      gesture: "pointDown",
      tip: {
        fieldLabel: "Dates",
        incorrect: "End date earlier than start date",
        correct: "End date must be after start date",
      },
    };
  }
  return null;
}

/**
 * Validates Education institution name
 */
export function validateEducationInstitution(
  institutionValue: string,
  degreeValue?: string,
  datesValue?: string,
  fieldId = "education-institution"
): MascotValidationIssue | null {
  const trimmed = (institutionValue || "").trim();
  const hasOtherEducationInfo = Boolean((degreeValue && degreeValue.trim()) || (datesValue && datesValue.trim()));

  if (!trimmed && hasOtherEducationInfo) {
    return {
      fieldId,
      fieldLabel: "Education",
      message: "Please enter your school, college, or university name.",
      mood: "warning",
      gesture: "pointAtInput",
      tip: {
        fieldLabel: "Education",
        incorrect: "Missing institution name",
        correct: "Enter your school, college, or university name",
      },
    };
  }
  return null;
}

/**
 * Central Field Validator Router:
 * Inspects a field's ID, name, and current value to run the appropriate rule.
 */
export function evaluateFieldRule(
  element: HTMLInputElement | HTMLTextAreaElement,
  formContainer?: HTMLElement | null
): MascotValidationIssue | null {
  const id = (element.id || "").toLowerCase();
  const name = (element.name || "").toLowerCase();
  const type = (element.type || "").toLowerCase();
  const val = element.value || "";

  // 1. Email Check
  if (type === "email" || id.includes("email") || name.includes("email")) {
    return validateEmail(val, element.id || element.name || "email");
  }

  // 2. Full Name Check
  if (id === "name" || name === "name" || id.includes("fullname") || name.includes("fullname")) {
    return validateFullName(val, element.id || element.name || "name");
  }

  // 3. LinkedIn Check
  if (id.includes("linkedin") || name.includes("linkedin")) {
    return validateLinkedIn(val, element.id || element.name || "linkedin");
  }

  // 4. GitHub Check
  if (id.includes("github") || name.includes("github")) {
    return validateGitHub(val, element.id || element.name || "github");
  }

  // 5. Phone Check
  if (type === "tel" || id.includes("phone") || name.includes("phone")) {
    return validatePhone(val, element.id || element.name || "phone");
  }

  // 6. Experience Duration / Negative check
  if (id.includes("year") || name.includes("year") || id.includes("experienceyears")) {
    return validateExperienceYears(val, element.id || element.name || "experienceYears");
  }

  // 7. Date Range Check (End Date earlier than Start Date)
  if (id.includes("enddate") || name.includes("enddate")) {
    // Try finding sibling start date in the same container
    const parentContainer = element.closest("[data-rb-row], .grid, .editor-form-card, div") || formContainer;
    let startDateEl: HTMLInputElement | null = null;
    if (parentContainer) {
      startDateEl = parentContainer.querySelector('input[id*="startdate" i], input[name*="startdate" i]');
    }
    if (!startDateEl && element.id) {
      // E.g. "experience-0-endDate" -> "experience-0-startDate"
      const counterpartId = element.id.replace(/enddate/i, "startDate");
      startDateEl = document.getElementById(counterpartId) as HTMLInputElement | null;
    }
    if (startDateEl && startDateEl.value) {
      return validateDateRange(startDateEl.value, val, element.id || element.name || "endDate");
    }
  }

  // Also check if start date was edited when end date already exists
  if (id.includes("startdate") || name.includes("startdate")) {
    const parentContainer = element.closest("[data-rb-row], .grid, .editor-form-card, div") || formContainer;
    let endDateEl: HTMLInputElement | null = null;
    if (parentContainer) {
      endDateEl = parentContainer.querySelector('input[id*="enddate" i], input[name*="enddate" i]');
    }
    if (!endDateEl && element.id) {
      const counterpartId = element.id.replace(/startdate/i, "endDate");
      endDateEl = document.getElementById(counterpartId) as HTMLInputElement | null;
    }
    if (endDateEl && endDateEl.value) {
      return validateDateRange(val, endDateEl.value, endDateEl.id || endDateEl.name || "endDate");
    }
  }

  // 8. Education Institution Check
  if (id.includes("institution") || name.includes("institution")) {
    const parentContainer = element.closest("[data-rb-row], .grid, .editor-form-card, div") || formContainer;
    let degreeEl: HTMLInputElement | null = null;
    if (parentContainer) {
      degreeEl = parentContainer.querySelector('input[id*="degree" i], input[name*="degree" i]');
    }
    return validateEducationInstitution(val, degreeEl?.value, undefined, element.id || element.name || "institution");
  }

  return null;
}
