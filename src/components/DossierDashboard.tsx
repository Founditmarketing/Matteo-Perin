import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LightspeedService } from '../services/lightspeedService';
import { Product } from '../types';

export const DossierDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Product[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/dossier');
            } else {
                setUser(session.user);
                // Fetch mock order history tied to the user conceptually
                const products = await LightspeedService.fetchProducts();
                // Filter dummy orders just to show a subset
                setOrders(products.slice(0, 3));
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
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 animate-pulse">Decrypting Dossier...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-matteo-cream font-serif pt-32 pb-24 px-6 md:px-12 selection:bg-white selection:text-black">
            
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-white/10 pb-12 gap-8">
                    <div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-4">Level 4 Clearance</span>
                        <h1 className="text-4xl md:text-6xl font-light tracking-wide text-white">The Dossier</h1>
                        <p className="mt-4 text-white/50 font-sans text-sm tracking-widest">{user?.email}</p>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 border border-white/10 px-6 py-3 hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                    >
                        Secure Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* Measurements / Bespoke Profile (Left Column) */}
                    <div className="lg:col-span-1 space-y-12">
                        <section>
                            <h2 className="font-serif text-2xl text-white mb-8 tracking-wider">Bespoke Specifications</h2>
                            <ul className="space-y-6">
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="font-sans text-xs uppercase tracking-widest text-white/50">Shoulder Width</span>
                                    <span className="font-serif text-lg text-white">48cm</span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="font-sans text-xs uppercase tracking-widest text-white/50">Half Girth</span>
                                    <span className="font-serif text-lg text-white">52cm</span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="font-sans text-xs uppercase tracking-widest text-white/50">Sleeve Length</span>
                                    <span className="font-serif text-lg text-white">64cm</span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="font-sans text-xs uppercase tracking-widest text-white/50">Master Block</span>
                                    <span className="font-serif text-lg text-white">Napoli Drop 7</span>
                                </li>
                            </ul>
                            <p className="font-sans text-[10px] text-white/30 tracking-widest uppercase mt-6 italic">Last updated: Sept 12, 2026 (Milan)</p>
                        </section>

                        <section className="bg-white/5 border border-white/10 p-8 mt-12">
                            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-4">Priority Request</span>
                            <h3 className="font-serif text-xl tracking-wide text-white mb-6">Commission a Piece</h3>
                            <p className="font-serif text-sm text-white/60 leading-relaxed mb-8">
                                Connect directly with the Master Tailor to begin a new bespoke journey or exotic leather commission.
                            </p>
                            <button className="w-full border border-white/30 text-white font-sans text-[10px] uppercase tracking-[0.3em] py-4 hover:bg-white hover:text-black transition-colors duration-500">
                                Open Secure Comms
                            </button>
                        </section>
                    </div>

                    {/* Order History (Right Column) */}
                    <div className="lg:col-span-2">
                        <h2 className="font-serif text-2xl text-white mb-8 tracking-wider">The Archive (Recent Procurements)</h2>
                        <div className="space-y-8">
                            {orders.map((order, idx) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                                    className="group flex flex-col sm:flex-row gap-8 items-start sm:items-center bg-[#050505] border border-white/5 p-6 hover:border-white/20 transition-colors duration-500"
                                >
                                    <div className="w-24 h-32 flex-shrink-0 overflow-hidden bg-black/50">
                                        <img src={order.image} alt={order.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2">{order.category}</span>
                                        <h3 className="font-serif text-2xl tracking-wide text-white mb-3">{order.title}</h3>
                                        <span className="font-serif text-lg text-white/70">${order.price.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="font-sans text-xs uppercase tracking-widest text-green-500/80 mb-2 block">Procured</span>
                                        <span className="font-sans text-[10px] uppercase tracking-widest text-white/30">ID: #{order.id}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
