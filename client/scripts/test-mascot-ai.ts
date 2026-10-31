import assert from "node:assert/strict";
import { MascotAiEngine } from "../src/features/ai-suggestions/MascotAiEngine.js";

console.log("==================================================================");
console.log("       ResumeBuddy Context-Aware AI Suggestions Test Suite        ");
console.log("==================================================================");

// [TEST 1] Skills Recommendations (Prompt Example 1)
console.log("\n[TEST 1] Testing Skills Recommendations (Prompt Example 1)...");
const skillsInput = "I know HTML CSS and JavaScript.";
const skillsResult = MascotAiEngine.analyzeSkills(skillsInput);
assert(skillsResult !== null, "Skills analyzer must return a suggestion for casual text");
assert.equal(skillsResult.message, "Nice start! Let's make this skills section more structured.");
assert(Array.isArray(skillsResult.suggestion.items), "Items must be an array of skill tags");
assert(skillsResult.suggestion.items.includes("HTML5"), "Must include HTML5");
assert(skillsResult.suggestion.items.includes("CSS3"), "Must include CSS3");
assert(skillsResult.suggestion.items.includes("JavaScript (ES6+)"), "Must include JavaScript (ES6+)");
console.log("  ✅ Matches Prompt Example 1: 'HTML5', 'CSS3', 'JavaScript (ES6+)'");

// [TEST 2] Project Description Suggestions (Prompt Example 2)
console.log("\n[TEST 2] Testing Project Description Suggestions (Prompt Example 2)...");
const projectResult = MascotAiEngine.analyzeProject({
  name: "Portfolio Website",
  description: "I created a website.",
  technologies: "React, Tailwind CSS",
});
assert(projectResult !== null, "Project analyzer must return a suggestion for vague description");
assert.equal(projectResult.message, "Could you tell me which technologies you used and what the website does?");
assert(projectResult.suggestion.suggestedText.includes("Architected and developed"), "Must contain professional action verb");
assert(projectResult.suggestion.suggestedText.includes("React, Tailwind CSS"), "Must preserve user's actual technologies without hallucination");
console.log("  ✅ Matches Prompt Example 2: Prompting for tech stack & purpose + professional example");

// [TEST 3] Professional Summary Suggestions (Prompt Example 3)
console.log("\n[TEST 3] Testing Professional Summary Suggestions (Prompt Example 3)...");
const summaryInput = "I am a hard worker seeking a job and looking for an opportunity.";
const summaryResult = MascotAiEngine.analyzeSummary(summaryInput, "Frontend Engineer");
assert(summaryResult !== null, "Summary analyzer must flag generic summary");
assert.equal(summaryResult.message, "Your professional summary could be more impactful. Let's improve it.");
assert(summaryResult.suggestion.suggestedText.includes("Frontend Engineer"), "Must include candidate's target role");
assert(summaryResult.suggestion.suggestedText.length > 50, "Must be a fleshed out professional summary");
console.log("  ✅ Matches Prompt Example 3: Impactful summary suggestion");

// [TEST 4] Experience Description Improvements
console.log("\n[TEST 4] Testing Experience Description Improvements...");
const expResult = MascotAiEngine.analyzeExperience({
  title: "Software Developer",
  company: "Tech Corp",
  description: "Responsible for fixing bugs",
});
assert(expResult !== null, "Experience analyzer must flag weak passive bullet");
assert.equal(expResult.message, "Let's make this experience description more achievement-oriented with strong action verbs.");
assert(expResult.suggestion.suggestedText.includes("Diagnosed"), "Must replace passive phrasing with active verbs");
console.log("  ✅ Passive 'Responsible for fixing bugs' transformed into achievement-oriented bullet");

// [TEST 5] Education Information Guidance
console.log("\n[TEST 5] Testing Education Information Guidance...");
const eduResult = MascotAiEngine.analyzeEducation({
  degree: "B.S. Computer Science",
  institution: "State University",
  description: "",
});
assert(eduResult !== null, "Education analyzer must suggest coursework when description is empty");
assert(eduResult.message.includes("relevant coursework"));
assert(eduResult.suggestion.suggestedText.includes("Relevant Coursework:"));
console.log("  ✅ Education section prompts for relevant coursework and academic honors");

// [TEST 6] Portfolio Content Suggestions
console.log("\n[TEST 6] Testing Portfolio Content Suggestions...");
const portBioResult = MascotAiEngine.analyzePortfolio("bio", "I am a developer.", "Full Stack Engineer");
assert(portBioResult !== null, "Portfolio bio analyzer must expand sparse bio");
assert(portBioResult.suggestion.suggestedText.includes("Full Stack Engineer"));

const portHeadResult = MascotAiEngine.analyzePortfolio("headline", "developer", "Full Stack Engineer");
assert(portHeadResult !== null, "Portfolio headline analyzer must enhance single-word headline");
assert(portHeadResult.suggestion.suggestedText.includes("Scalable Systems & Modern Web Experiences"));
console.log("  ✅ Portfolio bio & headline suggestions verified");

// [TEST 7] Truth Preservation & Anti-Hallucination
console.log("\n[TEST 7] Verifying Truth Preservation & Fact Constraints...");
const strictProject = MascotAiEngine.analyzeProject({
  name: "Task Tracker",
  description: "built an app",
  technologies: "Vue 3",
});
assert(strictProject?.suggestion.suggestedText.includes("Vue 3"));
assert(!strictProject?.suggestion.suggestedText.includes("AWS"), "Must never invent technologies not provided");
console.log("  ✅ Strictly preserves provided details and never invents false credentials");

console.log("\n==================================================================");
console.log("  All Mascot AI Suggestion Tests Passed: 7/7 Suites OK!           ");
console.log("==================================================================");

