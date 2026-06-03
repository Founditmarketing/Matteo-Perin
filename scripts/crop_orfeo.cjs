const sharp = require('sharp');
const path = require('path');

const src = 'public/assets/IMG_20260416_155501.jpg';

async function cropImages() {
  const meta = await sharp(src).metadata();
  console.log(`Image: ${meta.width}x${meta.height}`);
  
  const w = meta.width;
  const h = meta.height;

  // Top hero image - the large couch photo (top ~48% of image, right ~65%)
  await sharp(src)
    .extract({ left: Math.round(w * 0.3), top: 0, width: Math.round(w * 0.7), height: Math.round(h * 0.48) })
    .webp({ quality: 88 })
    .toFile('public/assets/furniture/orfeo-hero.webp');
  console.log('Cropped: orfeo-hero.webp');

  // Bottom-center detail image
  await sharp(src)
    .extract({ left: Math.round(w * 0.37), top: Math.round(h * 0.5), width: Math.round(w * 0.3), height: Math.round(h * 0.48) })
    .webp({ quality: 88 })
    .toFile('public/assets/furniture/orfeo-detail-1.webp');
  console.log('Cropped: orfeo-detail-1.webp');

  // Bottom-right detail image
  await sharp(src)
    .extract({ left: Math.round(w * 0.68), top: Math.round(h * 0.5), width: Math.round(w * 0.32), height: Math.round(h * 0.48) })
    .webp({ quality: 88 })
    .toFile('public/assets/furniture/orfeo-detail-2.webp');
  console.log('Cropped: orfeo-detail-2.webp');
}

cropImages().catch(console.error);
