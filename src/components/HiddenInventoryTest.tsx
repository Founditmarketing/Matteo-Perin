import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface StyleGroup {
    styleName: string;
    firstImage: string; // First image URL for this color/style
    images: { Title: string; Url: string }[];
    Category?: string;
    Price?: string;
    Stock?: string;
}

interface GroupedProduct {
    parentName: string;
    parentImage?: string;
    parentAdditionalImages?: string;
    description?: string;
    gender?: string;
    variations: any[];
    // Derived: unique color/style groups
    styleGroups: StyleGroup[];
}

export const HiddenInventoryTest: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/inventory-test-hidden') ? '/inventory-test-hidden' : '/shop';
    const [groupedInventory, setGroupedInventory] = useState<GroupedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCardImage, setActiveCardImage] = useState<Record<number, number>>({});
    const isEmbedded = location.pathname === '/';

    // Angle words to strip when determining style/color name
    const angleWords = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];

    const getStyleName = (title: string) => {
        let words = (title || '').trim().split(/\s+/);
        while (words.length > 1 && angleWords.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
            words.pop();
        }
        return words.join(' ');
    };

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('/api/inventory');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                
                const grouped: GroupedProduct[] = [];
                let currentParent: GroupedProduct | null = null;

                (result.data || []).forEach((row: any) => {
                    // Check if completely empty
                    const isRowEmpty = !row.Title && !row.Category && !row.Price && !row.Stock && !row['Main Image Link'];
                    if (isRowEmpty) return;

                    const hasTitle = row.Title && String(row.Title).trim() !== '';
                    const hasCategory = row.Category && String(row.Category).trim() !== '';
                    const hasPrice = row.Price && String(row.Price).trim() !== '';

                    if (hasTitle && !hasCategory && !hasPrice) {
                        // It's a parent product
                        currentParent = {
                            parentName: row.Title,
                            parentImage: row['Main Image Link'],
                            parentAdditionalImages: row['Additional Image Links'],
                            description: row.Description,
                            gender: row.Gender,
                            variations: [],
                            styleGroups: []
                        };
                        grouped.push(currentParent);
                    } else if (hasCategory || hasPrice || row.Stock) {
                        // It's a variation row
                        if (currentParent) {
                            currentParent.variations.push(row);
                        } else {
                            // If there's no parent yet, create a default one
                            currentParent = {
                                parentName: 'Other Items',
                                variations: [row],
                                styleGroups: []
                            };
                            grouped.push(currentParent);
                        }
                    }
                });

                // Build styleGroups for each grouped product
                grouped.forEach(group => {
                    const stylesMap = new Map<string, StyleGroup>();
                    
                    group.variations.forEach(v => {
                        const styleName = getStyleName(v.Title || '');
                        if (!stylesMap.has(styleName)) {
                            stylesMap.set(styleName, {
                                styleName,
                                firstImage: v['Main Image Link'] || '',
                                images: [],
                                Category: v.Category,
                                Price: v.Price,
                                Stock: v.Stock
                            });
                        }
                        const sg = stylesMap.get(styleName)!;
                        if (v['Main Image Link']) {
                            sg.images.push({ Title: v.Title, Url: v['Main Image Link'] });
                        }
                    });
                    
                    group.styleGroups = Array.from(stylesMap.values());
                });

                setGroupedInventory(grouped);
            } catch (err: any) {
                console.error("Error fetching inventory:", err);
                setError(err.message || 'Failed to load inventory.');
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        // Handle standard /d/ID format (both /view and /file paths)
        let match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        // Handle id=ID format
        if (!match) {
            match = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
        }
        if (match && match[1]) {
            // Serve through our CDN-cached proxy in production; direct Drive
            // link in local dev where /api isn't running.
            return (import.meta as any).env.DEV
                ? `https://lh3.googleusercontent.com/d/${match[1]}=w1200`
                : `/api/image?id=${match[1]}&w=1200`;
        }
        return trimmed;
    };

    // Get the first image of each unique color/style for card arrow navigation
    const getColorPreviewImages = (group: GroupedProduct) => {
        const images: string[] = [];
        
        // Start with parent image if available
        if (group.parentImage) {
            images.push(getImageUrl(group.parentImage));
        }

        // Add the first image of each unique style group
        group.styleGroups.forEach(sg => {
            if (sg.firstImage) {
                const url = getImageUrl(sg.firstImage);
                if (!images.includes(url)) {
                    images.push(url);
                }
            }
        });

        return images;
    };

    // Calculate price range
    const getPriceRange = (variations: any[]) => {
        if (!variations || variations.length === 0) return 'Price upon request';
        const prices = variations
            .map(v => String(v.Price).replace(/[^0-9.]/g, ''))
            .filter(v => v !== '')
            .map(Number);
        
        if (prices.length === 0) return 'Price upon request';
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return `$${min.toLocaleString()}`;
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    };

    // Check if all variations are out of stock
    const isAllSoldOut = (group: GroupedProduct) => {
        if (group.variations.length === 0) return false;
        return group.variations.every(v => {
            const stock = String(v.Stock || '').trim().toLowerCase();
            return stock === '0' || stock === 'out of stock' || stock === 'sold out' || stock === 'unavailable';
        });
    };

    // Sum numeric stock across variations; null when the sheet uses non-numeric stock
    const getTotalStock = (group: GroupedProduct) => {
        const nums = group.variations
            .map(v => parseInt(String(v.Stock || '').trim(), 10))
            .filter(n => !isNaN(n));
        if (nums.length === 0) return null;
        return nums.reduce((a, b) => a + b, 0);
    };

    // Lowest numeric price across variations, for schema markup
    const getMinPrice = (variations: any[]) => {
        const prices = variations
            .map(v => parseFloat(String(v.Price || '').replace(/[^0-9.]/g, '')))
            .filter(n => !isNaN(n) && n > 0);
        return prices.length > 0 ? Math.min(...prices) : null;
    };

    const toAbsoluteUrl = (url: string) =>
        url.startsWith('/') ? `https://www.matteoperin.com${url}` : url;

    // Product schema so Google Search / Shopping sees real products with
    // prices and availability in the (prerendered) HTML source.
    const productSchema = groupedInventory.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: groupedInventory.map((group, i) => {
            const minPrice = getMinPrice(group.variations);
            const firstImage = getColorPreviewImages(group)[0];
            return {
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'Product',
                    name: group.parentName,
                    ...(firstImage ? { image: toAbsoluteUrl(firstImage) } : {}),
                    ...(group.description ? { description: group.description } : {}),
                    brand: { '@type': 'Brand', name: 'Matteo Perin' },
                    url: `https://www.matteoperin.com/shop/${encodeURIComponent(group.parentName)}`,
                    ...(minPrice ? {
                        offers: {
                            '@type': 'Offer',
                            priceCurrency: 'USD',
                            price: minPrice,
                            availability: isAllSoldOut(group)
                                ? 'https://schema.org/OutOfStock'
                                : 'https://schema.org/InStock',
                            url: `https://www.matteoperin.com/shop/${encodeURIComponent(group.parentName)}`,
                        },
                    } : {}),
                },
            };
        }),
    } : null;

    return (
        <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black py-32 px-6 md:px-16 flex flex-col items-center relative">
            {!isEmbedded && (
                <Helmet>
                    <title>Shop One-of-One Italian Leather Goods & Luxury Pieces | Matteo Perin</title>
                    <meta name="description" content="Shop the Current Edit — one-of-one Italian leather bags, exotic leather goods, and luxury outerwear, in stock and ready to ship worldwide from our Jackson Hole atelier. Handcrafted in Italy." />
                    <meta name="keywords" content="luxury leather bags, italian leather goods, exotic leather bags, one of one luxury pieces, luxury leather goods jackson hole, designer leather bags jackson wy, Matteo Perin shop" />
                    <link rel="canonical" href="https://www.matteoperin.com/shop" />
                    <meta property="og:title" content="Shop One-of-One Italian Leather Goods | Matteo Perin" />
                    <meta property="og:description" content="One-of-one Italian leather bags, exotic leather goods, and luxury outerwear — in stock, ready to ship worldwide." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content="https://www.matteoperin.com/shop" />
                    {productSchema && (
                        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
                    )}
                </Helmet>
            )}
            <div className="w-full">
                <div className="mb-16 text-center">
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-4 block">Available Now · In Stock</span>
                    {isEmbedded ? (
                        <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-4">The Current Edit</h2>
                    ) : (
                        <h1 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-4">The Current Edit</h1>
                    )}
                    <p className="font-serif text-lg text-matteo-charcoal/60 dark:text-white/60 italic max-w-xl mx-auto mb-6">
                        One-of-a-kind pieces, ready for immediate acquisition — purchase online with worldwide delivery.
                    </p>
                    {isEmbedded && (
                        <button
                            onClick={() => navigate('/shop')}
                            className="font-sans text-[10px] uppercase tracking-[0.25em] border border-matteo-charcoal/30 dark:border-white/30 px-8 py-3 text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-colors duration-500"
                        >
                            Shop the Edit
                        </button>
                    )}
                </div>

                {loading ? (
                    !isEmbedded ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-matteo-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal/60 dark:text-white/60">Loading live inventory...</p>
                    </div>
                    ) : null
                ) : error ? (
                    !isEmbedded ? (
                    <div className="py-20 text-center">
                        <p className="font-serif text-xl text-matteo-charcoal/70 dark:text-white/60 mb-4">
                            The Current Edit is being updated.
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone">
                            Please refresh in a moment, or write to <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange">concierge@matteoperin.com</a>
                        </p>
                    </div>
                    ) : null
                ) : (
                    <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-20">
                        {groupedInventory.length > 0 ? (
                            groupedInventory.map((group, groupIdx) => {
                                const previewImages = getColorPreviewImages(group);
                                const colorCount = group.styleGroups.length;
                                const soldOut = isAllSoldOut(group);
                                const totalStock = getTotalStock(group);
                                
                                return (
                                    <div 
                                        key={groupIdx} 
                                        className={`group flex flex-col animate-fade-in-up ${soldOut ? 'opacity-50 pointer-events-none' : ''}`}
                                        style={{ animationDelay: `${groupIdx * 50}ms` }}
                                    >
                                        {/* Image Area with Arrow Navigation */}
                                        <div 
                                            className="w-full aspect-[3/4] bg-[#f0f0f0] dark:bg-[#111] overflow-hidden relative cursor-pointer group/card"
                                            onClick={() => !soldOut && navigate(`${basePath}/${encodeURIComponent(group.parentName)}`)}
                                        >
                                            {previewImages.length > 0 ? (
                                                <>
                                                    <img 
                                                        src={previewImages[activeCardImage[groupIdx] || 0]} 
                                                        alt={`${group.parentName} view ${(activeCardImage[groupIdx] || 0) + 1}`}
                                                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04]"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                                            (e.target as HTMLImageElement).className = "w-1/2 h-1/2 mx-auto mt-[25%] object-contain opacity-20";
                                                        }}
                                                    />

                                                    {/* Sold Out Badge */}
                                                    {soldOut && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                                                            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-white bg-black/70 px-6 py-2 backdrop-blur-sm">
                                                                Sold Out
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Left Arrow */}
                                                    {previewImages.length > 1 && (activeCardImage[groupIdx] || 0) > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveCardImage(prev => ({ ...prev, [groupIdx]: (prev[groupIdx] || 0) - 1 }));
                                                            }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
                                                            aria-label="Previous color"
                                                        >
                                                            <svg className="w-4 h-4 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                                        </button>
                                                    )}
                                                    {/* Right Arrow */}
                                                    {previewImages.length > 1 && (activeCardImage[groupIdx] || 0) < previewImages.length - 1 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveCardImage(prev => ({ ...prev, [groupIdx]: (prev[groupIdx] || 0) + 1 }));
                                                            }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
                                                            aria-label="Next color"
                                                        >
                                                            <svg className="w-4 h-4 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="font-sans text-[10px] uppercase tracking-widest opacity-30">No Image</span>
                                                </div>
                                            )}
                                            {/* Dot indicators */}
                                            {previewImages.length > 1 && (
                                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                                    {previewImages.map((_, i) => (
                                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === (activeCardImage[groupIdx] || 0) ? 'bg-white w-3 shadow-sm' : 'bg-white/40'}`}></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Card Info Area */}
                                        <div 
                                            className="pt-6 flex flex-col flex-grow cursor-pointer"
                                            onClick={() => {
                                                if (!soldOut) navigate(`${basePath}/${encodeURIComponent(group.parentName)}`);
                                            }}
                                        >
                                            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-orange mb-3">
                                                {soldOut
                                                    ? 'Sold'
                                                    : totalStock === 1
                                                        ? 'One of One · Ships Now'
                                                        : 'In Stock · Ships Now'}
                                            </span>
                                            <div className="flex justify-between items-baseline gap-4 mb-1">
                                                <h3 className="font-serif text-2xl md:text-3xl text-matteo-charcoal dark:text-white leading-tight group-hover:text-matteo-orange transition-colors">{group.parentName}</h3>
                                                <span className="font-serif text-xl text-matteo-charcoal dark:text-white shrink-0">
                                                    {getPriceRange(group.variations)}
                                                </span>
                                            </div>
                                            <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal/50 dark:text-gray-400 mb-6">
                                                {colorCount} {colorCount === 1 ? 'Color' : 'Colors'}
                                            </span>

                                            <button className={`mt-auto self-start font-sans text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 transition-colors duration-500 ${soldOut
                                                ? 'border border-matteo-charcoal/20 dark:border-white/20 text-matteo-stone'
                                                : 'bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black group-hover:bg-matteo-orange dark:group-hover:bg-matteo-orange group-hover:text-white dark:group-hover:text-white'}`}>
                                                {soldOut ? 'Sold Out' : 'Shop This Piece'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="font-serif text-matteo-charcoal/60 dark:text-gray-500">No inventory available at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
