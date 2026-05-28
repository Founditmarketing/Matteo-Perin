
import React, { useRef, useEffect, useCallback } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  speed?: number; // 0 to 1 (0 = no movement, 1 = max movement)
  scale?: number; // Base scale (must be > 1 to avoid edges)
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  speed = 0.15,
  scale = 1.15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const ticking = useRef(false);
  
  const updateParallax = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate only if in viewport (with buffer)
    if (rect.top < windowHeight && rect.bottom > 0) {
      const viewportCenter = windowHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Move image opposite to scroll direction for depth
      const translateY = distanceFromCenter * speed;
      
      imgRef.current.style.transform = `scale(${scale}) translate3d(0, ${translateY}px, 0)`;
    }
  }, [speed, scale]);

  useEffect(() => {
    // Disable parallax on mobile — saves significant GPU/CPU
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          updateParallax();
          ticking.current = false;
        });
      }
    };

    // Initial position
    updateParallax();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateParallax]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      <img 
        ref={imgRef}
        src={src} 
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover will-change-transform ${className}`}
        style={{ transform: `scale(${scale})` }} 
      />
    </div>
  );
};
