import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Magnetic } from './Magnetic';
import { useNavigate } from 'react-router-dom';

// Scroll-Driven DualHero (Scrollytelling)
export const DualHero: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLElement>(null);

    // 1. Scroll Progress (0 to 1 as we scroll down the 300vh section)
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

    // 2. Parallax & Transitions - "Heavy" & "Deliberate" Feel
    // Image 2 (Nature) Opacity: Fades in earlier and smoother
    const natureOpacity = useTransform(smoothProgress, [0.3, 0.6], [0, 1]);

    // Scale Effect: Deeper zoom for a more cinematic feel
    const scale = useTransform(smoothProgress, [0, 1], [1, 1.15]);

    // Text Opacities: Cross-fade
    const text1Opacity = useTransform(smoothProgress, [0.2, 0.4], [1, 0]);
    const text1Y = useTransform(smoothProgress, [0.2, 0.4], [0, -100]); // Moved slightly faster

    const text2Opacity = useTransform(smoothProgress, [0.5, 0.7], [0, 1]);
    const text2Y = useTransform(smoothProgress, [0.5, 0.7], [100, 0]);

    // 3. Mouse Interaction (Preserved)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 100 }; // Slightly smoother spring could be considered, but keeping verified values per plan
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX / width) - 0.5;
        const y = (clientY / height) - 0.5;
        mouseX.set(x * 15); // Reduced movement slightly for more "weight"
        mouseY.set(y * 15);
    };

    // Specific local assets
    const slide1 = {
        image: "/assets/hero_grand_estate.jpg",
        subtitle: "BORN IN EXCELLENCE",
        title: "Grand Estate"
    };
    const slide2 = {
        image: "/assets/hero_teton_buffalo_v2.jpg",
        subtitle: "LIVED IN THE WORLD",
        title: "Teton Bison"
    };

    // Combined Parallax for Background
    const bgY = useTransform(springY, (latest) => latest);

    // Initial Reveal Animation
    const initialScale = { initial: { scale: 1.05 }, animate: { scale: 1 }, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }; 
    const initialOpacity = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" as const } };

    return (
        <section
            ref={containerRef}
            className="relative h-[300vh] w-full bg-matteo-charcoal"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden text-white" onMouseMove={handleMouseMove}>

                {/* --- Film Grain & Atmosphere Overlay (Removed for Perf) --- */}

                {/* --- Vignette Overlay --- */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_120%)]"></div>


                {/* --- Background Layers --- */}

                {/* Layer 1: Atelier (Bottom) */}
                <motion.div
                    className="absolute inset-0 w-full h-full z-0"
                    initial={initialScale} // Initial reveal zoom
                    animate={{ scale: 1 }} // Reset to handled by scroll
                    style={{ x: springX, y: bgY, scale }} // Scroll 'scale' overrides this after mount if not careful, but combined works for enter
                >
                    {/* Note: Framer Motion 'style' prop overrides 'animate' for values present in both during interactions usually. 
                        To get a clean "Intro -> Scroll" handoff without complex layout effects, we can just rely on the scroll scale starting at 1.
                        Let's apply the Intro scale to the IMAGE itself, separate from the container scroll scale.
                     */}
                    <motion.img
                        src={slide1.image}
                        alt={slide1.title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                    />
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                </motion.div>

                {/* Layer 2: Nature (Top, Fades In) */}
                <motion.div
                    className="absolute inset-0 w-full h-full z-10"
                    style={{ opacity: natureOpacity, x: springX, y: bgY, scale }}
                >
                    <img
                        src={slide2.image}
                        alt={slide2.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                </motion.div>

                {/* --- Content Overlay --- */}

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 pb-24 pointer-events-none">
                    <div className="max-w-4xl pointer-events-auto relative">

                        {/* Text 1: Atelier */}
                        <motion.div
                            className="absolute bottom-0 left-0 w-full"
                            style={{ opacity: text1Opacity, y: text1Y }}
                            {...initialOpacity} // Fade in on load
                        >
                            <h2 className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-white/80">
                                {slide1.subtitle}
                            </h2>
                            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-none text-white mb-12">
                                <span className="block italic font-light text-white/90">The</span>
                                <span className="block">Provenance</span>
                            </h1>
                            <div className="flex gap-16 pointer-events-none opacity-0">
                                <button className="py-2">placeholder</button>
                            </div>
                        </motion.div>

                        {/* Text 2: Nature */}
                        <motion.div
                            className="absolute bottom-0 left-0 w-full"
                            style={{ opacity: text2Opacity, y: text2Y }}
                        >
                            <h2 className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-white/80">
                                {slide2.subtitle}
                            </h2>
                            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-none text-white mb-12">
                                <span className="block italic font-light text-white/90">The</span>
                                <span className="block">Resilience</span>
                            </h1>
                        </motion.div>

                        {/* Persistent Buttons (Always Visible/Interactable) */}
                        <div className="relative mt-[200px] md:mt-[240px] flex gap-16">
                            {/* Placeholder for layout */}
                        </div>

                    </div>
                </div>

                {/* Shared Buttons - Properly Positioned */}
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-8 md:p-16 pb-24 pointer-events-none">
                    <motion.div
                        className="max-w-4xl pointer-events-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="h-[200px] md:h-[240px]"></div> {/* Spacer for text */}
                        <div className="flex gap-16">
                            <Magnetic>
                                <button
                                    onClick={() => navigate('/lookbook/men')}
                                    className="group relative py-2"
                                >
                                    <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500">
                                        Man
                                    </span>
                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                                </button>
                            </Magnetic>

                            <Magnetic>
                                <button
                                    onClick={() => navigate('/lookbook/women')}
                                    className="group relative py-2"
                                >
                                    <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500">
                                        Woman
                                    </span>
                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                                </button>
                            </Magnetic>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator / Progress */}
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

            </div>
        </section>
    );
};
