
import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15; // Slightly faster for responsiveness
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsExiting(true);
        // Trigger parent callback when animation starts opening
        onComplete();
        // Remove from DOM after animation finishes
        setTimeout(() => setShowContent(false), 1500);
      }, 800);
    }
  }, [progress, onComplete]);

  if (!showContent) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col">
        {/* Top Shutter */}
        <div 
            className={`absolute top-0 left-0 w-full bg-matteo-cream h-[50vh] transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] border-b border-matteo-charcoal/5 z-20 ${
                isExiting ? '-translate-y-full' : 'translate-y-0'
            }`}
        ></div>

        {/* Bottom Shutter */}
        <div 
            className={`absolute bottom-0 left-0 w-full bg-matteo-cream h-[50vh] transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] border-t border-matteo-charcoal/5 z-20 ${
                isExiting ? 'translate-y-full' : 'translate-y-0'
            }`}
        ></div>

        {/* Center Logo & Progress (Fades out before shutters open) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
             <div className="mb-8 transform scale-125">
                 <Logo dark={true} className="w-20 h-20" />
             </div>
             
             <div className="flex flex-col items-center gap-4">
                 <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-charcoal">
                    {progress < 100 ? 'Atelier Loading' : 'Welcome'}
                 </span>
                 <div className="w-32 h-[1px] bg-matteo-charcoal/10 relative overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-matteo-orange transition-all duration-200 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                 </div>
             </div>
        </div>
    </div>
  );
};
