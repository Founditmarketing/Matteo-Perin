import React from 'react';

export const Logo: React.FC<{ className?: string, dark?: boolean }> = ({ className = "w-16 h-16", dark = false }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        {/* Text Ring - Rotate Clockwise */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow">
            <path id="curve" d="M 28,100 A 72,72 0 1,1 172,100 A 72,72 0 1,1 28,100" fill="none" />
            <text width="200" className="text-[16px] uppercase font-serif tracking-[0.25em] font-medium" fill={dark ? "#1C1C1C" : "#FFFFFF"}>
                <textPath xlinkHref="#curve" startOffset="0%" textAnchor="middle">
                   Matteo Perin • Made in Italy • Matteo Perin •
                </textPath>
            </text>
        </svg>
        
        {/* Center Static Dot */}
        <div className={`absolute w-1.5 h-1.5 rounded-full ${dark ? 'bg-matteo-orange' : 'bg-matteo-orange'}`} />
    </div>
  );
};