
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { IMAGES, TEXTS } from '../constants';
import { ProductService } from '@/services/productService';
import { Material } from '@/types';
import { Logo } from './Logo';
import { RevealOnScroll } from './RevealOnScroll';
import { Magnetic } from './Magnetic';
import { reportInquiryConversion } from '@/lib/gtagConversion';

const PROCESS_STEPS = [
    {
        id: "01",
        title: "The Dialogue",
        subtitle: "The Individual",
        description: "We begin with dialogue, not measurement. How do you travel? How do you stand? A suit is not just cloth; it is communication.",
        image: IMAGES.hero_portrait
    },
    {
        id: "02",
        title: "The Architecture",
        subtitle: "The Blueprint",
        description: "No templates. A second skin, drafted from zero. This is the blueprint of your second skin, accounting for every nuance of your posture.",
        image: IMAGES.atelier
    },
    {
        id: "03",
        title: "The Fitting",
        subtitle: "Sculpting",
        description: "The garment is assembled in a 'basted' state. We meet to refine the silhouette. Perfection is not an accident; it is a discipline.",
        image: IMAGES.journal_4
    },
    {
        id: "04",
        title: "The Handover",
        subtitle: "Acquisition",
        description: "After 50+ hours of hand-work, the commission is complete. No longer ours. Yours.",
        image: IMAGES.journal_3
    }
];



export const Bespoke: React.FC = () => {
    const location = useLocation();

    // Material State
    const [materials, setMaterials] = useState<Material[]>([]);
    const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(location.state?.inquire || false);
    const [step, setStep] = useState(location.state?.inquire ? 1 : 0); // 0: Intro, 1: Name, 2: Vision, 3: Details, 4: Success

    // Form State
    const [vision, setVision] = useState(location.state?.look ? `I am inquiring about ${location.state.look} from the Lookbook.` : '');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Commission Metadata
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    const [refNo, setRefNo] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        setRefNo(`REQ-${Math.floor(Math.random() * 10000)}`);

        const loadMaterials = async () => {
            try {
                const data = await ProductService.getMaterials();
                setMaterials(data);
                if (data.length > 0) setActiveMaterial(data[0]);
                setTimeout(() => setLoading(false), 200);
            } catch (error) {
                console.error("Failed to load materials:", error);
                setLoading(false);
            }
        };
        loadMaterials();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Capture UTM params for attribution
            const urlParams = new URLSearchParams(window.location.search);
            const utmData: Record<string, string> = {};
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
                const val = urlParams.get(key) || sessionStorage.getItem(key);
                if (val) utmData[key] = val;
            });

            await fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'contact',
                    name,
                    email,
                    phone,
                    subject: 'Bespoke Consultation Request',
                    message: `Vision: ${vision}\nCity: ${city}`,
                    ...utmData,
                    referrer: document.referrer || '',
                    landingPage: sessionStorage.getItem('landing_page') || window.location.href,
                }),
            }).catch(() => {});
            // Also push to HubSpot tracking
            const _hsq = (window as any)._hsq = (window as any)._hsq || [];
            const nameParts = name.trim().split(' ');
            _hsq.push(["identify", {
                email,
                firstname: nameParts[0] || '',
                lastname: nameParts.slice(1).join(' ') || '',
                phone,
            }]);
            _hsq.push(["trackPageView"]);
        } catch (e) {
            // Don't block UX
        }
        // Fire Google Ads conversion
        reportInquiryConversion();
        setIsSubmitted(true);
    };

    return (
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen text-matteo-charcoal dark:text-white transition-colors duration-700">
            <Helmet>
                <title>The Bespoke Commission Process | Made-to-Measure Luxury | Matteo Perin</title>
                <meta name="description" content="Commission a bespoke garment with Matteo Perin. From private consultation and material selection to hand-finishing in Italy, discover the made-to-measure process behind our one-of-a-kind luxury pieces." />
                <meta name="keywords" content="bespoke commission, made to measure luxury, custom tailoring Jackson Wyoming, bespoke menswear, bespoke womenswear, Matteo Perin bespoke" />
                <link rel="canonical" href="https://www.matteoperin.com/bespoke" />
                <meta property="og:title" content="The Bespoke Commission Process | Matteo Perin" />
                <meta property="og:description" content="From private consultation to hand-finishing in Italy — the made-to-measure process behind Matteo Perin's one-of-a-kind pieces." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/bespoke" />
            </Helmet>

            {/* --- HERO SECTION --- */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/matteoorange.jpg"
                        alt="Atelier Table"
                        className="w-full h-full object-cover object-top grayscale opacity-20 dark:opacity-10 scale-105"
                        style={{ animationDuration: '10s' }}
                    />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <RevealOnScroll>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-matteo-orange mb-6 block">
                            Service: Bespoke
                        </span>
                        <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl font-light leading-none tracking-tight mb-8">
                            One of One</h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.2}>
                        <p className="font-serif text-xl md:text-2xl text-matteo-charcoal/70 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
                            {TEXTS.BESPOKE_TEXT}
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.4} className="mt-16">
                        <div className="w-[1px] h-24 bg-matteo-charcoal/20 dark:bg-white/20 mx-auto"></div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* --- THE BLUEPRINT (PROCESS) --- */}
            <section className="py-32 px-6 md:px-12 max-w-[1920px] mx-auto">
                <div className="flex flex-col gap-32 md:gap-48 relative">

                    {/* Connecting Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-matteo-charcoal/10 dark:bg-white/10 -ml-[0.5px] hidden md:block"></div>

                    {PROCESS_STEPS.map((step, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={step.id} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 relative ${isEven ? '' : 'md:flex-row-reverse'}`}>

                                {/* Step Marker (Center) */}
                                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-matteo-cream dark:bg-matteo-black border border-matteo-charcoal/20 dark:border-white/20 rounded-full items-center justify-center z-10 font-mono text-xs">
                                    {step.id}
                                </div>

                                {/* Image Side */}
                                <div className="w-full md:w-1/2">
                                    <RevealOnScroll className="relative aspect-[4/3] overflow-hidden group">
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1.5s] group-hover:scale-105 dark:brightness-75"
                                        />
                                    </RevealOnScroll>
                                </div>

                                {/* Text Side */}
                                <div className={`w-full md:w-1/2 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                                    <RevealOnScroll delay={0.2}>
                                        <span className="font-mono text-[10px] text-matteo-orange uppercase tracking-widest mb-4 block">
                                            Phase {step.id}
                                        </span>
                                        <h2 className="font-serif text-4xl md:text-5xl mb-6">{step.title}</h2>
                                        <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-matteo-stone mb-6">
                                            {step.subtitle}
                                        </h3>
                                        <p className="font-serif text-lg text-matteo-charcoal/70 dark:text-white/70 leading-relaxed max-w-md ml-auto mr-auto md:mx-0">
                                            {step.description}
                                        </p>
                                    </RevealOnScroll>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- INTERACTIVE MATERIALS LAB --- */}
            <section className="py-32 bg-matteo-charcoal text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    {activeMaterial && (
                        <img src={activeMaterial.image} className="w-full h-full object-cover  scale-125 transition-all duration-1000" />
                    )}
                </div>

                <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-16 md:gap-32">

                    {/* Left: Material List */}
                    <div className="w-full md:w-1/3">
                        <RevealOnScroll>
                            <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-orange mb-12 block">
                                The Fabric Archive
                            </span>
                            <div className="space-y-8">
                                {materials.map((mat) => (
                                    <button
                                        key={mat.name}
                                        onMouseEnter={() => setActiveMaterial(mat)}
                                        className={`block text-left w-full group transition-all duration-300 py-3 ${activeMaterial?.name === mat.name ? 'opacity-100 translate-x-4' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <h3 className="font-serif text-4xl md:text-5xl mb-2">{mat.name}</h3>
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-matteo-orange">
                                            {mat.origin}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </RevealOnScroll>
                    </div>

                    {/* Right: Visual Preview */}
                    <div className="w-full md:w-2/3 h-[50vh] md:h-[70vh] relative border border-white/10 bg-black/20 ">
                        {activeMaterial && (
                            <div className="w-full h-full relative overflow-hidden">
                                <img
                                    src={activeMaterial.image}
                                    alt={activeMaterial.name}
                                    key={activeMaterial.name}
                                    className="w-full h-full object-cover animate-fade-in-up"
                                />
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* --- FINAL CALL TO ACTION (THE DOSSIER) --- */}
            {/* --- FINAL CALL TO ACTION (THE DOSSIER) --- */}
            <section className="py-32 px-6 relative">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center">

                    {/* Editorial Line Connector */}
                    <div className="h-24 w-[1px] bg-matteo-charcoal/20 dark:bg-white/20 mb-12"></div>

                    <RevealOnScroll>
                        <div className="text-center">
                            <h2 className="font-serif text-5xl md:text-8xl mb-8 leading-none tracking-tight">
                                Your Turn</h2>
                            <p className="font-serif text-xl md:text-2xl text-matteo-charcoal/60 dark:text-white/60 max-w-lg mx-auto mb-16 leading-relaxed">
                                True bespoke is a dialogue. <br />
                                Begin the conversation by requesting a private consultation.
                            </p>

                            <Magnetic strength={0.2}>
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-16 py-8 transition-all duration-300 hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white"
                                >
                                    <span className="font-sans text-xs uppercase tracking-[0.3em] z-10 relative group-hover:tracking-[0.4em] transition-all duration-500">
                                        Request Consultation
                                    </span>
                                </button>
                            </Magnetic>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>


            {/* --- THE "INTERVIEW" MODAL --- */}
            {createPortal(
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-black/80 dark:bg-white/10  flex flex-col"
                    >
                        {/* Noise Overlay */}
                        {/* grain removed */}

                        {/* Top Bar */}
                        <div className="flex justify-between items-center p-8 md:p-12 z-20">
                            <Logo dark={false} className="w-10 h-10 opacity-50" />
                            <button
                                onClick={() => { setIsFormOpen(false); setStep(0); setIsSubmitted(false); }}
                                className="font-sans text-[9px] uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
                            >
                                <span className="group-hover:mr-2 transition-all">End Session</span>
                                <span className="text-xl">×</span>
                            </button>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col justify-center items-center relative px-6 md:px-24">
                            <div className="w-full max-w-4xl relative min-h-[40vh] flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    {/* STEP 0: INTRO */}
                                    {step === 0 && (
                                        <motion.div
                                            key="step-0"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="text-center"
                                        >
                                            <h2 className="font-serif text-4xl md:text-6xl text-white mb-8">The Private Dossier</h2>
                                            <p className="font-serif text-xl text-white/60 max-w-lg mx-auto mb-12 leading-relaxed">
                                                To serve you best, we must know you. <br />
                                                This secure channel connects directly to our atelier in Italy.
                                            </p>
                                            <button onClick={() => setStep(1)} className="text-matteo-orange hover:text-white transition-colors font-sans text-xs uppercase tracking-widest border-b border-matteo-orange pb-2">
                                                Begin Interview &rarr;
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* STEP 1: NAME */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step-1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="text-center md:text-left"
                                        >
                                            <label className="font-mono text-xs text-matteo-orange uppercase tracking-widest mb-6 block">01 / The Patron</label>
                                            <h3 className="font-serif text-3xl md:text-5xl text-white mb-8">How shall we address you?</h3>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && name && setStep(2)}
                                                placeholder="Your Full Name"
                                                className="w-full bg-transparent border-b border-white/20 py-4 font-serif text-3xl md:text-5xl text-white placeholder-white/20 focus:outline-none focus:border-matteo-orange transition-colors"
                                            />
                                            <div className="mt-12 flex justify-between items-center">
                                                <button onClick={() => setStep(0)} className="text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors">Back</button>
                                                <button disabled={!name} onClick={() => setStep(2)} className="bg-white text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-matteo-orange hover:text-white transition-colors disabled:opacity-0 disabled:translate-y-4 transform duration-500">
                                                    Next Step
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: VISION */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step-2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="text-center md:text-left"
                                        >
                                            <label className="font-mono text-xs text-matteo-orange uppercase tracking-widest mb-6 block">02 / The Commission</label>
                                            <h3 className="font-serif text-3xl md:text-5xl text-white mb-8">What are you envisioning?</h3>
                                            <textarea
                                                autoFocus
                                                value={vision}
                                                onChange={(e) => setVision(e.target.value)}
                                                onKeyDown={(e) => e.ctrlKey && e.key === 'Enter' && vision && setStep(3)}
                                                placeholder="A winter coat for Aspen... A suit for a wedding in Tuscany..."
                                                className="w-full bg-transparent border-b border-white/20 py-4 font-serif text-2xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-matteo-orange transition-colors min-h-[150px] resize-none leading-relaxed"
                                            />
                                            <div className="mt-12 flex justify-between items-center">
                                                <button onClick={() => setStep(1)} className="text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors">Back</button>
                                                <button disabled={!vision} onClick={() => setStep(3)} className="bg-white text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-matteo-orange hover:text-white transition-colors disabled:opacity-0 disabled:translate-y-4 transform duration-500">
                                                    Next Step
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: CONTACT DETAILS */}
                                    {step === 3 && (
                                        <motion.div
                                            key="step-3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="text-center md:text-left"
                                        >
                                            <label className="font-mono text-xs text-matteo-orange uppercase tracking-widest mb-6 block">03 / The Connection</label>
                                            <h3 className="font-serif text-3xl md:text-5xl text-white mb-12">Where can we reach you?</h3>

                                            <div className="space-y-12">
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Email Address"
                                                    className="w-full bg-transparent border-b border-white/20 py-2 font-serif text-2xl md:text-3xl text-white placeholder-white/20 focus:outline-none focus:border-matteo-orange transition-colors"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        placeholder="City, Country"
                                                        className="w-full bg-transparent border-b border-white/20 py-2 font-serif text-2xl md:text-3xl text-white placeholder-white/20 focus:outline-none focus:border-matteo-orange transition-colors"
                                                    />
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="Phone (Optional)"
                                                        className="w-full bg-transparent border-b border-white/20 py-2 font-serif text-2xl md:text-3xl text-white placeholder-white/20 focus:outline-none focus:border-matteo-orange transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-16 flex justify-between items-center">
                                                <button onClick={() => setStep(2)} className="text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors">Back</button>
                                                <button
                                                    disabled={!email}
                                                    onClick={(e) => {
                                                        handleSubmit(e);
                                                        setStep(4);
                                                    }}
                                                    className="bg-matteo-orange text-white px-10 py-4 text-xs uppercase tracking-widest hover:bg-white hover:text-matteo-orange transition-colors disabled:opacity-0 disabled:translate-y-4 transform duration-500 shadow-2xl"
                                                >
                                                    Transmit Dossier
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 4: SUCCESS */}
                                    {step === 4 && (
                                        <motion.div
                                            key="step-4"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center"
                                        >
                                            <div className="w-24 h-24 border border-matteo-orange rounded-full flex items-center justify-center mx-auto mb-12 text-matteo-orange animate-pulse">
                                                <span className="font-serif text-4xl italic">M</span>
                                            </div>
                                            <h2 className="font-serif text-5xl md:text-7xl text-white mb-8">Received</h2>
                                            <p className="font-serif text-xl md:text-2xl text-white/70 leading-relaxed max-w-lg mx-auto mb-16">
                                                Thank you, {name}. <br />
                                                We have secured your request {refNo}. <br />
                                                Expect a personal correspondence shortly.
                                            </p>
                                            <button
                                                onClick={() => setIsFormOpen(false)}
                                                className="text-white/50 hover:text-white font-sans text-xs uppercase tracking-widest transition-colors"
                                            >
                                                Close Line
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {step > 0 && step < 4 && (
                            <div className="w-full bg-white/5 h-1 absolute bottom-0 left-0">
                                <motion.div
                                    className="bg-matteo-orange h-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
            )}

        </div>
    );
};
