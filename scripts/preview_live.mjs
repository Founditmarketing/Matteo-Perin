// Serves the production build locally with /api proxied to the live site,
// so the shop renders real inventory. Ctrl+C to stop.
import { preview } from 'vite';

const server = await preview({
  preview: {
    port: 4173,
    strictPort: false,
    proxy: {
      '/api': { target: 'https://www.matteoperin.com', changeOrigin: true, secure: true },
    },
  },
});

const url = server.resolvedUrls?.local?.[0] || 'http://localhost:4173/';
console.log(`\n  Matteo Perin preview running at ${url}\n  (production build + live inventory API)\n`);
