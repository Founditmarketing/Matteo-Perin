
import React from 'react';
import { RevealOnScroll } from './RevealOnScroll';

export const Interlude: React.FC = () => {
    return (
        <section className="relative py-32 md:py-48 bg-[#050505] text-white overflow-hidden flex items-center justify-center border-t border-white/5">

            {/* Cinematic Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/50 z-10" /> {/* Dimming Overlay */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    // @ts-ignore
                    webkit-playsinline="true"
                    preload="none"
                    className="w-full h-full object-cover opacity-80"
                >
                    <source src="/assets/videos/core_background.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
                <RevealOnScroll>
                    <div className="flex flex-col items-center justify-center mb-12">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange font-bold">
                            The Core
                        </span>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll delay={0.1}>
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-[1.2] font-light tracking-tight">
                        "You do not wear it for the room.<br />
                        You wear it for yourself."
                    </h2>
                </RevealOnScroll>
            </div>
        </section>
    );
};
