import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { reportInquiryConversion } from '@/lib/gtagConversion';
import { PRODUCTS } from '../constants';
import { Link } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveImage } from './ResponsiveImage';

// --- Animation Variants ---
const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        }
    }
};

// --- All gallery images (.webp bases — ResponsiveImage serves -sm/-md/-lg variants) ---
const GALLERY_IMAGES = [
    "/assets/croc-jacket/matteo_croc_new_1.webp",
    "/assets/croc-jacket/matteo_croc_new_2.webp",
    "/assets/croc-jacket/matteo_croc.webp",
    "/assets/croc-jacket/hero_jacket_1.webp",
    "/assets/croc-jacket/detail_jacket_2.webp",
    "/assets/croc-jacket/detail_jacket_3.webp",
    "/assets/croc-jacket/detail_jacket_4.webp",
    "/assets/croc-jacket/detail_jacket_5.webp",
    "/assets/croc-jacket/detail_jacket_6.webp",
    "/assets/croc-jacket/detail_jacket_7.webp",
    "/assets/croc-jacket/detail_jacket_8.webp",
    "/assets/croc-jacket/detail_jacket_9.webp",
];

// Small thumbnail asset for the contact sheet (ResponsiveImage cannot target a
// single variant, so the sheet loads the -sm.webp file directly)
const thumbSrc = (baseSrc: string) => baseSrc.replace(/\.webp$/, '-sm.webp');

// --- The Ledger: provenance, not statistics ---
const LEDGER_ROWS: [string, string][] = [
    ["Hide", "Nile or Porosus, hand-selected"],
    ["Patina", "Hand-painted by one artisan"],
    ["Bench", "One hundred hours, Verona"],
    ["Edition", "One of one"],
];

// --- Specification Accordion Item ---
const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; onOpen?: () => void }> = ({ title, children, defaultOpen = false, onOpen }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-matteo-charcoal/10 dark:border-white/10">
            <button
                onClick={() => {
                    const next = !isOpen;
                    setIsOpen(next);
                    if (next && onOpen) onOpen();
                }}
                className="w-full flex justify-between items-center py-5 text-left group"
            >
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-matteo-charcoal dark:text-white group-hover:text-matteo-orange-ink dark:group-hover:text-matteo-orange transition-colors">
                    {title}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-matteo-charcoal dark:text-white text-lg leading-none"
                >
                    +
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 font-serif text-sm text-matteo-charcoal/70 dark:text-white/60 leading-relaxed">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const CrocJacketLanding: React.FC = () => {

    const { openInquiry } = useInquiry();
    const [selectedImage, setSelectedImage] = useState(0);
    const [viewedImages, setViewedImages] = useState<Set<number>>(new Set([0]));
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [conciergeData, setConciergeData] = useState({ name: '', email: '', phone: '', city: '' });
    const [conciergeSubmitting, setConciergeSubmitting] = useState(false);
    const [conciergeSuccess, setConciergeSuccess] = useState(false);
    const [conciergeError, setConciergeError] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const swipeStartX = useRef<number | null>(null);

    const crocJacket = PRODUCTS.find(p => p.id === 14);

    // Helper: fire gtag safely
    const fireEvent = (eventName: string, params: Record<string, any> = {}) => {
        if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', eventName, params);
        }
    };
    // Google Ads lead conversion — fired ONLY where a submission verifiably
    // reached the server (the concierge form below; InquiryModal handles its own).
    const fireConversion = () => {
        reportInquiryConversion();
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Micro-conversion: 90s engaged session
    useEffect(() => {
        const timer = setTimeout(() => {
            fireEvent('engaged_session', { page: 'bespoke_crocodile_jacket', seconds: 90 });
        }, 90000);
        return () => clearTimeout(timer);
    }, []);

    // Track image views for gallery_complete
    const handleImageSelect = (i: number) => {
        setSelectedImage(i);
        setViewedImages(prev => {
            const next = new Set(prev).add(i);
            if (next.size === GALLERY_IMAGES.length) {
                fireEvent('gallery_complete', { gallery: 'croc_jacket', total_images: GALLERY_IMAGES.length });
            }
            return next;
        });
    };

    const showPrevImage = () => handleImageSelect(selectedImage === 0 ? GALLERY_IMAGES.length - 1 : selectedImage - 1);
    const showNextImage = () => handleImageSelect(selectedImage === GALLERY_IMAGES.length - 1 ? 0 : selectedImage + 1);

    // Horizontal swipe on the hero image (touch / pen pointers)
    const handleSwipeStart = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') swipeStartX.current = e.clientX;
    };
    const handleSwipeEnd = (e: React.PointerEvent) => {
        if (swipeStartX.current === null) return;
        const dx = e.clientX - swipeStartX.current;
        swipeStartX.current = null;
        if (Math.abs(dx) > 48) {
            if (dx < 0) showNextImage(); else showPrevImage();
        }
    };

    // Contact sheet → hero: select the frame and return to the full-bleed view
    const handleSheetSelect = (i: number) => {
        handleImageSelect(i);
        const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        heroRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };

    const handleBuyNow = async () => {
        if (!crocJacket) return;
        // Intent event only — the Google Ads lead conversion is NOT fired on click.
        fireEvent('deposit_initiated', { currency: 'USD', value: 25000, item_name: 'Bespoke Crocodile Jacket Deposit' });
        setCheckoutError('');
        try {
            setIsCheckingOut(true);
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [
                        {
                            title: `Deposit: ${crocJacket.title}`,
                            category: 'Commission Slot Reservation',
                            price: 25000,
                            quantity: 1,
                        }
                    ],
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error("Checkout failed:", data.error);
                setCheckoutError('We could not open the secure payment page. Please try again in a moment — or write to concierge@matteoperin.com and a senior advisor will reserve your commission personally.');
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setCheckoutError('We could not reach the payment service. Please check your connection and try again — or write to concierge@matteoperin.com and a senior advisor will reserve your commission personally.');
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen text-matteo-charcoal dark:text-white transition-colors duration-700">

            <Helmet>
                <title>Bespoke Crocodile Jacket | Handcrafted in Italy | Matteo Perin</title>
                <meta name="description" content="Commission a 1-of-1 bespoke Porosus crocodile jacket by Matteo Perin — a hand-painted Nile crocodile coat finished with a hand-developed patina over 100+ hours of artisanal hand-stitching in Verona, Italy, using certified CITES-regulated hides. Full commission $185,000; secure your slot with a $25,000 deposit." />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <link rel="canonical" href="https://www.matteoperin.com/bespoke-crocodile-jacket" />

                {/* OpenGraph — Optimized for social sharing + AdWords */}
                <meta property="og:title" content="Bespoke Crocodile Jacket — Commission Yours | Matteo Perin" />
                <meta property="og:description" content="One-of-one bespoke crocodile jacket. Hand-selected Nile or Porosus crocodile, hand-developed patina, 100+ hours of Italian craftsmanship. Secure with $25,000 deposit." />
                <meta property="og:image" content="https://www.matteoperin.com/assets/croc-jacket/matteo_croc_new_1.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content="https://www.matteoperin.com/bespoke-crocodile-jacket" />
                <meta property="og:type" content="product" />
                <meta property="og:site_name" content="Matteo Perin" />
                <meta property="product:price:amount" content="185000" />
                <meta property="product:price:currency" content="USD" />
                <meta property="product:availability" content="in stock" />
                <meta property="product:condition" content="new" />
                <meta property="product:brand" content="Matteo Perin" />
                <meta property="product:category" content="Clothing > Outerwear > Leather Jackets" />

                {/* Product structured data — the ONE truthful Product entity for this
                    page. No aggregateRating / reviews (none are verifiable), one
                    availability value, operational shipping + return facts only. */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: 'Bespoke Crocodile Jacket',
                    image: GALLERY_IMAGES.map(img => `https://www.matteoperin.com${img.replace(/ /g, '%20')}`),
                    description: 'One-of-one bespoke crocodile jacket. Hand-selected Nile or Porosus crocodile, hand-painted patina, over 100 hours of artisanal labor in Verona, Italy. CITES-certified hides. Limited to 3 commissions per year.',
                    sku: 'MP-CROC-JACKET-001',
                    brand: { '@type': 'Brand', name: 'Matteo Perin' },
                    manufacturer: { '@type': 'Organization', name: 'Matteo Perin Atelier', url: 'https://www.matteoperin.com' },
                    url: 'https://www.matteoperin.com/bespoke-crocodile-jacket',
                    material: 'CITES-certified Nile (Niloticus) or Porosus crocodile, hand-painted patina, Italian silk lining',
                    countryOfOrigin: { '@type': 'Country', name: 'Italy' },
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'USD',
                        price: 185000,
                        availability: 'https://schema.org/LimitedAvailability',
                        url: 'https://www.matteoperin.com/bespoke-crocodile-jacket',
                        itemCondition: 'https://schema.org/NewCondition',
                        seller: { '@type': 'Organization', name: 'Matteo Perin', url: 'https://www.matteoperin.com' },
                        shippingDetails: {
                            '@type': 'OfferShippingDetails',
                            shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
                            shippingDestination: { '@type': 'DefinedRegion', addressCountry: ['US', 'GB', 'CH', 'FR', 'IT', 'DE', 'AE'] },
                        },
                        hasMerchantReturnPolicy: {
                            '@type': 'MerchantReturnPolicy',
                            applicableCountry: 'US',
                            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
                        },
                    },
                })}</script>

                {/* FAQ structured data — mirrors the on-page accordion content */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'What is the bespoke crocodile jacket made of?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Certified, CITES-regulated Nile (Niloticus) or Porosus crocodile hides — only 1 in 100 skins qualifies. The jacket is finished with a hand-painted patina, pure Italian silk lining, and custom cast palladium hardware, with over 100 hours of artisanal hand-stitching in Verona, Italy.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How does bespoke sizing and fitting work?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Every jacket is drafted from absolute zero — no pre-existing pattern. A senior artisan conducts a measurement session at your location (available globally), mapping over 40 unique body measurements. Standard sizing does not apply.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How long does a commission take and how is it delivered?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Production takes 8–12 weeks from the measurement session. Delivery is complimentary worldwide: the jacket is hand-delivered by white-glove courier in a custom leather-bound presentation case.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How does payment work?',
                            acceptedAnswer: { '@type': 'Answer', text: 'A $25,000 deposit secures your commission slot. The remaining balance of $160,000 is invoiced before production begins. Because each piece is made to order, returns are not accepted once production has commenced.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Is authenticity documented?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Each jacket ships with a signed certificate of authenticity, an individual serial number, and full provenance documentation tracing the skin from conservation center to finished garment. Lifetime maintenance and reconditioning is included.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Where is the Matteo Perin crocodile jacket made?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Every jacket is handcrafted in our atelier in Verona, Italy by master artisans. Matteo Perin also maintains a showroom in Jackson, Wyoming for private consultations and fittings.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Can I customize my bespoke crocodile jacket?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Every commission begins with a private consultation where you select the crocodile skin, patina color, lining, hardware finish, and fit. Each jacket is truly one-of-one — no two are alike.' },
                        },
                    ],
                })}</script>

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bespoke Crocodile Jacket — $25,000 Deposit | Matteo Perin" />
                <meta name="twitter:description" content="One-of-one hand-selected crocodile. Handcrafted in Verona, Italy. 100+ hours of artisanal work." />
                <meta name="twitter:image" content="https://www.matteoperin.com/assets/croc-jacket/matteo_croc_new_1.jpg" />

                {/* Breadcrumb Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.matteoperin.com/" },
                            { "@type": "ListItem", "position": 2, "name": "Bespoke", "item": "https://www.matteoperin.com/bespoke" },
                            { "@type": "ListItem", "position": 3, "name": "Bespoke Crocodile Jacket", "item": "https://www.matteoperin.com/bespoke-crocodile-jacket" }
                        ]
                    })}
                </script>

            </Helmet>

            {/* ============================================================
                ACT I — FULL-BLEED HERO
                The jacket edge-to-edge; title at display scale; the ledger
                overlaid as the scarcity device; the deposit inside frame one.
               ============================================================ */}
            <section
                ref={heroRef}
                className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-matteo-black group"
                aria-label="Bespoke Crocodile Jacket gallery"
            >
                {/* Image layer — swipeable on touch */}
                <div
                    className="absolute inset-0 touch-pan-y"
                    onPointerDown={handleSwipeStart}
                    onPointerUp={handleSwipeEnd}
                    onPointerCancel={() => { swipeStartX.current = null; }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImage}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            <ResponsiveImage
                                baseSrc={GALLERY_IMAGES[selectedImage]}
                                alt={`Bespoke Crocodile Jacket by Matteo Perin - Handcrafted Italian Exotic Leather - Image ${selectedImage + 1}`}
                                className="w-full h-full object-cover object-center"
                                loading="eager"
                                fetchPriority={selectedImage === 0 ? 'high' : 'auto'}
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Cinematic gradients for legibility */}
                <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-matteo-black/50 to-transparent pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-matteo-black/85 via-matteo-black/35 to-transparent pointer-events-none"></div>

                {/* Breadcrumbs — over the hero, dark-surface register */}
                <nav className="absolute top-24 md:top-28 left-6 md:left-12 lg:left-16 z-10">
                    <ol className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
                        <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li className="text-white/30">/</li>
                        <li><Link to="/bespoke" className="hover:text-white transition-colors">Bespoke</Link></li>
                        <li className="text-white/30">/</li>
                        <li className="text-white">Bespoke Crocodile Jacket</li>
                    </ol>
                </nav>

                {/* Image counter */}
                <div className="absolute top-24 md:top-28 right-6 md:right-12 lg:right-16 z-10 font-sans text-[10px] uppercase tracking-[0.15em] text-white/60 pointer-events-none">
                    {String(selectedImage + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
                </div>

                {/* Prev / Next — visible on touch, hover-revealed on desktop, 44px targets */}
                <button
                    onClick={showPrevImage}
                    aria-label="Previous image"
                    className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-matteo-black/40 backdrop-blur-sm text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-matteo-black/70"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                    onClick={showNextImage}
                    aria-label="Next image"
                    className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-matteo-black/40 backdrop-blur-sm text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-matteo-black/70"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>

                {/* First-frame content: eyebrow → display title → deposit + ledger */}
                <div className="absolute inset-x-0 bottom-0 z-10 px-6 md:px-12 lg:px-16 pb-24 lg:pb-14">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[1920px] mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16"
                    >
                        <div className="max-w-3xl">
                            <motion.span variants={fadeUpVariant} className="block font-sans text-[10px] uppercase tracking-[0.4em] font-medium text-matteo-orange mb-5">
                                Exotic Outerwear — Made to Order
                            </motion.span>
                            <motion.h1 variants={fadeUpVariant} className="font-serif text-6xl md:text-8xl font-light leading-[0.95] tracking-tight text-white mb-6">
                                Bespoke<br />Crocodile Jacket
                            </motion.h1>
                            <motion.p variants={fadeUpVariant} className="font-serif italic text-[15px] text-white/70 mb-8 max-w-xl leading-relaxed">
                                $185,000 full commission, reserved with a $25,000 deposit. One of three commissions accepted each year.
                            </motion.p>
                            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isCheckingOut}
                                    className="px-10 py-4 bg-white text-matteo-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange hover:text-white transition-all duration-500 disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isCheckingOut ? 'Initiating Secure Checkout...' : 'Secure with $25,000 Deposit'}
                                </button>
                                <button
                                    onClick={() => {
                                        fireEvent('cta_click', { cta: 'commission_conversation', page: 'croc_jacket', placement: 'hero' });
                                        crocJacket && openInquiry(crocJacket);
                                    }}
                                    className="px-10 py-4 border border-white/40 text-white font-sans text-xs uppercase tracking-[0.2em] hover:border-matteo-orange hover:text-matteo-orange transition-all duration-500"
                                >
                                    Request a Commission Conversation
                                </button>
                            </motion.div>
                            {checkoutError && (
                                <motion.p variants={fadeUpVariant} role="alert" className="font-serif text-sm text-white mt-5 max-w-xl leading-relaxed">
                                    {checkoutError}
                                </motion.p>
                            )}
                        </div>

                        {/* The Ledger — provenance overlaid as the scarcity device */}
                        <motion.dl variants={fadeUpVariant} className="hidden md:block w-full lg:w-[340px] shrink-0 border-t border-b border-white/20 divide-y divide-white/15">
                            {LEDGER_ROWS.map(([label, value]) => (
                                <div key={label} className="flex items-baseline justify-between gap-6 py-3">
                                    <dt className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-white/60 shrink-0">{label}</dt>
                                    <dd className="font-serif text-base text-white text-right">{value}</dd>
                                </div>
                            ))}
                        </motion.dl>
                    </motion.div>
                </div>
            </section>


            {/* ============================================================
                ACT II — THE CONTACT SHEET
                Twelve numbered frames, restaged as an editorial band.
               ============================================================ */}
            <section className="bg-matteo-sand/60 dark:bg-[#111] border-b border-matteo-charcoal/5 dark:border-white/5 py-10 md:py-14 px-4 md:px-8 lg:px-16">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-6 md:mb-8">
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
                            The Contact Sheet
                        </span>
                        <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70">
                            Twelve views of one commission — select a frame to study it above.
                        </p>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
                        {GALLERY_IMAGES.map((img, i) => (
                            <button
                                key={img}
                                onClick={() => handleSheetSelect(i)}
                                aria-label={`View image ${i + 1} of ${GALLERY_IMAGES.length}`}
                                aria-current={selectedImage === i}
                                className="group/frame text-left"
                            >
                                <div className={`aspect-[3/4] overflow-hidden bg-matteo-sand dark:bg-white/5 transition-opacity duration-500 ${
                                    selectedImage === i ? 'opacity-100' : 'opacity-60 group-hover/frame:opacity-100'
                                }`}>
                                    <img
                                        src={thumbSrc(img)}
                                        alt={`Bespoke Crocodile Jacket Detail - Italian Craftsmanship View ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                    />
                                </div>
                                <span className={`block mt-2 font-sans text-[10px] tracking-[0.2em] font-medium transition-colors duration-300 ${
                                    selectedImage === i
                                        ? 'text-matteo-orange-ink dark:text-matteo-orange'
                                        : 'text-matteo-stone-ink dark:text-white/60'
                                }`}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>


            {/* ============================================================
                ACT III — THE COMMISSION
                Editorial spread on the left; the buy rail arrives on scroll.
               ============================================================ */}
            <section className="pt-16 md:pt-24 pb-12 md:pb-24 px-4 md:px-8 lg:px-16 xl:px-24 max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* ---- LEFT: Editorial ---- */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={staggerContainer}
                        >
                            <motion.span variants={fadeUpVariant} className="block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-4">
                                The Commission
                            </motion.span>
                            <motion.h2 variants={fadeUpVariant} className="font-serif text-4xl md:text-5xl font-light leading-[1.05] tracking-tight mb-8">
                                Drafted from<br />absolute zero
                            </motion.h2>
                            <motion.p variants={fadeUpVariant} className="font-serif text-base md:text-lg text-matteo-charcoal/70 dark:text-white/60 leading-relaxed max-w-xl">
                                A 1-of-1 commission in certified, CITES-regulated Nile (Niloticus) or Porosus crocodile. Each piece is finished with a hand-painted patina and shaped over 100+ hours of artisanal hand-stitching in our Verona, Italy atelier. The $185,000 price reflects the rarity of the hides, the labor, and the truly singular nature of custom exotic outerwear — no two are alike.
                            </motion.p>
                        </motion.div>

                        {/* Asymmetric image spread — the garment is the hero */}
                        <div className="mt-12 md:mt-16">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full md:w-4/5 aspect-[4/5] overflow-hidden bg-matteo-sand dark:bg-white/5"
                            >
                                <ResponsiveImage
                                    baseSrc="/assets/croc-jacket/detail_jacket_2.webp"
                                    alt="Bespoke Crocodile Jacket Detail - Italian Craftsmanship"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                className="w-2/3 md:w-3/5 ml-auto -mt-16 md:-mt-28 aspect-[3/4] overflow-hidden bg-matteo-sand dark:bg-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                            >
                                <ResponsiveImage
                                    baseSrc="/assets/croc-jacket/matteo_croc.webp"
                                    alt="Matteo Perin in Bespoke Crocodile Jacket"
                                    className="w-full h-full object-cover object-top"
                                    loading="lazy"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* ---- RIGHT: Sticky Buy Rail ---- */}
                    <motion.div
                        className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeUpVariant} className="font-serif text-2xl md:text-3xl font-light mb-6">
                            Reserve the Commission
                        </motion.h2>

                        {/* Price */}
                        <motion.div variants={fadeUpVariant} className="mb-8">
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-3xl md:text-4xl text-matteo-charcoal dark:text-white">$185,000</span>
                                <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-matteo-stone-ink dark:text-white/60">USD — Full Commission</span>
                            </div>
                            <div className="mt-4 p-4 bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20">
                                <div className="flex items-baseline gap-2 mb-1.5">
                                    <span className="font-serif text-2xl text-matteo-orange-ink dark:text-matteo-orange">$25,000</span>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-matteo-orange-ink dark:text-matteo-orange">Deposit to Reserve</span>
                                </div>
                                <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 leading-relaxed">
                                    Secure your commission slot today with a $25,000 deposit. The remaining balance is due before production begins.
                                </p>
                            </div>
                            <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 mt-3">
                                Complimentary global shipping; tax is computed at checkout.
                            </p>
                        </motion.div>

                        {/* Availability Indicator */}
                        <motion.div variants={fadeUpVariant} className="flex items-center gap-3 mb-10">
                            <span className="inline-flex rounded-full h-2.5 w-2.5 bg-matteo-orange"></span>
                            <span className="font-sans text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
                                Accepting Commissions — Three Per Year
                            </span>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeUpVariant} className="space-y-3 mb-10">
                            {/* Primary: Secure Deposit */}
                            <button
                                onClick={handleBuyNow}
                                disabled={isCheckingOut}
                                className="w-full py-5 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-all duration-500 shadow-lg hover:shadow-xl relative overflow-hidden group disabled:opacity-70 disabled:cursor-wait"
                            >
                                <span className="relative z-10">{isCheckingOut ? 'Initiating Secure Checkout...' : 'Secure with $25,000 Deposit'}</span>
                                {!isCheckingOut && <div className="absolute inset-0 bg-matteo-orange translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>}
                            </button>

                            {checkoutError && (
                                <div role="alert" className="border border-matteo-orange/40 bg-matteo-orange/5 dark:bg-matteo-orange/10 p-4">
                                    <p className="font-serif text-sm text-matteo-charcoal dark:text-white leading-relaxed">{checkoutError}</p>
                                </div>
                            )}

                            {/* Secondary: Request Commission — intent event only; the lead
                                conversion fires inside InquiryModal on verified submit. */}
                            <button
                                onClick={() => {
                                    fireEvent('cta_click', { cta: 'commission_conversation', page: 'croc_jacket', placement: 'buy_rail' });
                                    crocJacket && openInquiry(crocJacket);
                                }}
                                className={`w-full py-4 border font-sans text-xs uppercase tracking-[0.2em] transition-all duration-500 border-matteo-charcoal/30 dark:border-white/30 text-matteo-charcoal dark:text-white hover:border-matteo-orange hover:text-matteo-orange-ink dark:hover:text-matteo-orange`}
                            >
                                Request a Commission Conversation
                            </button>

                            {/* What happens after the deposit — answers the anxiety at the
                                moment it spikes, using only operational facts. */}
                            <div className="py-3 space-y-2.5">
                                {[
                                    'Within 24 hours, a senior advisor calls to begin your consultation.',
                                    'Nothing is cut before you approve — hide, patina, and fit are confirmed with you first.',
                                    'The deposit applies in full to the $185,000 commission; the balance is invoiced only before production begins.',
                                ].map((line) => (
                                    <div key={line} className="flex items-start gap-3">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2.5 shrink-0"></span>
                                        <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 leading-relaxed">{line}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tertiary: Private Inquiry — intent event only; the lead
                                conversion fires on verified form submit below. */}
                            <button
                                onClick={() => {
                                    fireEvent('cta_click', { cta: 'private_viewing_open', page: 'croc_jacket', placement: 'buy_rail' });
                                    setIsConciergeOpen(true);
                                }}
                                className="w-full py-3 font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-matteo-stone-ink dark:text-white/60 hover:text-matteo-orange-ink dark:hover:text-matteo-orange transition-colors underline underline-offset-4 decoration-matteo-stone/40 hover:decoration-matteo-orange"
                            >
                                Schedule a Private Viewing
                            </button>
                        </motion.div>

                        {/* The Ledger — mobile keeps it in the rail (the hero shows it md+) */}
                        <motion.dl variants={fadeUpVariant} className="md:hidden divide-y divide-matteo-charcoal/10 dark:divide-white/10 border-t border-b border-matteo-charcoal/10 dark:border-white/10 mb-8">
                            {LEDGER_ROWS.map(([label, value]) => (
                                <div key={label} className="flex items-baseline justify-between gap-6 py-3">
                                    <dt className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-matteo-stone-ink dark:text-white/60 shrink-0">{label}</dt>
                                    <dd className="font-serif text-base text-matteo-charcoal dark:text-white text-right">{value}</dd>
                                </div>
                            ))}
                        </motion.dl>

                        {/* Accordions: Details, Materials, Shipping */}
                        <motion.div variants={fadeUpVariant}>
                            <AccordionItem
                                title="Materials & Construction"
                                defaultOpen={true}
                                onOpen={() => fireEvent('materials_accordion_open', { page: 'croc_jacket' })}
                            >
                                <ul className="space-y-2 list-none">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        Certified, CITES-regulated Nile (Niloticus) or Porosus crocodile hides — only 1 in 100 skins qualifies
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        100+ hours of artisanal hand-stitching in Verona, Italy
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        Hand-painted patina with infinite color customization
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        Pure Italian silk lining — frictionless interior
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        Custom cast palladium hardware — hand-polished
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-matteo-orange mt-2 shrink-0"></span>
                                        Pattern drafted from absolute zero for your body
                                    </li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem title="Sizing & Bespoke Fit">
                                <p className="mb-3">Every jacket is drafted from absolute zero — no pre-existing pattern is used. A senior artisan will conduct an architectural measurement session at your location (globally available), mapping over 40 unique body measurements.</p>
                                <p>The result is a garment that moves precisely with your body, with zero compromise. Due to the bespoke nature, standard sizing does not apply.</p>
                            </AccordionItem>

                            <AccordionItem title="Shipping & Delivery">
                                <p className="mb-3"><strong className="text-matteo-charcoal dark:text-white">Production Time:</strong> 8–12 weeks from measurement session.</p>
                                <p className="mb-3"><strong className="text-matteo-charcoal dark:text-white">Delivery:</strong> Complimentary global white-glove delivery. Your jacket is hand-delivered in a custom leather-bound presentation case.</p>
                                <p><strong className="text-matteo-charcoal dark:text-white">Payment:</strong> A $25,000 deposit secures your commission slot. The remaining balance of $160,000 is invoiced before production begins. Returns are not accepted once production has commenced.</p>
                            </AccordionItem>

                            <AccordionItem title="Authenticity & Provenance">
                                <p className="mb-3">Each jacket ships with a signed certificate of authenticity, individual serial number, and full provenance documentation tracing the skin from conservation center to finished garment.</p>
                                <p>Lifetime maintenance and reconditioning is included with every commission.</p>
                            </AccordionItem>
                        </motion.div>

                    </motion.div>
                </div>
            </section>


            {/* ============================================================
                BELOW THE FOLD: Editorial / Storytelling
               ============================================================ */}

            {/* The Process — Horizontal Feature Band */}
            <section className="bg-matteo-black text-white py-24 md:py-32 px-6 md:px-12 lg:px-24 mt-12 border-t border-matteo-charcoal/10">
                <div className="max-w-[1920px] mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16 md:mb-24"
                    >
                        <motion.span variants={fadeUpVariant} className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-4 block">
                            The Commission Process
                        </motion.span>
                        <motion.h2 variants={fadeUpVariant} className="font-serif text-3xl md:text-5xl font-light">
                            From Consultation to Delivery
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
                        {[
                            {
                                step: "01",
                                title: "Consultation & Measurement",
                                desc: "A senior artisan travels to your location globally. Over 40 architectural body measurements are taken. Materials, color, and hardware preferences are discussed.",
                            },
                            {
                                step: "02",
                                title: "Skin Selection & Patterning",
                                desc: "Your dedicated crocodile skin is selected from vault-grade inventory. 30+ hours of symmetry mapping ensures flawless scale alignment before a single cut is made.",
                            },
                            {
                                step: "03",
                                title: "Crafting & Delivery",
                                desc: "100+ hours of hand-stitching, hardware casting, and silk lining in our Italian atelier. White-glove delivery in a custom leather presentation case, 8–12 weeks.",
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="relative group"
                            >
                                <span className="font-serif text-7xl md:text-8xl text-white/5 group-hover:text-matteo-orange/10 transition-colors duration-700 absolute -top-4 -left-2">
                                    {item.step}
                                </span>
                                <div className="relative pt-16">
                                    <div className="w-8 h-[1px] bg-matteo-orange mb-6"></div>
                                    <h3 className="font-serif text-xl md:text-2xl mb-4 text-white">{item.title}</h3>
                                    <p className="font-serif text-sm text-white/60 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Final CTA Band */}
            <section className="py-16 md:py-24 px-6 text-center bg-matteo-sand/60 dark:bg-[#111] border-t border-matteo-charcoal/5 dark:border-white/5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-2xl mx-auto"
                >
                    <motion.h2 variants={fadeUpVariant} className="font-serif text-3xl md:text-4xl mb-6 text-matteo-charcoal dark:text-white">
                        Ready to Begin?
                    </motion.h2>
                    <motion.p variants={fadeUpVariant} className="font-serif text-matteo-charcoal/70 dark:text-white/60 text-base mb-10 leading-relaxed">
                        Secure one of three annual commission slots with a $25,000 deposit. Pay the remaining balance before production begins. A Matteo Perin senior advisor will contact you within 24 hours.
                    </motion.p>
                    <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleBuyNow}
                            className="px-12 py-5 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-all duration-500 shadow-lg"
                        >
                            Secure with $25,000 Deposit
                        </button>
                            {/* Final CTA band - Private Inquiry — intent event only; the lead
                                conversion fires on verified form submit in the overlay. */}
                            <button
                                onClick={() => {
                                    fireEvent('cta_click', { cta: 'private_inquiry_open', page: 'croc_jacket', placement: 'final_band' });
                                    setIsConciergeOpen(true);
                                }}
                                className="px-12 py-5 border border-matteo-charcoal/30 dark:border-white/30 text-matteo-charcoal dark:text-white font-sans text-xs uppercase tracking-[0.2em] hover:border-matteo-orange hover:text-matteo-orange-ink dark:hover:text-matteo-orange transition-all duration-500"
                            >
                                Private Inquiry
                            </button>
                    </motion.div>
                    {checkoutError && (
                        <motion.p variants={fadeUpVariant} role="alert" className="font-serif text-sm text-matteo-charcoal dark:text-white mt-8 max-w-lg mx-auto leading-relaxed">
                            {checkoutError}
                        </motion.p>
                    )}
                </motion.div>
            </section>


            {/* ============================================================
                MOBILE STICKY BUY BAR
               ============================================================ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-matteo-cream dark:bg-matteo-black border-t border-matteo-charcoal/10 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                {checkoutError && (
                    <p role="alert" className="px-4 pt-3 font-serif text-xs text-matteo-charcoal dark:text-white leading-relaxed">
                        {checkoutError}
                    </p>
                )}
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-shrink-0">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-serif text-lg text-matteo-orange-ink dark:text-matteo-orange">$25,000</span>
                            <span className="font-sans text-[10px] uppercase tracking-[0.1em] font-medium text-matteo-stone-ink dark:text-white/60">Deposit</span>
                        </div>
                        <div className="font-sans text-[10px] uppercase tracking-[0.1em] font-medium text-matteo-stone-ink dark:text-white/60">Full price: $185,000</div>
                    </div>
                    <button
                        onClick={handleBuyNow}
                        disabled={isCheckingOut}
                        className="flex-1 max-w-[220px] py-3.5 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black font-sans text-[10px] uppercase tracking-[0.15em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isCheckingOut ? 'Opening…' : 'Secure Deposit'}
                    </button>
                </div>
            </div>

            {/* Bottom padding for mobile sticky bar */}
            <div className="h-16 lg:hidden"></div>


            {/* ============================================================
                PRIVATE CONCIERGE OVERLAY
               ============================================================ */}
            <AnimatePresence>
                {isConciergeOpen && (
                    <motion.div
                        className="fixed inset-0 z-[1000] bg-matteo-charcoal/95 flex items-center justify-center p-4 md:p-6"
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <div className="bg-white dark:bg-[#111] w-full max-w-5xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]">
                            {/* Left: Image */}
                            <div className="hidden md:block md:w-1/2 relative h-full">
                                <ResponsiveImage
                                    baseSrc="/assets/croc-jacket/matteo_croc.webp"
                                    alt="Matteo Perin in Bespoke Crocodile Jacket"
                                    className="absolute inset-0 w-full h-full object-cover object-top"
                                    loading="lazy"
                                />
                            </div>
                            {/* Right: Form */}
                            <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-y-auto">
                                <button
                                    onClick={() => setIsConciergeOpen(false)}
                                    className="absolute top-6 right-6 md:top-12 md:right-12 font-sans text-[10px] uppercase tracking-widest hover:text-matteo-orange-ink dark:hover:text-matteo-orange transition-colors z-20 text-matteo-charcoal dark:text-white"
                                >
                                    Close [X]
                                </button>

                                <div className="mt-6 md:mt-0">
                                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-4 block">Private Inquiry</span>
                                    <h3 className="font-serif text-3xl mb-6 leading-tight text-matteo-charcoal dark:text-white">Schedule a Viewing</h3>

                                    {conciergeSuccess ? (
                                        <div className="py-8 text-center">
                                            <div className="w-12 h-12 rounded-full border border-matteo-orange flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-5 h-5 text-matteo-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <p className="font-serif text-matteo-charcoal dark:text-white text-xl mb-2">Inquiry Received</p>
                                            <p className="font-serif text-matteo-charcoal/60 dark:text-white/60 text-sm mb-8">A senior advisor will contact you within 24 hours.</p>
                                            <button onClick={() => { setIsConciergeOpen(false); setConciergeSuccess(false); }} className="font-sans text-[10px] uppercase tracking-widest text-matteo-orange-ink dark:text-matteo-orange border-b border-matteo-orange pb-1">Close</button>
                                        </div>
                                    ) : (
                                    <>
                                    <p className="font-serif text-sm text-matteo-charcoal/60 dark:text-white/60 mb-10">
                                        A senior client advisor will contact you within 24 hours to arrange a private consultation and measurement session in your city.
                                    </p>

                                    <form className="space-y-10" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setConciergeSubmitting(true);
                                        setConciergeError(false);
                                        try {
                                            const res = await fetch('/api/private-client', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    formType: 'contact',
                                                    name: conciergeData.name,
                                                    email: conciergeData.email,
                                                    phone: conciergeData.phone,
                                                    subject: 'Bespoke Crocodile Jacket — Private Viewing Request',
                                                    message: `City / Location: ${conciergeData.city}`,
                                                    referrer: document.referrer || '',
                                                    landingPage: window.location.href,
                                                }),
                                            });
                                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                            // Conversion only fires for inquiries that actually reached us
                                            fireEvent('generate_lead', { lead_type: 'private_viewing', page: 'croc_jacket' });
                                            fireConversion();
                                            setConciergeSuccess(true);
                                        } catch (_) {
                                            setConciergeError(true);
                                        } finally {
                                            setConciergeSubmitting(false);
                                        }
                                    }}>
                                        <input type="text" placeholder="Full Name" value={conciergeData.name} onChange={e => setConciergeData(d => ({...d, name: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
                                        <input type="email" placeholder="Email Address" value={conciergeData.email} onChange={e => setConciergeData(d => ({...d, email: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
                                        <input type="tel" placeholder="Phone Number" value={conciergeData.phone} onChange={e => setConciergeData(d => ({...d, phone: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" />
                                        <input type="text" placeholder="City / Location" value={conciergeData.city} onChange={e => setConciergeData(d => ({...d, city: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
                                        {conciergeError && (
                                            <p role="alert" className="font-serif text-sm text-matteo-charcoal dark:text-white leading-relaxed !mt-6">
                                                Your inquiry could not be sent. Please try again, or write directly to <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange-ink dark:text-matteo-orange border-b border-matteo-orange/40">concierge@matteoperin.com</a>.
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={conciergeSubmitting}
                                            className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors mt-2 shadow-xl disabled:opacity-50"
                                        >
                                            {conciergeSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                        </button>
                                    </form>
                                    </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
