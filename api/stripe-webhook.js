import Stripe from 'stripe';
import { google } from 'googleapis';

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK — Inventory Sync
// Listens for checkout.session.completed events from Stripe,
// then decrements the Stock column in Google Sheets for each
// purchased item.
// ═══════════════════════════════════════════════════════════════

// Vercel serverless functions receive the raw body when configured
// with `export const config = { api: { bodyParser: false } }` but
// that's the Pages-Router pattern. For the /api folder convention
// Vercel passes the raw body automatically for webhook verification.

export const config = {
  api: {
    bodyParser: false, // Stripe needs the raw body to verify the signature
  },
};

// Helper: collect raw body from request stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Helper: authenticate with Google Sheets (read/write)
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error('Missing Google Sheets environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    // IMPORTANT: needs full read/write scope to update Stock
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

// Helper: find the row number in the sheet where Title matches
// and decrement its Stock value
async function decrementStock(sheets, sheetId, itemTitle, quantity) {
  // Read all rows to find the matching item
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:H',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('Sheet is empty — nothing to decrement');
    return { matched: false };
  }

  const headers = rows[0];
  const titleCol = headers.indexOf('Title');
  const stockCol = headers.indexOf('Stock');

  if (titleCol === -1 || stockCol === -1) {
    console.error('Could not find Title or Stock column in headers:', headers);
    return { matched: false, error: 'Column not found' };
  }

  // Strip angle words from the purchased item title to match style names
  const angleWords = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];
  function getStyleName(title) {
    let words = (title || '').trim().split(/\s+/);
    while (words.length > 1 && angleWords.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
      words.pop();
    }
    return words.join(' ').toLowerCase();
  }

  const targetStyle = getStyleName(itemTitle);
  const matchedRows = [];

  // Find all rows that match this style name (could be multiple angle photos)
  // We only decrement the FIRST match (the primary variation row)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowTitle = (row[titleCol] || '').trim();
    const rowStyle = getStyleName(rowTitle);

    if (rowStyle === targetStyle) {
      matchedRows.push({
        rowIndex: i,        // 0-indexed from array
        rowNumber: i + 1,   // 1-indexed for Sheets API
        currentTitle: rowTitle,
        currentStock: row[stockCol] || '',
      });
    }
  }

  if (matchedRows.length === 0) {
    console.log(`No match found for item: "${itemTitle}" (style: "${targetStyle}")`);
    return { matched: false, searchedStyle: targetStyle };
  }

  // Use the first matched row (the primary one with stock info)
  const primaryRow = matchedRows.find(r => r.currentStock !== '') || matchedRows[0];
  const currentStockValue = primaryRow.currentStock;
  
  // Parse current stock as a number
  let stockNum = parseInt(currentStockValue, 10);
  if (isNaN(stockNum)) {
    // Stock might be text like "In Stock" or blank — set to 0 since item was sold
    console.log(`Stock for "${itemTitle}" is non-numeric ("${currentStockValue}") — setting to 0`);
    stockNum = 0;
  } else {
    // Decrement by the quantity purchased
    stockNum = Math.max(0, stockNum - quantity);
  }

  // The Stock column letter (F is index 5, but we use stockCol which is dynamic)
  const stockColLetter = String.fromCharCode(65 + stockCol); // A=0, B=1, ..., F=5
  const cellRange = `Sheet1!${stockColLetter}${primaryRow.rowNumber}`;

  // Write the updated stock value
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: cellRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[stockNum.toString()]],
    },
  });

  console.log(`✅ Stock updated: "${itemTitle}" → ${cellRange} from ${currentStockValue} to ${stockNum} (qty purchased: ${quantity})`);

  return {
    matched: true,
    item: itemTitle,
    style: targetStyle,
    cell: cellRange,
    previousStock: currentStockValue,
    newStock: stockNum,
    quantityPurchased: quantity,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Verify required environment variables
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    // Get the raw body for signature verification
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event;

    if (webhookSecret && sig) {
      // Verify the webhook signature (recommended for production)
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err) {
        console.error(`⚠️ Webhook signature verification failed:`, err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // If no webhook secret is configured, parse the event directly
      // (useful during initial setup, but not recommended for production)
      console.warn('⚠️ No STRIPE_WEBHOOK_SECRET set — skipping signature verification');
      event = JSON.parse(rawBody.toString());
    }

    // ── Handle the event ──
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`\n🛒 Checkout completed: ${session.id}`);
        console.log(`   Customer: ${session.customer_details?.email || 'unknown'}`);
        console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);

        // Retrieve line items from the session to know what was purchased
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });

        if (!lineItems.data || lineItems.data.length === 0) {
          console.log('   No line items found in session');
          break;
        }

        // Connect to Google Sheets
        const { sheets, sheetId } = getGoogleSheetsClient();
        const results = [];

        for (const item of lineItems.data) {
          // Skip shipping line items
          if (item.description?.startsWith('Logistics:')) continue;

          const itemName = item.description || item.price?.product?.name || 'Unknown Item';
          const quantity = item.quantity || 1;

          console.log(`   Processing: "${itemName}" × ${quantity}`);

          const result = await decrementStock(sheets, sheetId, itemName, quantity);
          results.push(result);
        }

        console.log(`\n📦 Inventory sync complete:`, JSON.stringify(results, null, 2));
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        // No stock changes needed for failed payments
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Internal webhook error', details: error.message });
  }
}
