import { PDFDocument, PDFName, PDFStream, PDFRawStream, PDFArray, PDFDict, PDFRef } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const PDF_PATH = './source_pdfs/CATALOGO SOFA DESIGN P.pdf';
const OUTPUT_DIR = './public/assets/furniture';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function extractImages() {
  console.log('Reading PDF...');
  const pdfBytes = fs.readFileSync(PDF_PATH);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pages = pdfDoc.getPages();
  console.log(`PDF has ${pages.length} pages`);

  let imageCount = 0;
  const enumeratedObjects = pdfDoc.context.enumerateIndirectObjects();
  
  for (const [ref, obj] of enumeratedObjects) {
    try {
      // Check all stream types
      if (!obj) continue;
      
      let dict, contents;
      
      if (typeof obj.dict !== 'undefined' && typeof obj.contents !== 'undefined') {
        dict = obj.dict;
        contents = obj.contents;
      } else {
        continue;
      }
      
      if (!dict || !contents) continue;
      
      // Look for /Subtype /Image in the dictionary
      let isImage = false;
      try {
        const entries = dict.entries ? dict.entries() : [];
        for (const [key, val] of entries) {
          const keyStr = key?.toString?.() || '';
          const valStr = val?.toString?.() || '';
          if (keyStr === '/Subtype' && valStr === '/Image') {
            isImage = true;
            break;
          }
        }
      } catch(e) {}
      
      if (!isImage) continue;
      
      imageCount++;
      
      // Get image metadata
      let width = 0, height = 0, filterStr = '';
      try {
        const entries = dict.entries ? dict.entries() : [];
        for (const [key, val] of entries) {
          const keyStr = key?.toString?.() || '';
          const valStr = val?.toString?.() || '';
          if (keyStr === '/Width') width = parseInt(valStr) || 0;
          if (keyStr === '/Height') height = parseInt(valStr) || 0;
          if (keyStr === '/Filter') filterStr = valStr;
        }
      } catch(e) {}
      
      console.log(`Image ${imageCount}: ${width}x${height}, filter: ${filterStr}, bytes: ${contents.length}`);
      
      // Skip tiny images
      if (width < 100 && height < 100) {
        console.log(`  -> Skipping small image`);
        continue;
      }
      
      if (filterStr.includes('DCTDecode')) {
        const outputPath = path.join(OUTPUT_DIR, `sofa_${String(imageCount).padStart(3, '0')}.jpg`);
        fs.writeFileSync(outputPath, contents);
        console.log(`  -> Saved JPEG: ${outputPath}`);
      } else if (filterStr.includes('JPXDecode')) {
        const outputPath = path.join(OUTPUT_DIR, `sofa_${String(imageCount).padStart(3, '0')}.jp2`);
        fs.writeFileSync(outputPath, contents);
        console.log(`  -> Saved JP2: ${outputPath}`);
      } else if (filterStr.includes('FlateDecode')) {
        // Try to decompress and save as raw bitmap
        try {
          const decompressed = zlib.inflateSync(Buffer.from(contents));
          console.log(`  -> FlateDecode decompressed: ${decompressed.length} bytes for ${width}x${height}`);
          // We'll skip these as they're raw pixel data and not easily convertible without sharp
        } catch(e) {
          console.log(`  -> FlateDecode decompression failed: ${e.message}`);
        }
      } else {
        console.log(`  -> Unknown filter: ${filterStr}`);
      }
    } catch (e) {
      // Skip
    }
  }
  
  console.log(`\nDone! Found ${imageCount} images.`);
  
  // List what we extracted
  const files = fs.readdirSync(OUTPUT_DIR);
  console.log(`\nFiles in output dir:`, files);
}

extractImages().catch(console.error);
