
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { IMAGES } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';
import { Link } from 'react-router-dom';

const SECTIONS = [
    {
        id: 1,
        category: "06:00 — Departure",
        title: "Movement.",
        description: "Travel is not just displacement; it is a state of mind. Our travel collection is engineered to look as impeccable upon landing as it did at takeoff. High-twist wools that resist wrinkling, and unstructured jackets that allow for sleep.",
        image: IMAGES.matteo_walking,
        align: 'left'
    },
    {
        id: 2,
        category: "14:00 — The Boardroom",
        title: "Command.",
        description: "Power is silent. It is conveyed through silhouette, not volume. In the atelier, we cut suits for the man who builds legacy. Sharp shoulders, high armholes, and a drape that respects the anatomy.",
        image: IMAGES.atelier,
        align: 'right'
    },
    {
        id: 3,
        category: "21:00 — The Retreat",
        title: "Solace.",
        description: "The day ends. The armor comes off. This is the time for Vicuña, for cashmere, for materials that offer a tactile respite from the world. Luxury in its most intimate form.",
        image: IMAGES.landscape_mountains,
        align: 'center'
    }
];

export const Lifestyle: React.FC = () => {
    return (
        <div className="bg-matteo-black text-white relative">
            <Helmet>
                <title>The Lifestyle | Considered Luxury by Matteo Perin</title>
                <meta name="description" content="The Matteo Perin lifestyle — where Italian craftsmanship meets the adventurous spirit of Jackson Hole. Exotic outerwear, bespoke leather, and pieces made for a life well lived." />
                <link rel="canonical" href="https://www.matteoperin.com/lifestyle" />
                <meta property="og:title" content="The Lifestyle | Considered Luxury by Matteo Perin" />
                <meta property="og:description" content="Where Italian craftsmanship meets the adventurous spirit of Jackson Hole." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/lifestyle" />
            </Helmet>

            {/* Introductory Header (Fixed behind the scroll) */}
            <div className="min-h-[50vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-12 sticky top-0 z-0 bg-matteo-black">
                <RevealOnScroll>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-6 block">The Life</span>
                    <h1 className="font-serif text-4xl md:text-8xl font-light tracking-tight">
                        A Day in the Life</h1>
                </RevealOnScroll>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse opacity-30" style={{ animationDuration: '3s' }}>
                    <span className="font-serif text-xl">↓</span>
                </div>
            </div>

            {/* Stacking Sections ("Curtain" Effect) */}
            <div className="relative z-10">
                {SECTIONS.map((section, index) => (
                    <div
                        key={section.id}
                        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-matteo-black border-t border-white/5 shadow-2xl"
                        style={{ zIndex: index + 1 }}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={section.image}
                                alt={section.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover opacity-70 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80"></div>
                            {/* Cinematic Grain */}
                            <div className="absolute inset-0 bg-noise opacity-[0.05]"></div>
                        </div>

                        {/* Content */}
                        <div className={`relative z-10 max-w-[1920px] w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 items-center h-full`}>
                            <div className={`
                                col-span-1 md:col-span-6 lg:col-span-5 
                                ${section.align === 'right' ? 'md:col-start-7 lg:col-start-8 text-right' : 'text-left'}
                                ${section.align === 'center' ? 'md:col-start-4 lg:col-start-4 text-center' : ''}
                            `}>
                                <RevealOnScroll>
                                    <span className={`font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-orange mb-4 block ${section.align === 'center' ? '' : (section.align === 'right' ? 'border-r border-matteo-orange pr-4' : 'border-l border-matteo-orange pl-4')}`}>
                                        {section.category}
                                    </span>
                                    <h2 className="font-serif text-4xl md:text-9xl mb-8 leading-[0.85] tracking-tight">
                                        {section.title}
                                    </h2>
                                    <p className={`font-serif text-xl md:text-2xl text-gray-300 leading-relaxed mb-12 font-light ${section.align === 'center' ? 'mx-auto' : ''}`}>
                                        {section.description}
                                    </p>
                                    <Link
                                        to="/collection"
                                        className="inline-block border-b border-white pb-1 font-sans text-[10px] uppercase tracking-widest hover:text-matteo-orange hover:border-matteo-orange transition-colors"
                                    >
                                        Shop The Look
                                    </Link>
                                </RevealOnScroll>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Footer Section specific to Lifestyle (Reveals at end) */}
                <div className="h-[70vh] bg-matteo-cream text-matteo-charcoal flex flex-col items-center justify-center relative z-40 sticky top-0 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                    <RevealOnScroll className="text-center px-6">
                        <h2 className="font-serif text-5xl md:text-7xl mb-8">Curate Your Life</h2>
                        <p className="font-serif text-xl text-matteo-stone mb-12 max-w-lg mx-auto">
                            Every garment is a promise of performance. Discover the collection that accompanies you.
                        </p>
                        <Link to="/contact" className="inline-block bg-matteo-charcoal text-white px-12 py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange transition-colors">
                            Book Private Consultation
                        </Link>
                    </RevealOnScroll>
                </div>
            </div>
        </div>
    );
};
