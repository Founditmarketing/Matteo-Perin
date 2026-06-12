// Server-side inventory access shared by the API functions.
//
// Single source of truth for (a) reading the Google Sheet and (b) grouping
// rows into parent products + style variations. The grouping mirrors the
// storefront logic in src/components/InventoryProductPage.tsx — parent rows
// have a Title but no Category/Price; subsequent rows are style variations,
// with trailing angle words ("back", "side", ...) stripped off photo rows so
// they collapse into one style.
//
// Files under api/_lib are not exposed as serverless routes (Vercel ignores
// underscore-prefixed paths) but can be imported by the functions that are.

import { google } from 'googleapis';

export function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error('Missing Google Sheets credentials in environment');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return { sheets: google.sheets({ version: 'v4', auth }), sheetId };
}

// Returns the sheet as an array of objects keyed by the header row.
export async function fetchInventoryRows() {
  const { sheets, sheetId } = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:H',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || '';
    });
    return item;
  });
}

const ANGLE_WORDS = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];

// Strip trailing photo-angle words: "Olive Green Back" -> "Olive Green".
export function styleNameFromRowTitle(title) {
  const words = String(title || '').trim().split(/\s+/);
  while (words.length > 1 && ANGLE_WORDS.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
    words.pop();
  }
  return words.join(' ');
}

export function groupInventory(rows) {
  const grouped = [];
  let currentParent = null;

  (rows || []).forEach((row) => {
    const isRowEmpty = !row.Title && !row.Category && !row.Price && !row.Stock && !row['Main Image Link'];
    if (isRowEmpty) return;

    const hasTitle = row.Title && String(row.Title).trim() !== '';
    const hasCategory = row.Category && String(row.Category).trim() !== '';
    const hasPrice = row.Price && String(row.Price).trim() !== '';

    if (hasTitle && !hasCategory && !hasPrice) {
      currentParent = {
        parentName: String(row.Title).trim(),
        variations: [],
      };
      grouped.push(currentParent);
    } else if (hasCategory || hasPrice || row.Stock) {
      const styleName = styleNameFromRowTitle(row.Title);

      if (!currentParent) {
        currentParent = { parentName: 'Other Items', variations: [] };
        grouped.push(currentParent);
      }

      let styleGroup = currentParent.variations.find((v) => v.StyleName === styleName);
      if (!styleGroup) {
        styleGroup = {
          StyleName: styleName,
          Title: styleName,
          Category: row.Category,
          Price: row.Price,
          Stock: row.Stock,
        };
        currentParent.variations.push(styleGroup);
      }
    }
  });

  return grouped;
}

export function parsePrice(value) {
  const num = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function isVariationSoldOut(variation) {
  const stock = String(variation?.Stock || '').trim().toLowerCase();
  return stock === '0' || stock === 'out of stock' || stock === 'sold out' || stock === 'unavailable';
}

const slugify = (name) =>
  String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Resolve a cart item (parentName + styleName/variationTitle from the client)
// against the live sheet. Returns the matched variation + trusted price, or
// null when nothing in the inventory corresponds to the request.
export function matchCartItem(groups, item) {
  const parent =
    groups.find((g) => g.parentName === String(item.parentName || '').trim()) ||
    groups.find((g) => slugify(g.parentName) === slugify(item.parentName));
  if (!parent) return null;

  const wanted = [item.styleName, item.variationTitle].filter(Boolean).map((s) => String(s).trim());
  const variation =
    parent.variations.find((v) => wanted.includes(v.StyleName)) ||
    parent.variations.find((v) => wanted.includes(v.Title));
  if (!variation) return null;

  const price = parsePrice(variation.Price);
  if (!price) return null;

  return { parent, variation, price };
}
