const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pubDir = path.join(__dirname, 'public');
const furnitureDir = path.join(pubDir, 'assets', 'furniture');

// Find all Generated Video files
const vids = fs.readdirSync(pubDir).filter(f => f.endsWith('.mp4') && f.startsWith('Generated'));
console.log(`Found ${vids.length} new videos:`);
vids.forEach((v, i) => {
  const stats = fs.statSync(path.join(pubDir, v));
  console.log(`  ${i+1}. ${v} (${(stats.size/1024/1024).toFixed(1)} MB)`);
});

// Copy them as casa-hero-3, casa-hero-4, etc.
vids.sort();
let nextNum = 3; // hero-1 and hero-2 already exist
vids.forEach(v => {
  const src = path.join(pubDir, v);
  const dest = path.join(furnitureDir, `casa-hero-${nextNum}.mp4`);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${v} -> casa-hero-${nextNum}.mp4`);
  } else {
    console.log(`Already exists: casa-hero-${nextNum}.mp4`);
  }
  nextNum++;
});

// List all casa-hero videos
const heroVids = fs.readdirSync(furnitureDir).filter(f => f.match(/casa-hero-\d+\.mp4/)).sort();
console.log(`\nAll hero videos (${heroVids.length}):`);
heroVids.forEach(v => {
  const stats = fs.statSync(path.join(furnitureDir, v));
  console.log(`  ${v}: ${(stats.size/1024/1024).toFixed(1)} MB`);
});

// Try to detect aspect ratio using a simple probe
// We'll check file size as a rough heuristic - portrait videos tend to be smaller
// For proper detection we'd need ffprobe
heroVids.forEach(v => {
  const fullPath = path.join(furnitureDir, v);
  try {
    // Try ffprobe if available
    const result = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${fullPath}"`, { encoding: 'utf8', timeout: 5000 });
    const [w, h] = result.trim().split(',').map(Number);
    const aspect = w > h ? 'landscape (desktop)' : 'portrait (mobile)';
    console.log(`  ${v}: ${w}x${h} = ${aspect}`);
  } catch(e) {
    console.log(`  ${v}: Could not detect resolution (ffprobe not available)`);
  }
});
