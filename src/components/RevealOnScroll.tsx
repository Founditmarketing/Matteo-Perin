import React, { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in seconds (e.g., 0.1, 0.2)
  threshold?: number; // 0 to 1
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = "",
  delay = 0,
  threshold = 0.15
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Immediate fallback check in case of fast load/scroll before hydration
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // If the top of the element is already above the viewport or inside it
      if (rect.top < window.innerHeight) {
        setIsVisible(true);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger if intersecting OR if the element's top is somehow already above the viewport bottom (scrolled past fast)
        if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0, // Trigger immediately when it enters
        rootMargin: "50px 0px 0px 0px" // Trigger slightly before it enters the viewport
      }
    );

    if (ref.current && !isVisible) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, isVisible]);

  const delayClass = delay === 0.1 ? 'delay-100' : delay === 0.2 ? 'delay-200' : delay === 0.3 ? 'delay-300' : '';
  const inlineDelay = delay > 0.3 ? { transitionDelay: `${delay}s` } : {};

  return (
    <div
      ref={ref}
      className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''} ${delayClass} ${className}`}
      style={inlineDelay}
    >
      {children}
    </div>
  );
};