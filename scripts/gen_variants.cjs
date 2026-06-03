const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const files = [
  'public/assets/furniture/orfeo-hero.webp',
  'public/assets/furniture/orfeo-detail-1.webp',
  'public/assets/furniture/orfeo-detail-2.webp',
];

const sizes = {
  sm: 640,
  md: 1024,
  lg: 1600,
};

async function generate() {
  for (const file of files) {
    const dir = path.dirname(file);
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    
    for (const [suffix, width] of Object.entries(sizes)) {
      const outPath = path.join(dir, `${base}-${suffix}.webp`);
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outPath);
      console.log(`Created: ${outPath}`);
    }
  }
}

generate().catch(console.error);
