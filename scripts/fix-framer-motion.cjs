const fs = require('fs');

let content = fs.readFileSync('components/FurnitureCollection.tsx', 'utf8');

// 1. Remove all instances of const isInView = useInView(ref, {...});
content = content.replace(/const isInView = useInView\([^;]+;\s*/g, '');

// 2. Replace animate={isInView ? { STUFF } : {}} with whileInView={{ STUFF }} viewport={{ once: true, margin: '-100px' }}
content = content.replace(/animate=\{isInView \? (\{[^}]+\}) : \{\}\}/g, 'whileInView={$1} viewport={{ once: true, margin: "-100px" }}');

// 3. Import ResponsiveImage
if (!content.includes('ResponsiveImage')) {
  content = content.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { ResponsiveImage } from './ResponsiveImage';"
  );
}

// 4. Update the Hero Image
content = content.replace(
    '<img\n          src="/assets/furniture/sofa_079.webp"\n          alt="Matteo Perin Panorama Sectional in luxury modern interior"',
    '<ResponsiveImage\n          baseSrc="/assets/furniture/furniture_hero_new.webp"\n          alt="A magnificent ultra-luxury modern Italian sectional sofa overlooking mountains"'
);

// We need to also replace the closing bracket/tag of that img.
// In FurnitureCollection.tsx:
// <img
//   src="/assets/furniture/sofa_079.webp"
//   alt="Matteo Perin Panorama Sectional in luxury modern interior"
//   className="w-full h-full object-cover"
//   fetchPriority="high"
//   loading="eager"
// />
// Let's replace the whole tag.
content = content.replace(/<img\s+src="\/assets\/furniture\/sofa_079\.webp"[^>]+>/g, 
  `<ResponsiveImage
          baseSrc="/assets/furniture/furniture_hero_new.webp"
          alt="A magnificent ultra-luxury modern Italian sectional sofa overlooking mountains"
          className="w-full h-full object-cover"
          fetchPriority="high"
          loading="eager"
        />`
);

fs.writeFileSync('components/FurnitureCollection.tsx', content);

console.log('Successfully refactored FurnitureCollection.tsx with correct JSX braces and Hero Image');
