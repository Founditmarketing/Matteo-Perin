import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RevealOnScroll } from './RevealOnScroll';
import { Logo } from './Logo';

export const Journal: React.FC = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen flex flex-col items-center justify-center transition-colors duration-700 relative overflow-hidden">
            <Helmet>
                <title>Journal — Notes on Craft, Style & Travel | Matteo Perin</title>
                <meta name="description" content="The Matteo Perin Journal — essays on the art of patina, bespoke craftsmanship, exotic materials, and the lifestyle of considered luxury, from the atelier in Verona to Jackson Hole." />
                <link rel="canonical" href="https://www.matteoperin.com/journal" />
                <meta property="og:title" content="Journal — Notes on Craft, Style & Travel | Matteo Perin" />
                <meta property="og:description" content="Essays on craftsmanship, exotic materials, and the lifestyle of considered luxury." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/journal" />
            </Helmet>

            {/* grain removed */}

            <div className="text-center px-6 relative z-10">
                <RevealOnScroll>
                    <div className="mb-8 opacity-50">
                        <Logo />
                    </div>
                </RevealOnScroll>

                <RevealOnScroll delay={0.1}>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-6">
                        The Edit
                    </span>
                    <h1 className="font-serif text-5xl md:text-8xl text-matteo-charcoal dark:text-white font-light tracking-tight mb-8">
                        Journal
                    </h1>
                </RevealOnScroll>

                <RevealOnScroll delay={0.2}>
                    <div className="w-[1px] h-16 bg-matteo-charcoal/20 dark:bg-white/20 mx-auto mb-8"></div>
                    <p className="font-serif text-xl md:text-2xl text-matteo-charcoal/60 dark:text-white/60 italic">
                        Stories of craftsmanship and culture. <br />
                        <span className="not-italic font-sans text-xs uppercase tracking-widest mt-4 block opacity-70">Coming Soon</span>
                    </p>
                </RevealOnScroll>
            </div>
        </div>
    );
};
