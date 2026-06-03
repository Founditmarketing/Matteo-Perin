import { google } from 'googleapis';

export default async function handler(req: any, res: any) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      return res.status(500).json({ error: 'Missing environment variables for Google Sheets authentication' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // I expanded the range to A:G since the screenshot showed data extending into 
    // column F (Additional Images) and G (Description).
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:H',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Convert rows array into an array of objects using the first row as keys
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const item: any = {};
      headers.forEach((header: string, index: number) => {
        item[header] = row[index] || '';
      });
      return item;
    });

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('Error fetching Google Sheets data:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory data', details: error.message });
  }
}
