import Stripe from 'stripe';
import { fetchInventoryRows, groupInventory, matchCartItem, isVariationSoldOut } from './_lib/inventory.js';

// Commission deposits are fixed server-side amounts, keyed by the exact line
// title the storefront sends. Never derived from the request body.
const DEPOSIT_PRICES = {
  'Deposit: Bespoke Crocodile Jacket': 25000,
};

// Countries we ship to. Stripe requires an explicit list for
// shipping_address_collection (no "worldwide" option).
const SHIPPING_COUNTRIES = [
  'US', 'CA', 'MX', 'GB', 'IE', 'FR', 'IT', 'ES', 'PT', 'DE', 'AT', 'CH',
  'BE', 'NL', 'LU', 'DK', 'SE', 'NO', 'FI', 'IS', 'GR', 'PL', 'CZ',
  'AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'AE', 'SA', 'QA', 'KW', 'IL', 'TR',
  'BR', 'AR', 'CL', 'CO', 'ZA', 'IN', 'TH', 'MY', 'ID', 'PH', 'VN', 'MC', 'LI',
];

const PRODUCTION_ORIGIN = 'https://www.matteoperin.com';

// Resolve the site origin so success/cancel URLs work on previews and locally,
// but never trust an arbitrary origin header blindly.
function resolveOrigin(req) {
  const origin = req.headers.origin || '';
  if (
    origin === PRODUCTION_ORIGIN ||
    origin === 'https://matteoperin.com' ||
    origin.endsWith('.vercel.app') ||
    origin.startsWith('http://localhost')
  ) {
    return origin;
  }
  return PRODUCTION_ORIGIN;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Verify Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Payment gateway is not configured. Please contact the site administrator.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { items, gaClientId, customerEmail } = req.body;

    // Safety check
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // The croc-jacket commission deposit is a reservation, not a shipped good:
    // it skips shipping collection and keeps its dedicated thank-you messaging.
    const isDeposit = items.every(item => String(item.title || '').startsWith('Deposit:'));

    // ── Server-side price resolution ──
    // The request body only identifies WHAT is being bought (parent product +
    // style). Every unit_amount comes from the live inventory sheet or the
    // fixed deposit table — client-supplied prices are never charged.
    let inventoryGroups = null;
    const lineItems = [];
    // A commission is reserved once: identical deposit lines collapse to one.
    const seenDepositTitles = new Set();
    // Physical goods aggregate per matched variation BEFORE the stock cap is
    // applied, so a duplicated cart line for the same piece (e.g. Add to Bag
    // followed by Buy Now) collapses into one line item and can never slip
    // through as two units of a stock-1 one-of-one.
    const physicalByVariation = new Map();

    for (const item of items) {
      const title = String(item.title || '').trim();
      const quantity = Math.min(Math.max(parseInt(item.quantity, 10) || 1, 1), 10);

      if (title.startsWith('Deposit:')) {
        const depositPrice = DEPOSIT_PRICES[title];
        if (!depositPrice) {
          return res.status(400).json({ error: `Unknown commission deposit: ${title}` });
        }
        if (seenDepositTitles.has(title)) continue;
        seenDepositTitles.add(title);
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: 'Commission Slot Reservation',
              metadata: { variation_title: title, style_name: title, product_parent: '' },
            },
            unit_amount: depositPrice * 100,
          },
          quantity: 1,
        });
        continue;
      }

      // Lazy-load the sheet once per request, only when physical goods are present.
      if (!inventoryGroups) {
        inventoryGroups = groupInventory(await fetchInventoryRows());
      }

      const match = matchCartItem(inventoryGroups, item);
      if (!match) {
        console.error('Checkout rejected — item not found in inventory:', { title, parentName: item.parentName, styleName: item.styleName });
        return res.status(400).json({ error: `"${title}" is no longer available. Please refresh your bag.` });
      }
      if (isVariationSoldOut(match.variation)) {
        return res.status(400).json({ error: `"${title}" has just sold out.` });
      }

      const variationKey = `${match.parent.parentName}::${match.variation.StyleName}`;
      const existing = physicalByVariation.get(variationKey);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, 10);
      } else {
        physicalByVariation.set(variationKey, { match, quantity });
      }
    }

    for (const { match, quantity } of physicalByVariation.values()) {
      // Cap the AGGREGATED quantity at the available stock when the sheet
      // tracks a count — a one-of-one can only ever be charged once.
      const stockNum = parseInt(String(match.variation.Stock || '').trim(), 10);
      const finalQuantity = Number.isFinite(stockNum) && stockNum > 0 ? Math.min(quantity, stockNum) : quantity;

      const displayName = match.variation.Title && match.variation.Title !== match.parent.parentName
        ? `${match.parent.parentName} — ${match.variation.Title}`
        : match.parent.parentName;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: displayName,
            description: match.variation.Category || 'Matteo Perin',
            // Store the variation/style name in metadata so the webhook
            // can match it against the Google Sheet inventory
            metadata: {
              variation_title: match.variation.Title,
              style_name: match.variation.StyleName,
              product_parent: match.parent.parentName,
            },
          },
          unit_amount: Math.round(match.price * 100), // Stripe expects cents
        },
        quantity: finalQuantity,
      });
    }

    const origin = resolveOrigin(req);

    const sessionData = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}${isDeposit ? '&deposit=true' : ''}`,
      cancel_url: isDeposit ? `${origin}/bespoke-crocodile-jacket` : `${origin}/checkout`,
      // Store item info in session metadata for the webhook
      metadata: {
        item_titles: items.map(i => i.title).join(' | '),
        item_count: String(items.length),
        // Forwarded to the Stripe webhook so the GA4 purchase event can be
        // attributed to the same user's view -> cart -> checkout funnel.
        ga_client_id: gaClientId || '',
      },
    };

    if (customerEmail) {
      sessionData.customer_email = customerEmail;
    }

    // Physical orders: Stripe collects the shipping address and phone, and
    // offers the delivery service levels directly on the payment page.
    if (!isDeposit) {
      sessionData.shipping_address_collection = { allowed_countries: SHIPPING_COUNTRIES };
      sessionData.phone_number_collection = { enabled: true };
      sessionData.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Insured Courier — Complimentary',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 12000, currency: 'usd' },
            display_name: 'Priority Express',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
}
