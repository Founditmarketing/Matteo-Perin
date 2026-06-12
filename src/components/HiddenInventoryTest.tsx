import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { slugify } from '../lib/slug';
import {
    GroupedProduct,
    fetchInventoryRows,
    groupInventoryRows,
    getImageUrl,
    getPriceRange,
    isAllSoldOut,
    getTotalStock,
    getMinPrice,
} from '../lib/inventory';

export const HiddenInventoryTest: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/inventory-test-hidden') ? '/inventory-test-hidden' : '/shop';
    const [groupedInventory, setGroupedInventory] = useState<GroupedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCardImage, setActiveCardImage] = useState<Record<number, number>>({});
    const isEmbedded = location.pathname === '/';

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setGroupedInventory(groupInventoryRows(await fetchInventoryRows()));
            } catch (err: any) {
                console.error("Error fetching inventory:", err);
                setError(err.message || 'Failed to load inventory.');
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Get the first image of each unique color/style for card arrow navigation
    const getColorPreviewImages = (group: GroupedProduct) => {
        const images: string[] = [];

        // Start with parent image if available
        if (group.parentImage) {
            images.push(getImageUrl(group.parentImage));
        }

        // Add the first image of each unique style group
        group.variations.forEach(sg => {
            const first = sg.images[0]?.Url;
            if (first) {
                const url = getImageUrl(first);
                if (!images.includes(url)) {
                    images.push(url);
                }
            }
        });

        return images;
    };

    const toAbsoluteUrl = (url: string) =>
        url.startsWith('/') ? `https://www.matteoperin.com${url}` : url;

    // Product schema so Google Search / Shopping sees real products with
    // prices and availability in the (prerendered) HTML source.
    const productSchema = groupedInventory.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: groupedInventory.map((group, i) => {
            const minPrice = getMinPrice(group.rawRows);
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
                    url: `https://www.matteoperin.com/shop/${slugify(group.parentName)}`,
                    ...(minPrice ? {
                        offers: {
                            '@type': 'Offer',
                            priceCurrency: 'USD',
                            price: minPrice,
                            availability: isAllSoldOut(group.rawRows)
                                ? 'https://schema.org/OutOfStock'
                                : 'https://schema.org/InStock',
                            url: `https://www.matteoperin.com/shop/${slugify(group.parentName)}`,
                        },
                    } : {}),
                },
            };
        }),
    } : null;

    return (
        <div className={`bg-matteo-cream dark:bg-matteo-black px-6 md:px-16 flex flex-col items-center relative ${isEmbedded ? 'py-20 md:py-28' : 'min-h-screen py-32'}`}>
            {!isEmbedded && (
                <Helmet>
                    <title>Shop One-of-One Italian Leather Goods & Luxury Pieces | Matteo Perin</title>
                    <meta name="description" content="Shop the Current Edit — one-of-one Italian leather bags, exotic leather goods, and luxury outerwear, in stock and ready to ship worldwide from our Jackson Hole atelier. Handcrafted in Italy." />
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
                {/* Editorial opener: eyebrow -> display -> hairline. Left-aligned —
                    one-of-one pieces deserve a ledger, not a storefront banner.
                    The homepage embed runs a quieter, smaller version of the same. */}
                <div className={`w-full max-w-[1600px] mx-auto ${isEmbedded ? 'mb-12 md:mb-16' : 'mb-20 md:mb-28'}`}>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-6 block">
                        Available Now · One of One · Ships Worldwide
                    </span>
                    {isEmbedded ? (
                        <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-white leading-[1.05] mb-6 max-w-4xl">The Current Edit</h2>
                    ) : (
                        <h1 className="font-serif text-5xl md:text-7xl xl:text-8xl text-matteo-charcoal dark:text-white leading-[1.02] mb-8 max-w-5xl">The Current Edit</h1>
                    )}
                    <div className={`w-full h-[1px] bg-matteo-charcoal/10 dark:bg-white/10 ${isEmbedded ? 'mb-6' : 'mb-8'}`}></div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <p className="font-serif text-lg md:text-xl text-matteo-charcoal/60 dark:text-white/60 italic max-w-xl">
                            One-of-a-kind pieces, ready for immediate acquisition — purchase online with worldwide delivery.
                        </p>
                        {isEmbedded && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="self-start md:self-auto shrink-0 font-sans text-[10px] uppercase tracking-[0.25em] border border-matteo-charcoal/30 dark:border-white/30 px-8 py-3.5 text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-colors duration-500"
                            >
                                Shop the Edit
                            </button>
                        )}
                    </div>
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
                    <div className="w-full max-w-[1600px] mx-auto">
                        {groupedInventory.length > 0 ? (
                            isEmbedded ? (
                                /* Homepage embed: a compact teaser row — the full ledger
                                   treatment lives on /shop. */
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                                    {groupedInventory.map((group, groupIdx) => {
                                        const previewImages = getColorPreviewImages(group);
                                        const soldOut = isAllSoldOut(group.rawRows);
                                        const totalStock = getTotalStock(group.rawRows);
                                        return (
                                            <Link
                                                key={groupIdx}
                                                to={`/shop/${slugify(group.parentName)}`}
                                                className="group block animate-fade-in-up"
                                                style={{ animationDelay: `${groupIdx * 50}ms` }}
                                            >
                                                <div className="w-full aspect-[3/4] bg-matteo-sand dark:bg-[#111] overflow-hidden relative mb-5">
                                                    {previewImages[0] ? (
                                                        <img
                                                            src={previewImages[0]}
                                                            alt={group.parentName}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="font-sans text-[10px] uppercase tracking-widest opacity-30">No Image</span>
                                                        </div>
                                                    )}
                                                    {soldOut && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                                            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white bg-black/70 px-4 py-1.5 backdrop-blur-sm">Sold Out</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline justify-between gap-3 mb-2">
                                                    <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-charcoal/50 dark:text-white/40">
                                                        {`\u2116 ${String(groupIdx + 1).padStart(2, '0')}`}
                                                    </span>
                                                    <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal/50 dark:text-white/40">
                                                        {soldOut ? 'Sold' : totalStock === 1 ? 'One of One' : 'In Stock'}
                                                    </span>
                                                </div>
                                                <h3 className="font-serif text-xl md:text-2xl text-matteo-charcoal dark:text-white leading-tight group-hover:text-matteo-orange transition-colors mb-1">
                                                    {group.parentName}
                                                </h3>
                                                <span className="font-serif text-base text-matteo-charcoal/70 dark:text-white/60">
                                                    {getPriceRange(group.rawRows)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                            <div className="flex flex-col gap-24 md:gap-36">
                                {groupedInventory.map((group, groupIdx) => {
                                    const previewImages = getColorPreviewImages(group);
                                    const colorCount = group.variations.length;
                                    const soldOut = isAllSoldOut(group.rawRows);
                                    const totalStock = getTotalStock(group.rawRows);
                                    const isFeature = groupIdx === 0;
                                    const imageLeft = groupIdx % 2 === 0;
                                    const pieceNumber = `\u2116 ${String(groupIdx + 1).padStart(2, '0')} / ${String(groupedInventory.length).padStart(2, '0')}`;

                                    // Shared image box: arrows, dots, sold-out veil
                                    const imageBox = (
                                        <div
                                            className={`w-full ${isFeature ? 'aspect-[4/5]' : 'aspect-[3/4]'} bg-matteo-sand dark:bg-[#111] overflow-hidden relative cursor-pointer group/card shadow-xl`}
                                            onClick={() => !soldOut && navigate(`${basePath}/${slugify(group.parentName)}`)}
                                        >
                                            {previewImages.length > 0 ? (
                                                <>
                                                    <img 
                                                        src={previewImages[activeCardImage[groupIdx] || 0]} 
                                                        alt={`${group.parentName} view ${(activeCardImage[groupIdx] || 0) + 1}`}
                                                        loading={groupIdx > 1 ? 'lazy' : 'eager'}
                                                        decoding="async"
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

                                                    {/* Left Arrow — always visible on touch, hover-revealed on desktop */}
                                                    {previewImages.length > 1 && (activeCardImage[groupIdx] || 0) > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveCardImage(prev => ({ ...prev, [groupIdx]: (prev[groupIdx] || 0) - 1 }));
                                                            }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
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
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
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
                                    );

                                    // Ledger entry: number as the single flame, title at display
                                    // scale, provenance as hairline rows. Real anchors throughout
                                    // so crawlers reach product pages.
                                    const infoColumn = (
                                        <div className="flex flex-col justify-end h-full">
                                            <span className={`font-sans text-[10px] uppercase tracking-[0.3em] mb-6 ${soldOut ? 'text-matteo-stone' : 'text-matteo-orange'}`}>
                                                {pieceNumber}
                                            </span>
                                            <h3 className={`font-serif ${isFeature ? 'text-4xl md:text-6xl xl:text-7xl' : 'text-3xl md:text-5xl'} text-matteo-charcoal dark:text-white leading-[1.05] mb-8 group-hover:text-matteo-orange transition-colors`}>
                                                <Link to={`${basePath}/${slugify(group.parentName)}`}>{group.parentName}</Link>
                                            </h3>

                                            {/* The ledger */}
                                            <div className="divide-y divide-matteo-charcoal/10 dark:divide-white/10 border-t border-b border-matteo-charcoal/10 dark:border-white/10 mb-8">
                                                {[
                                                    ['Edition', totalStock === 1 ? 'One of one' : totalStock ? `${totalStock} pieces` : 'Limited'],
                                                    ['Status', soldOut ? 'Sold' : 'In stock — ships now'],
                                                    ['Colours', `${colorCount} ${colorCount === 1 ? 'option' : 'options'}`],
                                                    ['Price', getPriceRange(group.rawRows)],
                                                ].map(([label, value]) => (
                                                    <div key={label} className="flex items-baseline justify-between gap-6 py-3">
                                                        <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-matteo-charcoal/60 dark:text-white/50 shrink-0">{label}</span>
                                                        <span className="font-serif text-base md:text-lg text-matteo-charcoal dark:text-white text-right">{value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {soldOut ? (
                                                <span className="self-start font-sans text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 border border-matteo-charcoal/20 dark:border-white/20 text-matteo-stone">
                                                    Sold Out
                                                </span>
                                            ) : (
                                                <Link
                                                    to={`${basePath}/${slugify(group.parentName)}`}
                                                    className="self-start font-sans text-[10px] uppercase tracking-[0.2em] px-10 py-4 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black group-hover:bg-matteo-orange dark:group-hover:bg-matteo-orange group-hover:text-white dark:group-hover:text-white transition-colors duration-500"
                                                >
                                                    Shop This Piece
                                                </Link>
                                            )}
                                        </div>
                                    );

                                    return (
                                        <div
                                            key={groupIdx}
                                            className={`group grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-end animate-fade-in-up ${soldOut ? 'opacity-60' : ''}`}
                                            style={{ animationDelay: `${groupIdx * 50}ms` }}
                                        >
                                            {isFeature ? (
                                                <>
                                                    <div className="md:col-span-7">{imageBox}</div>
                                                    <div className="md:col-span-5 md:pb-6">{infoColumn}</div>
                                                </>
                                            ) : imageLeft ? (
                                                <>
                                                    <div className="md:col-span-6">{imageBox}</div>
                                                    <div className="md:col-span-5 md:col-start-8 md:pb-6">{infoColumn}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="md:col-span-5 md:pb-6 order-2 md:order-1">{infoColumn}</div>
                                                    <div className="md:col-span-6 md:col-start-7 order-1 md:order-2">{imageBox}</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            )
                        ) : (
                            <div className="py-20 text-center">
                                <p className="font-serif text-matteo-charcoal/60 dark:text-gray-500">No inventory available at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
