import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Ensure global React is defined for standalone JSX runtime
(globalThis as any).React = React;

import {
  TEMPLATE_METADATA,
  TEMPLATE_REGISTRY,
  VALID_TEMPLATE_IDS,
  getPortfolioTemplate,
} from "../src/components/portfolios/templates/registry";
import { PortfolioRenderer } from "../src/components/portfolios/PortfolioRenderer";
import type { Portfolio } from "../src/types/portfolio";

const SAMPLE_PORTFOLIO: Partial<Portfolio> = {
  title: "Jane Doe Portfolio",
  slug: "jane-doe",
  status: "published",
  profile: {
    fullName: "Jane Doe",
    headline: "Staff Cloud & Frontend Engineer",
    bio: "Passionate engineer with 10+ years architecting scalable cloud and interactive 3D web systems.",
    email: "jane@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/janedoe" },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
    { platform: "twitter", label: "Twitter", url: "https://twitter.com/janedoe" },
  ],
  skills: [
    { name: "TypeScript", category: "Languages", level: "expert" },
    { name: "React", category: "Frontend", level: "expert" },
    { name: "Three.js", category: "Creative", level: "advanced" },
    { name: "Node.js", category: "Backend", level: "advanced" },
    { name: "Kubernetes", category: "DevOps", level: "intermediate" },
  ],
  experience: [
    {
      title: "Lead Systems Architect",
      company: "Acme Cloud Corp",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description: "Spearheaded distributed microservices and multi-tenant cloud portfolio infrastructure.",
      highlights: [
        "Reduced p99 latency by 42% across global edge clusters.",
        "Engineered real-time collaboration pipeline serving 2M daily active users.",
      ],
    },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Human-Computer Interaction",
      startDate: "2014",
      endDate: "2018",
      grade: "3.9 GPA",
    },
  ],
  projects: [
    {
      title: "HyperScale Kubernetes Engine",
      description: "Autonomous autoscaling mesh controller for dynamic multi-cloud container orchestration.",
      tags: ["Go", "Kubernetes", "eBPF", "Prometheus"],
      liveUrl: "https://hyperscale.dev",
      repoUrl: "https://github.com/janedoe/hyperscale",
      featured: true,
    },
    {
      title: "Interactive WebGL Shader Lab",
      description: "Real-time GPU fragment shader synthesizer and audio-reactive visualization suite.",
      tags: ["WebGL", "Three.js", "GLSL", "WebAudio"],
      liveUrl: "https://shaderlab.dev",
      repoUrl: "https://github.com/janedoe/shader-lab",
      featured: true,
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect — Professional",
      issuer: "Amazon Web Services",
      issueDate: "2024",
      url: "https://aws.amazon.com/certification",
    },
  ],
  design: {
    template: "devport",
    theme: "dark",
    primaryColor: "#2563eb",
    fontFamily: "Inter",
  },
};

const EMPTY_PORTFOLIO: Partial<Portfolio> = {
  profile: { fullName: "" },
  projects: [],
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  socialLinks: [],
};

async function runVerification() {
  console.log("==================================================================");
  console.log("       Complete 20-Template Multi-Architecture Test Suite         ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  // 1. Verify Metadata Registry Integrity
  console.log("\n[1/4] Auditing Template Registry & Metadata Contract...");
  assert.equal(
    TEMPLATE_METADATA.length,
    20,
    `Expected 20 template metadata entries, found ${TEMPLATE_METADATA.length}`
  );

  for (const meta of TEMPLATE_METADATA) {
    assert.ok(meta.id, "Template missing ID");
    assert.ok(meta.name, `Template ${meta.id} missing name`);
    assert.ok(meta.description, `Template ${meta.id} missing description`);
    assert.ok(meta.idealFor, `Template ${meta.id} missing idealFor`);
    assert.ok(meta.category, `Template ${meta.id} missing category`);
    assert.ok(Array.isArray(meta.features) && meta.features.length >= 2, `Template ${meta.id} missing features`);
    assert.ok(TEMPLATE_REGISTRY[meta.id], `Template ${meta.id} not registered in TEMPLATE_REGISTRY`);
  }
  console.log("  ✅ All 20 templates have complete, type-safe metadata and features.");
  passed++;

  // 2. Verify Rendering with Full Sample Data
  console.log("\n[2/4] Verifying Full Data Rendering for all 20 Templates...");
  for (const meta of TEMPLATE_METADATA) {
    try {
      const Component = TEMPLATE_REGISTRY[meta.id];
      const portfolioForTemplate: Partial<Portfolio> = {
        ...SAMPLE_PORTFOLIO,
        design: {
          ...SAMPLE_PORTFOLIO.design!,
          template: meta.id,
        },
      };

      const html = renderToStaticMarkup(
        React.createElement(Component, {
          portfolio: portfolioForTemplate,
          showEmpty: true,
          sectionOrder: ["hero", "projects", "skills", "experience", "education", "certifications"],
          hiddenSections: [],
        })
      );

      assert.ok(html.length > 500, `Template ${meta.id} generated insufficient markup (${html.length} chars)`);
      assert.ok(html.includes("Jane Doe"), `Template ${meta.id} failed to render candidate name`);
      console.log(`  ✅ [${meta.id}] Rendered successfully (${html.length} bytes markup)`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [${meta.id}] Render error:`, err);
      failed++;
    }
  }

  // 3. Verify Edge-Case / Empty Data Rendering
  console.log("\n[3/4] Verifying Graceful Empty Data Resilience (showEmpty = false)...");
  for (const meta of TEMPLATE_METADATA) {
    try {
      const Component = TEMPLATE_REGISTRY[meta.id];
      const html = renderToStaticMarkup(
        React.createElement(Component, {
          portfolio: EMPTY_PORTFOLIO,
          showEmpty: false,
          sectionOrder: ["projects", "skills", "experience", "education", "certifications"],
          hiddenSections: [],
        })
      );

      assert.ok(typeof html === "string" && html.length > 50, `Template ${meta.id} failed empty render`);
      console.log(`  ✅ [${meta.id}] Graceful empty render handled without crash`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [${meta.id}] Empty render crash:`, err);
      failed++;
    }
  }

  // 4. Verify Dispatcher, Hidden Sections, & Safe Fallback
  console.log("\n[4/4] Verifying PortfolioRenderer Dispatcher, Hidden Sections & Fallbacks...");

  // Hidden sections test
  const hiddenTestHtml = renderToStaticMarkup(
    React.createElement(PortfolioRenderer, {
      portfolio: {
        ...SAMPLE_PORTFOLIO,
        design: {
          template: "ramen-shop",
          theme: "dark",
        },
      },
      hiddenSections: ["education", "certifications"],
    })
  );
  assert.ok(!hiddenTestHtml.includes("Stanford University"), "Hidden section (education) was rendered");
  console.log("  ✅ Hidden sections filtering confirmed.");
  passed++;

  // Unknown template fallback test
  const fallbackComponent = getPortfolioTemplate("non-existent-template-xyz");
  const fallbackHtml = renderToStaticMarkup(
    React.createElement(fallbackComponent, {
      portfolio: SAMPLE_PORTFOLIO,
    })
  );
  assert.ok(fallbackHtml.includes("Jane Doe"), "Fallback template failed to render");
  console.log("  ✅ Unknown template securely falls back to DevPortTemplate default.");
  passed++;

  console.log("\n==================================================================");
  console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) process.exit(1);
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
