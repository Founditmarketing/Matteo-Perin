import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { createPortal } from 'react-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { MENS_LOOKBOOK_IMAGES } from '../constants';

interface LookItem {
    id: string;
    image: string;
    title: string;
}

// Fixed Hook Component
const LookbookItem: React.FC<{
    look: LookItem;
    index: number;
    smoothProgress: any;
    viewMode: 'editorial' | 'index';
    setSelectedLook: (look: LookItem) => void;
}> = ({ look, index, smoothProgress, viewMode, setSelectedLook }) => {
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
            parallaxStyle = { y: featureY };
        } else if (isRightAligned) {
            colSpan = "col-span-12 md:col-span-6 lg:col-span-4";
            alignmentClass = "md:col-start-7 lg:col-start-8";
            verticalOffset = "md:-mt-32";
            parallaxStyle = { y: rightY };
        } else if (isLeftAligned) {
            colSpan = "col-span-12 md:col-span-7 lg:col-span-5";
            alignmentClass = "md:col-start-1 lg:col-start-2";
            verticalOffset = "md:mt-32";
            parallaxStyle = { y: leftY };
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
                <div className="mb-16 md:absolute md:-left-[40%] md:top-1/4 max-w-sm pointer-events-none z-10 hidden lg:block">
                    <h3 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white leading-[1.1] italic">
                        "Form strictly follows intent."
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
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-stone mb-2">Commission</span>
                    <span className="font-serif text-matteo-charcoal dark:text-white text-2xl md:text-3xl">{look.title}</span>
                </div>
                <div className="w-8 h-[1px] bg-matteo-charcoal/30 dark:bg-white/30 group-hover:w-16 group-hover:bg-matteo-orange transition-all duration-500"></div>
            </div>
        </motion.div>
    );
};

export const MensLookbook: React.FC = () => {
    const [selectedLook, setSelectedLook] = useState<LookItem | null>(null);
    const [looks, setLooks] = useState<LookItem[]>([]);
    const [viewMode, setViewMode] = useState<'editorial' | 'index'>('index');
    const navigate = useNavigate();
    const containerRef = React.useRef<HTMLDivElement>(null);

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

    // Generate the look data based on the file counts
    // Men: 29 looks
    useEffect(() => {
        const generatedLooks: LookItem[] = MENS_LOOKBOOK_IMAGES.map((imgUrl, i) => ({
            id: `m-${i + 1}`,
            image: imgUrl,
            title: `Look ${i + 1 < 10 ? '0' + (i + 1) : i + 1}`
        }));

        setLooks(generatedLooks);
    }, []);

    // Lightbox Navigation
    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedLook) return;

        const currentIndex = looks.findIndex(l => l.id === selectedLook.id);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % looks.length;
        setSelectedLook(looks[nextIndex]);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedLook) return;

        const currentIndex = looks.findIndex(l => l.id === selectedLook.id);
        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + looks.length) % looks.length;
        setSelectedLook(looks[prevIndex]);
    };

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen relative transition-colors duration-700">

            <Helmet>
                <title>Luxury Men's Clothing in Jackson, WY | Matteo Perin</title>
                <meta name="description" content="Discover luxury men's clothing in Jackson, Wyoming. Matteo Perin's men's lookbook features bespoke jackets, suits, and exotic outerwear, handcrafted in Italy and available at our Jackson Hole showroom on 164 E Deloney Ave." />
                <meta name="keywords" content="luxury mens clothing jackson wy, mens designer clothing jackson hole, bespoke menswear jackson wyoming, luxury mens jackets jackson hole, Matteo Perin mens" />
                <link rel="canonical" href="https://www.matteoperin.com/lookbook/men" />
                <meta property="og:title" content="Luxury Men's Clothing in Jackson, WY | Matteo Perin" />
                <meta property="og:description" content="Bespoke men's jackets, suits, and exotic outerwear, handcrafted in Italy. Luxury menswear in Jackson Hole, Wyoming." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/lookbook/men" />
            </Helmet>

            {/* --- Header Section --- */}
            <div className="pt-48 pb-24 px-6 md:px-12 text-center relative z-10">
                <RevealOnScroll>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-stone mb-6 block">
                        The Archives
                    </span>

                    <div className="flex justify-center flex-col items-center max-w-md mx-auto relative gap-4 mb-6">
                        <span className="font-sans text-sm uppercase tracking-[0.25em] text-matteo-orange">
                            Men's Lookbook
                        </span>
                        <div className="w-12 h-[1px] bg-matteo-orange" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-stone">
                            Luxury Men's Clothing &middot; Jackson Hole, Wyoming
                        </span>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex justify-center items-center gap-6 mt-12 mb-4">
                        <button 
                            onClick={() => setViewMode('editorial')}
                            className={`font-sans text-xs uppercase tracking-[0.2em] pb-1 border-b ${viewMode === 'editorial' ? 'text-matteo-orange border-matteo-orange' : 'text-matteo-stone border-transparent hover:text-matteo-charcoal dark:hover:text-white transition-colors'}`}
                        >
                            Editorial View
                        </button>
                        <div className="w-[1px] h-4 bg-matteo-stone/30"></div>
                        <button 
                            onClick={() => setViewMode('index')}
                            className={`font-sans text-xs uppercase tracking-[0.2em] pb-1 border-b ${viewMode === 'index' ? 'text-matteo-orange border-matteo-orange' : 'text-matteo-stone border-transparent hover:text-matteo-charcoal dark:hover:text-white transition-colors'}`}
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-matteo-cream/95 dark:bg-black/95  flex items-center justify-center p-0 md:p-12 transition-opacity duration-300 pointer-events-auto"
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
                            className="absolute left-8 top-1/2 -translate-y-1/2 p-8 hidden md:block text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors z-[110]"
                            onClick={handlePrev}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            className="absolute right-8 top-1/2 -translate-y-1/2 p-8 hidden md:block text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors z-[110]"
                            onClick={handleNext}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 18l6-6-6-6" /></svg>
                        </button>


                        <motion.div
                            key={`modal-content-${selectedLook.id}`}
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col md:flex-row max-h-[100vh] md:max-h-[85vh] max-w-7xl w-full bg-white dark:bg-[#111] shadow-2xl overflow-hidden relative z-[105]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Container */}
                            <div className="w-full md:w-2/3 relative h-[60vh] md:h-auto bg-gray-100 dark:bg-gray-900 group">
                                <ResponsiveImage
                                    baseSrc={selectedLook.image}
                                    alt={selectedLook.title}
                                    className="w-full h-full object-contain bg-gray-50 dark:bg-black/50"
                                />

                                {/* Mobile Nav Overlay - Visible on small screens */}
                                <div className="absolute inset-0 flex justify-between items-center md:hidden px-2 z-10 pointer-events-none">
                                    <button onClick={handlePrev} className="pointer-events-auto p-4 text-white drop-shadow-lg">&larr;</button>
                                    <button onClick={handleNext} className="pointer-events-auto p-4 text-white drop-shadow-lg">&rarr;</button>
                                </div>
                            </div>

                            {/* Details Container */}
                            <div className="w-full md:w-1/3 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#111]">

                                <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-8">
                                    {selectedLook.title}
                                </h2>
                                <p className="font-serif text-lg text-gray-500 dark:text-gray-400 mb-12 leading-relaxed">
                                    A bespoke commission, tailored to the specific movements and environment of the client. Each detail is negotiable; the standard of excellence is not.
                                </p>

                                <div className="mt-auto">
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
