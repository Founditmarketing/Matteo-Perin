
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { ResponsiveImage } from './ResponsiveImage';
import { ProductService } from '@/services/productService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { TextReveal } from './TextReveal';
import { Magnetic } from './Magnetic';
import { Product } from '../types';
import { useInquiry } from '../context/InquiryContext';
import { useModalA11y } from '../lib/useModalA11y';

// Internal Tilt Card Component for 3D Effect (Desktop only)
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }> = ({ children, className = "", onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile || !cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        setRotation({ x: yPct * -5, y: xPct * 5 });
    };

    const handleMouseEnter = () => { if (!isMobile) setIsHovering(true); };
    const handleMouseLeave = () => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`${className}`}
            style={{
                transform: isHovering && !isMobile
                    ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
                    : 'translateZ(0)',
                transition: 'transform 0.15s ease-out',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
};

// The plate cadence — the strip reads as paced editorial plates, not a
// uniform row: a feature plate, a tight diptych (one dropped, one raised),
// a landscape spread, then a trailing offset pair. Mobile keeps the flat
// 85vw swipe rhythm. Desktop widths sum to ~165vw against the old uniform
// 6 × 30vw = 180vw, so the scroll-jack travel gets slightly SHORTER — the
// deliberately compressed travel must not re-bloat.
const PLATE_CADENCE = [
    { size: 'md:w-[31vw] md:max-w-[560px]', frame: 'aspect-[2/3]', drift: '' },
    { size: 'md:w-[19vw] md:max-w-[340px]', frame: 'aspect-[2/3]', drift: 'md:translate-y-8' },
    { size: 'md:w-[19vw] md:max-w-[340px] md:-ml-4', frame: 'aspect-[2/3]', drift: 'md:-translate-y-8' },
    { size: 'md:w-[44vw] md:max-w-[760px]', frame: 'aspect-[2/3] md:aspect-[4/3]', drift: '' },
    { size: 'md:w-[24vw] md:max-w-[420px]', frame: 'aspect-[2/3]', drift: 'md:translate-y-6' },
    { size: 'md:w-[27vw] md:max-w-[480px]', frame: 'aspect-[2/3]', drift: '' },
];

// Lazy parallax: each plate's photograph trails the horizontal track at
// roughly 0.9x of the scroll. The image's local offset is a function of the
// plate's distance from the viewport centre, driven by the same scroll
// progress that translates the track, and clamped to a sliver of the plate
// width so the oversized crop always covers the frame. Scroll-linked
// useTransform values bypass MotionConfig reducedMotion, so gate manually.
const ParallaxImage: React.FC<{
    product: Product;
    index: number;
    progress: MotionValue<number>;
    platesRef: React.MutableRefObject<{ centers: number[]; widths: number[]; maxTranslate: number }>;
}> = ({ product, index, progress, platesRef }) => {
    const prefersReducedMotion = useReducedMotion();

    const x = useTransform(progress, (p) => {
        if (prefersReducedMotion || typeof window === 'undefined' || window.innerWidth < 768) return 0;
        const { centers, widths, maxTranslate } = platesRef.current;
        const center = centers[index];
        const width = widths[index];
        if (!center || !width) return 0;
        // Signed distance of the plate from the viewport centre, in pixels
        const deviation = center - p * maxTranslate - window.innerWidth / 2;
        // Trail the track by ~10% of its velocity; clamp at 6% of plate width
        // (the bleed below is 7%, so the frame edge is never exposed).
        const cap = width * 0.06;
        return Math.max(-cap, Math.min(cap, deviation * -0.08));
    });

    return (
        <motion.div
            style={{ x }}
            className={
                prefersReducedMotion
                    ? 'w-full h-full'
                    : 'w-full h-full md:absolute md:w-auto md:h-auto md:-inset-x-[7%] md:inset-y-0'
            }
        >
            <ResponsiveImage
                baseSrc={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.19,1,0.22,1)] scale-100 dark:brightness-90"
                style={{ objectPosition: 'center center' }}
            />
        </motion.div>
    );
};

export const Collection: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { openInquiry } = useInquiry();
    const navigate = useNavigate();
    const location = useLocation();
    // Magnetic's pull is pointer-tracking state, not an animation —
    // MotionConfig reducedMotion="user" only removes the spring, so the
    // wrapper must be skipped entirely for reduced-motion users.
    const prefersReducedMotion = useReducedMotion();

    // Scroll Logic Refs
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    // Mirror of scrollProgress as a MotionValue so the per-plate lazy
    // parallax can be derived with useTransform.
    const progressMV = useMotionValue(0);
    // Untransformed geometry of each look plate, measured alongside the
    // track dimensions and consumed by ParallaxImage.
    const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
    const platesRef = useRef<{ centers: number[]; widths: number[]; maxTranslate: number }>({ centers: [], widths: [], maxTranslate: 0 });
    // Touch screens don't hover: plate captions print statically there and
    // only fade in for hover-capable pointers.
    const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const [maxTranslate, setMaxTranslate] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState('400vh');
    const [isFinished, setIsFinished] = useState(false);

    // Fetch Products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                // The croc jacket has its own full-bleed feature directly above
                // this slider on the homepage — showing it here too is a rerun.
                // A short promenade, not a museum wing: six looks at most — the
                // full range lives in the lookbooks.
                setProducts(data.filter(p => p.id !== 14).slice(0, 6));
                // Artificial easing for smoothness
                setTimeout(() => setLoading(false), 200);
            } catch (error) {
                console.error("Failed to load collection:", error);
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Layout Fix: Force mobile overflow container to start at left=0 exactly when viewed
    // Some mobile browsers forcefully snap to the center of a flex-container when it enters the viewport.
    useEffect(() => {
        if (loading || products.length === 0 || !trackRef.current || window.innerWidth >= 768) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (trackRef.current) {
                        trackRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
                    }
                    // Optional: Unobserve after successful reset
                    if (sectionRef.current) {
                        observer.unobserve(sectionRef.current);
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [loading, products]);

    // Quick View Handlers
    const handleQuickView = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTimeout(() => setSelectedProduct(null), 500); // Wait for animation to finish
    };

    // Dialog semantics for the quick-view drawer: Escape closes, focus is
    // trapped inside, and focus returns to the trigger on close.
    const modalRef = useRef<HTMLDivElement>(null);
    useModalA11y(isModalVisible, handleCloseModal, modalRef);

    const handleAddToBag = () => {
        if (selectedProduct) {
            openInquiry(selectedProduct);
            handleCloseModal();
        }
    };

    const handleStartInquiry = (e: React.MouseEvent) => {
        e.preventDefault();

        const scrollToContact = () => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                if (window.lenis) {
                    window.lenis.scrollTo(contactSection);
                } else {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        // If we are already on the homepage (or strict / path)
        if (location.pathname === '/') {
            scrollToContact();
        } else {
            // Navigate to home first, then scroll
            navigate('/');
            setTimeout(scrollToContact, 500);
        }
    };

    // Calculate dynamic width of the track and required section height
    useEffect(() => {
        if (loading) return;

        const calculateDimensions = () => {
            if (trackRef.current && window.innerWidth >= 768) {
                const trackWidth = trackRef.current.scrollWidth;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const maxTrans = Math.max(0, trackWidth - viewportWidth + 50);
                setMaxTranslate(maxTrans);

                // Record each plate's untransformed centre/width for the
                // lazy parallax (offsetLeft ignores the track's translate).
                platesRef.current = {
                    centers: plateRefs.current.map(el => el ? el.offsetLeft + el.offsetWidth / 2 : 0),
                    widths: plateRefs.current.map(el => el ? el.offsetWidth : 0),
                    maxTranslate: maxTrans,
                };

                // 0.55 scroll-to-track ratio: the gallery still travels its full
                // width, but the vertical scroll it taxes is roughly halved.
                const calculatedHeight = Math.round(maxTrans * 0.55) + viewportHeight;
                setDynamicHeight(`${calculatedHeight}px`);
            } else {
                setDynamicHeight('auto');
            }
        };

        calculateDimensions();
        setTimeout(calculateDimensions, 100);

        const resizeObserver = new ResizeObserver(() => {
            calculateDimensions();
        });

        if (trackRef.current) {
            resizeObserver.observe(trackRef.current);
        }

        window.addEventListener('resize', calculateDimensions);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            resizeObserver.disconnect();
        };
    }, [loading, products]);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current || !trackRef.current) return;
            if (window.innerWidth < 768) return;

            const section = sectionRef.current;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            if (scrollY >= start && scrollY <= end) {
                const progress = (scrollY - start) / (end - start);
                setScrollProgress(progress);
                progressMV.set(progress);
                setIsFinished(progress > 0.95);
            } else if (scrollY < start) {
                setScrollProgress(0);
                progressMV.set(0);
                setIsFinished(false);
            } else if (scrollY > end) {
                setScrollProgress(1);
                progressMV.set(1);
                setIsFinished(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading]);

    const translateX = -(scrollProgress * maxTranslate);

    return (
        <section
            id="collection"
            ref={sectionRef}
            className="relative bg-matteo-cream dark:bg-matteo-black transition-colors duration-700 min-h-screen"
            style={{ height: dynamicHeight }}
        >
            {/* Loading State - Silent Luxury Fade */}
            <div className={`absolute inset-0 z-50 bg-matteo-cream dark:bg-matteo-black flex items-center justify-center transition-opacity duration-1000 pointer-events-none ${loading ? 'opacity-100' : 'opacity-0'}`}>
            </div>

            {/* md:pt-32 reserves real space for the heading — it used to float
                over the track, and raised plates (-translate-y-8) rode up into
                the headline mid-scroll. */}
            <div className={`relative h-auto md:sticky md:top-0 md:h-screen md:overflow-hidden flex flex-col justify-center md:pt-32 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>

                <div className="md:absolute md:top-8 md:left-0 w-full px-6 md:px-12 z-10 pt-12 md:pt-0 mb-8 md:mb-0">
                    <TextReveal className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream font-light mt-4">
                        The Collection
                    </TextReveal>
                </div>

                <div
                    ref={trackRef}
                    className={`
                flex items-center gap-6 md:gap-10 px-6 md:px-12
                w-full md:w-max
                overflow-x-auto md:overflow-visible
                snap-x snap-mandatory md:snap-none
                py-12 md:py-0
            `}
                    style={{
                        transform: window.innerWidth >= 768 ? `translate3d(${translateX}px, 0, 0)` : 'translateZ(0)',
                        willChange: 'transform',
                        WebkitTransform: window.innerWidth >= 768 ? `translate3d(${translateX}px, 0, 0)` : 'translateZ(0)',
                    }}
                >

                    <div className="hidden md:flex flex-col justify-center w-[20vw] max-w-xs shrink-0 pr-8 border-r border-matteo-charcoal/10 dark:border-white/10 h-[400px]">
                        <span className="block mt-8 font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
                            Spring 2025
                        </span>
                    </div>

                    {products.map((product, index) => {
                        const plate = PLATE_CADENCE[index % PLATE_CADENCE.length];
                        return (
                        <div
                            key={product.id}
                            ref={(el) => { plateRefs.current[index] = el; }}
                            className={`relative shrink-0 w-[85vw] max-w-[520px] ${plate.size} ${plate.drift} snap-center group`}
                        >
                            <TiltCard
                                onClick={(e) => handleQuickView(e, product)}
                                className={`block relative ${plate.frame} overflow-hidden bg-matteo-sand dark:bg-[#1a1a1a] shadow-sm group-hover:shadow-2xl transition-all duration-500`}
                            >
                                <div data-cursor="view" data-cursor-text="Quick View" className="relative w-full h-full">
                                    <ParallaxImage
                                        product={product}
                                        index={index}
                                        progress={progressMV}
                                        platesRef={platesRef}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors duration-500"></div>
                                    {/* Caption slip — an italic aside naming only what the
                                        ledger already records. Fades in on hover for fine
                                        pointers; printed statically for touch buyers. */}
                                    <div className={`absolute left-0 bottom-0 max-w-[85%] bg-matteo-cream/95 dark:bg-matteo-black/85 px-4 py-2.5 pointer-events-none transition-opacity duration-700 ${canHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                        <p className="font-serif italic text-[13px] leading-snug text-matteo-charcoal/80 dark:text-matteo-cream/80">
                                            {product.title} — Request this look
                                        </p>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Ledger plate — number and name only; the catalog record
                                is being re-verified, so no figures are quoted here. */}
                            <div className="mt-5">
                                <span className="block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-1.5">
                                    {`№ ${String(index + 1).padStart(2, '0')}`}
                                </span>
                                <h3 className="font-serif text-xl md:text-2xl text-matteo-charcoal dark:text-white leading-tight mb-1">
                                    {product.title}
                                </h3>
                                <button
                                    onClick={() => openInquiry(product)}
                                    className="group/req relative py-3 min-h-[44px] font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-charcoal/70 dark:text-white/60 hover:text-matteo-charcoal dark:hover:text-white transition-colors duration-500"
                                >
                                    Request this look
                                    <span className="absolute bottom-2 left-0 w-8 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/req:w-full"></span>
                                </button>
                            </div>
                        </div>
                        );
                    })}

                    <div className="shrink-0 w-[85vw] md:w-[40vw] max-w-[600px] flex items-center justify-center h-[400px] md:h-[500px] snap-center">
                        <div className="w-full h-full border border-matteo-charcoal/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8 md:p-16 flex flex-col justify-center items-start group hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-matteo-black transition-all duration-700">
                            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink group-hover:text-matteo-orange dark:text-matteo-orange mb-6">
                                Bespoke Services
                            </span>
                            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8">
                                The Commission</h3>
                            <p className="font-serif text-lg opacity-70 mb-12 max-w-sm">
                                Architecting the personal wardrobe. From specific fabric selection to final fitting, the process is absolute.
                            </p>

                            <div className="flex items-center gap-8 w-full mt-auto">
                                <Link to="/bespoke" className="font-sans text-xs uppercase tracking-[0.2em] border-b border-current pb-1 hover:text-matteo-orange transition-colors">
                                    Process
                                </Link>
                                {/* The 44px hit area lives on the button; the hairline
                                    underline stays tucked under the label on an inner span. */}
                                {prefersReducedMotion ? (
                                    <button
                                        onClick={handleStartInquiry}
                                        className="inline-flex items-center min-h-[44px] font-sans text-xs uppercase tracking-[0.2em] hover:text-matteo-orange transition-colors text-left"
                                    >
                                        <span className="border-b border-current pb-1">Enquire</span>
                                    </button>
                                ) : (
                                    <Magnetic strength={0.2}>
                                        <button
                                            onClick={handleStartInquiry}
                                            className="inline-flex items-center min-h-[44px] font-sans text-xs uppercase tracking-[0.2em] hover:text-matteo-orange transition-colors text-left"
                                        >
                                            <span className="border-b border-current pb-1">Enquire</span>
                                        </button>
                                    </Magnetic>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-[10vw] shrink-0"></div>

                </div>

                <div className="hidden md:block absolute bottom-12 left-12 right-12 h-[1px] bg-matteo-charcoal/10 dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-full bg-matteo-charcoal dark:bg-white transition-transform duration-100 ease-linear origin-left"
                        style={{ transform: `scaleX(${scrollProgress})` }}
                    ></div>
                </div>

                <div
                    className={`hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-700 ${isFinished ? 'opacity-100' : 'opacity-0'}`}
                >
                    <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60">Continue</span>
                    <div className="w-[1px] h-8 bg-matteo-stone animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                </div>

            </div>

            {selectedProduct && (
                <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-500 ${isModalVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                    <div
                        className="absolute inset-0 bg-black/20  transition-opacity duration-500"
                        onClick={handleCloseModal}
                    ></div>

                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${selectedProduct.title} — quick view`}
                        tabIndex={-1}
                        className={`
                    relative w-full md:w-[60vw] lg:w-[45vw] h-full bg-matteo-cream dark:bg-[#111] shadow-2xl overflow-y-auto
                    transform transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
                    ${isModalVisible ? 'translate-x-0' : 'translate-x-full'}
                  `}
                    >
                        <button
                            onClick={handleCloseModal}
                            aria-label="Close quick view"
                            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center border border-matteo-charcoal/10 dark:border-white/10 rounded-full hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-matteo-black dark:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="flex flex-col h-full">
                            <div className="w-full h-[50vh] md:h-[55vh] relative overflow-hidden bg-[#F0F0F0] dark:bg-[#0a0a0a]">
                                <ResponsiveImage
                                    baseSrc={selectedProduct.image}
                                    alt={selectedProduct.title}
                                    className="w-full h-full object-cover dark:brightness-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50"></div>
                            </div>

                            <div className="p-8 md:p-12 flex-1 flex flex-col">
                                <div className="mb-8">
                                    <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-3 block">
                                        {selectedProduct.category}
                                    </span>
                                    <h2 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white mb-4 font-light leading-none">
                                        {selectedProduct.title}
                                    </h2>
                                </div>

                                <p className="font-serif text-matteo-charcoal/80 dark:text-white/70 leading-relaxed text-lg mb-8 max-w-lg">
                                    {selectedProduct.description || "A bespoke piece, crafted with Italian excellence. Every detail is considered, every stitch intentional."}
                                </p>

                                <div className="mt-auto pt-8 border-t border-matteo-charcoal/10 dark:border-white/10">
                                    <button 
                                        onClick={handleAddToBag}
                                        className="bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-8 py-3 font-sans text-[10px] uppercase tracking-widest hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors flex items-center justify-center min-w-[200px]"
                                    >
                                        Request Bespoke Look
                                    </button>
                                    <Link
                                        to={`/collection/${selectedProduct.id}`}
                                        className="block mt-6 text-center font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60 hover:text-matteo-charcoal dark:hover:text-white transition-colors py-2 min-h-[44px]"
                                    >
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};
