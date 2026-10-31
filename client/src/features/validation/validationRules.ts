/**
 * Friendly contextual tips for common form validation issues across
 * resume creation, personal details, experience, and contact forms.
 */
export const DEFAULT_FIELD_TIPS: Record<string, string> = {
  email: "Could you check your email, maybe name@agency.com?",
  fullName: "Please enter your full name as you'd like it to appear on your resume header.",
  phone: "Please enter a valid phone number with country/area code.",
  summary: "A crisp 2-3 sentence summary highlighting your top strengths works best.",
  jobTitle: "Enter your target job title (e.g. Senior Frontend Engineer).",
  company: "Please enter the employer or company name.",
  startDate: "Please select when you started this role.",
  skillsText: "Add 4-8 core technical skills separated by commas for optimal ATS ranking.",
  degree: "Please enter your degree title (e.g. B.S. in Computer Science).",
  school: "Please enter your university or college name.",
};

