import type {
  GithubReadme,
  GithubReadmeSection,
  GithubReadmeSettings,
  GithubReadmeSkill,
} from "@/types";

/** Map of skill names to skillicons.dev slug */
export const SKILL_ICON_SLUGS: Record<string, string> = {
  javascript: "js",
  js: "js",
  typescript: "ts",
  ts: "ts",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  vue: "vue",
  angular: "angular",
  "node.js": "nodejs",
  nodejs: "nodejs",
  express: "express",
  "express.js": "express",
  python: "py",
  fastapi: "fastapi",
  flask: "flask",
  django: "django",
  go: "go",
  golang: "go",
  rust: "rust",
  java: "java",
  "c++": "cpp",
  cpp: "cpp",
  c: "c",
  "c#": "cs",
  csharp: "cs",
  html: "html",
  html5: "html",
  css: "css",
  css3: "css",
  tailwind: "tailwind",
  tailwindcss: "tailwind",
  bootstrap: "bootstrap",
  sass: "sass",
  mongodb: "mongodb",
  postgres: "postgres",
  postgresql: "postgres",
  mysql: "mysql",
  sqlite: "sqlite",
  redis: "redis",
  supabase: "supabase",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  gcp: "gcp",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  linux: "linux",
  nginx: "nginx",
  figma: "figma",
  postman: "postman",
  dart: "dart",
  flutter: "flutter",
  vscode: "vscode",
  arch: "arch",
  bash: "bash",
  graphql: "graphql",
  redux: "redux",
  webpack: "webpack",
  vite: "vite",
  jest: "jest",
  matlab: "matlab",
  r: "r",
  swift: "swift",
  kotlin: "kotlin",
  android: "android",
  apple: "apple",
  windows: "windows",
  ubuntu: "ubuntu",
  neovim: "neovim",
  vim: "vim",
  threejs: "threejs",
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  opencv: "opencv",
  dotnet: "dotnet",
  ".net": "dotnet",
};

/** Map of default shields.io tech badge colors */
export const TECH_BADGE_COLORS: Record<string, string> = {
  C: "00599C&logo=c&logoColor=white",
  CSS3: "1572B6&logo=css3&logoColor=white",
  Dart: "0175C2&logo=dart&logoColor=white",
  HTML5: "E34F26&logo=html5&logoColor=white",
  Java: "ED8B00&logo=openjdk&logoColor=white",
  JavaScript: "F7DF1E&logo=javascript&logoColor=black",
  PHP: "777BB4&logo=php&logoColor=white",
  Python: "3776AB&logo=python&logoColor=white",
  TypeScript: "3178C6&logo=typescript&logoColor=white",
  "Windows Terminal": "4D4D4D&logo=windows-terminal&logoColor=white",
  Firebase: "FFCA28&logo=firebase&logoColor=black",
  Render: "000000&logo=render&logoColor=white",
  Vercel: "000000&logo=vercel&logoColor=white",
  Bootstrap: "7952B3&logo=bootstrap&logoColor=white",
  EJS: "B4CA65&logo=javascript&logoColor=black",
  "Express.js": "000000&logo=express&logoColor=white",
  FastAPI: "009688&logo=fastapi&logoColor=white",
  Flask: "000000&logo=flask&logoColor=white",
  Flutter: "02569B&logo=flutter&logoColor=white",
  JWT: "000000&logo=json-web-tokens&logoColor=white",
  "Node.js": "339933&logo=nodedotjs&logoColor=white",
  Nodemon: "76D04B&logo=nodemon&logoColor=white",
  React: "20232A&logo=react&logoColor=61DAFB",
  "Socket.io": "010101&logo=socketdotio&logoColor=white",
  TailwindCSS: "06B6D4&logo=tailwindcss&logoColor=white",
  Nginx: "009639&logo=nginx&logoColor=white",
  Supabase: "3ECF8E&logo=supabase&logoColor=white",
  MySQL: "4479A1&logo=mysql&logoColor=white",
  MongoDB: "47A248&logo=mongodb&logoColor=white",
  SQLite: "003B57&logo=sqlite&logoColor=white",
  Canva: "00C4CC&logo=canva&logoColor=white",
  Figma: "F24E1E&logo=figma&logoColor=white",
  NumPy: "013243&logo=numpy&logoColor=white",
  Matplotlib: "11557C&logo=python&logoColor=white",
  Git: "F05032&logo=git&logoColor=white",
  GitHub: "181717&logo=github&logoColor=white",
  Jest: "C21325&logo=jest&logoColor=white",
  Notion: "000000&logo=notion&logoColor=white",
  Postman: "FF6C37&logo=postman&logoColor=white",
  "Raspberry Pi": "A22846&logo=raspberry-pi&logoColor=white",
  "Next.js": "000000&logo=nextdotjs&logoColor=white",
  Vue: "4FC08D&logo=vuedotjs&logoColor=white",
  Angular: "DD0031&logo=angular&logoColor=white",
  Go: "00ADD8&logo=go&logoColor=white",
  Rust: "000000&logo=rust&logoColor=white",
  "C++": "00599C&logo=cplusplus&logoColor=white",
  Docker: "2496ED&logo=docker&logoColor=white",
  Kubernetes: "326CE5&logo=kubernetes&logoColor=white",
  AWS: "232F3E&logo=amazonwebservices&logoColor=white",
  GCP: "4285F4&logo=googlecloud&logoColor=white",
  PostgreSQL: "4169E1&logo=postgresql&logoColor=white",
  Redis: "DC382D&logo=redis&logoColor=white",
  GraphQL: "E10098&logo=graphql&logoColor=white",
  Linux: "FCC624&logo=linux&logoColor=black",
  PyTorch: "EE4C2C&logo=pytorch&logoColor=white",
  TensorFlow: "FF6F00&logo=tensorflow&logoColor=white",
};

/** Get default section items for a given template */
export function getDefaultSections(template = "developer-tech-stack"): GithubReadmeSection[] {
  const isMinimal = template === "minimal-aesthetic" || template === "midnight-shady";
  const isGamerOrAnime = template === "anime-gaming" || template === "anime-tokyo-ghoul";
  const isDashboard = template === "modern-dashboard" || template === "hugo-starry-cyber";
  const isSahil = template === "sahil-dev-stack" || template === "developer-tech-stack";
  const isJoshua = template === "joshua-lofi-city" || template === "student";

  return [
    { id: "sec_header", type: "header", title: "Profile Header", enabled: true },
    { id: "sec_about", type: "about", title: "About Me", enabled: true },
    { id: "sec_skills", type: "skills", title: "Skills & Tech Stack", enabled: !isDashboard },
    { id: "sec_stats", type: "stats", title: isDashboard ? "Languages and Activity" : "GitHub Statistics", enabled: true },
    { id: "sec_trophies", type: "trophies", title: "GitHub Trophies", enabled: isSahil || isGamerOrAnime },
    { id: "sec_top_langs", type: "top_langs", title: "Most Used Languages", enabled: !isDashboard && !isMinimal },
    { id: "sec_graph", type: "graph", title: "Contribution Graph", enabled: isDashboard || isGamerOrAnime || isMinimal },
    { id: "sec_projects", type: "projects", title: "Featured Projects", enabled: !isJoshua && !isDashboard },
    { id: "sec_socials", type: "socials", title: "Social Links", enabled: isSahil || isMinimal },
    { id: "sec_contact", type: "contact", title: "Contact Information", enabled: isDashboard || isJoshua },
    { id: "sec_experience", type: "experience", title: "Work Experience", enabled: false },
    { id: "sec_education", type: "education", title: "Education", enabled: false },
    { id: "sec_certifications", type: "certifications", title: "Certifications", enabled: false },
    { id: "sec_achievements", type: "achievements", title: "Achievements", enabled: isSahil },
    { id: "sec_competitive", type: "competitive", title: "Competitive Programming", enabled: isGamerOrAnime },
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

/** Render skillicons.dev squircle icon row */
export function renderSkillIconsUrl(skills: GithubReadmeSkill[], theme = "dark", perLine = 12): string {
  const slugs = skills
    .map((s) => SKILL_ICON_SLUGS[s.name.toLowerCase().trim()])
    .filter(Boolean);
  const resolved = slugs.length > 0 ? slugs : ["js", "ts", "react", "nextjs", "nodejs", "py", "docker", "git"];
  const unique = Array.from(new Set(resolved)).join(",");
  return `https://skillicons.dev/icons?i=${unique}&theme=${theme}&perline=${perLine}`;
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
  const statsTheme = stats.statsTheme || (doc.template === "modern-dashboard" ? "nord" : doc.template === "anime-gaming" ? "radical" : "tokyonight");
  const badgeStyle = settings.badgesStyle || "for-the-badge";
  const templateId = doc.template || "developer-tech-stack";

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
        } else if (templateId === "hugo-starry-cyber" || templateId === "modern-dashboard") {
          // Dev Hugo Yannt reference: Starry night gothic pixel castle banner with pixel font
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:050811,40:0d1527,100:03060d&height=210&section=header&text=Dev+${encodeURIComponent(
              name,
            )}&fontSize=42&fontColor=ffffff&fontAlignY=45&desc=${encodeURIComponent(headline)}&descAlignY=66&descAlign=50" width="100%" alt="Dev Header" />`,
            `</div>`,
            "",
            `<p align="center">`,
            `  <code>📍 ${profile.location || "Brazil 🇧🇷"}</code> &nbsp;•&nbsp; <code>he/him</code>`,
            `</p>`,
            "",
          );
        } else if (templateId === "sahil-dev-stack" || templateId === "developer-tech-stack" || templateId === "developer") {
          // Sahil Raut reference:
          lines.push(
            `### 💻 Hi 👋, I'm ${name}`,
            "",
            `> ✉️ Email me at [${profile.email || "sahilraut200619@gmail.com"}](mailto:${profile.email || "sahilraut200619@gmail.com"}) for collaboration, projects, or anything else 🙃`,
            "",
          );
        } else if (templateId === "anime-tokyo-ghoul" || templateId === "anime-gaming" || templateId === "cyberpunk") {
          // Mohabbat / Tokyo Ghoul reference: Kaneki splatter dark banner + social badges
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=slice&color=0:1e1b4b,50:4c0519,100:09090b&height=220&section=header&text=✦+Hi%2C+I'm+${encodeURIComponent(
              name,
            )}!+✦&fontSize=42&fontColor=ffffff&desc=⚔️+${encodeURIComponent(headline)}&descAlignY=64" width="100%" alt="Tokyo Ghoul Banner" />`,
            `</div>`,
            "",
            `<p align="center">`,
            `  <a href="https://discord.com"><img src="https://img.shields.io/badge/DISCORD-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a>&nbsp;`,
            `  <a href="https://linkedin.com"><img src="https://img.shields.io/badge/LINKEDIN-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" /></a>&nbsp;`,
            `  <a href="https://twitter.com"><img src="https://img.shields.io/badge/TWITTER-1DA1F2?style=for-the-badge&logo=x&logoColor=white" /></a>`,
            `</p>`,
            "",
          );
        } else if (templateId === "midnight-shady" || templateId === "minimal-aesthetic" || templateId === "minimal") {
          // Midnight Shady reference: Creation of Adam browser window + centered text
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:09090b,50:18181b,100:09090b&height=180&section=header&text=✦+Creation+of+Code+✦&fontSize=32&fontColor=71717a&desc=Connecting+the+Digital+Consciousness&descAlignY=65" width="100%" alt="Creation of Adam Header" />`,
            `</div>`,
            "",
            `<h2 align="center">Hi 👋, Imma ${name}</h2>`,
            `<p align="center"><b>${profile.currentRole || "Backend Developer"}</b></p>`,
            `<p align="center"><code>${profile.currentWork || "Building reliable backend systems with clean architecture and scalable solutions."}</code></p>`,
            "",
            `---`,
            "",
          );
        } else if (templateId === "joshua-lofi-city" || templateId === "student" || templateId === "creative") {
          // Joshua Thadi reference: Lo-Fi rooftop cityscape banner with terminal poem & Namaste
          lines.push(
            `<div align="center">`,
            `  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:18181b,50:27272a,100:09090b&height=200&section=header&text=Namaste+🙏+I'm+${encodeURIComponent(name)}&fontSize=38&fontAlignY=42&desc=${encodeURIComponent(headline)}&descAlignY=68" width="100%" alt="Lo-Fi Cityscape Header" />`,
            `</div>`,
            "",
            `> **Heaven on earth. Nature's masterpiece!** Serenity in every view...  `,
            `> \`Life = love; for(life in love): print(alive) else: print(!live)\``,
            "",
          );
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

        // Visitor counter & Follower badges row (unless minimal aesthetic)
        if (templateId !== "minimal-aesthetic") {
          lines.push(
            `<p align="center">`,
            `  <img src="https://komarev.com/ghpvc/?username=${githubUser}&label=PROFILE+VIEWS&color=0e75b6&style=flat-square" alt="Profile Views" />`,
            `  <img src="https://img.shields.io/github/followers/${githubUser}?label=Followers&style=flat-square&color=238636" alt="Followers" />`,
            `</p>`,
            "",
          );
        }

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

        const facts: string[] = [];
        if (profile.currentRole) facts.push(`- 💼 **Current Role:** ${profile.currentRole}`);
        if (profile.currentWork) facts.push(`- 🚀 **Building now:** ${profile.currentWork}`);
        if (profile.learning) facts.push(`- 🌱 **Currently learning:** ${profile.learning}`);
        if (profile.askMeAbout) facts.push(`- 💬 **Ask me about:** ${profile.askMeAbout}`);
        if (profile.location) facts.push(`- 📍 **Location:** ${profile.location}`);
        if (profile.funFact) facts.push(`- ⚡ **Fun fact:** ${profile.funFact}`);
        if (profile.email) facts.push(`- 📫 **Reach me at:** [${profile.email}](mailto:${profile.email})`);

        // Check for companion illustrations / mascots (Anime / Minimal Astronaut / Dev at desk)
        const hasCompanionMascot =
          templateId === "anime-tokyo-ghoul" ||
          templateId === "anime-gaming" ||
          templateId === "midnight-shady" ||
          templateId === "minimal-aesthetic" ||
          templateId === "joshua-lofi-city" ||
          templateId === "student" ||
          templateId === "creative";

        const companionImgUrl =
          doc.gifUrl ||
          (templateId === "anime-tokyo-ghoul" || templateId === "anime-gaming"
            ? "https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif"
            : templateId === "midnight-shady" || templateId === "minimal-aesthetic"
            ? "https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif"
            : "https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif");

        if (templateId === "hugo-starry-cyber" || templateId === "modern-dashboard") {
          lines.push(
            profile.bio || "I'm in my final semester of Information Systems, and I love turning technology into income.",
            "",
            `- 🚀 **Building now:** ${profile.currentWork || "Fluxo, my own app currently in development"}`,
            `- 🎯 **Goal:** ${profile.learning || "to move abroad and work in Cybersecurity"}`,
            `- 💛 **Open to:** ${profile.askMeAbout || "internships & freelance work"}`,
            `- 💬 **Any questions?** ${profile.funFact || "Feel free to reach out!"}`,
            "",
          );
        } else if (templateId === "sahil-dev-stack" || templateId === "developer-tech-stack") {
          lines.push(
            `- 🔭 **I'm Open To Work**`,
            `- 🌱 **I'm currently learning:** ${profile.learning || "Backend Development (Node.js / Express)"}`,
            `- 📫 **How to reach me:** [${profile.email || "sahilraut200619@gmail.com"}](mailto:${profile.email || "sahilraut200619@gmail.com"})`,
            `- ⚡ **Pronouns:** He/Him`,
            `- 🐛 **Fun fact:** ${profile.funFact || "99 little bugs in the code, take one down, patch it around, 127 little bugs in the code 🐛"}`,
            "",
          );
        } else if (hasCompanionMascot) {
          const bioContent = [
            profile.bio ? `<p>${profile.bio}</p>` : "",
            facts.length > 0 ? `<ul>${facts.map((f) => `<li>${f.replace(/^- /, "")}</li>`).join("")}</ul>` : "",
          ].join("\n");

          lines.push(
            `<table>`,
            `  <tr>`,
            `    <td valign="top" width="68%">`,
            `      ${bioContent}`,
            `    </td>`,
            `    <td align="center" valign="middle" width="32%">`,
            `      <img src="${companionImgUrl}" width="160" alt="Companion Illustration" />`,
            `    </td>`,
            `  </tr>`,
            `</table>`,
            "",
          );
        } else {
          if (profile.bio) lines.push(profile.bio, "");
          if (facts.length > 0) lines.push(...facts, "");
        }
        break;
      }

      // ---------------------------------------------
      // SKILLS & TECH STACK
      // ---------------------------------------------
      case "skills": {
        lines.push(`### 💻 ${sec.title || "Tech Stack"}`);

        const useSkillIcons =
          templateId === "anime-tokyo-ghoul" ||
          templateId === "anime-gaming" ||
          templateId === "midnight-shady" ||
          templateId === "minimal-aesthetic" ||
          templateId === "joshua-lofi-city" ||
          templateId === "student";

        if (useSkillIcons) {
          const iconTheme = templateId === "minimal-aesthetic" || templateId === "midnight-shady" ? "dark" : "dark";
          const iconsUrl = renderSkillIconsUrl(skills, iconTheme, 12);
          lines.push(
            `<p align="center">`,
            `  <a href="https://skillicons.dev">`,
            `    <img src="${iconsUrl}" alt="Tech Stack Icons" />`,
            `  </a>`,
            `</p>`,
            "",
          );
        } else if (skills.length > 0) {
          // Categorized / dense shields as in Sahil Raut reference
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
      // SOCIAL LINKS / CONTACTS
      // ---------------------------------------------
      case "socials": {
        if (socialLinks.length > 0) {
          lines.push(`### 🌐 ${sec.title || "Socials & Connect"}`, '<p align="left">');
          socialLinks.forEach((s) => {
            const platformLower = s.platform.toLowerCase();
            let color = "0A66C2";
            if (platformLower.includes("insta")) color = "E4405F";
            else if (platformLower.includes("gmail") || platformLower.includes("mail")) color = "D14836";
            else if (platformLower.includes("discord")) color = "5865F2";
            else if (platformLower.includes("whatsapp")) color = "25D366";
            else if (platformLower.includes("twitter") || platformLower.includes("x")) color = "1DA1F2";
            else if (platformLower.includes("github")) color = "181717";

            lines.push(
              `  <a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/${encodeURIComponent(
                s.platform.toUpperCase(),
              )}-${color}?style=${badgeStyle}&logo=${encodeURIComponent(
                platformLower,
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
        lines.push(`### 📊 ${sec.title || "GitHub Analytics"}`);

        if (templateId === "hugo-starry-cyber" || templateId === "modern-dashboard") {
          // Inspired by Hugo Yannt: Language Donut + GitHub Stats + 4-Metric table
          lines.push(
            `<p align="center">`,
            `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=donut&theme=${statsTheme}&hide_border=false" height="185" alt="Radar de linguagens" />`,
            `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=false" height="185" alt="Principais linguagens" />`,
            `</p>`,
            "",
            `<table width="100%">`,
            `  <tr>`,
            `    <td align="center" width="25%"><b>Repositórios</b><br/><code>12 Active</code></td>`,
            `    <td align="center" width="25%"><b>Commits no último ano</b><br/><code>450+</code></td>`,
            `    <td align="center" width="25%"><b>Pull requests</b><br/><code>28</code></td>`,
            `    <td align="center" width="25%"><b>Estrelas recebidas</b><br/><code>15+</code></td>`,
            `  </tr>`,
            `</table>`,
            "",
          );
        } else if (templateId === "anime-tokyo-ghoul") {
          lines.push(
            `<p align="center">`,
            `  <img src="https://komarev.com/ghpvc/?username=${githubUser}&label=PROFILE+VIEWS&color=ec4899&style=for-the-badge" alt="Profile Views" />`,
            `</p>`,
            "",
            `<p align="center">`,
            `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=tokyonight&hide_border=true" height="165" alt="Mohabbat Stats" />`,
            `  <img src="https://streak-stats.demolab.com/?user=${githubUser}&theme=tokyonight&hide_border=true" height="165" alt="Streak Stats" />`,
            `</p>`,
            "",
            `### 📅 3D Contribution Calendar`,
            `<p align="center">`,
            `  <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${githubUser}&theme=tokyonight" width="95%" alt="Isometric 3D Calendar" />`,
            `</p>`,
            "",
          );
        } else if (templateId === "midnight-shady") {
          lines.push(
            `<p align="center">`,
            `  <img src="https://streak-stats.demolab.com/?user=${githubUser}&theme=github_dark&hide_border=true" height="175" alt="Streak & Contributions" />`,
            `</p>`,
            "",
          );
        } else {
          lines.push(
            `<p align="center">`,
            `  <img src="https://github-readme-stats.vercel.app/api?username=${githubUser}&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" height="165" alt="GitHub Stats" />`,
            `  <img src="https://streak-stats.demolab.com/?user=${githubUser}&theme=${statsTheme}&hide_border=true" height="165" alt="GitHub Streak" />`,
            `</p>`,
            "",
          );
        }
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
        if (templateId !== "modern-dashboard") {
          lines.push(
            `### 📈 ${sec.title || "Most Used Languages"}`,
            `<p align="center">`,
            `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUser}&layout=compact&theme=${statsTheme}&hide_border=true" height="165" alt="Top Languages" />`,
            `</p>`,
            "",
          );
        }
        break;
      }

      // ---------------------------------------------
      // CONTRIBUTION GRAPH
      // ---------------------------------------------
      case "graph": {
        lines.push(
          `### 📅 ${sec.title || "Contribution Graph"}`,
          `<div align="center">`,
          `  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubUser}&theme=${
            templateId === "minimal-aesthetic" ? "github-compact" : "tokyo-night"
          }&hide_border=true" width="95%" alt="Activity Graph" />`,
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
      // ACHIEVEMENTS / OPEN SOURCE CONTRIBUTIONS
      // ---------------------------------------------
      case "achievements": {
        lines.push(`### 🌟 ${sec.title || "Achievements & Open Source"}`);
        if (achievements.length > 0) {
          achievements.forEach((ach) => lines.push(`- 🏅 ${ach}`));
        } else {
          lines.push(
            `- 🏅 **Hacktoberfest Super Contributor** — Completed challenges and earned Super Contributor rank`,
            `- 🛠️ **Open Source Bug Fixes** — Contributed to popular open-source repositories and verified test coverage`,
            `- 🏅 **GitHub Arctic Code Vault Contributor**`,
          );
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
          `### 📬 ${sec.title || "Contacts"}`,
          `<p align="center">`,
          `  <a href="mailto:${profile.email || "hello@example.com"}"><img src="https://img.shields.io/badge/GMAIL-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a>`,
          profile.portfolioUrl
            ? `  <a href="${profile.portfolioUrl}" target="_blank"><img src="https://img.shields.io/badge/PORTFOLIO-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>`
            : "",
          `  <a href="https://github.com/${githubUser}" target="_blank"><img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=github&logoColor=white" /></a>`,
          `</p>`,
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
    }
  });

  // Footer banners for creative / aesthetic templates
  if (templateId === "hugo-starry-cyber" || templateId === "modern-dashboard") {
    lines.push(
      `### 💬 Contacts`,
      `<p align="center">`,
      `  <a href="https://instagram.com" target="_blank"><img src="https://img.shields.io/badge/INSTAGRAM-000000?style=for-the-badge&logo=instagram&logoColor=00E5FF" /></a>&nbsp;`,
      `  <a href="mailto:${profile.email || "dev@example.com"}"><img src="https://img.shields.io/badge/GMAIL-000000?style=for-the-badge&logo=gmail&logoColor=00E5FF" /></a>&nbsp;`,
      `  <a href="https://linkedin.com" target="_blank"><img src="https://img.shields.io/badge/LINKEDIN-000000?style=for-the-badge&logo=linkedin&logoColor=00E5FF" /></a>&nbsp;`,
      `  <a href="https://whatsapp.com" target="_blank"><img src="https://img.shields.io/badge/WHATSAPP-000000?style=for-the-badge&logo=whatsapp&logoColor=00E5FF" /></a>&nbsp;`,
      `  <a href="https://discord.com" target="_blank"><img src="https://img.shields.io/badge/DISCORD-000000?style=for-the-badge&logo=discord&logoColor=00E5FF" /></a>`,
      `</p>`,
      "",
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=slice&color=0:00e5ff,50:090d16,100:00e5ff&height=180&section=footer&text=愛&fontSize=70&fontColor=00e5ff&desc=✦+Passionate+Engineering+•+Cybersecurity+•+Aesthetics+✦&descAlignY=72" width="100%" alt="Kanji Love Art" />`,
      `</div>`,
      "",
    );
  } else if (templateId === "joshua-lofi-city" || templateId === "student" || templateId === "creative") {
    lines.push(
      `### ☕ Support Me`,
      `<p align="center">`,
      `  <a href="https://www.buymeacoffee.com" target="_blank"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" /></a>`,
      `</p>`,
      "",
      `<div align="center">`,
      `  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:064e3b,50:047857,100:064e3b&height=100&section=footer&text=⛩️+Aesthetic+Torii+Shrine+•+Peaceful+Coding+⛩️&fontSize=18&fontColor=a7f3d0" width="100%" alt="Footer Banner" />`,
      `</div>`,
      "",
    );
  } else if (templateId === "anime-tokyo-ghoul") {
    lines.push(
      `<p align="center">`,
      `  Made with 🖤 by <a href="https://github.com/${githubUser}">${name}</a>`,
      `</p>`,
      "",
    );
  }

  return lines.join("\n").trim() + "\n";
}
export default compileReadmeToMarkdown;
