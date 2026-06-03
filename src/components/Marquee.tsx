import React from 'react';

export const Marquee: React.FC = () => {
  const items = [
      "Matteo Perin",
      "Made in Italy",
      "Bespoke Commissions",
      "Global Travel",
      "Milan • New York",
      "Timeless Design"
  ];
  
  return (
    <div className="bg-matteo-charcoal text-white py-5 overflow-hidden border-t border-b border-white/10 relative z-20 group cursor-default">
      {/* Container - Pauses on Hover */}
      <div className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
        {/* Repeat content enough times to fill screen + buffer */}
        {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex">
                {items.map((text, i) => (
                    <div key={`${setIndex}-${i}`} className="flex items-center">
                        <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors duration-300 px-8 md:px-12">
                            {text}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-matteo-orange"></span>
                    </div>
                ))}
            </div>
        ))}
      </div>
    </div>
  );
};