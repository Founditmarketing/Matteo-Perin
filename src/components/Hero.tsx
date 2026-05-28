
import React, { useEffect, useState, useRef } from 'react';
import { IMAGES, TEXTS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Magnetic } from './Magnetic';
import { motion } from 'framer-motion';
import { SpinningLogo } from './SpinningLogo';


interface HeroProps {
    startAnimation?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ startAnimation = true }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Orchestration Controls
    const transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }; // Crisp, snappy ease
    const stagger = 0.1;

    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        if (startAnimation) {
            const timer = setTimeout(() => {
                setShouldAnimate(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [startAnimation]);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-matteo-charcoal text-white">

            {/* Full Bleed Visual */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.05, opacity: 0 }}
                        animate={shouldAnimate ? { scale: 1, opacity: 0.8 } : {}}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <img
                            src={IMAGES.matteo_walking}
                            className="w-full h-full object-cover"
                            alt="Campaign"
                        />
                    </motion.div>
                </div>
                {/* Gradient for Text Legibility - Subtle */}
                <div className="absolute inset-0 bg-gradient-to-t from-matteo-black/90 via-transparent to-matteo-black/20"></div>
            </div>



            {/* Brand Statement - Bottom Aligned like Editorial Spread */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10 flex flex-col md:flex-row justify-between items-end">

                <div className="flex flex-col items-start">
                    {/* Season Tag */}
                    <div className="overflow-hidden mb-6">
                        <motion.span
                            initial={{ y: "100%" }}
                            animate={shouldAnimate ? { y: 0 } : {}}
                            transition={{ ...transition, delay: 0.2 }}
                            className="font-sans text-[11px] uppercase tracking-luxury text-white/70 block"
                        >
                            The Private Commission
                        </motion.span>
                    </div>

                    {/* Headline - Split for Staggered Reveal */}
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl leading-none font-light tracking-tight mb-10 overflow-hidden">
                        <div className="overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={shouldAnimate ? { y: 0 } : {}}
                                transition={{ ...transition, delay: 0.3 }}
                                className="block"
                            >
                                Italian
                            </motion.span>
                        </div>
                        <div className="overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={shouldAnimate ? { y: 0 } : {}}
                                transition={{ ...transition, delay: 0.45 }} // Staggered
                                className="block italic text-matteo-orange"
                            >
                                Bespoke.
                            </motion.span>
                        </div>
                    </h1>

                    {/* Minimalist Entry Points */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                        transition={{ ...transition, delay: 0.4, duration: 0.6 }}
                        className="flex gap-8 md:gap-16 flex-wrap"
                    >
                        <Magnetic>
                            <button
                                onClick={() => navigate('/lookbook/men')}
                                className="group relative py-2"
                            >
                                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500 block whitespace-nowrap">
                                    Men's Lookbook
                                </span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                            </button>
                        </Magnetic>

                        <Magnetic>
                            <button
                                onClick={() => navigate('/lookbook/women')}
                                className="group relative py-2"
                            >
                                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500 block whitespace-nowrap">
                                    Women's Lookbook
                                </span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                            </button>
                        </Magnetic>

                        <Magnetic>
                            <button
                                onClick={() => navigate('/bespoke')}
                                className="group relative py-2"
                            >
                                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/90 group-hover:text-white transition-colors duration-500 block whitespace-nowrap">
                                    Bespoke
                                </span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
                            </button>
                        </Magnetic>
                    </motion.div>
                </div>

                <div className="hidden md:block overflow-hidden">
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={shouldAnimate ? { opacity: 0.6, x: 0 } : {}}
                        transition={{ ...transition, delay: 0.6, duration: 0.8 }}
                        className="font-serif text-lg text-white max-w-xs text-right leading-relaxed"
                    >
                        {TEXTS.HERO_SUBTITLE}
                    </motion.p>
                </div>

            </div>
        </section>
    );
};
