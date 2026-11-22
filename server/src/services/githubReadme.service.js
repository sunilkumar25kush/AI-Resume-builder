import { GithubReadme } from "../models/GithubReadme.js";
import { Resume } from "../models/Resume.js";
import { geminiService } from "./ai/gemini.service.js";
import { ApiError } from "../utils/ApiError.js";

/** Map of default shields.io tech badge colors */
const TECH_BADGE_COLORS = {
  JavaScript: "F7DF1E&logo=javascript&logoColor=black",
  TypeScript: "3178C6&logo=typescript&logoColor=white",
  React: "20232A&logo=react&logoColor=61DAFB",
  "Next.js": "000000&logo=nextdotjs&logoColor=white",
  Nextjs: "000000&logo=nextdotjs&logoColor=white",
  Vue: "4FC08D&logo=vuedotjs&logoColor=white",
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
  KaliLinux: "557C94&logo=kalilinux&logoColor=white",
};

/** Helper to render a badge */
function renderSkillBadge(name, style = "for-the-badge", fallbackColor = "6366F1") {
  const matchKey = Object.keys(TECH_BADGE_COLORS).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  const colorAndLogo = matchKey
    ? TECH_BADGE_COLORS[matchKey]
    : `${fallbackColor}&logo=code&logoColor=white`;
  return `<img src="https://img.shields.io/badge/${encodeURIComponent(name)}-${colorAndLogo}&style=${style}" alt="${name}" />`;
}

/** Compiles high-impact GitHub Profile Markdown from document model */
export function compileMarkdownFromReadme(data) {
  const profile = data.profile || {};
  const stats = data.statsConfig || {};
  const settings = data.settings || {};
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const template = data.template || "developer-tech-stack";

  const name = profile.name || "Developer";
  const headline = profile.headline || "Full Stack Software Engineer & Open Source Enthusiast";
  const githubUser = profile.githubUsername || "octocat";
  const statsTheme = stats.statsTheme || "tokyonight";
  const badgeStyle = settings.badgesStyle || "for-the-badge";

  const lines = [];

  // ----------------------------------------------------
  // 1. DEVELOPER TECH STACK
  // ----------------------------------------------------
  if (template === "developer-tech-stack" || template === "developer") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24,14,10&height=200&section=header&text=${encodeURIComponent(
        name,
      )}&fontSize=48&fontAlignY=36&desc=${encodeURIComponent(headline)}&descAlignY=58&descAlign=50" width="100%" alt="Header Banner" />`,
      `</div>`,
      "",
      `<p align="center">`,
      `  <img src="https://komarev.com/ghpvc/?username=${githubUser}&label=PROFILE+VIEWS&color=0e75b6&style=flat-square" alt="Profile Views" />`,
      `  <img src="https://img.shields.io/github/followers/${githubUser}?label=Followers&style=flat-square&color=238636" alt="Followers" />`,
      `</p>`,
      "",
    );

    if (profile.bio) {
      lines.push(`### 👨‍💻 About Me`, profile.bio, "");
    }

    const facts = [];
    if (profile.currentRole) facts.push(`- 💼 **Current Role:** ${profile.currentRole}`);
    if (profile.currentWork) facts.push(`- 🔭 **Building:** ${profile.currentWork}`);
    if (profile.learning) facts.push(`- 🌱 **Exploring:** ${profile.learning}`);
    if (profile.askMeAbout) facts.push(`- 💬 **Ask me about:** ${profile.askMeAbout}`);
    if (profile.location) facts.push(`- 📍 **Location:** ${profile.location}`);
    if (profile.funFact) facts.push(`- ⚡ **Fun Fact:** ${profile.funFact}`);
    if (facts.length > 0) {
      lines.push(...facts, "");
    }

    if (socialLinks.length > 0) {
      lines.push(`### 🌐 Connect With Me`, `<p align="left">`);
      socialLinks.forEach((s) => {
        lines.push(
          `  <a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/${encodeURIComponent(
            s.platform,
          )}-0A66C2?style=${badgeStyle}&logo=${encodeURIComponent(
            s.platform.toLowerCase(),
          )}&logoColor=white" alt="${s.platform}" /></a>`,
        );
      });
      lines.push(`</p>`, "");
    }

    if (skills.length > 0) {
      lines.push(`### 🛠️ Technology Stack`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, badgeStyle)}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 🏆 GitHub Trophies`,
      `<div align="center">`,
      `  <img src="https://github-profile-trophy.vercel.app/?username=${githubUser}&theme=onedark&no-frame=false&no-bg=true&margin-w=4" alt="GitHub Trophies" />`,
      `</div>`,
      "",
    );

    if (stats.showGithubStats || stats.showStreakStats) {
      lines.push(
        `### 📊 GitHub Statistics`,
        `<p align="center">`,
        `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" height="165" alt="Stats" />`,
        `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=${statsTheme}&hide_border=true" height="165" alt="Streak" />`,
        `</p>`,
        "",
      );
    }

    if (stats.showTopLangs) {
      lines.push(
        `<p align="center">`,
        `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=${statsTheme}&hide_border=true" height="165" alt="Top Languages" />`,
        `</p>`,
        "",
      );
    }

    if (projects.length > 0) {
      lines.push(
        `### 🚀 Featured Open Source Projects`,
        `| Project | Description | Tech Stack | Stars |`,
        `| :--- | :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| ${titleLink} | ${p.description || "—"} | \`${p.tech || "Full Stack"}\` | ⭐ ${p.stars || "0"} |`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 2. MODERN DEVELOPER DASHBOARD
  // ----------------------------------------------------
  else if (template === "modern-dashboard") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=slice&color=0:3b82f6,50:6366f1,100:8b5cf6&height=180&section=header&text=${encodeURIComponent(
        name,
      )}&fontSize=42&fontColor=ffffff&desc=${encodeURIComponent(headline)}&descAlignY=62" width="100%" alt="Header Banner" />`,
      `</div>`,
      "",
      `<p align="center">`,
      `  <a href="#about-me"><b>About</b></a> • `,
      `  <a href="#skills-radar"><b>Tech Radar</b></a> • `,
      `  <a href="#activity-metrics"><b>Metrics</b></a> • `,
      `  <a href="#featured-repositories"><b>Repositories</b></a> • `,
      `  <a href="#contact-channels"><b>Contact</b></a>`,
      `</p>`,
      "",
      `<h3 id="about-me">🧭 Overview & Mission</h3>`,
      `> ${profile.bio || "Crafting reliable, scalable software solutions with a focus on developer experience and architecture."}`,
      "",
    );

    lines.push(
      `| Metric | Value |`,
      `| :--- | :--- |`,
      `| 💻 **Role** | ${profile.currentRole || "Software Engineer"} |`,
      `| 🚀 **Active Focus** | ${profile.currentWork || "High-performance applications"} |`,
      `| 📍 **Base** | ${profile.location || "Remote / Global"} |`,
      `| 💬 **Inquiries** | ${profile.email || "Open for collaborations"} |`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`<h3 id="skills-radar">⚡ Core Tech Radar</h3>`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "flat-square", "3B82F6")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `<h3 id="activity-metrics">📈 GitHub Activity & Language Radar</h3>`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=nord&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=nord&hide_border=true" height="160" alt="Languages" />`,
      `</p>`,
      "",
      `<div align="center">`,
      `  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubUser}&theme=nord&hide_border=true" width="94%" alt="Activity Graph" />`,
      `</div>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `<h3 id="featured-repositories">📦 Featured Repositories</h3>`,
        `| Status | Repository | Description | Architecture |`,
        `| :---: | :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| 🟢 Active | ${titleLink} | ${p.description || "—"} | \`${p.tech || "TypeScript"}\` |`);
      });
      lines.push("");
    }

    if (socialLinks.length > 0) {
      lines.push(`<h3 id="contact-channels">📬 Connect & Collaborate</h3>`, `<p align="left">`);
      socialLinks.forEach((s) => {
        lines.push(
          `  <a href="${s.url}"><img src="https://img.shields.io/badge/${encodeURIComponent(
            s.platform,
          )}-0F172A?style=flat-square&logo=${encodeURIComponent(
            s.platform.toLowerCase(),
          )}&logoColor=white" alt="${s.platform}" /></a>`,
        );
      });
      lines.push(`</p>`, "");
    }
  }

  // ----------------------------------------------------
  // 3. ANIME / GAMING DEVELOPER
  // ----------------------------------------------------
  else if (template === "anime-gaming" || template === "cyberpunk") {
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
      `<p align="center">`,
      `  <img src="https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif" width="280" alt="Pixel Art Companion" />`,
      `</p>`,
      "",
      `### 🧙 Player Stats & Profile`,
      "```yaml",
      `Player: ${name}`,
      `Class: Senior Code Sorcerer`,
      `Level: 42`,
      `HP: [██████████] 100% (Caffeine Powered)`,
      `MP: [████████░░] 85% (Debug Mana)`,
      `Location: "${profile.location || "Neo Tokyo / Remote"}"`,
      `Current Quest: "${profile.currentWork || "Slaying Production Bugs"}"`,
      "```",
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 🎒 Inventory & Equipped Skills`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge", "FF007F")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### ⚡ Neon Battle Stats`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=radical&hide_border=true" height="165" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=radical&hide_border=true" height="165" alt="Streak" />`,
      `</p>`,
      "",
    );

    lines.push(
      `### 📜 Active Side Quests`,
      `| Quest | Objective | Reward / XP | Progress |`,
      `| :--- | :--- | :--- | :---: |`,
      `| 🗡️ **Main Boss** | ${profile.currentWork || "Release v2.0 flagship app"} | +5000 EXP | [■■■■■■■□□□] 70% |`,
      `| 🛡️ **Skill Tree** | ${profile.learning || "Master Rust & Distributed Systems"} | +3000 EXP | [■■■■■□□□□□] 50% |`,
      "",
    );

    if (projects.length > 0) {
      lines.push(`### 🏆 Legendary Loot (Projects)`, `| Item | Description | Enchantments |`, `| :--- | :--- | :--- |`);
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| 🔮 ${titleLink} | ${p.description || "Epic Open-Source project"} | \`${p.tech || "TypeScript"}\` |`);
      });
      lines.push("");
    }

    if (socialLinks.length > 0) {
      lines.push(`### 🤝 Join Party / Summon Me`, `<p align="left">`);
      socialLinks.forEach((s) => {
        lines.push(
          `  <a href="${s.url}"><img src="https://img.shields.io/badge/${encodeURIComponent(
            s.platform,
          )}-FF007F?style=for-the-badge&logo=${encodeURIComponent(
            s.platform.toLowerCase(),
          )}&logoColor=white" alt="${s.platform}" /></a>`,
        );
      });
      lines.push(`</p>`, "");
    }
  }

  // ----------------------------------------------------
  // 4. MINIMAL AESTHETIC
  // ----------------------------------------------------
  else if (template === "minimal-aesthetic" || template === "minimal") {
    lines.push(
      `# ${name}`,
      `*${headline}*`,
      "",
      `---`,
      "",
    );

    if (profile.bio) {
      lines.push(profile.bio, "");
    }

    const quickPoints = [];
    if (profile.currentRole) quickPoints.push(`- **Focus:** ${profile.currentRole}`);
    if (profile.currentWork) quickPoints.push(`- **Currently:** ${profile.currentWork}`);
    if (profile.location) quickPoints.push(`- **Location:** ${profile.location}`);
    if (quickPoints.length > 0) {
      lines.push(...quickPoints, "");
    }

    if (skills.length > 0) {
      lines.push(
        `### Stack`,
        skills.map((s) => `\`${s.name}\``).join(" • "),
        "",
      );
    }

    lines.push(
      `### Metrics`,
      `<p align="left">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=github_dark&hide_border=true" height="150" alt="Stats" />`,
      `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=github_dark&hide_border=true" height="150" alt="Languages" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(`### Selected Works`);
      projects.forEach((p) => {
        const link = p.link ? ` [→ view project](${p.link})` : "";
        lines.push(`- **${p.title}** — ${p.description || "Web application."}${link}`);
      });
      lines.push("");
    }

    if (socialLinks.length > 0) {
      lines.push(
        `### Links`,
        socialLinks.map((s) => `[${s.platform}](${s.url})`).join("  •  "),
        "",
      );
    }
  }

  // ----------------------------------------------------
  // 5. PROFESSIONAL DEVELOPER
  // ----------------------------------------------------
  else if (template === "professional" || template === "modern") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=cylinder&color=0:1e293b,100:0f172a&height=180&section=header&text=${encodeURIComponent(
        name,
      )}&fontSize=42&fontColor=ffffff&desc=${encodeURIComponent(headline)}&descAlignY=62" width="100%" alt="Header" />`,
      `</div>`,
      "",
      `<p align="center">`,
      `  <img src="https://img.shields.io/badge/Verified%20Engineer-0284C7?style=flat&logo=github&logoColor=white" alt="Verified" />`,
      `  <img src="https://img.shields.io/badge/Available%20for%20Advisory-22C55E?style=flat" alt="Available" />`,
      `</p>`,
      "",
      `### 📌 Executive Summary`,
      profile.bio || "Senior technology leader and software architect specializing in distributed computing, resilient systems, and cloud-native architecture.",
      "",
      `| Area | Focus |`,
      `| :--- | :--- |`,
      `| 💼 **Current Position** | ${profile.currentRole || "Lead Architect"} |`,
      `| 🏗️ **Architecture Scope** | High-availability backend services & cloud platforms |`,
      `| 📍 **Headquarters** | ${profile.location || "Global Remote"} |`,
      `| ✉️ **Direct Contact** | ${profile.email || "Available via LinkedIn"} |`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 💼 Core Competencies & Technologies`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "flat", "0F172A")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📊 Engineering Productivity Metrics`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=dracula&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=dracula&hide_border=true" height="160" alt="Streak" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `### 🏢 Key Deliverables & System Case Studies`,
        `| Deliverable | Impact & Scope | Technologies |`,
        `| :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| ${titleLink} | ${p.description || "Enterprise-grade solution"} | \`${p.tech || "Microservices"}\` |`);
      });
      lines.push("");
    }

    if (socialLinks.length > 0) {
      lines.push(`### 🤝 Professional Network`, `<p align="left">`);
      socialLinks.forEach((s) => {
        lines.push(
          `  <a href="${s.url}"><img src="https://img.shields.io/badge/${encodeURIComponent(
            s.platform,
          )}-0077B5?style=flat&logo=${encodeURIComponent(
            s.platform.toLowerCase(),
          )}&logoColor=white" alt="${s.platform}" /></a>`,
        );
      });
      lines.push(`</p>`, "");
    }
  }

  // ----------------------------------------------------
  // 6. FULL STACK DEVELOPER
  // ----------------------------------------------------
  else if (template === "fullstack") {
    lines.push(
      `<h1 align="center">🌐 ${name} | Full Stack Architect</h1>`,
      `<p align="center"><b>${headline}</b></p>`,
      `<p align="center"><i>Bridging clean UI engineering with resilient distributed backend services.</i></p>`,
      "",
      `### 🏗️ Architecture Blueprint`,
      "```mermaid",
      "flowchart LR",
      '  Client["Frontend (React / Next.js)"] --> API["API Gateway / Node / Go"]',
      '  API --> DB[("PostgreSQL / Redis")]',
      '  API --> Cloud["Cloud Infrastructure (Docker / K8s)"]',
      "```",
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 🛠️ Full Stack Arsenal`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📊 Full Stack GitHub Metrics`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=${statsTheme}&hide_border=true" height="160" alt="Top Languages" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `### 🚀 Production Applications`,
        `| Application | Layer & Stack | Features |`,
        `| :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| ${titleLink} | \`${p.tech || "Full Stack"}\` | ${p.description || "End-to-end web system"} |`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 7. FRONTEND DEVELOPER
  // ----------------------------------------------------
  else if (template === "frontend" || template === "creative") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,2,3,4&height=190&section=header&text=✨+${encodeURIComponent(
        name,
      )}&fontSize=46&fontColor=ffffff&desc=🎨+${encodeURIComponent(headline)}&descAlignY=62" width="100%" alt="Header" />`,
      `</div>`,
      "",
      `### 🎨 Design & Frontend Philosophy`,
      `> "${profile.bio || "Obsessed with micro-interactions, responsive design systems, accessibility, and high framerate web animations."}"`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 🪄 UI / UX & Web Tech`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge", "E11D48")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📊 Creative Code Metrics`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=onedark&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=onedark&hide_border=true" height="160" alt="Streak" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(`### 🌟 Creative Showcases & Components`);
      projects.forEach((p) => {
        const link = p.link ? ` ([Live Preview](${p.link}))` : "";
        lines.push(`- **${p.title}**${link} — ${p.description || "Interactive component library with smooth animations."}`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 8. BACKEND DEVELOPER
  // ----------------------------------------------------
  else if (template === "backend") {
    lines.push(
      "```bash",
      `${githubUser}@cloud-prod:~$ neofetch`,
      `OS: Ubuntu 24.04 LTS x86_64`,
      `Host: Distributed Kubernetes Cluster`,
      `Uptime: 99.999% High Availability`,
      `Shell: zsh 5.9`,
      `Role: Backend & Distributed Systems Engineer`,
      `Languages: Go, Rust, TypeScript, Python`,
      `Databases: PostgreSQL, Redis, ClickHouse, Kafka`,
      "```",
      "",
      `# ${name}`,
      `> ${headline}`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### ⚙️ Backend Arsenal & Cloud`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "flat-square", "00599C")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📊 Backend Throughput & Contributions`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=highcontrast&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=highcontrast&hide_border=true" height="160" alt="Streak" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `### 🛰️ Microservices & APIs`,
        `| Service | Protocol / DB | RPS / Latency | Link |`,
        `| :--- | :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[${p.title}](${p.link})` : p.title;
        lines.push(`| **${titleLink}** | \`${p.tech || "gRPC / Postgres"}\` | < 15ms p99 | ${p.description || "Distributed service"} |`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 9. AI / ML DEVELOPER
  // ----------------------------------------------------
  else if (template === "ai-ml" || template === "academic") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:0ea5e9,50:6366f1,100:a855f7&height=180&section=header&text=🧠+${encodeURIComponent(
        name,
      )}&fontSize=42&fontColor=ffffff&desc=⚡+${encodeURIComponent(headline)}&descAlignY=62" width="100%" alt="AI Banner" />`,
      `</div>`,
      "",
      `### 🔬 Research & AI Focus`,
      `> ${profile.bio || "Developing neural architectures, large language model pipelines, computer vision systems, and efficient ML inference engines."}`,
      "",
      `| Focus Area | Methods & Frameworks |`,
      `| :--- | :--- |`,
      `| 🤖 **Generative AI** | LLM fine-tuning, RAG pipelines, quantization (GGUF/AWQ) |`,
      `| 👁️ **Computer Vision** | Diffusion models, segmentation, object detection |`,
      `| ⚡ **MLOps & Infra** | PyTorch, Triton, vLLM, TensorRT, Docker, CUDA |`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 🧪 Machine Learning Stack`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge", "6366F1")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📊 Model Hub & Research Metrics`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=tokyonight&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=tokyonight&hide_border=true" height="160" alt="Languages" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `### 📄 Research Publications & Models`,
        `| Title | Architecture | Code / ArXiv |`,
        `| :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const link = p.link ? `[Code / Paper](${p.link})` : "Preprint";
        lines.push(`| **${p.title}** | \`${p.tech || "PyTorch"}\` | ${link} |`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 10. OPEN SOURCE CONTRIBUTOR
  // ----------------------------------------------------
  else if (template === "open-source") {
    lines.push(
      `<h1 align="center">🌟 ${name}</h1>`,
      `<p align="center"><b>${headline}</b></p>`,
      `<p align="center">`,
      `  <a href="https://github.com/sponsors/${githubUser}"><img src="https://img.shields.io/badge/Sponsor-%E2%99%A5-ea4aaa?style=for-the-badge" alt="Sponsor" /></a>`,
      `  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />`,
      `</p>`,
      "",
      `### 🤝 Community & Open Source Mission`,
      `> ${profile.bio || "I love building and maintaining tools that developers use every day. Open source empowers global collaboration."}`,
      "",
    );

    lines.push(
      `### 🏆 Contributor Trophies`,
      `<div align="center">`,
      `  <img src="https://github-profile-trophy.vercel.app/?username=${githubUser}&theme=dracula&no-frame=false&no-bg=true" alt="Trophies" />`,
      `</div>`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 🛠️ Languages & Tooling`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge")}`);
      });
      lines.push(`</p>`, "");
    }

    if (projects.length > 0) {
      lines.push(
        `### 📦 Maintained Repositories`,
        `| Library | Purpose | Stars | Status |`,
        `| :--- | :--- | :---: | :---: |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| ${titleLink} | ${p.description || "Open source project"} | ⭐ ${p.stars || "0"} | 🟢 Active |`);
      });
      lines.push("");
    }

    lines.push(
      `### 💡 How to Contribute`,
      `- Feel free to open an issue or pull request on any of my pinned repositories.`,
      `- Check out issues labeled \`good first issue\` to get started.`,
      "",
    );
  }

  // ----------------------------------------------------
  // 11. STUDENT DEVELOPER
  // ----------------------------------------------------
  else if (template === "student") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:a855f7&height=180&section=header&text=🎓+${encodeURIComponent(
        name,
      )}&fontSize=42&fontColor=ffffff&desc=${encodeURIComponent(headline)}&descAlignY=60" width="100%" alt="Header" />`,
      `</div>`,
      "",
      `<p align="center">`,
      `  <img src="https://img.shields.io/badge/Seeking-Summer%20Internship-success?style=flat-square" alt="Seeking Internship" />`,
      `  <img src="https://img.shields.io/badge/Status-CS%20Undergrad-blue?style=flat-square" alt="Status" />`,
      `</p>`,
      "",
      `### 📚 Education & Goals`,
      profile.bio || "Computer Science student passionate about building real-world applications, learning distributed systems, and competing in hackathons.",
      "",
      `### 🗺️ Learning Roadmap`,
      `- [x] Data Structures & Algorithms`,
      `- [x] Full Stack Web Development (React, Node, SQL)`,
      `- [/] Distributed Systems & Cloud Infrastructure`,
      `- [ ] Compilers & Operating Systems`,
      "",
    );

    if (skills.length > 0) {
      lines.push(`### 💻 Technical Toolkit`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "flat-square", "6366F1")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 📈 Daily Coding & Streak`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=tokyonight&hide_border=true" height="155" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=tokyonight&hide_border=true" height="155" alt="Streak" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(`### 🏆 Hackathon & Course Projects`);
      projects.forEach((p) => {
        const link = p.link ? ` ([Code & Demo](${p.link}))` : "";
        lines.push(`- **${p.title}**${link} — ${p.description || "Built during a 36-hour hackathon."} (\`${p.tech || "React"}\`)`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // 12. CYBERSECURITY DEVELOPER
  // ----------------------------------------------------
  else if (template === "cybersecurity") {
    lines.push(
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=terminal&color=0:000000,100:0a0a0a&text=root@security:~#+whoami&fontSize=28&fontColor=00ff66&height=160&section=header" width="100%" alt="Terminal Header" />`,
      `</div>`,
      "",
      `# 🛡️ ${name}`,
      `> **${headline}**`,
      "",
      "```bash",
      `[+] Target: Information Security & Exploit Research`,
      `[+] Specialization: Web Security, Reverse Engineering, CTF Player`,
      `[+] Certifications: OSCP | CEH | CompTIA Security+`,
      `[+] Status: Hunting Vulnerabilities & Hardening Systems`,
      "```",
      "",
    );

    if (skills.length > 0) {
      lines.push(`### ⚔️ Offensive & Defensive Arsenal`, `<p align="left">`);
      skills.forEach((sk) => {
        lines.push(`  ${renderSkillBadge(sk.name, "for-the-badge", "00FF66")}`);
      });
      lines.push(`</p>`, "");
    }

    lines.push(
      `### 🎯 CTF & Security Statistics`,
      `<p align="center">`,
      `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=matrix&hide_border=true" height="160" alt="Stats" />`,
      `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${githubUser}&theme=matrix&hide_border=true" height="160" alt="Streak" />`,
      `</p>`,
      "",
    );

    if (projects.length > 0) {
      lines.push(
        `### 🔍 Security Tooling & Exploits`,
        `| Tool | Category | Details |`,
        `| :--- | :--- | :--- |`,
      );
      projects.forEach((p) => {
        const titleLink = p.link ? `[**${p.title}**](${p.link})` : `**${p.title}**`;
        lines.push(`| 🔒 ${titleLink} | \`${p.tech || "Security Tool"}\` | ${p.description || "Auditing & security toolkit"} |`);
      });
      lines.push("");
    }
  }

  // ----------------------------------------------------
  // FALLBACK FOR CUSTOM
  // ----------------------------------------------------
  else {
    lines.push(`# ${name}`, `> ${headline}`, "");
    if (profile.bio) lines.push(profile.bio, "");
    if (skills.length > 0) {
      lines.push(`### 🛠️ Skills`, skills.map((s) => `\`${s.name}\``).join(" • "), "");
    }
    lines.push(
      `### 📊 GitHub Stats`,
      `<p align="center"><img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=true" alt="Stats" /></p>`,
      "",
    );
  }

  // Common footer
  lines.push(
    "---",
    `<p align="center"><i>⚡ Generated with <a href="https://github.com">AI GitHub README Builder</a></i></p>`,
  );

  return lines.join("\n");
}

/** Create a new README draft document */
export async function createReadme(userId, input) {
  const data = { ...input, userId };
  if (!data.content || !data.content.trim()) {
    data.content = compileMarkdownFromReadme(data);
  }
  return GithubReadme.create(data);
}

/** List user's README projects */
export async function listReadmes(userId) {
  return GithubReadme.find({ userId }).sort({ updatedAt: -1 }).lean();
}

/** Get single README by ID */
export async function getReadmeById(userId, readmeId) {
  const readme = await GithubReadme.findOne({ _id: readmeId, userId }).lean();
  if (!readme) {
    throw ApiError.notFound("GitHub README not found");
  }
  return readme;
}

/** Update an existing README */
export async function updateReadme(userId, readmeId, updates) {
  const existing = await GithubReadme.findOne({ _id: readmeId, userId });
  if (!existing) {
    throw ApiError.notFound("GitHub README not found");
  }

  // Merge updates
  Object.assign(existing, updates);

  // If content was not explicitly updated but profile/stats were, re-compile
  if (!updates.content) {
    existing.content = compileMarkdownFromReadme(existing);
  }

  await existing.save();
  return existing.toObject();
}

/** Delete a README */
export async function deleteReadme(userId, readmeId) {
  const deleted = await GithubReadme.findOneAndDelete({ _id: readmeId, userId });
  if (!deleted) {
    throw ApiError.notFound("GitHub README not found");
  }
  return { deleted: true, id: readmeId };
}

/** Generate a README using Gemini AI */
export async function generateReadmeWithAi(userId, options = {}) {
  const { prompt, resumeId, githubUsername, template = "developer", tone = "professional" } = options;

  let resumeText = "";
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();
    if (resume) {
      resumeText = JSON.stringify({
        contact: resume.contact,
        skills: resume.skills,
        experience: resume.experience,
        projects: resume.projects,
        education: resume.education,
      });
    }
  }

  let aiResult;
  try {
    aiResult = await geminiService.generateGithubReadme({
      promptText: prompt,
      resumeText,
      githubUsername,
      template,
      tone,
    });
  } catch (err) {
    console.warn("[githubReadme] Gemini generation failed, using heuristic fallback:", err.message);
    aiResult = {
      title: `${githubUsername || "Developer"}'s GitHub Profile`,
      profile: {
        name: githubUsername || "Developer",
        headline: "Passionate Software Engineer & Problem Solver",
        bio: prompt || "Full Stack Developer building clean, modern web applications.",
        githubUsername: githubUsername || "octocat",
      },
      statsConfig: {
        showGithubStats: true,
        showStreakStats: true,
        showTopLangs: true,
        statsTheme: "tokyonight",
      },
      skills: [
        { name: "JavaScript", category: "Languages" },
        { name: "TypeScript", category: "Languages" },
        { name: "React", category: "Frontend" },
        { name: "Node.js", category: "Backend" },
      ],
      socialLinks: [
        { platform: "GitHub", username: githubUsername || "octocat", url: `https://github.com/${githubUsername || "octocat"}` },
      ],
      settings: {
        headerStyle: "wave",
        layout: "standard",
        badgesStyle: "for-the-badge",
      },
    };
  }

  const generatedData = {
    userId,
    title: aiResult.title || `${githubUsername || "Developer"}'s GitHub Profile`,
    template: template || "developer",
    sourceOption: "ai",
    profile: aiResult.profile || {},
    statsConfig: aiResult.statsConfig || {},
    skills: aiResult.skills || [],
    socialLinks: aiResult.socialLinks || [],
    projects: aiResult.projects || [],
    settings: aiResult.settings || {},
    content: aiResult.markdown || compileMarkdownFromReadme(aiResult),
  };

  return GithubReadme.create(generatedData);
}

/** Duplicate an existing README project */
export async function duplicateReadme(userId, readmeId) {
  const source = await GithubReadme.findOne({ _id: readmeId, userId }).lean();
  if (!source) {
    throw ApiError.notFound("GitHub README not found");
  }
  delete source._id;
  delete source.createdAt;
  delete source.updatedAt;
  source.title = `${source.title} (Copy)`;
  return GithubReadme.create(source);
}

/** Import raw Markdown */
export async function importReadmeMarkdown(userId, { markdown, title }) {
  const doc = {
    userId,
    title: title || "Imported GitHub README",
    template: "custom",
    sourceOption: "import",
    content: markdown,
  };
  return GithubReadme.create(doc);
}
