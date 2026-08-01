import React, { useRef, useEffect, useState } from 'react';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number; // Base delay
  stagger?: number; // Delay between words
}

export const TextReveal: React.FC<TextRevealProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  stagger = 0.05
}) => {
  const [isVisible, setIsVisible] = useState(false);
  // prefers-reduced-motion users get static text — the word-by-word rise is
  // pure ornament and this component sits under headline copy site-wide.
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Split text into words
  const words = children.split(" ");

  if (reducedMotion) {
    return (
      <div ref={ref} className={`${className} flex flex-wrap gap-x-[0.25em] gap-y-[0.1em]`}>
        {words.map((word, i) => (
          <span key={i} className="inline-block">{word}</span>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={`${className} flex flex-wrap gap-x-[0.25em] gap-y-[0.1em]`}>
      {words.map((word, i) => (
        <span key={i} className="relative overflow-hidden inline-block">
          <span 
            className={`inline-block transform transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'translate-y-0' : 'translate-y-[110%]'
            }`}
            style={{ transitionDelay: `${delay + (i * stagger)}s` }}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
};