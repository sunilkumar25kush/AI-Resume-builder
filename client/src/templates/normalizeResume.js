/**
 * Normalizes any resume input (whether legacy ParsedResumeData or the extended schema)
 * into the canonical schema required by all templates.
 * 
 * Rules:
 * - Header ALWAYS reads personal.fullName, fallback to "Your Name" (NEVER resume title).
 * - Empty sections/fields are normalized to clean arrays or empty strings.
 */
function cleanDisplayLabel(value, type) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (type === "linkedin") {
    if (/^https?:\/\//i.test(trimmed) || /^www\.linkedin\.com/i.test(trimmed) || /^linkedin\.com/i.test(trimmed)) {
      return (
        trimmed
          .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/i, "")
          .replace(/^https?:\/\/(www\.)?linkedin\.com\/?/i, "")
          .replace(/\/+$/, "") || "LinkedIn"
      );
    }
    return trimmed;
  }
  if (type === "github") {
    if (/^https?:\/\//i.test(trimmed) || /^www\.github\.com/i.test(trimmed) || /^github\.com/i.test(trimmed)) {
      return (
        trimmed
          .replace(/^https?:\/\/(www\.)?github\.com\/?/i, "")
          .replace(/\/+$/, "") || "GitHub"
      );
    }
    return trimmed;
  }
  if (type === "website" || type === "portfolio") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
    }
    return trimmed;
  }
  return trimmed;
}

function resolveDestUrl(url, val, type) {
  const u = (url || "").trim();
  if (u) {
    return u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
  }
  const v = (val || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (type === "linkedin") {
    if (v.includes("linkedin.com")) return `https://${v.replace(/^www\./, "")}`;
    return `https://linkedin.com/in/${v}`;
  }
  if (type === "github") {
    if (v.includes("github.com")) return `https://${v.replace(/^www\./, "")}`;
    return `https://github.com/${v}`;
  }
  if (type === "website" || type === "portfolio") {
    return `https://${v.replace(/^www\./, "")}`;
  }
  return "";
}

export function normalizeResume(raw) {
  if (!raw) {
    return getEmptyResume();
  }

  const hidden = new Set(Array.isArray(raw.hiddenSections) ? raw.hiddenSections : []);

  // 1. Personal Info
  const personalRaw = raw.personal || {};
  const contactRaw = raw.contact || {};

  // Extract fullName from personal.fullName or top-level name. Never use resume title.
  const rawName = (personalRaw.fullName || raw.name || "").trim();
  const isPlaceholder = !rawName || rawName.toLowerCase() === "your name";
  const fullName = isPlaceholder ? "Your Name" : rawName;
  const title = (personalRaw.title || raw.title || "").trim();
  const email = (personalRaw.email || contactRaw.email || "").trim();
  const phone = (personalRaw.phone || contactRaw.phone || "").trim();
  const location = (personalRaw.location || contactRaw.location || "").trim();

  // Links & Clean labels: Keep display clean (no raw full URLs on resume)
  const rawLinkedin = (personalRaw.linkedin || contactRaw.linkedin || "").trim();
  const linkedinUrl = resolveDestUrl(
    contactRaw.linkedinUrl || personalRaw.linkedinUrl,
    rawLinkedin,
    "linkedin"
  );
  const linkedin = cleanDisplayLabel(rawLinkedin, "linkedin");

  const rawGithub = (personalRaw.github || contactRaw.github || "").trim();
  const githubUrl = resolveDestUrl(
    contactRaw.githubUrl || personalRaw.githubUrl,
    rawGithub,
    "github"
  );
  const github = cleanDisplayLabel(rawGithub, "github");

  const rawWebsite = (personalRaw.website || contactRaw.website || "").trim();
  const websiteUrl = resolveDestUrl(
    contactRaw.websiteUrl || personalRaw.websiteUrl,
    rawWebsite,
    "website"
  );
  const website = cleanDisplayLabel(rawWebsite, "website");

  const portfolio = (personalRaw.portfolio || contactRaw.portfolio || "").trim();
  const photoUrl = (personalRaw.photoUrl || raw.photoUrl || "").trim();
  const dob = (personalRaw.dob || "").trim();
  const availability = (personalRaw.availability || "").trim();

  const defaultContactOrder = ["location", "linkedin", "github", "website", "phone", "email"];
  const rawContactOrder =
    contactRaw.contactOrder || personalRaw.contactOrder || raw.contactOrder;
  const contactOrder =
    Array.isArray(rawContactOrder) && rawContactOrder.length > 0
      ? [...new Set(rawContactOrder.filter(Boolean))]
      : defaultContactOrder;

  const customLinks = Array.isArray(personalRaw.customLinks)
    ? personalRaw.customLinks
    : Array.isArray(contactRaw.customLinks)
      ? contactRaw.customLinks
      : [];

  const personal = {
    fullName,
    isPlaceholder,
    title,
    email,
    phone,
    location,
    linkedin,
    linkedinUrl,
    github,
    githubUrl,
    website,
    websiteUrl,
    portfolio,
    customLinks,
    photoUrl,
    dob,
    availability,
    contactOrder,
  };

  // 2. Summary
  const summary = hidden.has("summary") ? "" : (raw.summary || "").trim();

  // 3. Experience
  let experience = [];
  if (!hidden.has("experience") && Array.isArray(raw.experience)) {
    experience = raw.experience.map((exp) => {
      let bullets = [];
      if (Array.isArray(exp.bullets)) {
        bullets = exp.bullets.filter(Boolean);
      } else if (typeof exp.description === "string") {
        // Legacy multi-line description or bullet string
        bullets = exp.description
          .split("\n")
          .map((b) => b.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
      }

      if (exp.achievements) {
        const ach = exp.achievements.split("\n").map((b) => b.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
        bullets.push(...ach);
      }

      return {
        role: exp.role || exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        bullets,
        technologies: exp.technologies || "",
      };
    }).filter((exp) => exp.role || exp.company || exp.bullets.length > 0);
  }

  // 4. Education
  let education = [];
  if (!hidden.has("education") && Array.isArray(raw.education)) {
    education = raw.education.map((edu) => {
      let details = [];
      if (Array.isArray(edu.details)) {
        details = edu.details.filter(Boolean);
      } else if (edu.description) {
        details = edu.description.split("\n").map((d) => d.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
      }

      return {
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        grade: edu.grade || "",
        details,
      };
    }).filter((edu) => edu.degree || edu.institution);
  }

  // 5. Projects
  let projects = [];
  if (!hidden.has("projects") && Array.isArray(raw.projects)) {
    projects = raw.projects.map((proj) => {
      let bullets = [];
      if (Array.isArray(proj.bullets)) {
        bullets = proj.bullets.filter(Boolean);
      } else if (proj.description) {
        bullets = proj.description.split("\n").map((b) => b.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
      }

      // Tech stack
      let techStack = [];
      if (Array.isArray(proj.techStack)) {
        techStack = proj.techStack.filter(Boolean);
      } else if (typeof proj.technologies === "string") {
        techStack = proj.technologies.split(/[,|•]/).map((t) => t.trim()).filter(Boolean);
      }

      // Links
      let links = [];
      if (Array.isArray(proj.links)) {
        links = proj.links.filter((l) => l && l.url).map((l) => ({
          label: l.label || (l.url.includes("github.com") ? "GitHub" : "Live Demo"),
          url: l.url.startsWith("http") ? l.url : `https://${l.url}`,
        }));
      }

      const rawLink = proj.link ? (proj.link.startsWith("http") ? proj.link : `https://${proj.link}`) : "";
      const rawLiveDemo = proj.liveDemo ? (proj.liveDemo.startsWith("http") ? proj.liveDemo : `https://${proj.liveDemo}`) : "";

      if (rawLink && !links.some((l) => l.url === rawLink)) {
        links.push({ label: "GitHub", url: rawLink });
      }
      if (rawLiveDemo && !links.some((l) => l.url === rawLiveDemo)) {
        links.push({ label: "Live Demo", url: rawLiveDemo });
      }

      return {
        name: proj.name || "",
        techStack,
        links,
        date: proj.date || "",
        bullets,
        link: rawLink,
        liveDemo: rawLiveDemo,
      };
    }).filter((proj) => proj.name);
  }

  // 6. Skills
  let skills = [];
  if (!hidden.has("skills") && raw.skills) {
    if (Array.isArray(raw.skills)) {
      if (raw.skills.length > 0 && typeof raw.skills[0] === "object" && raw.skills[0] !== null) {
        // Already categorized: [{ category, items }]
        skills = raw.skills
          .filter((s) => s && s.category && Array.isArray(s.items) && s.items.length > 0)
          .map((s) => ({
            category: s.category.trim(),
            items: s.items.map((i) => String(i).trim()).filter(Boolean),
          }));
      } else {
        // Flat array of strings: ["JavaScript", "React", "Node.js", ...]
        const items = raw.skills.map((s) => String(s).trim()).filter(Boolean);
        if (items.length > 0) {
          skills = [{ category: "Skills", items }];
        }
      }
    }
  }

  // 7. Coursework
  const coursework = (!hidden.has("coursework") && Array.isArray(raw.coursework))
    ? raw.coursework.map((c) => String(c).trim()).filter(Boolean)
    : [];

  // 8. Certifications
  let certifications = [];
  if (!hidden.has("certifications") && Array.isArray(raw.certifications)) {
    certifications = raw.certifications.map((cert) => {
      if (typeof cert === "string") {
        return { name: cert.trim(), issuer: "", date: "", url: "" };
      }
      return {
        name: cert.name || "",
        issuer: cert.issuer || "",
        date: cert.date || "",
        url: cert.url || "",
      };
    }).filter((cert) => cert.name);
  }

  // 9. Languages
  let languages = [];
  if (!hidden.has("languages") && Array.isArray(raw.languages)) {
    languages = raw.languages.map((lang) => {
      if (typeof lang === "string") {
        return { name: lang.trim(), level: "" };
      }
      return {
        name: lang.name || "",
        level: lang.level || "",
      };
    }).filter((lang) => lang.name);
  }

  // 10. References
  let references = [];
  if (!hidden.has("references") && Array.isArray(raw.references)) {
    references = raw.references.map((ref) => ({
      name: ref.name || "",
      position: ref.position || "",
      phone: ref.phone || "",
      email: ref.email || "",
    })).filter((ref) => ref.name);
  }

  // 11. Awards
  let awards = [];
  if (!hidden.has("awards") && Array.isArray(raw.awards)) {
    awards = raw.awards.map((a) => String(a).trim()).filter(Boolean);
  }

  // 12. Custom Sections
  let customSections = [];
  if (!hidden.has("customSections") && Array.isArray(raw.customSections)) {
    customSections = raw.customSections
      .filter((s) => s && (s.title || s.content))
      .map((s) => ({
        title: s.title || "Custom Section",
        content: s.content || "",
      }));
  }

  // 13. Section Order
  const defaultSectionOrder = [
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
    "languages",
    "awards",
    "customSections",
  ];
  const rawSectionOrder = raw.sectionOrder || (raw.parsedData && raw.parsedData.sectionOrder);
  const sectionOrder =
    Array.isArray(rawSectionOrder) && rawSectionOrder.length > 0
      ? [...new Set(rawSectionOrder.filter(Boolean))]
      : defaultSectionOrder;

  return {
    personal,
    summary,
    experience,
    education,
    projects,
    skills,
    coursework,
    certifications,
    languages,
    references,
    awards,
    customSections,
    sectionOrder,
    contactOrder,
  };
}

export function getEmptyResume() {
  return {
    personal: {
      fullName: "Your Name",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      linkedinUrl: "",
      github: "",
      githubUrl: "",
      website: "",
      websiteUrl: "",
      portfolio: "",
      photoUrl: "",
      dob: "",
      availability: "",
      contactOrder: ["location", "linkedin", "github", "website", "phone", "email"],
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    coursework: [],
    certifications: [],
    languages: [],
    references: [],
    awards: [],
    customSections: [],
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "projects",
      "skills",
      "certifications",
      "languages",
      "awards",
      "customSections",
    ],
    contactOrder: ["location", "linkedin", "github", "website", "phone", "email"],
  };
}
