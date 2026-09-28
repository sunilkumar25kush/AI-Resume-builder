import puppeteer from "puppeteer";
import { Resume } from "../models/Resume.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, verifyToken } from "../utils/token.js";

let browserPromise = null;

export async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=medium",
        "--disable-gpu",
      ],
    }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  const browser = await browserPromise;
  if (!browser.connected) {
    browserPromise = null;
    return getBrowser();
  }
  return browser;
}

export function createPrintToken(userId, resumeId) {
  return signToken({ sub: String(userId), resumeId: String(resumeId), purpose: "print" });
}

export function verifyPrintToken(token, resumeId) {
  try {
    const payload = verifyToken(token);
    if (payload.purpose !== "print" || String(payload.resumeId) !== String(resumeId)) {
      throw new Error("Mismatch in print token");
    }
    return payload.sub;
  } catch {
    throw ApiError.unauthorized("Invalid or expired print token");
  }
}

/**
 * Render the resume directly via Puppeteer visiting the /print/:id route.
 * Guarantees 100% visual fidelity matching the live preview.
 */
export async function renderResumePdf(userId, resumeId, { density = "density-1", theme = {} } = {}) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId }).lean();
  if (!resume) throw ApiError.notFound("Resume not found");

  // Step 3: Name/header handling
  // If personal.fullName is empty or placeholder, block download
  const fullName = (
    resume.parsedData?.personal?.fullName ||
    resume.parsedData?.name ||
    ""
  ).trim();

  if (!fullName || fullName.toLowerCase() === "your name") {
    throw ApiError.badRequest("Add your full name before downloading");
  }

  const printToken = createPrintToken(userId, resumeId);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const themeParam = encodeURIComponent(typeof theme === "string" ? theme : JSON.stringify(theme));
  const printUrl = `${clientUrl}/print/${resumeId}?token=${printToken}&density=${density}&theme=${themeParam}`;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set high-DPI viewport matching A4 proportions
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Navigate and wait for network idle & document fonts to finish loading
    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 25000 });
    await page.evaluate(() => document.fonts.ready);

    // Ensure #print-ready marker is present
    await page.waitForSelector("#print-ready", { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const safeBaseName = (resume.fileName || "resume").replace(/\.[^.]+$/, "");
    return {
      buffer: Buffer.from(pdfBuffer),
      fileName: `${safeBaseName}-resume.pdf`,
    };
  } finally {
    await page.close();
  }
}
