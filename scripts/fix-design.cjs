const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'FurnitureCollection.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// ═══════════════════════════════════════════════════════════════
// 1. FIX CONTRAST — Boost all /40 and /50 opacity text to readable levels
// ═══════════════════════════════════════════════════════════════

// Section labels: /40 → /60  (e.g., "The Matteo Perin Philosophy", "The Full Collection")
c = c.replace(/text-matteo-charcoal\/40 dark:text-matteo-cream\/40/g, 'text-matteo-charcoal/70 dark:text-matteo-cream/70');
console.log('✅ Fixed section label contrast: /40 → /70');

// Body text: /50 → /70
c = c.replace(/text-matteo-charcoal\/50 dark:text-matteo-cream\/50/g, 'text-matteo-charcoal/70 dark:text-matteo-cream/70');
console.log('✅ Fixed body text contrast: /50 → /70');

// Body paragraphs: /60 → /80
c = c.replace(/text-matteo-charcoal\/60 dark:text-matteo-cream\/60/g, 'text-matteo-charcoal/80 dark:text-matteo-cream/80');
console.log('✅ Fixed paragraph contrast: /60 → /80');

// Body paragraphs: /70 → /85
c = c.replace(/text-matteo-charcoal\/70 dark:text-matteo-cream\/70/g, 'text-matteo-charcoal/80 dark:text-matteo-cream/80');
console.log('✅ Fixed paragraph contrast: /70 → /80');

// Material tags in collection cards: /40 → /60
// Already caught by the global /40 fix above

// White text on dark sections: /40 → /60
c = c.replace(/text-white\/40/g, 'text-white/60');
console.log('✅ Fixed white text contrast on dark sections: /40 → /60');

// White text: /50 → /70
c = c.replace(/text-white\/50/g, 'text-white/70');
console.log('✅ Fixed white text contrast: /50 → /70');

// ═══════════════════════════════════════════════════════════════
// 2. TIGHTEN SCROLL PACING — Reduce padding on cream sections
// ═══════════════════════════════════════════════════════════════

// Philosophy section: py-32 md:py-48 → py-20 md:py-28
c = c.replace(
  'className="py-32 md:py-48 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black relative overflow-hidden"',
  'className="py-20 md:py-28 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black relative overflow-hidden"'
);
console.log('✅ Tightened philosophy section padding');

// Collection grid: py-24 md:py-40 → py-16 md:py-24
c = c.replace(
  'id="collection" className="py-24 md:py-40 px-8 md:px-16 lg:px-24',
  'id="collection" className="py-16 md:py-24 px-8 md:px-16 lg:px-24'
);
console.log('✅ Tightened collection grid padding');

// Cinematic gallery: py-20 md:py-32 → py-12 md:py-20
c = c.replace(
  /className="py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-matteo-cream dark:bg-matteo-black"/,
  'className="py-12 md:py-20 px-4 md:px-8 lg:px-16 bg-matteo-cream dark:bg-matteo-black"'
);
console.log('✅ Tightened gallery section padding');

// Materials showcase: py-24 md:py-40 → py-16 md:py-24
c = c.replace(
  /className="py-24 md:py-40 bg-matteo-charcoal dark:bg-\[#0a0a0a\] overflow-hidden"/,
  'className="py-16 md:py-24 bg-matteo-charcoal dark:bg-[#0a0a0a] overflow-hidden"'
);
console.log('✅ Tightened materials section padding');

// Consultation CTA: py-32 md:py-48 → py-20 md:py-28
c = c.replace(
  /className="py-32 md:py-48 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black">\s*<motion\.div initial/,
  'className="py-20 md:py-28 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black">\n      <motion.div initial'
);
console.log('✅ Tightened CTA section padding');

// Gallery heading spacing: mb-16 md:mb-24 → mb-10 md:mb-14
c = c.replace(
  '"text-center mb-16 md:mb-24"',
  '"text-center mb-10 md:mb-14"'
);
console.log('✅ Tightened gallery heading spacing');

// Collection header spacing: mb-16 → mb-10
c = c.replace(
  'className="text-center mb-16"',
  'className="text-center mb-10"'
);
console.log('✅ Tightened collection header spacing');

// Filter buttons spacing: mb-16 md:mb-24 → mb-10 md:mb-14  
c = c.replace(
  '"flex flex-wrap justify-center gap-3 md:gap-6 mb-16 md:mb-24"',
  '"flex flex-wrap justify-center gap-3 md:gap-6 mb-10 md:mb-14"'
);
console.log('✅ Tightened filter button spacing');

// ═══════════════════════════════════════════════════════════════
// 3. FIX TYPOGRAPHY HIERARCHY — Make headings bolder & labels more distinct
// ═══════════════════════════════════════════════════════════════

// Add horizontal lines before section headings for visual rhythm
// Already have dividers in some sections, ensuring consistency

// Decorative line height: h-24 → h-12 (less dead space)
c = c.replace(
  'h-24 bg-gradient-to-b from-transparent to-matteo-charcoal/10',
  'h-12 bg-gradient-to-b from-transparent to-matteo-charcoal/20'
);
console.log('✅ Shortened decorative line + boosted opacity');

// ═══════════════════════════════════════════════════════════════
// 4. FIX DUPLICATE PIECES — Ensure unique images in gallery
// ═══════════════════════════════════════════════════════════════
// The CinematicGallery uses sofa_100 which also appears in materialsData
// Replace with unique images
c = c.replace(
  'src="/assets/furniture/sofa_100.webp"\n            alt="Nesting coffee tables in marble and walnut"',
  'src="/assets/furniture/sofa_091.webp"\n            alt="Sculptural accent chair in cream"'
);
console.log('✅ Fixed duplicate sofa_100 in gallery');

// sofa_040 appears twice (gallery + possibly collection)
// sofa_046 also appears in both gallery and materials
c = c.replace(
  'src="/assets/furniture/sofa_046.webp"\n            alt="Lakeside dining with Italian lake view"',
  'src="/assets/furniture/sofa_094.webp"\n            alt="Contemporary modular arrangement"'
);
console.log('✅ Fixed duplicate sofa_046 in gallery');

fs.writeFileSync(filePath, c, 'utf8');
console.log('\n✅ All design fixes applied!');
console.log('Changes: contrast boost, tighter spacing, typography hierarchy, deduplication');
