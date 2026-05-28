import fs from 'fs';
import path from 'path';

// Fix GenderSplit.tsx
let genderSplit = fs.readFileSync('components/GenderSplit.tsx', 'utf8');
if (!genderSplit.includes('MENS_LOOKBOOK_IMAGES')) {
    genderSplit = genderSplit.replace(
        "import { RevealOnScroll } from './RevealOnScroll';",
        "import { RevealOnScroll } from './RevealOnScroll';\nimport { MENS_LOOKBOOK_IMAGES, WOMENS_LOOKBOOK_IMAGES } from '../constants';"
    );
}
genderSplit = genderSplit.replace(/"\/assets\/lookbook\/look_01\.jpg"/g, "MENS_LOOKBOOK_IMAGES[0]");
genderSplit = genderSplit.replace(/"\/assets\/lookbook\/look_03\.jpg"/g, "WOMENS_LOOKBOOK_IMAGES[0]");
fs.writeFileSync('components/GenderSplit.tsx', genderSplit);

// Fix constants.ts
let constants = fs.readFileSync('constants.ts', 'utf8');
constants = constants.replace(/"\/assets\/lookbook\/look_01\.jpg"/g, "MENS_LOOKBOOK_IMAGES[0]");
constants = constants.replace(/"\/assets\/lookbook\/look_02\.jpg"/g, "MENS_LOOKBOOK_IMAGES[1]");
constants = constants.replace(/"\/assets\/lookbook\/look_03\.jpg"/g, "WOMENS_LOOKBOOK_IMAGES[0]");
constants = constants.replace(/"\/assets\/lookbook\/look_04\.jpg"/g, "MENS_LOOKBOOK_IMAGES[3] || MENS_LOOKBOOK_IMAGES[0]"); // Fallbacks
constants = constants.replace(/"\/assets\/lookbook\/look_05\.jpg"/g, "WOMENS_LOOKBOOK_IMAGES[4] || WOMENS_LOOKBOOK_IMAGES[0]");
fs.writeFileSync('constants.ts', constants);

// Fix Lookbook.tsx
let lookbook = fs.readFileSync('components/Lookbook.tsx', 'utf8');
if (!lookbook.includes('MENS_LOOKBOOK_IMAGES')) {
    lookbook = lookbook.replace(
        "import { motion, AnimatePresence } from 'framer-motion';",
        "import { motion, AnimatePresence } from 'framer-motion';\nimport { MENS_LOOKBOOK_IMAGES, WOMENS_LOOKBOOK_IMAGES } from '../constants';"
    );
}
lookbook = lookbook.replace(/`\/assets\/lookbook_new\/look_man_\${i}\.jpg`/g, "MENS_LOOKBOOK_IMAGES[(i - 1) % MENS_LOOKBOOK_IMAGES.length]");
lookbook = lookbook.replace(/`\/assets\/lookbook_new\/look_woman_\${i}\.jpg`/g, "WOMENS_LOOKBOOK_IMAGES[(i - 1) % WOMENS_LOOKBOOK_IMAGES.length]");
fs.writeFileSync('components/Lookbook.tsx', lookbook);

// Fix lightspeedService.ts
try {
    let lightspeed = fs.readFileSync('src/services/lightspeedService.ts', 'utf8');
    lightspeed = lightspeed.replace(/"\/assets\/lookbook\/look_03\.jpg"/g, '"/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_010.jpg"');
    fs.writeFileSync('src/services/lightspeedService.ts', lightspeed);
} catch (e) {
    console.log("No lightspeedService.ts found or error: ", e.message);
}

console.log("Purger complete!");
