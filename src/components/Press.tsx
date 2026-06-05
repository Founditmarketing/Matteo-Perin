import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RevealOnScroll } from './RevealOnScroll';
import { PRESS_ARTICLES } from '../constants';

export const Press: React.FC = () => {
    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 pb-32 transition-colors duration-700">
            <Helmet>
                <title>Press & Media Coverage | Matteo Perin</title>
                <meta name="description" content="Matteo Perin in the press — featured in Robb Report, Private Air Magazine, JH Style, and more. Coverage of the Italian bespoke luxury designer based in Jackson Hole, Wyoming." />
                <meta name="keywords" content="Matteo Perin press, Matteo Perin media, luxury designer Jackson Hole press, bespoke designer features" />
                <link rel="canonical" href="https://www.matteoperin.com/press" />
                <meta property="og:title" content="Press & Media Coverage | Matteo Perin" />
                <meta property="og:description" content="Featured coverage of Matteo Perin, the Italian bespoke luxury designer based in Jackson Hole, Wyoming." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/press" />
            </Helmet>
            <div className="max-w-[1920px] mx-auto px-6 md:px-12">

                {/* --- Header --- */}
                <div className="text-center mb-24 md:mb-32">
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-6 block">
                            Global Coverage
                        </span>
                        <h1 className="font-serif text-5xl md:text-8xl text-matteo-charcoal dark:text-white font-light tracking-tight">
                            In The Press
                        </h1>
                    </RevealOnScroll>
                </div>

                {/* --- Press Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-20 gap-x-8 lg:gap-x-12">
                    {PRESS_ARTICLES.map((article, index) => {
                        // Layout Logic:
                        // First item is full width (col-span-12)
                        // Others alternate or take specific spans for visual rhythm
                        const isFeatured = index === 0;
                        const colSpan = isFeatured ? "lg:col-span-12" : "lg:col-span-6";

                        return (
                            <div key={article.id} className={`${colSpan} group cursor-pointer`}>
                                <RevealOnScroll delay={index * 0.1}>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="block relative">

                                        {/* Image wrapper */}
                                        <div className={`overflow-hidden bg-gray-100 dark:bg-gray-900 mb-8 relative ${isFeatured ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}>
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" // Slow, luxurious zoom
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-matteo-charcoal/0 group-hover:bg-matteo-charcoal/10 transition-colors duration-500"></div>

                                            {/* Publication Badge (Floating) */}
                                            <div className="absolute top-0 left-0 p-6 md:p-8">
                                                <span className="bg-white/90 dark:bg-black/90  text-matteo-charcoal dark:text-white font-serif italic text-lg md:text-xl px-6 py-2 inline-block shadow-xl">
                                                    {article.publication}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className={`${isFeatured ? 'max-w-4xl mx-auto text-center' : 'max-w-xl'}`}>
                                            <div className="flex items-center gap-4 mb-4 opacity-60">
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-matteo-charcoal dark:text-white">
                                                    {article.date}
                                                </span>
                                                <span className="w-8 h-[1px] bg-current"></span>
                                            </div>

                                            <h2 className={`font-serif text-matteo-charcoal dark:text-white mb-6 group-hover:text-matteo-orange transition-colors duration-300 ${isFeatured ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
                                                {article.title}
                                            </h2>

                                            <p className="font-serif text-lg md:text-xl text-matteo-charcoal/70 dark:text-white/70 leading-relaxed mb-8">
                                                {article.excerpt}
                                            </p>

                                            <span className="inline-block border-b border-matteo-charcoal/30 dark:border-white/30 pb-1 font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal dark:text-white group-hover:border-matteo-orange group-hover:text-matteo-orange transition-all duration-300">
                                                Read Full Feature
                                            </span>
                                        </div>

                                    </a>
                                </RevealOnScroll>
                            </div>
                        );
                    })}
                </div>

                {/* --- Footer Note --- */}
                <div className="mt-32 pt-16 border-t border-matteo-charcoal/10 dark:border-white/10 text-center">
                    <p className="font-serif text-matteo-stone italic">
                        For press inquiries, please contact <a href="mailto:concierge@matteoperin.com" className="underline hover:text-matteo-orange">concierge@matteoperin.com</a>
                    </p>
                </div>

            </div>
        </div>
    );
};
