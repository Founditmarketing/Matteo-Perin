
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RevealOnScroll } from './RevealOnScroll';
import { ResponsiveImage } from './ResponsiveImage';

export const Interlude: React.FC = () => {
    // Scale drift is decorative — gate it manually (MotionConfig does not
    // cover every case and this loop should never run for reduced-motion users).
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="relative py-32 md:py-48 bg-matteo-black text-white overflow-hidden flex items-center justify-center border-t border-white/5">

            {/* Material backdrop — crocodile hide in macro, grayscale, with a
                slow scale drift. The dark act reads as the material itself. */}
            <div className="absolute inset-0 z-0" aria-hidden="true">
                <motion.div
                    className="w-full h-full"
                    animate={prefersReducedMotion ? undefined : { scale: [1, 1.08] }}
                    transition={prefersReducedMotion ? undefined : { duration: 28, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                >
                    <ResponsiveImage
                        baseSrc="/assets/fabrics/croc.webp"
                        alt=""
                        className="w-full h-full object-cover grayscale opacity-30"
                    />
                </motion.div>
                {/* Deepen the edges so the quote sits in a quiet pool of dark */}
                <div className="absolute inset-0 bg-gradient-to-b from-matteo-black/70 via-matteo-black/20 to-matteo-black/70" />
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 text-center relative z-10">
                <RevealOnScroll>
                    <div className="flex flex-col items-center justify-center mb-10 md:mb-14">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange font-medium">
                            The Core
                        </span>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll delay={0.1}>
                    {/* Hairline flourish — a short centered rule, the house speaking softly */}
                    <span className="block h-[1px] w-16 md:w-24 mx-auto bg-matteo-orange/60 mb-10 md:mb-14" aria-hidden="true" />

                    {/* The pull-quote at display scale — italic Playfair, one aside,
                        enormous. The <br> only applies from md up so the line wraps
                        naturally (never clips) at 375px. The size ladder is staged so
                        the first line ("You do not wear it for the room.") always fits
                        unbroken wherever the hard break is active — 72px needs ~950px
                        of measure, hence xl; 60px fits the lg container; 48px fits md —
                        otherwise the break strands a widowed "room." on its own line. */}
                    <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.15] font-light tracking-tight">
                        "You do not wear it for the room.<br className="hidden md:inline" />{' '}
                        You wear it for yourself."
                    </h2>

                    <span className="block h-[1px] w-16 md:w-24 mx-auto bg-matteo-orange/60 mt-10 md:mt-14" aria-hidden="true" />
                </RevealOnScroll>
            </div>
        </section>
    );
};
