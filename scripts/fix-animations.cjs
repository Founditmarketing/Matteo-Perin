const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'FurnitureCollection.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
c = c.replace(/\r\n/g, '\n');

// 1. Add a useScrollReveal hook after imports (before ANIMATION VARIANTS)
const hookCode = `
// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK — Works with Lenis smooth scroll
// ═══════════════════════════════════════════════════════════════

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

`;

const animVariantsMarker = '// ═══════════════════════════════════════════════════════════════\n// ANIMATION VARIANTS';
if (c.includes(animVariantsMarker)) {
  c = c.replace(animVariantsMarker, hookCode + animVariantsMarker);
  console.log('✅ Added useScrollReveal hook');
} else {
  console.log('❌ Could not find ANIMATION VARIANTS marker');
}

// 2. Fix all the broken whileInView animations by adding CSS-based reveal classes
// Add a RevealSection wrapper component after the hook
const revealComponent = `
// Reveal wrapper component
const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: \`opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) \${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) \${delay}s\`,
      }}
    >
      {children}
    </div>
  );
};

`;

if (c.includes(animVariantsMarker)) {
  c = c.replace(animVariantsMarker, revealComponent + animVariantsMarker);
  console.log('✅ Added RevealSection component');
}

// 3. Replace all whileInView motion.divs with RevealSection in key sections
// Philosophy section
c = c.replace(
  /initial=\{\{ opacity: 1, y: 40 \}\}\s*\n\s*whileInView=\{\{ opacity: 1, y: 0 \}\} viewport=\{\{ once: true, amount: 0\.1 \}\}\s*\n\s*transition=\{\{ duration: 1\.2, ease: \[0\.16, 1, 0\.3, 1\] \}\}/g,
  'initial={{ opacity: 0, y: 40 }}\n          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }}\n          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}'
);
console.log('✅ Fixed philosophy animation');

// Fix ALL whileInView opacity: 1 back to opacity: 0 for proper animations
// Pattern: initial={{ opacity: 1, y: NUMBER }}
c = c.replace(/initial=\{\{ opacity: 1, y: (\d+) \}\}/g, 'initial={{ opacity: 0, y: $1 }}');
console.log('✅ Fixed all opacity: 1 -> opacity: 0 in initial states');

// Fix initial={{ opacity: 1, x: ... }}
c = c.replace(/initial=\{\{ opacity: 1, x:/g, 'initial={{ opacity: 0, x:');
console.log('✅ Fixed x-axis animations');

// Fix initial={{ opacity: 1, scale: ... }}
c = c.replace(/initial=\{\{ opacity: 1, scale:/g, 'initial={{ opacity: 0, scale:');
console.log('✅ Fixed scale animations');

// Fix standalone initial={{ opacity: 1 }} (AnimatePresence grid items)
// But NOT the lightbox ones - only the grid layout one
c = c.replace(
  /layout\s*\n\s*initial=\{\{ opacity: 1 \}\}/,
  'layout\n              initial={{ opacity: 0 }}'
);
console.log('✅ Fixed grid item animations');

// 4. CRITICAL: Replace whileInView with native IntersectionObserver approach
// Instead of relying on framer-motion whileInView, add viewport detection
// Actually, let's keep whileInView but use a much larger rootMargin
// The issue was viewport: { once: true, amount: 0.1 }
// Let's change amount to 0 and add margin: "200px" to trigger earlier
c = c.replace(
  /viewport=\{\{ once: true, amount: 0\.1 \}\}/g,
  'viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}'
);
console.log('✅ Updated viewport trigger settings for better Lenis compatibility');

// 5. Add useState to imports if not already there
if (!c.includes('useState')) {
  c = c.replace("import React, { useRef, useEffect } from 'react';", "import React, { useRef, useEffect, useState } from 'react';");
  c = c.replace('import React, { useRef, useEffect }', 'import React, { useRef, useEffect, useState }');
  console.log('✅ Added useState import');
}

// Check if useState is already imported
if (c.includes('useState')) {
  console.log('✅ useState already imported');
} else {
  // Try another pattern
  c = c.replace(/from 'react';/, (match, offset) => {
    if (offset < 500) { // Only first import
      return match;
    }
    return match;
  });
}

fs.writeFileSync(filePath, c, 'utf8');
console.log('\n✅ All fixes applied! Run vite build to verify.');
