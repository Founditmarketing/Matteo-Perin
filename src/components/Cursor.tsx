import React, { useEffect, useRef, useState } from 'react';

// The house keeps the standard OS cursor everywhere — it is never hidden
// or replaced (accessibility and plain familiarity). This component adds
// one flourish on top of it: over imagery marked data-cursor="view"
// (lookbook plates, hero stills), a small ring labelled "View" trails the
// pointer in mix-blend-difference white, like a gallery placard.
//
// Mechanism:
// - Desktop only: mounts nothing unless (hover: hover) and (pointer: fine).
// - Event delegation on document (mouseover/mouseout + closest()), so
//   containers given data-cursor="view" by other components — including
//   ones mounted later — are picked up with zero per-element wiring.
// - Position is written by a rAF loop that only runs while the ring is
//   visible and still settling; when idle (or merely scrolling) no rAF
//   is scheduled and mousemove exits on a single boolean check.
// - Reduced motion: no trailing lerp (the ring tracks the pointer 1:1)
//   and the CSS in index.css swaps the scale spring for a plain fade.

const VIEW_SELECTOR = '[data-cursor="view"]';

const viewTarget = (node: EventTarget | null): Element | null =>
    node instanceof Element ? node.closest(VIEW_SELECTOR) : null;

export const Cursor: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Touch and coarse-pointer devices never mount the ring at all.
    useEffect(() => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            setEnabled(true);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const el = rootRef.current;
        if (!el) return;

        const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

        let raf = 0;
        let active = false;
        // Rendered position vs. pointer target — the gap between them is
        // the trailing lerp. Parked offscreen until the first activation.
        let x = -100;
        let y = -100;
        let tx = x;
        let ty = y;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        const render = () => {
            const ease = reducedMq.matches ? 1 : 0.25;
            x += (tx - x) * ease;
            y += (ty - y) * ease;
            if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
                x = tx;
                y = ty;
            }
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            // Settled: stop scheduling frames; onMove restarts the loop.
            raf = x === tx && y === ty ? 0 : requestAnimationFrame(render);
        };

        const start = () => {
            if (!raf) raf = requestAnimationFrame(render);
        };

        const setActive = (next: boolean, e?: MouseEvent) => {
            if (active === next) return;
            active = next;
            if (next && e) {
                // Snap to the pointer so the ring blooms in place instead
                // of flying in from wherever it last faded out.
                x = tx = e.clientX;
                y = ty = e.clientY;
            }
            el.classList.toggle('is-active', next);
            start();
        };

        const onMove = (e: MouseEvent) => {
            if (!active) return;
            tx = e.clientX;
            ty = e.clientY;
            start();
        };

        const onOver = (e: MouseEvent) => {
            if (viewTarget(e.target)) setActive(true, e);
        };

        const onOut = (e: MouseEvent) => {
            // Deactivate once the pointer lands outside any view container
            // (relatedTarget is null when it leaves the window entirely).
            if (active && !viewTarget(e.relatedTarget)) setActive(false);
        };

        document.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseover', onOver, { passive: true, capture: true });
        document.addEventListener('mouseout', onOut, { passive: true, capture: true });

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver, { capture: true } as EventListenerOptions);
            document.removeEventListener('mouseout', onOut, { capture: true } as EventListenerOptions);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className="view-cursor fixed top-0 left-0 z-[200010] pointer-events-none will-change-transform"
        >
            <div className="view-cursor-ring w-[72px] h-[72px] rounded-full border border-white mix-blend-difference flex items-center justify-center">
                {/* pl offsets the trailing letter-space so the word sits optically centered */}
                <span className="font-sans font-medium text-[10px] uppercase tracking-[0.3em] pl-[0.3em] text-white">
                    View
                </span>
            </div>
        </div>
    );
};
