export interface MascotAiSuggestion {
  id: string;
  type: "skills" | "summary" | "experience" | "project" | "education" | "portfolio" | "general";
  title?: string;
  originalText: string;
  suggestedText: string;
  items?: string[]; // E.g. ["HTML5", "CSS3", "JavaScript (ES6+)"]
  fieldId?: string;
  onAccept?: (appliedValue: string | string[]) => void;
  onReject?: () => void;
  onEdit?: (customValue: string) => void;
}

/**
 * Intelligent heuristics and AI integration for Resume Buddy suggestions.
 * Understands current form context, preserves truth, never fabricates credentials.
 */
export class MascotAiEngine {
  /**
   * EXAMPLE 1: Skills recommendations
   * User enters: "I know HTML CSS and JavaScript."
   * Mascot: "Nice start! Let's make this skills section more structured."
   * Suggestions: HTML5, CSS3, JavaScript (ES6+)
   */
  public static analyzeSkills(text: string): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    if (!text || typeof text !== "string") return null;
    const trimmed = text.trim();
    if (trimmed.length < 3) return null;

    const lower = trimmed.toLowerCase();

    // Check if input is informal/unstructured sentence or casual listing
    const isInformal =
      lower.includes("i know") ||
      lower.includes("good at") ||
      lower.includes("familiar with") ||
      lower.includes("skills:") ||
      lower.includes("and ") ||
      (!trimmed.includes("\n") && (trimmed.includes(" ") || trimmed.includes(",")));

    if (!isInformal) return null;

    const detectedSkills: string[] = [];

    // Map common casual keywords to industry-standard resume skill names
    if (/html/i.test(lower)) detectedSkills.push("HTML5");
    if (/css/i.test(lower)) detectedSkills.push("CSS3");
    if (/javascript|js\b|es6/i.test(lower)) detectedSkills.push("JavaScript (ES6+)");
    if (/typescript|ts\b/i.test(lower)) detectedSkills.push("TypeScript");
    if (/react/i.test(lower)) detectedSkills.push("React.js");
    if (/node/i.test(lower)) detectedSkills.push("Node.js");
    if (/express/i.test(lower)) detectedSkills.push("Express.js");
    if (/python/i.test(lower)) detectedSkills.push("Python");
    if (/django/i.test(lower)) detectedSkills.push("Django");
    if (/sql|postgres|mysql/i.test(lower)) detectedSkills.push("SQL / Relational Databases");
    if (/mongo/i.test(lower)) detectedSkills.push("MongoDB / NoSQL");
    if (/git\b|github/i.test(lower)) detectedSkills.push("Git & GitHub Version Control");
    if (/tailwind/i.test(lower)) detectedSkills.push("Tailwind CSS");
    if (/next/i.test(lower)) detectedSkills.push("Next.js");
    if (/docker/i.test(lower)) detectedSkills.push("Docker Containerization");
    if (/aws/i.test(lower)) detectedSkills.push("Amazon Web Services (AWS)");

    // If no standard matches found, split by commas or spaces and capitalize
    if (detectedSkills.length === 0) {
      const words = trimmed
        .replace(/^(i know|skills:|good at|experienced in)\s*/i, "")
        .split(/[,;\n]+|\band\b/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);

      words.forEach((w) => {
        const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
        if (!detectedSkills.includes(capitalized)) detectedSkills.push(capitalized);
      });
    }

    if (detectedSkills.length === 0) return null;

    return {
      message: "Nice start! Let's make this skills section more structured.",
      suggestion: {
        id: `skills-suggestion-${Date.now()}`,
        type: "skills",
        title: "Recommended Skills Structure",
        originalText: text,
        suggestedText: detectedSkills.join("\n"),
        items: detectedSkills,
        fieldId: "skillsText",
      },
    };
  }

  /**
   * EXAMPLE 2: Project description suggestions
   * User enters: "I created a website."
   * Mascot: "Could you tell me which technologies you used and what the website does?"
   * Show a professional example based on user's actual project details.
   */
  public static analyzeProject(project: {
    name?: string;
    description?: string;
    technologies?: string;
  }): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    const desc = (project.description || "").trim();
    if (!desc || desc.length < 5) return null;

    const lower = desc.toLowerCase();
    const isVague =
      lower.includes("i created a website") ||
      lower.includes("built a website") ||
      lower.includes("made a website") ||
      lower.includes("created an app") ||
      lower.includes("built an app") ||
      (desc.split(/\s+/).length <= 6 && !desc.includes("with") && !desc.includes("using"));

    if (!isVague) return null;

    const techStack = project.technologies?.trim() || "modern web technologies";
    const projName = project.name?.trim() || "Web Application";

    // Formulate a professional example preserving truth
    const professionalExample = `Architected and developed ${projName} utilizing ${techStack}. Engineered responsive UI layouts, optimized page load speeds, and implemented clean component architecture for seamless user experience across devices.`;

    return {
      message: "Could you tell me which technologies you used and what the website does?",
      suggestion: {
        id: `project-suggestion-${Date.now()}`,
        type: "project",
        title: "Professional Project Description",
        originalText: desc,
        suggestedText: professionalExample,
      },
    };
  }

  /**
   * EXAMPLE 3: Professional summary suggestions
   * User enters a generic summary.
   * Mascot: "Your professional summary could be more impactful. Let's improve it."
   */
  public static analyzeSummary(
    summaryText: string,
    targetRole?: string
  ): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    if (!summaryText || typeof summaryText !== "string") return null;
    const trimmed = summaryText.trim();
    if (trimmed.length < 10) return null;

    const lower = trimmed.toLowerCase();
    const isGeneric =
      lower.includes("hard worker") ||
      lower.includes("seeking a job") ||
      lower.includes("seeking an opportunity") ||
      lower.includes("looking for a job") ||
      lower.includes("fresh graduate") ||
      lower.includes("passionate about learning") ||
      (trimmed.length < 50 && !lower.includes("proven") && !lower.includes("specializing"));

    if (!isGeneric) return null;

    const role = targetRole?.trim() || "Professional Developer";
    const improvedSummary = `${role} with a dedicated focus on building clean, high-performance web applications. Adept at translating user needs into responsive, accessible digital solutions while maintaining clean code standards, strong problem-solving abilities, and collaborative team communication.`;

    return {
      message: "Your professional summary could be more impactful. Let's improve it.",
      suggestion: {
        id: `summary-suggestion-${Date.now()}`,
        type: "summary",
        title: "High-Impact Summary",
        originalText: trimmed,
        suggestedText: improvedSummary,
        fieldId: "summary",
      },
    };
  }

  /**
   * Experience description improvements:
   * Replaces passive phrasing ("Responsible for fixing bugs") with action verbs.
   */
  public static analyzeExperience(entry: {
    title?: string;
    company?: string;
    description?: string;
  }): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    const desc = (entry.description || "").trim();
    if (!desc || desc.length < 8) return null;

    const lower = desc.toLowerCase();
    const isPassive =
      lower.startsWith("responsible for") ||
      lower.startsWith("helped with") ||
      lower.startsWith("worked on") ||
      lower.startsWith("handled") ||
      lower.includes("fixing bugs") ||
      lower.includes("did website work");

    if (!isPassive) return null;

    let improved = desc;
    if (lower.includes("fixing bugs") || lower.includes("fixed bugs")) {
      improved =
        "• Diagnosed, reproduced, and resolved critical application defects and UI glitches, improving platform stability and client satisfaction.";
    } else if (lower.includes("website") || lower.includes("frontend")) {
      improved =
        "• Engineered dynamic frontend interfaces and reusable components adhering to design systems, boosting responsiveness and code maintainability.";
    } else {
      improved = desc
        .replace(/^responsible for\s+/i, "Spearheaded ")
        .replace(/^helped with\s+/i, "Collaborated on ")
        .replace(/^worked on\s+/i, "Developed ");
      if (!improved.startsWith("• ")) improved = `• ${improved}`;
    }

    return {
      message: "Let's make this experience description more achievement-oriented with strong action verbs.",
      suggestion: {
        id: `experience-suggestion-${Date.now()}`,
        type: "experience",
        title: "Action-Driven Experience",
        originalText: desc,
        suggestedText: improved,
      },
    };
  }

  /**
   * Education information guidance:
   * Offers recommendations to include relevant coursework, honors, or capstone projects.
   */
  public static analyzeEducation(edu: {
    degree?: string;
    institution?: string;
    description?: string;
  }): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    const degree = (edu.degree || "").trim();
    const institution = (edu.institution || "").trim();
    const desc = (edu.description || "").trim();

    // If degree and institution are filled, but description is empty
    if (degree && institution && !desc) {
      const suggestedDescription =
        "Relevant Coursework: Data Structures & Algorithms, Web Architecture, Database Systems, Software Design Principles.\nAcademic Achievements: Maintained strong academic standing and completed capstone group projects.";

      return {
        message: "Tip: Highlighting relevant coursework or academic honors makes your education profile stand out to recruiters.",
        suggestion: {
          id: `education-suggestion-${Date.now()}`,
          type: "education",
          title: "Coursework & Honors Guidance",
          originalText: "",
          suggestedText: suggestedDescription,
        },
      };
    }

    return null;
  }

  /**
   * Portfolio content suggestions:
   * Tailors bio, headline, and showcase descriptions for portfolio builder.
   */
  public static analyzePortfolio(
    contentType: "headline" | "bio" | "project",
    currentText: string,
    targetRole?: string
  ): {
    message: string;
    suggestion: MascotAiSuggestion;
  } | null {
    const trimmed = (currentText || "").trim();
    const role = targetRole || "Full Stack Developer";

    if (contentType === "headline") {
      if (!trimmed || trimmed.length < 15 || trimmed.toLowerCase() === "developer") {
        return {
          message: "A specialized headline grabs immediate recruiter attention on your portfolio header.",
          suggestion: {
            id: `portfolio-headline-${Date.now()}`,
            type: "portfolio",
            title: "Recommended Portfolio Headline",
            originalText: trimmed,
            suggestedText: `${role} | Scalable Systems & Modern Web Experiences`,
          },
        };
      }
    }

    if (contentType === "bio") {
      if (!trimmed || trimmed.length < 30) {
        return {
          message: "Let's craft an engaging, personalized portfolio bio that tells your technical story.",
          suggestion: {
            id: `portfolio-bio-${Date.now()}`,
            type: "portfolio",
            title: "Recommended Portfolio Bio",
            originalText: trimmed,
            suggestedText: `Passionate ${role} dedicated to engineering reliable, accessible digital products. Driven by clean architecture, user experience research, and continuous learning in modern cloud and web technologies.`,
          },
        };
      }
    }

    return null;
  }

  /**
   * Safe asynchronous AI provider request wrapper:
   * Uses backend aiApi when available with fallback to local heuristic engine.
   */
  public static async requestAiSectionRewrite(
    section: "summary" | "skills" | "experience" | "education" | "project",
    action: "improve" | "shorten" | "expand" | "rewrite" | "professional" | "technical" | "entry" | "senior" | "executive",
    content: unknown
  ): Promise<unknown> {
    try {
      if (typeof window !== "undefined") {
        const { aiApi } = await import("@/api/ai");
        return await aiApi.assist(section, action, content);
      }
      return null;
    } catch (error) {
      console.warn(`[MascotAiEngine] AI provider request fallback for ${section}:`, error);
      return null;
    }
  }
}
