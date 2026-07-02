import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TEXTS } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';
import { ResponsiveImage } from './ResponsiveImage';
import { Link } from 'react-router-dom';

/**
 * TheHouse – /the-house — The Matteo Perin Story.
 *
 * An undated chapter arc (Verona → the world → Jackson Hole) told in the
 * house's ledger aesthetic. Every fact on this page already exists elsewhere
 * in the repo (press excerpts, the crocodile commission page, PRODUCT.md).
 */

const Ledger: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
    <div className="divide-y divide-matteo-charcoal/10 dark:divide-white/10 border-t border-b border-matteo-charcoal/10 dark:border-white/10">
        {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 py-3">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60 shrink-0">{label}</span>
                <span className="font-serif text-base md:text-lg text-matteo-charcoal dark:text-white text-right">{value}</span>
            </div>
        ))}
    </div>
);

export const TheHouse: React.FC = () => {
    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen transition-colors duration-700">
            <Helmet>
                <title>The House — The Matteo Perin Story | Bespoke Italian Atelier in Jackson, WY</title>
                <meta name="description" content="The story of Matteo Perin — an Italian bespoke house whose commissions are cut and finished by hand in the Verona atelier, and whose only showroom stands at 164 E Deloney Ave in Jackson, Wyoming. One-of-one pieces and private commissions." />
                <link rel="canonical" href="https://www.matteoperin.com/the-house" />
                <meta property="og:title" content="The House — The Matteo Perin Story" />
                <meta property="og:description" content="From the Verona atelier to Deloney Avenue in Jackson, Wyoming — one-of-one pieces and private commissions, cut and finished by hand." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/the-house" />
            </Helmet>

            {/* 1. FIXED HERO (Parallax Effect) */}
            <div className="relative h-screen w-full overflow-hidden sticky top-0 z-0 bg-matteo-black" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                <div className="absolute inset-0">
                    <img
                        src="/assets/house-hero-tetons-v3.jpg"
                        alt="Matteo Perin in Jackson Hole, Wyoming"
                        className="w-full h-full object-cover object-top md:object-center opacity-80"
                        style={{ transform: 'translate3d(0,0,0)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matteo-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="absolute bottom-12 left-6 md:left-12 z-20 text-white">
                    <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-medium text-white/70 mb-6 ml-1">
                        The Matteo Perin Story
                    </p>
                    <h1 className="font-serif text-5xl md:text-9xl font-light tracking-tight leading-none mb-4">
                        Matteo<br />Perin
                    </h1>
                    <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-white/70 ml-1">
                        A Bespoke Italian House — Jackson Hole, Wyoming
                    </p>
                </div>
            </div>

            {/* 2. SCROLLING CONTENT LAYER */}
            <div className="relative z-10 bg-matteo-cream dark:bg-matteo-black mt-[-10vh] rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-colors duration-700 border-t border-white/10">

                {/* 2.1 MANIFESTO */}
                <section className="py-32 md:py-48 px-6 md:px-12 max-w-5xl mx-auto text-center">
                    <RevealOnScroll>
                        <div className="flex justify-center mb-12">
                            <div className="w-[1px] h-24 bg-matteo-orange"></div>
                        </div>
                        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-matteo-charcoal dark:text-white leading-[1.3] font-light">
                            <span className="opacity-80">"{TEXTS.PHILOSOPHY_TEXT}"</span>
                        </h2>
                        <p className="mt-10 font-sans text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60">
                            Matteo Perin
                        </p>
                    </RevealOnScroll>
                </section>

                {/* 2.2 THE ARC — chapter ledger: Verona → the world → Jackson Hole */}
                <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-8 md:pb-16">
                    <RevealOnScroll>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-12 h-[1px] bg-matteo-orange" />
                            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
                                The Story of the House
                            </span>
                        </div>
                        <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-white font-light leading-[1.1] max-w-3xl">
                            From the Dolomites<br />to Deloney Avenue.
                        </h2>
                        <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 mt-6 max-w-xl leading-relaxed">
                            The title JH Style Magazine gave its profile of the house, Winter 2025.
                            It remains the truest map of the story — three chapters, told here in order.
                        </p>
                    </RevealOnScroll>
                </section>

                {/* CHAPTER I — VERONA */}
                <section className="py-20 md:py-28 px-6 md:px-12 max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
                        <div className="lg:col-span-5">
                            <RevealOnScroll>
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <ResponsiveImage
                                        baseSrc="/assets/fabrics/croc.webp"
                                        alt="A hand-selected crocodile hide in deep blue — the raw material of a one-of-one commission"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </RevealOnScroll>
                        </div>
                        <div className="lg:col-span-7">
                            <RevealOnScroll delay={0.2}>
                                <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange block mb-5">
                                    Chapter I — Verona
                                </span>
                                <h3 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white font-light mb-6">
                                    The bench.
                                </h3>
                                {/* NOTE FOR THE HOUSE: confirm the founding year of the Verona atelier and where Matteo trained to complete this chapter. */}
                                <p className="font-serif text-lg text-matteo-charcoal/80 dark:text-white/70 leading-relaxed mb-6 max-w-2xl">
                                    Every commission begins at the bench in Verona, in the hands of master
                                    tailors and leather artisans. Nothing is cut before the client approves
                                    it — hide, patina, and fit are confirmed first. The house's most demanding
                                    piece, a one-of-one crocodile jacket, holds that bench for more than one
                                    hundred hours: a hand-selected Nile or Porosus hide — only one in a hundred
                                    skins qualifies — a patina painted by a single artisan.
                                </p>
                                <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 mb-8 max-w-xl leading-relaxed">
                                    The chapter carries no dates. It is measured in hours at the bench.
                                </p>
                                <Ledger rows={[
                                    ["Atelier", "Verona, Italy"],
                                    ["Hide", "Nile or Porosus, hand-selected"],
                                    ["Patina", "Hand-painted by one artisan"],
                                    ["Bench", "One hundred hours, one jacket"],
                                    ["Commissions", "Three per year, one of one"],
                                ]} />
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* CHAPTER II — THE WORLD */}
                <section className="py-20 md:py-28 px-6 md:px-12 max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
                        <div className="lg:col-span-7 order-2 lg:order-1">
                            <RevealOnScroll delay={0.2}>
                                <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange block mb-5">
                                    Chapter II — The World
                                </span>
                                <h3 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white font-light mb-6">
                                    The fittings.
                                </h3>
                                <p className="font-serif text-lg text-matteo-charcoal/80 dark:text-white/70 leading-relaxed mb-8 max-w-2xl">
                                    The work found its way onto film sets and into private wardrobes.
                                    John Travolta put his fashion trust in the house — a collaboration
                                    that ran on screen and off.
                                </p>
                                <blockquote className="border-l border-matteo-orange pl-6 mb-8 max-w-xl">
                                    <p className="font-serif italic text-xl md:text-2xl text-matteo-charcoal/80 dark:text-white/80 leading-relaxed mb-4">
                                        "Matteo Perin provides bespoke services for those who like enviable,
                                        one-of-a-kind, individualized private service."
                                    </p>
                                    <cite className="not-italic font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60">
                                        Private Air Magazine
                                    </cite>
                                </blockquote>
                                <Ledger rows={[
                                    ["Collaboration", "John Travolta — on screen and off"],
                                    ["Noted in", "Hollywood in Toto · Private Air Magazine"],
                                ]} />
                            </RevealOnScroll>
                        </div>
                        <div className="lg:col-span-5 order-1 lg:order-2">
                            <RevealOnScroll>
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <ResponsiveImage
                                        baseSrc="/assets/bespoke/600341967_1477403550634637_5526575741896032656_n.webp"
                                        alt="Measurements taken by hand during a private fitting"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* CHAPTER III — JACKSON HOLE */}
                <section className="bg-matteo-sand dark:bg-matteo-charcoal transition-colors duration-700">
                    <div className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
                            <div className="lg:col-span-7">
                                <RevealOnScroll>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange block mb-5">
                                        Chapter III — Jackson Hole
                                    </span>
                                    <h3 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white font-light mb-6">
                                        Deloney Avenue.
                                    </h3>
                                    <p className="font-serif text-lg text-matteo-charcoal/80 dark:text-white/70 leading-relaxed mb-8 max-w-2xl">
                                        The newest chapter is written in Wyoming. At 164 E Deloney Ave in
                                        Jackson, the house keeps its only physical retail outpost — a room
                                        where the fabrics are handled, fittings are taken, and commissions
                                        begin in person.
                                    </p>
                                    <blockquote className="border-l border-matteo-orange pl-6 max-w-xl">
                                        <p className="font-serif italic text-xl md:text-2xl text-matteo-charcoal/80 dark:text-white/80 leading-relaxed mb-4">
                                            "Superbly-creative lifestyle designer begins a beautiful new
                                            chapter in Jackson Hole, WY."
                                        </p>
                                        <cite className="not-italic font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60">
                                            JH Style Magazine, Winter 2025
                                        </cite>
                                    </blockquote>
                                </RevealOnScroll>
                            </div>
                            <div className="lg:col-span-5 lg:pt-16">
                                <RevealOnScroll delay={0.2}>
                                    <Ledger rows={[
                                        ["Showroom", "164 E Deloney Ave, Jackson, WY 83001"],
                                        ["Doors", "The house's only retail outpost"],
                                        ["In person", "Fabrics, fittings, consultations"],
                                    ]} />
                                    <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70 mt-8 leading-relaxed">
                                        The atelier remains in Verona. The door is on Deloney.
                                    </p>
                                </RevealOnScroll>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. DESIGN PILLARS */}
                <section className="bg-matteo-black text-white py-32 md:py-48 px-6 md:px-12">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="mb-24">
                            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-4 block">The Code</span>
                            <h2 className="font-serif text-4xl md:text-6xl font-light">
                                The Design Code.
                            </h2>
                        </div>

                        <div className="space-y-16">
                            {[
                                {
                                    num: 'I',
                                    title: 'Context',
                                    desc: 'A garment must respect its environment. We design pieces that transition seamlessly from the tarmac to the boardroom, from the city street to the open range.'
                                },
                                {
                                    num: 'II',
                                    title: 'Permanence',
                                    desc: 'We reject the seasonal cycle. We build heirlooms. Using materials like Vicuña and full-grain leather that develop a richer patina with time.'
                                },
                                {
                                    num: 'III',
                                    title: 'Intimacy',
                                    desc: 'Luxury is personal. It is the silence of a perfect fit. The hidden pocket placed exactly where you reach. The monogram known only to you.'
                                }
                            ].map((pillar, idx) => (
                                <RevealOnScroll key={idx} className="group border-b border-white/10 pb-16 hover:border-matteo-orange/50 transition-colors duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                        <div className="md:col-span-2 font-serif text-2xl text-matteo-orange/60 group-hover:text-matteo-orange transition-colors">
                                            {pillar.num}
                                        </div>
                                        <div className="md:col-span-4">
                                            <h3 className="font-serif text-3xl md:text-4xl">{pillar.title}</h3>
                                        </div>
                                        <div className="md:col-span-6">
                                            <p className="font-serif text-lg text-white/60 leading-relaxed max-w-xl group-hover:text-white transition-colors">
                                                {pillar.desc}
                                            </p>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. CTA */}
                <section className="py-32 text-center">
                    <RevealOnScroll>
                        <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-white/60 mb-8">Begin The Process</p>
                        <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-white mb-12">
                            Style is biography.<br />Write it.
                        </h2>
                        <Link
                            to="/bespoke"
                            className="inline-block border border-matteo-charcoal dark:border-white px-12 py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange hover:border-matteo-orange hover:text-white dark:hover:bg-matteo-orange dark:hover:border-matteo-orange dark:hover:text-white transition-all duration-300"
                        >
                            Commission A Piece
                        </Link>
                    </RevealOnScroll>
                </section>

            </div>
        </div>
    );
};
