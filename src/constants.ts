
import { Product, Article } from './types';

// IMAGE EXTENSIONS — deliberate mix of .webp and .jpg:
// ResponsiveImage only engages srcset variants for .webp base paths, and it
// never requests the base file itself (it derives -sm/-md/-lg). The .jpg
// paths below all have -sm/-md/-lg.webp variants on disk but NO base .webp,
// and they are consumed by plain <img> tags (Vault, Press, Lifestyle,
// Bespoke) — renaming them to .webp would 404. Do not flip a .jpg to .webp
// here unless (a) the base .webp exists under /public, or (b) every consumer
// goes through ResponsiveImage.

export const IMAGES = {
  // 1. Matteo Portrait with Jacket - A more sophisticated, editorial portrait
  hero_portrait: "/assets/bespoke/Dialogue.jpg",

  // 2. Mountains / Landscape - High contrast Dolomites shot
  landscape_mountains: "/assets/hero_nature_v5.webp",

  // 3. Bison Herd - Moody atmospheric nature shot
  bison_herd: "/assets/hero_teton_buffalo_v2.webp",

  // 4. Close up Bison - High-quality leather/texture detail
  bison_close: "/assets/leather_detail.jpg",

  // 5. Matteo Walking in Field - Stylish man in suede jacket


  // 6. Atelier / Office - Craftsmanship detail
  atelier: "/assets/bespoke/architecture.jpg",

  // 7. Hero Mountains (Landscape) - Fallback for video
  hero_mountains_img: "/assets/mountains.jpg",

  // Products
  bag_orange: "/assets/products/weekender_bag.jpg",
  bag_blue: "/assets/products/heritage_clutch.jpg",
  jacket_detail: "/assets/products/cashmere_blazer.jpg",
  matteo_walking: "/assets/products/suede_jacket.jpg",

  // Journal
  journal_1: "/assets/journal/journal_1_patina.webp",
  journal_2: "/assets/journal/journal_2_dolomites.webp",
  // The Handover step — the finished commission, final bow-tie adjustment.
  // (The House, Chapter II uses a different Travolta photograph: travolta-cannes.)
  journal_3: "/assets/bespoke/travolta-handover.webp",
  journal_4: "/assets/bespoke/fitting.avif",
  journal_5: "/assets/journal/journal_5_urban.webp",

  // Vault Exclusives
  vault_croc: "/assets/vault/vault_1.jpg",
  vault_vicuna: "/assets/vault/vault_2.jpg",
  vault_watch: "/assets/vault/vault_3.jpg",

  // Logo placeholder (simulating the orange circular logo)
  logo_url: "https://via.placeholder.com/150/F06436/FFFFFF?text=MP",
} as const;

export const VIDEOS = {
  // Moody mountains/fog - High quality atmospheric loop
  hero_mountains: "https://videos.pexels.com/video-files/3576351/3576351-uhd_2560_1440_30fps.mp4",
};

export const AUDIO = {
  // Soft, minimalist ambient drone
  ambient: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_03f1350616.mp3?filename=soft-ambient-11059.mp3"
};

export const NAV_ITEMS = [
  // Left Side (Brand & Lifestyle)
  { label: 'The House', href: '/the-house' },
  { label: 'Press', href: '/press' },
  { label: 'Casa', href: '/furniture' },
  // Right Side (Product & Service - Split Gender)
  { label: "Man", href: '/lookbook/men' },
  { label: "Woman", href: '/lookbook/women' },
  { label: 'Shop', href: '/shop' },
  { label: 'Bespoke', href: '/bespoke' },
];

export const MENS_LOOKBOOK_IMAGES = [
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook1_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook2_002.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook3_001.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook4_016.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook5_002.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook6_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook7_011.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook8_015.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook9_052.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook10_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook10_015.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook11_001.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook12_004.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook13_008.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook14_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook15_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook16_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook18_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook19_004-Copy1.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook20_023.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook21_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook21_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook22_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook23_027.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook24_022.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook25_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook25_019.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook26_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook26_049.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook27_002.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook27_021.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook28_026.webp"
];
export const WOMENS_LOOKBOOK_IMAGES = [
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_010.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_030.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook2_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook3_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook4_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook5_122.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook6_008.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook7_018-Copy1.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook8_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook8_074.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook9_014.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook10_074-Edit.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook11_001.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook12_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook13_014.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook14_057.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook15_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook16_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook17_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook18_010.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook19_001.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook20_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook21_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook21_022.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook22_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook23_002.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook24_014.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook25_001-Edit.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook27_001.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook28_050.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook29_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook30_004.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook30_072.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook31_008.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook32_014.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook33_001-Edit.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook33_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook34_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook35_008.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook36_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook37_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook38_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook38_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook39_004.webp"
];

// ---------------------------------------------------------------------------
// EDITORIAL CATALOG — the Spring looks below are lookbook plates, not
// inventory. Purchasable stock lives in the Google-Sheets-backed /shop.
// The looks carry no retail price and no per-item merchandise copy: the
// photographs are the record. `price: 0` is the house sentinel for
// "no retail price / by inquiry" (types.ts requires a number; every
// consumer treats a falsy price as price-less and falls back to inquiry).
// The 'Bespoke Crocodile Jacket' is the one commerce entry in this list —
// InquiryModal and the croc funnel key off its exact title. Do not rename it.
// NOTE FOR THE HOUSE: api/chat.ts inlines a hand-synced copy of this catalog
// for the digital concierge; it still carries the old invented item copy and
// needs the same editorial treatment.
const lookDescription = (n: number): string =>
  `Look ${String(n).padStart(2, '0')} from the Spring 2025 lookbook, photographed for the house. Pieces from this look are realized by commission, tailored to the wearer.`;

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Spring Look 01',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook1_003.webp",
    price: 0,
    gender: 'men',
    wide: true,
    description: lookDescription(1),
    link: "#"
  },
  {
    id: 2,
    title: 'Spring Look 02',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook2_009.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(2),
    link: "#"
  },
  {
    id: 3,
    title: 'Spring Look 03',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook10_074-Edit.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(3),
    link: "#"
  },
  {
    id: 4,
    title: 'Spring Look 04',
    category: 'Spring 2025 Lookbook',
    // -panel = landscape face-and-shoulders crop for panel frames; the lookbook keeps the full-body original
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook20_023-panel.webp",
    price: 0,
    gender: 'men',
    wide: false,
    description: lookDescription(4),
    link: "#"
  },
  {
    id: 5,
    title: 'Spring Look 05',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook4_005.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(5),
    link: "#"
  },
  {
    id: 6,
    title: 'Spring Look 06',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook14_057.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(6),
    link: "#"
  },
  {
    id: 7,
    title: 'Spring Look 07',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook14_005.webp",
    price: 0,
    gender: 'men',
    wide: true,
    description: lookDescription(7),
    link: "#"
  },
  {
    id: 8,
    title: 'Spring Look 08',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook16_006.webp",
    price: 0,
    gender: 'men',
    wide: false,
    description: lookDescription(8),
    link: "#"
  },
  {
    id: 9,
    title: 'Spring Look 09',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_007.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(9),
    link: "#"
  },
  {
    id: 10,
    title: 'Spring Look 10',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook18_005.webp",
    price: 0,
    gender: 'men',
    wide: false,
    description: lookDescription(10),
    link: "#"
  },
  {
    id: 11,
    title: 'Spring Look 11',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook20_023.webp",
    price: 0,
    gender: 'men',
    wide: false,
    description: lookDescription(11),
    link: "#"
  },
  {
    id: 12,
    title: 'Spring Look 12',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook29_007.webp",
    price: 0,
    gender: 'women',
    wide: false,
    description: lookDescription(12),
    link: "#"
  },
  {
    id: 13,
    title: 'Spring Look 13',
    category: 'Spring 2025 Lookbook',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook24_022.webp",
    price: 0,
    gender: 'men',
    wide: false,
    description: lookDescription(13),
    link: "#"
  },
  {
    id: 14,
    title: 'Bespoke Crocodile Jacket',
    category: 'Exotics',
    image: "/assets/croc-jacket/matteo_croc_new_1.jpg",
    price: 25000,
    gender: 'men',
    wide: true,
    description: "Crafted from hand-selected Nile or Porosus crocodile, each piece is finished with a hand-developed patina and shaped over 100+ hours of artisanal work. Offered exclusively by commission, reserved for the atelier's most considered works.",
    link: "/bespoke-crocodile-jacket",
    gallery: [
      "/assets/croc-jacket/matteo_croc_new_1.jpg",
      "/assets/croc-jacket/matteo_croc_new_2.jpg",
      "/assets/croc-jacket/matteo_croc.jpg"
    ]
  },
];

export const VAULT_ITEMS: Product[] = [
  {
    id: 101,
    title: "Himalayan Weekender",
    category: "Archive 001",
    image: IMAGES.vault_croc,
    price: 65000,
    gender: 'unisex',
    description: "One of one. Hand-selected Nile or Porosus crocodile. Palladium hardware. The apex of travel.",
  },
  {
    id: 102,
    title: "The Vicuña Coat",
    category: "Archive 002",
    image: IMAGES.vault_vicuna,
    price: 32000,
    gender: 'men',
    description: "The Gold of the Andes. Unlined. Pure tactile engagement. Sustainable.",
  },
  {
    id: 103,
    title: "Vintage Caliber",
    category: "Archive 003",
    image: IMAGES.vault_watch,
    price: 18500,
    gender: 'unisex',
    description: "Restored 1960s movement. Bespoke titanium case. A bridge between eras.",
  }
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "The Art of Patina",
    category: "Craftsmanship",
    date: "October 12, 2024",
    excerpt: "Why imperfection is the ultimate luxury. A study in vegetable-tanned leathers.",
    image: IMAGES.journal_1,
    slug: "art-of-patina"
  },
  {
    id: 2,
    title: "Notes from the Dolomites",
    category: "Travel",
    date: "September 28, 2024",
    excerpt: "Testing the shearling overcoat in the Italian Alps. Where performance meets elegance.",
    image: IMAGES.landscape_mountains,
    slug: "dolomites-notes"
  },
  {
    id: 3,
    title: "Private Air Essentials",
    category: "Style",
    date: "September 15, 2024",
    excerpt: "The cabin wardrobe. Fabrics that breathe and resist wrinkling at 40,000 feet.",
    image: IMAGES.journal_2,
    slug: "private-air-essentials"
  },
  {
    id: 4,
    title: "The Vicuña Commission",
    category: "Bespoke",
    date: "August 30, 2024",
    excerpt: "Sourcing the world's rarest fiber for a private client in Geneva.",
    image: IMAGES.journal_3,
    slug: "vicuna-commission"
  },
  {
    id: 5,
    title: "The Silent Stitch",
    category: "Craftsmanship",
    date: "July 10, 2024",
    excerpt: "Unseen details define longevity. Inside the atelier's standards.",
    image: IMAGES.journal_4,
    slug: "silent-stitch"
  },
  {
    id: 6,
    title: "Urban Armor",
    category: "Style",
    date: "June 22, 2024",
    excerpt: "Technical fabrics in bespoke tailoring. The modern metropolis uniform.",
    image: IMAGES.journal_5,
    slug: "urban-armor"
  }
];

export const PRESS_ARTICLES = [
  {
    id: 1,
    publication: "JH Style Magazine",
    title: "From the Dolomites to Deloney Avenue",
    date: "Winter 2025",
    image: "/assets/press/jh_style.jpg",
    link: "https://jhstylemagazine.com/from-the-dolomites-to-deloney-avenue",
    // Plain description of the piece — not a pull-quote. NOTE FOR THE HOUSE:
    // if a verbatim quote from the article is supplied, it can replace this.
    excerpt: "A profile of the house's new chapter in Jackson Hole, Wyoming — from the Dolomites to Deloney Avenue."
  },
  {
    id: 2,
    publication: "Private Air Magazine",
    title: "Bespoke Redefined",
    date: "2024",
    image: "/assets/press/private_air.jpg",
    link: "https://www.private-air-mag.com/bespoke-redefined-matteo-perin",
    excerpt: "Matteo Perin provides bespoke services for those who like enviable, one-of-a-kind, individualized private service."
  },
  {
    id: 3,
    publication: "Hollywood in Toto",
    title: "The Man Behind Travolta's Dapper Don Transformation",
    date: "2018",
    image: "/assets/press/travolta.webp",
    link: "https://www.hollywoodintoto.com/matteo-perin-john-travolta/",
    excerpt: "Travolta puts his fashion trust in Italian designer Matteo Perin, collaborating on screen and off."
  }
  // The Jackson Hole Chamber of Commerce directory listing was removed —
  // a directory entry beside real journalism cheapens the coverage above.
];

export const TEXTS = {
  HERO_TITLE: "Italian / Bespoke",
  HERO_SUBTITLE: "True luxury whispers. Logos should never walk in the door before you do.",
  BESPOKE_TITLE: "The Commission",
  BESPOKE_TEXT: "Personal luxury takes time, patience, and personality. It is a life lived, not trends followed.",

  CONTACT_TITLE: "Private Inquiry",
  PHILOSOPHY_TITLE: "The Design Code",
  PHILOSOPHY_TEXT: "Everything I design should fit who they are, instead of me trying to make them who I am. I design lifestyles, not pieces.",

  COLLECTION_TITLE: "The Permanent Collection",
  COLLECTION_TEXT: "Material architecture. Engineered for the departure. We serve clients who demand garments that perform effortlessly, anywhere in the world.",
  collection_intro: "Available for Acquisition.",
};
