// Validates the Vault access code server-side so the code never ships in the
// client bundle. Configure VAULT_ACCESS_CODE in the Vercel project settings.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const expected = process.env.VAULT_ACCESS_CODE;
  if (!expected) {
    console.error('VAULT_ACCESS_CODE is not set — vault access disabled');
    return res.status(500).json({ ok: false, error: 'Vault access is not configured' });
  }

  const supplied = String(req.body?.code || '');
  if (supplied.length > 0 && supplied === expected) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
