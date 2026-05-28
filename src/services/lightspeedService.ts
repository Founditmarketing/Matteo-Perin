
import { Product } from '@/types';

// X-Series (Vend) API endpoint: https://{store_prefix}.retail.lightspeed.app/api/2.0/products
// Auth: Bearer {token}

// Use type assertion for ImportMeta to avoid environment-specific type errors in some configurations
const env = (import.meta as any).env;
const LIGHTSPEED_DOMAIN = env.VITE_LIGHTSPEED_DOMAIN || '';
const LIGHTSPEED_TOKEN = env.VITE_LIGHTSPEED_TOKEN || '';

export const LightspeedService = {
    /**
     * Fetches products from Lightspeed X-Series API.
     */
    async fetchProducts(): Promise<Product[]> {
        if (!LIGHTSPEED_DOMAIN || !LIGHTSPEED_TOKEN) {
            console.warn('Lightspeed X-Series credentials missing. Returning high-fidelity mock data.');
            return this.getMockXSeriesData();
        }

        try {
            // Using the Vite proxy to handle CORS and auth headers securely
            const response = await fetch('/api/lightspeed/products', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Lightspeed API Error: ${response.statusText}`);
            }

            const json = await response.json();
            return this.transformXSeriesData(json.data);
        } catch (error) {
            console.error('Failed to fetch from Lightspeed:', error);
            return this.getMockXSeriesData();
        }
    },

    /**
     * Transforms raw X-Series (Vend) data into our internal Product interface.
     */
    transformXSeriesData(data: any[]): Product[] {
        return data.map(item => {
            // Check for image_url directly on the item, or fallback to the images array, or a default placeholder
            let imageUrl = '/assets/placeholder-luxury.jpg';
            if (item.image_url) {
                imageUrl = typeof item.image_url === 'string' ? item.image_url : '/assets/placeholder-luxury.jpg';
            } else if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0].url) {
                imageUrl = typeof item.images[0].url === 'string' ? item.images[0].url : '/assets/placeholder-luxury.jpg';
            }

            // Provide a guaranteed title safely fallback
            const finalTitle = item.name && typeof item.name === 'string' ? item.name : 'Unnamed Commission';

            // Generate a safe string for category taking into account possible object structures unhandled by React
            let finalCategory = 'Collection';
            if (item.type && typeof item.type === 'string') {
                finalCategory = item.type;
            } else if (item.product_category && item.product_category.name && typeof item.product_category.name === 'string') {
                finalCategory = item.product_category.name;
            } else if (item.type && typeof item.type === 'object' && item.type.name) {
                finalCategory = item.type.name;
            }

            // Cast 'id' to string or number safely without NaN
            const safeId = typeof item.id === 'string' ? item.id : (Number(item.id) || Math.floor(Math.random() * 100000));

            return {
                id: safeId as any, // Cast to any to satisfy the Product type if it strictly requires number without breaking runtime
                title: finalTitle,
                price: Number(item.price_including_tax || item.price || 0),
                image: imageUrl,
                description: typeof item.description === 'string' && item.description.length > 0 ? item.description : 'Exclusive piece from the Matteo Perin archive. Details available upon request.',
                category: finalCategory,
                gender: 'unisex' as const,
                link: item.handle ? `/product/${item.handle}` : undefined
            };
        });
    },

    /**
     * High-fidelity mock data that replicates the X-Series structure.
     */
    async getMockXSeriesData(): Promise<Product[]> {
        // Simulating network latency for Silent Luxury transitions
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                id: 101,
                title: "The Signature Double-Breasted",
                price: 5400,
                image: "/assets/products/cashmere_blazer.jpg",
                description: "Hand-stitched in Naples. Super 200s wool. A masterclass in unstructured tailoring.",
                category: "Collection",
                gender: "men",
                link: "/product/signature-double-breasted"
            },
            {
                id: 102,
                title: "The Weekender",
                price: 4200,
                image: "/assets/products/weekender_bag.jpg",
                description: "Tuscan vegetable-tanned leather. 48-hour capacity. Solid brass hardware. Engineered for the departure.",
                category: "Travel",
                gender: "unisex",
                link: "#"
            },
            {
                id: 103,
                title: "Suede Field Jacket",
                price: 3850,
                image: "/assets/products/suede_jacket.jpg",
                description: "Goat suede. Horn buttons. Silk-blend lining. Transitions effortlessly from city streets to alpine retreats.",
                category: "Outerwear",
                gender: "men",
                link: "#"
            },
            {
                id: 104,
                title: "Heritage Clutch",
                price: 1250,
                image: "/assets/products/heritage_clutch.jpg",
                description: "Hand-stitched construction. Signature edge painting. An evening essential.",
                category: "Accessories",
                gender: "women",
                link: "#"
            },
            {
                id: 105,
                title: "Cashmere Blazer",
                price: 2100,
                image: "/assets/products/cashmere_blazer.jpg",
                description: "Biella-sourced cashmere. Unstructured. Warmth without weight. Available for commission.",
                category: "Tailoring",
                gender: "men",
                link: "#"
            },
            {
                id: 106,
                title: "Matte Crocodile Weekender",
                price: 12500,
                image: "/assets/products/heritage_clutch.jpg",
                description: "Australian Porosus Crocodile. Midnight black. The apex of travel accessories.",
                category: "Archive",
                gender: "unisex",
                link: "/product/matte-croc-weekender"
            },
            {
                id: 107,
                title: "The Aviator",
                price: 650,
                image: "/assets/products/aviator_sunglasses.jpg",
                description: "Japanese acetate. Titanium hardware. Clarity and protection.",
                category: "Eyewear",
                gender: "unisex",
                link: "#"
            },
            {
                id: 108,
                title: "Silk Evening Gown",
                price: 4500,
                image: "/assets/Finals/250409_MatteoPerin_LookBook_Spring25_WLook1_010.jpg",
                description: "Pure Tussah silk. Hand-draped. A lesson in fluid architecture.",
                category: "Couture",
                gender: "women",
                link: "#"
            }
        ];
    }
};
