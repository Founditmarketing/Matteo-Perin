import { fetchInventoryRows } from './_lib/inventory.js';

export default async function handler(req: any, res: any) {
  try {
    const data = await fetchInventoryRows();

    // Cache at the CDN edge: Google Sheets is slow and rate-limited, and
    // inventory changes infrequently. 5 min fresh + 10 min stale-while-revalidate.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('Error fetching Google Sheets data:', error);
    const isConfig = /credentials/i.test(error?.message || '');
    return res.status(500).json({
      error: isConfig ? 'Missing environment variables for Google Sheets authentication' : 'Failed to fetch inventory data',
      details: error.message,
    });
  }
}
