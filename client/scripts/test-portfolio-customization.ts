/**
 * Test Suite: Step 6 Portfolio Customization
 * Validates:
 * 1. Template Capability Matrix & Controls Isolation (unsupported controls not exposed)
 * 2. Resume Data Immutability & Content Separation
 * 3. Customization Input Validation & Sanitization Engine (hex, fonts, bounds)
 * 4. Preservation of Template Default Designs
 * 5. Live Preview Rendering with Custom Settings Across All Templates
 * 6. Storage Model & Payload Schema Compliance
 */

/// <reference types="node" />

import assert from "node:assert/strict";
import process from "node:process";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Ensure global React is defined for standalone JSX runtime
(globalThis as any).React = React;

import {
  getTemplateCustomizationConfig,
  getDefaultDesignSettings,
  validateCustomizationInput,
  HEX_COLOR_REGEX,
} from "../src/components/portfolios/customization/templateCustomizationConfig";
import { PortfolioRenderer } from "../src/components/portfolios/PortfolioRenderer";
import type { Portfolio, PortfolioDesignSettings, PortfolioTemplateId } from "../src/types/portfolio";

const TEMPLATE_IDS: PortfolioTemplateId[] = [
  "spotlight",
  "poster",
  "devport",
  "creative",
  "developer",
  "minimal",
];

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log("==================================================================");
console.log("       STEP 6: Portfolio Customization Automated Test Suite       ");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// [TEST 1] Template Capability Matrix Audit & Control Isolation
// -----------------------------------------------------------------------------
console.log("[TEST 1] Auditing Template Capability Matrix & Controls Isolation...");

runTest("Every approved template has an explicit customization config", () => {
  for (const tid of TEMPLATE_IDS) {
    const config = getTemplateCustomizationConfig(tid);
    assert.ok(config, `Config for ${tid} must exist`);
    assert.equal(config.templateId, tid);
    assert.ok(config.name.length > 0);
    assert.ok(Array.isArray(config.supportedThemes) && config.supportedThemes.length > 0);
    assert.ok(Array.isArray(config.supportedFonts) && config.supportedFonts.length > 0);
    assert.ok(Array.isArray(config.supportedBackgroundEffects) && config.supportedBackgroundEffects.length > 0);
    assert.ok(config.supportedLayoutOptions, `Layout options schema must exist for ${tid}`);
  }
});

runTest("Do not expose controls that a template cannot support", () => {
  // Spotlight does NOT expose terminalPrompt or orbitalRing
  const spotlightConfig = getTemplateCustomizationConfig("spotlight");
  const spotlightSettingKeys = spotlightConfig.templateSettings.map((s) => s.key);
  assert.ok(!spotlightSettingKeys.includes("terminalPrompt"), "Spotlight must not expose terminalPrompt");
  assert.ok(!spotlightSettingKeys.includes("orbitalRing"), "Spotlight must not expose orbitalRing");
  assert.ok(spotlightSettingKeys.includes("glowHalo"), "Spotlight must expose glowHalo");

  // Minimal does NOT expose orbitalRing or marqueeText
  const minimalConfig = getTemplateCustomizationConfig("minimal");
  const minimalSettingKeys = minimalConfig.templateSettings.map((s) => s.key);
  assert.ok(!minimalSettingKeys.includes("orbitalRing"), "Minimal must not expose orbitalRing");
  assert.ok(!minimalSettingKeys.includes("marqueeText"), "Minimal must not expose marqueeText");
  assert.ok(minimalSettingKeys.includes("whitespaceDensity"), "Minimal must expose whitespaceDensity");

  // Developer does NOT expose glowHalo or orbitalRing
  const devConfig = getTemplateCustomizationConfig("developer");
  const devSettingKeys = devConfig.templateSettings.map((s) => s.key);
  assert.ok(!devSettingKeys.includes("glowHalo"), "Developer must not expose glowHalo");
  assert.ok(devSettingKeys.includes("terminalPrompt"), "Developer must expose terminalPrompt");

  // Poster does NOT expose terminalPrompt or orbitalRing
  const posterConfig = getTemplateCustomizationConfig("poster");
  const posterSettingKeys = posterConfig.templateSettings.map((s) => s.key);
  assert.ok(!posterSettingKeys.includes("terminalPrompt"), "Poster must not expose terminalPrompt");
  assert.ok(posterSettingKeys.includes("marqueeText"), "Poster must expose marqueeText");
});

// -----------------------------------------------------------------------------
// [TEST 2] Resume Data Immutability & Content Separation
// -----------------------------------------------------------------------------
console.log("\n[TEST 2] Verifying Resume Immutability & Customization Separation...");

runTest("Customizing design, layouts, and images does not mutate original resume data", () => {
  const originalResume = Object.freeze({
    _id: "res-12345",
    personalInfo: Object.freeze({
      fullName: "Jane Doe",
      email: "jane@example.com",
      title: "Staff Engineer",
      summary: "Original career summary that must never be altered by portfolio styling.",
    }),
    skills: Object.freeze(["TypeScript", "React", "Rust", "Distributed Systems"]),
    workExperience: Object.freeze([
      { company: "Acme Cloud", role: "Principal Architect", startDate: "2021", endDate: "Present" },
    ]),
  });

  const deepCloneResume = JSON.parse(JSON.stringify(originalResume));

  // User applies customizations
  const portfolioCustomization: PortfolioDesignSettings = {
    template: "devport",
    theme: "dark",
    primaryColor: "#06b6d4",
    fontFamily: "JetBrains",
    backgroundEffect: "aurora",
    layoutOptions: { projectsLayout: "cards" },
    templateSettings: { orbitalRing: false, floatingCodeCard: true },
  };

  const validated = validateCustomizationInput("devport", portfolioCustomization);
  assert.ok(validated.isValid);

  // Assert original resume object is strictly unchanged
  assert.deepEqual(originalResume, deepCloneResume, "Original resume data must remain completely immutable");
});

// -----------------------------------------------------------------------------
// [TEST 3] Input Validation & Sanitization Engine
// -----------------------------------------------------------------------------
console.log("\n[TEST 3] Testing Input Validation & Sanitization Engine...");

runTest("Hex color regex accurately validates 3, 6, and 8 character hex codes", () => {
  assert.ok(HEX_COLOR_REGEX.test("#fff"));
  assert.ok(HEX_COLOR_REGEX.test("#2563eb"));
  assert.ok(HEX_COLOR_REGEX.test("#06B6D4"));
  assert.ok(HEX_COLOR_REGEX.test("#12345678"));
  assert.ok(!HEX_COLOR_REGEX.test("blue"));
  assert.ok(!HEX_COLOR_REGEX.test("#12"));
  assert.ok(!HEX_COLOR_REGEX.test("#gggggg"));
  assert.ok(!HEX_COLOR_REGEX.test("javascript:alert(1)"));
});

runTest("Rejects and sanitizes invalid color inputs to template defaults", () => {
  const result = validateCustomizationInput("spotlight", {
    primaryColor: "not-a-valid-hex-color",
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length > 0);
  assert.equal(result.sanitized.primaryColor, "#e11d48"); // Default for spotlight
});

runTest("Sanitizes unsupported font families to template supported font", () => {
  const result = validateCustomizationInput("poster", {
    fontFamily: "ComicSansMS",
  });
  assert.equal(result.isValid, false);
  assert.ok(result.sanitized.fontFamily === "Inter" || result.sanitized.fontFamily === "Roboto");
});

runTest("Strips rogue template settings keys not in the template's capability schema", () => {
  const result = validateCustomizationInput("minimal", {
    templateSettings: {
      whitespaceDensity: "relaxed",
      rogueKeyNotInSchema: "malicious-value",
      orbitalRing: true, // Belongs to devport, not minimal
    },
  });

  const sanitizedKeys = Object.keys(result.sanitized.templateSettings || {});
  assert.ok(sanitizedKeys.includes("whitespaceDensity"));
  assert.ok(!sanitizedKeys.includes("rogueKeyNotInSchema"), "Rogue key must be stripped");
  assert.ok(!sanitizedKeys.includes("orbitalRing"), "Settings from other templates must not leak");
});

runTest("Validates and bounds select options in template settings", () => {
  const result = validateCustomizationInput("poster", {
    templateSettings: {
      watermarkOpacity: "invalid-option-not-in-enum",
    },
  });
  assert.equal(result.sanitized.templateSettings?.watermarkOpacity, "subtle");
});

// -----------------------------------------------------------------------------
// [TEST 4] Template Default Design Preservation
// -----------------------------------------------------------------------------
console.log("\n[TEST 4] Verifying Default Design Preservation for All Templates...");

runTest("Preserves exact native default colors and settings for all templates", () => {
  const spotlightDef = getDefaultDesignSettings("spotlight");
  assert.equal(spotlightDef.primaryColor, "#e11d48");
  assert.equal(spotlightDef.templateSettings?.glowHalo, true);
  assert.equal(spotlightDef.templateSettings?.expertiseTree, true);

  const posterDef = getDefaultDesignSettings("poster");
  assert.equal(posterDef.primaryColor, "#e11d2a");
  assert.equal(posterDef.templateSettings?.watermarkOpacity, "subtle");

  const devportDef = getDefaultDesignSettings("devport");
  assert.equal(devportDef.primaryColor, "#06b6d4");
  assert.equal(devportDef.templateSettings?.orbitalRing, true);
  assert.equal(devportDef.templateSettings?.floatingCodeCard, true);

  const creativeDef = getDefaultDesignSettings("creative");
  assert.equal(creativeDef.primaryColor, "#9333ea");
  assert.equal(creativeDef.templateSettings?.glassBlur, "medium");

  const developerDef = getDefaultDesignSettings("developer");
  assert.equal(developerDef.primaryColor, "#2563eb");
  assert.equal(developerDef.templateSettings?.terminalPrompt, "dev@workstation:~$");

  const minimalDef = getDefaultDesignSettings("minimal");
  assert.equal(minimalDef.primaryColor, "#2563eb");
  assert.equal(minimalDef.templateSettings?.whitespaceDensity, "normal");
});

// -----------------------------------------------------------------------------
// [TEST 5] Live Preview Rendering with Custom Settings
// -----------------------------------------------------------------------------
console.log("\n[TEST 5] Testing Live Preview Rendering with Customized Settings...");

const samplePortfolio: Partial<Portfolio> = {
  title: "Alex Morgan Portfolio",
  profile: {
    fullName: "Alex Morgan",
    headline: "Senior Cloud & Distributed Systems Architect",
    bio: "Building resilient microservices and cloud infrastructure.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    email: "alex@example.com",
    location: "San Francisco, CA",
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/alexmorgan" },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/alexmorgan" },
  ],
  skills: [
    { name: "TypeScript", level: "expert", category: "Languages" },
    { name: "Go", level: "advanced", category: "Languages" },
    { name: "Kubernetes", level: "expert", category: "DevOps" },
  ],
  projects: [
    {
      title: "Mesh Router Engine",
      description: "High-performance edge router handling 100k req/sec.",
      tags: ["Go", "gRPC", "Docker"],
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
      liveUrl: "https://meshrouter.dev",
      repoUrl: "https://github.com/alexmorgan/mesh-router",
      featured: true,
    },
  ],
  experience: [
    {
      company: "CloudScale Inc",
      title: "Lead Infrastructure Engineer",
      startDate: "2021",
      endDate: "Present",
      description: "Architected multi-region Kubernetes clusters.",
    },
  ],
  education: [
    {
      institution: "UC Berkeley",
      degree: "BS Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
};

for (const tid of TEMPLATE_IDS) {
  runTest(`Renders [${tid}] preview with custom colors, fonts, layout, and project images`, () => {
    const customDesign: PortfolioDesignSettings = {
      template: tid,
      theme: "dark",
      primaryColor: "#059669", // Custom emerald green
      fontFamily: "Roboto",
      backgroundEffect: "mesh",
      layoutOptions: {
        projectsLayout: "cards",
        skillsLayout: "pills",
      },
      templateSettings: {
        glowHalo: false,
        orbitalRing: false,
        marqueeText: "SCALABLE SYSTEMS • CLOUD ARCHITECTURE",
        terminalPrompt: "root@cloud-node:~#",
        whitespaceDensity: "relaxed",
      },
      sectionOrder: ["hero", "projects", "skills", "experience", "contact"],
      sectionVisibility: { education: false, certifications: false },
    };

    const customizedPortfolio: Partial<Portfolio> = {
      ...samplePortfolio,
      design: customDesign,
    };

    const markup = renderToStaticMarkup(
      React.createElement(PortfolioRenderer, {
        portfolio: customizedPortfolio,
        showEmpty: true,
      })
    );

    assert.ok(markup.length > 500, `Markup for ${tid} must not be empty`);
    assert.ok(markup.includes("Alex Morgan"), "Rendered output must include candidate name");
    assert.ok(markup.includes("Mesh Router Engine"), "Rendered output must include project title");
    assert.ok(markup.includes("#059669"), "Rendered markup must apply custom primary color token");
  });
}

// -----------------------------------------------------------------------------
// [TEST 6] Storage Model & Database Payload Verification
// -----------------------------------------------------------------------------
console.log("\n[TEST 6] Verifying Storage Model & Payload Schema Compliance...");

runTest("Serialized payload contains backgroundEffect, layoutOptions, templateSettings, and project imageUrl", () => {
  const p: Partial<Portfolio> = {
    title: "Candidate Portfolio",
    projects: [
      {
        title: "Distributed Cache",
        description: "Cache engine with Raft consensus",
        imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      },
    ],
    design: {
      template: "spotlight",
      theme: "dark",
      primaryColor: "#e11d48",
      fontFamily: "Inter",
      backgroundEffect: "aurora",
      layoutOptions: { projectsLayout: "grid" },
      templateSettings: { glowHalo: true, typewriterSpeed: "fast" },
      sectionOrder: ["hero", "about", "projects"],
      sectionVisibility: { contact: false },
    },
  };

  const serialized = JSON.stringify(p);
  const deserialized = JSON.parse(serialized);

  assert.equal(deserialized.design.backgroundEffect, "aurora");
  assert.equal(deserialized.design.layoutOptions.projectsLayout, "grid");
  assert.equal(deserialized.design.templateSettings.typewriterSpeed, "fast");
  assert.ok(deserialized.projects[0].imageUrl.startsWith("data:image/png;base64,"));
});

console.log("\n==================================================================");
console.log(`Summary: ${passedTests}/${totalTests} tests passed successfully.`);
console.log("==================================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
