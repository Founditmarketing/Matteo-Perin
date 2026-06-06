import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { trackViewItem } from '../lib/analytics';

interface GroupedProduct {
    parentName: string;
    parentImage?: string;
    parentAdditionalImages?: string;
    description?: string;
    gender?: string;
    variations: any[];
}

export const InventoryProductPage: React.FC = () => {
    const { productName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/shop') ? '/shop' : '/inventory-test-hidden';
    const { addToCart, setIsCartOpen } = useCart();
    
    const [selectedGroup, setSelectedGroup] = useState<GroupedProduct | null>(null);
    const [activeVariation, setActiveVariation] = useState<any | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
                    const isRowEmpty = !row.Title && !row.Category && !row.Price && !row.Stock && !row['Main Image Link'];
                    if (isRowEmpty) return;

                    const hasTitle = row.Title && String(row.Title).trim() !== '';
                    const hasCategory = row.Category && String(row.Category).trim() !== '';
                    const hasPrice = row.Price && String(row.Price).trim() !== '';

                    if (hasTitle && !hasCategory && !hasPrice) {
                        currentParent = {
                            parentName: row.Title,
                            parentImage: row['Main Image Link'],
                            parentAdditionalImages: row['Additional Image Links'],
                            description: row.Description,
                            gender: row.Gender,
                            variations: []
                        };
                        grouped.push(currentParent);
                    } else if (hasCategory || hasPrice || row.Stock) {
                        if (currentParent) {
                            const angleWords = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];
                            let words = (row.Title || '').trim().split(/\s+/);
                            while (words.length > 1 && angleWords.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
                                words.pop();
                            }
                            const styleName = words.join(' ');

                            let styleGroup = currentParent.variations.find((v: any) => v.StyleName === styleName);
                            if (!styleGroup) {
                                styleGroup = {
                                    StyleName: styleName,
                                    Title: styleName,
                                    Category: row.Category,
                                    Price: row.Price,
                                    Stock: row.Stock,
                                    images: []
                                };
                                currentParent.variations.push(styleGroup);
                            }
                            
                            if (row['Main Image Link']) {
                                styleGroup.images.push({
                                    Title: row.Title,
                                    Url: row['Main Image Link']
                                });
                            }
                            if (styleGroup.images.length === 1) {
                                styleGroup['Main Image Link'] = row['Main Image Link'];
                            }
                        } else {
                            currentParent = {
                                parentName: 'Other Items',
                                variations: [{
                                    StyleName: row.Title,
                                    Title: row.Title,
                                    Category: row.Category,
                                    Price: row.Price,
                                    Stock: row.Stock,
                                    images: row['Main Image Link'] ? [{ Title: row.Title, Url: row['Main Image Link'] }] : [],
                                    'Main Image Link': row['Main Image Link']
                                }]
                            };
                            grouped.push(currentParent);
                        }
                    }
                });

                // Find the specific product that matches the URL parameter
                if (productName) {
                    const decodedName = decodeURIComponent(productName);
                    const foundProduct = grouped.find(g => g.parentName === decodedName);
                    
                    if (foundProduct) {
                        setSelectedGroup(foundProduct);
                        setActiveVariation(foundProduct.variations.length > 0 ? foundProduct.variations[0] : null);
                    } else {
                        setError('Product not found in live inventory.');
                    }
                }
                
            } catch (err: any) {
                console.error("Error fetching inventory:", err);
                setError(err.message || 'Failed to load inventory.');
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, [productName]);

    // Fire GA4 view_item once a product + variation are resolved. This is the
    // "someone looked at a current-edit product" signal used for the
    // view -> purchase funnel.
    useEffect(() => {
        if (!selectedGroup || !activeVariation) return;
        const priceStr = String(activeVariation.Price || '0').replace(/[^0-9.]/g, '');
        trackViewItem({
            id: selectedGroup.parentName,
            title: `${selectedGroup.parentName}${activeVariation.Title !== selectedGroup.parentName ? ' — ' + activeVariation.Title : ''}`,
            category: activeVariation.Category || 'Collection',
            price: parseFloat(priceStr) || 0,
            variationTitle: activeVariation.Title,
            styleName: activeVariation.StyleName || activeVariation.Title,
            parentName: selectedGroup.parentName,
        });
    }, [selectedGroup, activeVariation]);

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
            // lh3.googleusercontent.com is the most reliable for publicly shared Drive files
            return `https://lh3.googleusercontent.com/d/${match[1]}=w1200`;
        }
        return trimmed;
    };

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

    // Check if a specific variation is out of stock
    const isVariationSoldOut = (variation: any) => {
        const stock = String(variation?.Stock || '').trim().toLowerCase();
        return stock === '0' || stock === 'out of stock' || stock === 'sold out' || stock === 'unavailable';
    };

    // Get all images for the current variation for arrow navigation
    const getCurrentImages = () => {
        if (!activeVariation) return [];
        if (activeVariation.images && activeVariation.images.length > 0) {
            return activeVariation.images.map((img: any) => ({
                url: getImageUrl(img.Url),
                title: img.Title
            }));
        }
        if (activeVariation['Main Image Link']) {
            return [{ url: getImageUrl(activeVariation['Main Image Link']), title: activeVariation.Title }];
        }
        if (selectedGroup?.parentImage) {
            return [{ url: getImageUrl(selectedGroup.parentImage), title: selectedGroup.parentName }];
        }
        return [];
    };

    // Convert a variation into a Product for the cart
    const variationToProduct = (): Product | null => {
        if (!activeVariation || !selectedGroup) return null;
        const priceStr = String(activeVariation.Price || '0').replace(/[^0-9.]/g, '');
        const price = parseFloat(priceStr) || 0;
        const imgUrl = currentImages[0]?.url || '';
        return {
            id: Date.now(), // Unique ID for inventory items
            title: `${selectedGroup.parentName}${activeVariation.Title !== selectedGroup.parentName ? ' — ' + activeVariation.Title : ''}`,
            category: activeVariation.Category || 'Collection',
            image: imgUrl,
            price,
            gender: (selectedGroup.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex',
            // Pass extra info for the webhook to match
            variationTitle: activeVariation.Title,
            styleName: activeVariation.StyleName || activeVariation.Title,
            parentName: selectedGroup.parentName,
        } as any;
    };

    const handleAddToBag = () => {
        const product = variationToProduct();
        if (product) {
            addToCart(product);
        }
    };

    const handleBuyNow = () => {
        const product = variationToProduct();
        if (product) {
            addToCart(product);
            setIsCartOpen(false);
            navigate('/checkout');
        }
    };

    const handlePrevImage = () => {
        const images = getCurrentImages();
        if (images.length > 1) {
            setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
        }
    };

    const handleNextImage = () => {
        const images = getCurrentImages();
        if (images.length > 1) {
            setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black py-32 px-6 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-matteo-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal/60 dark:text-white/60">Loading product details...</p>
            </div>
        );
    }

    if (error || !selectedGroup) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black py-32 px-6 flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-8 max-w-lg">
                    <p className="font-sans text-sm uppercase tracking-wider mb-2">Notice</p>
                    <p className="font-serif mb-6">{error || 'Product not found.'}</p>
                    <button 
                        onClick={() => navigate(basePath)}
                        className="px-6 py-3 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-sans text-[10px] uppercase tracking-widest"
                    >
                        Return to Collection
                    </button>
                </div>
            </div>
        );
    }

    const currentImages = getCurrentImages();
    const currentSoldOut = isVariationSoldOut(activeVariation);

    return (
        <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col items-center">
            
            {/* Lightbox Overlay (Must be outside overflow-hidden containers) */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-[9999999] w-screen h-[100dvh] bg-white dark:bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 cursor-zoom-out animate-fade-in-up overflow-hidden"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button 
                        className="absolute top-6 right-6 md:top-10 md:right-10 text-matteo-charcoal/70 hover:text-matteo-orange dark:text-white/70 dark:hover:text-white font-sans text-xs uppercase tracking-widest transition-colors z-[99999999] flex items-center gap-2"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <span>Close</span>
                        <span className="text-xl leading-none">×</span>
                    </button>

                    {/* Lightbox arrows */}
                    {currentImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-black/80 shadow-md z-[99999999] transition-all"
                                aria-label="Previous image"
                            >
                                <svg className="w-5 h-5 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-black/80 shadow-md z-[99999999] transition-all"
                                aria-label="Next image"
                            >
                                <svg className="w-5 h-5 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </>
                    )}

                    <div className="w-full h-full flex items-center justify-center">
                        <img 
                            src={currentImages[activeImageIndex]?.url || ''} 
                            alt="Enlarged view" 
                            className="w-full h-full max-h-[85vh] md:max-h-[95vh] object-contain cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Lightbox dot indicators */}
                    {currentImages.length > 1 && (
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-[99999999]">
                            {currentImages.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${i === activeImageIndex ? 'bg-matteo-orange w-4' : 'bg-matteo-charcoal/30 dark:bg-white/30 hover:bg-matteo-charcoal/50 dark:hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="w-full max-w-7xl">
                
                {/* Header Navigation */}
                <div className="mb-12 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(basePath)}
                        className="font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal/60 dark:text-white/60 hover:text-matteo-orange dark:hover:text-matteo-orange transition-colors flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back to Collection</span>
                    </button>
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 animate-fade-in-up">
                    
                    {/* Left Side: Dynamic Image with Navigation Arrows */}
                    <div className="w-full lg:w-5/12 h-[50vh] lg:h-[600px] bg-[#f0f0f0] dark:bg-[#111] relative shadow-xl overflow-hidden shrink-0 group/imgbox">
                        {(() => {
                            const displayImgUrl = currentImages[activeImageIndex]?.url || '';

                            return displayImgUrl ? (
                                <>
                                    <img 
                                        key={displayImgUrl} 
                                        src={displayImgUrl} 
                                        alt={currentImages[activeImageIndex]?.title || selectedGroup.parentName}
                                        className="w-full h-full object-contain object-center mix-blend-multiply dark:mix-blend-normal animate-fade-in-up cursor-zoom-in p-8"
                                        onError={(e) => {
                                            // Fallback to a placeholder instead of hiding completely so user knows it loaded but failed
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                            (e.target as HTMLImageElement).className = "w-1/2 h-1/2 mx-auto object-contain opacity-20";
                                        }}
                                        onClick={() => setIsLightboxOpen(true)}
                                    />

                                    {/* Sold Out Overlay */}
                                    {currentSoldOut && (
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white bg-red-600/90 px-4 py-1.5 backdrop-blur-sm">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}

                                    {/* Zoom hint */}
                                    <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover/imgbox:opacity-100 transition-opacity pointer-events-none z-10">
                                        <svg className="w-4 h-4 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>

                                    {/* ── NAVIGATION ARROWS ── */}
                                    {currentImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/imgbox:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
                                                aria-label="Previous image"
                                            >
                                                <svg className="w-4 h-4 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover/imgbox:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 shadow-md z-10"
                                                aria-label="Next image"
                                            >
                                                <svg className="w-4 h-4 text-matteo-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                            </button>
                                        </>
                                    )}

                                    {/* Image counter & dot indicators */}
                                    {currentImages.length > 1 && (
                                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-10">
                                            <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-charcoal/50 dark:text-white/50">
                                                {activeImageIndex + 1} / {currentImages.length}
                                            </span>
                                            <div className="flex justify-center gap-1.5">
                                                {currentImages.map((_: any, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === activeImageIndex ? 'bg-matteo-orange w-3' : 'bg-matteo-charcoal/20 dark:bg-white/20 hover:bg-matteo-charcoal/40 dark:hover:bg-white/40'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="font-sans text-[10px] uppercase tracking-widest opacity-30">No Image Available</span>
                                </div>
                            );
                        })()}
                    </div>
                    
                    {/* Right Side: Info and Variation Selection */}
                    <div className="w-full lg:w-7/12 flex flex-col py-4">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-4 block">
                            {activeVariation?.Category || 'Collection'}
                        </span>
                        
                        <h1 className="font-serif text-4xl md:text-5xl mb-2 text-matteo-charcoal dark:text-white leading-tight">
                            {selectedGroup.parentName}
                        </h1>
                        
                        {activeVariation && activeVariation.Title && activeVariation.Title !== selectedGroup.parentName && (
                            <h2 className="font-serif text-xl md:text-2xl mb-4 text-matteo-charcoal/70 dark:text-white/70">
                                {activeVariation.Title}
                            </h2>
                        )}
                        
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-matteo-charcoal/10 dark:border-white/10">
                            <span className="font-sans text-lg tracking-widest text-matteo-charcoal/80 dark:text-gray-300">
                                {activeVariation?.Price || getPriceRange(selectedGroup.variations)}
                            </span>
                            {activeVariation?.Stock && (
                                <span className={`font-sans text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full ${
                                    currentSoldOut 
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                                        : 'bg-matteo-charcoal/5 dark:bg-white/5 text-matteo-charcoal/80 dark:text-white/80'
                                }`}>
                                    {currentSoldOut ? 'Sold Out' : activeVariation.Stock}
                                </span>
                            )}
                        </div>

                        {/* ── COLOR/VARIATION SELECTION — ¼ SIZE SWATCHES ── */}
                        {selectedGroup.variations.length > 0 && (
                            <div className="mb-10 pb-10 border-b border-matteo-charcoal/10 dark:border-white/10">
                                <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-charcoal/60 dark:text-gray-400 mb-4">
                                    Select Color — {selectedGroup.variations.length} {selectedGroup.variations.length === 1 ? 'option' : 'options'}
                                </h4>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                    {selectedGroup.variations.map((v, idx) => {
                                        const isActive = v === activeVariation;
                                        const isSoldOut = isVariationSoldOut(v);
                                        const thumbUrl = v.images && v.images.length > 0
                                            ? getImageUrl(v.images[0].Url)
                                            : v['Main Image Link']
                                                ? getImageUrl(v['Main Image Link'])
                                                : '';
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setActiveVariation(v);
                                                    setActiveImageIndex(0);
                                                }}
                                                className={`group/swatch flex flex-col items-center gap-1 transition-all duration-200 ${isSoldOut ? 'opacity-40' : ''}`}
                                                title={`${v.StyleName || v.Title || `Style ${idx + 1}`}${isSoldOut ? ' — Sold Out' : ''}`}
                                            >
                                                <div className={`w-full aspect-square overflow-hidden border-2 transition-all duration-200 relative ${
                                                    isActive
                                                        ? 'border-matteo-orange shadow-md'
                                                        : 'border-matteo-charcoal/10 dark:border-white/10 hover:border-matteo-orange/50'
                                                }`}>
                                                    {thumbUrl ? (
                                                        <img
                                                            src={thumbUrl}
                                                            alt={v.StyleName || v.Title || `Style ${idx + 1}`}
                                                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#f0f0f0] dark:bg-[#111] flex items-center justify-center">
                                                            <span className="font-sans text-[6px] uppercase tracking-widest opacity-30">—</span>
                                                        </div>
                                                    )}
                                                    {/* Sold out line-through */}
                                                    {isSoldOut && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-full h-[1px] bg-red-500/70 rotate-45 transform origin-center"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedGroup.description && (
                            <div className="mb-8">
                                <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-charcoal/60 dark:text-gray-400 mb-3">Description</h4>
                                <p className="font-serif text-base leading-relaxed text-matteo-charcoal dark:text-gray-300 whitespace-pre-wrap">
                                    {selectedGroup.description}
                                </p>
                            </div>
                        )}
                        
                        {selectedGroup.gender && (
                            <div className="mb-8">
                                <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-charcoal/60 dark:text-gray-400 mb-3">Specification</h4>
                                <p className="font-serif text-base text-matteo-charcoal dark:text-gray-300">
                                    {selectedGroup.gender}
                                </p>
                            </div>
                        )}

                        {/* ── ADD TO BAG / CHECKOUT ── */}
                        <div className="mt-4 space-y-4">
                            {currentSoldOut ? (
                                <button
                                    disabled
                                    className="w-full bg-matteo-charcoal/20 dark:bg-white/10 text-matteo-charcoal/40 dark:text-white/30 py-4 font-sans text-[10px] uppercase tracking-[0.2em] cursor-not-allowed"
                                >
                                    Sold Out
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleAddToBag}
                                        className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors duration-300"
                                    >
                                        Add to Bag — {activeVariation?.Price || getPriceRange(selectedGroup.variations)}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full border border-matteo-charcoal/20 dark:border-white/20 text-matteo-charcoal dark:text-white py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:border-matteo-orange hover:text-matteo-orange transition-colors duration-300"
                                    >
                                        Buy Now
                                    </button>
                                </>
                            )}
                            <p className="font-sans text-[9px] uppercase tracking-widest text-matteo-charcoal/40 dark:text-white/30 text-center">
                                Secure checkout via Stripe · Free shipping on orders over $500
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
