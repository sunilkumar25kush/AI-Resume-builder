// Smoke test for Portfolio Generator Phase 1 Foundation
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientSrc = path.resolve(__dirname, "../src");

let passed = 0;
let failed = 0;

function check(label, condition, extra = "") {
  console.log(`${condition ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (condition) passed += 1;
  else failed += 1;
}

console.log("Running Portfolio Phase 1 verification tests...\n");

// 1. Verify TypeScript types exist and are re-exported
const typesIndex = fs.readFileSync(path.join(clientSrc, "types/index.ts"), "utf-8");
check("Portfolio types exported in types/index.ts", typesIndex.includes("Portfolio") && typesIndex.includes("./portfolio"));

const portfolioTypes = fs.readFileSync(path.join(clientSrc, "types/portfolio.ts"), "utf-8");
check("Portfolio interface defined", portfolioTypes.includes("export interface Portfolio"));
check("PortfolioStatus defined", portfolioTypes.includes("export type PortfolioStatus"));

// 2. Verify API client stub exists
const portfolioApi = fs.readFileSync(path.join(clientSrc, "api/portfolios.ts"), "utf-8");
check("portfoliosApi defined with list() and create()", portfolioApi.includes("async list()") && portfolioApi.includes("async create("));

// 3. Verify Zustand store exists
const portfolioStore = fs.readFileSync(path.join(clientSrc, "stores/portfolios.ts"), "utf-8");
check("usePortfoliosStore exists with Zustand", portfolioStore.includes("usePortfoliosStore = create"));

// 4. Verify Route is registered in routes/index.tsx
const routesIndex = fs.readFileSync(path.join(clientSrc, "routes/index.tsx"), "utf-8");
check("PortfoliosPage lazy-loaded", routesIndex.includes("PortfoliosPage = lazy("));
check("/portfolios path registered in AppLayout", routesIndex.includes('path: "/portfolios"'));

// 5. Verify Navigation entry point in nav.ts
const navConfig = fs.readFileSync(path.join(clientSrc, "constants/nav.ts"), "utf-8");
check("Portfolio Generator in NAV_GROUPS", navConfig.includes('href: "/portfolios"'));

// 6. Verify Dashboard entry point in DashboardPage.tsx
const dashboardPage = fs.readFileSync(path.join(clientSrc, "pages/DashboardPage.tsx"), "utf-8");
check("Portfolio Generator feature card on Dashboard", dashboardPage.includes('to: "/portfolios"'));

// 7. Verify PortfoliosPage component
const portfoliosPage = fs.readFileSync(path.join(clientSrc, "pages/PortfoliosPage.tsx"), "utf-8");
check("PortfoliosPage has heading and description", portfoliosPage.includes("Portfolio Generator") && portfoliosPage.includes("Transform your resume"));
check("PortfoliosPage has EmptyState", portfoliosPage.includes("<EmptyState"));
check("PortfoliosPage has Create Portfolio CTA", portfoliosPage.includes("Create Portfolio"));

console.log(`\nPhase 1 verification: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
