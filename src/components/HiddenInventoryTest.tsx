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

// Stamped ledger seal — the piece number pressed into the paper like a
// maker's stamp: double hairline border, eyebrow-register ink, and a whisper
// of inset shadow so it reads pressed-in rather than lifted (the sanctioned
// exception to the Lifted Print Rule). Terracotta ink only, never gold.
const StampSeal: React.FC<{ lines: string[]; muted?: boolean }> = ({ lines, muted }) => (
    <span className={`inline-block border p-[3px] ${muted ? 'border-matteo-stone-ink/40 dark:border-white/25' : 'border-matteo-orange-ink/40 dark:border-matteo-orange/40'}`}>
        <span className={`flex flex-col items-center justify-center gap-1 px-3 py-2 border shadow-[inset_0_1px_2px_rgba(28,28,28,0.12)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] ${muted ? 'border-matteo-stone-ink/20 dark:border-white/10' : 'border-matteo-orange-ink/20 dark:border-matteo-orange/20'}`}>
            {lines.map((line) => (
                <span key={line} className={`font-sans text-[10px] leading-none uppercase tracking-[0.25em] font-medium whitespace-nowrap ${muted ? 'text-matteo-stone-ink dark:text-white/60' : 'text-matteo-orange-ink dark:text-matteo-orange'}`}>
                    {line}
                </span>
            ))}
        </span>
    </span>
);

export const HiddenInventoryTest: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/inventory-test-hidden') ? '/inventory-test-hidden' : '/shop';
    const [groupedInventory, setGroupedInventory] = useState<GroupedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCardImage, setActiveCardImage] = useState<Record<number, number>>({});
    const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'ladies'>('all');
    const isEmbedded = location.pathname === '/';

    // Parent rows in the sheet leave Gender blank — it lives on the variation
    // rows ("Men" / "Female" / "Unisex"), so resolve it from rawRows.
    const getGroupGender = (group: GroupedProduct): string => {
        if (group.gender && group.gender.trim()) return group.gender.trim().toLowerCase();
        const fromRows = group.rawRows.find(r => String(r.Gender || '').trim());
        return String(fromRows?.Gender || '').trim().toLowerCase();
    };

    // Unisex pieces belong in both the Men and Ladies views.
    const matchesGender = (group: GroupedProduct): boolean => {
        if (genderFilter === 'all') return true;
        const g = getGroupGender(group);
        if (!g || g === 'unisex') return true;
        return genderFilter === 'men'
            ? (g === 'men' || g === 'man' || g === 'male')
            : (g === 'women' || g === 'woman' || g === 'female' || g === 'ladies');
    };

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
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-6 block">
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
                        {/* Men / Ladies selector — gender lives here as quiet text
                            tabs in the eyebrow register, the way Hermès and Loro
                            Piana keep it at the top of the listing, never a widget. */}
                        {!isEmbedded && (
                            <div className="flex items-baseline gap-8 shrink-0">
                                {([['all', 'All'], ['men', 'Men'], ['ladies', 'Women']] as const).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setGenderFilter(key)}
                                        aria-pressed={genderFilter === key}
                                        className={`font-sans text-[11px] uppercase tracking-[0.25em] pb-1.5 border-b transition-colors duration-300 ${
                                            genderFilter === key
                                                ? 'text-matteo-orange-ink dark:text-matteo-orange border-matteo-orange-ink dark:border-matteo-orange'
                                                : 'text-matteo-stone-ink dark:text-white/50 border-transparent hover:text-matteo-charcoal dark:hover:text-white'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
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
                        <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60">
                            Please refresh in a moment, or write to <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange-ink dark:text-matteo-orange">concierge@matteoperin.com</a>
                        </p>
                    </div>
                    ) : null
                ) : (
                    <div className="w-full max-w-[1600px] mx-auto">
                        {groupedInventory.length > 0 ? (
                            isEmbedded ? (
                                /* Homepage embed: an asymmetric numbered-ledger teaser —
                                   one featured plate, two offset plates. Never a storefront
                                   grid; the full ledger treatment lives on /shop.
                                   A horizontal scroll rail was considered for the desktop
                                   embed and deliberately rejected: the teaser is hard-capped
                                   at three pieces, so a rail would never scroll, and it would
                                   regress this endorsed editorial spread into a carousel. */
                                (() => {
                                    const pieces = groupedInventory.slice(0, 3);
                                    const renderPlate = (group: GroupedProduct, idx: number, featured: boolean) => {
                                        const previewImages = getColorPreviewImages(group);
                                        const soldOut = isAllSoldOut(group.rawRows);
                                        const totalStock = getTotalStock(group.rawRows);
                                        return (
                                            <Link
                                                key={idx}
                                                to={`/shop/${slugify(group.parentName)}`}
                                                className="group block animate-fade-in-up"
                                                style={{ animationDelay: `${idx * 80}ms` }}
                                            >
                                                {/* Featured runs landscape — a tabletop product shot
                                                    can't carry a 1,000px portrait plate; 4/3 keeps the
                                                    whole teaser inside one viewport. */}
                                                <div className={`w-full ${featured ? 'aspect-[4/3]' : 'aspect-[4/5]'} bg-matteo-sand dark:bg-[#111] overflow-hidden relative mb-6`} data-cursor="view">
                                                    {previewImages[0] ? (
                                                        /* The wrapper carries both the hover scale and the sand
                                                           backdrop: a transform creates a stacking context that
                                                           isolates the multiply blend, so the backdrop must live
                                                           inside it or the tint would pop on hover. */
                                                        <div className="absolute inset-0 bg-matteo-sand dark:bg-[#111] transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
                                                            <img
                                                                src={previewImages[0]}
                                                                alt={group.parentName}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
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
                                                    {/* Stamped ledger seal on a paper chip in the plate corner */}
                                                    <div className="absolute top-0 left-0 z-20 bg-matteo-cream dark:bg-matteo-black p-1.5">
                                                        <StampSeal
                                                            lines={[`\u2116 ${String(idx + 1).padStart(2, '0')}`, soldOut ? 'Sold' : totalStock === 1 ? 'One of One' : 'In Stock']}
                                                            muted={soldOut}
                                                        />
                                                    </div>
                                                </div>
                                                <h3 className={`font-serif ${featured ? 'text-3xl md:text-4xl xl:text-5xl' : 'text-2xl md:text-3xl'} text-matteo-charcoal dark:text-white leading-[1.1] group-hover:text-matteo-orange-ink dark:group-hover:text-matteo-orange transition-colors mb-2`}>
                                                    {group.parentName}
                                                </h3>
                                                <span className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-white/60">
                                                    {getPriceRange(group.rawRows)}
                                                </span>
                                            </Link>
                                        );
                                    };
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-16">
                                            <div className="md:col-span-7">
                                                {pieces[0] && renderPlate(pieces[0], 0, true)}
                                            </div>
                                            {pieces.length > 1 && (
                                                <div className="md:col-span-4 md:col-start-9 flex flex-col gap-16">
                                                    {pieces.slice(1).map((g, i) => renderPlate(g, i + 1, false))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                            /* The listing grid \u2014 modeled on the Herm\u00e8s / Loro Piana /
                               Brunello Cucinelli PLP convention: a uniform grid of
                               quiet tiles (photo on flat neutral ground, small name
                               and price beneath), several pieces visible per screen.
                               Two columns on mobile, three on desktop. */
                            (() => {
                                const visible = groupedInventory.filter(matchesGender);
                                if (visible.length === 0) {
                                    return (
                                        <div className="py-20 text-center">
                                            <p className="font-serif italic text-lg text-matteo-charcoal/60 dark:text-white/60">
                                                No pieces in this selection at the moment \u2014 view All for the full edit.
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-14 md:gap-y-20">
                                {visible.map((group) => {
                                    const groupIdx = groupedInventory.indexOf(group);
                                    const previewImages = getColorPreviewImages(group);
                                    const colorCount = group.variations.length;
                                    const soldOut = isAllSoldOut(group.rawRows);
                                    const totalStock = getTotalStock(group.rawRows);

                                    return (
                                        <div key={groupIdx} className={`group/card animate-fade-in-up ${soldOut ? 'opacity-60' : ''}`}>
                                        <div
                                            className="w-full aspect-[3/4] bg-matteo-sand dark:bg-[#111] overflow-hidden relative cursor-pointer mb-5"
                                            onClick={() => !soldOut && navigate(`${basePath}/${slugify(group.parentName)}`)}
                                            data-cursor="view"
                                        >
                                            {previewImages.length > 0 ? (
                                                <>
                                                    {/* Sand backdrop rides inside the scaling wrapper so the
                                                        multiply blend survives the hover stacking context. */}
                                                    <div className="absolute inset-0 bg-matteo-sand dark:bg-[#111] transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04]">
                                                        <img
                                                            src={previewImages[activeCardImage[groupIdx] || 0]}
                                                            alt={`${group.parentName} view ${(activeCardImage[groupIdx] || 0) + 1}`}
                                                            loading={groupIdx > 1 ? 'lazy' : 'eager'}
                                                            decoding="async"
                                                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                                                (e.target as HTMLImageElement).className = "w-1/2 h-1/2 mx-auto mt-[25%] object-contain opacity-20";
                                                            }}
                                                        />
                                                    </div>

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
                                            {/* Dot indicators — dropped past 8 colours, where a
                                                dot row overwhelms a small tile; the arrows and the
                                                colour count in the caption still tell the story. */}
                                            {previewImages.length > 1 && previewImages.length <= 8 && (
                                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                                    {previewImages.map((_, i) => (
                                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === (activeCardImage[groupIdx] || 0) ? 'bg-white w-3 shadow-sm' : 'bg-white/40'}`}></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    {/* Tile caption: name, price, quiet provenance line —
                                        real anchors so crawlers reach product pages. */}
                                    <h3 className="font-serif text-xl md:text-2xl text-matteo-charcoal dark:text-white leading-[1.15] mb-1.5 group-hover/card:text-matteo-orange-ink dark:group-hover/card:text-matteo-orange transition-colors">
                                        <Link to={`${basePath}/${slugify(group.parentName)}`}>{group.parentName}</Link>
                                    </h3>
                                    <p className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-white/70 mb-1.5">
                                        {getPriceRange(group.rawRows)}
                                    </p>
                                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-stone-ink dark:text-white/50">
                                        {soldOut
                                            ? 'Sold'
                                            : totalStock === 1
                                                ? 'One of One'
                                                : `${colorCount} ${colorCount === 1 ? 'colour' : 'colours'}`}
                                    </p>
                                        </div>
                                    );
                                })}
                            </div>
                                );
                            })()
                            )
                        ) : (
                            <div className="py-20 text-center">
                                <p className="font-serif text-matteo-charcoal/60 dark:text-white/60">No inventory available at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
