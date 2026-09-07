import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const DossierDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/dossier');
            } else {
                setUser(session.user);
            }
            setLoading(false);
        };

        checkUser();
    }, [navigate]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 animate-pulse">Opening the Dossier…</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-matteo-cream font-serif pt-32 pb-24 px-6 md:px-12 selection:bg-white selection:text-black">
            <Helmet>
                <title>Dossier Dashboard | Matteo Perin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-white/10 pb-12 gap-8">
                    <div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-4">Private Client</span>
                        <h1 className="text-4xl md:text-6xl font-light tracking-wide text-white">The Dossier</h1>
                        <p className="mt-4 text-white/50 font-sans text-sm tracking-widest">{user?.email}</p>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 border border-white/10 px-6 py-3 hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                    >
                        Sign Out
                    </button>
                </header>

                {/* The honest state: a dossier holds only what the atelier has
                    actually recorded for THIS client — nothing is invented. */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    <h2 className="font-serif text-2xl text-white mb-8 tracking-wider">Your dossier is being prepared</h2>
                    <p className="font-serif text-lg text-white/60 leading-relaxed mb-12">
                        Measurements, commissions, and preferences are recorded here by the atelier
                        as your relationship with the house begins — never before, and never by a form.
                        Once Verona has taken your measure, this page becomes yours.
                    </p>
                    <a
                        href="mailto:concierge@matteoperin.com"
                        className="inline-block border border-white/30 text-white font-sans text-[10px] uppercase tracking-[0.3em] px-10 py-4 hover:bg-white hover:text-black transition-colors duration-500"
                    >
                        Write to the Concierge
                    </a>
                </motion.div>

            </div>
        </div>
    );
};
