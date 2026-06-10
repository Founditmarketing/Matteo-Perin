import Stripe from 'stripe';

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

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: item.category || 'Matteo Perin',
          // Store the variation/style name in metadata so the webhook
          // can match it against the Google Sheet inventory
          metadata: {
            variation_title: item.variationTitle || item.title,
            style_name: item.styleName || item.title,
            product_parent: item.parentName || '',
          },
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

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
