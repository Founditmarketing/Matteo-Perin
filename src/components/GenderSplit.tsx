
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { MENS_LOOKBOOK_IMAGES, WOMENS_LOOKBOOK_IMAGES } from '../constants';

export const GenderSplit: React.FC = () => {
    const [hoveredSection, setHoveredSection] = useState<'man' | 'woman' | null>(null);

    return (
        <section className="relative w-full md:h-screen flex flex-col md:flex-row bg-matteo-black">

            {/* Man Section - Left/Top */}
            <Link
                to="/men"
                className="relative w-full md:w-1/2 h-[50vh] md:h-full group overflow-hidden"
                onMouseEnter={() => setHoveredSection('man')}
                onMouseLeave={() => setHoveredSection(null)}
            >
                {/* Background Image */}
                <div className="absolute inset-0 bg-matteo-charcoal">
                    <img
                        src=MENS_LOOKBOOK_IMAGES[0]
                        alt="Man"
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        style={{ objectPosition: 'center 20%' }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 transition-transform duration-700">
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            The Collection
                        </span>
                    </RevealOnScroll>
                    <RevealOnScroll delay={0.1}>
                        <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight group-hover:text-matteo-cream transition-colors duration-500">
                            Man
                        </h2>
                    </RevealOnScroll>

                    <div className={`mt-8 overflow-hidden transition-all duration-500 ${hoveredSection === 'man' || window.innerWidth < 768 ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 md:opacity-0'}`}>
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] border-b border-white pb-1 group-hover:border-matteo-cream">
                            View Collection
                        </span>
                    </div>
                </div>
            </Link>

            {/* Woman Section - Right/Bottom */}
            <Link
                to="/women"
                className="relative w-full md:w-1/2 h-[50vh] md:h-full group overflow-hidden"
                onMouseEnter={() => setHoveredSection('woman')}
                onMouseLeave={() => setHoveredSection(null)}
            >
                {/* Background Image */}
                <div className="absolute inset-0 bg-matteo-charcoal">
                    <img
                        src=WOMENS_LOOKBOOK_IMAGES[0]
                        alt="Woman"
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        style={{ objectPosition: 'center 20%' }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 transition-transform duration-700">
                    <RevealOnScroll delay={0.2}>
                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            The Collection
                        </span>
                    </RevealOnScroll>
                    <RevealOnScroll delay={0.3}>
                        <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight group-hover:text-matteo-cream transition-colors duration-500">
                            Woman
                        </h2>
                    </RevealOnScroll>

                    <div className={`mt-8 overflow-hidden transition-all duration-500 ${hoveredSection === 'woman' || window.innerWidth < 768 ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 md:opacity-0'}`}>
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] border-b border-white pb-1 group-hover:border-matteo-cream">
                            View Collection
                        </span>
                    </div>
                </div>
            </Link>

        </section>
    );
};
