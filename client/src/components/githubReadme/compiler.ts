import type {
  GithubReadme,
  GithubReadmeSection,
  GithubReadmeSettings,
} from "@/types";

/** Map of default shields.io tech badge colors */
export const TECH_BADGE_COLORS: Record<string, string> = {
  JavaScript: "F7DF1E&logo=javascript&logoColor=black",
  TypeScript: "3178C6&logo=typescript&logoColor=white",
  React: "20232A&logo=react&logoColor=61DAFB",
  "Next.js": "000000&logo=nextdotjs&logoColor=white",
  Vue: "4FC08D&logo=vuedotjs&logoColor=white",
  Angular: "DD0031&logo=angular&logoColor=white",
  "Node.js": "339933&logo=nodedotjs&logoColor=white",
  Python: "3776AB&logo=python&logoColor=white",
  Go: "00ADD8&logo=go&logoColor=white",
  Rust: "000000&logo=rust&logoColor=white",
  Java: "ED8B00&logo=openjdk&logoColor=white",
  "C++": "00599C&logo=cplusplus&logoColor=white",
  Docker: "2496ED&logo=docker&logoColor=white",
  Kubernetes: "326CE5&logo=kubernetes&logoColor=white",
  AWS: "232F3E&logo=amazonwebservices&logoColor=white",
  GCP: "4285F4&logo=googlecloud&logoColor=white",
  TailwindCSS: "06B6D4&logo=tailwindcss&logoColor=white",
  PostgreSQL: "4169E1&logo=postgresql&logoColor=white",
  MongoDB: "47A248&logo=mongodb&logoColor=white",
  Redis: "DC382D&logo=redis&logoColor=white",
  GraphQL: "E10098&logo=graphql&logoColor=white",
  Git: "F05032&logo=git&logoColor=white",
  Linux: "FCC624&logo=linux&logoColor=black",
  PyTorch: "EE4C2C&logo=pytorch&logoColor=white",
  TensorFlow: "FF6F00&logo=tensorflow&logoColor=white",
  FastAPI: "009688&logo=fastapi&logoColor=white",
  Figma: "F24E1E&logo=figma&logoColor=white",
};

/** Get default section items for a given template */
export function getDefaultSections(template = "developer-tech-stack"): GithubReadmeSection[] {
  return [
    { id: "sec_header", type: "header", title: "Profile Header", enabled: true },
    { id: "sec_about", type: "about", title: "About Me", enabled: true },
    { id: "sec_skills", type: "skills", title: "Skills & Tech Stack", enabled: true },
    { id: "sec_stats", type: "stats", title: "GitHub Statistics", enabled: true },
    { id: "sec_trophies", type: "trophies", title: "GitHub Trophies", enabled: template !== "minimal-aesthetic" },
    { id: "sec_top_langs", type: "top_langs", title: "Most Used Languages", enabled: true },
    { id: "sec_graph", type: "graph", title: "Contribution Graph", enabled: template === "modern-dashboard" || template === "anime-gaming" },
    { id: "sec_projects", type: "projects", title: "Featured Projects", enabled: true },
    { id: "sec_socials", type: "socials", title: "Social Links", enabled: true },
    { id: "sec_contact", type: "contact", title: "Contact Information", enabled: false },
    { id: "sec_experience", type: "experience", title: "Work Experience", enabled: false },
    { id: "sec_education", type: "education", title: "Education", enabled: false },
    { id: "sec_certifications", type: "certifications", title: "Certifications", enabled: false },
    { id: "sec_competitive", type: "competitive", title: "Competitive Programming", enabled: false },
  ];
}

/** Render a single skill badge */
export function renderSkillBadge(name: string, style = "for-the-badge", fallbackColor = "6366F1"): string {
  const matchKey = Object.keys(TECH_BADGE_COLORS).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  const colorAndLogo = matchKey
    ? TECH_BADGE_COLORS[matchKey]
    : `${fallbackColor}&logo=code&logoColor=white`;
  return `<img src="https://img.shields.io/badge/${encodeURIComponent(name)}-${colorAndLogo}&style=${style}" alt="${name}" />`;
}

/** Compiles full GitHub-compatible markdown from state */
export function compileReadmeToMarkdown(doc: Partial<GithubReadme>): string {
  const profile = doc.profile || { name: "", headline: "", bio: "", githubUsername: "octocat" };
  const stats = doc.statsConfig || {
    showGithubStats: true,
    showStreakStats: true,
    showTopLangs: true,
    showTrophies: true,
    showActivityGraph: true,
    statsTheme: "tokyonight",
  };
  const settings: GithubReadmeSettings = doc.settings || {
    headerStyle: "wave",
    layout: "standard",
    badgesStyle: "for-the-badge",
  };
  const skills = Array.isArray(doc.skills) ? doc.skills : [];
  const socialLinks = Array.isArray(doc.socialLinks) ? doc.socialLinks : [];
  const projects = Array.isArray(doc.projects) ? doc.projects : [];
  const experience = Array.isArray(doc.experience) ? doc.experience : [];
  const education = Array.isArray(doc.education) ? doc.education : [];
  const certifications = Array.isArray(doc.certifications) ? doc.certifications : [];
  const achievements = Array.isArray(doc.achievements) ? doc.achievements : [];
  const competitive = doc.competitive || {};
  const sections = Array.isArray(doc.sections) && doc.sections.length > 0
    ? doc.sections
    : getDefaultSections(doc.template || "developer-tech-stack");

  const name = profile.name || "Developer";
  const headline = profile.headline || "Full-Stack Software Engineer & Open Source Enthusiast";
  const githubUser = profile.githubUsername || "octocat";
  const statsTheme = stats.statsTheme || "tokyonight";
  const badgeStyle = settings.badgesStyle || "for-the-badge";

  const lines: string[] = [];

  // Iterate over active sections in user-defined order
  sections.forEach((sec) => {
    if (!sec.enabled) return;

    switch (sec.type) {
      // ---------------------------------------------
      // HEADER
      // ---------------------------------------------
      case "header": {
        if (doc.bannerUrl) {
          lines.push(
            `<div align="center">`,
            `  <img src="${doc.bannerUrl}" width="100%" alt="Header Banner" />`,
            `</div>`,
            "",
          );
        } else if (doc.template === "anime-gaming") {
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:ff007f,50:7928ca,100:00dfd8&height=200&section=header&text=🎮+${encodeURIComponent(
              name,
            )}&fontSize=44&fontColor=ffffff&desc=⚔️+${encodeURIComponent(headline)}&descAlignY=60" width="100%" alt="Gaming Header" />`,
            `</div>`,
            "",
            `<p align="center">`,
            `  <img src="https://readme-typing-svg.herokuapp.com?font=Press+Start+2P&size=14&pause=1000&color=00FF99&center=true&vCenter=true&width=500&lines=PLAYER+1+READY...;CLASS%3A+FULL-STACK+WIZARD;SPECIAL%3A+CLEAN+ARCHITECTURE;PRESS+START+TO+CODE" alt="Typing Banner" />`,
            `</p>`,
            "",
          );
        } else if (doc.template === "minimal-aesthetic") {
          lines.push(`# ${name}`, `*${headline}*`, "", `---`, "");
        } else if (settings.headerStyle === "typing") {
          lines.push(
            `<h1 align="center">${name}</h1>`,
            `<p align="center">`,
            `  <a href="https://github.com/${githubUser}">`,
            `    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=6366F1&center=true&vCenter=true&width=450&lines=${encodeURIComponent(
              headline,
            )};Passionate+builder;Clean+architecture" alt="Typing SVG" />`,
            `  </a>`,
            `</p>`,
            "",
          );
        } else {
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24,14,10&height=200&section=header&text=${encodeURIComponent(
              name,
            )}&fontSize=48&fontAlignY=36&desc=${encodeURIComponent(headline)}&descAlignY=58&descAlign=50" width="100%" alt="Header Banner" />`,
            `</div>`,
            "",
          );
        }

        // Visitor counter & Follower pills
        lines.push(
          `<p align="center">`,
          `  <img src="https://komarev.com/ghpvc/?username=${githubUser}&label=PROFILE+VIEWS&color=0e75b6&style=flat-square" alt="Profile Views" />`,
          `  <img src="https://img.shields.io/github/followers/${githubUser}?label=Followers&style=flat-square&color=238636" alt="Followers" />`,
          `</p>`,
          "",
        );

        if (doc.gifUrl) {
          lines.push(`<p align="center"><img src="${doc.gifUrl}" width="300" alt="Animated Mascot" /></p>`, "");
        }
        break;
      }

      // ---------------------------------------------
      // ABOUT / INTRO
      // ---------------------------------------------
      case "about":
      case "intro": {
        const heading = sec.title || (sec.type === "intro" ? "Introduction" : "About Me");
        lines.push(`### 👨‍💻 ${heading}`);
        if (profile.bio) lines.push(profile.bio, "");

        const facts: string[] = [];
        if (profile.currentRole) facts.push(`- 💼 **Current Role:** ${profile.currentRole}`);
        if (profile.currentWork) facts.push(`- 🔭 **Building:** ${profile.currentWork}`);
        if (profile.learning) facts.push(`- 🌱 **Exploring:** ${profile.learning}`);
        if (profile.askMeAbout) facts.push(`- 💬 **Ask me about:** ${profile.askMeAbout}`);
        if (profile.location) facts.push(`- 📍 **Location:** ${profile.location}`);
        if (profile.funFact) facts.push(`- ⚡ **Fun Fact:** ${profile.funFact}`);
        if (profile.email) facts.push(`- 📫 **Reach me at:** ${profile.email}`);

        if (facts.length > 0) lines.push(...facts, "");
        break;
      }

      // ---------------------------------------------
      // SKILLS & TECH STACK
      // ---------------------------------------------
      case "skills": {
        lines.push(`### 🛠️ ${sec.title || "Technology Stack"}`);
        if (skills.length > 0) {
          lines.push('<p align="left">');
          skills.forEach((sk) => {
            lines.push(`  ${renderSkillBadge(sk.name, badgeStyle)}`);
          });
          lines.push("</p>", "");
        } else {
          lines.push("`TypeScript` • `React` • `Node.js` • `Python` • `Docker` • `AWS`", "");
        }
        break;
      }

      // ---------------------------------------------
      // SOCIAL LINKS
      // ---------------------------------------------
      case "socials": {
        if (socialLinks.length > 0) {
          lines.push(`### 🌐 ${sec.title || "Connect With Me"}`, '<p align="left">');
          socialLinks.forEach((s) => {
            lines.push(
              `  <a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/${encodeURIComponent(
                s.platform,
              )}-0A66C2?style=${badgeStyle}&logo=${encodeURIComponent(
                s.platform.toLowerCase(),
              )}&logoColor=white" alt="${s.platform}" /></a>`,
            );
          });
          lines.push("</p>", "");
        }
        break;
      }

      // ---------------------------------------------
      // GITHUB STATS
      // ---------------------------------------------
      case "stats": {
        lines.push(
          `### 📊 ${sec.title || "GitHub Analytics"}`,
          `<p align="center">`,
          `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" height="165" alt="GitHub Stats" />`,
          `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=${statsTheme}&hide_border=true" height="165" alt="GitHub Streak" />`,
          `</p>`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // TROPHIES
      // ---------------------------------------------
      case "trophies": {
        lines.push(
          `### 🏆 ${sec.title || "GitHub Trophies"}`,
          `<div align="center">`,
          `  <img src="https://github-profile-trophy.vercel.app/?username=${githubUser}&theme=onedark&no-frame=false&no-bg=true&margin-w=4" alt="Trophies" />`,
          `</div>`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // TOP LANGUAGES
      // ---------------------------------------------
      case "top_langs": {
        lines.push(
          `### 📈 ${sec.title || "Most Used Languages"}`,
          `<p align="center">`,
          `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=${statsTheme}&hide_border=true" height="165" alt="Top Languages" />`,
          `</p>`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // CONTRIBUTION GRAPH
      // ---------------------------------------------
      case "graph": {
        lines.push(
          `### 📅 ${sec.title || "Contribution Graph"}`,
          `<div align="center">`,
          `  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubUser}&theme=tokyo-night&hide_border=true" width="95%" alt="Activity Graph" />`,
          `</div>`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // PROJECTS
      // ---------------------------------------------
      case "projects": {
        lines.push(`### 🚀 ${sec.title || "Featured Projects"}`);
        if (projects.length > 0) {
          lines.push(`| Project | Description | Stack | Stars |`, `| :--- | :--- | :--- | :---: |`);
          projects.forEach((p) => {
            const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
            lines.push(`| ${titleLink} | ${p.description || "—"} | \`${p.tech || "Full Stack"}\` | ⭐ ${p.stars || "0"} |`);
          });
          lines.push("");
        } else {
          lines.push(`- **[Awesome Project](https://github.com/${githubUser})** — Scalable web application built with modern architecture.`, "");
        }
        break;
      }

      // ---------------------------------------------
      // WORK EXPERIENCE
      // ---------------------------------------------
      case "experience": {
        lines.push(`### 💼 ${sec.title || "Work Experience"}`);
        if (experience.length > 0) {
          experience.forEach((exp) => {
            lines.push(`- **${exp.role}** @ *${exp.company}* (${exp.period})`, `  ${exp.description}`, "");
          });
        } else {
          lines.push(`- **Senior Software Engineer** @ *Tech Corp* (2023 - Present)`, `  Architecting distributed cloud systems and frontend infrastructure.`, "");
        }
        break;
      }

      // ---------------------------------------------
      // EDUCATION
      // ---------------------------------------------
      case "education": {
        lines.push(`### 🎓 ${sec.title || "Education"}`);
        if (education.length > 0) {
          education.forEach((edu) => {
            lines.push(`- **${edu.degree}** — *${edu.institution}* (${edu.year})`);
          });
        } else {
          lines.push(`- **B.S. in Computer Science** — *University* (2020 - 2024)`);
        }
        lines.push("");
        break;
      }

      // ---------------------------------------------
      // CERTIFICATIONS
      // ---------------------------------------------
      case "certifications": {
        lines.push(`### 📜 ${sec.title || "Certifications & Credentials"}`);
        if (certifications.length > 0) {
          certifications.forEach((cert) => lines.push(`- 🛡️ ${cert}`));
        } else {
          lines.push(`- 🛡️ AWS Certified Solutions Architect`, `- 🛡️ Certified Kubernetes Administrator (CKA)`);
        }
        lines.push("");
        break;
      }

      // ---------------------------------------------
      // ACHIEVEMENTS
      // ---------------------------------------------
      case "achievements": {
        lines.push(`### 🌟 ${sec.title || "Achievements & Awards"}`);
        if (achievements.length > 0) {
          achievements.forEach((ach) => lines.push(`- 🏅 ${ach}`));
        } else {
          lines.push(`- 🏅 1st Place — Global Hackathon 2025`, `- 🏅 GitHub Arctic Code Vault Contributor`);
        }
        lines.push("");
        break;
      }

      // ---------------------------------------------
      // COMPETITIVE PROGRAMMING
      // ---------------------------------------------
      case "competitive": {
        const lc = competitive.leetcodeUsername || githubUser;
        lines.push(
          `### 🧠 ${sec.title || "Competitive Programming"}`,
          `<p align="center">`,
          `  <img src="https://leetcard.jacoblin.cool/${lc}?theme=nord&font=Karma" alt="LeetCode Stats" />`,
          `</p>`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // CONTACT
      // ---------------------------------------------
      case "contact": {
        lines.push(
          `### 📬 ${sec.title || "Contact Information"}`,
          `- ✉️ Email: [${profile.email || "hello@example.com"}](mailto:${profile.email || "hello@example.com"})`,
          profile.portfolioUrl ? `- 🌐 Website: [${profile.portfolioUrl}](${profile.portfolioUrl})` : "",
          `- 💬 Let's connect on GitHub: [@${githubUser}](https://github.com/${githubUser})`,
          "",
        );
        break;
      }

      // ---------------------------------------------
      // CUSTOM SECTION
      // ---------------------------------------------
      case "custom": {
        lines.push(`### 📌 ${sec.title || "Custom Section"}`, sec.customMarkdown || "Your custom markdown content here...", "");
        break;
      }

      default:
        break;
    }
  });

  // Common footer
  lines.push("---", `<p align="center"><i>⚡ Generated with <a href="https://github.com">AI GitHub README Builder</a></i></p>`);

  return lines.join("\n");
}
