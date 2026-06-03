import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const constantsPath = path.join(__dirname, '../constants.ts');
let content = fs.readFileSync(constantsPath, 'utf8');

const regex = /\/assets\/[^"']+\.(jpg|jpeg|png|avif)/g;
content = content.replace(regex, (match) => {
  const diskPath = path.join(__dirname, '../public', match);
  const parsed = path.parse(diskPath);
  const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
  
  if (fs.existsSync(webpPath)) {
    return match.replace(/\.(jpg|jpeg|png|avif)$/, '.webp');
  }
  return match;
});

fs.writeFileSync(constantsPath, content);
console.log('constants.ts updated successfully with webp references where available.');
