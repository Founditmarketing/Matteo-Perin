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
  '/shop',
  '/bespoke-crocodile-jacket',
  '/lookbook/men',
  '/lookbook/women',
  '/the-house',
  '/bespoke',
  '/press',
  '/journal',
  '/enquire',
  // /lifestyle and /furniture now redirect in the SPA (→ /the-house and
  // /casa); prerendering redirect shells would emit soft-duplicate HTML.
  '/casa',
  '/collection',
  '/shipping-returns',
  // Journal articles are intentionally NOT prerendered or emitted to the
  // sitemap: /journal/:slug is unpublished (noindex + redirect to /journal)
  // until real essays exist. Restore the slugs here when they do.
];

// Live inventory API used to render real products (names, prices, schema)
// into the prerendered /shop and /shop/<product> HTML.
const PRODUCTION_API = 'https://www.matteoperin.com';

// Fetch the live inventory ONCE (with retries) at build time. The snapshot is
// used both to discover product routes and to answer every page's
// /api/inventory request during prerender — so a flaky Sheets-backed API
// can't poison individual page renders.
async function fetchInventorySnapshot() {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${PRODUCTION_API}/api/inventory`);
      if (!res.ok) throw new Error(`inventory API returned ${res.status}`);
      const payload = await res.json();
      if (!Array.isArray(payload.data)) throw new Error('unexpected payload shape');
      return payload;
    } catch (err) {
      console.warn(`[prerender] inventory fetch attempt ${attempt}/4 failed: ${err?.message || err}`);
      if (attempt < 4) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return null;
}

// Parent products are rows with a Title but no Category/Price
// (mirrors the grouping logic in HiddenInventoryTest.tsx).
// Routes use slugs ("/shop/ostrich-bucket-bag") — keep in sync with src/lib/slug.ts.
function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getProductRoutes(inventoryPayload) {
  if (!inventoryPayload) return [];
  const names = [];
  for (const row of inventoryPayload.data || []) {
    const hasTitle = row.Title && String(row.Title).trim() !== '';
    const hasCategory = row.Category && String(row.Category).trim() !== '';
    const hasPrice = row.Price && String(row.Price).trim() !== '';
    if (hasTitle && !hasCategory && !hasPrice) {
      names.push(String(row.Title).trim());
    }
  }
  return names.map((n) => `/shop/${slugify(n)}`);
}

function outPathForRoute(route) {
  if (route === '/') return path.join(distDir, 'index.html');
  // Decode so /shop/Encoded%20Name writes to dist/shop/Encoded Name/index.html
  // (Vercel decodes the URL before filesystem lookup).
  const decoded = decodeURIComponent(route.replace(/^\//, ''));
  return path.join(distDir, decoded, 'index.html');
}

async function run() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — skipping prerender.');
    return;
  }

  const server = await preview({
    preview: {
      port: 4173,
      strictPort: false,
      // Proxy API calls to production during prerender so the shop and
      // product pages render with real, live inventory.
      proxy: {
        '/api': { target: PRODUCTION_API, changeOrigin: true, secure: true },
      },
    },
  });

  const urls = server.resolvedUrls?.local || [];
  const base = (urls[0] || 'http://localhost:4173').replace(/\/$/, '');
  console.log(`[prerender] preview server at ${base}`);

  const browser = await launchBrowser();

  const inventorySnapshot = await fetchInventorySnapshot();
  const productRoutes = getProductRoutes(inventorySnapshot);
  if (productRoutes.length > 0) {
    console.log(`[prerender] discovered ${productRoutes.length} product route(s) from live inventory`);
  }
  const allRoutes = [...ROUTES, ...productRoutes];

  async function renderRoute(route) {
    const page = await browser.newPage();
    try {
      // Serve the build-time inventory snapshot for every /api/inventory call
      // so page renders never depend on the upstream API being responsive.
      if (inventorySnapshot) {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (req.url().includes('/api/inventory')) {
            req.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(inventorySnapshot),
            });
          } else {
            req.continue();
          }
        });
      }

      await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 45000 });

      // Wait until React has actually rendered something into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        },
        { timeout: 20000 }
      );

      // Shop routes: wait for the live inventory to actually render so
      // product names and prices end up in the static HTML.
      if (route === '/' || route.startsWith('/shop')) {
        await page
          .waitForFunction(
            // innerText reflects CSS text-transform, so match case-insensitively
            () => /shop this piece|add to bag|sold out|no inventory available|being updated|product not found/i.test(document.body.innerText),
            { timeout: 20000 }
          )
          .catch(() => console.warn(`[prerender] ${route}: inventory didn't render in time.`));
      }

      // Give Helmet + above-the-fold animations a moment to settle.
      await new Promise((r) => setTimeout(r, 2500));

      // Safety: never ship a snapshot that captured the startup error overlay.
      const hasError = await page.evaluate(() =>
        document.body.innerText.includes('CRITICAL STARTUP ERROR') ||
        document.body.innerText.includes('App Crashed')
      );
      if (hasError) throw new Error('rendered an error overlay');

      // Product pages: a flaky inventory response renders the not-found state
      // with the homepage's default meta. Throw so the attempt loop retries —
      // never write that shell to disk for a product URL.
      if (route.startsWith('/shop/')) {
        const isNotFound = await page.evaluate(() =>
          /product not found|being updated/i.test(document.body.innerText)
        );
        if (isNotFound) throw new Error('product page rendered not-found state');
      }

      // De-duplicate metas that exist both as static index.html defaults and
      // as route-specific Helmet tags (marked data-rh): keep the Helmet one.
      await page.evaluate(() => {
        const dedupe = (selector) => {
          if (document.querySelector(`${selector}[data-rh="true"]`)) {
            document
              .querySelectorAll(`${selector}:not([data-rh="true"])`)
              .forEach((el) => el.remove());
          }
        };
        dedupe('meta[name="description"]');
        dedupe('meta[property="og:image"]');
        dedupe('meta[name="twitter:image"]');
        // The static og:image:width/height describe the static og:image —
        // once a Helmet og:image wins, they lie about the wrong file. Drop
        // the static pair unless the route supplies its own (data-rh) pair.
        if (document.querySelector('meta[property="og:image"][data-rh="true"]')) {
          dedupe('meta[property="og:image:width"]');
          dedupe('meta[property="og:image:height"]');
          document
            .querySelectorAll('meta[property="og:image:width"]:not([data-rh="true"]), meta[property="og:image:height"]:not([data-rh="true"])')
            .forEach((el) => el.remove());
        }
      });

      return '<!DOCTYPE html>\n' + (await page.content()).replace(/^<!DOCTYPE html>/i, '');
    } finally {
      await page.close();
    }
  }

  const MAX_ATTEMPTS = 3;
  let succeeded = 0;
  const renderedRoutes = [];
  for (const route of allRoutes) {
    let html = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !html; attempt++) {
      try {
        html = await renderRoute(route);
      } catch (err) {
        console.warn(`[prerender] ${route} attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err?.message || err}`);
        if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (!html) continue;

    const outPath = outPathForRoute(route);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`[prerender] wrote ${path.relative(distDir, outPath)} (${html.length} bytes)`);
    succeeded += 1;
    renderedRoutes.push(route);
  }

  await browser.close();
  await server.close();
  console.log(`[prerender] done — ${succeeded}/${allRoutes.length} routes prerendered.`);

  writeSitemap(renderedRoutes);
}

// Regenerate sitemap.xml from the routes that actually rendered, so product
// pages discovered from live inventory are always listed. The static
// public/sitemap.xml remains the fallback if prerendering aborts.
function writeSitemap(routes) {
  if (!routes || routes.length === 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const priorityFor = (r) =>
    r === '/' ? '1.0'
      : r === '/shop' || r === '/bespoke-crocodile-jacket' || r.startsWith('/lookbook') ? '0.9'
        : r.startsWith('/shop/') ? '0.8'
          : r.startsWith('/journal/') ? '0.5'
            : '0.7';
  const changefreqFor = (r) =>
    r === '/shop' || r.startsWith('/shop/') ? 'daily' : r === '/' ? 'weekly' : 'monthly';

  const urls = routes
    .map((r) => {
      const loc = r === '/' ? 'https://www.matteoperin.com/' : `https://www.matteoperin.com${r}`;
      return `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${today}</lastmod>\n        <changefreq>${changefreqFor(r)}</changefreq>\n        <priority>${priorityFor(r)}</priority>\n    </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`[prerender] wrote sitemap.xml (${routes.length} urls)`);
}

run().catch((err) => {
  console.warn(`[prerender] aborted (build will continue with SPA fallback): ${err?.message || err}`);
  process.exit(0);
});
