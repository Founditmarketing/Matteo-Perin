
import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
    const navigate = useNavigate();
    const footerRef = useRef<HTMLElement>(null);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [subscribeError, setSubscribeError] = useState('');

    // The wax seal turns slowly with scroll progress through the footer.
    // useScroll/useTransform bypass MotionConfig reducedMotion, so gate
    // manually — reduced-motion visitors get a static, crisp seal.
    const prefersReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"]
    });
    const sealRotate = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const handleNav = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        // Handle simple hash routing manually for Footer for consistency
        if (path.includes('#')) {
            const [route, hash] = path.split('#');
            navigate(route);
            setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) {
                    if (window.lenis) {
                        window.lenis.scrollTo(el);
                    } else {
                        el.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 300);
        } else {
            navigate(path);
            window.scrollTo(0, 0);
        }
    };

    const handleSubscribe = async () => {
        // An invalid email used to silently no-op; say so instead.
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setSubscribeError('Please enter a valid email address.');
            return;
        }
        setSubscribeError('');

        // Push to HubSpot CRM via tracking code
        const _hsq = (window as any)._hsq = (window as any)._hsq || [];
        _hsq.push(["identify", { email }]);
        _hsq.push(["trackPageView"]);

        // Capture UTM params for attribution
        const urlParams = new URLSearchParams(window.location.search);
        const utmData: Record<string, string> = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
            const val = urlParams.get(key) || sessionStorage.getItem(key);
            if (val) utmData[key] = val;
        });

        // Send via serverless API for reliable capture — only celebrate
        // once the subscription actually landed.
        try {
            const res = await fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'newsletter',
                    email,
                    ...utmData,
                    referrer: document.referrer || '',
                    landingPage: sessionStorage.getItem('landing_page') || window.location.href,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSubscribed(true);
            setEmail('');
        } catch {
            setSubscribeError('We could not subscribe you just now. Please try again, or write to concierge@matteoperin.com.');
        }
    };

    return (
        <footer ref={footerRef} className="bg-matteo-charcoal text-white pt-24 border-t border-white/5 overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-20">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-4 mb-8">
                            {/* The seal, pressed into the paper: scroll-linked
                                rotation, inset-only shadow ring (nothing casts —
                                Lifted Print Rule). */}
                            <div className="relative w-10 h-10 rounded-full shrink-0">
                                <motion.img
                                    src="/assets/logo-seal.png"
                                    alt="Matteo Perin Seal"
                                    className="w-full h-full rounded-full object-contain"
                                    style={prefersReducedMotion ? undefined : { rotate: sealRotate }}
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 2px 4px rgba(10, 10, 10, 0.55), inset 0 -1px 2px rgba(255, 255, 255, 0.08)' }}
                                />
                            </div>
                            <span className="font-serif tracking-widest text-lg">MATTEO PERIN</span>
                        </div>
                        <p className="font-sans text-xs text-white/60 leading-loose">
                            164 E Deloney Ave<br />
                            Jackson, Wyoming 83001<br /><br />
                            <a href="mailto:concierge@matteoperin.com" className="hover:text-white transition-colors">concierge@matteoperin.com</a><br />
                            <a href="tel:3072649655" className="hover:text-white transition-colors">307.264.9655</a>
                        </p>
                        <div className="mt-6 font-sans text-[10px] text-white/60 uppercase tracking-widest leading-relaxed">
                            <span className="block text-matteo-orange tracking-[0.25em] font-medium mb-2">Showroom Hours</span>
                            M-F: 10am - 6pm<br />
                            Sat: 10am - 5pm<br />
                            Sun: 12pm - 5pm
                        </div>
                    </div>

                    {/* Links */}
                    <div className="col-span-1">
                        <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-6">Explore</h4>
                        <ul className="space-y-4 font-serif text-white/80">
                            <li><Link to="/the-house" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">The House</Link></li>
                            <li><a href="/#collection" onClick={(e) => handleNav(e, '/#collection')} className="hover:text-white transition-colors block py-1">Collections</a></li>
                            <li><Link to="/bespoke" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Bespoke Process</Link></li>
                            {/* Journal link intentionally removed until the Journal carries real essays — restore alongside ArticleDetail. */}
                            <li><Link to="/bespoke-crocodile-jacket" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Bespoke Crocodile Jacket</Link></li>
                            <li><a href="/#contact" onClick={(e) => handleNav(e, '/#contact')} className="hover:text-white transition-colors block py-1">Enquire</a></li>
                            <li><Link to="/shipping-returns" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Shipping &amp; Returns</Link></li>
                            <li><Link to="/private-client" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Private Client</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-6">Updates</h4>
                        <p className="font-sans text-sm text-white/60 mb-6 max-w-md">Private invitations. Early access.</p>

                        <div className="relative h-12 overflow-hidden">
                            <div className={`transition-all duration-500 transform ${subscribed ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                                <div className="flex border-b border-white/20 pb-2 max-w-md">
                                    <input
                                        type="email"
                                        placeholder="Your Email Address"
                                        aria-label="Email address for private updates"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (subscribeError) setSubscribeError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                        className="bg-transparent w-full outline-none text-white font-serif placeholder-white/30 focus:placeholder-white/50"
                                    />
                                    <button
                                        onClick={handleSubscribe}
                                        className="text-xs uppercase tracking-widest text-matteo-orange hover:text-white transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            {/* Success note mounts only after submit so it never ships in the static markup */}
                            <div className={`absolute inset-0 flex items-center transition-all duration-500 transform ${subscribed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`} aria-live="polite">
                                {subscribed && (
                                    <div className="text-matteo-orange font-serif italic text-lg">
                                        "Welcome to the inner circle."
                                    </div>
                                )}
                            </div>
                        </div>
                        {subscribeError && (
                            <p role="alert" className="font-serif text-sm text-white/70 mt-3">{subscribeError}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-white/5 text-white/60">
                    <div className="flex gap-4 items-center">
                        <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium">© 2026 Matteo Perin.</p>
                        <span className="text-white/25">|</span>
                        <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium hover:text-matteo-orange transition-colors">Privacy</Link>
                        <span className="text-white/25">|</span>
                        <Link to="/dossier" onClick={() => window.scrollTo(0, 0)} className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-white/60 hover:text-white transition-colors">Client Dossier</Link>
                    </div>
                </div>

            </div>

            {/* Closing wordmark — the catalog's final frame. Letters justified
                edge-to-edge across the viewport (flex justify-between per
                letter), cream on charcoal at a quiet opacity. vw sizing keeps
                the single line scaling down without wrap or overflow at 375px. */}
            <div aria-hidden="true" className="w-full overflow-hidden border-t border-white/5 pt-8 select-none pointer-events-none">
                <div className="flex justify-between items-baseline px-2 md:px-4 font-serif uppercase text-[10.5vw] leading-[0.85] text-matteo-cream/10">
                    {'MATTEO PERIN'.split('').map((char, i) => (
                        char === ' '
                            ? <span key={i} className="w-[3vw]" />
                            : <span key={i}>{char}</span>
                    ))}
                </div>
            </div>
        </footer>
    );
};
