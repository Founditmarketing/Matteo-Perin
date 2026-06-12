import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';


// ═══════════════════════════════════════════════════════════════
// MATTEO PERIN — FURNITURE COLLECTION
// "Sofa Design" — Italian Luxury Living, Curated by Matteo Perin
// ═══════════════════════════════════════════════════════════════

// --- Collection Data ---
interface FurniturePiece {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  materials: string[];
  dimensions?: string;
}

const FURNITURE_CATEGORIES = [
  { id: 'all', label: 'All Pieces' },
  { id: 'sofas', label: 'Sofas & Sectionals' },
  { id: 'chairs', label: 'Chairs & Armchairs' },
  { id: 'tables', label: 'Tables' },
  { id: 'dining', label: 'Dining' },
  { id: 'accents', label: 'Accents & Details' },
];

const COLLECTION: FurniturePiece[] = [
  // ── SOFAS & SECTIONALS ──────────────────────────────────────
  {
    id: 'orfeo-sculptural',
    name: 'Orfeo',
    category: 'sofas',
    tagline: 'Heritage Leather & Corduroy',
    description: 'The Orfeo pairs rich cognac leather arms with deep slate corduroy ribbing for a sofa that balances rugged texture with refined Italian tailoring. Clean lines, generous proportions, and meticulous stitching make it the anchor of any living space.',
    heroImage: '/assets/furniture/orfeo-new-3.webp',
    galleryImages: ['/assets/furniture/orfeo-new-2.webp', '/assets/furniture/orfeo-new-1.webp', '/assets/furniture/orfeo-new-4.webp'],
    materials: ['Full-Grain Cognac Leather', 'Ribbed Corduroy', 'Brushed Steel Legs'],
  },

  {
    id: 'terra-modular',
    name: 'Terra',
    category: 'sofas',
    tagline: 'Modular Earth Tones',
    description: 'A warm, sculptural modular system in rich terracotta. Each module features soft rounded edges and an integrated marble tray for effortless entertaining — designed to be rearranged in infinite configurations.',
    heroImage: '/assets/furniture/sofa_007.webp',
    galleryImages: ['/assets/furniture/sofa_071.webp'],
    materials: ['Italian Linen', 'Walnut Shelf', 'Marble Tray'],
  },
  {
    id: 'panorama-quilted',
    name: 'Panorama',
    category: 'sofas',
    tagline: 'The Quilted Grand Sectional',
    description: 'Inspired by the sweeping horizons of Lake Garda, the Panorama commands any living space with its diamond-quilted upholstery, generous chaise, and cognac leather accent panels. A masterpiece of Italian comfort.',
    heroImage: '/assets/furniture/sofa_079.webp',
    galleryImages: ['/assets/furniture/sofa_080.webp'],
    materials: ['Quilted Performance Fabric', 'Cognac Leather Accent', 'Slim Metal Legs'],
  },
  {
    id: 'rigato-sectional',
    name: 'Rigato',
    category: 'sofas',
    tagline: 'Channel-Tufted Luxury',
    description: 'Vertical channel-tufting runs like architectural columns across the Rigato sectional, creating a sense of rhythm and depth. Available in ivory, charcoal, and custom colourways.',
    heroImage: '/assets/furniture/sofa_073.webp',
    galleryImages: ['/assets/furniture/sofa_074.webp'],
    materials: ['Textured Weave', 'Slim Metal Legs', 'High-Resilience Core'],
  },
  {
    id: 'sala-grande',
    name: 'Sala Grande',
    category: 'sofas',
    tagline: 'The Living Room Statement',
    description: 'Our largest modular composition — a sweeping L-shaped sectional paired with patterned ottomans, a walnut side table, and a brass-framed coffee table. Designed for grand living rooms where family and guests gather.',
    heroImage: '/assets/furniture/sofa_076.webp',
    galleryImages: ['/assets/furniture/sofa_077.webp'],
    materials: ['Textured Linen', 'Walnut Side Table', 'Brass Coffee Table'],
  },
  {
    id: 'modulo-sofa',
    name: 'Modulo',
    category: 'sofas',
    tagline: 'Integrated Design',
    description: 'Clean lines meet functional luxury. The Modulo features a built-in walnut side shelf that seamlessly integrates into the armrest — blurring the boundary between sofa and architecture.',
    heroImage: '/assets/furniture/sofa_013.webp',
    galleryImages: ['/assets/furniture/sofa_020.webp'],
    materials: ['Italian Linen', 'Walnut Shelf', 'Mushroom Lamp Accent'],
  },

  // ── CHAIRS & ARMCHAIRS ──────────────────────────────────────
  {
    id: 'verona-swivel',
    name: 'Verona',
    category: 'chairs',
    tagline: 'The Quilted Throne',
    description: 'An ode to the artisan workshops of Verona. Hand-quilted diamond patterns wrap this swivel armchair in tactile camel velvet, perched on a sculptural brushed gold star base.',
    heroImage: '/assets/furniture/sofa_040.webp',
    galleryImages: ['/assets/furniture/sofa_091.webp'],
    materials: ['Quilted Velvet', 'Brushed Gold Base', 'Swivel Mechanism'],
  },
  {
    id: 'rosetta-swivel',
    name: 'Rosetta',
    category: 'chairs',
    tagline: 'Tweed Elegance',
    description: 'A refined swivel armchair in blush tweed with a contrasting leather back shell. The Rosetta is equally at home in a living room, a private study, or a boutique hotel lobby.',
    heroImage: '/assets/furniture/sofa_034.webp',
    galleryImages: ['/assets/furniture/sofa_085.webp', '/assets/furniture/sofa_089.webp'],
    materials: ['Bouclé Tweed', 'Cognac Leather Shell', 'Pedestal Base'],
  },
  {
    id: 'metropolitano-lounge',
    name: 'Metropolitano',
    category: 'chairs',
    tagline: 'Urban Bouclé',
    description: 'A pair of dark bouclé lounge chairs with angular metal frames and brass-tipped feet. Designed for contemporary spaces that demand visual weight without bulk.',
    heroImage: '/assets/furniture/sofa_037.webp',
    galleryImages: ['/assets/furniture/sofa_090.webp'],
    materials: ['Dark Bouclé', 'Blackened Steel', 'Brass Ferrules'],
  },
  {
    id: 'ombra-armchair',
    name: 'Ombra',
    category: 'chairs',
    tagline: 'Sculptural Shadow',
    description: 'Wrapped in soft grey velvet with a cocoon-like winged silhouette, the Ombra is a contemplative armchair for moments of solitude. Paired with a turned wood accent table.',
    heroImage: '/assets/furniture/sofa_031.webp',
    galleryImages: ['/assets/furniture/sofa_088.webp'],
    materials: ['Grey Velvet', 'Natural Walnut Legs', 'Turned Wood Table'],
  },

  // ── DINING ──────────────────────────────────────────────────
  {
    id: 'lago-dining',
    name: 'Lago',
    category: 'dining',
    tagline: 'Lakeside Dining',
    description: 'Inspired by the colours of the Italian lakes, this dining ensemble pairs a terracotta-lacquered table with enveloping velvet chairs — all framed against a breathtaking panoramic view.',
    heroImage: '/assets/furniture/sofa_046.webp',
    galleryImages: ['/assets/furniture/sofa_094.webp'],
    materials: ['Terracotta Lacquer', 'Pearl Velvet', 'Dark Oak Legs'],
  },
  {
    id: 'eleganza-quilted-dining',
    name: 'Eleganza',
    category: 'dining',
    tagline: 'Quilted Dining',
    description: 'Diamond-quilted dining chairs with sculptural open-back silhouettes surrounding a glass-topped table. Where Italian haute couture meets haute cuisine.',
    heroImage: '/assets/furniture/sofa_096.webp',
    galleryImages: ['/assets/furniture/sofa_098.webp'],
    materials: ['Quilted Wool', 'Tempered Glass', 'Ash Wood Frame'],
  },
  {
    id: 'epoca-dining',
    name: 'Epoca',
    category: 'dining',
    tagline: 'Organic Silhouette',
    description: 'Sculpted from solid walnut with a cutaway back and organic flowing lines, the Epoca dining chair transforms every meal into a ceremony of modern Italian design.',
    heroImage: '/assets/furniture/sofa_097.webp',
    galleryImages: ['/assets/furniture/sofa_093.webp'],
    materials: ['Walnut Frame', 'Performance Leather', 'Steel Reinforcement'],
  },

  // ── SOFAS (Additional) ──────────────────────────────────────
  {
    id: 'solenne-daybed',
    name: 'Solenne',
    category: 'sofas',
    tagline: 'Channel-Tufted Daybed',
    description: 'A sculptural chaise-sectional in cream textured weave with distinctive channel tufting and polished chrome legs. The elongated silhouette and ribbed texture create a refined retreat for reading, resting, and quiet contemplation.',
    heroImage: '/assets/furniture/sofa_066.webp',
    galleryImages: [],
    materials: ['Cream Textured Weave', 'Polished Chrome Legs', 'Channel-Tufted Cushion'],
  },
  {
    id: 'cerchio-nesting',
    name: 'Cerchio',
    category: 'tables',
    tagline: 'Nesting Circles',
    description: 'Three nesting coffee tables in Carrara marble, walnut, and brushed brass — each at a different height. The organic overlap creates an ever-changing sculptural centrepiece.',
    heroImage: '/assets/furniture/sofa_100.webp',
    galleryImages: [],
    materials: ['Carrara Marble', 'Walnut Veneer', 'Brushed Brass Pedestal'],
  },
  {
    id: 'accento-side-table',
    name: 'Accento',
    category: 'tables',
    tagline: 'Marble & Steel',
    description: 'A minimalist C-shaped side table in Carrara marble with a geometric steel base. Designed to slide effortlessly over any sofa arm — where function meets Italian sculpture.',
    heroImage: '/assets/furniture/sofa_099.webp',
    galleryImages: [],
    materials: ['Carrara Marble', 'Blackened Steel', 'Non-Scratch Pads'],
  },

  // ── ACCENTS & DETAILS ──────────────────────────────────────
  {
    id: 'atelier-craftsmanship',
    name: "L'Atelier",
    category: 'accents',
    tagline: "The Artisan's Hand",
    description: 'A glimpse into the Matteo Perin workshop in Verona — where master upholsterers hand-cut, quilt, and stitch every surface. Each piece carries the invisible signature of the hands that made it.',
    heroImage: '/assets/furniture/sofa_004.webp',
    galleryImages: ['/assets/furniture/sofa_065.webp', '/assets/furniture/sofa_019.webp'],
    materials: ['Hand-Guided Stitching', 'Italian Fabrics', 'Artisan Heritage'],
  },
];

// Helper: get the optimized -lg.webp URL for direct img src usage
const getOptimizedUrl = (src: string, size: 'sm' | 'md' | 'lg' = 'lg'): string => {
  if (!src || !src.endsWith('.webp')) return src;
  const dir = src.substring(0, src.lastIndexOf('/'));
  const filename = src.substring(src.lastIndexOf('/') + 1);
  const nameBase = filename.substring(0, filename.lastIndexOf('.'));
  return `${dir}/${nameBase}-${size}.webp`;
};



// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK — Works with Lenis smooth scroll
// ═══════════════════════════════════════════════════════════════

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}


// Reveal wrapper component
const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

const fadeUpVariant = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 }
  }
};

const scaleReveal = {
  hidden: { opacity: 1, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};


// ═══════════════════════════════════════════════════════════════
// HERO SECTION — Cinematic Full-Bleed Opening
// ═══════════════════════════════════════════════════════════════

// Desktop (landscape 16:9) and Mobile (portrait 9:16) hero video pools
const HERO_VIDEOS_DESKTOP = [
  '/assets/casa-hero-latest.mp4',
];
const HERO_VIDEOS_MOBILE = [
  '/assets/casa-hero-latest.mp4',
];

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  
  // Disable heavy video parallax on mobile for iPhone/Safari performance
  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  
  const y = isMobileInitial ? 0 : parallaxY;
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = isMobileInitial ? 1 : parallaxScale;
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);

  // Pick the right video pool based on screen width, random within pool
  const heroVideo = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pool = isMobile ? HERO_VIDEOS_MOBILE : HERO_VIDEOS_DESKTOP;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const handleVideoLoaded = () => {
      if (videoRef.current) {
          videoRef.current.playbackRate = 0.85;
          // iOS often needs an explicit play() nudge
          const p = videoRef.current.play();
          if (p !== undefined) p.catch(() => {});
      }
  };

  return (
    <section ref={heroRef} className="relative h-[100dvh] overflow-hidden" id="furniture-hero">
      {/* Video Background with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y, scale, WebkitTransform: "translateZ(0)" }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          // @ts-ignore — webkit attribute needed for iOS inline playback
          webkit-playsinline="true"
          preload="auto"
          poster="/assets/furniture/sofa_007.webp"
          onLoadedData={handleVideoLoaded}
          style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
          className="w-full h-full object-cover object-center"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </motion.div>

      {/* Hero Content */}
      <motion.div 
        className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-8 md:px-16 lg:px-24"
        style={{ y: textY, opacity }}
      >
        <motion.div 
          className="max-w-[1400px]"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Collection Badge */}
          <motion.div variants={fadeUpVariant} className="mb-6">
            <span className="inline-block px-4 py-1.5 border border-white/30 text-white/80 text-[10px] font-sans uppercase tracking-[0.3em]">
              New Collection 2026
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={fadeUpVariant}
            className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] xl:text-[8rem] text-white leading-[0.9] tracking-tight mb-6"
          >
            Sofa<br />
            <span className="italic font-light">Design</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeUpVariant}
            className="font-sans text-base md:text-lg text-white/85 max-w-lg tracking-wide leading-relaxed font-light"
          >
            A curated collection of Italian luxury living — where sculptural form meets 
            uncompromising comfort. Each piece is handcrafted in Verona with materials 
            sourced from the world's finest mills.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUpVariant} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <button 
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-3 px-6 py-3 border border-white/40 hover:border-matteo-orange hover:bg-matteo-orange/10 font-sans text-[11px] uppercase tracking-[0.25em] text-white hover:text-matteo-orange transition-all duration-500"
            >
              <span>Explore Collection</span>
              <span className="block w-6 h-[1px] bg-white group-hover:w-10 group-hover:bg-matteo-orange transition-all duration-500" />
            </button>
            <Link 
              to="/bespoke" state={{ inquire: true, look: "Furniture Collection" }}
              className="inline-flex items-center px-6 py-3 border border-white/20 hover:border-white/50 font-sans text-[11px] uppercase tracking-[0.25em] text-white/80 hover:text-white transition-all duration-500"
            >
              Request Bespoke
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{ opacity }}
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
      </motion.div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// EDITORIAL QUOTE — Philosophy Section
// ═══════════════════════════════════════════════════════════════

const PhilosophySection: React.FC = () => {
  const ref = useRef(null);
  return (
    <section ref={ref} className="py-20 md:py-28 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black relative overflow-hidden">
      {/* Subtle decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent to-matteo-charcoal/20 dark:to-white/10" />

      <div className="max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-charcoal/80 dark:text-matteo-cream/80 mb-12">
            The Matteo Perin Philosophy
          </p>

          <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.15] text-matteo-charcoal dark:text-matteo-cream tracking-tight">
            "True <em>craftsmanship</em> does not occupy space{' '}
            <br className="hidden md:block" />
            — it <em>transforms</em> it."
          </blockquote>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="w-12 h-[1px] bg-matteo-charcoal/20 dark:bg-white/20" />
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-matteo-charcoal/80 dark:text-matteo-cream/80">
              Matteo Perin
            </p>
            <div className="w-12 h-[1px] bg-matteo-charcoal/20 dark:bg-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// EDITORIAL SPLIT — Two Column Image + Text Reveal
// ═══════════════════════════════════════════════════════════════

const EditorialSplit: React.FC<{
  image: string;
  title: string;
  subtitle: string;
  text: string;
  reverse?: boolean;
  cta?: string;
}> = ({ image, title, subtitle, text, reverse, cta }) => {
  const ref = useRef(null);
  return (
    <section ref={ref} className="py-16 md:py-0">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[80vh]`}>
        {/* Image Side */}
        <motion.div
          className="w-full md:w-[55%] relative overflow-hidden"
          initial={{ opacity: 1, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden group">
            <ResponsiveImage
              baseSrc={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105"
            />
          </div>
        </motion.div>

        {/* Text Side */}
        <div className={`w-full md:w-[45%] flex items-center ${reverse ? 'md:pr-16 lg:pr-24' : 'md:pl-16 lg:pl-24'} px-8 py-16 md:py-32`}>
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-charcoal/80 dark:text-matteo-cream/80 block mb-4">
              {subtitle}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-matteo-charcoal dark:text-matteo-cream leading-[1.05] tracking-tight mb-8">
              {title}
            </h2>
            <p className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-matteo-cream/80 leading-relaxed mb-10">
              {text}
            </p>
            {cta && (
              <button
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.25em] text-matteo-charcoal dark:text-matteo-cream hover:text-matteo-orange transition-colors duration-500"
              >
                <span>{cta}</span>
                <span className="block w-8 h-[1px] bg-current group-hover:w-12 transition-all duration-500" />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// MASONRY-STYLE IMAGE GALLERY WITH PARALLAX
// ═══════════════════════════════════════════════════════════════

const ParallaxImage: React.FC<{ src: string; alt: string; className?: string; speed?: number }> = ({ 
  src, alt, className = '', speed = 0.1 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={{ opacity: 1, scale: 1 }}
      whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div className="w-full h-full" style={{ y }}>
        <ResponsiveImage
          baseSrc={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-[3s] ease-out hover:scale-110"
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  );
};

const CinematicGallery: React.FC = () => {
  const ref = useRef(null);
  return (
    <section ref={ref} className="py-12 md:py-20 px-4 md:px-8 lg:px-16 bg-matteo-cream dark:bg-matteo-black">
      <motion.div
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.8 }}
        className="max-w-[1600px] mx-auto"
      >
        <div className="text-center mb-10 md:mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-charcoal/80 dark:text-matteo-cream/80 mb-4">
            Craftsmanship in Detail
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream tracking-tight">
            The Atelier
          </h2>
        </div>

        {/* Asymmetric Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
          {/* Row 1 */}
          <ParallaxImage
            src="/assets/furniture/sofa_057.webp"
            alt="Channel-tufted sectional sofa in ivory"
            className="col-span-2 md:col-span-7 aspect-[16/9]"
            speed={0.05}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_059.webp"
            alt="Quilted camel swivel armchairs"
            className="col-span-1 md:col-span-5 aspect-[4/5] md:aspect-[16/9]"
            speed={0.08}
          />

          {/* Row 2 */}
          <ParallaxImage
            src="/assets/furniture/sofa_095.webp"
            alt="Master artisan at the sewing machine"
            className="col-span-1 md:col-span-4 aspect-square"
            speed={0.12}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_023.webp"
            alt="Grand living room with L-shaped sectional"
            className="col-span-2 md:col-span-8 aspect-[16/9] md:aspect-[2/1]"
            speed={0.04}
          />

          {/* Row 3 */}
          <ParallaxImage
            src="/assets/furniture/sofa_070.webp"
            alt="Sculptural accent chair in cream"
            className="col-span-1 md:col-span-5 aspect-square md:aspect-[4/3]"
            speed={0.1}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_095.webp"
            alt="Contemporary modular arrangement"
            className="col-span-1 md:col-span-7 aspect-[4/5] md:aspect-[4/3]"
            speed={0.06}
          />
        </div>
      </motion.div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// INTERACTIVE COLLECTION GRID WITH CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════

const CollectionCard: React.FC<{ piece: FurniturePiece; index: number; onOpen: () => void }> = ({ piece, index, onOpen }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div onClick={onOpen}>
      <motion.div
        ref={ref}
        className="group cursor-pointer"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-matteo-charcoal/5 dark:bg-white/5 mb-5">
          {/* Hero image */}
          <img
            src={getOptimizedUrl(piece.heroImage, 'md')}
            alt={piece.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/70 mb-2">
                {piece.tagline}
              </p>
              <p className="font-sans text-xs text-white/60 leading-relaxed line-clamp-2 mb-4">
                {piece.description}
              </p>
              <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-matteo-orange">
                <span>View Full Gallery</span>
                <span className="block w-5 h-[1px] bg-matteo-orange group-hover:w-8 transition-all duration-500" />
              </span>
            </div>
          </div>

          {/* Gallery indicator */}
          {piece.galleryImages.length > 0 && (
          <div className="absolute bottom-4 right-4 flex gap-1.5 transition-opacity duration-500 opacity-100">
            {[piece.heroImage, ...piece.galleryImages].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? 'bg-white scale-110' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          )}

          {/* Category Tag */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-[10px] font-sans uppercase tracking-[0.2em]">
              {FURNITURE_CATEGORIES.find(c => c.id === piece.category)?.label || piece.category}
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="px-1">
          <h3 className="font-serif text-xl md:text-2xl text-matteo-charcoal dark:text-matteo-cream group-hover:text-matteo-orange transition-colors duration-500 mb-1">
            {piece.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            {piece.materials.slice(0, 2).map((mat, i) => (
              <span key={i} className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-charcoal/80 dark:text-matteo-cream/80">
                {mat}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CollectionGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxPiece, setLightboxPiece] = useState<FurniturePiece | null>(null);
  const ref = useRef(null);
  const filteredCollection = activeCategory === 'all'
    ? COLLECTION
    : COLLECTION.filter(p => p.category === activeCategory);

  return (
    <section ref={ref} id="collection" className="py-16 md:py-24 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-charcoal/80 dark:text-matteo-cream/80 mb-4">
            The Full Collection
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-matteo-cream tracking-tight">
            Every Piece, a Statement
          </h2>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 md:gap-6 mb-10 md:mb-14"
        >
          {FURNITURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              aria-label={`Filter by ${cat.label}`}
              className={`font-sans text-[10px] uppercase tracking-[0.25em] px-4 py-2 border transition-all duration-500 ${
                activeCategory === cat.id
                  ? 'border-matteo-orange text-matteo-orange bg-matteo-orange/5'
                  : 'border-matteo-charcoal/10 dark:border-white/10 text-matteo-charcoal/80 dark:text-matteo-cream/80 hover:text-matteo-charcoal dark:hover:text-matteo-cream hover:border-matteo-charcoal/30 dark:hover:border-white/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12"
          >
            {filteredCollection.map((piece, index) => (
              <CollectionCard key={piece.id} piece={piece} index={index} onOpen={() => setLightboxPiece(piece)} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Lightbox */}
        {lightboxPiece && (
          <LightboxModal piece={lightboxPiece} onClose={() => setLightboxPiece(null)} />
        )}
      </div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// HORIZONTAL SCROLLING MATERIALS SHOWCASE
// ═══════════════════════════════════════════════════════════════

const materialsData = [
  { name: 'Italian Linen', desc: 'Sourced from historic Biella mills, our linens are woven to withstand generations of use.', image: '/assets/furniture/sofa_017.webp' },
  { name: 'Bouclé Wool', desc: 'Looped yarns create a rich, textural surface that invites touch and transforms with light.', image: '/assets/furniture/sofa_092.webp' },
  { name: 'Carrara Marble', desc: 'Hand-selected slabs from the quarries of Tuscany, each with a unique vein signature.', image: '/assets/furniture/sofa_101.webp' },
  { name: 'Walnut & Oak', desc: 'Sustainably harvested European hardwoods, finished with traditional hand-rubbed techniques.', image: '/assets/furniture/sofa_016.webp' },
  { name: 'Brushed Brass', desc: 'Every metal accent is individually brushed and sealed, developing a living patina over time.', image: '/assets/furniture/sofa_058.webp' },
  { name: 'Quilted Suede', desc: 'Diamond-quilted Italian suede with hand-guided stitching and a buttery soft hand.', image: '/assets/furniture/sofa_043.webp' },
];

const MaterialsShowcase: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const ref = useRef(null);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUpOrLeave = useCallback(() => setIsDragging(false), []);

  return (
    <section ref={ref} className="py-16 md:py-24 bg-matteo-charcoal dark:bg-[#0a0a0a] overflow-hidden">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-16 lg:px-24 mb-16"
      >
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4">
              Material World
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight">
              Textures & Materials
            </h2>
          </div>
          <p className="font-sans text-xs text-white/60 tracking-wide max-w-sm">
            Drag to explore → Every surface tells a story of provenance and craft
          </p>
        </div>
      </motion.div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-6 px-8 md:px-16 lg:px-24 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {materialsData.map((mat, idx) => (
          <motion.div
            key={mat.name}
            className="flex-none w-[300px] md:w-[380px] group"
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <div className="aspect-[3/4] overflow-hidden mb-5 relative">
              <ResponsiveImage
                baseSrc={mat.image}
                alt={mat.name}
                className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-110"
                loading="lazy"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <h3 className="font-serif text-lg text-white mb-2">{mat.name}</h3>
            <p className="font-sans text-xs text-white/70 leading-relaxed tracking-wide">{mat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// FULL-BLEED CINEMATIC INTERSTITIAL
// ═══════════════════════════════════════════════════════════════

const CinematicInterstitial: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0.7, 1, 1, 0.3]);

  return (
    <section ref={ref} className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <ResponsiveImage baseSrc="/assets/furniture/sofa_021.webp" alt="Atelier" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8" style={{ opacity }}>
        <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-white/60 mb-8">Handmade in Verona</p>
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight max-w-3xl">Where Form Follows <em className="italic font-light">Feeling</em></h2>
        <div className="mt-12">
          <Link to="/bespoke" state={{ inquire: true, look: "Casa Collection" }} className="group inline-flex items-center gap-4 px-8 py-4 border border-white/30 hover:border-matteo-orange hover:bg-matteo-orange/10 transition-all duration-500">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white">Commission a Custom Piece</span>
            <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// CONSULTATION CTA — Private Inquiry
// ═══════════════════════════════════════════════════════════════

const ConsultationCTA: React.FC = () => {
  const ref = useRef(null);
  return (
    <section ref={ref} className="py-20 md:py-28 px-8 md:px-16 lg:px-24 bg-matteo-cream dark:bg-matteo-black">
      <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="max-w-[800px] mx-auto text-center">
        <div className="w-16 h-[1px] bg-matteo-orange mx-auto mb-12" />
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-charcoal/80 dark:text-matteo-cream/80 mb-6">Private Consultation</p>
        <h2 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream leading-[1.15] tracking-tight mb-8">Your Vision, <br />Our Craft</h2>
        <p className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-matteo-cream/80 leading-relaxed mb-12 max-w-lg mx-auto">Every Matteo Perin casa piece can be customized — dimensions, fabrics, finishes, and materials. Our design consultants guide you through every selection, creating a piece that is uniquely, irrevocably yours.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/bespoke" state={{ inquire: true, look: "Casa Collection" }} className="group inline-flex items-center gap-3 px-10 py-4 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-charcoal hover:bg-matteo-orange dark:hover:bg-matteo-orange dark:hover:text-white transition-all duration-500"><span className="font-sans text-[11px] uppercase tracking-[0.25em]">Book a Consultation</span></Link>
          <Link to="/the-house" className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.25em] text-matteo-charcoal/80 dark:text-matteo-cream/80 hover:text-matteo-orange transition-colors duration-500"><span>Visit The House</span><span className="w-6 h-[1px] bg-current group-hover:w-10 transition-all duration-500" /></Link>
        </div>
      </motion.div>
    </section>
  );
};



// ═══════════════════════════════════════════════════════════════
// LIGHTBOX MODAL — Full-Screen Product Gallery
// ═══════════════════════════════════════════════════════════════

const LightboxModal: React.FC<{ piece: FurniturePiece; onClose: () => void }> = ({ piece, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = [piece.heroImage, ...piece.galleryImages];

  const goNext = useCallback(() => setCurrentIndex(prev => (prev + 1) % allImages.length), [allImages.length]);
  const goPrev = useCallback(() => setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length), [allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-300"
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Main Image */}
      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-16 flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={currentIndex}
          src={getOptimizedUrl(allImages[currentIndex], 'lg')}
          alt={`${piece.name} — Image ${currentIndex + 1}`}
          className="w-full max-h-[65vh] object-contain mx-auto bg-neutral-900"
        />

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-300"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-300"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Product Info + Dots */}
      <div className="w-full max-w-5xl mx-auto px-8 pb-8 pt-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">{piece.name}</h3>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/60 mb-4">{piece.tagline}</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            {piece.materials.map((mat, i) => (
              <span key={i} className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange/70">{mat}</span>
            ))}
          </div>

          {/* Image Dots */}
          {allImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-matteo-orange scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}

          <Link
            to="/bespoke"
            state={{ inquire: true, look: `Furniture — ${piece.name}` }}
            className="inline-flex items-center gap-3 px-8 py-3 border border-white/20 hover:border-matteo-orange hover:bg-matteo-orange/10 transition-all duration-500"
            onClick={onClose}
          >
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-white">Inquire About This Piece</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — Furniture Collection Page
// ═══════════════════════════════════════════════════════════════

export const FurnitureCollection: React.FC = () => {

  return (
    <>
      <Helmet>
        <title>Casa — Matteo Perin | Italian Luxury Living</title>
        <meta name="description" content="Discover Matteo Perin Casa — handcrafted Italian luxury living. Sofas, armchairs, dining, and tables crafted in Verona with the world's finest materials." />
        <meta property="og:title" content="Sofa Design Collection — Matteo Perin" />
        <meta property="og:description" content="Italian luxury furniture, handcrafted in Verona. Explore our curated collection of sofas, armchairs, and dining pieces." />
        <meta property="og:image" content="/assets/furniture/sofa_079.webp" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Sofa Design Collection — Matteo Perin",
              "description": "Italian luxury furniture, handcrafted in Verona. Curated collection of sofas, armchairs, and dining pieces.",
              "url": "https://matteoperin.com/furniture",
              "provider": {
                "@type": "Organization",
                "name": "Matteo Perin"
              }
            }
          `}
        </script>
      </Helmet>

      <div className="bg-matteo-cream dark:bg-matteo-black">
        {/* 1. Cinematic Hero */}
        <HeroSection />

        {/* 2. Philosophy Quote */}
        <PhilosophySection />

        {/* 3. Editorial Split — Modular Living */}
        <EditorialSplit
          image="/assets/furniture/sofa_012.webp"
          title="Modular Living"
          subtitle="Sofas & Sectionals"
          text="Our modular sofa systems are designed as architectural elements — each module an independent sculpture that, together, creates landscapes of comfort. Hand-assembled in our Verona atelier using only Italian-sourced fabrics and sustainably harvested hardwoods."
          cta="View Sofas"
        />

        {/* 4. Editorial Split — Dining (Reversed) */}
        <EditorialSplit
          image="/assets/furniture/sofa_050.webp"
          title="The Art of Dining"
          subtitle="Dining Collection"
          text="Where haute couture meets haute cuisine. Our dining collection pairs sculptural seating with architectural tables — each piece designed to transform the ritual of sharing a meal into a daily ceremony of beauty."
          cta="View Dining"
          reverse
        />

        {/* 5. Cinematic Gallery */}
        <CinematicGallery />

        {/* 6. Full Collection Grid */}
        <CollectionGrid />

        {/* 7. Cinematic Interstitial */}
        <CinematicInterstitial />

        {/* 8. Materials Carousel */}
        <MaterialsShowcase />

        {/* 9. Consultation CTA */}
        <ConsultationCTA />
      </div>
    </>
  );
};
