import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as any).React = React;

import { SpotlightTemplate } from "../src/components/portfolios/templates/SpotlightTemplate";
import type { Portfolio } from "../src/types/portfolio";

const MOCK_PORTFOLIO: Partial<Portfolio> = {
  title: "Sunil Kumar - Portfolio",
  profile: {
    fullName: "sunil kumar",
    headline: "HTML and JavaScript developer",
    bio: "Explore sunil kumar's public projects and open-source work.",
    email: "sunil@example.com",
    location: "India",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/sunilkumar25kush" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sunil-kumar-9042aa373/?isSelfProfile=true" },
  ],
  skills: [
    { name: "JavaScript", category: "Frontend" },
    { name: "HTML5", category: "Frontend" },
    { name: "CSS3", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Docker", category: "Tooling & infra" },
  ],
  experience: [],
  education: [],
  projects: [
    {
      title: "AI-Resume-builder",
      description: "Full-stack AI resume and portfolio builder.",
      tags: ["React", "TypeScript"],
      featured: true,
    },
  ],
  design: {
    template: "spotlight",
    theme: "light",
    primaryColor: "#e3141f",
    fontFamily: "Inter",
  },
};

console.log("==================================================================");
console.log("       Spotlight Template Architecture Test Suite                ");
console.log("==================================================================");

// TEST 1: Full Render Verification
console.log("\n[TEST 1] Rendering SpotlightTemplate markup...");
const markup = renderToStaticMarkup(
  React.createElement(SpotlightTemplate, {
    portfolio: MOCK_PORTFOLIO,
    sectionOrder: ["hero", "about", "skills", "projects", "contact"],
    hiddenSections: [],
    showEmpty: false,
  })
);

assert.ok(markup.length > 500, "Spotlight markup generated insufficient output");
assert.ok(markup.includes("sunil"), "Candidate name missing from Spotlight hero");
assert.ok(markup.includes("HTML and JavaScript"), "Candidate headline missing from hero");
console.log(`  ✅ Successfully rendered Spotlight markup (${markup.length} bytes).`);

// TEST 2: LinkedIn Opportunity Card Verification
console.log("\n[TEST 2] Verifying contact section renders LinkedIn profile link...");
assert.ok(markup.includes("linkedin.com/in/sunil-kumar-9042aa373"), "Expected LinkedIn link missing");
console.log("  ✅ Contact section contains direct LinkedIn CTA.");

// TEST 3: Wave Curve Smooth Blend Background
assert.ok(
  markup.includes('fill="#f6f5f3"') || markup.includes('fill="#ffffff"'),
  "Expected seamless paper wave fill",
);
console.log("  ✅ Bottom hero curve wave fill is aligned to paper background.");

console.log("\n==================================================================");
console.log("All Spotlight Template Tests Passed (3/3)");
console.log("==================================================================");
