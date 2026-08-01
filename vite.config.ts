import path from 'path';
import { pathToFileURL } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const vercelApiMock = () => ({
  name: 'vercel-api-mock',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Ignore non-API requests and Lightspeed proxy
      if (!req.url?.startsWith('/api/') || req.url?.startsWith('/api/lightspeed')) {
        return next();
      }

      const filePath = req.url.split('?')[0];

      // Handle both GET and POST API requests
      if (req.method === 'GET' || req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            if (body) req.body = JSON.parse(body);
            
            // Mock Vercel response helpers
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            // Dynamically import the Vercel serverless function via Vite's module runner
            // Try .ts first (TypeScript serverless functions), then .js
            let module;
            try {
              module = await server.ssrLoadModule(`.${filePath}.ts`);
            } catch (_) {
              module = await server.ssrLoadModule(`.${filePath}.js`);
            }
            
            if (module.default) {
              await module.default(req, res);
            } else {
              res.status(404).json({ error: 'Function not exported correctly' });
            }
          } catch (err) {
            console.error("Vite Local API Mock Error:", err);
            res.status(500).json({ error: err.message });
          }
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Inject necessary API Keys into node process env for local Vercel function simulation
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  
  return {
    server: {
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/lightspeed': {
          target: `https://${env.VITE_LIGHTSPEED_DOMAIN}.retail.lightspeed.app`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/lightspeed/, '/api/2.0'),
          headers: {
            'Authorization': `Bearer ${env.VITE_LIGHTSPEED_TOKEN}`
          }
        }
      }
    },
    plugins: [react(), vercelApiMock()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      // Target modern browsers for smaller output
      target: 'es2020',
      // Suppress the 500KB warning (we handle it with manualChunks)
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          // Function form: the array form silently failed to capture React
          // (it shipped inside the router chunk while react-vendor built
          // empty). Match by module path so each vendor lands where intended;
          // everything else (markdown, supabase, ...) splits automatically
          // along the React.lazy boundaries.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return;
            const path = id.replace(/\\/g, '/');
            if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react-vendor';
            if (/\/node_modules\/(react-router|react-router-dom|@remix-run)\//.test(path)) return 'router';
            if (path.includes('/node_modules/framer-motion/')) return 'framer-motion';
          }
        }
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
    }
  };
});

// Force restart: 2026-07-01 pick up new tailwind ink tokens
