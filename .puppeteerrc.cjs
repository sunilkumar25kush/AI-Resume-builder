const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a directory inside the project root
  // so the downloaded Chrome binary persists in Render's runtime container.
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, ".cache", "puppeteer"),
};
