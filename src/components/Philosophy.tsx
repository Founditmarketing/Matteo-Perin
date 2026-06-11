
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES, TEXTS } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';
import { TextReveal } from './TextReveal';

const SECTIONS = [
    {
        id: 0,
        image: IMAGES.hero_portrait,
        title: "The Architect",
        text: "My role is simple: to interpret your character into cloth. I design for the man who knows that his image is his introduction. When we work together, we are not just making a suit; we are building your legacy.",
        sub: "Matteo Perin"
    },
    {
        id: 1,
        image: IMAGES.atelier,
        title: "The Standard",
        text: "Raised in Italy, I source materials where others compromise. Vicuña, cashmere, and leather that improves with age. You are here to acquire the exceptional, and I am here to deliver it.",
        sub: "Italian Heritage"
    },
    {
        id: 2,
        image: IMAGES.landscape_mountains,
        title: "The Result",
        text: "A wardrobe that works as hard as you do. Effortless, timeless, and strictly limited. This is the ultimate luxury: owning something made exclusively for you.",
        sub: "Your Acquisition"
    }
];

export const Philosophy: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((_, index) => {
        const element = observerRefs.current[index];
        if (element) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(index);
                    }
                },
                {
                    threshold: 0.6, // Higher threshold for more deliberate switching
                    rootMargin: "-10% 0px -10% 0px" 
                }
            );
            observer.observe(element);
            observers.push(observer);
        }
    });

    return () => {
        observers.forEach(obs => obs.disconnect());
    };
  }, []);

  return (
    <section id="philosophy" className="relative bg-matteo-cream dark:bg-matteo-black transition-colors duration-700">
      <div className="flex flex-col md:flex-row">
          
          {/* Sticky Image Side (Desktop) */}
          <div className="hidden md:block w-1/2 h-screen sticky top-0 z-0 overflow-hidden bg-matteo-charcoal">
                {SECTIONS.map((section, index) => (
                    <div 
                        key={section.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeSection === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                         {/* Slow Zoom Effect on Active Image */}
                         <img 
                            src={section.image} 
                            alt={section.title} 
                            className={`w-full h-full object-cover opacity-90 transition-transform duration-[8s] ease-linear ${activeSection === index ? 'scale-110' : 'scale-100'}`}
                        />
                         <div className="absolute inset-0 bg-black/20"></div>
                         
                         {/* Grain Overlay for Texture */}
                         <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
                    </div>
                ))}
                
                {/* Image Overlay Text/Caption */}
                <div className="absolute bottom-12 left-12 text-white z-20 mix-blend-difference">
                     <div className="overflow-hidden">
                        <span key={activeSection} className="block font-sans text-[10px] uppercase tracking-[0.25em] animate-fade-in-up">
                            0{activeSection + 1} — {SECTIONS[activeSection].sub}
                        </span>
                     </div>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="absolute right-0 top-0 h-full w-1 bg-white/5 z-20">
                    <div 
                        className="w-full bg-matteo-orange transition-all duration-700 ease-out"
                        style={{ 
                            height: `${(100 / SECTIONS.length)}%`,
                            transform: `translateY(${activeSection * 100}%)`
                        }}
                    />
                </div>
          </div>

          {/* Scrolling Text Side */}
          <div className="w-full md:w-1/2 relative z-10 bg-matteo-cream dark:bg-matteo-black transition-colors duration-700">
             
             {/* Mobile Image Stack (Visible only on mobile) */}
             <div className="md:hidden">
                 <div className="h-[50vh] w-full sticky top-16 z-0">
                     <img 
                        src={SECTIONS[activeSection].image} 
                        className="w-full h-full object-cover transition-opacity duration-500" 
                        alt="Philosophy" 
                    />
                 </div>
             </div>

             <div className="px-8 md:px-24 lg:px-32 flex flex-col justify-start min-h-screen relative z-10 bg-matteo-cream dark:bg-matteo-black md:bg-transparent mt-[-10vh] md:mt-0 pt-24 md:pt-48 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none transition-colors duration-700">
                <RevealOnScroll className="mb-24 md:mb-32">
                     <div className="flex items-center gap-4 mb-6">
                         <span className="w-8 h-[1px] bg-matteo-charcoal dark:bg-white"></span>
                         <span className="font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-matteo-stone">The Designer</span>
                     </div>
                     <TextReveal className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream leading-[1.1] font-light">
                        Matteo Perin.
                     </TextReveal>
                </RevealOnScroll>
                
                <div className="space-y-32 md:space-y-64 pb-32">
                    {SECTIONS.map((section, index) => (
                        <div 
                            key={section.id} 
                            ref={(el) => { observerRefs.current[index] = el; }}
                            className={`transition-all duration-1000 ease-out ${activeSection === index ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-12'}`}
                        >
                            <span className="font-sans text-[10px] text-matteo-orange uppercase tracking-[0.25em] mb-6 block border-l-2 border-matteo-orange pl-4">
                                0{index + 1}. {section.sub}
                            </span>
                            <h3 className="font-serif text-3xl md:text-4xl text-matteo-charcoal dark:text-white mb-8 leading-tight">{section.title}</h3>
                            <p className="font-serif text-lg md:text-xl text-matteo-charcoal/70 dark:text-gray-400 leading-relaxed font-light max-w-lg">
                                {section.text}
                            </p>
                        </div>
                    ))}
                </div>
                
                <RevealOnScroll className="flex items-center gap-8 border-t border-matteo-charcoal/10 dark:border-white/10 pt-12">
                     <a 
                       href="https://jhstylemagazine.com/from-the-dolomites-to-deloney-avenue" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="group flex items-center gap-4 text-matteo-charcoal dark:text-white transition-colors"
                     >
                         <div className="w-12 h-12 rounded-full border border-matteo-charcoal/20 dark:border-white/20 flex items-center justify-center group-hover:bg-matteo-charcoal dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                             <span className="text-xl leading-none mb-1">↗</span>
                         </div>
                         <span className="font-sans text-[10px] uppercase tracking-[0.2em] group-hover:text-matteo-orange transition-colors">Read Full Profile</span>
                     </a>
                </RevealOnScroll>
             </div>
          </div>
      </div>
    </section>
  );
};
