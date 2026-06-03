const fs = require('fs');
const path = require('path');

const renames = [
  { old: 'public/assets/Generated Video April 11, 2026 - 8_38PM.mp4', new: 'public/assets/casa-hero-desktop.mp4' },
  { old: 'public/assets/Generated Video April 11, 2026 - 8_37PM.mp4', new: 'public/assets/casa-hero-mobile.mp4' },
  { old: 'public/Generated Video April 11, 2026 - 8_00PM.mp4', new: 'public/assets/house-hero.mp4' },
];

for (const r of renames) {
  if (fs.existsSync(r.old)) {
    fs.renameSync(r.old, r.new);
    console.log(`Renamed: ${r.old} -> ${r.new}`);
  } else {
    // If we already renamed it or the user dropped it somewhere else, let's search for it
    console.log(`File not found: ${r.old}`);
  }
}
