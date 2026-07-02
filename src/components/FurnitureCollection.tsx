import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';
import { useInquiry } from '../context/InquiryContext';
import { useModalA11y } from '../lib/useModalA11y';


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
  /** W × D × H — absent from the catalog today; the ledger plate renders a
      dimensions row automatically the moment this is supplied. */
  dimensions?: string;
  /** e.g. '12–16 weeks' — absent today; renders in the ledger plate when supplied. */
  leadTime?: string;
}

// The in-page ledger index shown under the hero. Counts derive from
// COLLECTION at render time, so the index stays honest as pieces are added.
// Each entry jumps to the act that houses its category.
const CATEGORY_INDEX = [
  { id: 'sofas', label: 'Sofas', act: 'act-i' },
  { id: 'chairs', label: 'Chairs', act: 'act-ii' },
  { id: 'dining', label: 'Dining', act: 'act-iii' },
  { id: 'tables', label: 'Tables', act: 'act-iii' },
  { id: 'accents', label: 'Accents', act: 'act-iii' },
] as const;

// NOTE FOR THE HOUSE — the Casa catalog record is incomplete. For each piece
// Matteo must still supply: dimensions (W × D × H), a lead time / edition
// terms, and any mill, quarry, or wood provenance he wants quoted. No figures
// are invented in the meantime; every ledger plate (spread and lightbox alike)
// renders a dimensions row and a lead-time row automatically the moment
// `dimensions` / `leadTime` are filled in below.
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
    materials: ['Diamond-Quilted Upholstery', 'Cognac Leather Accent', 'Slim Metal Legs'],
  },
  {
    id: 'rigato-sectional',
    name: 'Rigato',
    category: 'sofas',
    tagline: 'Channel-Tufted Luxury',
    description: 'Vertical channel-tufting runs like architectural columns across the Rigato sectional, creating a sense of rhythm and depth. Available in ivory, charcoal, and custom colourways.',
    heroImage: '/assets/furniture/sofa_073.webp',
    galleryImages: ['/assets/furniture/sofa_074.webp'],
    materials: ['Textured Weave', 'Slim Metal Legs', 'Channel-Tufted Upholstery'],
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
    description: 'A refined swivel armchair in blush tweed with a contrasting leather back shell. The Rosetta is equally at home in a living room or a private study.',
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
    description: 'Diamond-quilted wool dining chairs with sculptural open-back silhouettes surround a tempered-glass table on an ash wood frame — the quilting of the atelier carried to the table.',
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
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════

// House register: 700–1400ms ease-out-expo rises. MotionConfig
// reducedMotion="user" (App.tsx) stills the transforms for reduced-motion
// users automatically; scroll-linked useTransform values are gated by hand
// with useReducedMotion() below.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 }
  }
};


// ═══════════════════════════════════════════════════════════════
// HERO SECTION — Cinematic Full-Bleed Opening
// ═══════════════════════════════════════════════════════════════

// Desktop (landscape 16:9) and Mobile (portrait 9:16) hero video pools
const HERO_VIDEOS_DESKTOP = [
  '/assets/casa-hero-desktop.mp4',
];
const HERO_VIDEOS_MOBILE = [
  '/assets/casa-hero-mobile.mp4',
];

// First frame of the desktop rendition — poster and film share frame zero,
// so playback begins without a jump-cut.
const HERO_POSTER = '/assets/furniture/casa-hero-poster.webp';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Disable heavy video parallax on mobile for iPhone/Safari performance
  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const scrollFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);

  // Scroll-linked values sit outside MotionConfig's coverage — gate by hand.
  const y = isMobileInitial || prefersReducedMotion ? 0 : parallaxY;
  const opacity = prefersReducedMotion ? 1 : scrollFade;
  const scale = isMobileInitial || prefersReducedMotion ? 1 : parallaxScale;
  const textY = prefersReducedMotion ? 0 : textParallaxY;

  // Pick the right video pool based on screen width, random within pool
  const heroVideo = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pool = isMobile ? HERO_VIDEOS_MOBILE : HERO_VIDEOS_DESKTOP;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const handleVideoLoaded = () => {
      if (videoRef.current) {
          videoRef.current.playbackRate = 0.85;
          // iOS often needs an explicit play() nudge
          const p = videoRef.current.play();
          if (p !== undefined) p.catch(() => {});
      }
  };
  const toggleFilm = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
          const p = video.play();
          if (p !== undefined) p.catch(() => {});
          setIsPaused(false);
      } else {
          video.pause();
          setIsPaused(true);
      }
  };

  return (
    <section ref={heroRef} className="relative h-[100dvh] overflow-hidden" id="furniture-hero">
      {/* Film background with parallax; reduced motion holds on the poster
          still and skips the video fetch entirely. */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale, WebkitTransform: "translateZ(0)" }}
      >
        {prefersReducedMotion ? (
          <img
            src={HERO_POSTER}
            alt="A still from the Casa film — the Orfeo sofa, ribbed corduroy and cognac leather"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            // @ts-ignore — webkit attribute needed for iOS inline playback
            webkit-playsinline="true"
            preload="metadata"
            poster={HERO_POSTER}
            onLoadedData={handleVideoLoaded}
            style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
            className="w-full h-full object-cover object-center"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
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
          {/* The house opening sequence: eyebrow → Playfair display → hairline */}
          <motion.span
            variants={fadeUpVariant}
            className="block font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-5"
          >
            The Casa Collection
          </motion.span>

          <motion.h1
            variants={fadeUpVariant}
            className="font-serif text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[8rem] text-white leading-[0.9] tracking-tight mb-6"
          >
            Casa
          </motion.h1>

          <motion.div variants={fadeUpVariant} className="w-16 md:w-24 h-[1px] bg-white/40 mb-6" />

          {/* Ledger line — scarcity in the Italic Aside register.
              NOTE FOR THE HOUSE: keep the count in step with COLLECTION (17). */}
          <motion.p variants={fadeUpVariant} className="font-serif italic text-[15px] text-white/80 mb-5">
            Seventeen pieces. Each made once, in Italy.
          </motion.p>

          {/* Subtitle */}
          <motion.p
            variants={fadeUpVariant}
            className="font-serif text-base md:text-lg text-white/85 max-w-lg leading-relaxed"
          >
            A curated collection of Italian luxury living — where sculptural
            form meets uncompromising comfort.
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
            {/* No `look` state: the Bespoke form's prefill speaks of the
                Lookbook, which is not where a Casa buyer is coming from. */}
            <Link
              to="/bespoke" state={{ inquire: true }}
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

      {/* Quiet film control — a circle, like the house's concierge buttons.
          Lower-left: the concierge button owns the lower-right corner. */}
      {!prefersReducedMotion && (
        <motion.button
          type="button"
          onClick={toggleFilm}
          aria-label={isPaused ? 'Play the film' : 'Pause the film'}
          className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 w-11 h-11 flex items-center justify-center rounded-full border border-white/40 text-white/80 hover:border-matteo-orange hover:text-white transition-colors duration-500"
          style={{ opacity }}
        >
          {isPaused ? (
            <svg className="w-3.5 h-3.5 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5-13-7.5z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />
            </svg>
          )}
        </motion.button>
      )}
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
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-12">
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
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
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
            className="max-w-lg"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange block mb-4">
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
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const y = prefersReducedMotion ? '0%' : parallaxY;
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO }}
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
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="max-w-[1600px] mx-auto"
      >
        <div className="text-center mb-10 md:mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-4">
            Craftsmanship in Detail
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream tracking-tight">
            The Atelier
          </h2>
        </div>

        {/* Asymmetric Masonry Grid — six distinct frames, each alt describing
            what is truly pictured. */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
          {/* Row 1 */}
          <ParallaxImage
            src="/assets/furniture/sofa_057.webp"
            alt="Blush tweed sofa and swivel chair with marble-top nesting tables"
            className="col-span-2 md:col-span-7 aspect-[16/9]"
            speed={0.05}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_059.webp"
            alt="Detail of round nesting tables — cognac leather top on brass-tipped legs"
            className="col-span-1 md:col-span-5 aspect-[4/5] md:aspect-[16/9]"
            speed={0.08}
          />

          {/* Row 2 */}
          <ParallaxImage
            src="/assets/furniture/sofa_095.webp"
            alt="Black leather dining armchair before a sculpted stone fireplace"
            className="col-span-1 md:col-span-4 aspect-square"
            speed={0.12}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_023.webp"
            alt="Oval marble dining table with upholstered chairs before a library wall"
            className="col-span-2 md:col-span-8 aspect-[16/9] md:aspect-[2/1]"
            speed={0.04}
          />

          {/* Row 3 */}
          <ParallaxImage
            src="/assets/furniture/sofa_070.webp"
            alt="Terracotta modular sofa arrangement in a sunlit living room"
            className="col-span-1 md:col-span-5 aspect-square md:aspect-[4/3]"
            speed={0.1}
          />
          <ParallaxImage
            src="/assets/furniture/sofa_022.webp"
            alt="Modular daybed in pale blue bouclé on a striped rug"
            className="col-span-1 md:col-span-7 aspect-[4/5] md:aspect-[4/3]"
            speed={0.06}
          />
        </div>
      </motion.div>
    </section>
  );
};


// ═══════════════════════════════════════════════════════════════
// THE CASA LEDGER — THE COLLECTION IN THREE ACTS
// Anchor spreads with ledger plates; supporting pieces gather into
// contact-sheet bands (the device from CrocJacketLanding.tsx).
// ═══════════════════════════════════════════════════════════════

interface NumberedPiece { piece: FurniturePiece; number: number; }

interface ActSet {
  id: string;
  numeral: string;
  title: string;
  aside: string;
  anchor: NumberedPiece;
  supporting: NumberedPiece[];
  first: number;
  last: number;
}

const ACTS_DEF = [
  {
    id: 'act-i', numeral: 'I', title: 'Sofas & Sectionals',
    anchorId: 'orfeo-sculptural', categories: ['sofas'],
    aside: 'The rest of the sofa ledger — select a frame to study it closely.',
  },
  {
    id: 'act-ii', numeral: 'II', title: 'Chairs & Armchairs',
    anchorId: 'verona-swivel', categories: ['chairs'],
    aside: 'The remaining chairs — select a frame to study it closely.',
  },
  {
    id: 'act-iii', numeral: 'III', title: 'Dining, Tables & Accents',
    anchorId: 'lago-dining', categories: ['dining', 'tables', 'accents'],
    aside: 'Dining, tables, and the atelier’s accents — select a frame to study it closely.',
  },
];

// № numbering runs 01–17 across the whole collection, in display order.
const ACT_SETS: ActSet[] = (() => {
  let ledgerNo = 0;
  return ACTS_DEF.map((def) => {
    const numbered: NumberedPiece[] = COLLECTION
      .filter((p) => def.categories.includes(p.category))
      .map((piece) => ({ piece, number: ++ledgerNo }));
    const anchor = numbered.find((n) => n.piece.id === def.anchorId) ?? numbered[0];
    return {
      id: def.id,
      numeral: def.numeral,
      title: def.title,
      aside: def.aside,
      anchor,
      supporting: numbered.filter((n) => n !== anchor),
      first: numbered[0]?.number ?? 0,
      last: numbered[numbered.length - 1]?.number ?? 0,
    };
  });
})();

const formatNo = (n: number) => `№ ${String(n).padStart(2, '0')}`;

// Contact-sheet columns — literal class strings so Tailwind sees them.
const bandGridCols = (count: number): string => {
  if (count >= 6) return 'md:grid-cols-3 lg:grid-cols-6';
  if (count === 5) return 'md:grid-cols-3 lg:grid-cols-5';
  if (count === 4) return 'md:grid-cols-4';
  return 'md:grid-cols-3';
};

// ─── The Ledger Plate ────────────────────────────────────────────
// One plate for both the editorial spreads and the lightbox dossier.
// Rows render only for data the house has supplied.
// NOTE FOR THE HOUSE: supply W×D×H dimensions and a lead time per piece
// (`dimensions`, `leadTime` in COLLECTION) to complete the ledger — the
// rows appear automatically. Nothing is estimated on the house's behalf.
const LedgerPlate: React.FC<{
  piece: FurniturePiece;
  number: number;
  tone?: 'print' | 'dark';
  onRequest: () => void;
  className?: string;
}> = ({ piece, number, tone = 'print', onRequest, className = '' }) => {
  const dark = tone === 'dark';
  const ink = dark ? 'text-white' : 'text-matteo-charcoal dark:text-matteo-cream';
  const muted = dark ? 'text-white/60' : 'text-matteo-stone-ink dark:text-matteo-cream/60';
  const orange = dark ? 'text-matteo-orange' : 'text-matteo-orange-ink dark:text-matteo-orange';
  const hairline = dark
    ? 'border-white/20 divide-white/15'
    : 'border-matteo-charcoal/15 divide-matteo-charcoal/10 dark:border-white/20 dark:divide-white/15';
  const aside = dark ? 'text-white/70' : 'text-matteo-charcoal/80 dark:text-matteo-cream/80';

  return (
    <div className={className}>
      <span className={`block font-sans text-[10px] uppercase tracking-[0.25em] font-medium ${orange} mb-2`}>
        {formatNo(number)}
      </span>
      <h3 className={`font-serif text-2xl md:text-3xl leading-tight ${ink} mb-1`}>
        {piece.name}
      </h3>
      <p className={`font-sans text-[10px] uppercase tracking-[0.25em] font-medium ${muted} mb-6`}>
        {piece.tagline}
      </p>

      {/* The dossier — quiet label/value rows in the croc-ledger vocabulary */}
      <dl className={`border-t border-b divide-y ${hairline}`}>
        <div className="py-3 flex items-baseline justify-between gap-6">
          <dt className={`font-sans text-[10px] uppercase tracking-[0.15em] font-medium ${muted} shrink-0`}>
            Materials
          </dt>
          <dd className={`font-serif text-[15px] ${ink} text-right leading-relaxed`}>
            {piece.materials.map((mat) => (
              <span key={mat} className="block">{mat}</span>
            ))}
          </dd>
        </div>
        {piece.dimensions && (
          <div className="py-3 flex items-baseline justify-between gap-6">
            <dt className={`font-sans text-[10px] uppercase tracking-[0.15em] font-medium ${muted} shrink-0`}>
              Dimensions
            </dt>
            <dd className={`font-serif text-[15px] ${ink} text-right leading-relaxed`}>
              {piece.dimensions}
            </dd>
          </div>
        )}
        {piece.leadTime && (
          <div className="py-3 flex items-baseline justify-between gap-6">
            <dt className={`font-sans text-[10px] uppercase tracking-[0.15em] font-medium ${muted} shrink-0`}>
              Lead Time
            </dt>
            <dd className={`font-serif text-[15px] ${ink} text-right leading-relaxed`}>
              {piece.leadTime}
            </dd>
          </div>
        )}
      </dl>

      <p className={`font-serif italic text-[15px] ${aside} mt-5`}>
        Made once, in Italy — by commission.
      </p>

      {/* One-tap ask — 44px target, stays on the page */}
      <button
        type="button"
        onClick={onRequest}
        className={`group/req relative mt-1 py-3 min-h-[44px] font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-500 ${
          dark
            ? 'text-white/80 hover:text-white'
            : 'text-matteo-charcoal/70 dark:text-matteo-cream/70 hover:text-matteo-charcoal dark:hover:text-matteo-cream'
        }`}
      >
        Request this piece
        <span className="absolute bottom-2 left-0 w-8 h-[1px] bg-matteo-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/req:w-full" />
      </button>
    </div>
  );
};

// ─── Anchor Spread — the act's editorial moment ─────────────────
const AnchorSpread: React.FC<{
  entry: NumberedPiece;
  reverse?: boolean;
  onOpen: () => void;
  onRequest: () => void;
}> = ({ entry, reverse, onOpen, onRequest }) => {
  const { piece, number } = entry;
  const count = 1 + piece.galleryImages.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
      {/* The photograph — 2/3-width asymmetric, opens the private viewing */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0, margin: '0px 0px -30px 0px' }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        className={`lg:col-span-8 ${reverse ? 'lg:order-2' : ''}`}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`Open the ${piece.name} gallery — ${count} photograph${count === 1 ? '' : 's'}`}
          className="group block w-full text-left"
        >
          <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-matteo-charcoal/5 dark:bg-white/5">
            <ResponsiveImage
              baseSrc={piece.heroImage}
              alt={`${piece.name} — ${piece.tagline}`}
              className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
          <span className="mt-3 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-matteo-cream/60 group-hover:text-matteo-orange-ink dark:group-hover:text-matteo-orange transition-colors duration-500">
            <span>View gallery — {count} photograph{count === 1 ? '' : 's'}</span>
            <span className="block w-5 h-[1px] bg-current group-hover:w-8 transition-all duration-500" />
          </span>
        </button>
      </motion.div>

      {/* The ledger plate, beside the print */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: '0px 0px -30px 0px' }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT_EXPO }}
        className={`lg:col-span-4 ${reverse ? 'lg:order-1' : ''}`}
      >
        <p className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-matteo-cream/80 leading-relaxed max-w-[48ch] mb-8">
          {piece.description}
        </p>
        <LedgerPlate piece={piece} number={number} onRequest={onRequest} />
      </motion.div>
    </div>
  );
};

// ─── Contact-Sheet Band — the act's supporting pieces ───────────
// Sand surface, numbered frames; horizontally scrollable with snap on
// mobile, a quiet grid from md up. Tap opens the lightbox.
const ContactSheetBand: React.FC<{
  act: ActSet;
  onOpen: (entry: NumberedPiece) => void;
}> = ({ act, onOpen }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: '0px 0px -30px 0px' }}
    transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
    className="mt-12 md:mt-16 bg-matteo-sand/60 dark:bg-[#111] border-y border-matteo-charcoal/5 dark:border-white/5 py-8 md:py-12"
  >
    <div className="px-8 md:px-16 lg:px-24">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-6 md:mb-8">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
            The Contact Sheet — Act {act.numeral}
          </span>
          <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-white/70">
            {act.aside}
          </p>
        </div>

        <div
          className={`flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory -mx-8 px-8 scroll-px-8 pb-2 md:mx-0 md:px-0 md:pb-0 md:grid ${bandGridCols(act.supporting.length)} md:overflow-visible`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {act.supporting.map((entry) => {
            const count = 1 + entry.piece.galleryImages.length;
            return (
              <button
                key={entry.piece.id}
                type="button"
                onClick={() => onOpen(entry)}
                aria-haspopup="dialog"
                aria-label={`Open the ${entry.piece.name} gallery — ${count} photograph${count === 1 ? '' : 's'}`}
                className="group/frame w-[44vw] max-w-[200px] shrink-0 snap-start text-left md:w-auto md:max-w-none"
              >
                <div className="aspect-[3/4] overflow-hidden bg-matteo-sand dark:bg-white/5">
                  <ResponsiveImage
                    baseSrc={entry.piece.heroImage}
                    alt={`${entry.piece.name} — ${entry.piece.tagline}`}
                    className="w-full h-full object-cover opacity-[0.92] group-hover/frame:opacity-100 transition-opacity duration-500"
                    loading="lazy"
                    maxVariant="sm"
                    sizes="(max-width: 768px) 44vw, 200px"
                  />
                </div>
                <span className="block mt-2 font-sans text-[10px] tracking-[0.2em] font-medium text-matteo-orange-ink dark:text-matteo-orange">
                  {formatNo(entry.number)}
                </span>
                <span className="block font-serif text-base text-matteo-charcoal dark:text-matteo-cream group-hover/frame:text-matteo-orange-ink dark:group-hover/frame:text-matteo-orange transition-colors duration-500">
                  {entry.piece.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── In-page ledger index — sits directly under the hero ────────
const CollectionIndex: React.FC = () => (
  <motion.nav
    aria-label="Collection index"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0 }}
    transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
    className="bg-matteo-cream dark:bg-matteo-black border-b border-matteo-charcoal/10 dark:border-white/10 px-6 md:px-16 lg:px-24"
  >
    <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-x-1 md:gap-x-3 py-1">
      {CATEGORY_INDEX.map((cat, i) => {
        const count = COLLECTION.filter((p) => p.category === cat.id).length;
        if (count === 0) return null;
        return (
          <React.Fragment key={cat.id}>
            {i > 0 && (
              <span aria-hidden="true" className="font-sans text-[10px] text-matteo-charcoal/30 dark:text-white/30">/</span>
            )}
            <button
              type="button"
              onClick={() => document.getElementById(cat.act)?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-1.5 md:px-2 py-2 font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-matteo-cream/70 hover:text-matteo-charcoal dark:hover:text-matteo-cream transition-colors duration-500"
            >
              <span>{cat.label}</span>
              <span className="text-matteo-orange-ink dark:text-matteo-orange">{String(count).padStart(2, '0')}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  </motion.nav>
);

// ─── The section — three acts, one ledger ───────────────────────
const CollectionActs: React.FC = () => {
  const [lightbox, setLightbox] = useState<NumberedPiece | null>(null);
  const { openInquiry } = useInquiry();

  // One-tap ask: InquiryModal opens in place, prefilled with the piece.
  const requestPiece = useCallback((piece: FurniturePiece) => {
    openInquiry(
      {
        id: `casa-${piece.id}`,
        title: piece.name,
        image: getOptimizedUrl(piece.heroImage, 'md'),
      },
      `Regarding the ${piece.name}, from Casa.`
    );
  }, [openInquiry]);

  return (
    <section id="collection" className="py-16 md:py-24 bg-matteo-cream dark:bg-matteo-black scroll-mt-24">
      {/* Section header — the house opening sequence, left-aligned */}
      <div className="px-8 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: '0px 0px -30px 0px' }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="mb-14 md:mb-20"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-4">
              The Full Collection
            </p>
            <h2 className="font-serif text-4xl md:text-6xl text-matteo-charcoal dark:text-matteo-cream tracking-tight mb-6">
              The Casa Ledger
            </h2>
            <div className="w-16 md:w-24 h-[1px] bg-matteo-charcoal/20 dark:bg-white/20 mb-6" />
            {/* NOTE FOR THE HOUSE: keep the count in step with COLLECTION (17). */}
            <p className="font-serif italic text-[15px] text-matteo-charcoal/80 dark:text-matteo-cream/80">
              Seventeen entries in three acts — each made once, in Italy.
            </p>
          </motion.div>
        </div>
      </div>

      {ACT_SETS.map((act, i) => (
        <div key={act.id} id={act.id} className={`scroll-mt-28 ${i > 0 ? 'mt-16 md:mt-24' : ''}`}>
          <div className="px-8 md:px-16 lg:px-24">
            <div className="max-w-[1600px] mx-auto">
              {/* Act header — eyebrow, hairline, ledger range */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: '0px 0px -30px 0px' }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                className="flex items-baseline gap-4 mb-8 md:mb-12"
              >
                <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange shrink-0">
                  Act {act.numeral} — {act.title}
                </span>
                <span className="hidden sm:block flex-1 h-[1px] bg-matteo-charcoal/10 dark:bg-white/10 self-center" aria-hidden="true" />
                <span className="hidden sm:block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-stone-ink dark:text-matteo-cream/60 shrink-0">
                  {formatNo(act.first)} — {String(act.last).padStart(2, '0')}
                </span>
              </motion.div>

              <AnchorSpread
                entry={act.anchor}
                reverse={i % 2 === 1}
                onOpen={() => setLightbox(act.anchor)}
                onRequest={() => requestPiece(act.anchor.piece)}
              />
            </div>
          </div>

          {act.supporting.length > 0 && (
            <ContactSheetBand act={act} onOpen={(entry) => setLightbox(entry)} />
          )}
        </div>
      ))}

      {/* Lightbox */}
      {lightbox && (
        <LightboxModal piece={lightbox.piece} number={lightbox.number} onClose={() => setLightbox(null)} />
      )}
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
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="px-8 md:px-16 lg:px-24 mb-16"
      >
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-4">
              Material World
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight">
              Textures & Materials
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="font-serif italic text-[15px] text-white/70 leading-relaxed">
              Every surface tells a story of provenance and craft.
            </p>
            {/* Mouse-only affordance — hidden from touch viewports */}
            <p className="hidden md:block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-white/60 mt-3">
              Drag to explore
            </p>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Scroll — focusable so arrow keys can travel the rail */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Textures and materials — a horizontally scrolling gallery"
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
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.7, delay: idx * 0.1, ease: EASE_OUT_EXPO }}
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
            <p className="font-serif text-[15px] text-white/75 leading-relaxed">{mat.desc}</p>
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
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const scrollFade = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0.7, 1, 1, 0.3]);
  const y = prefersReducedMotion ? '0%' : parallaxY;
  const opacity = prefersReducedMotion ? 1 : scrollFade;

  return (
    <section ref={ref} className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <ResponsiveImage baseSrc="/assets/furniture/sofa_021.webp" alt="Diamond-quilted chaise in cream — stitch detail" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8" style={{ opacity }}>
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange mb-8">Handmade in Verona</p>
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight max-w-3xl">Where Form Follows <em className="italic font-light">Feeling</em></h2>
        <div className="mt-12">
          <Link to="/bespoke" state={{ inquire: true }} className="group inline-flex items-center gap-4 px-8 py-4 border border-white/30 hover:border-matteo-orange hover:bg-matteo-orange/10 transition-all duration-500">
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
      <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0, margin: "0px 0px -30px 0px" }} transition={{ duration: 1, ease: EASE_OUT_EXPO }} className="max-w-[800px] mx-auto text-center">
        <div className="w-16 h-[1px] bg-matteo-orange mx-auto mb-12" />
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-6">Private Consultation</p>
        <h2 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream leading-[1.15] tracking-tight mb-8">Your Vision, <br />Our Craft</h2>
        <p className="font-serif text-base md:text-lg text-matteo-charcoal/80 dark:text-matteo-cream/80 leading-relaxed mb-12 max-w-lg mx-auto">Every Matteo Perin casa piece can be customized — dimensions, fabrics, finishes, and materials. Our design consultants guide you through every selection, creating a piece that is uniquely, irrevocably yours.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/bespoke" state={{ inquire: true }} className="group inline-flex items-center gap-3 px-10 py-4 bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-charcoal hover:bg-matteo-orange dark:hover:bg-matteo-orange dark:hover:text-white transition-all duration-500"><span className="font-sans text-[11px] uppercase tracking-[0.25em]">Book a Consultation</span></Link>
          <Link to="/the-house" className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.25em] text-matteo-charcoal/80 dark:text-matteo-cream/80 hover:text-matteo-orange transition-colors duration-500"><span>Visit The House</span><span className="w-6 h-[1px] bg-current group-hover:w-10 transition-all duration-500" /></Link>
        </div>
      </motion.div>
    </section>
  );
};



// ═══════════════════════════════════════════════════════════════
// LIGHTBOX MODAL — Full-Screen Product Gallery
// ═══════════════════════════════════════════════════════════════

const LightboxModal: React.FC<{ piece: FurniturePiece; number: number; onClose: () => void }> = ({ piece, number, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(0);
  const allImages = useMemo(() => [piece.heroImage, ...piece.galleryImages], [piece]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { openInquiry } = useInquiry();

  // Dialog semantics: Escape closes, Tab is trapped inside, focus moves in on
  // open and returns to the originating card on close.
  useModalA11y(true, onClose, dialogRef);

  const goNext = useCallback(() => { setSlideDir(1); setCurrentIndex(prev => (prev + 1) % allImages.length); }, [allImages.length]);
  const goPrev = useCallback(() => { setSlideDir(-1); setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length); }, [allImages.length]);

  // Arrow-key navigation (Escape is handled by useModalA11y)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [goNext, goPrev]);

  // Warm the neighbouring frames so a swipe lands on a decoded print
  useEffect(() => {
    if (allImages.length < 2 || typeof window === 'undefined') return;
    const variant = window.innerWidth <= 640 ? 'sm' : window.innerWidth <= 1024 ? 'md' : 'lg';
    [(currentIndex + 1) % allImages.length, (currentIndex - 1 + allImages.length) % allImages.length].forEach((i) => {
      const img = new Image();
      img.src = getOptimizedUrl(allImages[i], variant as 'sm' | 'md' | 'lg');
    });
  }, [currentIndex, allImages]);

  const handleInquire = () => {
    onClose();
    openInquiry(
      {
        id: `casa-${piece.id}`,
        title: piece.name,
        image: getOptimizedUrl(piece.heroImage, 'md'),
      },
      `Regarding the ${piece.name}, from Casa.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100002] bg-matteo-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${piece.name} — private viewing`}
        tabIndex={-1}
        className="w-full h-full flex flex-col items-center justify-center outline-none"
      >
        {/* Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-300"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Main Image — draggable print; swipe advances the gallery */}
        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-16 flex-1 min-h-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <motion.div
            key={currentIndex}
            className="w-full h-full flex items-center justify-center touch-pan-y"
            drag={allImages.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -48) goNext();
              else if (info.offset.x > 48) goPrev();
            }}
            initial={{ opacity: 0, x: slideDir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <ResponsiveImage
              baseSrc={allImages[currentIndex]}
              alt={`${piece.name} — view ${currentIndex + 1} of ${allImages.length}`}
              className="w-full max-h-[60vh] md:max-h-[65vh] object-contain mx-auto select-none pointer-events-none"
              sizes="100vw"
              draggable={false}
            />
          </motion.div>

          {/* Navigation Arrows — hairline ghost blocks in the desktop gutter,
              off the photograph; on touch they recede (swipe + dots remain) */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center border border-white/25 text-white/70 hover:border-matteo-orange hover:text-white transition-colors duration-300"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center border border-white/25 text-white/70 hover:border-matteo-orange hover:text-white transition-colors duration-300"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Piece dossier — the ledger plate, with the piece's own story */}
        <div className="w-full max-w-4xl mx-auto px-6 md:px-10 pb-8 pt-5 max-h-[55vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Image Dots — 44px touch targets around unchanged 8px visual dots */}
          {allImages.length > 1 && (
            <div className="flex items-center justify-center mb-4">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setSlideDir(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  className="group/dot w-11 h-11 flex items-center justify-center"
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === currentIndex}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'bg-matteo-orange scale-125' : 'bg-white/30 group-hover/dot:bg-white/50'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-left">
            {/* The same plate the spreads carry — № , dossier rows, one-tap ask.
                Dimensions and lead time render the moment the house supplies
                them; see NOTE FOR THE HOUSE above COLLECTION. */}
            <LedgerPlate
              piece={piece}
              number={number}
              tone="dark"
              onRequest={handleInquire}
              className="md:col-span-5"
            />

            {/* The piece's own story — serif body, capped at 65ch */}
            <p className="md:col-span-7 font-serif text-[15px] md:text-base text-white/85 leading-relaxed max-w-[65ch]">
              {piece.description}
            </p>
          </div>
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
        <meta name="description" content="Casa — the furniture line of Matteo Perin. Seventeen pieces of Italian luxury living, each made once: sofas, armchairs, dining, and tables handcrafted in Italy." />
        <link rel="canonical" href="https://www.matteoperin.com/furniture" />
        {/* Poster is the hero's first paint — ask for it early */}
        <link rel="preload" as="image" href="/assets/furniture/casa-hero-poster.webp" />

        <meta property="og:title" content="Casa — Matteo Perin" />
        <meta property="og:description" content="Seventeen pieces of Italian luxury living, each made once. Sofas, armchairs, dining, and tables handcrafted in Italy." />
        {/* Dedicated 1200x630 Casa card (121KB) — not the 2.6MB source photograph */}
        <meta property="og:image" content="https://www.matteoperin.com/assets/og/og-casa.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://www.matteoperin.com/assets/og/og-casa.jpg" />
        <meta property="og:url" content="https://www.matteoperin.com/furniture" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Matteo Perin" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Casa — Matteo Perin',
            description: 'Casa — the furniture line of Matteo Perin. Italian luxury living, handcrafted in Italy.',
            url: 'https://www.matteoperin.com/furniture',
            provider: {
              '@type': 'Organization',
              name: 'Matteo Perin',
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: COLLECTION.length,
              itemListElement: COLLECTION.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: p.name,
              })),
            },
          })}
        </script>
      </Helmet>

      <div className="bg-matteo-cream dark:bg-matteo-black">
        {/* 1. Cinematic Hero */}
        <HeroSection />

        {/* 1b. The ledger index — real counts, jumps to each act */}
        <CollectionIndex />

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

        {/* 6. The Casa Ledger — the collection in three acts */}
        <CollectionActs />

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
