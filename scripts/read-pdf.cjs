const fs = require('fs');

// Simple PDF text extraction without external deps
// PDFs store text in streams - we'll extract readable text manually
const buf = fs.readFileSync('source_pdfs/MATTEO PERIN.pdf');
const str = buf.toString('latin1');

// Extract text between BT and ET markers (PDF text objects)
const textBlocks = [];
const btRegex = /BT\s([\s\S]*?)ET/g;
let match;
while (match = btRegex.exec(str)) {
  const block = match[1];
  // Extract text from Tj and TJ operators
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let tjMatch;
  while (tjMatch = tjRegex.exec(block)) {
    if (tjMatch[1].trim()) textBlocks.push(tjMatch[1].trim());
  }
  // Also check TJ arrays
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  let arrMatch;
  while (arrMatch = tjArrayRegex.exec(block)) {
    const parts = arrMatch[1].match(/\(([^)]*)\)/g);
    if (parts) {
      const text = parts.map(p => p.slice(1, -1)).join('');
      if (text.trim()) textBlocks.push(text.trim());
    }
  }
}

// Deduplicate and print
const unique = [...new Set(textBlocks)];
console.log('Extracted text from brochure (' + unique.length + ' blocks):');
unique.forEach(t => console.log(t));
