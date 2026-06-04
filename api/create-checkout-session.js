import Stripe from 'stripe';

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
    const { items, shippingOptions } = req.body;
    
    // Safety check
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

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

    const sessionData = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://www.matteoperin.com/thank-you?deposit=true`,
      cancel_url: `https://www.matteoperin.com/bespoke-crocodile-jacket`,
      // Store item info in session metadata for the webhook
      metadata: {
        item_titles: items.map(i => i.title).join(' | '),
        item_count: String(items.length),
      },
    };

    // If shipping is requested, add it as a line item
    if (shippingOptions && shippingOptions.price > 0) {
        sessionData.line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `Logistics: ${shippingOptions.name}`,
                    description: shippingOptions.desc || 'Shipping',
                },
                unit_amount: Math.round(shippingOptions.price * 100),
            },
            quantity: 1
        });
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
}
