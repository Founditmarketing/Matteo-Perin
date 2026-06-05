const { join } = require('path');

/**
 * Store Puppeteer's Chromium download inside the project so it is available
 * (and cacheable) during the Vercel build, where the default ~/.cache location
 * is not reliably present at build time.
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
