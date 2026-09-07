import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const DossierLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Fail-safe check: If the URL is missing or it's the exact placeholder from our hotfix
        const currentUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-dossier-database.supabase.co';
        const currentKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder_public_anon_key';

        if (currentUrl === 'https://placeholder-dossier-database.supabase.co' || currentKey === 'placeholder_public_anon_key') {
            setError("The Dossier is available by private arrangement. Please write to concierge@matteoperin.com.");
            setLoading(false);
            return;
        }

        try {
            // Access is by invitation only — the house opens a dossier, never a form.
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/dossier-dashboard');
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

        return (
            <div className="min-h-screen bg-matteo-black text-matteo-cream flex flex-col items-center justify-center font-serif relative overflow-hidden selection:bg-white selection:text-black">
                <Helmet>
                    <title>The Dossier | Matteo Perin</title>
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
                <div className="mb-12 opacity-80">
                    <Logo />
                </div>

                <div className="text-center mb-16">
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-4">
                        Secure Transmission
                    </span>
                    <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-white">
                        The Dossier
                    </h1>
                </div>

                <form onSubmit={handleAuth} className="w-full flex flex-col gap-8">
                    
                    <div className="relative group">
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full bg-transparent border-b border-white/20 pb-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-white transition-colors duration-500 font-sans font-light tracking-wide"
                        />
                    </div>

                    <div className="relative group">
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Private Key"
                            className="w-full bg-transparent border-b border-white/20 pb-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-white transition-colors duration-500 font-sans font-light tracking-wide"
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-matteo-orange text-sm font-sans tracking-widest text-center italic"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="mt-8">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full border border-white/40 text-white font-sans text-[10px] uppercase tracking-[0.3em] py-5 hover:bg-white hover:text-black transition-all duration-700 disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Enter Secure Line"}
                        </button>
                    </div>
                </form>

                <div className="mt-12 text-center">
                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/30">
                        Access is by invitation. Write to{' '}
                        <a href="mailto:concierge@matteoperin.com" className="text-white/50 hover:text-white transition-colors border-b border-white/20 pb-0.5">
                            concierge@matteoperin.com
                        </a>
                    </p>
                </div>

            </motion.div>

        </div>
    );
};
