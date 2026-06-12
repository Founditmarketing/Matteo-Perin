// Shared inventory logic for the shop grid (HiddenInventoryTest) and the
// product page (InventoryProductPage). One fetch + one grouping pass produces
// both shapes the UI needs:
//
//   - styleVariations: photo rows collapsed into one entry per color/style
//     (trailing angle words like "Back"/"Side" stripped from row titles)
//   - rawRows: untouched variation rows, used by the grid for price ranges
//     and stock totals exactly as the sheet records them
//
// The server mirrors this grouping in api/_lib/inventory.js when it resolves
// trusted prices for checkout — keep the two in sync.

export interface InventoryImage {
    Title: string;
    Url: string;
}

export interface StyleVariation {
    StyleName: string;
    Title: string;
    Category?: string;
    Price?: string;
    Stock?: string;
    images: InventoryImage[];
    'Main Image Link'?: string;
}

export interface GroupedProduct {
    parentName: string;
    parentImage?: string;
    parentAdditionalImages?: string;
    description?: string;
    gender?: string;
    /** Style-grouped variations (one per color/style). */
    variations: StyleVariation[];
    /** Raw sheet rows belonging to this parent, in sheet order. */
    rawRows: any[];
}

const ANGLE_WORDS = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];

/** Strip trailing photo-angle words: "Olive Green Back" -> "Olive Green". */
export const getStyleName = (title: string): string => {
    const words = (title || '').trim().split(/\s+/);
    while (words.length > 1 && ANGLE_WORDS.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
        words.pop();
    }
    return words.join(' ');
};

export const fetchInventoryRows = async (): Promise<any[]> => {
    const response = await fetch('/api/inventory');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || [];
};

export const groupInventoryRows = (rows: any[]): GroupedProduct[] => {
    const grouped: GroupedProduct[] = [];
    let currentParent: GroupedProduct | null = null;

    (rows || []).forEach((row: any) => {
        const isRowEmpty = !row.Title && !row.Category && !row.Price && !row.Stock && !row['Main Image Link'];
        if (isRowEmpty) return;

        const hasTitle = row.Title && String(row.Title).trim() !== '';
        const hasCategory = row.Category && String(row.Category).trim() !== '';
        const hasPrice = row.Price && String(row.Price).trim() !== '';

        if (hasTitle && !hasCategory && !hasPrice) {
            // Parent product row. Trim: sheet titles sometimes carry trailing
            // spaces, which leak into URLs.
            currentParent = {
                parentName: String(row.Title).trim(),
                parentImage: row['Main Image Link'],
                parentAdditionalImages: row['Additional Image Links'],
                description: row.Description,
                gender: row.Gender,
                variations: [],
                rawRows: [],
            };
            grouped.push(currentParent);
        } else if (hasCategory || hasPrice || row.Stock) {
            if (!currentParent) {
                currentParent = { parentName: 'Other Items', variations: [], rawRows: [] };
                grouped.push(currentParent);
            }
            currentParent.rawRows.push(row);

            const styleName = getStyleName(row.Title || '');
            let styleGroup = currentParent.variations.find(v => v.StyleName === styleName);
            if (!styleGroup) {
                styleGroup = {
                    StyleName: styleName,
                    Title: styleName,
                    Category: row.Category,
                    Price: row.Price,
                    Stock: row.Stock,
                    images: [],
                };
                currentParent.variations.push(styleGroup);
            }
            if (row['Main Image Link']) {
                styleGroup.images.push({ Title: row.Title, Url: row['Main Image Link'] });
            }
            if (styleGroup.images.length === 1) {
                styleGroup['Main Image Link'] = row['Main Image Link'];
            }
        }
    });

    return grouped;
};

/** Google Drive share link -> CDN-cached proxy URL (direct link in dev). */
export const getImageUrl = (url: string, width: 1200 | 1600 = 1200): string => {
    if (!url) return '';
    const trimmed = url.trim();
    let match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
        match = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    }
    if (match && match[1]) {
        return (import.meta as any).env.DEV
            ? `https://lh3.googleusercontent.com/d/${match[1]}=w1200`
            : `/api/image?id=${match[1]}&w=${width}`;
    }
    return trimmed;
};

export const getPriceRange = (items: Array<{ Price?: any }>): string => {
    if (!items || items.length === 0) return 'Price upon request';
    const prices = items
        .map(v => String(v.Price).replace(/[^0-9.]/g, ''))
        .filter(v => v !== '')
        .map(Number);

    if (prices.length === 0) return 'Price upon request';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

export const isStockSoldOut = (stockValue: any): boolean => {
    const stock = String(stockValue || '').trim().toLowerCase();
    return stock === '0' || stock === 'out of stock' || stock === 'sold out' || stock === 'unavailable';
};

export const isVariationSoldOut = (variation: { Stock?: any } | null | undefined): boolean =>
    isStockSoldOut(variation?.Stock);

/** True when every variation row of the product is out of stock. */
export const isAllSoldOut = (rows: Array<{ Stock?: any }>): boolean => {
    if (rows.length === 0) return false;
    return rows.every(v => isStockSoldOut(v.Stock));
};

/** Sum numeric stock across rows; null when the sheet uses non-numeric stock. */
export const getTotalStock = (rows: Array<{ Stock?: any }>): number | null => {
    const nums = rows
        .map(v => parseInt(String(v.Stock || '').trim(), 10))
        .filter(n => !isNaN(n));
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0);
};

/** Lowest numeric price across rows, for schema markup. */
export const getMinPrice = (rows: Array<{ Price?: any }>): number | null => {
    const prices = rows
        .map(v => parseFloat(String(v.Price || '').replace(/[^0-9.]/g, '')))
        .filter(n => !isNaN(n) && n > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
};
