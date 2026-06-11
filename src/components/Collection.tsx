
import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveImage } from './ResponsiveImage';
import { ProductService } from '@/services/productService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { TextReveal } from './TextReveal';
import { Product } from '../types';
import { useInquiry } from '../context/InquiryContext';

// Internal Tilt Card Component for 3D Effect (Desktop only)
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }> = ({ children, className = "", onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile || !cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        setRotation({ x: yPct * -5, y: xPct * 5 });
    };

    const handleMouseEnter = () => { if (!isMobile) setIsHovering(true); };
    const handleMouseLeave = () => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`${className}`}
            style={{
                transform: isHovering && !isMobile
                    ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
                    : 'translateZ(0)',
                transition: 'transform 0.15s ease-out',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
};

export const Collection: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { openInquiry } = useInquiry();
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll Logic Refs
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [maxTranslate, setMaxTranslate] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState('400vh');
    const [isFinished, setIsFinished] = useState(false);

    // Fetch Products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await ProductService.getProducts();
                setProducts(data);
                // Artificial easing for smoothness
                setTimeout(() => setLoading(false), 200);
            } catch (error) {
                console.error("Failed to load collection:", error);
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Layout Fix: Force mobile overflow container to start at left=0 exactly when viewed
    // Some mobile browsers forcefully snap to the center of a flex-container when it enters the viewport.
    useEffect(() => {
        if (loading || products.length === 0 || !trackRef.current || window.innerWidth >= 768) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (trackRef.current) {
                        trackRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
                    }
                    // Optional: Unobserve after successful reset
                    if (sectionRef.current) {
                        observer.unobserve(sectionRef.current);
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [loading, products]);

    // Quick View Handlers
    const handleQuickView = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTimeout(() => setSelectedProduct(null), 500); // Wait for animation to finish
    };

    const handleAddToBag = () => {
        if (selectedProduct) {
            openInquiry(selectedProduct);
            handleCloseModal();
        }
    };

    const handleStartInquiry = (e: React.MouseEvent) => {
        e.preventDefault();

        const scrollToContact = () => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                if (window.lenis) {
                    window.lenis.scrollTo(contactSection);
                } else {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        // If we are already on the homepage (or strict / path)
        if (location.pathname === '/') {
            scrollToContact();
        } else {
            // Navigate to home first, then scroll
            navigate('/');
            setTimeout(scrollToContact, 500);
        }
    };

    // Calculate dynamic width of the track and required section height
    useEffect(() => {
        if (loading) return;

        const calculateDimensions = () => {
            if (trackRef.current && window.innerWidth >= 768) {
                const trackWidth = trackRef.current.scrollWidth;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const maxTrans = Math.max(0, trackWidth - viewportWidth + 50);
                setMaxTranslate(maxTrans);

                // 0.55 scroll-to-track ratio: the gallery still travels its full
                // width, but the vertical scroll it taxes is roughly halved.
                const calculatedHeight = Math.round(maxTrans * 0.55) + viewportHeight;
                setDynamicHeight(`${calculatedHeight}px`);
            } else {
                setDynamicHeight('auto');
            }
        };

        calculateDimensions();
        setTimeout(calculateDimensions, 100);

        const resizeObserver = new ResizeObserver(() => {
            calculateDimensions();
        });

        if (trackRef.current) {
            resizeObserver.observe(trackRef.current);
        }

        window.addEventListener('resize', calculateDimensions);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            resizeObserver.disconnect();
        };
    }, [loading, products]);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current || !trackRef.current) return;
            if (window.innerWidth < 768) return;

            const section = sectionRef.current;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;

            const start = sectionTop;
            const end = sectionTop + sectionHeight - viewportHeight;

            if (scrollY >= start && scrollY <= end) {
                const progress = (scrollY - start) / (end - start);
                setScrollProgress(progress);
                setIsFinished(progress > 0.95);
            } else if (scrollY < start) {
                setScrollProgress(0);
                setIsFinished(false);
            } else if (scrollY > end) {
                setScrollProgress(1);
                setIsFinished(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading]);

    const translateX = -(scrollProgress * maxTranslate);

    return (
        <section
            id="collection"
            ref={sectionRef}
            className="relative bg-matteo-cream dark:bg-matteo-black transition-colors duration-700 min-h-screen"
            style={{ height: dynamicHeight }}
        >
            {/* Loading State - Silent Luxury Fade */}
            <div className={`absolute inset-0 z-50 bg-matteo-cream dark:bg-matteo-black flex items-center justify-center transition-opacity duration-1000 pointer-events-none ${loading ? 'opacity-100' : 'opacity-0'}`}>
            </div>

            <div className={`relative h-auto md:sticky md:top-0 md:h-screen md:overflow-hidden flex flex-col justify-center transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>

                <div className="md:absolute md:top-8 md:left-0 w-full px-6 md:px-12 z-10 flex justify-between items-start md:items-end pt-12 md:pt-0 mb-8 md:mb-0">
                    <div>
                        <TextReveal className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-matteo-cream font-light mt-4">
                            The Collection
                        </TextReveal>
                    </div>
                    {/* Progress readout — hidden until the journey begins so a static "0%" never ships */}
                    <div className={`hidden md:block text-right transition-opacity duration-500 ${scrollProgress > 0.01 ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
                        <span className="font-serif text-xl text-matteo-charcoal dark:text-white">
                            {Math.round(scrollProgress * 100)}%
                        </span>
                    </div>
                </div>

                <div
                    ref={trackRef}
                    className={`
                flex items-center gap-6 md:gap-10 px-6 md:px-12
                w-full md:w-max
                overflow-x-auto md:overflow-visible
                snap-x snap-mandatory md:snap-none
                py-12 md:py-0
            `}
                    style={{
                        transform: window.innerWidth >= 768 ? `translate3d(${translateX}px, 0, 0)` : 'translateZ(0)',
                        willChange: 'transform',
                        WebkitTransform: window.innerWidth >= 768 ? `translate3d(${translateX}px, 0, 0)` : 'translateZ(0)',
                    }}
                >

                    <div className="hidden md:flex flex-col justify-center w-[25vw] max-w-sm shrink-0 pr-8 border-r border-matteo-charcoal/10 dark:border-white/10 h-[400px]">
                        <span className="block mt-8 font-sans text-[10px] uppercase tracking-widest text-matteo-orange">
                            Latest
                        </span>
                    </div>

                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="relative shrink-0 w-[85vw] md:w-[35vw] max-w-[600px] snap-center group"
                        >
                            <TiltCard
                                onClick={(e) => handleQuickView(e, product)}
                                className="block relative aspect-[2/3] overflow-hidden bg-[#EBEBEB] dark:bg-[#1a1a1a] shadow-sm group-hover:shadow-2xl transition-all duration-500"
                            >
                                <div data-cursor-text="Quick View" className="w-full h-full">
                                    <ResponsiveImage
                                        baseSrc={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.19,1,0.22,1)] scale-100 dark:brightness-90"
                                        style={{ objectPosition: 'center center' }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors duration-500"></div>
                                </div>
                            </TiltCard>
                        </div>
                    ))}

                    <div className="shrink-0 w-[85vw] md:w-[40vw] max-w-[600px] flex items-center justify-center h-[400px] md:h-[500px] snap-center">
                        <div className="w-full h-full border border-matteo-charcoal/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-8 md:p-16 flex flex-col justify-center items-start group hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-matteo-black transition-all duration-700">
                            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange mb-6">
                                Bespoke Services
                            </span>
                            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8">
                                The Commission</h3>
                            <p className="font-serif text-lg opacity-70 mb-12 max-w-sm">
                                Architecting the personal wardrobe. From specific fabric selection to final fitting, the process is absolute.
                            </p>

                            <div className="flex items-center gap-8 w-full mt-auto">
                                <Link to="/bespoke" className="font-sans text-xs uppercase tracking-[0.2em] border-b border-current pb-1 hover:text-matteo-orange transition-colors">
                                    Process
                                </Link>
                                <button
                                    onClick={handleStartInquiry}
                                    className="font-sans text-xs uppercase tracking-[0.2em] border-b border-current pb-1 hover:text-matteo-orange transition-colors text-left"
                                >
                                    Enquire
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-[10vw] shrink-0"></div>

                </div>

                <div className="hidden md:block absolute bottom-12 left-12 right-12 h-[1px] bg-matteo-charcoal/10 dark:bg-white/10 overflow-hidden">
                    <div
                        className="h-full bg-matteo-charcoal dark:bg-white transition-transform duration-100 ease-linear origin-left"
                        style={{ transform: `scaleX(${scrollProgress})` }}
                    ></div>
                </div>

                <div
                    className={`hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-700 ${isFinished ? 'opacity-100' : 'opacity-0'}`}
                >
                    <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Continue</span>
                    <div className="w-[1px] h-8 bg-matteo-stone animate-bounce"></div>
                </div>

            </div>

            {selectedProduct && (
                <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-500 ${isModalVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                    <div
                        className="absolute inset-0 bg-black/20  transition-opacity duration-500"
                        onClick={handleCloseModal}
                    ></div>

                    <div
                        className={`
                    relative w-full md:w-[60vw] lg:w-[45vw] h-full bg-matteo-cream dark:bg-[#111] shadow-2xl overflow-y-auto
                    transform transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
                    ${isModalVisible ? 'translate-x-0' : 'translate-x-full'}
                  `}
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center border border-matteo-charcoal/10 dark:border-white/10 rounded-full hover:bg-matteo-charcoal hover:text-white dark:hover:bg-white dark:hover:text-matteo-black dark:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="flex flex-col h-full">
                            <div className="w-full h-[50vh] md:h-[55vh] relative overflow-hidden bg-[#F0F0F0] dark:bg-[#0a0a0a]">
                                <ResponsiveImage
                                    baseSrc={selectedProduct.image}
                                    alt={selectedProduct.title}
                                    className="w-full h-full object-cover dark:brightness-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50"></div>
                            </div>

                            <div className="p-8 md:p-12 flex-1 flex flex-col">
                                <div className="mb-8">
                                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange mb-3 block">
                                        {selectedProduct.category}
                                    </span>
                                    <h2 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white mb-4 font-light leading-none">
                                        {selectedProduct.title}
                                    </h2>
                                </div>

                                <p className="font-serif text-gray-500 dark:text-gray-400 leading-relaxed text-lg mb-8 max-w-lg">
                                    {selectedProduct.description || "A bespoke piece, crafted with Italian excellence. Every detail is considered, every stitch intentional."}
                                </p>

                                <div className="mt-auto pt-8 border-t border-matteo-charcoal/10 dark:border-white/10">
                                    <button 
                                        onClick={handleAddToBag}
                                        className="bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-8 py-3 font-sans text-[10px] uppercase tracking-widest hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors flex items-center justify-center min-w-[200px]"
                                    >
                                        Request Bespoke Look
                                    </button>
                                    <Link
                                        to={`/collection/${selectedProduct.id}`}
                                        className="block mt-6 text-center font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-matteo-charcoal dark:hover:text-white transition-colors"
                                    >
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};
