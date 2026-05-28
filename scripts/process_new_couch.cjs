const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = path.join(__dirname, 'public/assets/new couch');
const outDir = path.join(__dirname, 'public/assets/furniture');

// Map the raw JPGs to clean filenames
const fileMap = {
  '0b246f02-cec0-4502-afae-8c89eb4850f9[1].JPG': 'brochure-couch-1',   // Front view, blue-grey, with logo
  '11d12c49-8857-4325-851b-7dfc75b09241[1].JPG': 'brochure-couch-2',   // 3/4 angle, blue-grey
  'dce96711-f3d1-404d-a207-7c9945dd5ba9[1].JPG': 'brochure-couch-3',   // Detail/close-up, blue-grey
  'ea97133f-935d-40dc-b8d3-1b43c652f8e4[1].JPG': 'brochure-couch-4',   // Front view, cream, with logo
};

const sizes = {
  sm: 640,
  md: 1024,
  lg: 1600,
};

async function process() {
  for (const [src, baseName] of Object.entries(fileMap)) {
    const srcPath = path.join(srcDir, src);
    if (!fs.existsSync(srcPath)) {
      console.error(`Missing: ${srcPath}`);
      continue;
    }

    // Create the base webp
    const baseOut = path.join(outDir, `${baseName}.webp`);
    await sharp(srcPath)
      .webp({ quality: 88 })
      .toFile(baseOut);
    console.log(`Created base: ${baseOut}`);

    // Create responsive variants
    for (const [suffix, width] of Object.entries(sizes)) {
      const outPath = path.join(outDir, `${baseName}-${suffix}.webp`);
      await sharp(srcPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outPath);
      console.log(`  ${suffix}: ${outPath}`);
    }
  }
  console.log('\nDone! All new couch images processed.');
}

process().catch(console.error);
