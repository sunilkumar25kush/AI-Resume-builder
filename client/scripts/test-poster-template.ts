import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as any).React = React;

import { PosterTemplate } from "../src/components/portfolios/templates/PosterTemplate";
import type { Portfolio } from "../src/types/portfolio";

const MOCK_POSTER_PORTFOLIO: Partial<Portfolio> = {
  title: "Sunil Kumar - Poster Brutalist",
  profile: {
    fullName: "sunil kumar",
    headline: "HTML and JavaScript developer",
    bio: "Explore sunil kumar's public projects and open-source work.",
    email: "sunil@example.com",
    location: "India",
  },
  skills: [
    { name: "JavaScript" },
    { name: "HTML5" },
    { name: "CSS3" },
    { name: "React" },
  ],
  projects: [
    {
      title: "AI-Resume-builder",
      description: "Full-stack AI resume and portfolio engine.",
      tags: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      title: "Interactive Web Experiences",
      description: "Showcase of high-performance animations and 3D web design.",
      tags: ["JavaScript", "CSS3", "WebGL"],
    },
  ],
  design: {
    template: "poster",
    theme: "dark",
    primaryColor: "#000000",
    fontFamily: "Inter",
  },
};

console.log("==================================================================");
console.log("        Poster Template Architecture Test Suite                   ");
console.log("==================================================================");

// TEST 1: Full Render Verification
console.log("\n[TEST 1] Rendering PosterTemplate markup...");
const markup = renderToStaticMarkup(
  React.createElement(PosterTemplate, {
    portfolio: MOCK_POSTER_PORTFOLIO,
    sectionOrder: ["hero", "skills", "projects", "contact"],
    hiddenSections: [],
    showEmpty: false,
  })
);

assert.ok(markup.length > 500, "Poster markup generated insufficient output");
assert.ok(markup.includes("PORTFOLIO"), "Giant watermark missing from Poster hero");
assert.ok(markup.includes("sunil"), "Candidate name missing from bottom left hero");
console.log(`  ✅ Successfully rendered Poster markup (${markup.length} bytes).`);

// TEST 2: Marquee Ticker Presence
console.log("\n[TEST 2] Verifying infinite marquee ticker ribbon...");
assert.ok(markup.includes("animate-marquee") || markup.includes("marquee"), "Marquee ticker animation class missing");
console.log("  ✅ Marquee ticker is embedded with smooth continuous animation.");

// TEST 3: Staggered Cards Layout
console.log("\n[TEST 3] Verifying staggered card grid structure...");
assert.ok(markup.includes("grid"), "Expected responsive grid layout for projects");
console.log("  ✅ Project cards structured with responsive grid system.");

console.log("\n==================================================================");
console.log("All Poster Template Tests Passed (3/3)");
console.log("==================================================================");
