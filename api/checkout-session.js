import Stripe from 'stripe';

// Returns a safe, display-only summary of a completed Stripe Checkout
// session so the thank-you page can show a real order confirmation.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment gateway is not configured.' });
  }

  const sessionId = req.query.session_id;
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session id' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    return res.status(200).json({
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      email: session.customer_details?.email || '',
      name: session.customer_details?.name || '',
      city: session.shipping_details?.address?.city || session.customer_details?.address?.city || '',
      items: (session.line_items?.data || []).map(li => ({
        description: li.description,
        quantity: li.quantity,
        amountTotal: li.amount_total,
      })),
    });
  } catch (err) {
    console.error('checkout-session retrieve error:', err.message);
    return res.status(404).json({ error: 'Order not found' });
  }
}
