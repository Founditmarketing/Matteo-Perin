const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inDir = 'public/assets/new couch';
const outDir = 'public/assets/furniture';

const files = fs.readdirSync(inDir).filter(f => f.toLowerCase().endsWith('.jpg'));

const sizes = { sm: 640, md: 1024, lg: 1600 };

async function processImages() {
  for (let i = 0; i < files.length; i++) {
    const file = path.join(inDir, files[i]);
    const baseName = `orfeo-new-${i+1}`;
    
    // Create base webp
    const baseWebp = path.join(outDir, `${baseName}.webp`);
    await sharp(file)
      .webp({ quality: 85 })
      .toFile(baseWebp);
    console.log(`Created: ${baseWebp}`);

    // Create variants
    for (const [suffix, width] of Object.entries(sizes)) {
      const outPath = path.join(outDir, `${baseName}-${suffix}.webp`);
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outPath);
      console.log(`Created: ${outPath}`);
    }
  }
}

processImages().catch(console.error);
