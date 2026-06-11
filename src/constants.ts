
import { Product, Article, LookbookItem } from './types';

// In a real scenario, these would be the actual uploaded URLs. 
// Using high-quality placeholders that match the description for the prototype.

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
  journal_3: "/assets/bespoke/handover.avif",
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
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook3_001.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook4_016.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook5_002.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook6_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook7_011.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook8_015.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook9_052.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook10_009.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook10_015.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook11_001.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook12_004.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook13_008.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook14_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook15_005.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook16_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook18_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook19_004-Copy1.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook20_023.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook21_003.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook21_005.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook22_003.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook23_027.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook24_022.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook25_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook25_019.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook26_006.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook26_049.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook27_002.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook27_021.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook28_026.jpg"
];
export const WOMENS_LOOKBOOK_IMAGES = [
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_010.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_030.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook2_009.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook3_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook4_005.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook5_122.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook6_008.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook7_018-Copy1.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook8_003.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook8_074.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook9_014.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook10_074-Edit.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook11_001.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook12_005.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook13_014.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook14_057.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook15_006.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook16_007.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook17_006.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook18_010.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook19_001.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook20_009.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook21_006.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook21_022.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook22_009.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook23_002.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook24_014.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook25_001-Edit.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_005.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook27_001.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook28_050.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook29_007.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook30_004.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook30_072.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook31_008.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook32_014.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook33_001-Edit.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook33_003.webp",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook34_009.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook35_008.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook36_007.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook37_007.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook38_005.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook38_007.jpg",
  "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook39_004.jpg"
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Spring Look 01',
    category: 'Travel / Leisure',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook1_003.webp",
    price: 4200,
    gender: 'men',
    wide: true,
    description: "Tuscan vegetable-tanned leather. 48-hour capacity. Solid brass hardware. Engineered for the departure.",
    link: "#",
    gallery: [IMAGES.bison_close, IMAGES.atelier, IMAGES.bag_blue]
  },
  {
    id: 2,
    title: 'Spring Look 02',
    category: 'Outerwear',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook2_009.webp",
    price: 3850,
    gender: 'women',
    wide: false,
    description: "Goat suede. Horn buttons. Silk-blend lining. Transitions effortlessly from city streets to alpine retreats.",
    link: "#",
    gallery: [IMAGES.jacket_detail, IMAGES.landscape_mountains, IMAGES.hero_portrait]
  },
  {
    id: 3,
    title: 'Spring Look 03',
    category: 'Accessories',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook3_006.webp",
    price: 1250,
    gender: 'women',
    wide: false,
    description: "Hand-stitched construction. Signature edge painting. An evening essential.",
    link: "#",
    gallery: [IMAGES.bison_close, IMAGES.bison_herd]
  },
  {
    id: 4,
    title: 'Spring Look 04',
    category: 'Tailoring',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook6_003.webp",
    price: 2100,
    gender: 'men',
    wide: false,
    description: "Biella-sourced cashmere. Unstructured. Warmth without weight. Available for commission.",
    link: "#"
  },
  {
    id: 5,
    title: 'Spring Look 05',
    category: 'Couture',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook4_005.webp",
    price: 650,
    gender: 'women',
    wide: false,
    description: "Japanese acetate. Titanium hardware. Clarity and protection.",
    link: "#"
  },
  {
    id: 6,
    title: 'Spring Look 06',
    category: 'Couture',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook14_057.webp",
    price: 4500,
    gender: 'women',
    wide: false,
    description: "Pure Tussah silk. Hand-draped. A lesson in fluid architecture.",
    link: "#"
  },
  {
    id: 7,
    title: 'Spring Look 07',
    category: 'Travel / Tailoring',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook14_005.webp",
    price: 3200,
    gender: 'men',
    wide: true,
    description: "Compact efficiency. Fits beneath the seat of any commercial aircraft.",
    link: "#"
  },
  {
    id: 8,
    title: 'Spring Look 08',
    category: 'Footwear',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook16_006.webp",
    price: 1850,
    gender: 'men',
    wide: false,
    description: "Goodyear welted. Hand-painted cognac patina. A foundation for the wardrobe.",
    link: "#"
  },
  {
    id: 9,
    title: 'Spring Look 09',
    category: 'Outerwear',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook26_007.webp",
    price: 5200,
    gender: 'women',
    wide: false,
    description: "Tuscan lambskin. Reversible. The ultimate defense against the cold.",
    link: "#"
  },
  {
    id: 10,
    title: 'Spring Look 10',
    category: 'Outerwear',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook18_005.webp",
    price: 4800,
    gender: 'men',
    wide: false,
    description: "Suri Alpaca blend. Dramatic lapels. A silhouette that commands the room.",
    link: "#"
  },
  {
    id: 11,
    title: 'Spring Look 11',
    category: 'Tailoring',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook20_023.webp",
    price: 450,
    gender: 'men',
    wide: false,
    description: "Wild Amazonian Peccary. Unlined for tactile precision. Hand-sewn in Naples.",
    link: "#"
  },
  {
    id: 12,
    title: 'Spring Look 12',
    category: 'Business',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook29_007.webp",
    price: 1850,
    gender: 'women',
    wide: false,
    description: "Vegetable-tanned bridle leather. Retractable handle. Architecturally rigid.",
    link: "#"
  },
  {
    id: 13,
    title: 'Spring Look 13',
    category: 'Knitwear',
    image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_MLook24_022.webp",
    price: 1200,
    gender: 'men',
    wide: false,
    description: "4-ply Scottish cashmere. Chunky rib. The foundation of a winter wardrobe.",
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

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 1,
    title: "Look 01",
    season: "The Permanent Collection",
    image: MENS_LOOKBOOK_IMAGES[0],
    description: "The Boardroom.",
    wearing: ["Double-Breasted Cashmere Overcoat", "Pleated Flannel Trousers", "Chelsea Boots"]
  },
  {
    id: 2,
    title: "Look 02",
    season: "The Permanent Collection",
    image: MENS_LOOKBOOK_IMAGES[1],
    description: "The Weekend.",
    wearing: ["Vicuña Rollneck", "Technical Field Vest", "Selvedge Denim"]
  },
  {
    id: 3,
    title: "Look 03",
    season: "The Permanent Collection",
    image: WOMENS_LOOKBOOK_IMAGES[0],
    description: "The Evening.",
    wearing: ["Midnight Velvet Dinner Jacket", "Silk Grosgrain Bowtie", "Patent Leather Slippers"]
  },
  {
    id: 4,
    title: "Look 04",
    season: "The Permanent Collection",
    image: MENS_LOOKBOOK_IMAGES[3] || MENS_LOOKBOOK_IMAGES[0],
    description: "The Departure.",
    wearing: ["Unstructured Linen Blazer", "Gurkha Trousers", "The Weekender Bag"]
  },
  {
    id: 5,
    title: "Look 05",
    season: "The Permanent Collection",
    image: WOMENS_LOOKBOOK_IMAGES[4] || WOMENS_LOOKBOOK_IMAGES[0],
    description: "The Alpine.",
    wearing: ["Shearling Bomber", "Heavy Gauge Knit", "Corduroy Trousers"]
  },
];



export const PRESS_ARTICLES = [
  {
    id: 1,
    publication: "JH Style Magazine",
    title: "From the Dolomites to Deloney Avenue",
    date: "Winter 2025",
    image: "/assets/press/jh_style.jpg",
    link: "https://jhstylemagazine.com/from-the-dolomites-to-deloney-avenue",
    excerpt: "Superbly-creative lifestyle designer begins a beautiful new chapter in Jackson Hole, WY."
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
  },
  {
    id: 4,
    publication: "Jackson Hole Chamber",
    title: "Designer Profile: Matteo Perin",
    date: "2025",
    image: "/assets/press/jackson_hole.jpg",
    link: "https://www.jacksonholechamber.com/listing/matteo-perin/1897/",
    excerpt: "Creating bespoke luxury items for an array of international celebrities and business leaders."
  }
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
