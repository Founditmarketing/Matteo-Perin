import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { AIInterface } from './AIInterface';

export const SolomeiHero: React.FC = () => {
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [activePrompt, setActivePrompt] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const prompts = [
        "What is the essence of true luxury?",
        "Tell me about the Matteo Perin philosophy.",
        "How is a bespoke suit created?",
        "Show me the latest collection.",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePrompt((prev) => (prev + 1) % prompts.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section ref={containerRef} className="relative w-full min-h-[140vh] flex flex-col items-center justify-start pt-[30vh] overflow-hidden bg-[#F0F0F0] dark:bg-[#111111] text-matteo-charcoal dark:text-matteo-cream transition-colors duration-1000">

            {/* Cinematic Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    // @ts-ignore
                    webkit-playsinline="true"
                    preload="none"
                    className="w-full h-full object-cover opacity-60 dark:opacity-40 grayscale-[20%] transition-opacity duration-1000"
                >
                    <source src="https://videos.pexels.com/video-files/3576351/3576351-uhd_2560_1440_30fps.mp4" type="video/mp4" />
                </video>
                {/* Video Overlay - Softens the footage */}
                <div className="absolute inset-0 bg-[#F2EFE9]/30 dark:bg-black/40 mix-blend-overlay"></div>
            </div>

            {/* Deep Atmospheric Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F2EFE9]/50 dark:via-black/50 to-[#F2EFE9] dark:to-[#0A0A0A] z-10 pointer-events-none" />

            {/* Background Texture/Noise removed for perf */}

            {/* Central Narrative Block */}
            <motion.div style={{ y, opacity }} className="relative z-20 max-w-7xl px-6 text-center space-y-16">

                {/* Brand / Title - New Typography Scale */}
                <motion.h1
                    initial={{ opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "0.2em" }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-xs md:text-sm uppercase text-matteo-stone tracking-[0.2em]"
                >
                    Solomei Design Philosophy
                </motion.h1>

                {/* Main Headline - Massive Editorial Serif */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    <h2 className="font-serif text-[12vw] leading-[0.9] tracking-tighter text-matteo-charcoal dark:text-[#EAEAEA] mix-blend-difference">
                        <span className="block italic font-light">The Art</span>
                        <span className="block font-normal">of the Individual</span>
                    </h2>
                </motion.div>

                {/* Sub-narrative - The "Stream" starts here */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="max-w-xl mx-auto pt-8"
                >
                    <p className="font-serif text-lg md:text-xl leading-relaxed text-matteo-stone italic">
                        "We believe in a technology that enhances the human soul, rather than replacing it. A silent companion in the pursuit of beauty."
                    </p>
                </motion.div>

                {/* AI / Interaction Trigger - Clean "Search" Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-12 flex justify-center w-full"
                >
                    <button
                        onClick={() => setIsAIOpen(true)}
                        className="group relative flex items-center gap-4 px-8 py-5 bg-matteo-cream/80 dark:bg-matteo-black/80  border border-matteo-charcoal/10 dark:border-matteo-cream/10 rounded-full w-full max-w-md hover:border-matteo-orange/50 transition-all duration-500 shadow-xl"
                    >
                        <span className="w-2 h-2 rounded-full bg-matteo-orange animate-pulse"></span>

                        <div className="flex-1 text-left h-6 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={activePrompt}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 0.6, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 font-serif italic text-lg text-matteo-charcoal dark:text-matteo-cream truncate"
                                >
                                    Ask Matteo: "{prompts[activePrompt]}"
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-matteo-charcoal dark:bg-matteo-cream flex items-center justify-center text-matteo-cream dark:text-matteo-black">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </button>

                </motion.div>
            </motion.div>

            {/* AI Modal Overlay */}
            <AnimatePresence>
                {isAIOpen && <AIInterface onClose={() => setIsAIOpen(false)} />}
            </AnimatePresence>

        </section>
    );
};
