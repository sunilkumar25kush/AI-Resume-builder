/**
 * Normalizes any resume input (whether legacy ParsedResumeData or the extended schema)
 * into the canonical schema required by all templates.
 * 
 * Rules:
 * - Header ALWAYS reads personal.fullName, fallback to "Your Name" (NEVER resume title).
 * - Empty sections/fields are normalized to clean arrays or empty strings.
 */
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
  const linkedin = (personalRaw.linkedin || contactRaw.linkedin || "").trim();
  const github = (personalRaw.github || contactRaw.github || "").trim();
  const website = (personalRaw.website || contactRaw.website || "").trim();
  const portfolio = (personalRaw.portfolio || contactRaw.portfolio || "").trim();
  const photoUrl = (personalRaw.photoUrl || "").trim();
  const dob = (personalRaw.dob || "").trim();
  const availability = (personalRaw.availability || "").trim();

  const personal = {
    fullName,
    isPlaceholder,
    title,
    email,
    phone,
    location,
    linkedin,
    github,
    website,
    portfolio,
    photoUrl,
    dob,
    availability,
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
        links = proj.links.filter((l) => l && l.url);
      } else {
        if (proj.link) links.push({ label: "Code", url: proj.link });
        if (proj.liveDemo) links.push({ label: "Live Demo", url: proj.liveDemo });
      }

      return {
        name: proj.name || "",
        techStack,
        links,
        date: proj.date || "",
        bullets,
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
      github: "",
      website: "",
      portfolio: "",
      photoUrl: "",
      dob: "",
      availability: "",
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
  };
}
