import assert from "node:assert/strict";
import {
  validateEmail,
  validateFullName,
  validateLinkedIn,
  validateGitHub,
  validatePhone,
  validateExperienceYears,
  validateDateRange,
  validateEducationInstitution,
} from "../src/features/validation/MascotValidationRules.js";

console.log("==================================================================");
console.log("       ResumeBuddy Smart Form Validation Test Suite               ");
console.log("==================================================================");

// [TEST 1] Email Validation
console.log("\n[TEST 1] Testing Email Validation...");
const emailBad = validateEmail("sunil123gmail.com");
assert(emailBad !== null, "Invalid email must return an issue");
assert.equal(emailBad.mood, "confused");
assert.equal(emailBad.gesture, "pointAtInput");
assert.equal(emailBad.tip?.incorrect, "sunil123gmail.com");
assert.equal(emailBad.tip?.correct, "sunil123@gmail.com");
console.log("  ✅ Invalid email flagged with confused mood, pointAtInput, and examples");

const emailGood = validateEmail("sunil123@gmail.com");
assert.equal(emailGood, null, "Valid email must pass");
console.log("  ✅ Valid email passes without issue");

// [TEST 2] Full Name Validation
console.log("\n[TEST 2] Testing Full Name Validation...");
const nameBad = validateFullName("123456");
assert(nameBad !== null, "Invalid name must return an issue");
assert.equal(nameBad.mood, "warning");
assert.equal(nameBad.gesture, "pointAtInput");
assert.equal(nameBad.tip?.incorrect, "123456");
assert.equal(nameBad.tip?.correct, "Sunil Kumar");
console.log("  ✅ Number-only full name flagged with warning mood and Sunil Kumar example");

const nameGood = validateFullName("Sunil Kumar");
assert.equal(nameGood, null, "Valid name must pass");
console.log("  ✅ Valid full name passes");

// [TEST 3] LinkedIn Profile Validation
console.log("\n[TEST 3] Testing LinkedIn Validation...");
const linkedinBad = validateLinkedIn("linkedinprofile");
assert(linkedinBad !== null, "Invalid LinkedIn must return an issue");
assert.equal(linkedinBad.mood, "confused");
assert.equal(linkedinBad.gesture, "pointAtInput");
assert.equal(linkedinBad.tip?.incorrect, "linkedinprofile");
assert.equal(linkedinBad.tip?.correct, "https://www.linkedin.com/in/username/");
console.log("  ✅ Generic string linkedinprofile flagged with complete URL example");

const linkedinGood = validateLinkedIn("https://www.linkedin.com/in/sunilkumar");
assert.equal(linkedinGood, null, "Valid LinkedIn URL must pass");
console.log("  ✅ Valid LinkedIn URL passes");

// [TEST 4] GitHub Profile Validation
console.log("\n[TEST 4] Testing GitHub Validation...");
const githubBad = validateGitHub("github");
assert(githubBad !== null, "Invalid GitHub must return an issue");
assert.equal(githubBad.mood, "confused");
assert.equal(githubBad.gesture, "pointAtInput");
assert.equal(githubBad.tip?.incorrect, "github");
assert.equal(githubBad.tip?.correct, "https://github.com/username");
console.log("  ✅ Bare word 'github' flagged with full username URL example");

const githubGood = validateGitHub("https://github.com/sunilkumar25kush");
assert.equal(githubGood, null, "Valid GitHub URL must pass");
console.log("  ✅ Valid GitHub URL passes");

// [TEST 5] Phone Number Validation
console.log("\n[TEST 5] Testing Phone Number Validation...");
const phoneBad = validatePhone("abc123456");
assert(phoneBad !== null, "Alphanumeric phone must return an issue");
assert.equal(phoneBad.mood, "confused");
assert.equal(phoneBad.gesture, "pointAtInput");
assert.equal(phoneBad.tip?.incorrect, "abc123456");
console.log("  ✅ Phone with letters flagged with country format example");

const phoneGood = validatePhone("+91 7827598401");
assert.equal(phoneGood, null, "Valid phone must pass");
console.log("  ✅ Valid formatted phone passes");

// [TEST 6] Experience Years Validation
console.log("\n[TEST 6] Testing Experience Years Validation...");
const expBad = validateExperienceYears("-5 years");
assert(expBad !== null, "Negative experience must return an issue");
assert.equal(expBad.mood, "warning");
assert.equal(expBad.gesture, "pointAtInput");
assert.equal(expBad.tip?.incorrect, "-5 years");
assert(expBad.tip?.correct?.includes("0 or a positive number"));
console.log("  ✅ Negative experience '-5 years' flagged with warning mood and positive example");

const expGood = validateExperienceYears("5 years");
assert.equal(expGood, null, "Positive experience must pass");
console.log("  ✅ Positive experience passes");

// [TEST 7] Date Range Chronological Validation
console.log("\n[TEST 7] Testing Chronological Date Range Validation...");
const dateBad = validateDateRange("2024-05", "2021-01");
assert(dateBad !== null, "End date earlier than start date must return an issue");
assert.equal(dateBad.mood, "warning");
assert.equal(dateBad.gesture, "pointDown");
assert.equal(dateBad.tip?.incorrect, "End date earlier than start date");
assert.equal(dateBad.tip?.correct, "End date must be after start date");
console.log("  ✅ End date before start date flagged with pointDown gesture and warning mood");

const dateGood = validateDateRange("2021-01", "2024-05");
assert.equal(dateGood, null, "Chronological date range must pass");
const datePresent = validateDateRange("2022-03", "Present");
assert.equal(datePresent, null, "Ongoing/Present end date must pass");
console.log("  ✅ Chronological and 'Present' date ranges pass");

// [TEST 8] Education Institution Validation
console.log("\n[TEST 8] Testing Education Institution Validation...");
const eduBad = validateEducationInstitution("", "B.Tech Computer Science", "2020 - 2024");
assert(eduBad !== null, "Missing institution must return an issue when degree is set");
assert.equal(eduBad.mood, "warning");
assert.equal(eduBad.gesture, "pointAtInput");
assert.equal(eduBad.tip?.incorrect, "Missing institution name");
assert.equal(eduBad.tip?.correct, "Enter your school, college, or university name");
console.log("  ✅ Missing institution flagged with enter university example");

const eduGood = validateEducationInstitution("Stanford University", "B.Tech Computer Science");
assert.equal(eduGood, null, "Filled institution must pass");
console.log("  ✅ Complete education entry passes");

console.log("\n==================================================================");
console.log("  All Mascot Validation Tests Passed Successfully: 8/8 Suites OK! ");
console.log("==================================================================");
