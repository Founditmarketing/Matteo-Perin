const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Since we can't easily render PDF to image with just node, let's extract 
// the text content from the PDF using a different approach.
// We'll parse the raw PDF content streams to find text operators.

const { PDFDocument, PDFName, PDFDict, PDFArray, PDFStream, PDFRawStream } = require('pdf-lib');
const { decompressSync } = require('zlib');

async function extractText(pdfPath) {
  const data = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(data);
  const pageCount = pdf.getPageCount();
  
  console.log(`=== CATALOG: ${path.basename(pdfPath)} ===`);
  console.log(`Pages: ${pageCount}\n`);
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPage(i);
    
    try {
      // Get the content stream
      const contentsRef = page.node.get(PDFName.of('Contents'));
      if (!contentsRef) continue;
      
      let streams = [];
      const resolved = page.node.context.lookup(contentsRef);
      
      if (resolved instanceof PDFArray) {
        for (let j = 0; j < resolved.size(); j++) {
          const streamRef = resolved.get(j);
          const stream = page.node.context.lookup(streamRef);
          if (stream && stream.getContents) {
            streams.push(stream.getContents());
          }
        }
      } else if (resolved && resolved.getContents) {
        streams.push(resolved.getContents());
      }
      
      // Parse content streams for text
      let pageText = '';
      for (const streamBytes of streams) {
        const str = Buffer.from(streamBytes).toString('latin1');
        
        // Extract text between Tj and TJ operators
        // Tj = show string, TJ = show array of strings
        const tjMatches = str.match(/\((.*?)\)\s*Tj/g) || [];
        const tjArrayMatches = str.match(/\[(.*?)\]\s*TJ/g) || [];
        
        for (const m of tjMatches) {
          const text = m.replace(/\)\s*Tj$/, '').replace(/^\(/, '');
          pageText += text;
        }
        
        for (const m of tjArrayMatches) {
          const inner = m.replace(/\]\s*TJ$/, '').replace(/^\[/, '');
          // Extract strings from array
          const strings = inner.match(/\((.*?)\)/g) || [];
          for (const s of strings) {
            pageText += s.replace(/[()]/g, '');
          }
        }
      }
      
      if (pageText.trim()) {
        console.log(`--- Page ${i + 1} ---`);
        console.log(pageText.trim());
        console.log();
      }
    } catch (e) {
      // Skip pages we can't parse
    }
  }
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
  extractText(pdfs[0].path).catch(err => console.error('Error:', err.message));
}
