import { getSheetsClient } from './_lib/inventory.js';

// The House Record — a dated ledger read from the "Record" tab of the
// inventory sheet (columns: Date, Title, Note). The Journal page renders
// its quiet "forthcoming" line whenever this returns no entries, so every
// failure path — missing tab, credentials, rate limits — answers 200 with
// an empty ledger rather than an error.
export default async function handler(req: any, res: any) {
  try {
    const { sheets, sheetId } = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Record!A:C',
    });

    const rows = response.data.values;

    // Cache at the CDN edge, mirroring api/inventory.ts: Google Sheets is
    // slow and rate-limited, and the ledger changes infrequently.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const headers = rows[0];
    const data = rows
      .slice(1)
      .map((row) => {
        const item: Record<string, string> = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      })
      // An entry needs at least a date and a title to earn a ledger row.
      .filter((item) => item.Date && item.Title);

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('Error fetching the House Record:', error);
    // Short-lived cache so a missing tab does not hammer the Sheets API,
    // while a freshly created one still surfaces within the minute.
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json({ data: [] });
  }
}
