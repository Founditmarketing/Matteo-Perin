
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SpinningLogo } from './SpinningLogo';

export const PrivateAccess: React.FC = () => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'granted' | 'denied'>('idle');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // The access code lives server-side (VAULT_ACCESS_CODE env var) so it
    // never ships in the JS bundle. Access is granted only on a verified
    // response from /api/vault-access.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'verifying' || status === 'granted' || !code.trim()) return;
        setStatus('verifying');
        try {
            const response = await fetch('/api/vault-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            if (response.ok) {
                setStatus('granted');
                setTimeout(() => navigate('/portal'), 1400);
            } else {
                setStatus('denied');
            }
        } catch {
            setStatus('denied');
        }
    };

    return (
        <div className="min-h-screen bg-matteo-black text-matteo-cream flex flex-col items-center justify-center font-serif relative overflow-hidden selection:bg-white selection:text-black">
            <Helmet>
                <title>Private Access | Matteo Perin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Cinematic Ambience */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02),_transparent_40%)] animate-spin-slow"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md p-8 md:p-12 relative z-10 flex flex-col items-center"
            >
                <div className={`mb-12 transition-opacity duration-1000 ${status === 'granted' ? 'opacity-40' : 'opacity-80'}`}>
                    <SpinningLogo size={80} duration={15} />
                </div>

                <div className="text-center mb-16">
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium block mb-4">
                        By Invitation Only
                    </span>
                    <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-white">
                        The Vault
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                    <div className="relative group">
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => { setCode(e.target.value); if (status === 'denied') setStatus('idle'); }}
                            placeholder="Access Code"
                            autoFocus
                            disabled={status === 'verifying' || status === 'granted'}
                            className="w-full bg-transparent border-b border-white/20 pb-4 text-white text-lg text-center tracking-[0.25em] placeholder-white/20 focus:outline-none focus:border-white transition-colors duration-500 font-sans font-light"
                        />
                    </div>

                    <div className="min-h-[1.5rem] flex items-center justify-center">
                        {status === 'denied' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7 }}
                                className="font-serif italic text-[15px] text-white/60 text-center leading-relaxed"
                            >
                                The code was not recognized. For access, write to{' '}
                                <a
                                    href="mailto:concierge@matteoperin.com"
                                    className="text-matteo-cream border-b border-white/30 hover:border-white transition-colors duration-500"
                                >
                                    concierge@matteoperin.com
                                </a>.
                            </motion.p>
                        )}
                        {status === 'granted' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7 }}
                                className="font-serif italic text-[15px] text-white/60 text-center"
                            >
                                Welcome. One moment.
                            </motion.p>
                        )}
                    </div>

                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={status === 'verifying' || status === 'granted' || !code.trim()}
                            className="w-full border border-white/40 text-white font-sans text-[10px] uppercase tracking-[0.3em] py-5 hover:bg-white hover:text-black transition-all duration-700 disabled:opacity-50"
                        >
                            {status === 'verifying' ? 'Verifying…' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
