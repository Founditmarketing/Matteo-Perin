import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { reportInquiryConversion } from '@/lib/gtagConversion';
import { PRODUCTS } from '../constants';
import { useNavigate, Link } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

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

// --- All gallery images ---
const GALLERY_IMAGES = [
    "/assets/croc jacket/matteo_croc_new_1.jpg",
    "/assets/croc jacket/matteo_croc_new_2.jpg",
    "/assets/croc jacket/matteo_croc.jpg",
    "/assets/croc jacket/hero_jacket_1.jpg",
    "/assets/croc jacket/detail_jacket_2.jpg",
    "/assets/croc jacket/detail_jacket_3.jpg",
    "/assets/croc jacket/detail_jacket_4.jpg",
    "/assets/croc jacket/detail_jacket_5.jpg",
    "/assets/croc jacket/detail_jacket_6.jpg",
    "/assets/croc jacket/detail_jacket_7.jpg",
    "/assets/croc jacket/detail_jacket_8.jpg",
    "/assets/croc jacket/detail_jacket_9.jpg",
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
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-matteo-charcoal dark:text-white group-hover:text-matteo-orange transition-colors">
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

    const navigate = useNavigate();
    const { openInquiry } = useInquiry();
    const [selectedImage, setSelectedImage] = useState(0);
    const [viewedImages, setViewedImages] = useState<Set<number>>(new Set([0]));
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [conciergeData, setConciergeData] = useState({ name: '', email: '', phone: '', city: '' });
    const [conciergeSubmitting, setConciergeSubmitting] = useState(false);
    const [conciergeSuccess, setConciergeSuccess] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);
    const editorialRef = useRef<HTMLDivElement>(null);

    const crocJacket = PRODUCTS.find(p => p.id === 14);

    // Helper: fire gtag safely
    const fireEvent = (eventName: string, params: Record<string, any> = {}) => {
        if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', eventName, params);
        }
    };
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

    // Parallax for editorial section
    const { scrollYProgress } = useScroll({
        target: editorialRef,
        offset: ["start end", "end start"]
    });
    const editorialY = useTransform(scrollYProgress, [0, 1], [80, -80]);
    const editorialSpring = useSpring(editorialY, { stiffness: 100, damping: 30 });

    const handleBuyNow = async () => {
        if (!crocJacket) return;
        fireEvent('deposit_initiated', { currency: 'USD', value: 25000, item_name: 'Bespoke Crocodile Jacket Deposit' });
        fireConversion();
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

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Checkout failed:", data.error);
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setIsCheckingOut(false);
        }
    };

    const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mainImageRef.current) return;
        const rect = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    return (
        <div className="bg-white dark:bg-matteo-black min-h-screen text-matteo-charcoal dark:text-white transition-colors duration-700">

            <Helmet>
                <title>Bespoke Crocodile Jacket | Handcrafted in Italy | Matteo Perin</title>
                <meta name="description" content="Commission a 1-of-1 bespoke Porosus crocodile jacket by Matteo Perin — a hand-painted Nile crocodile coat finished with a hand-developed patina over 100+ hours of artisanal hand-stitching in Verona, Italy, using certified CITES-regulated hides. Full commission $185,000; secure your slot with a $25,000 deposit." />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <link rel="canonical" href="https://www.matteoperin.com/bespoke-crocodile-jacket" />

                {/* OpenGraph — Optimized for social sharing + AdWords */}
                <meta property="og:title" content="Bespoke Crocodile Jacket — Commission Yours | Matteo Perin" />
                <meta property="og:description" content="One-of-one bespoke crocodile jacket. Hand-selected Nile or Porosus crocodile, hand-developed patina, 100+ hours of Italian craftsmanship. Secure with $25,000 deposit." />
                <meta property="og:image" content="https://www.matteoperin.com/assets/croc%20jacket/matteo_croc_new_1.jpg" />
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

                {/* Product structured data — limited-availability commission */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: 'Bespoke Crocodile Jacket',
                    image: [
                        'https://www.matteoperin.com/assets/croc-jacket/matteo_croc_new_1.jpg',
                        'https://www.matteoperin.com/assets/croc-jacket/matteo_croc_new_2.jpg',
                        'https://www.matteoperin.com/assets/croc-jacket/matteo_croc.jpg',
                    ],
                    description: 'One-of-one bespoke crocodile jacket. Hand-selected Nile or Porosus crocodile, hand-painted patina, over 100 hours of artisanal labor in Verona, Italy. CITES-certified hides. Limited to 3 commissions per year.',
                    brand: { '@type': 'Brand', name: 'Matteo Perin' },
                    url: 'https://www.matteoperin.com/bespoke-crocodile-jacket',
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'USD',
                        price: 185000,
                        availability: 'https://schema.org/LimitedAvailability',
                        url: 'https://www.matteoperin.com/bespoke-crocodile-jacket',
                        itemCondition: 'https://schema.org/NewCondition',
                    },
                })}</script>

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bespoke Crocodile Jacket — $25,000 Deposit | Matteo Perin" />
                <meta name="twitter:description" content="One-of-one hand-selected crocodile. Handcrafted in Verona, Italy. 100+ hours of artisanal work." />
                <meta name="twitter:image" content="https://www.matteoperin.com/assets/croc%20jacket/matteo_croc_new_1.jpg" />

                {/* Product Structured Data — Google Shopping + AdWords */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": "Bespoke Crocodile Jacket",
                        "image": GALLERY_IMAGES.map(img => `https://www.matteoperin.com${img.replace(/ /g, '%20')}`),
                        "description": "A 1-of-1 bespoke crocodile field jacket. Crafted from hand-selected, certified CITES-regulated Nile (Niloticus) or Porosus crocodile hides, each piece features a hand-developed patina, pure silk lining, and custom cast palladium hardware. Over 100 hours of artisanal hand-stitching in Verona, Italy justify the $185,000 commission price. Offered exclusively by private commission.",
                        "sku": "MP-CROC-JACKET-001",
                        "mpn": "MP-CROC-2026",
                        "gtin14": "",
                        "brand": {
                            "@type": "Brand",
                            "name": "Matteo Perin",
                            "url": "https://www.matteoperin.com"
                        },
                        "manufacturer": {
                            "@type": "Organization",
                            "name": "Matteo Perin Atelier",
                            "url": "https://www.matteoperin.com"
                        },
                        "material": ["Nile Crocodile Leather", "Porosus Crocodile Leather", "Silk Lining", "Palladium Hardware"],
                        "color": "Hand-Developed Patina",
                        "category": "Clothing > Outerwear > Leather Jackets",
                        "audience": {
                            "@type": "PeopleAudience",
                            "suggestedGender": "unisex"
                        },
                        "countryOfOrigin": {
                            "@type": "Country",
                            "name": "Italy"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": "https://www.matteoperin.com/bespoke-crocodile-jacket",
                            "priceCurrency": "USD",
                            "price": "185000",
                            "priceValidUntil": "2027-12-31",
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition",
                            "seller": {
                                "@type": "Organization",
                                "name": "Matteo Perin",
                                "url": "https://www.matteoperin.com"
                            },
                            "shippingDetails": {
                                "@type": "OfferShippingDetails",
                                "shippingRate": {
                                    "@type": "MonetaryAmount",
                                    "value": "0",
                                    "currency": "USD"
                                },
                                "shippingDestination": {
                                    "@type": "DefinedRegion",
                                    "addressCountry": ["US", "GB", "CH", "FR", "IT", "DE", "AE"]
                                },
                                "deliveryTime": {
                                    "@type": "ShippingDeliveryTime",
                                    "handlingTime": {
                                        "@type": "QuantitativeValue",
                                        "minValue": 30,
                                        "maxValue": 90,
                                        "unitCode": "DAY"
                                    }
                                }
                            },
                            "hasMerchantReturnPolicy": {
                                "@type": "MerchantReturnPolicy",
                                "applicableCountry": "US",
                                "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
                                "merchantReturnDays": 0
                            }
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "5",
                            "reviewCount": "3",
                            "bestRating": "5"
                        },
                        "review": [
                            {
                                "@type": "Review",
                                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                                "author": { "@type": "Person", "name": "Private Client, Geneva" },
                                "reviewBody": "The craftsmanship is beyond anything I've experienced. Truly one of one."
                            },
                            {
                                "@type": "Review",
                                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                                "author": { "@type": "Person", "name": "Private Client, Jackson Hole" },
                                "reviewBody": "Matteo's attention to detail on the crocodile jacket exceeded every expectation. A masterwork."
                            },
                            {
                                "@type": "Review",
                                "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
                                "author": { "@type": "Person", "name": "Private Client, Dubai" },
                                "reviewBody": "Nothing else compares. The patina, the hand, the weight — it's architecture you wear."
                            }
                        ]
                    })}
                </script>

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

                {/* FAQ Structured Data — Powers Google Ads FAQ Extensions */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What type of crocodile is used in the Matteo Perin bespoke jacket?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Each jacket is crafted from hand-selected Nile (Niloticus) or Porosus crocodile, sourced from certified, CITES-regulated farms. The skins are chosen for their symmetry, scale pattern, and suppleness before being hand-finished with a proprietary hand-painted patina."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How much does the bespoke crocodile jacket cost?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "The full commission price is $185,000 USD. You can secure your commission slot with a $25,000 deposit, with the remaining balance due before production begins. Complimentary global shipping is included."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How long does it take to make a bespoke crocodile jacket?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Each jacket requires over 100 hours of artisanal work in our Verona, Italy atelier. From consultation to delivery, the process typically takes 30 to 90 days depending on customization requirements."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Where is the Matteo Perin crocodile jacket made?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Every jacket is handcrafted in our atelier in Verona, Italy by master artisans. Matteo Perin also maintains a showroom in Jackson, Wyoming for private consultations and fittings."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I customize my bespoke crocodile jacket?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolutely. Every commission begins with a private consultation where you select the crocodile skin, patina color, lining, hardware finish, and fit. Each jacket is truly one-of-one — no two are alike."
                                }
                            }
                        ]
                    })}
                </script>
            </Helmet>

            {/* ============================================================
                ABOVE THE FOLD: Product Display + Purchase
               ============================================================ */}
            <section className="pt-28 md:pt-36 pb-12 md:pb-24 px-4 md:px-8 lg:px-16 xl:px-24 max-w-[1920px] mx-auto">

                {/* Breadcrumbs */}
                <nav className="mb-8 md:mb-12">
                    <ol className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-stone">
                        <li><Link to="/" className="hover:text-matteo-orange transition-colors">Home</Link></li>
                        <li className="text-matteo-charcoal/20 dark:text-white/20">/</li>
                        <li><Link to="/collection" className="hover:text-matteo-orange transition-colors">Collection</Link></li>
                        <li className="text-matteo-charcoal/20 dark:text-white/20">/</li>
                        <li className="text-matteo-charcoal dark:text-white">Bespoke Crocodile Jacket</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* ---- LEFT: Image Gallery ---- */}
                    <div className="lg:col-span-7 xl:col-span-7">
                        {/* Main Image */}
                        <div
                            ref={mainImageRef}
                            className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-[#F5F3F0] dark:bg-white/5 cursor-crosshair group mb-4"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleZoomMove}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    src={GALLERY_IMAGES[selectedImage]}
                                    alt={`Bespoke Crocodile Jacket by Matteo Perin - Handcrafted Italian Exotic Leather - Image ${selectedImage + 1}`}
                                    className="w-full h-full object-cover object-center"
                                    style={isZoomed ? {
                                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                        transform: 'scale(2)',
                                    } : {}}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {/* Image counter badge */}
                            <div className="absolute bottom-4 right-4 bg-matteo-charcoal/60 text-white px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.15em] backdrop-blur-sm pointer-events-none">
                                {selectedImage + 1} / {GALLERY_IMAGES.length}
                            </div>

                            {/* Prev / Next on main image */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleImageSelect(selectedImage === 0 ? GALLERY_IMAGES.length - 1 : selectedImage - 1); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm text-matteo-charcoal dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleImageSelect(selectedImage === GALLERY_IMAGES.length - 1 ? 0 : selectedImage + 1); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm text-matteo-charcoal dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {GALLERY_IMAGES.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleImageSelect(i)}
                                    className={`shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden transition-all duration-300 ${
                                        selectedImage === i
                                            ? 'ring-2 ring-matteo-orange ring-offset-2 ring-offset-white dark:ring-offset-matteo-black opacity-100'
                                            : 'opacity-50 hover:opacity-80'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Bespoke Crocodile Jacket Detail - Italian Craftsmanship View ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ---- RIGHT: Product Info + Buy ---- */}
                    <motion.div
                        className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-36 lg:self-start"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Category Tag */}
                        <motion.div variants={fadeUpVariant} className="mb-4">
                            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-orange">
                                Exotic Outerwear — Made to Order
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1 variants={fadeUpVariant} className="font-serif text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light leading-[1.05] mb-6 tracking-tight">
                            Bespoke Crocodile<br />Jacket
                        </motion.h1>

                        {/* Price */}
                        <motion.div variants={fadeUpVariant} className="mb-8">
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-3xl md:text-4xl text-matteo-charcoal dark:text-white">$185,000</span>
                                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-stone">USD — Full Commission</span>
                            </div>
                            <div className="mt-4 p-4 bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20 rounded-sm">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-serif text-2xl text-matteo-orange">$25,000</span>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-matteo-orange/70">Deposit to Reserve</span>
                                </div>
                                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-matteo-charcoal/60 dark:text-white/50 leading-relaxed">
                                    Secure your commission slot today with a $25,000 deposit. Remaining balance due before production begins.
                                </p>
                            </div>
                            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-matteo-stone mt-3">
                                Complimentary global shipping &middot; Tax computed at checkout
                            </p>
                        </motion.div>

                        {/* Short Description */}
                        <motion.p variants={fadeUpVariant} className="font-serif text-base md:text-lg text-matteo-charcoal/70 dark:text-white/60 leading-relaxed mb-8 max-w-lg">
                            A 1-of-1 commission in certified, CITES-regulated Nile (Niloticus) or Porosus crocodile. Each piece is finished with a hand-painted patina and shaped over 100+ hours of artisanal hand-stitching in our Verona, Italy atelier. The $185,000 price reflects the rarity of the hides, the labor, and the truly singular nature of custom exotic outerwear — no two are alike.
                        </motion.p>

                        {/* Availability Indicator */}
                        <motion.div variants={fadeUpVariant} className="flex items-center gap-3 mb-10">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                Accepting Commissions — 4 slots remaining
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

                            {/* Secondary: Request Commission */}
                            <button
                                onClick={() => {
                                    fireEvent('generate_lead', { lead_type: 'bespoke_request', page: 'croc_jacket' });
                                    fireConversion();
                                    crocJacket && openInquiry(crocJacket);
                                }}
                                className={`w-full py-4 border font-sans text-xs uppercase tracking-[0.2em] transition-all duration-500 border-matteo-charcoal/30 dark:border-white/30 text-matteo-charcoal dark:text-white hover:border-matteo-orange hover:text-matteo-orange`}
                            >
                                SERIOUS INQUIRIES ONLY
                            </button>

                            {/* Deposit Info */}
                            <div className="flex items-start gap-3 py-3">
                                <svg className="w-4 h-4 text-matteo-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-matteo-stone leading-relaxed">
                                    Your $25,000 deposit secures your commission slot. The remaining balance of $160,000 is invoiced before production begins. A senior advisor will contact you within 24 hours.
                                </p>
                            </div>

                            {/* Tertiary: Private Inquiry */}
                            <button
                                onClick={() => {
                                    fireEvent('generate_lead', { lead_type: 'private_viewing', page: 'croc_jacket' });
                                    fireConversion();
                                    setIsConciergeOpen(true);
                                }}
                                className="w-full py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-stone hover:text-matteo-orange transition-colors underline underline-offset-4 decoration-matteo-stone/30 hover:decoration-matteo-orange"
                            >
                                Schedule a Private Viewing
                            </button>
                        </motion.div>

                        {/* Trust Signals */}
                        <motion.div variants={fadeUpVariant} className="grid grid-cols-3 gap-4 py-6 border-t border-b border-matteo-charcoal/10 dark:border-white/10 mb-8">
                            <div className="text-center">
                                <div className="font-serif text-lg text-matteo-charcoal dark:text-white mb-1">100+</div>
                                <div className="font-sans text-[8px] uppercase tracking-[0.15em] text-matteo-stone">Hours Crafted</div>
                            </div>
                            <div className="text-center border-x border-matteo-charcoal/10 dark:border-white/10">
                                <div className="font-serif text-lg text-matteo-charcoal dark:text-white mb-1">1 of 1</div>
                                <div className="font-sans text-[8px] uppercase tracking-[0.15em] text-matteo-stone">Unique Piece</div>
                            </div>
                            <div className="text-center">
                                <div className="font-serif text-lg text-matteo-charcoal dark:text-white mb-1">Italy</div>
                                <div className="font-sans text-[8px] uppercase tracking-[0.15em] text-matteo-stone">Handcrafted</div>
                            </div>
                        </motion.div>

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
                                    <p className="font-serif text-sm text-white/50 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Client Testimonial */}
            <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white dark:bg-matteo-black border-t border-matteo-charcoal/5 dark:border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <svg className="w-8 h-8 text-matteo-orange mx-auto mb-8 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <blockquote className="font-serif text-2xl md:text-3xl text-matteo-charcoal dark:text-white leading-relaxed mb-8 italic">
                            "The craftsmanship is beyond anything I've experienced in luxury fashion. This jacket doesn't just fit — it was built for me. There is nothing else like it in the world."
                        </blockquote>
                        <div className="w-8 h-[1px] bg-matteo-orange mx-auto mb-4"></div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-stone">
                            Private Client — Geneva, Switzerland
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA Band */}
            <section className="py-16 md:py-24 px-6 text-center bg-[#F9F7F2] dark:bg-[#111] border-t border-matteo-charcoal/5 dark:border-white/5">
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
                    <motion.p variants={fadeUpVariant} className="font-serif text-matteo-charcoal/60 dark:text-white/50 text-base mb-10 leading-relaxed">
                        Secure one of three annual commission slots with a $25,000 deposit. Pay the remaining balance before production begins. A Matteo Perin senior advisor will contact you within 24 hours.
                    </motion.p>
                    <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleBuyNow}
                            className="px-12 py-5 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-all duration-500 shadow-lg"
                        >
                            Secure with $25,000 Deposit
                        </button>
                            {/* Final CTA band - Private Inquiry */}
                            <button
                                onClick={() => {
                                    fireEvent('generate_lead', { lead_type: 'private_inquiry', page: 'croc_jacket' });
                                    fireConversion();
                                    setIsConciergeOpen(true);
                                }}
                                className="px-12 py-5 border border-matteo-charcoal/30 dark:border-white/30 text-matteo-charcoal dark:text-white font-sans text-xs uppercase tracking-[0.2em] hover:border-matteo-orange hover:text-matteo-orange transition-all duration-500"
                            >
                                Private Inquiry
                            </button>
                    </motion.div>
                </motion.div>
            </section>


            {/* ============================================================
                MOBILE STICKY BUY BAR
               ============================================================ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-matteo-black border-t border-matteo-charcoal/10 dark:border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex-shrink-0">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-lg text-matteo-orange">$25,000</span>
                        <span className="font-sans text-[7px] uppercase tracking-[0.1em] text-matteo-stone">Deposit</span>
                    </div>
                    <div className="font-sans text-[7px] uppercase tracking-[0.1em] text-matteo-stone">Full price: $185,000</div>
                </div>
                <button
                    onClick={handleBuyNow}
                    className="flex-1 max-w-[220px] py-3.5 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black font-sans text-[10px] uppercase tracking-[0.15em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-all duration-300"
                >
                    Secure Deposit
                </button>
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
                                <img src="/assets/croc jacket/matteo_croc.jpg" className="absolute inset-0 w-full h-full object-cover object-top" alt="Matteo Perin in Bespoke Crocodile Jacket" />
                            </div>
                            {/* Right: Form */}
                            <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-y-auto">
                                <button
                                    onClick={() => setIsConciergeOpen(false)}
                                    className="absolute top-6 right-6 md:top-12 md:right-12 font-sans text-[10px] uppercase tracking-widest hover:text-matteo-orange transition-colors z-20 text-matteo-charcoal dark:text-white"
                                >
                                    Close [X]
                                </button>

                                <div className="mt-6 md:mt-0">
                                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-4 block">Private Inquiry</span>
                                    <h3 className="font-serif text-3xl mb-6 leading-tight text-matteo-charcoal dark:text-white">Schedule a Viewing</h3>

                                    {conciergeSuccess ? (
                                        <div className="py-8 text-center">
                                            <div className="w-12 h-12 rounded-full border border-matteo-orange flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-5 h-5 text-matteo-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <p className="font-serif text-matteo-charcoal dark:text-white text-xl mb-2">Inquiry Received</p>
                                            <p className="font-serif text-matteo-charcoal/60 dark:text-white/50 text-sm mb-8">A senior advisor will contact you within 24 hours.</p>
                                            <button onClick={() => { setIsConciergeOpen(false); setConciergeSuccess(false); }} className="font-sans text-[10px] uppercase tracking-widest text-matteo-orange border-b border-matteo-orange pb-1">Close</button>
                                        </div>
                                    ) : (
                                    <>
                                    <p className="font-serif text-sm text-matteo-charcoal/60 dark:text-white/50 mb-10">
                                        A senior client advisor will contact you within 24 hours to arrange a private consultation and measurement session in your city.
                                    </p>

                                    <form className="space-y-10" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setConciergeSubmitting(true);
                                        try {
                                            await fetch('/api/private-client', {
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
                                            }).catch(() => {});
                                        } catch (_) {}
                                        // Fire GA4 + Ads conversion
                                        fireEvent('generate_lead', { lead_type: 'private_viewing', page: 'croc_jacket' });
                                        fireConversion();
                                        setConciergeSubmitting(false);
                                        setConciergeSuccess(true);
                                    }}>
                                        <input type="text" placeholder="Full Name" value={conciergeData.name} onChange={e => setConciergeData(d => ({...d, name: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
                                        <input type="email" placeholder="Email Address" value={conciergeData.email} onChange={e => setConciergeData(d => ({...d, email: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
                                        <input type="tel" placeholder="Phone Number" value={conciergeData.phone} onChange={e => setConciergeData(d => ({...d, phone: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" />
                                        <input type="text" placeholder="City / Location" value={conciergeData.city} onChange={e => setConciergeData(d => ({...d, city: e.target.value}))} className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif text-matteo-charcoal dark:text-white placeholder-matteo-charcoal/40 dark:placeholder-white/30 outline-none focus:border-matteo-orange transition-colors" required />
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
