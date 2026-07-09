import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { createPortal } from 'react-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// Single engine behind /lookbook/men and /lookbook/women — the two pages were
// ~94% identical files; everything that differed now arrives via config.
export interface LookbookConfig {
    /** "m" | "w" — keeps look ids stable with the previous per-page files. */
    idPrefix: string;
    images: string[];
    label: string;            // "Men's Lookbook"
    subline: string;          // "Luxury Men's Clothing · Jackson Hole, Wyoming"
    quote: string;            // typography-break pull quote
    /** Free-text context handed to the concierge desk — "Men Lookbook";
     *  each look appends its own number: "Men Lookbook — Look 04". */
    enquiryContext: string;
    helmet: {
        title: string;
        description: string;
        canonical: string;
        ogTitle: string;
        ogDescription: string;
    };
}

interface LookItem {
    id: string;
    image: string;
    title: string;
}

const LookbookItem: React.FC<{
    look: LookItem;
    index: number;
    smoothProgress: any;
    viewMode: 'editorial' | 'index';
    quote: string;
    enquiryContext: string;
    /** Scroll-linked parallax is desktop-only and skipped for reduced motion —
     *  useScroll/useTransform are not covered by MotionConfig reducedMotion. */
    parallaxEnabled: boolean;
    setSelectedLook: (look: LookItem) => void;
}> = ({ look, index, smoothProgress, viewMode, quote, enquiryContext, parallaxEnabled, setSelectedLook }) => {
    // High-Fashion Spread Layout Engine
    const isFeature = index % 5 === 0;
    const isRightAligned = index % 5 === 1 || index % 5 === 3;
    const isLeftAligned = index % 5 === 2;
    const isTypographyBreak = index % 5 === 4;

    // Responsive col spans based on editorial rules
    let colSpan = "col-span-12 md:col-span-8 lg:col-span-5";
    let alignmentClass = "";
    let verticalOffset = "";

    // Kinetic Parallax Values - Hooks called firmly at the top-level of this component
    const featureY = useTransform(smoothProgress, [0, 1], [0, 100]);
    const rightY = useTransform(smoothProgress, [0, 1], [0, -150]);
    const leftY = useTransform(smoothProgress, [0, 1], [0, -50]);

    let parallaxStyle: any = {};

    if (viewMode === 'index') {
        colSpan = "col-span-6 md:col-span-4 lg:col-span-3";
        alignmentClass = "";
        verticalOffset = "";
        parallaxStyle = {};
    } else {
        if (isFeature) {
            colSpan = "col-span-12 md:col-span-10 lg:col-span-8";
            alignmentClass = "md:col-start-2 lg:col-start-3 content-center";
            verticalOffset = "md:mt-16";
            if (parallaxEnabled) parallaxStyle = { y: featureY };
        } else if (isRightAligned) {
            colSpan = "col-span-12 md:col-span-6 lg:col-span-4";
            alignmentClass = "md:col-start-7 lg:col-start-8";
            verticalOffset = "md:-mt-32";
            if (parallaxEnabled) parallaxStyle = { y: rightY };
        } else if (isLeftAligned) {
            colSpan = "col-span-12 md:col-span-7 lg:col-span-5";
            alignmentClass = "md:col-start-1 lg:col-start-2";
            verticalOffset = "md:mt-32";
            if (parallaxEnabled) parallaxStyle = { y: leftY };
        } else if (isTypographyBreak) {
            colSpan = "col-span-12 md:col-span-6 lg:col-span-4";
            alignmentClass = "md:col-start-3 lg:col-start-4";
        }
    }

    return (
        <motion.div
            layout
            style={parallaxStyle}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative cursor-pointer lookbook-cursor-target ${colSpan} ${alignmentClass} ${verticalOffset}`}
            onClick={() => setSelectedLook(look)}
        >
            {isTypographyBreak && index > 0 && viewMode === 'editorial' && (
                /* Below lg the quote sits in flow as a typographic break above the
                   garment; at lg it returns to the floated editorial composition. */
                <div className="mb-16 lg:absolute lg:-left-[40%] lg:top-1/4 max-w-sm pointer-events-none z-10">
                    <h3 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white leading-[1.1] italic">
                        "{quote}"
                    </h3>
                    <div className="w-12 h-[1px] bg-matteo-orange mt-8" />
                </div>
            )}

            <div className={`overflow-hidden bg-matteo-charcoal/5 dark:bg-white/5 relative ${isFeature && viewMode === 'editorial' ? 'aspect-[2/3] shadow-lg' : 'aspect-[2/3] shadow-2xl'}`}>
                <ResponsiveImage
                    baseSrc={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover transition-transform duration-[2.5s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.03]"
                    loading="lazy"
                    style={{ objectPosition: 'center center' }}
                />

                {/* Subtle hover tint */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-matteo-charcoal/30 dark:group-hover:bg-matteo-charcoal/60 transition-colors duration-1000 mix-blend-multiply"></div>

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                    <div className="font-serif italic text-white text-lg tracking-widest uppercase bg-matteo-charcoal/40  px-8 py-4 opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-700 delay-100 border border-white/20">
                        Examine
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-stone-ink dark:text-white/60 mb-2">Commission</span>
                    <span className="font-serif text-matteo-charcoal dark:text-white text-2xl md:text-3xl">{look.title}</span>
                    {/* Quiet per-look route to the concierge desk. The card itself
                        opens the lightbox, so the link stops propagation; the 44px
                        hit area lives on the anchor while the hairline underline
                        stays tucked under the label on an inner span. */}
                    <Link
                        to={`/enquire?ref=${encodeURIComponent(`${enquiryContext} — ${look.title}`)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="group/req relative z-10 self-start inline-flex items-center min-h-[44px] font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-orange-ink dark:text-matteo-orange"
                    >
                        <span className="border-b border-matteo-orange/40 pb-1 group-hover/req:border-matteo-orange transition-colors duration-500">Request This Look</span>
                    </Link>
                </div>
                <div className="w-8 h-[1px] bg-matteo-charcoal/30 dark:bg-white/30 group-hover:w-16 group-hover:bg-matteo-orange transition-all duration-500"></div>
            </div>
        </motion.div>
    );
};

export const LookbookPage: React.FC<{ config: LookbookConfig }> = ({ config }) => {
    const [selectedLook, setSelectedLook] = useState<LookItem | null>(null);
    const [looks, setLooks] = useState<LookItem[]>([]);
    // Editorial is the house's voice — the flat index grid is the utility view.
    // Phones open on the index grid instead: thirty full-bleed spreads make a
    // very long scroll, so small screens (same 768px line as the parallax gate)
    // start scannable and can opt back into the editorial sequence.
    const [viewMode, setViewMode] = useState<'editorial' | 'index'>(
        () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'index' : 'editorial')
    );
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const lightboxRef = useRef<HTMLDivElement>(null);

    // Kinetic Parallax Configuration
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Smooth out the scroll values for high-fidelity feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Scroll-linked transforms bypass MotionConfig reducedMotion, so gate them
    // by hand: desktop only (same 768px line as ParallaxImage) and never when
    // the visitor asks for reduced motion. On phones the offsets slid garments
    // over their own captions.
    const prefersReducedMotion = useReducedMotion();
    const [isDesktop, setIsDesktop] = useState<boolean>(
        () => typeof window !== 'undefined' && window.innerWidth >= 768
    );
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);
    const parallaxEnabled = isDesktop && !prefersReducedMotion;

    useEffect(() => {
        const generatedLooks: LookItem[] = config.images.map((imgUrl, i) => ({
            id: `${config.idPrefix}-${i + 1}`,
            image: imgUrl,
            title: `Look ${i + 1 < 10 ? '0' + (i + 1) : i + 1}`
        }));

        setLooks(generatedLooks);
    }, [config]);

    // Lightbox Navigation
    const step = (direction: 1 | -1) => {
        setSelectedLook(current => {
            if (!current) return current;
            const currentIndex = looks.findIndex(l => l.id === current.id);
            if (currentIndex === -1) return current;
            return looks[(currentIndex + direction + looks.length) % looks.length];
        });
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        step(1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        step(-1);
    };

    // Keyboard support — the close button advertises [ESC], so honor it,
    // plus arrow keys for browsing. Focus moves into the dialog on open and
    // back to the page when it closes.
    useEffect(() => {
        if (!selectedLook) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        lightboxRef.current?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedLook(null);
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Boolean(selectedLook), looks]);

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen relative transition-colors duration-700">

            <Helmet>
                <title>{config.helmet.title}</title>
                <meta name="description" content={config.helmet.description} />
                <link rel="canonical" href={config.helmet.canonical} />
                <meta property="og:title" content={config.helmet.ogTitle} />
                <meta property="og:description" content={config.helmet.ogDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={config.helmet.canonical} />
            </Helmet>

            {/* --- Header Section: eyebrow -> display -> hairline, per the system --- */}
            <div className="pt-48 pb-24 px-6 md:px-12 text-center relative z-10">
                <RevealOnScroll>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange-ink dark:text-matteo-orange mb-6 block">
                        The Archives
                    </span>

                    <div className="flex justify-center flex-col items-center relative gap-6 mb-6">
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-matteo-charcoal dark:text-white leading-[1.02]">
                            {config.label}
                        </h1>
                        <div className="w-12 h-[1px] bg-matteo-charcoal/30 dark:bg-white/30" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-stone-ink dark:text-white/60">
                            {config.subline}
                        </span>
                    </div>

                    {/* View Toggle */}
                    <div className="flex justify-center items-center gap-6 mt-12 mb-4">
                        <button 
                            onClick={() => setViewMode('editorial')}
                            className={`font-sans text-xs uppercase tracking-[0.2em] py-3 border-b ${viewMode === 'editorial' ? 'text-matteo-charcoal dark:text-white border-current' : 'text-matteo-stone-ink dark:text-white/60 border-transparent hover:text-matteo-charcoal dark:hover:text-white transition-colors'}`}
                        >
                            Editorial View
                        </button>
                        <div className="w-[1px] h-4 bg-matteo-stone/30"></div>
                        <button 
                            onClick={() => setViewMode('index')}
                            className={`font-sans text-xs uppercase tracking-[0.2em] py-3 border-b ${viewMode === 'index' ? 'text-matteo-charcoal dark:text-white border-current' : 'text-matteo-stone-ink dark:text-white/60 border-transparent hover:text-matteo-charcoal dark:hover:text-white transition-colors'}`}
                        >
                            Index View
                        </button>
                    </div>
                </RevealOnScroll>
            </div>

            {/* --- Grid Container --- */}
            <div ref={containerRef} className="px-4 md:px-12 max-w-[2000px] mx-auto pb-48">
                <motion.div
                    layout
                    className={`grid grid-cols-12 ${viewMode === 'editorial' ? 'gap-y-24 md:gap-y-40 gap-x-8 lg:gap-x-16' : 'gap-y-8 gap-x-4 lg:gap-x-8'}`}
                >
                    {looks.map((look, index) => (
                        <LookbookItem 
                            key={look.id} 
                            look={look} 
                            index={index} 
                            smoothProgress={smoothProgress}
                            viewMode={viewMode}
                            quote={config.quote}
                            enquiryContext={config.enquiryContext}
                            parallaxEnabled={parallaxEnabled}
                            setSelectedLook={setSelectedLook}
                        />
                    ))}
                </motion.div>
            </div>

            {/* --- Lightbox / Modal --- */}
            {selectedLook && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="lightbox-backdrop"
                        ref={lightboxRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${selectedLook.title} — enlarged view`}
                        tabIndex={-1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-matteo-cream/95 dark:bg-black/95  flex items-center justify-center p-0 md:p-12 transition-opacity duration-300 pointer-events-auto outline-none"
                        onClick={() => setSelectedLook(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-8 right-8 z-[110] text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors"
                            onClick={() => setSelectedLook(null)}
                        >
                            <span className="font-sans text-xs uppercase tracking-widest font-bold">Close [ESC]</span>
                        </button>

                        {/* Navigation Arrows (Desktop) */}
                        <button
                            aria-label="Previous look"
                            className="absolute left-8 top-1/2 -translate-y-1/2 p-8 hidden md:block text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors z-[110]"
                            onClick={handlePrev}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            aria-label="Next look"
                            className="absolute right-8 top-1/2 -translate-y-1/2 p-8 hidden md:block text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors z-[110]"
                            onClick={handleNext}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                        </button>


                        <motion.div
                            key={`modal-content-${selectedLook.id}`}
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col md:flex-row max-h-full md:max-h-[85vh] max-w-7xl w-full bg-white dark:bg-[#111] shadow-2xl overflow-hidden relative z-[105]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Container — capped at half the viewport on phones so the
                                details pane (and its inquiry action) always has room below */}
                            <div className="w-full md:w-2/3 relative h-[50vh] md:h-auto shrink-0 bg-matteo-sand dark:bg-matteo-black group">
                                <ResponsiveImage
                                    baseSrc={selectedLook.image}
                                    alt={selectedLook.title}
                                    className="w-full h-full object-contain"
                                />

                                {/* Mobile Nav Overlay - Visible on small screens */}
                                <div className="absolute inset-0 flex justify-between items-center md:hidden px-2 z-10 pointer-events-none">
                                    <button onClick={handlePrev} aria-label="Previous look" className="pointer-events-auto p-4 text-white drop-shadow-lg">&larr;</button>
                                    <button onClick={handleNext} aria-label="Next look" className="pointer-events-auto p-4 text-white drop-shadow-lg">&rarr;</button>
                                </div>
                            </div>

                            {/* Details Container — scrolls on small screens; the inquiry
                                action stays pinned as a sticky bar so it is always reachable */}
                            <div className="w-full md:w-1/3 min-h-0 flex flex-col bg-white dark:bg-[#111] overflow-y-auto md:overflow-visible">

                                <div className="p-8 pb-0 md:p-16 md:pb-0">
                                    <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-8">
                                        {selectedLook.title}
                                    </h2>
                                    <p className="font-serif text-lg text-matteo-stone-ink dark:text-white/60 mb-12 leading-relaxed">
                                        A bespoke commission, tailored to the specific movements and environment of the client. Each detail is negotiable; the standard of excellence is not.
                                    </p>
                                </div>

                                <div className="sticky bottom-0 mt-auto bg-white dark:bg-[#111] p-8 pt-4 border-t border-matteo-charcoal/10 dark:border-white/10 md:static md:p-16 md:pt-0 md:border-t-0">
                                    <button
                                        onClick={() => {
                                            setSelectedLook(null);
                                            setTimeout(() => navigate('/bespoke', { state: { inquire: true, look: selectedLook.title } }), 300);
                                        }}
                                        className="w-full py-4 border border-matteo-charcoal dark:border-white text-matteo-charcoal dark:text-white font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange hover:border-matteo-orange hover:text-white dark:hover:bg-matteo-orange dark:hover:border-matteo-orange transition-all duration-300"
                                    >
                                        Inquire About {selectedLook.title}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
