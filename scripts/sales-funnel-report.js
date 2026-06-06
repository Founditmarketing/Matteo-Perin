// scripts/sales-funnel-report.js
//
// INTERIM "looked vs. bought" report.
//
// Until GA4 has accumulated view_item / add_to_cart / begin_checkout data
// (those events were just added to the site), this script gives you the
// authoritative PURCHASE side straight from Stripe: how many units of each
// current-edit product actually sold, and the revenue, over a window.
//
// You then pair these counts with product-page views from GA4 (see the
// printed instructions at the end) to get the "looked but didn't buy" gap.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_xxx node scripts/sales-funnel-report.js [days]
//   (or put STRIPE_SECRET_KEY in a .env file)
//
//   [days] optional, defaults to 30.

import 'dotenv/config';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('✖ STRIPE_SECRET_KEY is not set. Add it to your .env or pass it inline.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const days = parseInt(process.argv[2], 10) || 30;
const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

async function main() {
  console.log(`\n📊 Matteo Perin — purchases in the last ${days} days\n${'─'.repeat(48)}`);

  const perProduct = new Map(); // name -> { units, revenue, orders }
  let totalOrders = 0;
  let totalRevenue = 0;

  // Page through completed checkout sessions in the window.
  const params = {
    limit: 100,
    created: { gte: since },
    status: 'complete',
    expand: ['data.line_items'],
  };

  for await (const session of stripe.checkout.sessions.list(params)) {
    if (session.payment_status !== 'paid') continue;
    totalOrders += 1;
    totalRevenue += (session.amount_total || 0) / 100;

    const lineItems =
      session.line_items?.data ||
      (await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })).data;

    for (const li of lineItems) {
      const name = li.description || 'Unknown Item';
      if (name.startsWith('Logistics:')) continue; // skip shipping
      const qty = li.quantity || 1;
      const revenue = (li.amount_total || 0) / 100;

      const entry = perProduct.get(name) || { units: 0, revenue: 0, orders: 0 };
      entry.units += qty;
      entry.revenue += revenue;
      entry.orders += 1;
      perProduct.set(name, entry);
    }
  }

  if (perProduct.size === 0) {
    console.log('No paid orders found in this window.\n');
  } else {
    const rows = [...perProduct.entries()].sort((a, b) => b[1].units - a[1].units);
    for (const [name, e] of rows) {
      console.log(
        `${name}\n   units sold: ${e.units}   ·   orders: ${e.orders}   ·   revenue: $${e.revenue.toLocaleString()}`
      );
    }
  }

  console.log(`${'─'.repeat(48)}`);
  console.log(`Totals: ${totalOrders} orders · $${totalRevenue.toLocaleString()} revenue\n`);

  console.log('To complete the "looked but didn\'t buy" picture:');
  console.log('  1. GA4 → Reports → Engagement → Pages and screens.');
  console.log('     Filter page path beginning with "/shop/" to get views per product.');
  console.log('  2. For each product:  viewers (GA4) − units sold (above) = looked-but-didn\'t-buy.');
  console.log('  3. Once the new events have data, use GA4 → Explore → Funnel exploration');
  console.log('     with steps view_item → add_to_cart → begin_checkout → purchase for an exact funnel.\n');
}

main().catch((err) => {
  console.error('Report failed:', err.message);
  process.exit(1);
});
