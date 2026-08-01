import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// The portal shows an awaiting-activation state: no client dossier is
// rendered until the concierge opens one for the visitor. Nothing on this
// page may display another client's information.
export const ClientPortal: React.FC = () => {
    return (
        <div className="min-h-screen bg-matteo-black text-matteo-cream font-serif pt-32 pb-24 px-6 md:px-12 selection:bg-white selection:text-black">
            <Helmet>
                <title>Client Portal | Matteo Perin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-white/10 pb-12 mb-16"
                >
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium block mb-6">
                        Access Confirmed
                    </span>
                    <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight text-white leading-[1.1]">
                        Welcome to the private side of the house
                    </h1>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <p className="font-serif text-xl md:text-2xl text-white/60 leading-relaxed mb-10">
                        Your dossier is being prepared by the concierge. Once it is opened,
                        this page will hold your measurements, the progress of your
                        commissions, and pieces reserved for your consideration.
                    </p>
                    <p className="font-serif italic text-[15px] text-white/60 leading-relaxed mb-16">
                        Nothing is required of you in the meantime — the concierge will
                        write to you when your dossier is ready.
                    </p>
                    {/* NOTE FOR THE HOUSE: dossiers are opened by the concierge by hand;
                        no client-facing timeline is promised here until one exists. */}

                    {/* Concierge Contact */}
                    <div className="border border-white/10 p-8 md:p-12 mb-20">
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium block mb-4">
                            The Concierge
                        </span>
                        <p className="font-serif text-lg text-white/60 leading-relaxed mb-6">
                            To begin sooner — or to speak with the atelier directly — write to us.
                        </p>
                        <a
                            href="mailto:concierge@matteoperin.com"
                            className="inline-block font-serif text-xl md:text-2xl text-white border-b border-white/20 pb-1 hover:border-white transition-colors duration-500"
                        >
                            concierge@matteoperin.com
                        </a>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center pt-12 border-t border-white/5">
                        <Link
                            to="/"
                            className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors duration-500"
                        >
                            Return to the House
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
