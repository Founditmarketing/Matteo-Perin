import React, { useEffect, useState } from 'react';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';
import { useInquiry } from '../context/InquiryContext';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { IMAGES } from '../constants';

export const Vault: React.FC = () => {
    const { openInquiry } = useInquiry();
    const [activeItem, setActiveItem] = useState<number | null>(null);
    const [vaultItems, setVaultItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('vault_auth') === 'true';
    });
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Lusso*Atelier') {
            sessionStorage.setItem('vault_auth', 'true');
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchVault = async () => {
            try {
                const data = await ProductService.getVaultItems();
                setVaultItems(data);
                setTimeout(() => setLoading(false), 500); // Slightly longer for dramatic effect
            } catch (error) {
                console.error("Error loading vault:", error);
                setLoading(false);
            }
        };
        fetchVault();

        // Force dark mode background for this page
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = '#F9F7F2';
        };
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center"></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-serif text-white relative selection:bg-white selection:text-black overflow-hidden">
                {/* Cinematic Atmospheric Details */}
                <div className="absolute inset-0 z-0">
                    {/* noise removed */}
                    <img src={IMAGES.atelier} className="w-full h-full object-cover grayscale opacity-20 scale-105 " alt="Atmosphere" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02),_transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }}></div>
                </div>

                <div className="z-10 w-full max-w-xl px-6 text-center animate-fade-in-up">
                    <div className="mb-16 flex justify-center">
                        <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center relative ">
                            <span className="font-serif italic text-2xl drop-shadow-lg text-white/80">M</span>
                            <div className="absolute inset-[-20%] border border-white/5 rounded-full animate-spin-slow"></div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-16">
                        <h1 className="text-[10px] font-sans tracking-[0.8em] text-white/50 uppercase ml-[0.8em]">Casa Matteo Perin</h1>
                        <h2 className="text-4xl md:text-5xl tracking-widest font-light drop-shadow-2xl">The Vault</h2>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-10 mt-8">
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                placeholder="ACCESS CODE"
                                className="w-full bg-transparent border-b border-white/20 text-center text-xl md:text-3xl tracking-[0.4em] py-6 focus:outline-none focus:border-white transition-colors placeholder-white/10 uppercase"
                                autoFocus
                            />
                            {/* Animated Underline */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-700 group-focus-within:w-full"></div>
                        </div>

                        <div className="h-4 flex items-center justify-center">
                            {error && <p className="text-[#bf360c] text-[9px] tracking-[0.4em] uppercase font-sans animate-bounce">Access Denied</p>}
                        </div>

                        <button type="submit" className="group relative overflow-hidden border border-white/20 py-6 font-sans text-[10px] uppercase tracking-[0.4em] transition-all duration-700">
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                            <span className="relative z-10 text-white group-hover:text-[#050505] transition-colors duration-700">Unlock</span>
                        </button>
                    </form>

                    <div className="mt-24">
                        <Link to="/" className="inline-block border-b border-white/20 pb-2 text-[9px] font-sans uppercase tracking-[0.4em] text-white/30 hover:text-white hover:border-white transition-all duration-700">
                            Return to Surface
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-serif selection:bg-white selection:text-black">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* noise removed */}
                {/* Institutional Premium Subtle Light Leak */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02),_transparent_40%)] animate-spin-slow"></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 flex justify-between items-center">
                <Link to="/" className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-full px-6 py-3 transition-all duration-500">
                    <span className="font-serif text-lg text-white">←</span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-white font-medium">Exit Vault</span>
                </Link>
                <div className="text-right">
                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-matteo-stone block mb-1">Private Stock</span>
                    <span className="font-serif italic text-white/40">Casa Matteo Perin</span>
                </div>
            </div>

            {/* Intro */}
            <div className="h-[70vh] flex flex-col items-center justify-center relative z-10 px-6">
                <RevealOnScroll>
                    <div className="mb-12 transform scale-150 flex justify-center">
                        <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
                            <span className="font-serif italic text-2xl drop-shadow-lg text-white/90">M</span>
                        </div>
                    </div>
                    {/* Replaced weird orange gradient with pure white institutional luxury */}
                    <h1 className="font-serif text-6xl md:text-9xl text-center font-light tracking-tight text-white mb-8 drop-shadow-2xl opacity-95">
                        The Vault
                    </h1>
                    <p className="font-serif text-xl text-white/50 max-w-lg mx-auto text-center leading-relaxed">
                        Reserved for the exceptional. These items are one-of-one commissions, crafted from the rarest materials in our archive.
                    </p>
                </RevealOnScroll>

                <div className="absolute bottom-12 animate-bounce opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-pointer">
                    <span className="font-serif text-2xl">↓</span>
                </div>
            </div>

            {/* Cinematic Showcase */}
            <div className="w-full relative z-10 pb-32">
                {vaultItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="min-h-[100vh] flex flex-col justify-center relative px-6 md:px-12 lg:px-24 mb-32 border-t border-white/5 pt-32 group"
                        onMouseEnter={() => setActiveItem(item.id)}
                        onMouseLeave={() => setActiveItem(null)}
                    >

                        {/* Massive Background Typography */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none opacity-[0.02] transition-opacity duration-1000 group-hover:opacity-[0.06]">
                            <h2 className="font-serif text-[15vw] leading-none whitespace-nowrap overflow-hidden">
                                {item.category.split(' ')[1] || '001'}
                            </h2>
                        </div>

                        <div className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32 relative z-10 w-full max-w-[1920px] mx-auto`}>

                            {/* The Object (Image Stage) */}
                            <div className="w-full lg:w-3/5 h-[60vh] lg:h-[85vh] relative overflow-hidden bg-[#050505]">
                                <RevealOnScroll className="w-full h-full">
                                    <div className="absolute inset-x-8 inset-y-8 border border-white/10 z-20 pointer-events-none transition-all duration-1000 group-hover:inset-x-4 group-hover:inset-y-4 mix-blend-overlay"></div>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-[transform,filter] duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] scale-100 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 z-30 cursor-crosshair"></div>
                                    <div className="absolute bottom-8 right-8 z-40 bg-black/80  px-6 py-4 border border-white/10 shadow-2xl">
                                        <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/40 block mb-1">Status</span>
                                        <span className="font-serif italic text-white/90 text-lg">Available</span>
                                    </div>
                                </RevealOnScroll>
                            </div>

                            {/* The Dossier (Details) */}
                            <div className="w-full lg:w-2/5 flex flex-col justify-center">
                                <RevealOnScroll delay={0.2}>
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-16 h-[1px] bg-white/20"></div>
                                        <span className="font-sans text-[9px] uppercase tracking-[0.5em] text-white/40">
                                            Archive No. {item.category.split(' ')[1] || '001'}
                                        </span>
                                    </div>

                                    <h2 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-white mb-10 font-light leading-[1.1] tracking-tight drop-shadow-lg">
                                        {item.title}
                                    </h2>

                                    <p className="font-serif text-xl md:text-2xl text-white/50 leading-relaxed mb-16">
                                        {item.description}
                                    </p>

                                    {/* Spec Sheet Grid */}
                                    <div className="grid grid-cols-2 gap-y-12 gap-x-8 mb-16 border-t border-b border-white/10 py-12">
                                        <div>
                                            <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/30 block mb-3">Valuation</span>
                                            <span className="font-serif text-2xl text-white/90">${item.price.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/30 block mb-3">Edition</span>
                                            <span className="font-serif text-2xl text-white/90 italic">Pièce Unique</span>
                                        </div>
                                        <div>
                                            <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/30 block mb-3">Acquisition</span>
                                            <span className="font-serif text-2xl text-white/90 italic">Private</span>
                                        </div>
                                        <div>
                                            <span className="font-sans text-[8px] uppercase tracking-[0.4em] text-white/30 block mb-3">Location</span>
                                            <span className="font-serif text-2xl text-white/90 italic">Milan Vault</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openInquiry(item)}
                                        className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-4 font-sans text-[10px] uppercase tracking-widest hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors mt-6"
                                    >
                                        Inquire About Piece
                                    </button>
                                </RevealOnScroll>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="text-center py-40 mt-16 border-t border-white/5 relative">
                    <p className="font-serif text-white/30 text-3xl italic mb-16 relative z-10 drop-shadow-md">"Possession is an art form."</p>
                    <Link to="/" className="inline-flex items-center gap-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 hover:border-white rounded-full px-10 py-4 text-white font-sans text-xs uppercase tracking-[0.3em] transition-all duration-500 relative z-10">
                        <span className="font-serif text-lg">←</span>
                        <span>Return to Collection</span>
                    </Link>
                </div>
            </div>

        </div>
    );
};

