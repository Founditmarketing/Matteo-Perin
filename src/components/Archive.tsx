import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ProductService } from '@/services/productService';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { Product } from '../types';
import { ParallaxImage } from './ParallaxImage';

interface ArchiveProps {
    initialGender?: 'men' | 'women';
}

// 1. Editorial Card (Magazine Feel)
const EditorialCard: React.FC<{ product: Product; featured?: boolean }> = ({ product, featured }) => {
    return (
        <Link to={`/collection/${product.id}`} className="group block h-full">
            <div className={`relative overflow-hidden mb-6 ${featured ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}>
                <ParallaxImage
                    src={product.image}
                    alt={product.title}
                    containerClassName="w-full h-full bg-[#f4f4f4]"
                    className="grayscale group-hover:grayscale-0 transition-all duration-1000 dark:brightness-90"
                    speed={featured ? 0.05 : 0.08}
                />
                {/* Modern Hover Badge */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="bg-white/90 dark:bg-black/90 text-matteo-charcoal dark:text-white text-[10px] uppercase tracking-widest px-3 py-1 ">
                        View
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="font-serif text-2xl text-matteo-charcoal dark:text-white group-hover:underline decoration-1 underline-offset-4 decoration-matteo-orange/50 transition-all">
                    {product.title}
                </h3>
                <div className="flex justify-between items-baseline border-t border-matteo-charcoal/10 dark:border-white/10 pt-2 mt-2">
                    <p className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone-ink dark:text-matteo-stone">
                        {product.category}
                    </p>
                    {/* Price hidden for Silent Luxury */}
                </div>
            </div>
        </Link>
    );
};

// 2. Grid Card (Modern Swiss Style - Left Aligned)
const GridCard: React.FC<{ product: Product }> = ({ product }) => {
    return (
        <Link to={`/collection/${product.id}`} className="group block relative">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-[#f0f0f0] dark:bg-[#111]">
                <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[0.6s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 dark:brightness-90"
                />

                {/* Modern "Quick Shop" Overlay on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent">
                    <span className="text-white font-sans text-[10px] uppercase tracking-widest">
                        Quick Add +
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h3 className="font-serif text-lg text-matteo-charcoal dark:text-white leading-tight mb-1 group-hover:text-matteo-orange transition-colors">
                        {product.title}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone">
                        {product.category}
                    </p>
                </div>
                {/* Price hidden for Silent Luxury */}
            </div>
        </Link>
    );
};


export const Archive: React.FC<ArchiveProps> = ({ initialGender }) => {
    // Logic: Men/Women = Grid Default. Main Collection = Editorial Default.
    const [activeView, setActiveView] = useState<'editorial' | 'grid'>(
        initialGender ? 'grid' : 'editorial'
    );

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveView(initialGender ? 'grid' : 'editorial');
    }, [initialGender]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await ProductService.getProducts();
                setProducts(data);
                setTimeout(() => setLoading(false), 200);
            } catch (error) {
                console.error("Failed to load archive:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (initialGender) {
            filtered = filtered.filter(p => p.gender === initialGender || p.gender === 'unisex');
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        return filtered;
    }, [products, initialGender, searchQuery]);

    // Grouping for Editorial
    const groupedProducts = useMemo(() => {
        const groups: Record<string, Product[]> = {};
        filteredProducts.forEach(p => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });
        return groups;
    }, [filteredProducts]);

    const categories = Object.keys(groupedProducts);

    const getTitle = () => {
        if (initialGender === 'men') return "Men";
        if (initialGender === 'women') return "Women";
        return "The Archive";
    };

    if (loading) {
        return (
            <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 transition-colors duration-700 flex items-center justify-center">
                {/* Silent Luxury Loading - Empty State */}
            </div>
        );
    }

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 pb-32 transition-colors duration-700 animate-fade-in-up">

            <Helmet>
                <title>The Collection — Luxury Clothing &amp; Exotic Leather in Jackson, WY | Matteo Perin</title>
                <meta name="description" content="Browse the Matteo Perin collection — bespoke jackets, exotic leather goods, and one-of-a-kind luxury pieces for men and women, handcrafted in Italy and shown at our Jackson Hole atelier on 164 E Deloney Ave." />
                <link rel="canonical" href="https://www.matteoperin.com/collection" />
                <meta property="og:title" content="The Collection — Luxury Clothing in Jackson, WY | Matteo Perin" />
                <meta property="og:description" content="Bespoke jackets, exotic leather, and one-of-a-kind luxury pieces, handcrafted in Italy. Shown at the Matteo Perin atelier in Jackson Hole." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/collection" />
            </Helmet>

            {/* HEADER SECTION */}
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-matteo-charcoal/10 dark:border-white/10">
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone-ink dark:text-matteo-stone block mb-4">
                            The Reference Archive
                        </span>
                        <h1 className="font-serif text-6xl md:text-8xl text-matteo-charcoal dark:text-white font-light leading-none">
                            {getTitle()}
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.1} className="w-full md:w-auto">
                        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12">
                            {/* Search Input - Minimal */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-b border-transparent group-hover:border-matteo-charcoal dark:group-hover:border-white py-1 font-sans text-xs uppercase tracking-widest text-matteo-charcoal dark:text-white placeholder-matteo-stone focus:outline-none focus:border-matteo-orange transition-all w-32 focus:w-48 text-right"
                                />
                                <span className="absolute right-full mr-2 top-1 text-matteo-stone-ink dark:text-matteo-stone">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                            </div>

                            {/* View Toggles - Mobile Optimized */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveView('editorial')}
                                    className={`w-11 h-11 flex items-center justify-center border transition-colors ${activeView === 'editorial' ? 'border-matteo-charcoal dark:border-white bg-matteo-charcoal dark:bg-white text-white dark:text-black' : 'border-matteo-charcoal/20 dark:border-white/20 text-matteo-stone-ink dark:text-matteo-stone hover:border-matteo-orange'}`}
                                    title="Editorial View"
                                >
                                    <span className="font-serif italic text-lg">E</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('grid')}
                                    className={`w-11 h-11 flex items-center justify-center border transition-colors ${activeView === 'grid' ? 'border-matteo-charcoal dark:border-white bg-matteo-charcoal dark:bg-white text-white dark:text-black' : 'border-matteo-charcoal/20 dark:border-white/20 text-matteo-stone-ink dark:text-matteo-stone hover:border-matteo-orange'}`}
                                    title="Grid View"
                                >
                                    <div className="grid grid-cols-2 gap-0.5">
                                        <div className="w-1.5 h-1.5 bg-current"></div>
                                        <div className="w-1.5 h-1.5 bg-current"></div>
                                        <div className="w-1.5 h-1.5 bg-current"></div>
                                        <div className="w-1.5 h-1.5 bg-current"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* Modern Filter Bar (Collapsible) */}
                {activeView === 'grid' && (
                    <div className="flex items-center gap-6 py-4 overflow-x-auto scrollbar-hide">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors whitespace-nowrap">
                            Filter +
                        </button>
                        <div className="w-[1px] h-3 bg-matteo-charcoal/10 dark:bg-white/10"></div>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone whitespace-nowrap">
                            {filteredProducts.length} Results
                        </span>
                        {/* Placeholder Filter Chips for aesthetic */}
                        {isFilterOpen && (
                            <div className="flex gap-4 animate-fade-in-up">
                                {['Outerwear', 'Tailoring', 'Leather Goods', 'Accessories'].map(f => (
                                    <button key={f} className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone hover:text-matteo-charcoal dark:hover:text-white transition-colors whitespace-nowrap p-2">
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* VIEW: EDITORIAL */}
            {activeView === 'editorial' && (
                <div className="space-y-32">
                    {categories.map((cat, index) => {
                        const products = groupedProducts[cat];
                        return (
                            <section key={cat} className="max-w-[1920px] mx-auto px-6 md:px-12">
                                <div className="flex items-baseline justify-between mb-12 border-b border-matteo-charcoal/5 dark:border-white/5 pb-4">
                                    <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white">{cat}</h2>
                                    <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-orange">0{index + 1}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                                    {/* Featured Item */}
                                    {products.length > 0 && (
                                        <div className="md:col-span-8 md:col-start-1">
                                            <EditorialCard product={products[0]} featured />
                                        </div>
                                    )}

                                    {/* Sidebar Items */}
                                    {products.length > 1 && (
                                        <div className="md:col-span-4 flex flex-col justify-between">
                                            <div className="hidden md:block mb-12 pt-12">
                                                <p className="font-serif text-xl italic text-matteo-charcoal/50 dark:text-white/50 leading-relaxed">
                                                    "Every detail serves a purpose. Simplicity is the ultimate sophistication."
                                                </p>
                                            </div>
                                            {products[1] && <EditorialCard product={products[1]} />}
                                        </div>
                                    )}

                                    {/* Remaining Grid */}
                                    {products.slice(2).map(p => (
                                        <div key={p.id} className="md:col-span-4">
                                            <EditorialCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}

            {/* VIEW: GRID (Refined Modern Swiss) */}
            {activeView === 'grid' && (
                <div className="max-w-[1920px] mx-auto px-6 md:px-12">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                            {filteredProducts.map((product, index) => (
                                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                    <GridCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center">
                            <p className="font-serif text-xl text-matteo-stone-ink dark:text-matteo-stone">No items found.</p>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-matteo-orange font-sans text-xs uppercase tracking-widest border-b border-current">Clear Search</button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};
