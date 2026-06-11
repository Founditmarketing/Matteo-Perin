
import React, { useState } from 'react';
import { Logo } from './Logo';
import { SpinningLogo } from './SpinningLogo';
import { Link, useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

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

    const handleSubscribe = () => {
        if (email && email.includes('@')) {
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

            // Also send via serverless API for reliable capture
            fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'newsletter',
                    email,
                    ...utmData,
                    referrer: document.referrer || '',
                    landingPage: sessionStorage.getItem('landing_page') || window.location.href,
                }),
            }).catch(() => {});
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer className="bg-matteo-charcoal text-white pt-24 border-t border-white/5 overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-20">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-4 mb-8">
                            <SpinningLogo size={40} className="opacity-100" />
                            <span className="font-serif tracking-widest text-lg">MATTEO PERIN</span>
                        </div>
                        <p className="font-sans text-xs text-white/60 leading-loose">
                            164 E Deloney Ave<br />
                            Jackson, Wyoming 83001<br /><br />
                            <a href="mailto:concierge@matteoperin.com" className="hover:text-white transition-colors">concierge@matteoperin.com</a><br />
                            <a href="tel:3072649655" className="hover:text-white transition-colors">307.264.9655</a>
                        </p>
                        <div className="mt-6 font-sans text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            <span className="block text-matteo-orange mb-2">Showroom Hours</span>
                            M-F: 10am - 6pm<br />
                            Sat: 10am - 5pm<br />
                            Sun: 12pm - 5pm
                        </div>
                    </div>

                    {/* Links */}
                    <div className="col-span-1">
                        <h4 className="font-sans text-xs uppercase tracking-luxury text-matteo-orange mb-6">Explore</h4>
                        <ul className="space-y-4 font-serif text-white/80">
                            <li><Link to="/the-house" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">The House</Link></li>
                            <li><a href="/#collection" onClick={(e) => handleNav(e, '/#collection')} className="hover:text-white transition-colors block py-1">Collections</a></li>
                            <li><Link to="/bespoke" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Bespoke Process</Link></li>
                            <li><Link to="/journal" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Journal</Link></li>
                            <li><Link to="/bespoke-crocodile-jacket" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Bespoke Crocodile Jacket</Link></li>
                            <li><a href="/#contact" onClick={(e) => handleNav(e, '/#contact')} className="hover:text-white transition-colors block py-1">Enquire</a></li>
                            <li><Link to="/shipping-returns" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Shipping &amp; Returns</Link></li>
                            <li><Link to="/private-client" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors block py-1">Private Client</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="font-sans text-xs uppercase tracking-luxury text-matteo-orange mb-6">Updates</h4>
                        <p className="font-sans text-sm text-white/60 mb-6 max-w-md">Private invitations. Early access.</p>

                        <div className="relative h-12 overflow-hidden">
                            <div className={`transition-all duration-500 transform ${subscribed ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                                <div className="flex border-b border-white/20 pb-2 max-w-md">
                                    <input
                                        type="email"
                                        placeholder="Your Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-white/5 text-white/40">
                    <div className="flex gap-4 items-center">
                        <p className="font-sans text-[10px] uppercase tracking-wider">© 2026 Matteo Perin.</p>
                        <span className="text-white/25">|</span>
                        <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="font-sans text-[10px] uppercase tracking-wider hover:text-matteo-orange transition-colors">Privacy</Link>
                        <span className="text-white/25">|</span>
                        <Link to="/dossier" onClick={() => window.scrollTo(0, 0)} className="font-sans text-[10px] uppercase tracking-wider text-white/40 hover:text-white transition-colors">Client Dossier</Link>
                    </div>
                </div>

            </div>

            {/* Massive Brand Footer Signature - Cinematic Reveal */}
            <div className="w-full overflow-hidden border-t border-white/5 pt-2 select-none group relative">
                <div className="absolute inset-0 bg-gradient-to-t from-matteo-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <h1 className="font-serif text-[18vw] leading-[0.8] text-center text-matteo-orange/5 tracking-tight pointer-events-none transition-transform duration-[2s] ease-out group-hover:scale-[1.01]">
                    MATTEO PERIN
                </h1>
            </div>
        </footer>
    );
};
