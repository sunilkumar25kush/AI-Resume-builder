import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as any).React = React;

import {
  adaptResumeToPortfolio,
  validateResumeForTemplate,
} from "../src/components/portfolios/adapters/resumePortfolioAdapter";
import { TEMPLATE_METADATA } from "../src/components/portfolios/templates/registry";
import { PortfolioRenderer } from "../src/components/portfolios/PortfolioRenderer";
import type { Resume } from "../src/types/resume";
import type { PortfolioTemplateId } from "../src/types/portfolio";

// ============================================================================
// Realistic Sample Resume 1: Senior Full-Stack Cloud Architect
// ============================================================================
const REALISTIC_RESUME_1: Partial<Resume> = {
  _id: "res-001-senior-dev",
  fileName: "Alex_Rivera_Staff_Engineer_Resume.pdf",
  fileType: "application/pdf",
  fileSize: 1048576,
  parsedData: {
    name: "Alex Rivera",
    title: "Staff Distributed Systems Engineer",
    summary:
      "Distributed systems engineer with 11+ years leading high-throughput microservices, WebGL telemetry dashboards, and cloud native architecture.",
    contact: {
      email: "alex.rivera@distributed.dev",
      phone: "+1 (415) 890-1234",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/alexrivera-dev",
      github: "https://github.com/alexrivera",
      website: "https://alexrivera.dev",
      customLinks: [
        { label: "Blog", url: "https://blog.alexrivera.dev" },
        { label: "Twitter", url: "https://x.com/alexrivera" },
      ],
    },
    skills: [
      "Go",
      "TypeScript",
      "Rust",
      "Kubernetes",
      "GraphQL",
      "Three.js",
      "React",
      "PostgreSQL",
      "Kafka",
      "Terraform",
      "Docker",
    ],
    experience: [
      {
        title: "Staff Infrastructure Engineer",
        company: "Vanguard Cloud Technologies",
        location: "San Francisco, CA",
        startDate: "2021",
        endDate: "Present",
        description:
          "Lead architect for core real-time message streaming fabric and edge distribution clusters.\n• Designed low-latency eBPF networking mesh reducing p99 latency by 38% across 40 global regions.\n• Mentored a team of 14 senior and principal engineers on multi-region reliability and chaos engineering.",
        achievements: "Built high-performance stream router processing 4.2M events/sec.",
        technologies: "Go, eBPF, Kafka, Kubernetes, Prometheus",
      },
      {
        title: "Senior Full-Stack Architect",
        company: "HyperScale Networks",
        location: "Seattle, WA",
        startDate: "2018",
        endDate: "2021",
        description:
          "Architected real-time telemetry analytics platform with 3D cluster node topology visualizer.",
        achievements: "Delivered interactive WebGL topology canvas saving $1.2M in annual observability tool costs.",
        technologies: "React, Three.js, TypeScript, Node.js",
      },
    ],
    education: [
      {
        degree: "M.S. in Computer Science",
        institution: "University of Washington",
        startDate: "2016",
        endDate: "2018",
        description: "Focus on Distributed Consensus & Systems Reliability.",
      },
      {
        degree: "B.S. in Software Engineering",
        institution: "UC Berkeley",
        startDate: "2012",
        endDate: "2016",
        description: "Dean's Honors List, Magna Cum Laude.",
      },
    ],
    projects: [
      {
        name: "OmniMesh Service Mesh",
        description:
          "Lightweight zero-trust service mesh sidecar proxy with automated mTLS and live telemetry export.",
        technologies: "Rust, Envoy, Kubernetes, gRPC",
        link: "https://github.com/alexrivera/omnimesh",
        liveDemo: "https://omnimesh.dev",
      },
      {
        name: "CyberHUD 3D Cluster Visualizer",
        description:
          "Browser-based WebGL cluster observability visualizer rendering real-time node health metrics in 3D.",
        technologies: "Three.js, WebGL, TypeScript, TailwindCSS",
        link: "https://github.com/alexrivera/cyberhud",
        liveDemo: "https://cyberhud.alexrivera.dev",
      },
    ],
    certifications: [
      "Certified Kubernetes Administrator (CKA)",
      "AWS Certified Solutions Architect — Professional",
    ],
    languages: ["English (Native)", "Spanish (Fluent)"],
    awards: ["Best Technical Innovation Award 2023"],
    customSections: [],
    hiddenSections: [],
  },
  customization: {
    accentColor: "#38bdf8",
    fontFamily: "Geist",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  },
};

// ============================================================================
// Realistic Sample Resume 2: Career Changer / Fresh Graduate
// ============================================================================
const REALISTIC_RESUME_2: Partial<Resume> = {
  _id: "res-002-graduate",
  fileName: "Maya_Lin_Resume.docx",
  fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  fileSize: 450000,
  parsedData: {
    name: "Maya Lin",
    title: "Junior Creative Developer & UI Engineer",
    summary:
      "Recent Computer Science graduate with strong foundation in modern frontend frameworks, kinetic animations, and accessible web standards.",
    contact: {
      email: "maya.lin@gmail.com",
      phone: "+1 (312) 555-7890",
      location: "Chicago, IL",
      github: "https://github.com/mayalin-dev",
      linkedin: "https://linkedin.com/in/mayalindev",
    },
    skills: ["JavaScript", "React", "HTML5", "CSS3", "TailwindCSS", "Framer Motion", "Git", "Figma"],
    experience: [], // No prior full-time experience (entry level)
    education: [
      {
        degree: "B.S. in Computer Science",
        institution: "Northwestern University",
        startDate: "2020",
        endDate: "2024",
        description: "Graduated with 3.8 GPA. Capstone Project: Interactive Accessibility Tool.",
      },
    ],
    projects: [
      {
        name: "Accessible Design Palette",
        description: "Contrast analyzer and accessible color palette generator complying with WCAG 2.2 AAA.",
        technologies: "React, TailwindCSS, TypeScript",
        link: "https://github.com/mayalin-dev/contrast-palette",
        liveDemo: "https://contrast-palette.vercel.app",
      },
    ],
    certifications: ["Meta Certified Frontend Developer"],
    languages: ["English", "Mandarin"],
    awards: [],
    customSections: [],
    hiddenSections: [],
  },
  customization: {},
};

// ============================================================================
// Realistic Sample Resume 3: Minimalist Sparse Resume (Edge-Case)
// ============================================================================
const REALISTIC_RESUME_3: Partial<Resume> = {
  _id: "res-003-sparse",
  fileName: "Jordan_Smith_Draft.pdf",
  fileType: "application/pdf",
  fileSize: 120000,
  parsedData: {
    name: "Jordan Smith",
    title: "Product Manager",
    summary: "Product strategist focused on developer platforms and B2B SaaS.",
    contact: {
      email: "jordan@product.co",
      phone: "",
      location: "New York, NY",
      linkedin: "https://linkedin.com/in/jordansmith",
      github: "",
    },
    skills: ["Product Strategy", "User Research", "Agile", "SQL", "Figma"],
    experience: [
      {
        title: "Product Manager",
        company: "SaaS Matrix",
        location: "New York, NY",
        startDate: "2022",
        endDate: "Present",
        description: "Overseeing developer tools and integration marketplace.",
        achievements: "",
        technologies: "",
      },
    ],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    customSections: [],
    hiddenSections: [],
  },
};

async function runAdapterTests() {
  console.log("==================================================================");
  console.log("       Resume-to-Portfolio Common Data Adapter Test Suite         ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  // --------------------------------------------------------------------------
  // TEST 1: Immutability Guarantee
  // --------------------------------------------------------------------------
  console.log("\n[TEST 1] Verifying Resume Immutability (Zero Input Mutation)...");
  const originalSnapshot = JSON.stringify(REALISTIC_RESUME_1);
  const adapted = adaptResumeToPortfolio(REALISTIC_RESUME_1, { template: "devport" });
  const afterSnapshot = JSON.stringify(REALISTIC_RESUME_1);

  assert.equal(
    originalSnapshot,
    afterSnapshot,
    "CRITICAL: adaptResumeToPortfolio mutated the original resume data!"
  );
  console.log("  ✅ Input Resume object remains strictly unmodified.");
  passed++;

  // --------------------------------------------------------------------------
  // TEST 2: Common Adapter Field Normalization
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2] Verifying Complete Field Extraction & Normalization...");
  assert.equal(adapted.profile?.fullName, "Alex Rivera");
  assert.equal(adapted.profile?.headline, "Staff Distributed Systems Engineer");
  assert.equal(adapted.profile?.email, "alex.rivera@distributed.dev");
  assert.equal(adapted.profile?.location, "San Francisco, CA");
  assert.equal(adapted.profile?.avatarUrl, "https://images.unsplash.com/photo-1534528741775-53994a69daeb");
  assert.ok(adapted.skills!.length >= 10, "Skills were not normalized properly");
  assert.ok(adapted.experience!.length === 2, "Experience entries missing");
  assert.ok(adapted.projects!.length === 2, "Projects missing");
  assert.ok(adapted.education!.length === 2, "Education missing");
  assert.ok(adapted.certifications!.length === 2, "Certifications missing");
  assert.ok(adapted.socialLinks!.length >= 4, "Social links (GitHub, LinkedIn, Website, Custom) missing");

  // Check highlight parsing from bullet points
  const firstExp = adapted.experience![0];
  assert.ok(firstExp.highlights && firstExp.highlights.length >= 2, "Highlights not extracted from bullets");
  console.log(`  ✅ Successfully normalized: ${adapted.skills!.length} skills, ${adapted.experience!.length} roles, ${adapted.projects!.length} projects, ${adapted.socialLinks!.length} social links.`);
  passed++;

  // --------------------------------------------------------------------------
  // TEST 3: Validation & Compatibility Engine for Every Template
  // --------------------------------------------------------------------------
  console.log("\n[TEST 3] Auditing Template Field Compatibility Across All 20 Templates...");
  const uniqueTemplateIds = Array.from(
    new Set(TEMPLATE_METADATA.map((t) => t.id))
  ) as PortfolioTemplateId[];

  for (const templateId of uniqueTemplateIds) {
    const report = validateResumeForTemplate(REALISTIC_RESUME_1, templateId);
    assert.ok(report.isCompatible, `Template ${templateId} reported incompatible with valid resume`);
    assert.equal(report.missingRequired.length, 0, `Template ${templateId} had missing required fields`);
    assert.ok(
      report.completenessScore >= 80,
      `Template ${templateId} scored low completeness (${report.completenessScore}%)`
    );
    console.log(
      `  ✅ [${templateId.padEnd(16)}] Compatible: ${report.completenessScore}% completeness (Present: ${report.presentSupported.length} fields)`
    );
    passed++;
  }

  // --------------------------------------------------------------------------
  // TEST 4: Render Verification Across All 20 Templates with Resume 1 (Senior)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 4] Rendering All 20 Templates with Senior Architect Resume...");
  for (const meta of TEMPLATE_METADATA) {
    const adaptedForTemplate = adaptResumeToPortfolio(REALISTIC_RESUME_1, {
      template: meta.id,
      theme: "dark",
    });

    const html = renderToStaticMarkup(
      React.createElement(PortfolioRenderer, {
        portfolio: adaptedForTemplate,
        overrideTemplate: meta.id,
        showEmpty: true,
      })
    );

    assert.ok(html.length > 500, `Template ${meta.id} generated insufficient markup`);
    assert.ok(html.includes("Alex Rivera"), `Template ${meta.id} did not render candidate name`);
    console.log(`  ✅ [${meta.id}] Rendered Senior Resume cleanly (${html.length} bytes markup)`);
    passed++;
  }

  // --------------------------------------------------------------------------
  // TEST 5: Render Verification Across All 20 Templates with Resume 2 (Junior/Fresher)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 5] Rendering All 20 Templates with Junior Graduate Resume (0 Experience)...");
  for (const meta of TEMPLATE_METADATA) {
    const adaptedJunior = adaptResumeToPortfolio(REALISTIC_RESUME_2, {
      template: meta.id,
      theme: "light",
    });

    const html = renderToStaticMarkup(
      React.createElement(PortfolioRenderer, {
        portfolio: adaptedJunior,
        overrideTemplate: meta.id,
        showEmpty: false, // Must not crash even when experience is empty!
      })
    );

    assert.ok(html.length > 500, `Template ${meta.id} generated insufficient markup`);
    assert.ok(html.includes("Maya Lin"), `Template ${meta.id} did not render graduate name`);
    console.log(`  ✅ [${meta.id}] Rendered Junior Resume cleanly without crash`);
    passed++;
  }

  // --------------------------------------------------------------------------
  // TEST 6: Render Verification Across All 20 Templates with Resume 3 (Sparse)
  // --------------------------------------------------------------------------
  console.log("\n[TEST 6] Rendering All 20 Templates with Sparse Resume (Edge-Case)...");
  for (const meta of TEMPLATE_METADATA) {
    const adaptedSparse = adaptResumeToPortfolio(REALISTIC_RESUME_3, {
      template: meta.id,
    });

    const html = renderToStaticMarkup(
      React.createElement(PortfolioRenderer, {
        portfolio: adaptedSparse,
        overrideTemplate: meta.id,
        showEmpty: false,
      })
    );

    assert.ok(html.length > 200, `Template ${meta.id} generated insufficient markup for sparse resume`);
    assert.ok(html.includes("Jordan Smith"), `Template ${meta.id} did not render candidate name`);
    console.log(`  ✅ [${meta.id}] Rendered Sparse Resume cleanly with zero errors`);
    passed++;
  }

  console.log("\n==================================================================");
  console.log(`All Adapter Tests Passed Successfully: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) process.exit(1);
}

runAdapterTests().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
