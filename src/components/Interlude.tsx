
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
                    {/* The pull-quote at poster scale — italic Playfair, one aside,
                        owning the panel. clamp() ties the size to the viewport
                        (8vw, floored at 3rem, capped at 7.5rem) so the type is the
                        panel's architecture at every width. No hard break: at this
                        scale the first sentence outruns any fixed measure, so
                        text-balance wraps the two sentences into even poster lines
                        and never strands a widowed "room." The hairline rules that
                        used to frame the smaller setting fought this scale — gone. */}
                    <h2 className="font-serif italic text-[clamp(3rem,8vw,7.5rem)] text-white leading-[1.05] font-light tracking-tight text-balance">
                        "You do not wear it for the room. You wear it for yourself."
                    </h2>
                </RevealOnScroll>
            </div>
        </section>
    );
};
