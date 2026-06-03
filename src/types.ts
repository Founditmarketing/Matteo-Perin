
export interface NavItem {
  label: string;
  href: string;
}

export interface Product {
  id: number;
  title: string;
  category: string;
  image: string;
  price: number;
  gender: 'men' | 'women' | 'unisex'; // Added gender discrimination
  wide?: boolean;
  description?: string;
  link?: string;
  gallery?: string[]; // Multiple images for detail page
}

export interface Article {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
  slug: string;
}

export interface StorySection {
  title: string;
  subtitle: string;
  text: string;
  image: string;
  align: 'left' | 'right';
}

export enum SectionType {
  HERO,
  PHILOSOPHY,
  COLLECTION,
  LIFESTYLE,
  CONTACT
}

export interface CustomizationOptions {
  material?: string;
  monogram?: string;
  notes?: string;
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for the item in the cart (to distinguish customized versions)
  quantity: number;
  customizations?: CustomizationOptions;
}

export interface LookbookItem {
  id: number;
  title: string; // e.g., "Look 01"
  season: string;
  image: string;
  description: string;
  wearing: string[]; // List of items in the photo
}

export interface Material {
  name: string;
  origin: string;
  desc: string;
  image: string;
}

declare global {
  interface Window {
    lenis: any;
  }
}
