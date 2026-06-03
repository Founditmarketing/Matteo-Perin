import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../public/assets');

// Configuration for modern responsive breakpoints
const BREAKPOINTS = [
  { suffix: '-sm', width: 640 },
  { suffix: '-md', width: 1024 },
  { suffix: '-lg', width: 1920 }
];

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file) && !file.includes('-sm') && !file.includes('-md') && !file.includes('-lg')) {
      const parsed = path.parse(fullPath);
      console.log(`Processing base file: ${file}`);
      
      try {
        const image = sharp(fullPath);
        const metadata = await image.metadata();

        // Generate responsive WebP variants
        for (const bp of BREAKPOINTS) {
          const bpPath = path.join(parsed.dir, `${parsed.name}${bp.suffix}.webp`);
          
          if (!fs.existsSync(bpPath)) {
            const width = Math.min(metadata.width, bp.width); // Prevent upscaling
            
            await image
              .resize(width, null, { withoutEnlargement: true })
              .webp({ quality: 80, effort: 6 })
              .toFile(bpPath);
            
            console.log(`  -> Created ${bp.suffix} variant`);
          }
        }
        
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
}

async function run() {
  console.log('Starting responsive image generation pipeline...');
  await processDirectory(ASSETS_DIR);
  console.log('Pipeline complete.');
}

run();
