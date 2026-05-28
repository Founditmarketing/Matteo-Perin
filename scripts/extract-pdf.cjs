const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function extractPDFImages(pdfPath, outputDir) {
  const data = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(data);
  
  console.log(`PDF: ${path.basename(pdfPath)}`);
  console.log(`Pages: ${pdf.getPageCount()}`);
  console.log(`Title: ${pdf.getTitle() || 'N/A'}`);
  console.log(`Subject: ${pdf.getSubject() || 'N/A'}`);
  
  // Try to extract text content from each page  
  const pages = pdf.getPages();
  
  // Extract embedded images
  const images = [];
  
  // Iterate through all pages and extract text operations
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    console.log(`\nPage ${i+1}: ${Math.round(width)}x${Math.round(height)}`);
    
    // Get all content streams and try to find text
    try {
      const rawContent = page.node.get(require('pdf-lib').PDFName.of('Contents'));
      if (rawContent) {
        console.log(`  Has content stream: yes`);
      }
    } catch(e) {
      // ignore
    }
  }
  
  // Try another approach - look for form fields and annotations
  const form = pdf.getForm();
  const fields = form.getFields();
  if (fields.length > 0) {
    console.log('\nForm fields found:');
    fields.forEach(f => console.log(`  ${f.getName()}: ${f.constructor.name}`));
  }
  
  console.log('\n=== EMBEDDED FONTS ===');
  // Check for fonts which hint at text content
}

// Find the newest PDF
const publicDir = 'public';
const pdfs = [];

function findPDFs(dir) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) findPDFs(full);
      else if (item.name.toLowerCase().endsWith('.pdf')) {
        pdfs.push({ path: full, mtime: fs.statSync(full).mtimeMs, name: item.name });
      }
    }
  } catch(e) {}
}

findPDFs(publicDir);
pdfs.sort((a, b) => b.mtime - a.mtime);

if (pdfs.length > 0) {
  extractPDFImages(pdfs[0].path, 'public/assets/furniture').catch(err => console.error('Error:', err.message));
}
