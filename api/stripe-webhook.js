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

// Helper: send a GA4 "purchase" event server-side via the Measurement Protocol.
// This is the authoritative purchase signal — it is not affected by ad blockers
// or the post-Stripe redirect, and (when ga_client_id is present) it stitches
// onto the same user's view_item / add_to_cart / begin_checkout funnel.
// No-ops gracefully if GA4_MEASUREMENT_ID / GA4_API_SECRET aren't configured.
async function sendGa4Purchase({ clientId, transactionId, value, items }) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.log('ℹ️ GA4 Measurement Protocol not configured — skipping purchase event');
    return;
  }

  // client_id is required by the Measurement Protocol. If the browser didn't
  // forward one, fall back to a synthetic id so the conversion still records
  // (it just won't join to the pre-purchase funnel for that user).
  const client_id = clientId && clientId.trim() !== ''
    ? clientId
    : `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;

  const payload = {
    client_id,
    events: [
      {
        name: 'purchase',
        params: {
          currency: 'USD',
          value,
          transaction_id: transactionId,
          items,
        },
      },
    ],
  };

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    const resp = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    console.log(`📈 GA4 purchase sent (${transactionId}) — status ${resp.status}`);
  } catch (err) {
    console.error('GA4 Measurement Protocol error:', err.message);
  }
}

// Helper: raise the concierge alarm in HubSpot when a commission deposit
// lands — a contact with the payer's details and a note that cannot be
// missed. A $25,000 deposit opens a relationship; it must never arrive
// silently. Same infrastructure as every lead form on the site.
async function notifyDepositToHubspot(session) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!hubspotToken) {
    console.error('🚨 DEPOSIT PAID but HUBSPOT_ACCESS_TOKEN is not set — concierge was NOT notified');
    return;
  }
  const email = (session.customer_details?.email || '').trim().toLowerCase();
  const phone = session.customer_details?.phone || '';
  const name = session.customer_details?.name || '';
  const amount = session.amount_total ? `$${(session.amount_total / 100).toLocaleString()}` : 'unknown amount';
  const headers = { 'Authorization': `Bearer ${hubspotToken}`, 'Content-Type': 'application/json' };

  // Upsert the contact (create, fall back to search-and-update on conflict)
  let contactId = null;
  try {
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ properties: { email, phone, firstname: name } }),
    });
    const createData = await createRes.json();
    if (createRes.ok) contactId = createData.id;
    else if (createData.message?.includes('already exists')) {
      contactId = createData.message.match(/ID: (\d+)/)?.[1] || null;
      if (contactId && phone) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties: { phone } }),
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('🚨 DEPOSIT contact upsert failed:', err.message);
  }

  // The note the concierge acts on — attached to the contact when we have
  // one, logged loudly either way.
  const noteBody = [
    `💰 COMMISSION DEPOSIT PAID — ${amount}`,
    `Item: ${session.metadata?.item_titles || 'Bespoke commission'}`,
    `Name: ${name || '(not given)'}`,
    `Email: ${email}`,
    `Phone: ${phone || '(NOT COLLECTED — reply by email)'}`,
    `Stripe session: ${session.id}`,
    ``,
    `THE SITE PROMISES AN ADVISOR CALL WITHIN 24 HOURS.`,
  ].join('\n');
  console.log(`\n${noteBody}\n`);
  if (contactId) {
    try {
      await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          properties: { hs_note_body: noteBody, hs_timestamp: Date.now() },
          associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }],
        }),
      });
      console.log(`📇 Deposit note attached to HubSpot contact ${contactId}`);
    } catch (err) {
      console.error('🚨 DEPOSIT note failed:', err.message);
    }
  }
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

    // Fail closed: unsigned events are never trusted. An unverified payload
    // could otherwise decrement inventory and emit fake purchase analytics.
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set — rejecting webhook');
      return res.status(500).json({ error: 'Webhook not configured' });
    }
    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
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

        // A deposit is a relationship opening, not a stock movement: alert
        // the concierge, record the conversion, and leave the shelf alone.
        const isDeposit =
          session.metadata?.is_deposit === 'true' ||
          lineItems.data.every((i) => (i.description || '').startsWith('Deposit:'));
        if (isDeposit) {
          await notifyDepositToHubspot(session);
          await sendGa4Purchase({
            clientId: session.metadata?.ga_client_id,
            transactionId: session.id,
            value: session.amount_total ? session.amount_total / 100 : 0,
            items: lineItems.data.map((i) => ({
              item_name: i.description || 'Commission deposit',
              quantity: i.quantity || 1,
              price: i.amount_total ? i.amount_total / 100 / (i.quantity || 1) : undefined,
            })),
          });
          break;
        }

        // Connect to Google Sheets
        const { sheets, sheetId } = getGoogleSheetsClient();
        const results = [];
        const ga4Items = [];

        for (const item of lineItems.data) {
          // Skip shipping line items
          if (item.description?.startsWith('Logistics:')) continue;

          const itemName = item.description || item.price?.product?.name || 'Unknown Item';
          const quantity = item.quantity || 1;

          console.log(`   Processing: "${itemName}" × ${quantity}`);

          ga4Items.push({
            item_name: itemName,
            quantity,
            price: item.amount_total ? item.amount_total / 100 / quantity : undefined,
          });

          const result = await decrementStock(sheets, sheetId, itemName, quantity);
          results.push(result);
        }

        console.log(`\n📦 Inventory sync complete:`, JSON.stringify(results, null, 2));

        // Authoritative GA4 purchase (closes the view -> purchase funnel)
        await sendGa4Purchase({
          clientId: session.metadata?.ga_client_id,
          transactionId: session.id,
          value: session.amount_total ? session.amount_total / 100 : 0,
          items: ga4Items,
        });
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
