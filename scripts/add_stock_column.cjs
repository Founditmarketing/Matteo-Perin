// Script to add a "Stock" column to the Matteo inventory Google Sheet
// Run with: node add_stock_column.cjs

const { google } = require('googleapis');
require('dotenv').config();

async function addStockColumn() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    console.error('Missing env vars. Make sure GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID are set in .env');
    console.log('\nTrying to read from Vercel env vars...');
    console.log('You may need to add these to your local .env file.');
    console.log('Get them from: https://vercel.com/founditmarketing/matteo-perin/settings/environment-variables');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Step 1: Read current headers
  console.log('Reading current sheet headers...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!1:1',
  });

  const headers = response.data.values?.[0] || [];
  console.log('Current headers:', headers);

  // Check if Stock column already exists
  const stockIndex = headers.indexOf('Stock');
  if (stockIndex !== -1) {
    console.log(`\n✅ Stock column already exists at column ${String.fromCharCode(65 + stockIndex)} (index ${stockIndex})`);
    return;
  }

  // Step 2: Find where to insert Stock
  // We want it AFTER "Main Image Link" and BEFORE "Additional Image Links" or "Description"
  const mainImageIdx = headers.indexOf('Main Image Link');
  let insertIdx;
  
  if (mainImageIdx !== -1) {
    insertIdx = mainImageIdx + 1; // Right after Main Image Link
  } else {
    insertIdx = headers.length; // At the end
  }

  const stockColLetter = String.fromCharCode(65 + insertIdx);
  console.log(`\nInserting Stock column at position ${stockColLetter} (index ${insertIdx})...`);

  // Step 3: Insert a new column at the right position
  // We need to use the batchUpdate API to insert a column
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });
  
  const sheet = sheetInfo.data.sheets?.[0];
  const sheetIdNum = sheet?.properties?.sheetId || 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        insertDimension: {
          range: {
            sheetId: sheetIdNum,
            dimension: 'COLUMNS',
            startIndex: insertIdx,
            endIndex: insertIdx + 1,
          },
          inheritFromBefore: false,
        },
      }],
    },
  });

  // Step 4: Write the "Stock" header
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!${stockColLetter}1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['Stock']],
    },
  });

  console.log(`✅ Stock column added at column ${stockColLetter}`);

  // Step 5: Read all rows to identify variation rows (those with a Price) and set default stock
  console.log('\nSetting default stock values for variation rows...');
  const allData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:Z',
  });

  const rows = allData.data.values || [];
  const newHeaders = rows[0] || [];
  const titleCol = newHeaders.indexOf('Title');
  const categoryCol = newHeaders.indexOf('Category');
  const priceCol = newHeaders.indexOf('Price');
  const newStockCol = newHeaders.indexOf('Stock');

  const stockValues = [['Stock']]; // Header row
  let variationCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const hasCategory = (row[categoryCol] || '').trim() !== '';
    const hasPrice = (row[priceCol] || '').trim() !== '';
    
    if (hasCategory || hasPrice) {
      // It's a variation row — set default stock to 10
      stockValues.push(['10']);
      variationCount++;
    } else {
      // It's a parent row or empty — no stock value needed
      stockValues.push(['']);
    }
  }

  // Write all stock values at once
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!${stockColLetter}1:${stockColLetter}${rows.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: stockValues,
    },
  });

  console.log(`✅ Set default stock of 10 for ${variationCount} variation rows`);
  console.log('\nDone! The Stock column is now ready for the Stripe webhook to decrement.');
}

addStockColumn().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
