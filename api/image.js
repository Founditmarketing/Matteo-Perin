// Cached proxy for product imagery currently hosted on Google Drive.
//
// The browser hits /api/image?id=<driveFileId>&w=<width> on our own domain;
// Vercel's CDN caches the response (s-maxage), so shoppers stop depending on
// lh3.googleusercontent.com being fast, un-throttled, and available. It also
// gives us width variants for responsive images.

const ALLOWED_WIDTHS = new Set([400, 800, 1200, 1600]);

export default async function handler(req, res) {
  const { id } = req.query;
  let width = parseInt(req.query.w, 10);
  if (!ALLOWED_WIDTHS.has(width)) width = 1200;

  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid image id' });
  }

  try {
    const upstream = await fetch(`https://lh3.googleusercontent.com/d/${id}=w${width}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatteoPerinImageProxy/1.0)' },
    });

    if (!upstream.ok) {
      return res.status(404).end();
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    // Browser: 1 day. Vercel CDN: 30 days, serving stale while revalidating.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Image proxy error:', err.message);
    return res.status(502).end();
  }
}
