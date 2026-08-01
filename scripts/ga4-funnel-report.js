// scripts/ga4-funnel-report.js
//
// "Looked but didn't buy" report, straight from GA4.
//
// Pulls the view -> cart -> purchase funnel for the current-edit / shop
// products from the GA4 property (the events shipped with the site:
// view_item, add_to_cart, begin_checkout, purchase) and prints, per product:
//   viewed · added to cart · purchased · LOOKED-BUT-DIDN'T-BUY · conversion %
// plus a site-wide headline of how many *people* viewed a product vs bought.
//
// ── Setup (one time) ────────────────────────────────────────────────
// Uses a Google service account (the same kind already used for the
// inventory Google Sheet). The service account must be granted access to
// the GA4 property: GA4 → Admin → Property access management → add the
// service account email with the "Viewer" role.
//
// Required env vars (e.g. in .env):
//   GA4_PROPERTY_ID   numeric GA4 property id (NOT the G-… id).
//                     Find it: GA4 → Admin → Property settings → Property ID.
//   GOOGLE_CLIENT_EMAIL   service account email
//   GOOGLE_PRIVATE_KEY    service account private key (\n-escaped is fine)
//
// ── Usage ───────────────────────────────────────────────────────────
//   node scripts/ga4-funnel-report.js [days]      (days defaults to 28)

import 'dotenv/config';
import { google } from 'googleapis';

const propertyId = process.env.GA4_PROPERTY_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const days = parseInt(process.argv[2], 10) || 28;

if (!propertyId || !clientEmail || !privateKey) {
  console.error('✖ Missing env vars. Need GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY.');
  console.error('  (And the service account must have Viewer access on the GA4 property.)');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
const property = `properties/${propertyId}`;

const num = (v) => Number(v || 0);
const pct = (a, b) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '—');

async function perProduct() {
  const { data } = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges,
      dimensions: [{ name: 'itemName' }],
      metrics: [
        { name: 'itemsViewed' },
        { name: 'itemsAddedToCart' },
        { name: 'itemsPurchased' },
      ],
      orderBys: [{ metric: { metricName: 'itemsViewed' }, desc: true }],
      limit: 250,
    },
  });

  const rows = data.rows || [];
  console.log(`\n📊 Per-product funnel — last ${days} days\n${'─'.repeat(72)}`);
  if (rows.length === 0) {
    console.log('No item data yet. (Give the new tracking time to collect, or widen [days].)');
    return;
  }

  for (const r of rows) {
    const name = r.dimensionValues[0].value;
    const viewed = num(r.metricValues[0].value);
    const carted = num(r.metricValues[1].value);
    const bought = num(r.metricValues[2].value);
    const didntBuy = Math.max(0, viewed - bought);

    console.log(name);
    console.log(
      `   viewed ${viewed}  ·  added-to-cart ${carted}  ·  bought ${bought}` +
      `  ·  LOOKED-NOT-BOUGHT ${didntBuy}  ·  conv ${pct(bought, viewed)}`
    );
  }
}

async function peopleHeadline() {
  // User-scoped counts: how many distinct users fired each event.
  const { data } = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'totalUsers' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { values: ['view_item', 'add_to_cart', 'begin_checkout', 'purchase'] },
        },
      },
    },
  });

  const counts = {};
  for (const r of data.rows || []) {
    counts[r.dimensionValues[0].value] = num(r.metricValues[0].value);
  }

  const viewers = counts.view_item || 0;
  const buyers = counts.purchase || 0;
  const lookedNotBought = Math.max(0, viewers - buyers);

  console.log(`\n👤 People (distinct users) — last ${days} days\n${'─'.repeat(72)}`);
  console.log(`   viewed a product:     ${viewers}`);
  console.log(`   added to cart:        ${counts.add_to_cart || 0}`);
  console.log(`   began checkout:       ${counts.begin_checkout || 0}`);
  console.log(`   purchased:            ${buyers}`);
  console.log(`   ─────────────────────────────`);
  console.log(`   LOOKED BUT DIDN'T BUY: ${lookedNotBought}   (${pct(lookedNotBought, viewers)} of viewers)\n`);
}

async function main() {
  try {
    await peopleHeadline();
    await perProduct();
    console.log('');
  } catch (err) {
    const msg = err?.response?.data?.error?.message || err.message;
    console.error('GA4 report failed:', msg);
    if (/permission|PERMISSION_DENIED|caller does not have/i.test(msg || '')) {
      console.error('→ Grant the service account "Viewer" access in GA4 → Admin → Property access management.');
    }
    process.exit(1);
  }
}

main();
