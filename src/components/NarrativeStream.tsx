import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PRODUCTS, IMAGES } from '../constants'; // Import actual products and images

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax & Fade effects
    const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={ref} className={`min-h-screen flex items-center justify-center relative py-32 ${className}`}>
            <motion.div style={{ opacity, y }} className="w-full max-w-7xl mx-auto px-6 relative z-10">
                {children}
            </motion.div>
        </section>
    );
};

export const NarrativeStream: React.FC = () => {
    return (
        <div className="bg-[#F2EFE9] dark:bg-[#0A0A0A] text-matteo-charcoal dark:text-matteo-cream transition-colors duration-1000 overflow-hidden">

            {/* Background Texture/Noise removed for perf */}

            {/* SECTION 1: THE ORIGIN (Heritage) */}
            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="order-2 md:order-1 space-y-10">
                        <span className="font-sans text-xs tracking-[0.2em] uppercase text-matteo-stone">
                            The Philosophy
                        </span>
                        <h2 className="font-serif text-5xl md:text-7xl leading-tight">
                            True luxury is a <span className="italic text-matteo-stone">feeling.</span>
                        </h2>
                        <div className="w-12 h-[1px] bg-matteo-charcoal/20 dark:bg-matteo-cream/20"></div>
                        <p className="font-serif text-xl leading-relaxed max-w-md opacity-80">
                            "Everything I design should fit who they are, instead of me trying to make them who I am. I design lifestyles, not pieces."
                        </p>
                    </div>
                    <div className="order-1 md:order-2 relative aspect-[4/5] overflow-hidden rounded-sm">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            src={IMAGES.hero_portrait}
                            alt="Matteo Perin"
                            className="w-full h-full object-cover grayscale-[10%]"
                        />
                        <div className="absolute inset-0 bg-matteo-cream/5 mix-blend-multiply"></div>
                    </div>
                </div>
            </Section>

            {/* SECTION 2: THE JOURNEY (Lifestyle/Travel) - Replaced "Tech" with "Life" */}
            <Section className="bg-matteo-charcoal dark:bg-black text-matteo-cream relative overflow-hidden">
                {/* Background visual for depth */}
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 mix-blend-overlay pointer-events-none">
                    <img src={IMAGES.landscape_mountains} className="w-full h-full object-cover grayscale" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="relative aspect-square overflow-hidden rounded-sm">
                        <motion.img
                            initial={{ scale: 1.2 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 2 }}
                            src={IMAGES.matteo_walking}
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>

                    <div className="space-y-8 text-right md:text-left">
                        <span className="font-sans text-xs tracking-[0.2em] uppercase opacity-50">
                            The Journey
                        </span>
                        <h2 className="font-serif text-5xl md:text-7xl leading-tight">
                            Designed for the <span className="italic text-matteo-orange">Movement.</span>
                        </h2>
                        <p className="font-serif text-lg leading-relaxed opacity-70">
                            From the boardroom to the Dolomites, our garments are engineered to perform. We source the rarest fibers—Vicuña, Cashmere, Silk—and construct them to withstand the rigors of a life well-traveled.
                        </p>
                    </div>
                </div>
            </Section>

            {/* SECTION 3: THE ARTIFACTS (Expanded Grid) */}
            <Section>
                <div className="space-y-20">
                    <div className="text-center space-y-6">
                        <h2 className="font-serif text-[6vw] leading-none text-matteo-charcoal/90 dark:text-matteo-cream/90">
                            The Collection
                        </h2>
                        <p className="font-serif italic text-matteo-stone text-xl">"Material architecture."</p>
                    </div>

                    {/* Expanded Grid - 6 Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {PRODUCTS.slice(0, 6).map((item, i) => (
                            <div key={i} className="group cursor-pointer flex flex-col gap-4">
                                <div className="aspect-[3/4] overflow-hidden relative bg-black/5 dark:bg-white/5">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 1 }}
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-all duration-700 opacity-90 group-hover:opacity-100"
                                    />
                                    {/* Subtly show category on hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <span className="font-sans text-xs tracking-[0.2em] uppercase text-white border border-white/30 px-4 py-2">
                                            View Piece
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <span className="block font-sans text-[10px] tracking-[0.15em] uppercase opacity-50">{item.category}</span>
                                    <h3 className="font-serif text-2xl group-hover:text-matteo-orange transition-colors duration-300">{item.title}</h3>
                                    <p className="font-serif text-sm italic text-matteo-stone opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                                        {item.price ? `Approx. $${item.price.toLocaleString()}` : 'Price on Request'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-12">
                        <button className="px-8 py-4 border border-matteo-charcoal dark:border-matteo-cream font-sans text-xs tracking-[0.2em] uppercase hover:bg-matteo-charcoal hover:text-matteo-cream dark:hover:bg-matteo-cream dark:hover:text-matteo-black transition-all duration-500">
                            View Full Archive
                        </button>
                    </div>
                </div>
            </Section>

            {/* FOOTER QUOTE */}
            <section className="py-40 text-center border-t border-matteo-charcoal/5 dark:border-matteo-cream/5 mt-20">
                <p className="font-serif text-3xl md:text-5xl italic max-w-4xl mx-auto leading-tight px-6 text-matteo-charcoal dark:text-matteo-cream">
                    "Style is not a display of wealth. It is a display of <span className="text-matteo-orange">self-knowledge.</span>"
                </p>
                <span className="block mt-12 font-sans text-xs tracking-[0.2em] uppercase opacity-50">— Matteo Perin</span>
            </section>

        </div>
    );
};
