import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';
import { Magnetic } from './Magnetic';
import { ResponsiveImage } from './ResponsiveImage';
import { useNavigate } from 'react-router-dom';

// Scroll-Driven DualHero (Scrollytelling)
// Act 1 — the material itself: white crocodile hide in macro. The garment is the hero.
// Act 2 — the Teton frontier the pieces are proven in. Provenance-to-product in one act.

// Masthead registers — whisper above, thunder below. Shared so the invisible
// replica (which reserves the stage height) can never drift out of sync with
// the live headlines.
const EYEBROW_CLASS = "font-sans text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-medium";
// md:leading-[0.9] is load-bearing: md:text-8xl re-sets line-height:1 inside the
// min-768px media query (after the base leading-[0.9] in compiled CSS), and the
// arbitrary lg/xl sizes set font-size only — so the unitless 0.9 must be
// re-declared at md to hold at every size above mobile.
const TITLE_CLASS = "font-serif text-6xl md:text-8xl lg:text-[9rem] xl:text-[10rem] leading-[0.9] md:leading-[0.9]";

// Ken Burns drift — a perpetual ~12s scale breath (1.0 ⇄ ~1.04). It lives on an
// INNER wrapper so it composes with, never fights, the scroll-linked parallax
// transforms on the outer layer. Directions alternate per layer.
const kenBurnsDrift = (from: number, to: number) => ({
    animate: { scale: [from, to] },
    transition: { duration: 12, ease: 'easeInOut' as const, repeat: Infinity, repeatType: 'mirror' as const }
});

export const DualHero: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLElement>(null);

    // MotionConfig reducedMotion="user" does NOT cover scroll-linked
    // useScroll/useTransform values or perpetual loops — gate them manually.
    const prefersReducedMotion = useReducedMotion();

    // 1. Scroll Progress (0 to 1 as we scroll down the pinned section)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Apply spring physics to the raw scroll value for buttery cinematic transitions
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // 2. The Italy→Wyoming move: one continuous scroll-linked wipe, not a hard
    // swap. The frontier layer draws upward behind a gently tilted diagonal
    // edge (clip-path polygon) while a soft opacity ramp feathers its arrival.
    // Blend zone: progress 0.28→0.68, ~40% of the 200vh travel. Everything is a
    // pure function of progress, so the move reads identically in both scroll
    // directions. Compositor-friendly: opacity + clip-path only.
    const natureOpacity = useTransform(smoothProgress, [0.28, 0.5], [0, 1]);
    const wipeLead = useTransform(smoothProgress, [0.3, 0.64], [115, 0]);
    const wipeTrail = useTransform(smoothProgress, [0.34, 0.68], [115, 0]);
    const natureClipPath = useMotionTemplate`polygon(0% ${wipeLead}%, 100% ${wipeTrail}%, 100% 100%, 0% 100%)`;
    const scale = useTransform(smoothProgress, [0, 1], [1, 1.15]);

    // Text Opacities: cross-fade bracketing the wipe
    const text1Opacity = useTransform(smoothProgress, [0.2, 0.4], [1, 0]);
    const text1Y = useTransform(smoothProgress, [0.2, 0.4], [0, -100]);

    const text2Opacity = useTransform(smoothProgress, [0.5, 0.7], [0, 1]);
    const text2Y = useTransform(smoothProgress, [0.5, 0.7], [100, 0]);

    // 3. Mouse Interaction (Preserved)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 100 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (prefersReducedMotion) return;
        const { clientX, clientY, currentTarget } = e;
        const { width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX / width) - 0.5;
        const y = (clientY / height) - 0.5;
        mouseX.set(x * 15);
        mouseY.set(y * 15);
    };

    // Specific local assets (.webp bases — ResponsiveImage serves -sm/-md/-lg variants)
    const slide1 = {
        image: "/assets/hero_grand_estate.webp",
        subtitle: "MADE IN VERONA",
        title: "The Provenance"
    };
    const slide2 = {
        image: "/assets/hero_teton_buffalo_v2.webp",
        subtitle: "PROVEN IN THE TETONS",
        title: "The Resilience"
    };

    // Combined Parallax for Background
    const bgY = useTransform(springY, (latest) => latest);

    // Scroll-linked styles are applied only when motion is allowed; otherwise
    // the hero is a single static frame.
    const layerMotionStyle = prefersReducedMotion ? undefined : { x: springX, y: bgY, scale };

    return (
        <section
            ref={containerRef}
            className={`relative ${prefersReducedMotion ? 'h-screen' : 'h-[200vh]'} w-full bg-matteo-charcoal`}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden text-white" onMouseMove={handleMouseMove}>

                {/* --- Vignette Overlay --- */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_120%)]"></div>


                {/* --- Background Layers --- */}

                {/* Layer 1: The Material (Bottom) — white crocodile in macro */}
                <motion.div
                    data-cursor="view"
                    className="absolute inset-0 w-full h-full z-0"
                    style={layerMotionStyle}
                >
                    <motion.div
                        className="w-full h-full"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Ken Burns wrapper — perpetual drift on its own element,
                            beneath both the entrance scale and the scroll parallax */}
                        <motion.div
                            className="w-full h-full"
                            style={prefersReducedMotion ? undefined : { willChange: 'transform' }}
                            {...(prefersReducedMotion ? {} : kenBurnsDrift(1, 1.04))}
                        >
                            <ResponsiveImage
                                baseSrc={slide1.image}
                                alt="The grand estate — where the house's Italian provenance begins"
                                className="w-full h-full object-cover"
                                fetchPriority="high"
                                loading="eager"
                            />
                        </motion.div>
                    </motion.div>
                    {/* Scrims for text readability over the bright hide */}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                </motion.div>

                {/* Layer 2: The Frontier (Top) — drawn upward by a scroll-linked
                    diagonal wipe. Clip + opacity live on this screen-stable outer
                    element; parallax and drift are composed on wrappers inside it. */}
                {!prefersReducedMotion && (
                    <motion.div
                        data-cursor="view"
                        className="absolute inset-0 w-full h-full z-10"
                        style={{ opacity: natureOpacity, clipPath: natureClipPath, willChange: 'clip-path, opacity' }}
                    >
                        <motion.div className="w-full h-full" style={{ x: springX, y: bgY, scale }}>
                            <motion.div
                                className="w-full h-full"
                                style={{ willChange: 'transform' }}
                                {...kenBurnsDrift(1.04, 1)}
                            >
                                <ResponsiveImage
                                    baseSrc={slide2.image}
                                    alt="Bison beneath the Tetons — the Wyoming frontier the pieces are proven in"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />
                            </motion.div>
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                    </motion.div>
                )}

                {/* --- Content Overlay --- */}

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 pb-24 pointer-events-none">
                    <div className="max-w-4xl">

                        {prefersReducedMotion ? (
                            /* Static first frame: both acts present and readable,
                               nothing scroll-linked, no loops. The h1 renders in
                               normal flow — visible at first paint. */
                            <div>
                                <h2 className={`${EYEBROW_CLASS} mb-6 text-white`}>
                                    {slide1.subtitle}
                                </h2>
                                <h1 className={`${TITLE_CLASS} text-white`}>
                                    <span className="block italic font-light text-white/90">The</span>
                                    <span className="block">Provenance</span>
                                </h1>
                                <h2 className={`${EYEBROW_CLASS} mt-8 md:mt-10 mb-3 text-white`}>
                                    {slide2.subtitle}
                                </h2>
                                <h2 className="font-serif text-3xl md:text-4xl leading-none text-white">
                                    <span className="italic font-light text-white/90">The </span>
                                    Resilience
                                </h2>
                            </div>
                        ) : (
                            /* Title stage: an invisible in-flow replica reserves exactly the
                                height the cross-fading headlines need, so the declarative line
                                and entries below can never collide with them. */
                            <div className="relative">
                                <div className="invisible" aria-hidden="true">
                                    <h2 className={`${EYEBROW_CLASS} mb-6`}>
                                        {slide1.subtitle}
                                    </h2>
                                    <div className={TITLE_CLASS}>
                                        <span className="block italic font-light">The</span>
                                        <span className="block">Provenance</span>
                                    </div>
                                </div>

                                {/* Text 1: The Material.
                                    LCP note: the headline is visible at first paint — the entrance
                                    animates a wrapper TRANSFORM (y), never opacity on the text. */}
                                <motion.div
                                    className="absolute inset-x-0 bottom-0"
                                    style={{ opacity: text1Opacity, y: text1Y }}
                                >
                                    <motion.div
                                        initial={{ y: 48 }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <h2 className={`${EYEBROW_CLASS} mb-6 text-white`}>
                                            {slide1.subtitle}
                                        </h2>
                                        <h1 className={`${TITLE_CLASS} text-white`}>
                                            <span className="block italic font-light text-white/90">The</span>
                                            <span className="block">Provenance</span>
                                        </h1>
                                    </motion.div>
                                </motion.div>

                                {/* Text 2: The Frontier */}
                                <motion.div
                                    className="absolute inset-x-0 bottom-0"
                                    style={{ opacity: text2Opacity, y: text2Y }}
                                >
                                    <h2 className={`${EYEBROW_CLASS} mb-6 text-white`}>
                                        {slide2.subtitle}
                                    </h2>
                                    <h2 className={`${TITLE_CLASS} text-white`}>
                                        <span className="block italic font-light text-white/90">The</span>
                                        <span className="block">Resilience</span>
                                    </h2>
                                </motion.div>
                            </div>
                        )}

                        {/* The declarative line + entries, in normal flow below the stage */}
                        <motion.div
                            className="pointer-events-auto mt-8 md:mt-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <p className="font-serif italic text-base md:text-xl text-white/80 max-w-xl mb-6 md:mb-8 leading-relaxed">
                                A bespoke Italian atelier in Jackson Hole — one-of-one pieces and private commissions.
                            </p>

                            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                                {/* Primary entry: the ghost button carries the weight */}
                                <Magnetic>
                                    <button
                                        onClick={() => navigate('/shop')}
                                        className="font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium border border-white/40 px-8 py-3.5 min-h-[44px] text-white hover:bg-white hover:text-matteo-charcoal hover:border-transparent transition-colors duration-500"
                                    >
                                        Shop One-of-One
                                    </button>
                                </Magnetic>

                                <Magnetic>
                                    <button
                                        onClick={() => navigate('/bespoke-crocodile-jacket')}
                                        className="group relative py-3.5 min-h-[44px]"
                                    >
                                        <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500">
                                            Commission
                                        </span>
                                        <span className="absolute bottom-2 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                                    </button>
                                </Magnetic>

                                <Magnetic>
                                    <button
                                        onClick={() => navigate('/lookbook/men')}
                                        className="group relative py-3.5 min-h-[44px]"
                                    >
                                        <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500">
                                            Man
                                        </span>
                                        <span className="absolute bottom-2 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                                    </button>
                                </Magnetic>

                                <Magnetic>
                                    <button
                                        onClick={() => navigate('/lookbook/women')}
                                        className="group relative py-3.5 min-h-[44px]"
                                    >
                                        <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500">
                                            Woman
                                        </span>
                                        <span className="absolute bottom-2 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                                    </button>
                                </Magnetic>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator / Progress — meaningless without the scroll act */}
                {!prefersReducedMotion && (
                    <motion.div
                        className="absolute bottom-8 right-8 md:right-16 z-30 h-1 bg-white/20 w-24 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <motion.div
                            className="h-full bg-white"
                            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        />
                    </motion.div>
                )}

            </div>
        </section>
    );
};
