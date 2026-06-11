import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '@/services/productService';
import { Product } from '../types';
import { RevealOnScroll } from './RevealOnScroll';
import { useInquiry } from '../context/InquiryContext';
import { Magnetic } from './Magnetic';

// Simple Accordion
const MinimalAccordion: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="border-t border-matteo-charcoal/10 dark:border-white/10">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center py-6 group"
            >
                <span className="font-sans text-[11px] uppercase tracking-widest text-matteo-charcoal dark:text-white group-hover:text-matteo-orange transition-colors duration-500">{title}</span>
                <span className={`font-serif text-lg text-matteo-stone transition-transform duration-500 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
            </button>
            <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="font-serif text-lg text-matteo-charcoal/70 dark:text-gray-400 leading-relaxed max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};


export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { openInquiry } = useInquiry();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [openAccordion, setOpenAccordion] = useState<string | null>('provenance');

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            try {
                const data = await ProductService.getProductById(id || '');
                setProduct(data || null); // Ensure null if undefined
                setTimeout(() => setLoading(false), 200); // Luxury easing
            } catch (error) {
                console.error("Failed to load product:", error);
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 transition-colors duration-700 flex items-center justify-center">
                {/* Silent Loading */}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 text-center px-4 flex flex-col items-center justify-center">
                <h1 className="font-serif text-2xl text-matteo-charcoal dark:text-white mb-4">Product Unavailable</h1>
                <p className="font-sans text-xs text-matteo-stone mb-8">The requested item (ID: {id}) could not be located.</p>
                <Link to="/" className="text-matteo-orange text-xs uppercase tracking-widest border-b border-matteo-orange pb-1 hover:opacity-80 transition-opacity">Return to Collection</Link>
            </div>
        );
    }

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black text-matteo-charcoal dark:text-white min-h-screen pt-32 pb-32 transition-colors duration-700 animate-fade-in-up">

            <Helmet>
                <title>{`${product.title} — ${product.category} | Matteo Perin`}</title>
                <meta name="description" content={product.description || `${product.title} by Matteo Perin — Italian bespoke luxury.`} />
                <link rel="canonical" href={`https://www.matteoperin.com/collection/${product.id}`} />
                <meta property="og:title" content={`${product.title} — ${product.category} | Matteo Perin`} />
                <meta property="og:description" content={product.description || ''} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`https://www.matteoperin.com/collection/${product.id}`} />
                {product.image && <meta property="og:image" content={`https://www.matteoperin.com${product.image}`} />}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.title,
                        "category": product.category,
                        "description": product.description || "",
                        "image": product.image ? `https://www.matteoperin.com${product.image}` : undefined,
                        "brand": { "@type": "Brand", "name": "Matteo Perin" },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://www.matteoperin.com/collection/${product.id}`,
                            "priceCurrency": "USD",
                            "price": String(product.price ?? ""),
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition",
                            "seller": { "@type": "Organization", "name": "Matteo Perin" }
                        }
                    })}
                </script>
            </Helmet>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12">

                {/* Breadcrumb */}
                <div className="mb-12 flex justify-center md:justify-start">
                    <Link to="/collection" className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone hover:text-matteo-orange transition-colors p-4 -ml-4">
                        Collection
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Product Visuals (Left - Scrolling) */}
                    <div className="lg:col-span-7 space-y-4">
                        <RevealOnScroll delay={0.1}>
                            <div className="aspect-[3/4] w-full bg-[#EAE8E4] dark:bg-[#111] overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover dark:brightness-90 hover:scale-105 transition-transform duration-[2s]"
                                />
                            </div>
                        </RevealOnScroll>

                        <div className="grid grid-cols-2 gap-4">
                            <RevealOnScroll delay={0.2}>
                                <div className="aspect-square bg-[#EAE8E4] dark:bg-[#111] overflow-hidden">
                                    <img src={product.image} className="w-full h-full object-cover scale-150" />
                                </div>
                            </RevealOnScroll>
                            <div className="aspect-square bg-[#EAE8E4] dark:bg-[#111] overflow-hidden flex items-center justify-center bg-matteo-charcoal/5 dark:bg-white/5">
                                <span className="font-serif italic text-matteo-stone">Fabric Detail</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Info (Right - Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-32 flex flex-col pt-12">
                            <RevealOnScroll>
                                <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-orange mb-4 block">
                                    Ref. {String(product.id).padStart(3, '0')}
                                </span>
                                <h1 className="font-serif text-5xl md:text-6xl mb-6 font-light leading-none">
                                    {product.title}
                                </h1>
                                <p className="font-serif text-2xl text-matteo-charcoal/80 dark:text-white mb-2">
                                    ${product.price.toLocaleString()}
                                    {product.id === 14 && <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-matteo-orange ml-2">Deposit</span>}
                                </p>
                                {product.id === 14 && (
                                    <div className="mb-4">
                                        <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-matteo-stone leading-relaxed mb-2">
                                            Full commission: $185,000 · Secure your slot with a $25,000 deposit · Pay the rest later
                                        </p>
                                        <Link to="/bespoke-crocodile-jacket" className="font-sans text-[10px] uppercase tracking-[0.15em] text-matteo-orange border-b border-matteo-orange/40 pb-0.5 hover:border-matteo-orange transition-colors">
                                            View Full Product Page →
                                        </Link>
                                    </div>
                                )}

                                {/* The Fact Sheet */}
                                <div className="grid grid-cols-2 gap-4 border-t border-b border-matteo-charcoal/10 dark:border-white/10 py-6 mb-8">
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone block mb-1">Origin</span>
                                        <span className="font-serif text-lg">Biella, Italy</span>
                                    </div>
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone block mb-1">Material</span>
                                        <span className="font-serif text-lg">{product.id === 14 ? 'Nile or Porosus Crocodile' : 'Super 200s Wool'}</span>
                                    </div>
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone block mb-1">Time</span>
                                        <span className="font-serif text-lg">{product.id === 14 ? '100+ Hours' : '65+ Hours'}</span>
                                    </div>
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-luxury text-matteo-stone block mb-1">Edition</span>
                                        <span className="font-serif text-lg">Bespoke</span>
                                    </div>
                                </div>

                                <p className="font-serif text-lg text-matteo-stone leading-relaxed mb-12 max-w-md">
                                    {product.description || "Crafted from the finest materials available. A testament to Italian heritage and modern design philosophy."}
                                </p>

                                {/* Add to Bag - Refined */}
                                <Magnetic>
                                    <button
                                        onClick={() => openInquiry(product)}
                                        className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors"
                                    >
                                        Request Bespoke Look
                                    </button>
                                </Magnetic>
                                {product.id === 14 && (
                                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-matteo-stone text-center mb-12 leading-relaxed">
                                        Remaining balance of $160,000 invoiced before production begins
                                    </p>
                                )}

                                <div className="space-y-4">
                                    <MinimalAccordion
                                        title="The Process"
                                        isOpen={openAccordion === 'provenance'}
                                        onClick={() => setOpenAccordion(openAccordion === 'provenance' ? null : 'provenance')}
                                    >
                                        Constructed entirely by hand in our Italian atelier. Requires 3 fittings to achieve the Matteo Perin silhouette.
                                    </MinimalAccordion>
                                    <MinimalAccordion
                                        title="Delivery"
                                        isOpen={openAccordion === 'shipping'}
                                        onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                                    >
                                        Personal delivery by courier or fitting specialist. 6-8 weeks lead time.
                                    </MinimalAccordion>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
