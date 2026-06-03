const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;

// 1. Build
console.log('🔨 Building...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

// 2. Set up Vercel Build Output API structure
const outputDir = path.join(root, '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');

// Clean and create
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Write config
fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify({ version: 3, routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/index.html" }] }, null, 2));

// Copy dist to static
console.log('📦 Copying dist to .vercel/output/static...');
copyRecursive(path.join(root, 'dist'), staticDir);

console.log('✅ Build output ready');

// 3. Deploy
console.log('🚀 Deploying...');
execSync('npx vercel deploy --prebuilt --prod --yes', { cwd: root, stdio: 'inherit' });

console.log('✅ Deploy complete!');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
