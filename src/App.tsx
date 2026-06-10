import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { InquiryProvider } from './context/InquiryContext';
import { CartProvider, useCart } from './context/CartContext';
import { CartSidebar } from './components/CartSidebar';

import { ThemeProvider } from './context/ThemeContext';
import { InquiryModal } from './components/InquiryModal';
import { Cursor } from './components/Cursor';
import { DigitalConcierge } from './components/DigitalConcierge';

// Code-split all page-level routes for smaller initial bundle
const Home = React.lazy(() => import('./components/Home').then(m => ({ default: m.Home })));
const MensLookbook = React.lazy(() => import('./components/MensLookbook').then(m => ({ default: m.MensLookbook })));
const WomensLookbook = React.lazy(() => import('./components/WomensLookbook').then(m => ({ default: m.WomensLookbook })));
const Journal = React.lazy(() => import('./components/Journal').then(m => ({ default: m.Journal })));
const Archive = React.lazy(() => import('./components/Archive').then(m => ({ default: m.Archive })));
const Bespoke = React.lazy(() => import('./components/Bespoke').then(m => ({ default: m.Bespoke })));
const TheHouse = React.lazy(() => import('./components/TheHouse').then(m => ({ default: m.TheHouse })));
const PrivateAccess = React.lazy(() => import('./components/PrivateAccess').then(m => ({ default: m.PrivateAccess })));
const Vault = React.lazy(() => import('./components/Vault').then(m => ({ default: m.Vault })));
const ClientPortal = React.lazy(() => import('./components/ClientPortal').then(m => ({ default: m.ClientPortal })));
const Privacy = React.lazy(() => import('./components/Privacy').then(m => ({ default: m.Privacy })));
const ArticleDetail = React.lazy(() => import('./components/ArticleDetail').then(m => ({ default: m.ArticleDetail })));
const ProductDetail = React.lazy(() => import('./components/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Press = React.lazy(() => import('./components/Press').then(m => ({ default: m.Press })));
const Lifestyle = React.lazy(() => import('./components/Lifestyle').then(m => ({ default: m.Lifestyle })));

const CrocJacketLanding = React.lazy(() => import('./components/CrocJacketLanding').then(m => ({ default: m.CrocJacketLanding })));
const FurnitureCollection = React.lazy(() => import('./components/FurnitureCollection').then(m => ({ default: m.FurnitureCollection })));
const DossierLogin = React.lazy(() => import('./components/DossierLogin').then(m => ({ default: m.DossierLogin })));
const DossierDashboard = React.lazy(() => import('./components/DossierDashboard').then(m => ({ default: m.DossierDashboard })));
const NotFound = React.lazy(() => import('./components/NotFound').then(m => ({ default: m.NotFound })));
const PrivateClientForm = React.lazy(() => import('./components/PrivateClientForm').then(m => ({ default: m.PrivateClientForm })));
const HiddenInventoryTest = React.lazy(() => import('./components/HiddenInventoryTest').then(m => ({ default: m.HiddenInventoryTest })));
const InventoryProductPage = React.lazy(() => import('./components/InventoryProductPage').then(m => ({ default: m.InventoryProductPage })));
const Checkout = React.lazy(() => import('./components/Checkout').then(m => ({ default: m.Checkout })));

// Inline Thank You Page — no separate file needed
interface OrderSummary {
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    email: string;
    name: string;
    city: string;
    items: { description: string; quantity: number; amountTotal: number }[];
}

const ThankYouPage: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const isDeposit = params.get('deposit') === 'true';
    const sessionId = params.get('session_id');
    const isOrder = Boolean(sessionId) || isDeposit;
    const [order, setOrder] = useState<OrderSummary | null>(null);
    const { clearCart } = useCart();

    // The purchase is complete — empty the bag.
    useEffect(() => {
        if (sessionId) clearCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Pull the real order from Stripe so the confirmation shows what was
    // actually purchased. Fails quietly to a generic confirmation.
    useEffect(() => {
        if (!sessionId) return;
        fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data && data.paymentStatus === 'paid') setOrder(data); })
            .catch(() => { /* generic confirmation is fine */ });
    }, [sessionId]);

    useEffect(() => {
        if (typeof (window as any).gtag !== 'function') return;

        // Google Ads conversion tag. The authoritative GA4 purchase event is
        // sent server-side from the Stripe webhook — do not duplicate it here.
        (window as any).gtag('event', 'conversion', { send_to: 'AW-17701157571/7bczCMWv35kcEMP1yPhB' });

        if (isDeposit) {
            (window as any).gtag('event', 'deposit_completed', {
                currency: 'USD',
                value: 25000,
                item_name: 'Bespoke Crocodile Jacket Deposit',
            });
        } else if (!isOrder) {
            // Inquiry-form landing (no purchase involved)
            (window as any).gtag('event', 'generate_lead', { lead_type: 'croc_jacket_inquiry' });
        }
    }, []);

    const heading = isDeposit ? 'Commission Reserved' : isOrder ? 'Order Confirmed' : 'Inquiry Received';
    const message = isDeposit
        ? 'Your deposit has been received and your commission slot is reserved. A senior Matteo Perin advisor will contact you within 24 hours to begin the consultation process.'
        : isOrder
            ? `Your order has been received${order?.city ? ` and will be prepared for delivery to ${order.city}` : ''}. ${order?.email ? `A confirmation has been sent to ${order.email}.` : 'A confirmation email is on its way.'}`
            : 'A senior Matteo Perin advisor will contact you within 24 hours to arrange your private consultation.';

    return (
        <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black flex items-center justify-center text-center px-6 py-32">
            <div className="max-w-lg w-full">
                <div className="w-16 h-16 rounded-full border border-matteo-orange flex items-center justify-center mx-auto mb-8">
                    <svg className="w-6 h-6 text-matteo-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-4 block">{heading}</span>
                <h1 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-6">Thank You{order?.name ? `, ${order.name.split(' ')[0]}` : ''}</h1>
                <p className="font-serif text-matteo-charcoal/60 dark:text-white/50 text-lg leading-relaxed mb-10">{message}</p>

                {order && order.items.length > 0 && (
                    <div className="text-left border-t border-b border-matteo-charcoal/10 dark:border-white/10 divide-y divide-matteo-charcoal/5 dark:divide-white/5 mb-10">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-baseline gap-4 py-4">
                                <span className="font-serif text-matteo-charcoal dark:text-white">
                                    {item.description}{item.quantity > 1 ? ` × ${item.quantity}` : ''}
                                </span>
                                <span className="font-sans text-xs text-matteo-charcoal/70 dark:text-white/60 shrink-0">
                                    ${(item.amountTotal / 100).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between items-baseline gap-4 py-4">
                            <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Total</span>
                            <span className="font-serif text-xl text-matteo-charcoal dark:text-white">${(order.amountTotal / 100).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                <Link
                    to={isDeposit ? '/bespoke-crocodile-jacket' : isOrder ? '/shop' : '/bespoke-crocodile-jacket'}
                    className="font-sans text-[10px] uppercase tracking-widest border-b border-matteo-orange text-matteo-orange pb-1 hover:opacity-70 transition-opacity"
                >
                    {isOrder && !isDeposit ? 'Continue Shopping' : 'Return to Bespoke Crocodile Jacket'}
                </Link>
            </div>
        </div>
    );
};


// Robust Scroll Handler to manage Route changes + Hash Anchors
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Capture UTM params on initial landing for attribution tracking
        const urlParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
            const val = urlParams.get(key);
            if (val && !sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, val);
            }
        });
        // Store the landing page URL
        if (!sessionStorage.getItem('landing_page')) {
            sessionStorage.setItem('landing_page', window.location.href);
        }
    }, []);

    useEffect(() => {
        // If no hash, just go to top
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            // If there is a hash, wait for page transition/render then scroll
            const id = hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    if (window.lenis) {
                        window.lenis.scrollTo(element, { offset: -50 }); // Slight offset for headers
                    } else {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 1200); // Delay matches the cinematic page transition duration slightly
        }
    }, [pathname, hash]);

    return null;
};

import { AnimatePresence, motion } from 'framer-motion'; // Add AnimatePresence

// ... existing ScrollToTop ...

// Cinematic Fluid Transition
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
};


// ... imports

// ... imports remain the same

// Extracted Inner Component to access useLocation context
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            {/* @ts-ignore */}
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home startAnimation={true} /></PageTransition>} />
                <Route path="/lookbook/men" element={<PageTransition><MensLookbook /></PageTransition>} />
                <Route path="/lookbook/women" element={<PageTransition><WomensLookbook /></PageTransition>} />
                <Route path="/journal" element={<PageTransition><Journal /></PageTransition>} />
                <Route path="/journal/:slug" element={<PageTransition><ArticleDetail /></PageTransition>} />

                {/* Archive Route retained without direct menu access */}
                <Route path="/collection" element={<PageTransition><Archive /></PageTransition>} />
                <Route path="/collection/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
                <Route path="/press" element={<PageTransition><Press /></PageTransition>} />
                <Route path="/bespoke" element={<PageTransition><Bespoke /></PageTransition>} />
                <Route path="/the-house" element={<PageTransition><TheHouse /></PageTransition>} />
                <Route path="/lifestyle" element={<PageTransition><Lifestyle /></PageTransition>} />
                <Route path="/access" element={<PageTransition><PrivateAccess /></PageTransition>} />
                <Route path="/vault" element={<PageTransition><Vault /></PageTransition>} />
                <Route path="/portal" element={<PageTransition><ClientPortal /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />

                <Route path="/bespoke-crocodile-jacket" element={<PageTransition><CrocJacketLanding /></PageTransition>} />
                <Route path="/furniture" element={<PageTransition><FurnitureCollection /></PageTransition>} />
                <Route path="/dossier" element={<PageTransition><DossierLogin /></PageTransition>} />
                <Route path="/dossier-dashboard" element={<PageTransition><DossierDashboard /></PageTransition>} />
                <Route path="/private-client" element={<PageTransition><PrivateClientForm /></PageTransition>} />
                <Route path="/inventory-test-hidden" element={<PageTransition><HiddenInventoryTest /></PageTransition>} />
                <Route path="/inventory-test-hidden/:productName" element={<PageTransition><InventoryProductPage /></PageTransition>} />
                <Route path="/shop" element={<PageTransition><HiddenInventoryTest /></PageTransition>} />
                <Route path="/shop/:productName" element={<PageTransition><InventoryProductPage /></PageTransition>} />
                <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
                <Route path="/thank-you" element={<PageTransition><ThankYouPage /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <ThemeProvider>
            <CartProvider>
            <InquiryProvider>
                <Router>
                    <ScrollToTop />
                    <div className="relative w-full min-h-screen flex flex-col justify-between transition-colors duration-700 bg-matteo-cream dark:bg-matteo-black text-matteo-charcoal dark:text-matteo-cream">
                        {/* Global Cursor Override Options */}
                        <Cursor />
                        <DigitalConcierge />
                        <CartSidebar />

                        <Navigation />
                        <InquiryModal />

                        <main className="flex-grow">
                            <Suspense fallback={<div className="min-h-screen bg-matteo-cream dark:bg-matteo-black" />}>
                                <AnimatedRoutes />
                            </Suspense>
                        </main>

                        <Footer />
                    </div>
                </Router>
            </InquiryProvider>
            </CartProvider>
        </ThemeProvider>
    );
}

export default App;
