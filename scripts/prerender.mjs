// Build-time prerendering for SEO.
//
// Vercel serves a client-rendered SPA: the initial HTML for deep routes is an empty
// shell, so crawlers see no page-specific title, schema, or copy until JS runs. This
// script renders the high-value routes with a headless browser at build time and writes
// the fully-rendered HTML to dist/<route>/index.html so the content is in the raw HTML
// (the same advantage a server-rendered store like Shopify has).
//
// It is intentionally FAULT-TOLERANT: any failure logs a warning and exits 0 so a
// prerender problem can never break the production deploy (you just fall back to the SPA).

import { preview } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Launch a headless browser that works both locally and in Vercel's build container.
// Vercel's image lacks the system libraries (libnspr4, libnss3, ...) that Puppeteer's
// bundled Chrome needs, so on Vercel we use @sparticuz/chromium (ships those libs);
// locally we use the full puppeteer package and its managed Chrome.
async function launchBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;
    return puppeteerCore.launch({
      args: [...chromium.args, '--disable-dev-shm-usage'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  const puppeteer = (await import('puppeteer')).default;
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

// Routes to prerender. Keep these to high-value pages with their own SEO (Helmet).
const ROUTES = [
  '/',
  '/bespoke-crocodile-jacket',
  '/lookbook/men',
  '/lookbook/women',
  '/the-house',
  '/bespoke',
  '/press',
  '/journal',
  '/lifestyle',
  '/furniture',
  '/collection',
  // Journal articles (keep in sync with ARTICLES slugs in src/constants.ts)
  '/journal/art-of-patina',
  '/journal/dolomites-notes',
  '/journal/private-air-essentials',
  '/journal/vicuna-commission',
  '/journal/silent-stitch',
  '/journal/urban-armor',
];

function outPathForRoute(route) {
  if (route === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, route.replace(/^\//, ''), 'index.html');
}

async function run() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — skipping prerender.');
    return;
  }

  const server = await preview({
    preview: { port: 4173, strictPort: false },
  });

  const urls = server.resolvedUrls?.local || [];
  const base = (urls[0] || 'http://localhost:4173').replace(/\/$/, '');
  console.log(`[prerender] preview server at ${base}`);

  const browser = await launchBrowser();

  let succeeded = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 45000 });

      // Wait until React has actually rendered something into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        },
        { timeout: 20000 }
      );

      // Give Helmet + above-the-fold animations a moment to settle.
      await new Promise((r) => setTimeout(r, 2500));

      // Safety: never ship a snapshot that captured the startup error overlay.
      const hasError = await page.evaluate(() =>
        document.body.innerText.includes('CRITICAL STARTUP ERROR') ||
        document.body.innerText.includes('App Crashed')
      );
      if (hasError) {
        console.warn(`[prerender] ${route} rendered an error overlay — skipping.`);
        await page.close();
        continue;
      }

      // De-duplicate the description meta: keep the route-specific one Helmet injected
      // (marked data-rh) and drop the static homepage fallback from index.html.
      await page.evaluate(() => {
        const helmetDesc = document.querySelector('meta[name="description"][data-rh="true"]');
        if (helmetDesc) {
          document
            .querySelectorAll('meta[name="description"]:not([data-rh="true"])')
            .forEach((el) => el.remove());
        }
      });

      const html = '<!DOCTYPE html>\n' + (await page.content()).replace(/^<!DOCTYPE html>/i, '');

      const outPath = outPathForRoute(route);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`[prerender] wrote ${path.relative(distDir, outPath)} (${html.length} bytes)`);
      succeeded += 1;
    } catch (err) {
      console.warn(`[prerender] failed for ${route}: ${err?.message || err}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  await server.close();
  console.log(`[prerender] done — ${succeeded}/${ROUTES.length} routes prerendered.`);
}

run().catch((err) => {
  console.warn(`[prerender] aborted (build will continue with SPA fallback): ${err?.message || err}`);
  process.exit(0);
});
