const fs = require('fs');

function patchFile(filePath, processFn) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = processFn(content);
  fs.writeFileSync(filePath, content);
}

// 1. Navigation.tsx
patchFile('components/Navigation.tsx', (content) => {
  return content.replace('fixed inset-0 z-[100001]', 'fixed top-0 left-0 w-full h-[100dvh] z-[100001]');
});

// 2. FurnitureCollection.tsx
patchFile('components/FurnitureCollection.tsx', (content) => {
  // Fix the blackout margin
  content = content.replace(/margin: "-100px"/g, 'amount: 0.1');

  // Convert standard imgs to ResponsiveImage
  content = content.replace(/<img/g, '<ResponsiveImage');
  content = content.replace(/src=/g, 'baseSrc=');
  
  // Actually, we previously injected <ResponsiveImage ... /> for the Hero manually using multi_replace.
  // Wait! If I did that, the Hero ResponsiveImage has `baseSrc=`. 
  // If my script replaces `src=` with `baseSrc=`, it would change `baseSrc=` to `baseBaseSrc=`.
  // Let's refine it:
  content = content.replace(/baseBaseSrc=/g, 'baseSrc='); // Fix any double replacement

  // Ensure import exists
  if (!content.includes('import { ResponsiveImage }')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { ResponsiveImage } from './ResponsiveImage';");
  }

  // Hero viewport clip fix
  content = content.replace('h-[110vh]', 'h-[100dvh]');
  // Hero center format fix
  // Replace the first instance of 'object-cover' (which is the hero) with 'object-cover object-center'
  // Or just replace all of them, object-center is good for all images.
  content = content.replace(/className="w-full h-full object-cover"/g, 'className="w-full h-full object-cover object-center"');

  // Change the hero image back to sofa_079.webp
  content = content.replace('baseSrc="/assets/furniture/furniture_hero_new.webp"', 'baseSrc="/assets/furniture/sofa_079.webp"');

  return content;
});

// 3. Collection.tsx (Homepage grid images)
patchFile('components/Collection.tsx', (content) => {
  content = content.replace(/<img/g, '<ResponsiveImage');
  content = content.replace(/src=/g, 'baseSrc=');
  content = content.replace(/baseBaseSrc=/g, 'baseSrc='); 
  
  if (!content.includes('import { ResponsiveImage }')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { ResponsiveImage } from './ResponsiveImage';");
  }
  return content;
});

// 4. MensLookbook.tsx and WomensLookbook.tsx
['components/MensLookbook.tsx', 'components/WomensLookbook.tsx'].forEach(file => {
  patchFile(file, (content) => {
    content = content.replace(/<img/g, '<ResponsiveImage');
    content = content.replace(/src=/g, 'baseSrc=');
    content = content.replace(/baseBaseSrc=/g, 'baseSrc='); 
    
    if (!content.includes('import { ResponsiveImage }')) {
      // Find the first line with react or framer-motion import to inject
      content = content.replace("import { motion", "import { ResponsiveImage } from './ResponsiveImage';\nimport { motion");
    }
    return content;
  });
});

console.log('Mobile optimizations fully deployed to components.');
