const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'FurnitureCollection.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// Count initial opacity:0 instances
const before = (c.match(/initial=\{\{[^}]*opacity:\s*0/g) || []).length;
console.log(`Found ${before} elements with initial opacity: 0`);

// Fix 1: Replace all initial={{ opacity: 0, ... }} with opacity: 1
// This ensures everything is visible even if whileInView never fires
c = c.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*(\d+)\s*\}\}/g, 'initial={{ opacity: 1, y: 0 }}');
c = c.replace(/initial=\{\{\s*opacity:\s*0,\s*x:\s*(-?\d+)\s*\}\}/g, 'initial={{ opacity: 1, x: 0 }}');
c = c.replace(/initial=\{\{\s*opacity:\s*0,\s*scale:\s*[\d.]+\s*\}\}/g, 'initial={{ opacity: 1, scale: 1 }}');
c = c.replace(/initial=\{\{\s*opacity:\s*0\s*\}\}/g, 'initial={{ opacity: 1 }}');
c = c.replace(/initial=\{\{\s*opacity:\s*0\.8\s*\}\}/g, 'initial={{ opacity: 1 }}');

// Fix 2: Remove whileInView that duplicates (since initial now matches the target state)
// Actually keep whileInView - it won't hurt, and if it does fire it'll just re-set opacity:1

const after = (c.match(/initial=\{\{[^}]*opacity:\s*0/g) || []).length;
console.log(`After fix: ${after} elements with initial opacity: 0`);

// Fix 3: Also fix the stagger container variants if they set opacity: 0
c = c.replace(/hidden:\s*\{\s*opacity:\s*0\s*\}/g, 'hidden: { opacity: 1 }');
console.log('Fixed stagger container hidden variants');

// Fix 4: Fix fadeUpVariant - the hero entry animation
// Keep the hero animation working by NOT touching named variants
// Actually, the hero is fine since it uses animate="visible" not whileInView

// Fix 5: Check for any remaining opacity: 0 in initial states
const remaining = c.match(/initial=\{\{[^}]*opacity:\s*0/g);
if (remaining) {
  console.log('WARNING: Still have opacity:0 in:', remaining);
} else {
  console.log('✅ All opacity:0 initial states eliminated');
}

fs.writeFileSync(filePath, c, 'utf8');
console.log('\n✅ Scroll animation fix complete - all sections now visible by default');
