// One-shot: renders key routes from the built dist (with /api proxied to
// production, same trick as prerender.mjs) and saves clipped screenshots for
// a design review. Output: .cache/design-shots/*.jpg
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', '.cache', 'design-shots');
fs.mkdirSync(outDir, { recursive: true });

const PRODUCTION_API = 'https://www.matteoperin.com';

const slugify = (name) =>
  String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function firstProductSlug() {
  try {
    const res = await fetch(`${PRODUCTION_API}/api/inventory`);
    const payload = await res.json();
    for (const row of payload.data || []) {
      const hasTitle = row.Title && String(row.Title).trim() !== '';
      const hasCategory = row.Category && String(row.Category).trim() !== '';
      const hasPrice = row.Price && String(row.Price).trim() !== '';
      if (hasTitle && !hasCategory && !hasPrice) return slugify(row.Title);
    }
  } catch (e) {
    console.warn('inventory fetch failed:', e.message);
  }
  return null;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 700;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
}

async function run() {
  const server = await preview({
    preview: {
      port: 4399,
      strictPort: false,
      proxy: { '/api': { target: PRODUCTION_API, changeOrigin: true, secure: true } },
    },
  });
  const base = (server.resolvedUrls?.local?.[0] || 'http://localhost:4399').replace(/\/$/, '');
  console.log('preview at', base);

  const productSlug = await firstProductSlug();
  console.log('product slug:', productSlug);

  let desktopRoutes = ['/', '/shop', '/bespoke-crocodile-jacket', '/lookbook/men', '/the-house', '/bespoke', '/furniture'];
  if (productSlug) desktopRoutes.push(`/shop/${productSlug}`);
  let mobileRoutes = ['/', '/shop', '/bespoke-crocodile-jacket'];
  if (productSlug) mobileRoutes.push(`/shop/${productSlug}`);

  // Optional CLI filter: `node scripts/design_screenshots.mjs / /shop` shoots only those routes.
  const only = process.argv.slice(2);
  if (only.length > 0) {
    desktopRoutes = desktopRoutes.filter((r) => only.includes(r));
    mobileRoutes = mobileRoutes.filter((r) => only.includes(r));
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  async function shoot(route, viewport, tag, maxH) {
    const page = await browser.newPage();
    try {
      await page.setViewport(viewport);
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      }, { timeout: 20000 });
      await autoScroll(page);
      const fullH = await page.evaluate(() => document.body.scrollHeight);
      const clipH = Math.min(fullH, maxH);
      const name = (route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_')) + `-${tag}.jpg`;
      await page.screenshot({
        path: path.join(outDir, name),
        type: 'jpeg',
        quality: 68,
        clip: { x: 0, y: 0, width: viewport.width, height: clipH },
      });
      console.log('shot', name, `(${viewport.width}x${clipH} of ${fullH})`);
    } catch (e) {
      console.warn('failed', route, tag, e.message);
    } finally {
      await page.close();
    }
  }

  for (const r of desktopRoutes) await shoot(r, { width: 1440, height: 900 }, 'desktop', 5200);
  for (const r of mobileRoutes) await shoot(r, { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'mobile', 6200);

  await browser.close();
  await server.close();
  console.log('done ->', outDir);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
