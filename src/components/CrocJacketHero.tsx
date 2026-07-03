import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { RevealOnScroll } from './RevealOnScroll';
import { ResponsiveImage } from './ResponsiveImage';

/**
 * CrocJacketHero – Homepage feature for the Bespoke Crocodile Jacket.
 *
 * Matches the site's matteo-cream / matteo-black design system.
 * Uses RevealOnScroll for consistency.
 * Mobile: No parallax — static image with refined overlay text.
 * Desktop: Editorial 7/5 grid with parallax on image only.
 *
 * NOTE ON THE TWO LAYOUT BLOCKS: the mobile (`block lg:hidden`) and desktop
 * (`hidden lg:block`) variants both live in the DOM but are breakpoint-gated —
 * exactly one is visible per viewport. They are intentionally NOT collapsed
 * into a single responsive tree because they diverge structurally, not just
 * in class names: desktop wraps the image in a scroll-parallax motion.div
 * inside a 7/5 grid while mobile is a static stacked flow; the title is an
 * <h2> on desktop and a <p> on mobile so the section ships exactly one H2;
 * and the image crop differs. The shared CONTENT (spec ledger, price block)
 * is factored into SpecLedger / PriceBlock below so the data and its styling
 * exist once in source.
 */

/** The Ledger — provenance, not statistics. Single source of truth. */
const SPEC_ROWS: ReadonlyArray<readonly [string, string]> = [
    ['Hide', 'Nile or Porosus, hand-selected'],
    ['Patina', 'Hand-painted by one artisan'],
    ['Bench', 'One hundred hours, Verona'],
    ['Edition', 'One of one'],
];

/**
 * SpecLedger — the ledger restaged as a watch-catalog spec table: a heavier
 * 1px frame above and below (weight carried by opacity — 0.5px hairlines
 * render unreliably), fine 1px rules between rows, eyebrow-register labels,
 * serif values, generous row padding.
 */
const SpecLedger: React.FC<{ compact?: boolean; className?: string }> = ({
    compact = false,
    className = '',
}) => (
    <dl
        className={`border-t border-b border-matteo-charcoal/25 dark:border-white/25 divide-y divide-matteo-charcoal/10 dark:divide-white/10 ${className}`}
    >
        {SPEC_ROWS.map(([label, value]) => (
            <div
                key={label}
                className={`flex items-baseline justify-between gap-6 ${compact ? 'py-3.5' : 'py-4'}`}
            >
                <dt className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-matteo-stone shrink-0">
                    {label}
                </dt>
                <dd className={`font-serif ${compact ? 'text-base' : 'text-lg'} text-matteo-charcoal dark:text-white text-right`}>
                    {value}
                </dd>
            </div>
        ))}
    </dl>
);

/**
 * PriceBlock — the figures with a quiet macro of the hide drifting behind
 * them. The texture holds the right edge and fades to the canvas colour
 * under the type, so the price stays the loudest element and the labels
 * keep AA contrast. In the compact (mobile) variant the labels reach into
 * the strip, so it narrows to w-1/3 and the fade stays fully opaque through
 * 55% of the strip — the 10px stone-ink labels always sit on pure canvas
 * (4.5:1 needed; texture crevices under the fade were measuring 4.37:1).
 * Scale drift is 1 → 1.06 over 16s, alternating direction; static for
 * reduced-motion users (keyframe loops need manual gating — MotionConfig
 * reducedMotion="user" does not cover `animate` loops).
 */
const PriceBlock: React.FC<{ compact?: boolean; reducedMotion: boolean | null }> = ({
    compact = false,
    reducedMotion,
}) => (
    <div className={`relative ${compact ? 'mb-6' : 'mb-8 border-b border-matteo-charcoal/10 dark:border-white/10'}`}>
        {/* Macro of the hide — grayscale, desaturated, behind the figures */}
        <div
            className={`absolute inset-y-0 right-0 ${compact ? 'w-1/3' : 'w-2/5'} overflow-hidden pointer-events-none`}
            aria-hidden="true"
        >
            <motion.div
                className="w-full h-full"
                animate={reducedMotion ? undefined : { scale: [1, 1.06] }}
                transition={
                    reducedMotion
                        ? undefined
                        : { duration: 16, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }
                }
            >
                <ResponsiveImage
                    baseSrc="/assets/fabrics/croc.webp"
                    alt=""
                    maxVariant="sm"
                    className="w-full h-full object-cover grayscale opacity-25 dark:opacity-20"
                />
            </motion.div>
            {/* Fade toward the type so the figures stay the loudest element.
                Compact: fully opaque canvas through 55% of the strip so the
                labels that overlap it never lose AA contrast to the texture. */}
            <div
                className={`absolute inset-0 bg-gradient-to-r ${
                    compact
                        ? 'from-matteo-cream via-matteo-cream via-[55%] to-matteo-cream/10 dark:from-matteo-black dark:via-matteo-black dark:to-matteo-black/10'
                        : 'from-matteo-cream via-matteo-cream/60 to-matteo-cream/10 dark:from-matteo-black dark:via-matteo-black/60 dark:to-matteo-black/10'
                }`}
            />
        </div>

        <div className={`relative ${compact ? '' : 'pb-8'}`}>
            <div className="flex items-baseline gap-3">
                <span className={`font-serif ${compact ? 'text-xl' : 'text-2xl'} text-matteo-orange-ink dark:text-matteo-orange`}>
                    $25,000
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-matteo-stone">
                    Deposit to Reserve
                </span>
            </div>
        </div>
    </div>
);

export const CrocJacketHero: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Scroll-linked values need manual reduced-motion gating (MotionConfig
    // reducedMotion="user" does not neutralise useScroll/useTransform styles).
    const prefersReducedMotion = useReducedMotion();

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
                <div className="relative w-full overflow-hidden" data-cursor="view">
                    <ResponsiveImage
                        baseSrc="/assets/croc-jacket/matteo_croc_new_1.webp"
                        alt="Bespoke Crocodile Jacket by Matteo Perin"
                        className="w-full aspect-[3/4] object-cover object-center"
                    />
                    {/* Bottom gradient only — subtle, for the badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Availability badge on image */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                        <span className="inline-flex rounded-full h-2 w-2 bg-matteo-orange"></span>
                        <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1">
                            Accepting Commissions
                        </span>
                    </div>
                </div>

                {/* Text content — below image, on cream bg, matching site aesthetic */}
                <div className="px-6 pt-8 pb-10">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-8 h-[1px] bg-matteo-orange" />
                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-orange">
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

                    {/* Price + Deposit — with the hide in macro behind the figures */}
                    <PriceBlock compact reducedMotion={prefersReducedMotion} />

                    {/* Description */}
                    <p className="font-serif text-base text-matteo-charcoal/50 dark:text-white/40 leading-relaxed mb-8">
                        One-of-one hand-selected Nile or Porosus crocodile. Hand-painted patina.
                        Over 100 hours of artisanal labor. Limited to 3 commissions per year.
                    </p>

                    {/* The Ledger — provenance, not statistics */}
                    <SpecLedger compact className="mb-8" />

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
                            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-orange">
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
                                    data-cursor="view"
                                >
                                    <motion.div
                                        className="w-full h-full transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                                        style={prefersReducedMotion ? undefined : { y: imageSpring, scale: scaleSpring }}
                                    >
                                        <ResponsiveImage
                                            baseSrc="/assets/croc-jacket/matteo_croc_new_1.webp"
                                            alt="Bespoke Crocodile Jacket by Matteo Perin"
                                            className="w-full h-full object-cover object-[center_30%] dark:brightness-90"
                                        />
                                    </motion.div>
                                    {/* Subtle vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

                                    {/* Availability badge */}
                                    <div className="absolute bottom-6 left-6 flex items-center gap-2.5 z-10">
                                        <span className="inline-flex rounded-full h-2 w-2 bg-matteo-orange"></span>
                                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1">
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

                                {/* Price Block — with the hide in macro behind the figures */}
                                <PriceBlock reducedMotion={prefersReducedMotion} />

                                {/* Description */}
                                <p className="font-serif text-lg text-matteo-charcoal/60 dark:text-white/50 leading-relaxed mb-10 max-w-md">
                                    One-of-one hand-selected Nile or Porosus crocodile. Hand-painted patina.
                                    Over 100 hours of artisanal labor. Limited to 3 commissions per year.
                                </p>

                                {/* The Ledger — provenance, not statistics */}
                                <SpecLedger className="mb-10" />

                                {/* CTA */}
                                <div className="flex items-center gap-6">
                                    <Link
                                        to="/bespoke-crocodile-jacket"
                                        className="group bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-10 py-5 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500"
                                    >
                                        Explore Commission
                                    </Link>
                                    {/* min-h-[44px] hit area; the underline lives on the
                                        inner span so the visual stays a hairline 4px below
                                        the label. */}
                                    <Link
                                        to="/bespoke-crocodile-jacket"
                                        className="group/details inline-flex items-center min-h-[44px] font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-stone-ink dark:text-matteo-stone hover:text-matteo-orange transition-colors"
                                    >
                                        <span className="border-b border-matteo-charcoal/10 dark:border-white/10 group-hover/details:border-matteo-orange pb-1 transition-colors">
                                            View Details →
                                        </span>
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
