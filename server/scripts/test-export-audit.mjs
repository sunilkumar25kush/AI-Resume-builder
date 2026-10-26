import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { exportPortfolioAsStaticZip, exportPortfolioAsSourceZip } from '../src/services/portfolioExport.service.js';

function createMockResponse() {
  const chunks = [];
  return {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    write(chunk) { chunks.push(Buffer.from(chunk)); return true; },
    end(chunk) {
      if (chunk) chunks.push(Buffer.from(chunk));
      this.finished = true;
      this.buffer = Buffer.concat(chunks);
      if (this.onFinish) this.onFinish(this.buffer);
    },
    on(event, cb) { if (event === 'finish') this.onFinish = cb; },
    once() {},
    emit() {},
  };
}

function extractZip(buf, destDir) {
  let offset = 0;
  fs.mkdirSync(destDir, { recursive: true });

  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) === 0x02014b50) {
      const compMethod = buf.readUInt16LE(offset + 10);
      const compSize = buf.readUInt32LE(offset + 20);
      const uncompSize = buf.readUInt32LE(offset + 24);
      const nameLen = buf.readUInt16LE(offset + 28);
      const extraLen = buf.readUInt16LE(offset + 30);
      const commentLen = buf.readUInt16LE(offset + 32);
      const localOff = buf.readUInt32LE(offset + 42);
      const filename = buf.toString('utf8', offset + 46, offset + 46 + nameLen);

      const localNameLen = buf.readUInt16LE(localOff + 26);
      const localExtraLen = buf.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + localNameLen + localExtraLen;
      const compData = buf.subarray(dataStart, dataStart + compSize);

      let fileData;
      if (compMethod === 8) {
        fileData = zlib.inflateRawSync(compData);
      } else {
        fileData = compData;
      }

      const outPath = path.join(destDir, filename);
      if (filename.endsWith('/')) {
        fs.mkdirSync(outPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, fileData);
      }

      offset += 46 + nameLen + extraLen + commentLen;
    } else {
      offset++;
    }
  }
}

const templates = ['spotlight', 'poster', 'devport', 'creative', 'developer', 'minimal'];
const testBaseDir = path.resolve(process.cwd(), 'scratch', 'export_audit');

console.log('Auditing Exported Packages across all templates...');

for (const tmpl of templates) {
  const samplePortfolio = {
    title: `Sunil Kumar - ${tmpl} Portfolio`,
    slug: `sunil-kumar-${tmpl}`,
    profile: {
      fullName: "Sunil Kumar",
      headline: "Full Stack Developer | MERN Stack & AI Solutions",
      bio: "Crafting scalable distributed systems and engaging user interfaces for modern web platforms.",
      email: "sunil@example.com",
      phone: "+91 9876543210",
      location: "Delhi, India",
      avatarUrl: "http://localhost:5000/uploads/avatars/1791753230657-932666433.png",
    },
    socialLinks: [
      { platform: "github", label: "GitHub", url: "https://github.com/sunilkumar25kush" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/sunil-kumar" },
    ],
    skills: [
      { name: "JavaScript", category: "Languages" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "CSS", category: "Styling" },
      { name: "TypeScript", category: "Languages" },
    ],
    projects: [
      {
        title: "AI Resume Builder",
        description: "Intelligent career documents and portfolio generator.",
        tags: ["React", "TypeScript", "TailwindCSS"],
        repoUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
        liveUrl: "https://airesume.demo",
        imageUrl: "http://localhost:5000/uploads/avatars/1791753230657-932666433.png",
      },
      {
        title: "Note Project",
        description: "Collaborative markdown notes app with real-time sync.",
        tags: ["JavaScript", "HTML"],
        repoUrl: "https://github.com/sunilkumar25kush/NOTE-PROJECT",
        liveUrl: "https://notes.demo",
      }
    ],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        startDate: "2023",
        endDate: "Present",
        current: true,
        description: "Building production web applications.",
        highlights: ["Engineered scalable APIs", "Improved frontend performance"],
      }
    ],
    education: [
      {
        degree: "Diploma in Software Engineering",
        institution: "NavGurukul",
        startDate: "2022",
        endDate: "2024",
      }
    ],
    certifications: [
      {
        name: "Full Stack Specialization",
        issuer: "Coursera",
        issueDate: "2023",
      }
    ],
    design: {
      template: tmpl,
      theme: "dark",
      primaryColor: tmpl === 'spotlight' ? '#e3141f' : tmpl === 'poster' ? '#e11d2a' : '#06b6d4',
      fontFamily: "Inter",
    },
    publication: {
      seoTitle: `Sunil Kumar - ${tmpl} Portfolio`,
      seoDescription: "Explore my projects and technical expertise.",
    }
  };

  // 1. Static ZIP
  const staticRes = createMockResponse();
  await exportPortfolioAsStaticZip(samplePortfolio, staticRes);
  await new Promise(r => setTimeout(r, 100));

  const staticDir = path.join(testBaseDir, tmpl, 'static');
  extractZip(staticRes.buffer, staticDir);

  const staticFiles = fs.readdirSync(staticDir, { recursive: true });
  console.log(`[${tmpl.toUpperCase()} STATIC] Extracted ${staticFiles.length} files:`, staticFiles);

  // Check index.html in static
  const indexHtml = fs.readFileSync(path.join(staticDir, 'index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(staticDir, 'assets', 'style.css'), 'utf8');

  // Audit checks
  const checks = {
    hasGoogleFonts: indexHtml.includes('fonts.googleapis.com'),
    hasNewsreaderInFonts: indexHtml.includes('Newsreader'),
    hasStyleCssLink: indexHtml.includes('href="assets/style.css"'),
    hasScriptJsLink: indexHtml.includes('src="assets/script.js"'),
    avatarBundled: staticFiles.some(f => f.includes('avatar')),
    projectImgBundled: staticFiles.some(f => f.includes('project-1')),
    noLocalhostInHtml: !indexHtml.includes('localhost:5000'),
    noHardcodedLinkedIn: !indexHtml.includes('sunil-kumar-9042aa373'),
    heroSectionCount: (indexHtml.match(/class="[^"]*spotlight-hero/g) || []).length,
    hasBgEffectCss: styleCss.includes('.static-bg-effect'),
    rendersProjectImg: indexHtml.includes('assets/images/project-1') || indexHtml.includes('class="proj-img"') || indexHtml.includes('class="spotlight-proj-thumb"') || indexHtml.includes('class="poster-proj-img"'),
  };
  console.log(`[${tmpl.toUpperCase()} STATIC CHECKS]:`, checks);

  // 2. React Source ZIP
  const sourceRes = createMockResponse();
  await exportPortfolioAsSourceZip(samplePortfolio, sourceRes);
  await new Promise(r => setTimeout(r, 100));

  const sourceDir = path.join(testBaseDir, tmpl, 'source');
  extractZip(sourceRes.buffer, sourceDir);
  const sourceFiles = fs.readdirSync(sourceDir, { recursive: true });
  const sourceIndexHtml = fs.readFileSync(path.join(sourceDir, 'index.html'), 'utf8');
  const sourceViteConfig = fs.readFileSync(path.join(sourceDir, 'vite.config.js'), 'utf8');
  const sourceChecks = {
    hasRelativeScript: sourceIndexHtml.includes('src="./src/main.jsx"'),
    hasRelativeBase: sourceViteConfig.includes('base: "./"'),
    hasNewsreaderInFonts: sourceIndexHtml.includes('Newsreader'),
  };
  console.log(`[${tmpl.toUpperCase()} SOURCE] Extracted ${sourceFiles.length} files. Checks:`, sourceChecks);
}

console.log('Export audit complete!');
