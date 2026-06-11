import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { RevealOnScroll } from './RevealOnScroll';

// ── The Seam ────────────────────────────────────────────────────────
// The house's dual soul made interactive: a draggable thread between the
// Verona atelier and the Wyoming frontier. Drag the seam (or use arrow
// keys on the handle) to move between the two worlds.

const MIN = 8;
const MAX = 92;

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

interface SplitImageProps {
    base: string; // e.g. /assets/hero_atelier.png  (".webp" + variants assumed)
    alt: string;
}

// Mirrors the ResponsiveImage -sm/-md/-lg convention, absolutely filled.
const SplitImage: React.FC<SplitImageProps> = ({ base, alt }) => (
    <picture>
        <source media="(max-width: 640px)" srcSet={`${base}-sm.webp`} />
        <source media="(max-width: 1024px)" srcSet={`${base}-md.webp`} />
        <source media="(min-width: 1025px)" srcSet={`${base}-lg.webp`} />
        <img
            src={`${base}-lg.webp`}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
        />
    </picture>
);

export const TheSeam: React.FC = () => {
    const [pos, setPos] = useState(50);
    const frameRef = useRef<HTMLDivElement>(null);
    const interacted = useRef(false);
    const hintRaf = useRef<number | null>(null);
    const reduced = useReducedMotion();

    const updateFromClientX = useCallback((clientX: number) => {
        const el = frameRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPos(clamp(((clientX - rect.left) / rect.width) * 100));
    }, []);

    const stopHint = useCallback(() => {
        interacted.current = true;
        if (hintRaf.current) {
            cancelAnimationFrame(hintRaf.current);
            hintRaf.current = null;
        }
    }, []);

    // One-time nudge when the seam first scrolls into view: the thread eases
    // toward Verona and back, teaching that it can be pulled.
    useEffect(() => {
        if (reduced) return;
        const el = frameRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || interacted.current) return;
            io.disconnect();
            const start = performance.now();
            const DURATION = 1600;
            const tick = (now: number) => {
                if (interacted.current) return;
                const t = Math.min(1, (now - start) / DURATION);
                setPos(50 - Math.sin(t * Math.PI) * 8);
                if (t < 1) hintRaf.current = requestAnimationFrame(tick);
            };
            hintRaf.current = requestAnimationFrame(tick);
        }, { threshold: 0.55 });
        io.observe(el);
        return () => {
            io.disconnect();
            if (hintRaf.current) cancelAnimationFrame(hintRaf.current);
        };
    }, [reduced]);

    // Drag from the handle (any pointer) or anywhere on the frame (mouse only,
    // so touch scrolling through the page is never hijacked).
    const startDrag = useCallback((e: React.PointerEvent, fromHandle: boolean) => {
        if (!fromHandle && e.pointerType !== 'mouse') return;
        stopHint();
        e.preventDefault();
        updateFromClientX(e.clientX);

        const move = (ev: PointerEvent) => updateFromClientX(ev.clientX);
        const end = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
    }, [stopHint, updateFromClientX]);

    const onHandleKeyDown = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 12 : 4;
        if (e.key === 'ArrowLeft') { stopHint(); setPos(p => clamp(p - step)); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { stopHint(); setPos(p => clamp(p + step)); e.preventDefault(); }
        else if (e.key === 'Home') { stopHint(); setPos(MIN); e.preventDefault(); }
        else if (e.key === 'End') { stopHint(); setPos(MAX); e.preventDefault(); }
    };

    return (
        <section className="bg-matteo-cream dark:bg-matteo-black py-24 md:py-32 transition-colors duration-700">
            <div className="text-center px-6 mb-12 md:mb-16">
                <RevealOnScroll>
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-4">The Dual Soul</span>
                    <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-white font-light mb-4">One House, Two Worlds</h2>
                    <p className="font-serif italic text-lg text-matteo-charcoal/60 dark:text-white/60 max-w-xl mx-auto">
                        Cut in Verona. Proven in Wyoming. Pull the thread between them.
                    </p>
                </RevealOnScroll>
            </div>

            <div
                ref={frameRef}
                className="relative h-[70vh] md:h-[85vh] overflow-hidden select-none cursor-ew-resize bg-matteo-black"
                onPointerDown={(e) => startDrag(e, false)}
            >
                {/* Jackson Hole — base layer (right world) */}
                <SplitImage
                    base="/assets/hero_teton_buffalo_v2"
                    alt="Bison crossing open ground beneath the Tetons outside Jackson Hole"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                {/* Verona — clipped layer (left world) */}
                <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, willChange: 'clip-path' }}
                >
                    <SplitImage
                        base="/assets/hero_atelier.png"
                        alt="The cutting table of the Matteo Perin atelier in Verona, tools laid out by hand"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                </div>

                {/* Captions */}
                <div
                    className="absolute bottom-10 md:bottom-14 left-6 md:left-16 text-white transition-opacity duration-500 pointer-events-none"
                    style={{ opacity: pos > 24 ? 1 : 0 }}
                >
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-3">Verona · ITA</span>
                    <h3 className="font-serif text-3xl md:text-5xl leading-none">The Atelier</h3>
                </div>
                <div
                    className="absolute bottom-10 md:bottom-14 right-6 md:right-16 text-right text-white transition-opacity duration-500 pointer-events-none"
                    style={{ opacity: pos < 76 ? 1 : 0 }}
                >
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-3">Jackson Hole · USA</span>
                    <h3 className="font-serif text-3xl md:text-5xl leading-none">The Proving Ground</h3>
                </div>

                {/* The seam itself */}
                <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
                    {/* soft shadow so the thread reads on bright imagery */}
                    <div className="absolute inset-y-0 -translate-x-1/2 w-[3px] bg-black/25 blur-[2px]"></div>
                    <div className="absolute inset-y-0 -translate-x-1/2 w-[1px] bg-matteo-orange"></div>

                    <button
                        type="button"
                        role="slider"
                        aria-label="Seam between the Verona atelier and Jackson Hole"
                        aria-valuemin={MIN}
                        aria-valuemax={MAX}
                        aria-valuenow={Math.round(pos)}
                        aria-valuetext={`${Math.round(pos)}% Verona, ${Math.round(100 - pos)}% Jackson Hole`}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-matteo-orange bg-matteo-cream/95 text-matteo-charcoal flex items-center justify-center shadow-lg cursor-ew-resize focus:outline-none focus-visible:ring-1 focus-visible:ring-matteo-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                        style={{ touchAction: 'none' }}
                        onPointerDown={(e) => { e.stopPropagation(); startDrag(e, true); }}
                        onKeyDown={onHandleKeyDown}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6 4 12l5 6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15 6 5 6-5 6" />
                        </svg>
                    </button>
                    <span className="absolute top-1/2 mt-9 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.3em] text-white/90 pointer-events-none [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
                        Drag
                    </span>
                </div>
            </div>
        </section>
    );
};
