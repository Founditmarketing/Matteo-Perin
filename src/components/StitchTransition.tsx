import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ── The Stitch ──────────────────────────────────────────────────────
// The site's signature page transition. On navigation, two cream panels
// close over the page like fabric, a single orange thread draws across
// the seam, and the panels part along it to reveal the new page —
// the page is "cut open" by the stitch.
//
// Timing contract (used by ScrollToTop and PageTransition in App.tsx):
//   0 .................. navigation; panels begin closing, old page holds
//   STITCH_COVER_MS .... panels fully closed; route swaps + scroll resets
//   +280ms ............. thread has drawn across the seam
//   STITCH_TOTAL_MS .... panels fully parted; overlay unmounts
export const STITCH_COVER_MS = 420;
export const STITCH_TOTAL_MS = 1180;

type Phase = 'idle' | 'covering' | 'stitching' | 'revealing';

const CLOSE_EASE = [0.76, 0, 0.24, 1] as const;
const OPEN_EASE = [0.22, 1, 0.36, 1] as const;

export const StitchTransition: React.FC = () => {
    const { pathname } = useLocation();
    const reduced = useReducedMotion();
    const [phase, setPhase] = useState<Phase>('idle');
    const firstRender = useRef(true);
    const timers = useRef<number[]>([]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (reduced) return;

        timers.current.forEach(clearTimeout);
        timers.current = [];
        setPhase('covering');
        timers.current.push(window.setTimeout(() => setPhase('stitching'), STITCH_COVER_MS));
        timers.current.push(window.setTimeout(() => setPhase('revealing'), STITCH_COVER_MS + 280));
        timers.current.push(window.setTimeout(() => setPhase('idle'), STITCH_TOTAL_MS));

        return () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, [pathname, reduced]);

    if (phase === 'idle') return null;

    const closed = phase === 'covering' || phase === 'stitching';
    const panelTransition = closed
        ? { duration: STITCH_COVER_MS / 1000, ease: CLOSE_EASE }
        : { duration: 0.48, ease: OPEN_EASE };

    return (
        <div className="fixed inset-0 z-[150000] pointer-events-none" aria-hidden="true">
            {/* Top panel */}
            <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-matteo-cream border-b border-matteo-charcoal/5"
                initial={{ y: '-101%' }}
                animate={{ y: closed ? '0%' : '-101%' }}
                transition={panelTransition}
            />
            {/* Bottom panel */}
            <motion.div
                className="absolute bottom-0 left-0 w-full h-1/2 bg-matteo-cream border-t border-matteo-charcoal/5"
                initial={{ y: '101%' }}
                animate={{ y: closed ? '0%' : '101%' }}
                transition={panelTransition}
            />
            {/* The thread — draws along the seam, then dissolves as the cut opens */}
            <motion.div
                className="absolute left-0 right-0 top-1/2 h-[1px] bg-matteo-orange"
                initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }}
                animate={{
                    clipPath: phase === 'covering' ? 'inset(0 100% 0 0)' : 'inset(0 0% 0 0)',
                    opacity: phase === 'revealing' ? 0 : 1,
                }}
                transition={{
                    clipPath: { duration: 0.26, ease: 'easeOut' },
                    opacity: { duration: 0.3, delay: phase === 'revealing' ? 0.18 : 0 },
                }}
            />
        </div>
    );
};
