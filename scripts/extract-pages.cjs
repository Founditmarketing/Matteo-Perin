const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function extractPDFPageImages(pdfPath) {
  const data = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(data);
  const pageCount = pdf.getPageCount();
  
  console.log(`Extracting ${pageCount} pages from: ${path.basename(pdfPath)}`);
  
  // Extract individual page PDFs and convert to images
  const outputDir = path.join('scripts', 'pdf-pages');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  // Extract key pages: cover, first few items, middle, end
  const pagesToExtract = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59];
  
  for (const pageIdx of pagesToExtract) {
    if (pageIdx >= pageCount) continue;
    
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [pageIdx]);
    newPdf.addPage(copiedPage);
    
    const pdfBytes = await newPdf.save();
    const outputPath = path.join(outputDir, `page_${String(pageIdx + 1).padStart(2, '0')}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`  Extracted page ${pageIdx + 1} -> ${outputPath}`);
  }
  
  console.log('\nDone! Individual page PDFs saved to scripts/pdf-pages/');
  console.log('Now view them with: view_file tool on each page PDF');
}

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
findPDFs('public');
pdfs.sort((a, b) => b.mtime - a.mtime);

if (pdfs.length > 0) {
  extractPDFPageImages(pdfs[0].path).catch(err => console.error('Error:', err.message));
}
