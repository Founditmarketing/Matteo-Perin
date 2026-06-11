import React from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const ClientPortal: React.FC = () => {
    const navigate = useNavigate();

    // Mock Client Data
    const clientName = "Alessio Rossi";
    const commissionStatus = 65; // Percentage
    const currentStage = "Pattern Drafting";
    const location = "Milan Atelier";

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 md:px-12">

            <div className="max-w-7xl mx-auto space-y-24">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-8">
                    <div>
                        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-matteo-orange mb-2 block">
                            Client ID: MP-8842-XJ
                        </span>
                        <h1 className="font-serif text-4xl md:text-6xl text-white">
                            Welcome, Mr. {clientName.split(' ')[1]}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="font-sans text-xs tracking-widest text-gray-500 uppercase">
                            Concierge Status: <span className="text-green-500">Active</span>
                        </p>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 1. Active Commission Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                        </div>

                        <h2 className="font-serif text-2xl mb-6">Current Commission</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <img
                                src="/assets/portal_bg.jpg"
                                alt="Fabric Swatch"
                                className="w-24 h-24 object-cover rounded-full border border-white/20"
                            />
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-sans text-sm tracking-widest uppercase">Bespoke Cashmere Overcoat</h3>
                                    <span className="font-mono text-xs text-matteo-orange">EST. DELIVERY: NOV 12</span>
                                </div>

                                {/* Status Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400">
                                        <span>Measurements</span>
                                        <span>Pattern</span>
                                        <span>Fitting 1</span>
                                        <span>Final</span>
                                    </div>
                                    <div className="h-1 bg-white/10 w-full relative overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${commissionStatus}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="absolute top-0 left-0 h-full bg-matteo-orange"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-sans text-xs text-white">Current Stage: <span className="font-serif italic text-gray-400">{currentStage}</span></span>
                                        <span className="font-mono text-[10px] text-gray-600 uppercase border border-white/5 px-2 py-1">{location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Measurements / Blueprint Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-sm relative"
                    >
                        <h2 className="font-serif text-2xl mb-6">Digital Profile</h2>
                        <div className="font-mono text-xs space-y-4 text-gray-400">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>HEIGHT</span>
                                <span className="text-white">188 CM</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>CHEST</span>
                                <span className="text-white">102 CM</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>WAIST</span>
                                <span className="text-white">86 CM</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>SLEEVE (L)</span>
                                <span className="text-white">64.5 CM</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>SLEEVE (R)</span>
                                <span className="text-white">64.2 CM</span>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-3 border border-white/20 hover:bg-white hover:text-black transition-colors font-sans text-[10px] uppercase tracking-widest">
                            Update Metrics
                        </button>
                    </motion.div>

                </div>

                {/* 3. The Vault (Exclusive Allocations) */}
                <div className="space-y-12">
                    <div className="flex items-end justify-between border-b border-white/10 pb-4">
                        <h2 className="font-serif text-3xl">Private Allocations</h2>
                        <span className="font-mono text-xs text-matteo-orange">3 ITEMS AVAILABLE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PRODUCTS.slice(4, 7).map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => navigate(`/product/${item.id}`)}
                            >
                                <div className="aspect-[4/5] bg-white/5 overflow-hidden mb-4 relative">
                                    <div className="absolute top-2 left-2 bg-matteo-orange text-black font-sans text-[10px] uppercase tracking-widest px-2 py-1 z-20">
                                        Reserved
                                    </div>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                                    />
                                </div>
                                <h3 className="font-serif text-xl">{item.title}</h3>
                                <p className="font-mono text-xs text-gray-500 mt-1">{item.price ? `$${item.price.toLocaleString()}` : 'Inquire'}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Link */}
                <div className="text-center pt-20 border-t border-white/5">
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-white font-sans text-[10px] uppercase tracking-widest transition-colors">
                        Log Out
                    </button>
                </div>

            </div>
        </div>
    );
};
