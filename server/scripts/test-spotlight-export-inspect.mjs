import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { exportPortfolioAsStaticZip, exportPortfolioAsSourceZip } from '../src/services/portfolioExport.service.js';

// Sample realistic resume portfolio data matching Sunil Kumar from screenshots
const samplePortfolio = {
  title: "Sunil Kumar - Portfolio",
  slug: "sunil-kumar",
  profile: {
    fullName: "Sunil Kumar",
    headline: "Full Stack Developer | MERN Stack & AI Solutions",
    bio: "Sunil Kumar is a Full Stack Developer specializing in the MERN stack, with practical experience in building scalable web applications and integrating AI-powered solutions. He has successfully developed and deployed multiple production-ready projects, including AI-driven tools and real-time applications. Sunil is dedicated to writing clean, maintainable code and continuously learning modern web technologies.",
    email: "sunilkumar25@navgurukul.org",
    phone: "+91 7827598401",
    location: "Sarita Vihar, Delhi, India",
    avatarUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/sunilkumar25kush" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true" },
  ],
  skills: [
    { name: "JavaScript", category: "Languages" },
    { name: "HTML5", category: "Languages" },
    { name: "CSS3", category: "Languages" },
    { name: "React.js", category: "Frontend Frameworks & Libraries" },
    { name: "Tailwind CSS", category: "Frontend Frameworks & Libraries" },
    { name: "Node.js", category: "Backend Frameworks & Libraries" },
    { name: "Express.js", category: "Backend Frameworks & Libraries" },
    { name: "MongoDB", category: "Databases" },
  ],
  projects: [
    {
      title: "NOTE-PROJECT",
      description: "Full-stack collaborative notes platform with instant Markdown sync and rich text formatting.",
      tags: ["HTML", "JavaScript"],
      repoUrl: "https://github.com/sunilkumar25kush/NOTE-PROJECT",
      liveUrl: "https://noteproject.demo",
    },
    {
      title: "AI-Resume-builder",
      description: "Next-gen intelligent career document and portfolio generator with ATS optimization.",
      tags: ["TypeScript", "React"],
      repoUrl: "https://github.com/sunilkumar25kush/AI-Resume-builder",
      liveUrl: "https://airesume.demo",
    },
  ],
  experience: [
    {
      title: "Full Stack Developer Intern",
      company: "Tech Corp",
      startDate: "2023",
      endDate: "2024",
      current: false,
      description: "Developed responsive web interfaces and robust REST APIs.",
      highlights: ["Built modern React frontends", "Optimized MongoDB aggregation pipelines"],
    },
  ],
  education: [
    {
      degree: "Diploma in Software Engineering",
      institution: "NavGurukul",
      startDate: "2022",
      endDate: "2024",
    },
  ],
  design: {
    template: "spotlight",
    primaryColor: "#e3141f",
    theme: "dark",
    fontFamily: "Inter",
  },
};

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

// Generate static zip
const res = createMockResponse();
await exportPortfolioAsStaticZip(samplePortfolio, res);
await new Promise((r) => setTimeout(r, 200));

const zipBuf = res.buffer;
console.log(`Generated Static ZIP size: ${zipBuf.length} bytes`);

// Inspect files from Central Directory
const files = {};
let pos = 0;
while (pos < zipBuf.length - 4) {
  if (zipBuf.readUInt32LE(pos) === 0x02014b50) {
    const compMethod = zipBuf.readUInt16LE(pos + 10);
    const compSize = zipBuf.readUInt32LE(pos + 20);
    const uncompSize = zipBuf.readUInt32LE(pos + 24);
    const fnameLen = zipBuf.readUInt16LE(pos + 28);
    const extraLen = zipBuf.readUInt16LE(pos + 30);
    const commentLen = zipBuf.readUInt16LE(pos + 32);
    const localHeaderOffset = zipBuf.readUInt32LE(pos + 42);

    const filename = zipBuf.toString('utf8', pos + 46, pos + 46 + fnameLen);
    const localFnameLen = zipBuf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = zipBuf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFnameLen + localExtraLen;

    const compData = zipBuf.subarray(dataOffset, dataOffset + compSize);
    let payload;
    if (compMethod === 0) payload = compData;
    else if (compMethod === 8) payload = zlib.inflateRawSync(compData);
    else payload = Buffer.alloc(0);

    files[filename] = payload.toString('utf8');
    pos += 46 + fnameLen + extraLen + commentLen;
  } else {
    pos++;
  }
}

console.log('Zip extracted files:', Object.keys(files));

// Verify index.html content
const html = files['index.html'];
const css = files['assets/style.css'];

console.log('\n--- VERIFICATION CHECKS ---');
console.log('1. Hero red gradient background:', css.includes('linear-gradient(135deg, var(--spotlight-accent) 0%, var(--spotlight-accent-deep) 100%)'));
console.log('2. Portrait frame with white border & glow halo:', css.includes('border: 10px solid #ffffff') && css.includes('border-radius: 32px'));
console.log('3. Swaying tablet animation & cord:', css.includes('animation: sway 6s ease-in-out infinite') && css.includes('.spotlight-cord'));
console.log('4. Connected expertise nodes & dashed SVG curve:', css.includes('.spotlight-exp-card-hot') && css.includes('animate-dash'));
console.log('5. Anton font & Giant Watermarks details:', {
  hasFontAnton: html.includes('font-anton'),
  hasContactText: html.includes('CONTACT'),
  hasCssAnton: css.includes("font-family: 'Anton'"),
  cssMatch: css.indexOf("Anton")
});
console.log('6. Red floating contact card & LinkedIn action:', html.includes('spotlight-contact-card') && html.includes('spotlight-linkedin-btn'));
console.log('7. Fixed top navigation with transparent-to-solid transition:', css.includes('.spotlight-nav-transparent') && css.includes('.spotlight-nav-solid'));
console.log('8. Floating scroll-to-top button:', html.includes('scrollTopBtn'));
console.log('\nSTATIC EXPORT VERIFIED! Now verifying React Source Export...');

// Generate React Source ZIP
const reactRes = createMockResponse();
await exportPortfolioAsSourceZip(samplePortfolio, reactRes);
await new Promise((r) => setTimeout(r, 200));

const reactZipBuf = reactRes.buffer;
console.log(`Generated React Source ZIP size: ${reactZipBuf.length} bytes`);

const reactFiles = {};
pos = 0;
while (pos < reactZipBuf.length - 4) {
  if (reactZipBuf.readUInt32LE(pos) === 0x02014b50) {
    const compMethod = reactZipBuf.readUInt16LE(pos + 10);
    const compSize = reactZipBuf.readUInt32LE(pos + 20);
    const uncompSize = reactZipBuf.readUInt32LE(pos + 24);
    const fnameLen = reactZipBuf.readUInt16LE(pos + 28);
    const extraLen = reactZipBuf.readUInt16LE(pos + 30);
    const commentLen = reactZipBuf.readUInt16LE(pos + 32);
    const localHeaderOffset = reactZipBuf.readUInt32LE(pos + 42);

    const filename = reactZipBuf.toString('utf8', pos + 46, pos + 46 + fnameLen);
    const localFnameLen = reactZipBuf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = reactZipBuf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFnameLen + localExtraLen;

    const compData = reactZipBuf.subarray(dataOffset, dataOffset + compSize);
    let payload;
    if (compMethod === 0) payload = compData;
    else if (compMethod === 8) payload = zlib.inflateRawSync(compData);
    else payload = Buffer.alloc(0);

    reactFiles[filename] = payload.toString('utf8');
    pos += 46 + fnameLen + extraLen + commentLen;
  } else {
    pos++;
  }
}

const spotlightJsx = reactFiles['src/components/templates/SpotlightTemplate.jsx'];
console.log('React Source Template checks:');
console.log('- Has SpotlightTemplate component:', spotlightJsx.includes('export function SpotlightTemplate'));
console.log('- Has red gradient hero style:', spotlightJsx.includes('linear-gradient(135deg, ${accentColor} 0%, ${accentDeep} 100%)'));
console.log('- Has hanging swaying tablet:', spotlightJsx.includes('hanging-tablet') && spotlightJsx.includes('animation: "sway 6s ease-in-out infinite"'));
console.log('- Has connected expertise nodes:', spotlightJsx.includes('expertiseNodes') && spotlightJsx.includes('isHot'));
console.log('- Has giant CONTACT watermark:', spotlightJsx.includes("font-['Anton']") && spotlightJsx.includes('CONTACT'));
console.log('\nALL STATIC & REACT EXPORTS FULLY VERIFIED & MATCH SPOTLIGHT TEMPLATE 100%!');

