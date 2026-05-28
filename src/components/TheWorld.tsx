
import React, { useState, useEffect } from 'react';
import { IMAGES } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';

interface Pillar {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    context: string;
    time: string;
}

const PILLARS: Pillar[] = [
    {
        id: 1,
        title: "Travel",
        subtitle: "Arrive Impeccable",
        description: "Travel in comfort. Wrinkle-resistant wools and breathable layers designed for the long haul. Step off the plane looking exactly as you did when you boarded.",
        image: IMAGES.matteo_walking,
        context: "Tarmac, New York",
        time: "07:00 AM"
    },
    {
        id: 2,
        title: "Business",
        subtitle: "Command Presence",
        description: "Sharp tailoring designed for authority. In the boardroom, your clothes should speak before you do. Structure that allows for movement; style that commands respect.",
        image: IMAGES.atelier, 
        context: "Milan, Italy",
        time: "02:00 PM"
    },
    {
        id: 3,
        title: "Leisure",
        subtitle: "Uncompromising Comfort",
        description: "Relax in luxury. Vicuña and raw silk offer a tactile respite from the world. Clothing engineered for downtime, without sacrificing elegance.",
        image: IMAGES.landscape_mountains,
        context: "Amangani, Jackson Hole",
        time: "08:00 PM"
    }
];

export const TheWorld: React.FC = () => {
  const [activeId, setActiveId] = useState(1);
  const [isHoveringList, setIsHoveringList] = useState(false);

  // Auto-rotate if user isn't interacting (optional, good for discovery)
  useEffect(() => {
    if (isHoveringList) return;
    const interval = setInterval(() => {
        setActiveId(prev => prev === 3 ? 1 : prev + 1);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [isHoveringList]);

  const activePillar = PILLARS.find(p => p.id === activeId) || PILLARS[0];

  return (
    <section id="lifestyle" className="relative w-full h-screen min-h-[800px] overflow-hidden bg-matteo-charcoal text-white">
       
       {/* 1. Background Layers (Cross-Fade) */}
       {PILLARS.map((pillar) => (
           <div 
                key={pillar.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeId === pillar.id ? 'opacity-50 z-10' : 'opacity-0 z-0'}`}
           >
               <img 
                    src={pillar.image} 
                    alt={pillar.title} 
                    className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${activeId === pillar.id ? 'scale-110' : 'scale-100'}`}
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
           </div>
       ))}

       {/* 2. Content Container */}
       <div className="relative z-20 h-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center">
           
           {/* Left: Navigation (Titles) */}
           <div 
                className="w-full md:w-1/2 flex flex-col justify-center h-full pt-24 md:pt-0"
                onMouseEnter={() => setIsHoveringList(true)}
                onMouseLeave={() => setIsHoveringList(false)}
            >
               <div className="mb-12">
                   <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange block mb-2 animate-fade-in-up">
                       Dressing for Occasion
                   </span>
               </div>

               <div className="flex flex-col gap-6 md:gap-8">
                   {PILLARS.map((pillar) => (
                       <button
                           key={pillar.id}
                           onClick={() => setActiveId(pillar.id)}
                           onMouseEnter={() => setActiveId(pillar.id)}
                           className="group text-left relative focus:outline-none"
                       >
                           {/* The "Hollow" to "Solid" Text Effect */}
                           <span 
                                className={`
                                    block font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-none transition-all duration-500 ease-out
                                    ${activeId === pillar.id 
                                        ? 'text-white translate-x-12 opacity-100' 
                                        : 'text-transparent opacity-40 hover:opacity-100'
                                    }
                                `}
                                style={{ 
                                    WebkitTextStroke: activeId === pillar.id ? '0px' : '1px rgba(255,255,255,0.8)' 
                                }}
                           >
                               {pillar.title}
                           </span>

                           {/* Active Indicator Line */}
                           <span 
                                className={`
                                    absolute top-1/2 left-0 w-8 h-[1px] bg-matteo-orange transition-all duration-500
                                    ${activeId === pillar.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                                `}
                           ></span>
                       </button>
                   ))}
               </div>
           </div>

           {/* Right: Active Context Detail */}
           <div className="w-full md:w-1/2 h-full flex flex-col justify-end md:justify-center pb-12 md:pb-0 md:pl-24">
               {/* We use a key here to trigger a re-mount animation on change */}
               <div key={activeId} className="animate-fade-in-up">
                   
                   {/* Context HUD */}
                   <div className="flex items-center gap-6 mb-8 border-b border-white/20 pb-8">
                       <div>
                           <span className="font-sans text-[9px] uppercase tracking-widest text-white/50 block mb-1">Location</span>
                           <span className="font-sans text-sm uppercase tracking-widest text-white">{activePillar.context}</span>
                       </div>
                       <div className="h-8 w-[1px] bg-white/20"></div>
                       <div>
                           <span className="font-sans text-[9px] uppercase tracking-widest text-white/50 block mb-1">Local Time</span>
                           <span className="font-sans text-sm uppercase tracking-widest text-white">{activePillar.time}</span>
                       </div>
                   </div>

                   <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">
                       {activePillar.subtitle}
                   </h3>
                   <p className="font-serif text-lg text-white/70 leading-relaxed max-w-md mb-12">
                       {activePillar.description}
                   </p>

                   <button className="group flex items-center gap-4 text-white hover:text-matteo-orange transition-colors">
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-matteo-orange transition-colors">
                            <span className="text-xl leading-none mb-1">&rarr;</span>
                        </div>
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em]">Shop Collection</span>
                   </button>
               </div>
           </div>

       </div>

       {/* Progress Bar (Bottom) */}
       <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
           <div 
                className="h-full bg-matteo-orange transition-all duration-1000 ease-linear"
                style={{ width: `${(activeId / 3) * 100}%` }}
           ></div>
       </div>

    </section>
  );
};
