import assert from "node:assert/strict";
import { slugify } from "../src/lib/slug";

console.log("==================================================================");
console.log("             Portfolio Slug Utility Test Suite                    ");
console.log("==================================================================");

// TEST 1: Basic Conversion
console.log("\n[TEST 1] Testing basic name slugification...");
assert.equal(slugify("Sunil Kumar"), "sunil-kumar");
assert.equal(slugify("Alex Rivera Staff Engineer"), "alex-rivera-staff-engineer");
console.log("  ✅ Basic titles converted to lowercase kebab-case.");

// TEST 2: Special Characters and Symbols
console.log("\n[TEST 2] Testing special characters & symbols...");
assert.equal(slugify("Sunil's Portfolio #1 (2026)!"), "sunils-portfolio-1-2026");
assert.equal(slugify("C++ & Rust Developer / Architect"), "c-rust-developer-architect");
console.log("  ✅ Stripped punctuation and normalized symbols.");

// TEST 3: Accents & Diacritics
console.log("\n[TEST 3] Testing diacritic normalization...");
assert.equal(slugify("François Müller Résumé"), "francois-muller-resume");
console.log("  ✅ Diacritics normalized correctly.");

// TEST 4: Empty and Edge-Cases
console.log("\n[TEST 4] Testing boundary and fallback conditions...");
assert.equal(slugify(""), "portfolio");
assert.equal(slugify("   ---   "), "portfolio");
assert.equal(slugify("---hello---world---"), "hello-world");
console.log("  ✅ Fallbacks handle empty, leading, and trailing hyphens.");

console.log("\n==================================================================");
console.log("All Slug Utility Tests Passed (4/4)");
console.log("==================================================================");
