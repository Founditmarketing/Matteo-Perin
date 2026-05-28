const fs = require('fs');

function patch(filePath, replaceFn) {
  let c = fs.readFileSync(filePath, 'utf8');
  c = replaceFn(c);
  fs.writeFileSync(filePath, c);
}

// 1. Pass style prop in ResponsiveImage
patch('components/ResponsiveImage.tsx', (content) => {
  // Pass to fallback img and picture inner img
  return content.replace(/draggable=\{draggable\}\s*\/\>/g, 'draggable={draggable}\n        style={style}\n      />');
});

// 2. Ensure Lookbooks have ResponsiveImage imported properly
['components/MensLookbook.tsx', 'components/WomensLookbook.tsx'].forEach(file => {
  patch(file, (content) => {
    if (!content.includes('import { ResponsiveImage }')) {
       // Search for import { motion } and inject above it
       return content.replace(/import\s+\{\s*motion/g, "import { ResponsiveImage } from './ResponsiveImage';\nimport { motion");
    }
    return content;
  });
});

console.log("Crash patches applied successfully.");
