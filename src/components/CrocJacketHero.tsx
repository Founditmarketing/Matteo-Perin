import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { RevealOnScroll } from './RevealOnScroll';

/**
 * CrocJacketHero – Homepage feature for the Bespoke Crocodile Jacket.
 * 
 * Matches the site's matteo-cream / matteo-black design system.
 * Uses RevealOnScroll for consistency.
 * Mobile: No parallax — static image with refined overlay text.
 * Desktop: Editorial 7/5 grid with parallax on image only.
 */

export const CrocJacketHero: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Parallax — DESKTOP ONLY (mobile gets none to avoid black bar)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });
    const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.02]);
    const imageSpring = useSpring(imageY, { stiffness: 80, damping: 30 });
    const scaleSpring = useSpring(imageScale, { stiffness: 80, damping: 30 });

    return (
        <section
            ref={sectionRef}
            className="relative bg-matteo-cream dark:bg-matteo-black transition-colors duration-700 overflow-hidden"
        >
            {/* Top divider */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-matteo-charcoal/5 dark:bg-white/5" />

            {/* ====================================================
                MOBILE LAYOUT
               ==================================================== */}
            <div className="block lg:hidden">
                {/* Full-width image — NO parallax, just a clean static image */}
                <div className="relative w-full overflow-hidden">
                    <img
                        src="/assets/croc jacket/matteo_croc_new_1.jpg"
                        alt="Bespoke Crocodile Jacket by Matteo Perin"
                        className="w-full aspect-[3/4] object-cover object-center"
                    />
                    {/* Bottom gradient only — subtle, for the badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Availability badge on image */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-sans text-[7px] uppercase tracking-[0.15em] text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1">
                            Accepting Commissions
                        </span>
                    </div>
                </div>

                {/* Text content — below image, on cream bg, matching site aesthetic */}
                <div className="px-6 pt-8 pb-10">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-8 h-[1px] bg-matteo-orange" />
                        <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-matteo-orange">
                            Bespoke Exotics
                        </span>
                    </div>

                    {/* Title — rendered as <p> so the page ships a single H2 for this
                        section (the desktop variant's); both variants live in the DOM
                        and are gated by lg: media classes. */}
                    <p className="font-serif text-4xl text-matteo-charcoal dark:text-white leading-[0.95] tracking-tight mb-5 font-light">
                        Bespoke Crocodile<br />
                        <span className="italic">Jacket.</span>
                    </p>

                    {/* Price + Deposit */}
                    <div className="flex items-baseline gap-4 mb-4">
                        <span className="font-serif text-xl text-matteo-charcoal dark:text-white">$185,000</span>
                        <span className="font-sans text-[8px] uppercase tracking-[0.15em] text-matteo-stone">Full Commission</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="font-serif text-base text-matteo-orange">$25,000</span>
                        <span className="font-sans text-[7px] uppercase tracking-[0.12em] text-matteo-stone">Deposit to Reserve</span>
                    </div>

                    {/* Description */}
                    <p className="font-serif text-base text-matteo-charcoal/50 dark:text-white/40 leading-relaxed mb-8">
                        One-of-one hand-selected Nile or Porosus crocodile. Hand-painted patina.
                        Over 100 hours of artisanal labor. Limited to 3 commissions per year.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 py-5 border-t border-b border-matteo-charcoal/10 dark:border-white/10 mb-8">
                        {[
                            { value: "100+", label: "Hours" },
                            { value: "1 of 1", label: "Edition" },
                            { value: "Italy", label: "Origin" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <span className="font-serif text-lg text-matteo-charcoal dark:text-white block mb-0.5">{stat.value}</span>
                                <span className="font-sans text-[7px] uppercase tracking-[0.15em] text-matteo-stone">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        to="/bespoke-crocodile-jacket"
                        className="block w-full text-center bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors duration-500"
                    >
                        Explore Commission
                    </Link>
                </div>
            </div>


            {/* ====================================================
                DESKTOP LAYOUT — Editorial 7/5 grid (unchanged, user loves it)
               ==================================================== */}
            <div className="hidden lg:block py-24 xl:py-32">
                <div className="max-w-[1400px] mx-auto px-12">

                    {/* Section Eyebrow */}
                    <RevealOnScroll>
                        <div className="flex items-center gap-4 mb-16">
                            <span className="w-12 h-[1px] bg-matteo-orange" />
                            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-matteo-orange">
                                Bespoke Exotics
                            </span>
                        </div>
                    </RevealOnScroll>

                    <div className="grid grid-cols-12 gap-8 xl:gap-16 items-center">

                        {/* Image — 7 cols */}
                        <div className="col-span-7">
                            <RevealOnScroll delay={0.1}>
                                <div
                                    ref={imageContainerRef}
                                    className="relative aspect-[3/4] overflow-hidden bg-[#EBEBEB] dark:bg-[#1a1a1a] group"
                                >
                                    <motion.img
                                        src="/assets/croc jacket/matteo_croc_new_1.jpg"
                                        alt="Bespoke Crocodile Jacket by Matteo Perin"
                                        className="w-full h-full object-cover object-[center_30%] transition-transform duration-[2s] ease-out group-hover:scale-[1.03] dark:brightness-90"
                                        style={{ y: imageSpring, scale: scaleSpring }}
                                    />
                                    {/* Subtle vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

                                    {/* Availability badge */}
                                    <div className="absolute bottom-6 left-6 flex items-center gap-2.5 z-10">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1">
                                            Accepting Commissions
                                        </span>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </div>

                        {/* Text Content — 5 cols */}
                        <div className="col-span-5">
                            <RevealOnScroll delay={0.25}>
                                {/* Title */}
                                <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl text-matteo-charcoal dark:text-white leading-[0.95] tracking-tight mb-8 font-light">
                                    Bespoke<br />
                                    Crocodile<br />
                                    <span className="italic">Jacket.</span>
                                </h2>

                                {/* Price Block */}
                                <div className="mb-8 pb-8 border-b border-matteo-charcoal/10 dark:border-white/10">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="font-serif text-2xl text-matteo-charcoal dark:text-white">$185,000</span>
                                        <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-matteo-stone">Full Commission</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-serif text-lg text-matteo-orange">$25,000</span>
                                        <span className="font-sans text-[8px] uppercase tracking-[0.15em] text-matteo-stone">Deposit to Reserve</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="font-serif text-lg text-matteo-charcoal/60 dark:text-white/50 leading-relaxed mb-10 max-w-md">
                                    One-of-one hand-selected Nile or Porosus crocodile. Hand-painted patina.
                                    Over 100 hours of artisanal labor. Limited to 3 commissions per year.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-matteo-charcoal/10 dark:border-white/10 mb-10">
                                    {[
                                        { value: "100+", label: "Hours Crafted" },
                                        { value: "1 of 1", label: "Unique Piece" },
                                        { value: "Italy", label: "Handcrafted" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="text-center">
                                            <span className="font-serif text-lg text-matteo-charcoal dark:text-white block mb-1">{stat.value}</span>
                                            <span className="font-sans text-[7px] uppercase tracking-[0.2em] text-matteo-stone">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-6">
                                    <Link
                                        to="/bespoke-crocodile-jacket"
                                        className="group bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-10 py-5 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500"
                                    >
                                        Explore Commission
                                    </Link>
                                    <Link
                                        to="/bespoke-crocodile-jacket"
                                        className="font-sans text-[9px] uppercase tracking-[0.2em] text-matteo-stone hover:text-matteo-orange transition-colors border-b border-matteo-charcoal/10 dark:border-white/10 hover:border-matteo-orange pb-1"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-matteo-charcoal/5 dark:bg-white/5" />
        </section>
    );
};
