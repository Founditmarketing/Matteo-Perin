import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { IMAGES } from '../constants';
import { ProductService } from '@/services/productService';
import { RevealOnScroll } from './RevealOnScroll';
import { useInquiry } from '../context/InquiryContext';


export const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { openInquiry } = useInquiry();

    const [article, setArticle] = useState<any | null>(null);
    const [nextArticle, setNextArticle] = useState<any | null>(null);
    const [relatedProduct, setRelatedProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Reading Progress State
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch Data
        const loadData = async () => {
            if (!slug) return;
            try {
                // Load all necessary info (simulated for now, would be specific endpoints later)
                const [allArticles, allProducts] = await Promise.all([
                    ProductService.getArticles(),
                    ProductService.getProducts()
                ]);

                const idx = allArticles.findIndex(a => a.slug === slug);
                if (idx !== -1) {
                    setArticle(allArticles[idx]);

                    // Next Article Logic
                    const nextIdx = (idx + 1) % allArticles.length;
                    setNextArticle(allArticles[nextIdx]);

                    // Related Product Logic
                    const productIdx = idx % allProducts.length;
                    setRelatedProduct(allProducts[productIdx] || allProducts[0]);
                } else {
                    setArticle(null);
                }

                setTimeout(() => setLoading(false), 200);

            } catch (error) {
                console.error("Failed to load article:", error);
                setLoading(false);
            }
        };

        loadData();

        let ticking = false;
        const updateScrollProgress = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const scrollPx = document.documentElement.scrollTop;
                const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = scrollPx / winHeightPx;
                setReadingProgress(scrolled);
                ticking = false;
            });
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollProgress);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black flex items-center justify-center transition-colors duration-700">
                {/* Silent Loading */}
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black flex items-center justify-center">
                <div className="text-center">
                    <h2 className="font-serif text-3xl mb-4 text-matteo-charcoal dark:text-white">Story Not Found</h2>
                    <Link to="/journal" className="font-sans text-xs uppercase tracking-widest border-b border-matteo-charcoal dark:border-white pb-1 text-matteo-charcoal dark:text-white">Return to Journal</Link>
                </div>
            </div>
        );
    }

    return (
        <article className="bg-matteo-cream dark:bg-matteo-black min-h-screen relative transition-colors duration-700 animate-fade-in-up">

            <Helmet>
                <title>{`${article.title} | Matteo Perin Journal`}</title>
                <meta name="description" content={article.excerpt || `${article.title} — from the Matteo Perin Journal.`} />
                <link rel="canonical" href={`https://www.matteoperin.com/journal/${article.slug}`} />
                <meta property="og:title" content={`${article.title} | Matteo Perin Journal`} />
                <meta property="og:description" content={article.excerpt || ''} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://www.matteoperin.com/journal/${article.slug}`} />
                {article.image && <meta property="og:image" content={`https://www.matteoperin.com${article.image}`} />}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": article.title,
                        "description": article.excerpt || "",
                        "image": article.image ? `https://www.matteoperin.com${article.image}` : undefined,
                        "datePublished": article.date || undefined,
                        "articleSection": article.category || undefined,
                        "author": { "@type": "Organization", "name": "Matteo Perin" },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Matteo Perin",
                            "url": "https://www.matteoperin.com"
                        },
                        "mainEntityOfPage": `https://www.matteoperin.com/journal/${article.slug}`
                    })}
                </script>
            </Helmet>

            {/* Reading Progress Indicator */}
            <div className="fixed top-0 left-0 h-1 bg-matteo-orange z-[60] transition-all duration-100 ease-out" style={{ width: `${readingProgress * 100}%` }}></div>

            {/* Hero Section - Fixed background effect */}
            <div className="w-full h-[90vh] relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Simple Parallax via CSS attachment or transform would go here, using fixed for classic feel */}
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover fixed top-0 left-0 z-0"
                        style={{ height: '100vh', objectPosition: 'center' }}
                    />
                    <div className="absolute inset-0 bg-black/30 fixed top-0 h-screen z-0"></div>
                </div>

                {/* Hero Content Overlay - Scrolls naturally */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 pb-24 md:pb-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent mt-[40vh]">
                    <div className="max-w-[1920px] mx-auto w-full text-center md:text-left">
                        <RevealOnScroll>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/20 pb-8 mb-8">
                                <div>
                                    <Link to="/journal" className="inline-block text-white/70 hover:text-white font-sans text-[10px] uppercase tracking-[0.2em] mb-6 transition-colors">
                                        &larr; Back to Journal
                                    </Link>
                                    <h1 className="text-white font-serif text-5xl md:text-7xl lg:text-9xl leading-[0.9] font-light max-w-4xl tracking-tight">
                                        {article.title}
                                    </h1>
                                </div>
                                <div className="md:text-right">
                                    <span className="block text-white/90 font-sans text-[10px] uppercase tracking-[0.2em] mb-2">
                                        {article.category}
                                    </span>
                                    <span className="block text-white/60 font-serif italic text-lg">
                                        {article.date}
                                    </span>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </div>

            {/* Main Content Layout with Sticky Sidebar */}
            <div className="relative z-20 bg-matteo-cream dark:bg-matteo-black pt-24 md:pt-32 pb-32 transition-colors duration-700">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12 lg:gap-32">

                    {/* Left Sidebar - Sticky */}
                    <div className="hidden lg:block w-1/5 h-full">
                        <div className="sticky top-32 flex flex-col gap-12">
                            <div>
                                <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone block mb-4">Share</span>
                                <div className="flex flex-col gap-2 items-start">
                                    <button className="font-serif italic text-matteo-charcoal dark:text-white hover:text-matteo-orange dark:hover:text-matteo-orange transition-colors">Instagram</button>
                                    <button className="font-serif italic text-matteo-charcoal dark:text-white hover:text-matteo-orange dark:hover:text-matteo-orange transition-colors">Facebook</button>
                                    <button className="font-serif italic text-matteo-charcoal dark:text-white hover:text-matteo-orange dark:hover:text-matteo-orange transition-colors">Email</button>
                                </div>
                            </div>
                            <div>
                                <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone block mb-4">Reading Time</span>
                                <span className="font-serif text-xl text-matteo-charcoal dark:text-white">4 Min</span>
                            </div>
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="w-full lg:w-3/5">
                        <div className="font-serif text-matteo-charcoal/90 dark:text-gray-300 text-xl md:text-2xl leading-[1.6] md:leading-[1.8] max-w-prose mx-auto">
                            <RevealOnScroll delay={0.1}>
                                <p className="mb-12 first-letter:text-7xl md:first-letter:text-9xl first-letter:font-serif first-letter:text-matteo-orange first-letter:float-left first-letter:mr-4 first-letter:mt-[-1rem] first-letter:leading-none">
                                    It is in the details that we find the true measure of luxury. Not in the loudness of a logo, but in the silence of a stitch perfectly placed. When we embarked on this journey, the goal was not to add more noise to the world, but to strip away the unessential until only the pure form remained.
                                </p>
                            </RevealOnScroll>

                            <RevealOnScroll delay={0.2}>
                                <p className="mb-8">
                                    The process begins long before the first cut is made. It starts with the selection of the raw material. For this commission, we traveled to the highlands, seeking a fiber that offers resilience against the elements while maintaining a hand-feel that is unmistakably soft. We spoke with the herdsmen, understanding the seasons, the land, and the life of the flock.
                                </p>
                            </RevealOnScroll>

                            {/* Pull Quote */}
                            <RevealOnScroll delay={0.3} className="my-16 md:my-24 -mx-6 md:-mx-24">
                                <blockquote className="text-center">
                                    <p className="italic text-3xl md:text-5xl text-matteo-charcoal dark:text-white font-light leading-tight mb-8">
                                        "An object that does not age well is an object that has failed."
                                    </p>
                                    <cite className="font-sans text-[10px] uppercase tracking-widest text-matteo-orange not-italic">— Matteo Perin</cite>
                                </blockquote>
                            </RevealOnScroll>

                            <RevealOnScroll delay={0.4}>
                                <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-matteo-charcoal dark:text-white font-bold mb-6 mt-16">The Architecture of Cloth</h3>
                                <p className="mb-8">
                                    True style is biographical. It tells the story of where you have been and where you are going. This piece is designed to be a companion on that journey, aging gracefully, developing a patina that is unique to your life. As the leather softens and the colors deepen, it becomes less of an object and more of a memory.
                                </p>
                            </RevealOnScroll>
                        </div>

                        {/* Editorial Image Grid - Breakout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-24 w-full">
                            <RevealOnScroll className="md:mt-12">
                                <img src={IMAGES.atelier} alt="Process 1" loading="lazy" decoding="async" className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                                <span className="block mt-2 font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Fig 1. Pattern Cutting</span>
                            </RevealOnScroll>
                            <RevealOnScroll delay={0.2}>
                                <img src={IMAGES.jacket_detail} alt="Process 2" loading="lazy" decoding="async" className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                                <span className="block mt-2 font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Fig 2. Fabric Selection</span>
                            </RevealOnScroll>
                        </div>

                        <div className="font-serif text-matteo-charcoal/90 dark:text-gray-300 text-xl md:text-2xl leading-[1.6] md:leading-[1.8] max-w-prose mx-auto">
                            <p className="mb-12">
                                In a world obsessed with speed, we choose the luxury of time. Every hour spent in the atelier is an investment in the longevity of the final object. This is not fashion; this is architecture for the body. The drape of the fabric is engineered to move with you, not against you.
                            </p>
                        </div>

                        {/* Shop The Story Module */}
                        {relatedProduct && (
                            <RevealOnScroll className="my-24 border-y border-matteo-charcoal/10 dark:border-white/10 py-12 bg-white/50 dark:bg-white/5 -mx-6 md:-mx-12 px-6 md:px-12">
                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                    <div className="w-full md:w-1/3 aspect-[3/4] bg-[#F0F0F0] dark:bg-[#1a1a1a]">
                                        <img src={relatedProduct.image} alt={relatedProduct.title} loading="lazy" decoding="async" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal dark:brightness-90" />
                                    </div>
                                    <div className="w-full md:w-2/3">
                                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange mb-4 block">Shop The Story</span>
                                        <h3 className="font-serif text-3xl md:text-4xl text-matteo-charcoal dark:text-white mb-4">{relatedProduct.title}</h3>
                                        <p className="font-serif text-gray-500 dark:text-gray-400 mb-8 max-w-md">{relatedProduct.description?.substring(0, 100)}...</p>
                                        <div className="flex items-center gap-8">
                                            <span className="font-sans text-lg text-matteo-charcoal dark:text-white">${relatedProduct.price.toLocaleString()}</span>
                                            <button
                                                onClick={() => openInquiry(relatedProduct)}
                                                className="bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-8 py-3 font-sans text-[10px] uppercase tracking-widest hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors"
                                            >
                                                Request Bespoke Look
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        )}

                        <div className="font-serif text-matteo-charcoal/90 dark:text-gray-300 text-xl md:text-2xl leading-[1.6] md:leading-[1.8] max-w-prose mx-auto">
                            <p>
                                Finally, when the garment is complete, it is not simply shipped. It is presented. A handover is a ceremony, a transfer of custodianship. We are merely the creators; you are the one who will give it life.
                            </p>
                        </div>
                    </div>

                    {/* Right Sidebar - Empty or Nav */}
                    <div className="hidden lg:block w-1/5"></div>
                </div>
            </div>

            {/* Next Story Section */}
            {nextArticle && (
                <div className="bg-matteo-charcoal dark:bg-[#050505] text-white py-32 transition-colors duration-700">
                    <div className="max-w-[1920px] mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="order-2 md:order-1">
                                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-orange mb-6 block">Read Next</span>
                                <h3 className="font-serif text-4xl md:text-6xl mb-8 font-light leading-tight">
                                    {nextArticle.title}
                                </h3>
                                <p className="font-serif text-gray-400 italic text-xl mb-12 max-w-md">
                                    {nextArticle.excerpt}
                                </p>
                                <Link
                                    to={`/journal/${nextArticle.slug}`}
                                    className="inline-flex items-center gap-4 text-white group"
                                >
                                    <span className="font-sans text-xs uppercase tracking-[0.2em] border-b border-white pb-1 group-hover:text-matteo-orange group-hover:border-matteo-orange transition-colors">Continue Reading</span>
                                    <span className="group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
                                </Link>
                            </div>
                            <div className="order-1 md:order-2 aspect-video overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-700">
                                <Link to={`/journal/${nextArticle.slug}`} className="block w-full h-full">
                                    <img
                                        src={nextArticle.image}
                                        alt={nextArticle.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </article>
    );
};
