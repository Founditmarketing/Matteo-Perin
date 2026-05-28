
import { PRODUCTS, VAULT_ITEMS, ARTICLES, LOOKBOOK_ITEMS } from '@/constants';
import { Product, Article, LookbookItem, Material } from '@/types';
import { LightspeedService } from './lightspeedService';

// Simulate API delay for realistic loading states
const SIMULATED_DELAY = 800; // ms

export const ProductService = {

    async getProducts(): Promise<Product[]> {
        // Bypass Lightspeed API per user request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(PRODUCTS);
            }, SIMULATED_DELAY);
        });
    },

    async getProductById(id: any): Promise<Product | undefined> {
        // Bypass Lightspeed API per user request
        return new Promise((resolve) => {
            setTimeout(() => {
                const product = PRODUCTS.find(p => String(p.id) === String(id));
                resolve(product);
            }, SIMULATED_DELAY);
        });
    },

    async getVaultItems(): Promise<Product[]> {
        // Bypass Lightspeed API per user request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(VAULT_ITEMS);
            }, SIMULATED_DELAY);
        });
    },

    async getArticles(): Promise<Article[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ARTICLES);
            }, SIMULATED_DELAY);
        });
    },

    async getLookbook(): Promise<LookbookItem[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(LOOKBOOK_ITEMS);
            }, SIMULATED_DELAY);
        });
    },

    async getArticleBySlug(slug: string): Promise<Article | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const article = ARTICLES.find(a => a.slug === slug);
                resolve(article);
            }, SIMULATED_DELAY);
        });
    },

    async getMaterials(): Promise<Material[]> {
        // Internal data for now, would be API call in future
        const MATERIALS_DATA: Material[] = [
            { name: "Super 200s", origin: "Italy", desc: "Wool so fine it behaves like silk.", image: "/assets/fabrics/wool.jpg" },
            { name: "Croc", origin: "Australia", desc: "Matte Porosus Crocodile. The texture of authority.", image: "/assets/fabrics/croc.jpg" },
            { name: "Baby Cashmere", origin: "Italy", desc: "The under-fleece of the Hircus goat.", image: "/assets/fabrics/baby cashmere.jpg" },
            { name: "Vicuña", origin: "Italy", desc: "The Gold of the Andes. Unrivaled softness.", image: "/assets/fabrics/vicuna.jpg" }
        ];

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MATERIALS_DATA);
            }, SIMULATED_DELAY);
        });
    }
};
