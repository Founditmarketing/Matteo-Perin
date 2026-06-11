import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { IMAGES, TEXTS } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';
import { Link } from 'react-router-dom';

export const TheHouse: React.FC = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- Video Hero with full iPhone/mobile optimization ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const handleVideoLoaded = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
            // iOS often needs an explicit play() nudge after load
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay blocked — will show poster frame as fallback
                });
            }
        }
    }, []);

    // Scrollytelling Logic for Dual Worlds
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                if (!containerRef.current) { ticking = false; return; }

                const rect = containerRef.current.getBoundingClientRect();
                const height = rect.height;
                const top = rect.top;
                const windowHeight = window.innerHeight;

                let progress = -top / (height - windowHeight);
                progress = Math.max(0, Math.min(1, progress));

                setScrollProgress(progress);
                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen transition-colors duration-700">
            <Helmet>
                <title>The House — The Matteo Perin Story | Luxury Atelier in Jackson, WY</title>
                <meta name="description" content="The story of Matteo Perin — an Italian bespoke luxury house rooted in Verona craftsmanship and based in Jackson, Wyoming. Discover the philosophy, the atelier, and the design code behind the brand." />
                <link rel="canonical" href="https://www.matteoperin.com/the-house" />
                <meta property="og:title" content="The House — The Matteo Perin Story" />
                <meta property="og:description" content="An Italian bespoke luxury house rooted in Verona craftsmanship, based in Jackson, Wyoming." />
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
                    <h1 className="font-serif text-5xl md:text-9xl font-light tracking-tight leading-none mb-4">
                        Matteo<br />Perin
                    </h1>
                    <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/70 ml-2">
                        The Architect of Lifestyle
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
                    </RevealOnScroll>
                </section>

                {/* 2.2 THE DUAL SOUL (Sticky Scrollytelling) */}
                <section ref={containerRef} className="relative h-[300vh]">
                    <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

                        {/* Layer 1: Verona (Base) */}
                        <div
                            className="absolute inset-0 transition-opacity duration-100 ease-linear bg-black"
                            style={{ opacity: 1 }} // Always visible base
                        >
                            <img
                                src="/assets/hero_grand_estate.jpg"
                                className="w-full h-full object-cover grayscale opacity-60"
                                alt="Verona Atelier"
                                style={{ transform: `scale(${1 + scrollProgress * 0.1})` }} // Subtle zoom out
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>

                        {/* Layer 2: Jackson Hole (Overlay) */}
                        <div
                            className="absolute inset-0 transition-opacity duration-100 ease-linear bg-black"
                            style={{ opacity: scrollProgress }} // Fades in as we scroll
                        >
                            <img
                                src="/assets/hero_teton_buffalo_v2.jpg"
                                className="w-full h-full object-cover opacity-70 grayscale"
                                alt="Jackson Hole"
                                style={{ transform: `scale(${1.1 - scrollProgress * 0.1})` }} // Subtle zoom in
                            />
                            <div className="absolute inset-0 bg-black/30"></div>
                        </div>

                        {/* Text Layer: Verona */}
                        <div
                            style={{
                                opacity: 1 - scrollProgress * 2.5, // Fades out quickly
                                transform: `translateY(${scrollProgress * 100}px)`
                            }}
                            className="absolute left-6 md:left-24 bottom-24 text-white transition-all duration-500 transform max-w-[80%] md:max-w-none"
                        >
                            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-4">The Origin</span>
                            <h2 className="font-serif text-6xl md:text-8xl leading-none mb-6">Verona,<br />Italy</h2>
                            <p className="font-serif text-xl opacity-80 max-w-md leading-relaxed">
                                The Foundation. Centuries of Italian craftsmanship. The origin of every stitch.
                            </p>
                        </div>

                        {/* Text Layer: Jackson */}
                        <div
                            className="absolute right-6 md:right-24 bottom-24 text-right text-white transition-all duration-500 transform"
                            style={{
                                opacity: (scrollProgress - 0.5) * 2.5, // Fades in late
                                transform: `translateY(${(1 - scrollProgress) * 100}px)`
                            }}
                        >
                            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-4">The Inspiration</span>
                            <h2 className="font-serif text-6xl md:text-8xl leading-none mb-6">Jackson,<br />Wyoming</h2>
                            <p className="font-serif text-xl opacity-80 max-w-md ml-auto leading-relaxed">
                                The Frontier. Where technical performance meets nature. The proving ground.
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 items-center">
                            <span className={`text-[10px] uppercase tracking-widest text-white transition-opacity ${scrollProgress < 0.5 ? 'opacity-100' : 'opacity-40'}`}>ITA</span>
                            <div className="w-24 h-[1px] bg-white/20 relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-matteo-orange transition-all duration-100 ease-out"
                                    style={{ width: `${scrollProgress * 100}%` }}
                                ></div>
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest text-white transition-opacity ${scrollProgress > 0.5 ? 'opacity-100' : 'opacity-40'}`}>USA</span>
                        </div>

                    </div>
                </section>

                {/* 3. LOCATIONS DETAIL */}
                <section className="py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">

                        {/* Verona Detail */}
                        <RevealOnScroll className="border-t border-matteo-charcoal/10 dark:border-white/10 pt-8">
                            <span className="font-mono text-[9px] text-matteo-stone uppercase tracking-widest mb-2 block">HQ / Production</span>
                            <h3 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-6">The Atelier</h3>
                            <p className="font-serif text-matteo-charcoal/70 dark:text-gray-400 leading-relaxed mb-8">
                                Located in the heart of Verona, this is where the alchemy happens. Our master tailors and leather artisans work here to execute commissions with a level of detail that mass production cannot replicate.
                            </p>
                        </RevealOnScroll>

                        {/* Jackson Detail */}
                        <RevealOnScroll delay={0.2} className="border-t border-matteo-charcoal/10 dark:border-white/10 pt-8">
                            <span className="font-mono text-[9px] text-matteo-stone uppercase tracking-widest mb-2 block">Flagship Store</span>
                            <h3 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-6">The Showroom</h3>
                            <p className="font-serif text-matteo-charcoal/70 dark:text-gray-400 leading-relaxed mb-8">
                                Our only physical retail outpost. A space designed to bridge the gap between Italian luxury and the rugged American West. Here, clients can experience our fabrics and fittings in person.
                            </p>
                            <div className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal dark:text-white">
                                164 E Deloney Ave<br />Jackson, Wyoming 83001
                            </div>
                        </RevealOnScroll>

                    </div>
                </section>

                {/* 4. DESIGN PILLARS */}
                <section className="bg-[#111] text-white py-32 md:py-48 px-6 md:px-12">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="mb-24">
                            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-orange mb-4 block">The Code</span>
                            <h2 className="font-serif text-4xl md:text-6xl font-light">
                                The Design Code.
                            </h2>
                        </div>

                        <div className="space-y-16">
                            {[
                                {
                                    num: '01',
                                    title: 'Context',
                                    desc: 'A garment must respect its environment. We design pieces that transition seamlessly from the tarmac to the boardroom, from the city street to the open range.'
                                },
                                {
                                    num: '02',
                                    title: 'Permanence',
                                    desc: 'We reject the seasonal cycle. We build heirlooms. Using materials like Vicuña and full-grain leather that develop a richer patina with time.'
                                },
                                {
                                    num: '03',
                                    title: 'Intimacy',
                                    desc: 'Luxury is personal. It is the silence of a perfect fit. The hidden pocket placed exactly where you reach. The monogram known only to you.'
                                }
                            ].map((pillar, idx) => (
                                <RevealOnScroll key={idx} className="group border-b border-white/10 pb-16 hover:border-matteo-orange/50 transition-colors duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                        <div className="md:col-span-2 font-mono text-lg text-matteo-orange/50 group-hover:text-matteo-orange transition-colors">
                                            {pillar.num}
                                        </div>
                                        <div className="md:col-span-4">
                                            <h3 className="font-serif text-3xl md:text-4xl">{pillar.title}</h3>
                                        </div>
                                        <div className="md:col-span-6">
                                            <p className="font-serif text-lg text-gray-400 leading-relaxed max-w-xl group-hover:text-white transition-colors">
                                                {pillar.desc}
                                            </p>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. CTA */}
                <section className="py-32 text-center">
                    <RevealOnScroll>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone mb-8">Begin The Process</p>
                        <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-white mb-12">
                            "Style is biography.<br />Write it"
                        </h2>
                        <Link
                            to="/bespoke"
                            className="inline-block border border-matteo-charcoal dark:border-white px-12 py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange hover:border-matteo-orange hover:text-white dark:hover:bg-matteo-orange dark:hover:border-matteo-orange dark:hover:text-white transition-all duration-300"
                        >
                            Commission A Piece
                        </Link>
                    </RevealOnScroll>
                </section>

            </div >
        </div >
    );
};
